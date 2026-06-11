import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { HYMNS, Hymn } from "./src/data/hymns"; // Import HYMNS and Hymn interface
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { sendSmsNotification } from "./smsService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000; // Default to 3000 if not specified

  app.use(express.json());

  // Ensure the public/images directory exists and serve it statically
  const imagesPath = path.join(__dirname, "public", "images");
  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
  }
  app.use("/images", express.static(imagesPath));

  console.log("Initializing Church Management SQLite DB...");
  const db = await open({
    filename: "./church.db",
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON;");

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'congregant', -- 'admin', 'congregant'
      member_id INTEGER, -- Optional: Link to a member record
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ministries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      location TEXT,
      ministry_id INTEGER,
      FOREIGN KEY(ministry_id) REFERENCES ministries(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      pastor TEXT NOT NULL,
      date_opened TEXT NOT NULL,
      contact_phone TEXT,
      member_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cell_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      meeting_day TEXT NOT NULL,
      meeting_time TEXT NOT NULL,
      location_details TEXT NOT NULL,
      members_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expenditures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      branch_id INTEGER,
      FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sms_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      recipients_count INTEGER NOT NULL,
      recipients_names TEXT,
      date_sent TEXT NOT NULL,
      group_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS video_call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      duration_minutes INTEGER,
      host_name TEXT,
      date_created TEXT NOT NULL,
      meeting_code TEXT NOT NULL,
      participants_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sermons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      speaker TEXT NOT NULL,
      date TEXT NOT NULL,
      scripture TEXT,
      content TEXT,
      audio_url TEXT,
      video_url TEXT
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_name TEXT NOT NULL,
      phone TEXT,
      request_text TEXT NOT NULL,
      is_private INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Pending',
      date_submitted TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hymns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  `);

  // Migration: Ensure hymns table is up to date with new columns
  const hymnColumns = await db.all("PRAGMA table_info(hymns)");
  const columnNames = hymnColumns.map(c => c.name);
  
  if (!columnNames.includes("melody_notes_json")) {
    console.log("Migrating database: Adding melody_notes_json to hymns...");
    await db.exec("ALTER TABLE hymns ADD COLUMN melody_notes_json TEXT;");
  }

  // Seed data if DB is empty
  const memberCount = await db.get("SELECT COUNT(*) as count FROM members");
  if (memberCount.count === 0) {
    console.log("Seeding database with realistic church data...");

    // 1. Members
    const membersList = [
      ["Newton", "Atela", "apostle.atela@graceflow.org", "555-0100", "2021-01-15", "Active", "Male", "Head", "1978-04-12", "Senior Apostle and founder.", "Apostle"],
      ["Sarah", "Doe", "sarah.doe@gmail.com", "555-0101", "2021-01-15", "Active", "Female", "Spouse", "1981-08-22", "Sunday School coordinator.", "Pastor"],
      ["James", "Smith", "james.smith@hotmail.com", "555-0122", "2022-03-10", "Active", "Male", "Single", "1995-11-05", "Youth coordinator and band player.", "Youth Leader"],
      ["Mary", "Johnson", "mary.j@outlook.com", "555-0133", "2021-06-20", "Active", "Female", "Head", "1969-02-17", "Ushering ministry chairperson.", "Deaconess"],
      ["Robert", "Davis", "robert.davis@yahoo.com", "555-0144", "2023-01-05", "Active", "Male", "Head", "1985-07-30", "Deacon and finance helper.", "Deacon"],
      ["Linda", "Wilson", "linda.w@gmail.com", "555-0155", "2022-09-01", "Active", "Female", "Spouse", "1988-10-14", "Worship Choir lead singer.", "Choral Director"],
      ["Emily", "Davis", "emily.davis@gmail.com", "555-0146", "2023-01-05", "Active", "Female", "Child", "2013-05-12", "Daughter of Robert Davis.", "Member"],
      ["Michael", "Miller", "michael.m@yahoo.com", "555-0199", "2026-05-15", "Visitor", "Male", "Single", "1992-03-24", "Visited during the youth concert event.", "Visitor"],
    ];

    for (const m of membersList) {
      await db.run(
        `INSERT INTO members (first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, title)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      await db.run(
        `INSERT INTO contributions (member_id, amount, type, date, payment_method, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        c
      );
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

    // 8. Branches
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Ramba-Kabondo Headquarters", "Ramba, Kabondo, Homa Bay County, Kenya", "Apostle Newton Atela", "2010-01-10", "+254 712 345678", 350]
    );
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Nairobi Branch", "Umoja, Nairobi, Kenya", "Rev. Joseph Omwamba", "2015-08-15", "+254 722 987654", 120]
    );
    await db.run(`INSERT INTO branches (name, location, pastor, date_opened, contact_phone, member_count) VALUES (?, ?, ?, ?, ?, ?)`, 
      ["Mombasa Outreach", "Mtwapa, Mombasa, Kenya", "Evangelist Mary Atieno", "2019-11-20", "+254 733 111222", 75]
    );

    // 9. Cell Groups (HQ Ramba-Kabondo)
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
         WHERE strftime('%Y-%m', date) = strftime('%Y-%m', '2026-05-29')`
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
               GROUP_CONCAT(min.name, ', ') as ministries_list
        FROM members m
        LEFT JOIN member_ministries mm ON m.id = mm.member_id
        LEFT JOIN ministries min ON mm.ministry_id = min.id
        GROUP BY m.id
        ORDER BY m.first_name ASC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await db.get("SELECT * FROM members WHERE id = ?", [req.params.id]);
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
    const { first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, ministry_ids, title } = req.body;
    if (!first_name || !last_name || !join_date) {
      return res.status(400).json({ error: "First name, Last name and Join date are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO members (first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [first_name, last_name, email || null, phone || null, join_date, status || "Active", gender || null, family_role || "Single", birth_date || null, notes || null, title || null]);

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
    const { first_name, last_name, email, phone, join_date, status, gender, family_role, birth_date, notes, ministry_ids, title } = req.body;
    const { id } = req.params;
    if (!first_name || !last_name || !join_date) {
      return res.status(400).json({ error: "First name, Last name and Join date are required." });
    }
    try {
      const exists = await db.get("SELECT id FROM members WHERE id = ?", [id]);
      if (!exists) return res.status(404).json({ error: "Member not found" });

      await db.run(`
        UPDATE members 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, join_date = ?, status = ?, gender = ?, family_role = ?, birth_date = ?, notes = ?, title = ?
        WHERE id = ?
      `, [first_name, last_name, email || null, phone || null, join_date, status, gender || null, family_role, birth_date || null, notes || null, title || null, id]);

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
      const result = await db.run("DELETE FROM members WHERE id = ?", [req.params.id]);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json({ message: "Member and associated relations deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
    try {
      const result = await db.run("DELETE FROM ministries WHERE id = ?", [req.params.id]);
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
               m.first_name, m.last_name, m.email
        FROM contributions c
        LEFT JOIN members m ON c.member_id = m.id
        ORDER BY c.date DESC, c.id DESC
      `);
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    const { member_id, amount, type, date, payment_method, notes } = req.body;
    if (!amount || !type || !date || !payment_method) {
      return res.status(400).json({ error: "Amount, type, date and payment method are required." });
    }
    try {
      const result = await db.run(`
        INSERT INTO contributions (member_id, amount, type, date, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [member_id || null, amount, type, date, payment_method, notes || null]);
      res.status(201).json({ id: result.lastID });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/contributions/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM contributions WHERE id = ?", [req.params.id]);
      if (result.changes === 0) return res.status(404).json({ error: "Contribution record not found" });
      res.json({ message: "Contribution record deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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

  app.delete("/api/expenditures/:id", async (req, res) => {
    try {
      const result = await db.run("DELETE FROM expenditures WHERE id = ?", [req.params.id]);
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
        SELECT c.*, m.first_name, m.last_name
        FROM contributions c
        LEFT JOIN members m ON c.member_id = m.id
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

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
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
