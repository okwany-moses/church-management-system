import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { HYMNS, Hymn } from "./src/data/hymns"; // Import HYMNS and Hymn interface
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { PgDatabase } from "./db";
import { sendSmsNotification } from "./smsService";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000; // Default to 3000 if not specified
  const isDev = process.env.NODE_ENV === "development";
  const csv = require("csv-parser"); // Use require to bypass type declaration issues
  const upload = require('multer')(); // For handling file uploads (CSV)

  app.use(express.json());

  // Ensure the public/images directory exists and serve it statically
  const imagesPath = isDev
    ? path.join(__dirname, "public", "images")
    : path.join(__dirname, "images");
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }
  app.use("/images", express.static(imagesPath));

  app.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  console.log("Initializing Church Management PostgreSQL DB...");
  // DATABASE_URL points at a managed PostgreSQL instance (e.g. a free Render
  // PostgreSQL add-on). Data lives in the database server, so it survives
  // restarts and redeploys without any persistent disk.
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Point it at a PostgreSQL instance (e.g. the Render PostgreSQL Internal Database URL)."
    );
  }
  const db = new PgDatabase(connectionString);

  // Create tables. Tables are declared in dependency order because PostgreSQL
  // requires a referenced table to exist before a FOREIGN KEY can target it.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      pastor TEXT NOT NULL,
      date_opened TEXT NOT NULL,
      contact_phone TEXT,
      member_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cell_groups (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      meeting_day TEXT NOT NULL,
      meeting_time TEXT NOT NULL,
      location_details TEXT NOT NULL,
      members_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      join_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      gender TEXT,
      family_role TEXT NOT NULL DEFAULT 'Single',
      birth_date TEXT,
      notes TEXT,
      title TEXT,
      registration_number TEXT,
      branch_id INTEGER,
      cell_group_id INTEGER,
      FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      FOREIGN KEY(cell_group_id) REFERENCES cell_groups(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'congregant',
      member_id INTEGER,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ministries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      leader_id INTEGER,
      FOREIGN KEY(leader_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS member_ministries (
      member_id INTEGER,
      ministry_id INTEGER,
      PRIMARY KEY (member_id, ministry_id),
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
      FOREIGN KEY(ministry_id) REFERENCES ministries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      session_id INTEGER,
      member_id INTEGER,
      status TEXT NOT NULL DEFAULT 'Present',
      PRIMARY KEY (session_id, member_id),
      FOREIGN KEY(session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id SERIAL PRIMARY KEY,
      member_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      notes TEXT,
      branch_id INTEGER,
      cell_group_id INTEGER,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL,
      FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      FOREIGN KEY(cell_group_id) REFERENCES cell_groups(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      location TEXT,
      ministry_id INTEGER,
      FOREIGN KEY(ministry_id) REFERENCES ministries(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenditures (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      branch_id INTEGER,
      FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sms_logs (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      recipients_count INTEGER NOT NULL,
      recipients_names TEXT,
      date_sent TEXT NOT NULL,
      group_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS video_call_logs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      duration_minutes INTEGER,
      host_name TEXT,
      date_created TEXT NOT NULL,
      meeting_code TEXT NOT NULL,
      participants_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sermons (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      speaker TEXT NOT NULL,
      date TEXT NOT NULL,
      scripture TEXT,
      content TEXT,
      audio_url TEXT,
      video_url TEXT
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
      id SERIAL PRIMARY KEY,
      requester_name TEXT NOT NULL,
      phone TEXT,
      request_text TEXT NOT NULL,
      is_private INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Pending',
      date_submitted TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hymns (
      id SERIAL PRIMARY KEY,
      number INTEGER NOT NULL,
      category TEXT NOT NULL,
      hymn_key TEXT NOT NULL,
      author TEXT,
      scripture TEXT,
      description TEXT,
      pdf_url TEXT,
      pdf_page INTEGER,
      languages_json TEXT NOT NULL,
      melody_notes_json TEXT
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Idempotent migrations for databases created before these columns existed.
  await db.exec(`
    ALTER TABLE members ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS registration_number TEXT;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS branch_id INTEGER;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS cell_group_id INTEGER;
    ALTER TABLE contributions ADD COLUMN IF NOT EXISTS branch_id INTEGER;
    ALTER TABLE contributions ADD COLUMN IF NOT EXISTS cell_group_id INTEGER;
    ALTER TABLE hymns ADD COLUMN IF NOT EXISTS melody_notes_json TEXT;
  `);

  // Seed sample data only once, ever. A persistent marker in app_meta guarantees
  // that after the first run we never wipe/re-seed again - so admin entries are
  // permanent and are only ever removed by an explicit delete action.
  const seededMarker = await db.get("SELECT value FROM app_meta WHERE key = 'seeded'");
  const memberCount = await db.get("SELECT COUNT(*) as count FROM members");
  if (!seededMarker && memberCount.count === 0) {
    console.log("Seeding database with realistic church data...");

    // Reset database state for reliable seeding. TRUNCATE ... RESTART IDENTITY
    // both clears the rows and resets the SERIAL sequences back to 1, so the
    // hardcoded cross-references in the seed data below (branch_id = 1,
    // member ids 1-8, ministry ids 1-3, session ids 1-2, ...) stay valid even
    // if a previous seed attempt was interrupted partway through. CASCADE pulls
    // in dependent tables (e.g. users). hymns is intentionally excluded so its
    // separately-seeded data and sequence are preserved.
    await db.exec(`
      TRUNCATE members, ministries, member_ministries, attendance_sessions,
        attendance_records, contributions, events, branches, cell_groups,
        expenditures, sms_logs, video_call_logs, sermons, prayer_requests
      RESTART IDENTITY CASCADE;
    `);

    // 1. Branches
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Ramba-Kabondo Headquarters", "Ramba, Kabondo, Homa Bay County, Kenya", "Apostle Newton Atela", "2010-01-10", "+254 712 345678", 350]
    );
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Nairobi Branch", "Umoja, Nairobi, Kenya", "Rev. Joseph Omwamba", "2015-08-15", "+254 722 987654", 120]
    );
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Mombasa Outreach", "Mtwapa, Mombasa, Kenya", "Evangelist Mary Atieno", "2019-11-20", "+254 733 111222", 75]
    );

    // 2. Cell Groups (HQ Ramba-Kabondo)
    await db.run(`INSERT INTO cell_groups (name, leader_name, meeting_day, meeting_time, location_details, members_count) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Ramba Faith Prayer Cell", "Elder John Ochieng", "Wednesday", "17:30", "Ramba Village Crossroads", 25]
    );
    await db.run(`INSERT INTO cell_groups (name, leader_name, meeting_day, meeting_time, location_details, members_count) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Kabondo Youth Bible Circle", "Brother James Smith", "Thursday", "18:00", "Kabondo Market Square Hall", 18]
    );
    await db.run(`INSERT INTO cell_groups (name, leader_name, meeting_day, meeting_time, location_details, members_count) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Ramba Grace Fellowship", "Sister Sarah Doe", "Tuesday", "17:00", "Ramba Community Assembly Point", 30]
    );
    await db.run(`INSERT INTO cell_groups (name, leader_name, meeting_day, meeting_time, location_details, members_count) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Kabondo Family Outreach", "Deacon Robert Davis", "Saturday", "16:30", "Robert's Residence, Kabondo", 22]
    );

    // 3. Members
    const membersList = [
      ["Newton", "Atela", "apostle.atela@graceflow.org", "555-0100", "2021-01-15", "Active", "Male", "Head", "1978-04-12", "Senior Apostle and founder.", "Apostle", 1, 1],
      ["Sarah", "Doe", "sarah.doe@gmail.com", "555-0101", "2021-01-15", "Active", "Female", "Spouse", "1981-08-22", "Sunday School coordinator.", "Pastor", 1, 3],
      ["James", "Smith", "james.smith@hotmail.com", "555-0122", "2022-03-10", "Active", "Male", "Single", "1995-11-05", "Youth coordinator and band player.", "Youth Leader", 1, 2],
      ["Mary", "Johnson", "mary.j@outlook.com", "555-0133", "2021-06-20", "Active", "Female", "Head", "1969-02-17", "Ushering ministry chairperson.", "Deaconess", 1, 1],
      ["Robert", "Davis", "robert.davis@yahoo.com", "555-0144", "2023-01-05", "Active", "Male", "Head", "1985-07-30", "Deacon and finance helper.", "Deacon", 1, 4],
      ["Linda", "Wilson", "linda.w@gmail.com", "555-0155", "2022-09-01", "Active", "Female", "Spouse", "1988-10-14", "Worship Choir lead singer.", "Choral Director", 1, 3],
      ["Emily", "Davis", "emily.davis@gmail.com", "555-0146", "2023-01-05", "Active", "Female", "Child", "2013-05-12", "Daughter of Robert Davis.", "Member", 1, 2],
      ["Michael", "Miller", "michael.m@yahoo.com", "555-0199", "2026-05-15", "Visitor", "Male", "Single", "1992-03-24", "Visited during the youth concert event.", "Visitor", 1, null],
    ];

    for (const m of membersList) {
      await db.run(
        `INSERT INTO members (first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, title, branch_id, cell_group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        m
      );
    }

    // Retrieve inserted member IDs (they will match 1 - 8)
    // 2. Ministries
    await db.run("INSERT INTO ministries (name, description, leader_id) VALUES (?, ?, ?)", ["Worship Choir", "Leads the weekly divine praise and spiritual music", 6]);
    await db.run("INSERT INTO ministries (name, description, leader_id) VALUES (?, ?, ?)", ["Youth Fellowship", "Equipping and empowering the young generation for spiritual growth", 3]);
    await db.run("INSERT INTO ministries (name, description, leader_id) VALUES (?, ?, ?)", ["Ushering & Welcoming", "Providing a warm welcome and assistance to congregants", 4]);

    // 3. Member Ministries Map
    // Linda Wilson (6), Sarah Doe (2), Robert Davis (5) in Choir (1)
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [6, 1]);
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [2, 1]);
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [5, 1]);
    
    // James Smith (3), Emily Davis (7), Michael Miller (8) in Youth (2)
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [3, 2]);
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [7, 2]);
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [8, 2]);

    // Mary Johnson (4), John Doe (1) in Ushering (3)
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [4, 3]);
    await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [1, 3]);

    // 4. Attendance Sessions
    // Sunday Service May 24, 2026
    await db.run("INSERT INTO attendance_sessions (title, date, notes) VALUES (?, ?, ?)", ["Sunday Morning Divine Service", "2026-05-24", "Sermon topic: Faith in Difficult Seasons. Attendance was solid."]);
    // Youth Friday Fellowship May 22, 2026
    await db.run("INSERT INTO attendance_sessions (title, date, notes) VALUES (?, ?, ?)", ["Youth Encounter Night", "2026-05-22", "Friday night worship and icebreakers."]);

    // 5. Attendance Records
    // Sunday Service May 24 (Session 1): members 1-7 Present, member 8 Present as visitor
    for (let i = 1; i <= 8; i++) {
      await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [1, i, "Present"]);
    }
    // Youth Fellowship (Session 2): members 3, 7, 8 Present. members 1, 2, 4, 5, 6 Absent
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 1, "Absent"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 2, "Absent"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 3, "Present"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 4, "Absent"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 5, "Absent"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 6, "Absent"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 7, "Present"]);
    await db.run("INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)", [2, 8, "Present"]);

    // 6. Contributions
    const contributionsList = [
      [1, 500.00, "Tithe", "2026-05-03", "Bank Transfer", "Monthly offering tithe."],
      [5, 350.00, "Tithe", "2026-05-15", "Card", "Tithe payment."],
      [4, 50.00, "Offering", "2026-05-24", "Cash", "Sunday loose offering."],
      [null, 120.00, "Offering", "2026-05-24", "Cash", "Anonymous cash in offering box."],
      [6, 200.00, "Building Fund", "2026-05-10", "Check", "Yearly roof repair support."],
      [3, 180.00, "Tithe", "2026-05-20", "Online", "Monthly tithe."],
      [2, 100.00, "Mission Support", "2026-05-22", "Online", "Support for neighborhood soup kitchen."],
      [1, 150.00, "Annual Registration", "2026-01-10", "Card", "HQ annual registration dues."],
      [2, 150.00, "Annual Registration", "2026-01-12", "Card", "HQ annual registration dues."],
      [3, 150.00, "Annual Registration", "2026-01-15", "Online", "HQ annual registration dues."],
      [4, 80.00, "Monthly Contribution", "2026-05-01", "Cash", "Regular monthly contribution."],
      [5, 80.00, "Monthly Contribution", "2026-05-02", "Online", "Monthly envelope support."],
    ];

    for (const c of contributionsList) {
      const result = await db.run(
        `INSERT INTO contributions (member_id, amount, type, date, payment_method, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        c
      );

      // Seed logic to assign/update Registration Number if payment is for Annual Registration
      const member_id = c[0] as number | null;
      const type = c[2] as string;
      const date = c[3] as string;

      if (type === "Annual Registration" && member_id) {
        const payDate = new Date(date);
        const year = isNaN(payDate.getTime()) ? new Date().getFullYear() : payDate.getFullYear();
        const prefix = `GIMK/REG/${year}/`;
        
        // For seeding, we force generation/update to ensure 001 format
        const lastReg = await db.get("SELECT registration_number FROM members WHERE registration_number LIKE ? ORDER BY length(registration_number) DESC, registration_number DESC LIMIT 1", [`${prefix}%`]);
        let nextSeq = 1;
        if (lastReg && lastReg.registration_number) {
          const parts = lastReg.registration_number.split('/');
          const lastNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastNum)) nextSeq = lastNum + 1;
        }
        const regNo = `${prefix}${String(nextSeq).padStart(3, '0')}`;
        await db.run("UPDATE members SET registration_number = ? WHERE id = ?", [regNo, member_id]);
      }
    }

    // 7. Events
    await db.run(
      `INSERT INTO events (title, description, date, start_time, end_time, location, ministry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Sunday Worship Service", "Weekly gathering with sermons and corporate worship.", "2026-05-31", "09:00", "11:30", "Main Sanctuary", null]
    );
    await db.run(
      `INSERT INTO events (title, description, date, start_time, end_time, location, ministry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Worship Choir Rehearsal", "Weekly vocal warmup and chord practices for Choir.", "2026-05-30", "15:00", "17:30", "Choir Room", 1]
    );
    await db.run(
      `INSERT INTO events (title, description, date, start_time, end_time, location, ministry_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Youth Outdoor Picnic", "Barbecue, Frisbee and fireside testimonies.", "2026-06-06", "11:00", "16:00", "Riverside Grace Park", 2]
    );

    // 10. Expenditures
    await db.run(`INSERT INTO expenditures (title, description, amount, category, date, branch_id) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Sanctuary Sound Upgrade", "Purchased dynamic microphones, wireless receivers and sound cabling", 450.00, "Utilities & Audio", "2026-05-10", 1]
    );
    await db.run(`INSERT INTO expenditures (title, description, amount, category, date, branch_id) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Ramba Charity Alms Drive", "Purchased relief maize and grains for Ramba elders food relief", 300.00, "Missions & Charity", "2026-05-18", 1]
    );
    await db.run(`INSERT INTO expenditures (title, description, amount, category, date, branch_id) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Nairobi sanctuary rental", "Subsidy payment for Nairobi branch monthly structure lease", 500.00, "Rent & Logistics", "2026-05-25", 2]
    );
    await db.run(`INSERT INTO expenditures (title, description, amount, category, date, branch_id) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Electricity & Utilities", "May headquarters electricity utility adjustment payment", 85.00, "Utilities & Audio", "2026-05-20", 1]
    );

    // 11. SMS Logs
    await db.run(`INSERT INTO sms_logs (message, recipients_count, recipients_names, date_sent, group_type) VALUES (?, ?, ?, ?, ?)`,
      ["Greetings Saint! Join Ramba HQ for midweek prayer cells this Wed 5:30 PM. Your presence is highly valued", 120, "All Ramba HQ Members", "2026-05-27", "Branch"]
    );
    await db.run(`INSERT INTO sms_logs (message, recipients_count, recipients_names, date_sent, group_type) VALUES (?, ?, ?, ?, ?)`,
      ["Dear choir members, our main vocal preparation session is Saturday 3 PM. Clean uniforms required for the Bishop's visit.", 3, "Linda Wilson, Sarah Doe, Robert Davis", "2026-05-29", "Ministry"]
    );

    // 12. Video Calls Logs
    await db.run(`INSERT INTO video_call_logs (title, duration_minutes, host_name, date_created, meeting_code, participants_count) VALUES (?, ?, ?, ?, ?, ?)`,
      ["National Ministers Planning Gathering", 45, "Apostle Newton Atela", "2026-05-28", "GID-LEAD-RAMBA", 12]
    );

    // 13. Sermons Seeding & Church Messages
    await db.run(`INSERT INTO sermons (title, speaker, date, scripture, content, audio_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "The Power of Faith in Stormy Seasons",
        "Apostle Newton Atela",
        "2026-05-24",
        "Hebrews 11:1-6",
        "This message urges congregants at Ramba HQ to remain steadfast in the Lord in all trials. Faith, the Apostle taught, is not the absence of storms, but the presence of Christ in our boat as we journey together.",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        ""
      ]
    );
    await db.run(`INSERT INTO sermons (title, speaker, date, scripture, content, audio_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "The Blessing of Obedient Giving",
        "Apostle Newton Atela",
        "2026-05-17",
        "Malachi 3:10-12",
        "In this sermon, Rev. Omwamba explained the spiritual dimensions of tithing and stewardship, illustrating how Gideons branches thrive when we stand united in financial support of HQ directives.",
        "",
        ""
      ]
    );
    await db.run(`INSERT INTO sermons (title, speaker, date, scripture, content, audio_url, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "Walking as Children of Light",
        "Evangelist Mary Atieno",
        "2026-05-10",
        "Ephesians 5:8-14",
        "Delivered during the Mombasa youth outreach, Evangelist Atieno challenged young believers to shine their light e soko (in the marketplace), leaving behind any dark or hidden compromises.",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://www.w3schools.com/html/mov_bbb.mp4"
      ]
    );

    await db.run(
      `INSERT INTO prayer_requests (requester_name, phone, request_text, is_private, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Elder Jared Okowa", "555-0322", "Please intercede for complete restoration of health for Mama Tabitha in Nairobi Hospital.", 0, "Pending", "2026-05-24"]
    );
    await db.run(
      `INSERT INTO prayer_requests (requester_name, phone, request_text, is_private, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Anonymous", null, "Urgent prayers for my daughter sitting her national exams this week. Strength and clarity of mind.", 1, "Pending", "2026-05-28"]
    );
    await db.run(
      `INSERT INTO prayer_requests (requester_name, phone, request_text, is_private, status, date_submitted) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Sister Susan Auma", "555-0455", "We are thanking God for safe delivery of a healthy baby boy! Thank you for the pastoral prayers.", 0, "Prayed For", "2026-05-30"]
    );

    console.log("Database seeded successfully!");
  }

  // Record that initial seeding has been handled so it never runs again, even if
  // every member is later deleted (which previously triggered a full reset).
  if (!seededMarker) {
    await db.run(
      "INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["seeded", new Date().toISOString()]
    );
  }

  // Seed Hymns Library if empty (Independent of member count)
  const hymnCount = await db.get("SELECT COUNT(*) as count FROM hymns");
  if (hymnCount.count === 0) {
    console.log("Initializing digital hymns library from source data...");
    for (const h of HYMNS) {
      await db.run(
        `INSERT INTO hymns (number, category, hymn_key, author, scripture, description, languages_json, melody_notes_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [h.number, h.category, h.key, h.author, h.scripture, h.description, JSON.stringify(h.languages), JSON.stringify(h.melodyNotes || [])]
      );
    }
    console.log("Hymns library seeded successfully.");
  }

  // RECONCILE REGISTRATION NUMBERS (Ensures 001, 002, 003 sequence for existing data)
  const reconcileRegistrations = async () => {
    // Wipe existing registration numbers to allow for a clean, fresh sequence rebuild
    await db.run("UPDATE members SET registration_number = NULL");

    const payments = await db.all(`
      SELECT c.member_id, c.date, m.registration_number
      FROM contributions c
      JOIN members m ON c.member_id = m.id
      WHERE c.type = 'Annual Registration' AND c.member_id IS NOT NULL
      ORDER BY c.date ASC, c.id ASC
    `);

    if (payments.length > 0) {
      console.log(`[System] Reconciling ${payments.length} registration records...`);
      const sequences: Record<number, number> = {};
      for (const p of payments) {
        const payDate = new Date(p.date);
        const year = isNaN(payDate.getTime()) ? new Date().getFullYear() : payDate.getFullYear();
        
        if (!sequences[year]) sequences[year] = 1;
        
        const prefix = `GIMK/REG/${year}/`;
        const regNo = `${prefix}${String(sequences[year]).padStart(3, '0')}`;
        
        await db.run("UPDATE members SET registration_number = ? WHERE id = ?", [regNo, p.member_id]);
        sequences[year]++;
      }
    }
  };
  await reconcileRegistrations();

  // ----------------------------------------------------
  // API Endpoints
  // ----------------------------------------------------

  // DASHBOARD STATS (Protected)
  app.get("/api/stats", async (req, res) => {
    try {
      // 1. Total active members
      const activeMembers = await db.get("SELECT COUNT(*) as count FROM members WHERE status = 'Active'");
      const totalMembers = await db.get("SELECT COUNT(*) as count FROM members");

      // 2. Financials
      const thisMonthFunds = await db.get(
        `SELECT SUM(amount) as total FROM contributions 
         WHERE LEFT(date, 7) = LEFT('2026-05-29', 7)`
      );
      const totalFunds = await db.get("SELECT SUM(amount) as total FROM contributions");

      // 3. Upcoming Event Count
      const upcomingEvents = await db.get(
        "SELECT COUNT(*) as count FROM events WHERE date >= '2026-05-29'"
      );

      // 4. Contribution types breakdown
      const typesBreakdown = await db.all(
        "SELECT type as name, SUM(amount) as value FROM contributions GROUP BY type"
      );

      // 5. Attendance statistics (Session records and overall averages)
      const sessions = await db.all(`
        SELECT s.id, s.title, s.date, 
          SUM(case when r.status = 'Present' then 1 else 0 end) as present,
          COUNT(r.member_id) as total
        FROM attendance_sessions s
        LEFT JOIN attendance_records r ON s.id = r.session_id
        GROUP BY s.id
        ORDER BY s.date ASC
      `);

      // 6. Recent activities tracker (recent members and contributions)
      const recentMembers = await db.all(
        "SELECT first_name, last_name, join_date, status FROM members ORDER BY id DESC LIMIT 4"
      );
      const recentDonations = await db.all(`
        SELECT c.amount, c.type, c.date, m.first_name, m.last_name 
        FROM contributions c 
        LEFT JOIN members m ON c.member_id = m.id 
        ORDER BY c.id DESC LIMIT 4
      `);

      res.json({
        activeMembers: activeMembers.count,
        totalMembers: totalMembers.count,
        thisMonthContributions: thisMonthFunds.total || 0,
        totalContributions: totalFunds.total || 0,
        upcomingEventsCount: upcomingEvents.count,
        typesBreakdown,
        attendanceTrend: sessions.map(s => ({
          date: s.date,
          title: s.title,
          percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
          present: s.present,
          total: s.total,
        })),
        recentMembers,
        recentDonations,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to load dashboard stats: " + err.message });
    }
  });

  // MEMBERS ENDPOINTS
  app.get("/api/members", async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT m.*, 
               string_agg(min.name, ', ') as ministries_list,
               b.name as branch_name,
               cg.name as cell_group_name
        FROM members m
        LEFT JOIN member_ministries mm ON m.id = mm.member_id
        LEFT JOIN ministries min ON mm.ministry_id = min.id
        LEFT JOIN branches b ON m.branch_id = b.id
        LEFT JOIN cell_groups cg ON m.cell_group_id = cg.id
        GROUP BY m.id, b.name, cg.name
        ORDER BY m.first_name ASC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // BULK DELETE MEMBERS
  app.delete("/api/members/bulk-delete", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No member IDs provided for bulk deletion." });
    }
    try {
      const placeholders = ids.map(() => "?").join(",");
      console.log(`[Bulk Delete Members] Executing SQL: DELETE FROM members WHERE id IN (${placeholders})`);
      console.log(`[Bulk Delete Members] With parameters:`, ids);
      const result = await db.run(`DELETE FROM members WHERE id IN (${placeholders})`, ids);
      if (result.changes === 0) {
        console.warn(`[Bulk Delete Members] No records found matching IDs: ${ids}`);
        return res.status(404).json({ error: "No members found with the provided IDs." });
      }
      res.json({ message: `${result.changes} members and associated relations deleted successfully.` });
    } catch (err: any) {
      console.error("[Bulk Delete Members] Critical Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await db.get(`
        SELECT m.*, b.name as branch_name, cg.name as cell_group_name
        FROM members m
        LEFT JOIN branches b ON m.branch_id = b.id
        LEFT JOIN cell_groups cg ON m.cell_group_id = cg.id
        WHERE m.id = ?`, [req.params.id]);
      if (!member) return res.status(404).json({ error: "Member not found" });

      const memberMinistries = await db.all(`
        SELECT min.* 
        FROM ministries min
        JOIN member_ministries mm ON min.id = mm.ministry_id
        WHERE mm.member_id = ?
      `, [req.params.id]);

      const history = await db.all(`
        SELECT c.amount, c.type, c.date 
        FROM contributions c
        WHERE c.member_id = ?
        ORDER BY c.date DESC
      `, [req.params.id]);

      res.json({ ...member, ministries: memberMinistries, contributions: history });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/members", async (req, res) => {
    const { first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, ministry_ids, title, branch_id, cell_group_id } = req.body;
    if (!first_name || !last_name || !join_date) {
      return res.status(400).json({ error: "First name, Last name and Join date are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO members (first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, title, branch_id, cell_group_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [first_name, last_name, email || null, phone || null, join_date, status || "Active", gender || null, family_role || "Single", birth_date || null, notes || null, title || null, branch_id || null, cell_group_id || null]);

      const newId = result.lastID;

      // Handle ministries mapping if specified
      if (Array.isArray(ministry_ids) && ministry_ids.length > 0) {
        for (const mId of ministry_ids) {
          await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [newId, mId]);
        }
      }

      res.status(201).json({ id: newId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    const { first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, ministry_ids, title, branch_id, cell_group_id } = req.body;
    const { id } = req.params;
    if (!first_name || !last_name || !join_date) {
      return res.status(400).json({ error: "First name, Last name and Join date are required." });
    }
    try {
      const exists = await db.get("SELECT id FROM members WHERE id = ?", [id]);
      if (!exists) return res.status(404).json({ error: "Member not found" });

      await db.run(`
        UPDATE members 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, join_date = ?, status = ?, gender = ?, family_role = ?, birth_date = ?, notes = ?, title = ?, branch_id = ?, cell_group_id = ?
        WHERE id = ?
      `, [first_name, last_name, email || null, phone || null, join_date, status, gender || null, family_role, birth_date || null, notes || null, title || null, branch_id || null, cell_group_id || null, id]);

      // Refresh ministry relations
      await db.run("DELETE FROM member_ministries WHERE member_id = ?", [id]);
      if (Array.isArray(ministry_ids)) {
        for (const mId of ministry_ids) {
          await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [id, mId]);
        }
      }

      res.json({ message: "Member updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const memberId = parseInt(req.params.id, 10);
      if (isNaN(memberId)) return res.status(400).json({ error: "Invalid ID" });
      const result = await db.run("DELETE FROM members WHERE id = ?", memberId);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json({ message: "Member and associated relations deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // IMPORT MEMBERS FROM CSV
  app.post("/api/members/import", upload.single('file'), async (req: any, res) => {
    if (!req.file && !(req as any).file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    const csvString = req.file.buffer.toString('utf8');
    const results: any[] = [];
    const errors: any[] = [];

    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvString);

    bufferStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', async () => {
        let importedCount = 0;
        for (const row of results) {
          try {
            // Basic validation and mapping
            const {
              'First Name': first_name,
              'Last Name': last_name,
              'Email': email,
              'Phone': phone,
              'Join Date': join_date,
              'Status': status,
              'Gender': gender,
              'Family Role': family_role,
              'Birth Date': birth_date,
              'Notes': notes,
              'Title': title,
              'Branch ID': branch_id_str,
              'Cell Group ID': cell_group_id_str,
              'Ministry IDs': ministry_ids_str
            } = row;

            if (!first_name || !last_name || !join_date) {
              errors.push({ row, error: "Missing required fields: First Name, Last Name, Join Date" });
              continue;
            }

            const result = await db.run(`
              INSERT INTO members (first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, title, branch_id, cell_group_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              first_name,
              last_name,
              email || null,
              phone || null,
              join_date,
              status || "Active",
              gender || null,
              family_role || "Single",
              birth_date || null,
              notes || null,
              title || null,
              branch_id_str ? parseInt(branch_id_str, 10) : null,
              cell_group_id_str ? parseInt(cell_group_id_str, 10) : null
            ]);

            const newId = result.lastID;

            // Handle ministries mapping if specified in CSV
            if (ministry_ids_str) {
              const ministry_ids = ministry_ids_str.split(',').map((id: string) => parseInt(id.trim(), 10)).filter(Number.isFinite);
              if (ministry_ids.length > 0) {
                for (const mId of ministry_ids) {
                  await db.run("INSERT INTO member_ministries (member_id, ministry_id) VALUES (?, ?)", [newId, mId]);
                }
              }
            }
            importedCount++;
          } catch (err: any) {
            console.error(`[Member Import] Error processing row:`, row, err);
            errors.push({ row, error: err.message });
          }
        }
        if (errors.length > 0) {
          return res.status(207).json({ message: `Import completed with ${importedCount} members imported and ${errors.length} errors.`, errors });
        }
        res.status(201).json({ message: `${importedCount} members imported successfully.` });
      })
      .on('error', (err: any) => {
        console.error("[Member Import] CSV Parser Error:", err);
        res.status(500).json({ error: "CSV parsing error: " + err.message });
      });
  });

  // MINISTRIES ENDPOINTS
  app.get("/api/ministries", async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT m.*, 
               l.first_name as leader_first, l.last_name as leader_last,
               (SELECT COUNT(*) FROM member_ministries WHERE ministry_id = m.id) as member_count
        FROM ministries m
        LEFT JOIN members l ON m.leader_id = l.id
        ORDER BY m.name ASC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ministries", async (req, res) => {
    const { name, description, leader_id } = req.body;
    if (!name) return res.status(400).json({ error: "Ministry name is required." });
    try {
      const result = await db.run(
        "INSERT INTO ministries (name, description, leader_id) VALUES (?, ?, ?)",
        [name, description || null, leader_id || null]
      );
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/ministries/:id", async (req, res) => {
    const { name, description, leader_id } = req.body;
    try {
      const result = await db.run(
        "UPDATE ministries SET name = ?, description = ?, leader_id = ? WHERE id = ?",
        [name, description || null, leader_id || null, req.params.id]
      );
      if (result.changes === 0) return res.status(404).json({ error: "Ministry not found" });
      res.json({ message: "Ministry updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/ministries/:id", async (req, res) => {
    const { id } = req.params;
    if (id === "bulk-delete") return; // Safety guard
    try {
      const ministryId = parseInt(id, 10);
      if (isNaN(ministryId)) return res.status(400).json({ error: "Invalid ministry ID." });

      const result = await db.run("DELETE FROM ministries WHERE id = ?", [ministryId]);
      if (result.changes === 0) return res.status(404).json({ error: "Ministry not found" });
      res.json({ message: "Ministry deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ATTENDANCE ENDPOINTS
  app.get("/api/attendance/sessions", async (req, res) => {
    try {
      const sessions = await db.all(`
        SELECT s.*, 
               (SELECT COUNT(*) FROM attendance_records WHERE session_id = s.id AND status = 'Present') as present_count,
               (SELECT COUNT(*) FROM attendance_records WHERE session_id = s.id) as total_count
        FROM attendance_sessions s
        ORDER BY s.date DESC
      `);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/attendance/sessions/:id", async (req, res) => {
    try {
      const session = await db.get("SELECT * FROM attendance_sessions WHERE id = ?", [req.params.id]);
      if (!session) return res.status(404).json({ error: "Attendance session not found" });

      const records = await db.all(`
        SELECT r.status, m.id as member_id, m.first_name, m.last_name, m.gender, m.status as member_status
        FROM members m
        LEFT JOIN attendance_records r ON m.id = r.member_id AND r.session_id = ?
        ORDER BY m.first_name ASC
      `, [req.params.id]);

      res.json({ session, records: records.map(r => ({ ...r, status: r.status || "Absent" })) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/attendance/sessions", async (req, res) => {
    const { title, date, notes, records } = req.body; // records: {[memberId]: 'Present' | 'Absent' | 'Excused'}
    if (!title || !date) return res.status(400).json({ error: "Title and date are required." });
    try {
      const result = await db.run(
        "INSERT INTO attendance_sessions (title, date, notes) VALUES (?, ?, ?)",
        [title, date, notes || null]
      );
      const sessionId = result.lastID;

      if (records && typeof records === "object") {
        for (const [mId, status] of Object.entries(records)) {
          await db.run(
            "INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)",
            [sessionId, parseInt(mId, 10), status]
          );
        }
      }

      res.status(201).json({ id: sessionId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/attendance/sessions/:id", async (req, res) => {
    const { title, date, notes, records } = req.body;
    const { id } = req.params;
    try {
      await db.run(
        "UPDATE attendance_sessions SET title = ?, date = ?, notes = ? WHERE id = ?",
        [title, date, notes || null, id]
      );

      // Clean old and save new
      await db.run("DELETE FROM attendance_records WHERE session_id = ?", [id]);
      if (records && typeof records === "object") {
        for (const [mId, status] of Object.entries(records)) {
          await db.run(
            "INSERT INTO attendance_records (session_id, member_id, status) VALUES (?, ?, ?)",
            [id, parseInt(mId, 10), status]
          );
        }
      }
      res.json({ message: "Attendance session and records updated." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/attendance/sessions/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM attendance_sessions WHERE id = ?", [req.params.id]);
      res.json({ message: "Attendance session deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // CONTRIBUTIONS ENDPOINTS
  app.get("/api/contributions", async (req, res) => {
    try {
      const rows = await db.all(`
        SELECT c.*,
               m.first_name, m.last_name, m.email, m.registration_number,
               b.name as branch_name, cg.name as cell_group_name
        FROM contributions c
        LEFT JOIN members m ON c.member_id = m.id
        LEFT JOIN branches b ON c.branch_id = b.id
        LEFT JOIN cell_groups cg ON c.cell_group_id = cg.id
        ORDER BY c.date DESC, c.id DESC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // BULK DELETE CONTRIBUTIONS
  app.delete("/api/contributions/bulk-delete", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No contribution IDs provided for bulk deletion." });
    }
    try {
      const placeholders = ids.map(() => "?").join(",");
      console.log(`[Bulk Delete Contributions] Executing SQL: DELETE FROM contributions WHERE id IN (${placeholders})`);
      console.log(`[Bulk Delete Contributions] With parameters:`, ids);
      const result = await db.run(`DELETE FROM contributions WHERE id IN (${placeholders})`, ids);
      if (result.changes === 0) {
        console.warn(`[Bulk Delete Contributions] No records found matching IDs: ${ids}`);
        return res.status(404).json({ error: "No contributions found with the provided IDs." });
      }
      res.json({ message: `${result.changes} contributions deleted successfully.` });
    } catch (err: any) {
      console.error("[Bulk Delete Contributions] Critical Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    const { member_id, amount, type, date, payment_method, notes, branch_id, cell_group_id } = req.body;
    if (!amount || !type || !date || !payment_method) {
      return res.status(400).json({ error: "Amount, type, date and payment method are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO contributions (member_id, amount, type, date, payment_method, notes, branch_id, cell_group_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [member_id || null, amount, type, date, payment_method, notes || null, branch_id || null, cell_group_id || null]);

      // Logic to assign/update Registration Number if payment is for Annual Registration
      if (type === "Annual Registration" && member_id) {
        const payDate = new Date(date);
        const year = isNaN(payDate.getTime()) ? new Date().getFullYear() : payDate.getFullYear();
        const prefix = `GIMK/REG/${year}/`;
        // Check if member already has a registration number for this specific year
        const existing = await db.get("SELECT registration_number FROM members WHERE id = ? AND registration_number LIKE ?", [member_id, `${prefix}%`]);
        if (!existing || !existing.registration_number) {
          const lastReg = await db.get("SELECT registration_number FROM members WHERE registration_number LIKE ? ORDER BY length(registration_number) DESC, registration_number DESC LIMIT 1", [`${prefix}%`]);
          let nextSeq = 1;
          if (lastReg && lastReg.registration_number) {
            const parts = lastReg.registration_number.split('/');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum)) nextSeq = lastNum + 1;
          }
          const regNo = `${prefix}${String(nextSeq).padStart(3, '0')}`;
          await db.run("UPDATE members SET registration_number = ? WHERE id = ?", [regNo, member_id]);
        }
      }

      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/contributions/:id", async (req, res) => {
    try {
      const contributionId = parseInt(req.params.id, 10);
      if (isNaN(contributionId)) return res.status(400).json({ error: "Invalid contribution ID." });

      const result = await db.run("DELETE FROM contributions WHERE id = ?", contributionId);
      if (result.changes === 0) return res.status(404).json({ error: "Contribution record not found" });
      res.json({ message: "Contribution record deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      console.error("[Delete Contribution] Error:", err);
    }
  });

  // IMPORT CONTRIBUTIONS FROM CSV
  app.post("/api/contributions/import", upload.single('file'), async (req: any, res) => {
    if (!req.file && !(req as any).file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    const csvString = req.file.buffer.toString('utf8');
    const results: any[] = [];
    const errors: any[] = [];

    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvString);

    bufferStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', async () => {
        let importedCount = 0;
        for (const row of results) {
          try {
            const {
              'Member ID': member_id,
              'Amount': amount,
              'Type': type,
              'Date': date,
              'Payment Method': payment_method,
              'Notes': notes,
              'Branch ID': branch_id,
              'Cell Group ID': cell_group_id
            } = row;

            if (!amount || !type || !date || !payment_method) {
              errors.push({ row, error: "Missing required fields: Amount, Type, Date, Payment Method" });
              continue;
            }

            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
              errors.push({ row, error: "Invalid amount" });
              continue;
            }

            const parsedMemberId = member_id ? parseInt(member_id, 10) : null;

            const result = await db.run(`
              INSERT INTO contributions (member_id, amount, type, date, payment_method, notes, branch_id, cell_group_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [parsedMemberId, parsedAmount, type, date, payment_method, notes || null, 
                branch_id ? parseInt(branch_id, 10) : null, 
                cell_group_id ? parseInt(cell_group_id, 10) : null]);

            // Logic to assign/update Registration Number if payment is for Annual Registration
            if (type === "Annual Registration" && parsedMemberId) {
              const payDate = new Date(date);
              const year = isNaN(payDate.getTime()) ? new Date().getFullYear() : payDate.getFullYear();
              const prefix = `GIMK/REG/${year}/`;
              // Check if member already has a registration number for this specific year
              const existing = await db.get("SELECT registration_number FROM members WHERE id = ? AND registration_number LIKE ?", [parsedMemberId, `${prefix}%`]);
              if (!existing || !existing.registration_number) {
                const lastReg = await db.get("SELECT registration_number FROM members WHERE registration_number LIKE ? ORDER BY length(registration_number) DESC, registration_number DESC LIMIT 1", [`${prefix}%`]);
                let nextSeq = 1;
                if (lastReg && lastReg.registration_number) {
                  const parts = lastReg.registration_number.split('/');
                  const lastNum = parseInt(parts[parts.length - 1], 10);
                  if (!isNaN(lastNum)) nextSeq = lastNum + 1;
                }
                const regNo = `${prefix}${String(nextSeq).padStart(3, '0')}`;
                await db.run("UPDATE members SET registration_number = ? WHERE id = ?", [regNo, parsedMemberId]);
              }
            }
            importedCount++;
          } catch (err: any) {
            console.error(`[Contribution Import] Error processing row:`, row, err);
            errors.push({ row, error: err.message });
          }
        }
        if (errors.length > 0) {
          return res.status(207).json({ message: `Import completed with ${importedCount} contributions imported and ${errors.length} errors.`, errors });
        }
        res.status(201).json({ message: `${importedCount} contributions imported successfully.` });
      })
      .on('error', (err: any) => {
        console.error("[Contribution Import] CSV Parser Error:", err);
        res.status(500).json({ error: "CSV parsing error: " + err.message });
      });
  });

  // EVENTS (CALENDAR) ENDPOINTS
  app.get("/api/events", async (req, res) => {
    try {
      const events = await db.all(`
        SELECT e.*, m.name as ministry_name
        FROM events e
        LEFT JOIN ministries m ON e.ministry_id = m.id
        ORDER BY e.date ASC, e.start_time ASC
      `);
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    const { title, description, date, start_time, end_time, location, ministry_id } = req.body;
    if (!title || !date || !start_time) {
      return res.status(400).json({ error: "Title, date, and start time are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO events (title, description, date, start_time, end_time, location, ministry_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, description || null, date, start_time, end_time || null, location || null, ministry_id || null]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    const { title, description, date, start_time, end_time, location, ministry_id } = req.body;
    try {
      const result = await db.run(`
        UPDATE events 
        SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ?, ministry_id = ?
        WHERE id = ?
      `, [title, description || null, date, start_time, end_time || null, location || null, ministry_id || null, req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Event not found" });
      res.json({ message: "Event updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM events WHERE id = ?", [req.params.id]);
      res.json({ message: "Event deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // GIDEONS INTERNATIONAL MINISTRIES KENYA CUSTOM ENDPOINTS
  // ----------------------------------------------------

  // BRANCHES ENDPOINTS
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await db.all("SELECT * FROM branches ORDER BY id ASC");
      res.json(branches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/branches", async (req, res) => {
    const { name, location, pastor, date_opened, contact_phone, member_count } = req.body;
    if (!name || !location || !pastor || !date_opened) {
      return res.status(400).json({ error: "Name, Location, Pastor and Date Opened are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, location, pastor, date_opened, contact_phone || null, member_count || 0]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/branches/:id", async (req, res) => {
    const { name, location, pastor, date_opened, contact_phone, member_count } = req.body;
    try {
      const result = await db.run(`
        UPDATE branches
        SET name = ?, location = ?, pastor = ?, date_opened = ?, contact_phone = ?, member_count = ?
        WHERE id = ?
      `, [name, location, pastor, date_opened, contact_phone || null, member_count || 0, req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Branch not found" });
      res.json({ message: "Branch updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/branches/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM branches WHERE id = ?", [req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Branch not found" });
      res.json({ message: "Branch deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // CELL GROUPS ENDPOINTS
  app.get("/api/cell_groups", async (req, res) => {
    try {
      const cell_groups = await db.all("SELECT * FROM cell_groups ORDER BY id ASC");
      res.json(cell_groups);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/cell_groups", async (req, res) => {
    const { name, leader_name, meeting_day, meeting_time, location_details, members_count } = req.body;
    if (!name || !leader_name || !meeting_day || !meeting_time || !location_details) {
      return res.status(400).json({ error: "Name, Leader Name, Meeting Day, Time and Location Details are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO cell_groups (name, leader_name, meeting_day, meeting_time, location_details, members_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, leader_name, meeting_day, meeting_time, location_details, members_count || 0]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/cell_groups/:id", async (req, res) => {
    const { name, leader_name, meeting_day, meeting_time, location_details, members_count } = req.body;
    try {
      const result = await db.run(`
        UPDATE cell_groups
        SET name = ?, leader_name = ?, meeting_day = ?, meeting_time = ?, location_details = ?, members_count = ?
        WHERE id = ?
      `, [name, leader_name, meeting_day, meeting_time, location_details, members_count || 0, req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Cell group not found" });
      res.json({ message: "Cell group updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/cell_groups/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM cell_groups WHERE id = ?", [req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Cell group not found" });
      res.json({ message: "Cell group deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // EXPENDITURES ENDPOINTS
  app.get("/api/expenditures", async (req, res) => {
    try {
      const expenditures = await db.all(`
        SELECT e.*, b.name as branch_name
        FROM expenditures e
        LEFT JOIN branches b ON e.branch_id = b.id
        ORDER BY e.date DESC, e.id DESC
      `);
      res.json(expenditures);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/expenditures", async (req, res) => {
    const { title, description, amount, category, date, branch_id } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ error: "Title, Amount, Category and Date are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO expenditures (title, description, amount, category, date, branch_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [title, description || null, amount, category, date, branch_id || null]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/expenditures/:id", async (req, res) => {
    const { title, description, amount, category, date, branch_id } = req.body;
    try {
      const result = await db.run(`
        UPDATE expenditures
        SET title = ?, description = ?, amount = ?, category = ?, date = ?, branch_id = ?
        WHERE id = ?
      `, [title, description || null, amount, category, date, branch_id || null, req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Expenditure not found" });
      res.json({ message: "Expenditure updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // BULK DELETE EXPENDITURES
  app.delete("/api/expenditures/bulk-delete", async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No expenditure IDs provided for bulk deletion." });
    }
    try {
      const placeholders = ids.map(() => "?").join(",");
      console.log(`[Bulk Delete Expenditures] Executing SQL: DELETE FROM expenditures WHERE id IN (${placeholders})`);
      console.log(`[Bulk Delete Expenditures] With parameters:`, ids);
      const result = await db.run(`DELETE FROM expenditures WHERE id IN (${placeholders})`, ids);
      if (result.changes === 0) {
        console.warn(`[Bulk Delete Expenditures] No records found matching IDs: ${ids}`);
        return res.status(404).json({ error: "No expenditures found with the provided IDs." });
      }
      res.json({ message: `${result.changes} expenditures deleted successfully.` });
    } catch (err: any) {
      console.error("[Bulk Delete Expenditures] Critical Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // IMPORT EXPENDITURES FROM CSV
  app.post("/api/expenditures/import", upload.single('file'), async (req: any, res) => {
    if (!req.file && !(req as any).file) return res.status(400).json({ error: "No CSV file uploaded." });
    const csvString = req.file.buffer.toString('utf8');
    const results: any[] = [];
    const errors: any[] = [];
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvString);

    bufferStream
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', async () => {
        let importedCount = 0;
        for (const row of results) {
          try {
            const { 'Title': title, 'Description': description, 'Amount': amount, 'Category': category, 'Date': date, 'Branch ID': branch_id } = row;
            if (!title || !amount || !category || !date) {
              errors.push({ row, error: "Missing required fields." });
              continue;
            }
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) continue;
            await db.run(`INSERT INTO expenditures (title, description, amount, category, date, branch_id) VALUES (?, ?, ?, ?, ?, ?)`, [title, description || null, parsedAmount, category, date, branch_id ? parseInt(branch_id, 10) : null]);
            importedCount++;
          } catch (err: any) {
            console.error(`[Expenditure Import] Error processing row:`, err);
            errors.push({ row, error: err.message });
          }
        }
        if (errors.length > 0) return res.status(207).json({ message: `Imported ${importedCount} items with errors.`, errors });
        res.status(201).json({ message: `${importedCount} expenditures imported successfully.` });
      })
      .on('error', (err: any) => res.status(500).json({ error: "CSV parsing error: " + err.message }));
  });

  app.delete("/api/expenditures/:id", async (req, res) => {
    try {
      const expenditureId = parseInt(req.params.id, 10);
      if (isNaN(expenditureId)) return res.status(400).json({ error: "Invalid ID" });
      const result = await db.run("DELETE FROM expenditures WHERE id = ?", expenditureId);
      if (result.changes === 0) return res.status(404).json({ error: "Expenditure not found" });
      res.json({ message: "Expenditure deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // GENERAL LEDGER BALANCE SHEET & ACCOUNTS INTEGRATION
  app.get("/api/ledger", async (req, res) => {
    try {
      const expensesSum = await db.get("SELECT SUM(amount) as total FROM expenditures");
      const incomeSum = await db.get("SELECT SUM(amount) as total FROM contributions");
      
      const incomeBreakdown = await db.all("SELECT type as name, SUM(amount) as value FROM contributions GROUP BY type");
      const expenseBreakdown = await db.all("SELECT category as name, SUM(amount) as value FROM expenditures GROUP BY category");

      const contributionsListForLedger = await db.all(`
        SELECT c.*, m.first_name, m.last_name, b.name as branch_name, cg.name as cell_group_name
        FROM contributions c
        LEFT JOIN members m ON c.member_id = m.id
        LEFT JOIN branches b ON c.branch_id = b.id
        LEFT JOIN cell_groups cg ON c.cell_group_id = cg.id
        ORDER BY c.date DESC
      `);

      const expendituresListForLedger = await db.all(`
        SELECT e.*, b.name as branch_name
        FROM expenditures e
        LEFT JOIN branches b ON e.branch_id = b.id
        ORDER BY e.date DESC
      `);

      const totalEarned = incomeSum.total || 0;
      const totalExpenditure = expensesSum.total || 0;

      res.json({
        totalEarned,
        totalExpenditure,
        netLedgerBalance: totalEarned - totalExpenditure,
        incomeBreakdown,
        expenseBreakdown,
        contributions: contributionsListForLedger,
        expenditures: expendituresListForLedger,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // COMMUNICATIONS LOGS (SMS & VIDEO CALLS)
  app.get("/api/communications/sms", async (req, res) => {
    try {
      const logs = await db.all("SELECT * FROM sms_logs ORDER BY id DESC");
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/communications/sms", async (req, res) => {
    const { message, recipients_count, recipients_names, date_sent, group_type, phones } = req.body;
    
    console.log("REQ BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    if (!message || !recipients_count || !group_type) {
      return res.status(400).json({ error: "Message and target group are required." });
    }

    try {
      // Real-time dispatch via Africa's Talking
      if (phones && Array.isArray(phones) && phones.length > 0) {
        console.log(`[SMS BROADCAST] Sending to ${phones.length} recipients...`);
        
        // Robust E.164 formatting: Remove spaces/dashes and ensure + prefix
        const validPhones = phones
          .filter(p => p && p.trim().length > 0)
          .map(p => p.replace(/[^\d+]/g, '')) // Remove everything except digits and +
          .map(p => p.startsWith('+') ? p : `+${p}`);

        console.log("Valid Phones (after formatting in server.ts):", validPhones);
        console.log("Type of Valid Phones (in server.ts):", typeof validPhones);
        console.log("Is Valid Phones an Array? (in server.ts):", Array.isArray(validPhones));
        if (validPhones.length > 0) { // Ensure there are valid phones to send to
          await sendSmsNotification(validPhones, message);
        }
      }

      const dateStr = date_sent || new Date().toISOString().split("T")[0];
      const result = await db.run(`
        INSERT INTO sms_logs (message, recipients_count, recipients_names, date_sent, group_type)
        VALUES (?, ?, ?, ?, ?)
      `, [message, recipients_count, recipients_names || "Group Members", dateStr, group_type]);
      
      res.status(201).json({ 
        id: result.lastID, 
        status: "sent", 
        message: `Bulk SMS dispatched to ${recipients_count} recipients.` 
      });
    } catch (err: any) {
      console.error("SMS Dispatch Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/communications/video", async (req, res) => {
    try {
      const logs = await db.all("SELECT * FROM video_call_logs ORDER BY id DESC");
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/communications/video", async (req, res) => {
    const { title, duration_minutes, host_name, date_created, meeting_code, participants_count } = req.body;
    if (!title || !meeting_code) {
      return res.status(400).json({ error: "Title and meeting code are required." });
    }
    try {
      const dateStr = date_created || new Date().toISOString().split("T")[0];
      const result = await db.run(`
        INSERT INTO video_call_logs (title, duration_minutes, host_name, date_created, meeting_code, participants_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [title, duration_minutes || null, host_name || "Admin", dateStr, meeting_code, participants_count || 0]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // SERMONS ENDPOINTS
  app.get("/api/sermons", async (req, res) => {
    try {
      const sermons = await db.all("SELECT * FROM sermons ORDER BY date DESC, id DESC");
      res.json(sermons);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/sermons", async (req, res) => {
    const { title, speaker, date, scripture, content, audio_url, video_url } = req.body;
    if (!title || !speaker || !date) {
      return res.status(400).json({ error: "Title, speaker, and date are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO sermons (title, speaker, date, scripture, content, audio_url, video_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [title, speaker, date, scripture || null, content || null, audio_url || null, video_url || null]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/sermons/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM sermons WHERE id = ?", [req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Sermon not found" });
      res.json({ message: "Sermon deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PRAYER REQUESTS ENDPOINTS
  app.get("/api/prayer-requests", async (req, res) => {
    try {
      const requests = await db.all("SELECT * FROM prayer_requests ORDER BY date_submitted DESC, id DESC");
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/prayer-requests", async (req, res) => {
    const { requester_name, phone, request_text, is_private } = req.body;
    if (!request_text || request_text.trim() === "") {
      return res.status(400).json({ error: "Request text is required." });
    }
    try {
      const name = requester_name && requester_name.trim() !== "" ? requester_name.trim() : "Anonymous";
      const isPrivate = is_private ? 1 : 0;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const result = await db.run(`
        INSERT INTO prayer_requests (requester_name, phone, request_text, is_private, status, date_submitted)
        VALUES (?, ?, ?, ?, 'Pending', ?)
      `, [name, phone || null, request_text.trim(), isPrivate, today]);
      res.status(201).json({ id: result.lastID, status: "Pending", date_submitted: today });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/prayer-requests/:id/pray", async (req, res) => {
    try {
      const result = await db.run(
        "UPDATE prayer_requests SET status = 'Prayed For' WHERE id = ?",
        [req.params.id]
      );
      if (result.changes === 0) return res.status(404).json({ error: "Prayer request not found" });
      res.json({ message: "Prayer request marked as prayed for" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/prayer-requests/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM prayer_requests WHERE id = ?", [req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Prayer request not found" });
      res.json({ message: "Prayer request deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // HYMNS ENDPOINTS
  app.get("/api/hymns", async (req, res) => {
    try {
      const rows = await db.all("SELECT * FROM hymns ORDER BY number ASC");
      res.json(rows.map(r => ({
        ...r,
        key: r.hymn_key,
        languages: JSON.parse(r.languages_json),
        melodyNotes: r.melody_notes_json ? JSON.parse(r.melody_notes_json) : [],
        pdf_url: r.pdf_url,
        pdf_page: r.pdf_page
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hymns", async (req, res) => {
    const { number, category, key, author, scripture, description, pdf_url, pdf_page, languages, melodyNotes } = req.body;
    try {
      const result = await db.run(
        `INSERT INTO hymns (number, category, hymn_key, author, scripture, description, pdf_url, pdf_page, languages_json, melody_notes_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [number, category, key, author, scripture, description, pdf_url || null, pdf_page || null, JSON.stringify(languages), JSON.stringify(melodyNotes || [])]
      );
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hymns/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM hymns WHERE id = ?", [req.params.id]);
      res.json({ message: "Hymn deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // USERS MANAGEMENT ENDPOINTS
  app.get("/api/users", async (req, res) => {
    try {
      const users = await db.all(`
        SELECT u.id, u.username, u.role, u.member_id, m.first_name, m.last_name 
        FROM users u
        LEFT JOIN members m ON u.member_id = m.id
      `);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    const { username, password, role, member_id } = req.body;
    try {
      // Using a simple insert; for a full login system you'd use bcrypt here later
      const result = await db.run(
        "INSERT INTO users (username, password_hash, role, member_id) VALUES (?, ?, ?, ?)",
        [username, password, role || 'congregant', member_id || null]
      );
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await db.run("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ message: "User deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Vite Integration & Asset Serving
  // ----------------------------------------------------

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(+PORT, "0.0.0.0", () => { // Convert PORT to a number
    console.log(`Church Management System server running in ${process.env.NODE_ENV || "development"} mode at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
