import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Heart, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  Activity,
  Sparkles,
  Layers,
  HeartHandshake
} from "lucide-react";

// Detailed interface tracking all SQLite schema fields requested
export interface SQLiteMemberProfile {
  // Personal & Contact Info
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  birthDate: string;
  joinDate: string;
  registration_number?: string;
  title?: string;
  status: "Active" | "Inactive" | "Visitor";
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  notes?: string;

  // Staff Association (Nullable if not a staff member)
  staffDetails?: {
    jobTitle: string;
    department: "Pastoral" | "Administration" | "Music" | "Outreach" | "Children & Youth";
    employmentType: "Full-Time" | "Part-Time" | "Contractor" | "Volunteer Staff";
    hireDate: string;
    salary?: number;
    isActive: boolean;
  };

  // Volunteer Record (Nullable if not volunteer)
  volunteerDetails?: {
    skills: string[];
    availability: string;
    backgroundCheckPassed: boolean;
    backgroundCheckDate?: string;
    isActive: boolean;
    assignments: Array<{
      id: number;
      activityName: string;
      roleDescription: string;
      startDate: string;
      endDate?: string;
      hoursServed: number;
    }>;
  };

  // Event Participation
  eventsParticipation: Array<{
    eventId: number;
    title: string;
    eventDate: string;
    registrationDate: string;
    role: "Attendee" | "Speaker" | "Coordinator" | "Volunteer Facilitator";
    attended: boolean;
  }>;

  // Donations Details
  donationsSummary: {
    totalDonated: number;
    averageDonation: number;
    contributions: Array<{
      id: number;
      amount: number;
      date: string;
      fundType: "Tithe" | "General Offering" | "Building Fund" | "Missions" | "Special Project";
      paymentMethod: string;
      notes?: string;
    }>;
  };
}

// ----------------------------------------------------
// BEAUTIFUL MOCK MEMBERS FIT WITH OUR DATABASE SCHEMA
// ----------------------------------------------------
const MOCK_PROFILES: SQLiteMemberProfile[] = [
  {
    id: 101,
    firstName: "Rev. Joshua",
    lastName: "Ochieng",
    email: "joshua.ochieng@graceflow.org",
    phone: "555-0120",
    gender: "Male",
    birthDate: "1980-05-14",
    joinDate: "2018-02-15",
    status: "Active",
    address: {
      street: "45 Sanctuary Way",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00100"
    },
    notes: "Appointed as Senior Pastor. Highly active in counseling and theological educational outreach programs.",
    staffDetails: {
      jobTitle: "Senior Pastoral Overseer",
      department: "Pastoral",
      employmentType: "Full-Time",
      hireDate: "2018-03-01",
      salary: 4500,
      isActive: true
    },
    volunteerDetails: {
      skills: ["Theology", "Counseling", "Grief Support", "Public Speaking"],
      availability: "Full Availability",
      backgroundCheckPassed: true,
      backgroundCheckDate: "2018-01-20",
      isActive: true,
      assignments: [
        {
          id: 1,
          activityName: "Couples Pre-Marital Counseling Retreat",
          roleDescription: "Lead pastoral counselor and workshop director",
          startDate: "2025-06-05",
          hoursServed: 40.5
        }
      ]
    },
    eventsParticipation: [
      {
        eventId: 201,
        title: "Sanctuary Morning Pentecost Service",
        eventDate: "2026-05-24",
        registrationDate: "2026-05-01",
        role: "Speaker",
        attended: true
      },
      {
        eventId: 202,
        title: "Annual Regional Leadership Assembly",
        eventDate: "2026-04-18",
        registrationDate: "2026-04-02",
        role: "Coordinator",
        attended: true
      }
    ],
    donationsSummary: {
      totalDonated: 2400.00,
      averageDonation: 600.00,
      contributions: [
        { id: 10, amount: 600.00, date: "2026-05-01", fundType: "Tithe", paymentMethod: "Bank Transfer", notes: "Monthly family tithe contribution." },
        { id: 11, amount: 600.00, date: "2026-04-01", fundType: "Tithe", paymentMethod: "Bank Transfer" },
        { id: 12, amount: 600.00, date: "2026-03-01", fundType: "Tithe", paymentMethod: "Bank Transfer" },
        { id: 13, amount: 600.00, date: "2026-02-01", fundType: "Tithe", paymentMethod: "Bank Transfer" }
      ]
    }
  },
  {
    id: 102,
    firstName: "Sister Linda",
    lastName: "Wambua",
    email: "linda.wambua@yahoo.com",
    phone: "555-0344",
    gender: "Female",
    birthDate: "1992-11-23",
    joinDate: "2021-08-30",
    status: "Active",
    address: {
      street: "12 Valley View Gardens",
      city: "Nairobi",
      state: "Nairobi County",
      postalCode: "00200"
    },
    notes: "A gifted musician. Serves passionately as the praise lead singer in the youth band and choral ministry.",
    volunteerDetails: {
      skills: ["Vocal Harmonization", "Directing Choir", "Guitar Bass", "Event Coordination"],
      availability: "Saturdays & Sundays",
      backgroundCheckPassed: true,
      backgroundCheckDate: "2021-08-20",
      isActive: true,
      assignments: [
        {
          id: 5,
          activityName: "Weekly Divine Praise Rehearsal",
          roleDescription: "Vocal lead and sound engineer support",
          startDate: "2021-09-02",
          hoursServed: 180.0
        },
        {
          id: 6,
          activityName: "Neighborhood Soup Kitchen Ministry",
          roleDescription: "Meals coordinator and spiritual fellowship companion",
          startDate: "2022-01-15",
          hoursServed: 65.5
        }
      ]
    },
    eventsParticipation: [
      {
        eventId: 201,
        title: "Sanctuary Morning Pentecost Service",
        eventDate: "2026-05-24",
        registrationDate: "2026-05-15",
        role: "Volunteer Facilitator",
        attended: true
      },
      {
        eventId: 203,
        title: "Youth Concert & Acoustic Worship Encounter",
        eventDate: "2026-05-12",
        registrationDate: "2026-05-02",
        role: "Speaker",
        attended: true
      },
      {
        eventId: 204,
        title: "Church Beautification & Planting Project",
        eventDate: "2026-03-10",
        registrationDate: "2026-03-01",
        role: "Attendee",
        attended: false // Excused/Missed
      }
    ],
    donationsSummary: {
      totalDonated: 730.00,
      averageDonation: 146.00,
      contributions: [
        { id: 21, amount: 150.00, date: "2026-05-15", fundType: "Tithe", paymentMethod: "Online Transfer", notes: "Monthly envelope check envelope" },
        { id: 22, amount: 80.00, date: "2026-05-12", fundType: "Missions", paymentMethod: "Mobile Pay", notes: "Youth concert charity support" },
        { id: 23, amount: 300.00, date: "2026-04-10", fundType: "Building Fund", paymentMethod: "Online Transfer", notes: "Sanctuary floor tiles pledge restoration" },
        { id: 24, amount: 100.00, date: "2026-03-20", fundType: "General Offering", paymentMethod: "Cash" },
        { id: 25, amount: 100.00, date: "2026-02-15", fundType: "General Offering", paymentMethod: "Cash" }
      ]
    }
  }
];

interface MemberProfileProps {
  memberId?: number;
}

export default function MemberProfile({ memberId }: MemberProfileProps) {
  const [profileIndex, setProfileIndex] = useState(0);
  const activeProfile = MOCK_PROFILES[profileIndex];

  const formatDate = (dStr: string) => {
    return new Date(dStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatKES = (val: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="member-profile-custom-registry">
      {/* Switcher & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E1D8] pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C5A059]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9E7A3B]">
            <Award className="h-3.5 w-3.5 text-[#C5A059]" />
            SQLite Spec Component
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[#2D3E50]">
            Detailed Member Profile Display
          </h2>
          <p className="text-xs text-neutral-400">
            Rendered in full compliance with SQLite schemas for integrated database systems.
          </p>
        </div>

        {/* Demo Selector Buttons */}
        <div className="flex items-center gap-2 bg-[#F5F2ED] border border-[#E5E1D8] p-1 rounded-xl">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider px-2 shrink-0">
            Profile Sample:
          </span>
          {MOCK_PROFILES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setProfileIndex(idx)}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition select-none cursor-pointer ${
                profileIndex === idx
                  ? "bg-[#2D3E50] text-[#C5A059] shadow-xs"
                  : "text-[#636E72] hover:text-[#2D3E50]"
              }`}
            >
              {p.firstName.split(".")[0] || p.firstName}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Span 4) - Photo & Contact Registry Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            
            {/* Top background accent card strip */}
            <div className="absolute top-0 inset-x-0 h-2 bg-[#C5A059]" />

            <div className="flex flex-col items-center text-center mt-3">
              <img
                src={`https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(activeProfile.firstName + " " + activeProfile.lastName)}&backgroundColor=f5f2ed`}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full border border-[#E5E1D8] bg-[#F5F2ED]"
              />
              <h3 className="mt-3 font-bold text-lg text-[#2D3E50] tracking-tight leading-tight">
                {activeProfile.firstName} {activeProfile.lastName}
              </h3>
              
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold text-neutral-400">
                  SYS_ID: #{activeProfile.id}
                </span>
                <span className="h-1 w-1 bg-neutral-300 rounded-full" />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  activeProfile.status === "Active"
                    ? "bg-[#C5A059]/10 text-[#9E7A3B] border-[#C5A059]/30"
                    : "bg-neutral-100 text-[#636E72] border-neutral-200"
                }`}>
                  {activeProfile.status}
                </span>
              </div>

              {activeProfile.registration_number && (
                <div className="mt-2">
                  <span className="text-[10px] font-black text-[#C5A059] bg-[#2D3E50] px-3 py-1 rounded-lg uppercase tracking-tighter">
                    Reg: {activeProfile.registration_number}
                  </span>
                </div>
              )}

              {activeProfile.notes && (
                <p className="mt-4 text-[11px] text-[#636E72] italic bg-[#F5F2ED]/50 p-3 rounded-xl border border-[#E5E1D8]/65 leading-relaxed text-left w-full">
                  "{activeProfile.notes}"
                </p>
              )}
            </div>

            {/* Contacts & Personal Info Directory list */}
            <div className="mt-6 border-t border-[#E5E1D8]/70 pt-5 space-y-3.5 text-xs text-[#2D3E50]">
              
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Email Address
                  </span>
                  <a href={`mailto:${activeProfile.email}`} className="font-semibold text-[#2D3E50] hover:text-[#C5A059] transition break-all select-all">
                    {activeProfile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Telephone Number
                  </span>
                  <span className="font-semibold select-all font-mono">
                    {activeProfile.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Residential Address
                  </span>
                  <address className="not-italic font-semibold text-neutral-605">
                    {activeProfile.address.street}, {activeProfile.address.city}, {activeProfile.address.state} {activeProfile.address.postalCode}
                  </address>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#E5E1D8]/30 pt-4">
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Gender
                  </span>
                  <span className="font-bold text-neutral-700">
                    {activeProfile.gender}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Birth Date
                  </span>
                  <span className="font-bold text-neutral-700 font-mono">
                    {activeProfile.birthDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-[#E5E1D8]/30 pt-4">
                <Calendar className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] block text-neutral-400 uppercase tracking-wider font-bold">
                    Initial Sanctuary Enrollment
                  </span>
                  <span className="font-bold text-neutral-700">
                    {formatDate(activeProfile.joinDate)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column (Span 8) - Tabbed Cards representing SQLite Relations */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Roles (Paid Staff & Volunteers) */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E1D8]/65">
              <Layers className="h-4 w-4 text-[#C5A059]" />
              <span>Ministry Roles & Service (Staff & Volunteer Tables)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* PAID STAFF ACCOUNT CARD */}
              <div className="bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[140px]">
                <div className="absolute right-3 top-3 select-none">
                  <Briefcase className="h-8 w-8 text-[#C5A059]/10" />
                </div>
                
                <div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#9E7A3B] bg-[#C5A059]/15 rounded-full px-2 py-0.5 border border-[#C5A059]/20 mb-2">
                    Paid Staff Registry
                  </span>
                  
                  {activeProfile.staffDetails ? (
                    <div>
                      <h5 className="font-bold text-sm text-[#2D3E50]">{activeProfile.staffDetails.jobTitle}</h5>
                      <p className="text-[11px] text-neutral-500 font-medium">Department: {activeProfile.staffDetails.department}</p>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-bold text-sm text-neutral-400">No Paid Staff Records</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">This member serves strictly in volunteer roles.</p>
                    </div>
                  )}
                </div>

                {activeProfile.staffDetails && (
                  <div className="mt-4 pt-3 border-t border-[#E5E1D8] text-[10px] text-neutral-400 flex items-center justify-between">
                    <span>Hired: {formatDate(activeProfile.staffDetails.hireDate)}</span>
                    <span className="font-semibold bg-[#2D3E50] text-[#E5E1D8] px-1.5 py-0.5 rounded-md uppercase font-mono text-[9px]">
                      {activeProfile.staffDetails.employmentType}
                    </span>
                  </div>
                )}
              </div>

              {/* VOLUNTEER AND SERVICE CARD */}
              <div className="bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[140px]">
                <div className="absolute right-3 top-3 select-none">
                  <HeartHandshake className="h-8 w-8 text-[#C5A059]/10" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-200/50 rounded-full px-2 py-0.5 border border-neutral-300/30 mb-2">
                    Voluntary Ministry Status
                  </span>
                  
                  {activeProfile.volunteerDetails ? (
                    <div>
                      <div className="flex items-center gap-1">
                        <h5 className="font-bold text-sm text-[#2D3E50]">Enrolled Volunteer</h5>
                        <span title="Voluntary Background Check Passed">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Availability: {activeProfile.volunteerDetails.availability}</p>
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-bold text-sm text-neutral-400">No Volunteer Ministry Records</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Not mapped to any active lay leadership roles.</p>
                    </div>
                  )}
                </div>

                {activeProfile.volunteerDetails && (
                  <div className="mt-2 text-[10px]">
                    <div className="flex flex-wrap gap-1">
                      {activeProfile.volunteerDetails.skills.map((s, idx) => (
                        <span key={idx} className="bg-white border border-[#E5E1D8] text-neutral-500 font-semibold px-2 py-0.5 rounded-[5px] text-[9px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Volunteer Assignment Log */}
            {activeProfile.volunteerDetails && (
              <div className="mt-4 space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Volunteer Operations Assignments (volunteer_assignments table)
                </span>
                
                <div className="divide-y divide-[#E5E1D8]/65 border border-[#E5E1D8] rounded-xl bg-white overflow-hidden text-xs">
                  {activeProfile.volunteerDetails.assignments.map((as) => (
                    <div key={as.id} className="p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-[#F5F2ED]/25 transition">
                      <div>
                        <span className="font-bold text-neutral-800 block">{as.activityName}</span>
                        <span className="text-[11px] text-[#636E72] block mt-0.5">{as.roleDescription}</span>
                      </div>

                      <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 block">Hours Mapped</span>
                          <span className="font-bold font-mono text-neutral-700 block">{as.hoursServed.toFixed(1)} hrs</span>
                        </div>
                        <span className="h-6 w-px bg-[#E5E1D8]" />
                        <span className="text-[10px] text-neutral-400 font-semibold uppercase bg-neutral-100 border border-neutral-200 px-2 py-1 rounded">
                          Since {as.startDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Event Participation (event_participation Relation Table) */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E1D8]/65">
              <Calendar className="h-4 w-4 text-[#C5A059]" />
              <span>Event Enrollments & Participation (event_participation table)</span>
            </h4>

            {activeProfile.eventsParticipation.length === 0 ? (
              <p className="text-xs italic text-neutral-400 bg-[#F5F2ED]/50 border border-[#E5E1D8] py-8 text-center rounded-xl">
                No active event participations logged for this member.
              </p>
            ) : (
              <div className="divide-y divide-[#E5E1D8]/65 border border-[#E5E1D8] rounded-xl overflow-hidden bg-white text-xs">
                {activeProfile.eventsParticipation.map((ev, idx) => (
                  <div key={idx} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F5F2ED]/25 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D3E50]">{ev.title}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          ev.role === "Speaker" ? "bg-amber-100 text-amber-800 border-amber-200" :
                          ev.role === "Coordinator" ? "bg-purple-100 text-purple-800 border-purple-200" :
                          ev.role === "Volunteer Facilitator" ? "bg-sky-100 text-sky-800 border-sky-200" :
                          "bg-neutral-100 text-neutral-600 border-neutral-200"
                        }`}>
                          {ev.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                        <span>Date: {formatDate(ev.eventDate)}</span>
                        <span>•</span>
                        <span>Registered: {formatDate(ev.registrationDate)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {ev.attended ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 fill-emerald-100" />
                          <span>Attended</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-500 px-2.5 py-1 text-[10px] font-bold border border-neutral-200">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          <span>Absent/Excused</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Donation History (donations Table Ledger) */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E5E1D8]/65">
              <DollarSign className="h-4 w-4 text-[#C5A059]" />
              <span>Financial Donation Log (donations table)</span>
            </h4>

            {/* Micro Statistics Blocks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F5F2ED]/60 border border-[#E5E1D8] p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Amount Contributed</span>
                <span className="block font-black text-lg text-emerald-600 font-sans mt-0.5">
                  {formatKES(activeProfile.donationsSummary.totalDonated)}
                </span>
              </div>
              <div className="bg-[#F5F2ED]/60 border border-[#E5E1D8] p-3 rounded-xl">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Average Contribution Size</span>
                <span className="block font-black text-lg text-[#2D3E50] font-sans mt-0.5">
                  {formatKES(activeProfile.donationsSummary.averageDonation)}
                </span>
              </div>
            </div>

            {/* Donation log log mapping table */}
            <div className="divide-y divide-[#E5E1D8]/65 border border-[#E5E1D8] rounded-xl overflow-hidden bg-white text-xs">
              {activeProfile.donationsSummary.contributions.map((con) => (
                <div key={con.id} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F5F2ED]/25 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 border border-neutral-200 rounded text-[10px]">
                        {con.fundType}
                      </span>
                      {con.notes && (
                        <span className="text-[11px] text-neutral-400 italic">
                          "{con.notes}"
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1">
                      <span>Received: {formatDate(con.date)}</span>
                      <span>•</span>
                      <span>Via: {con.paymentMethod}</span>
                    </div>
                  </div>

                  <span className="font-bold text-sm text-emerald-700 font-mono shrink-0 self-end md:self-center">
                    + {formatKES(con.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
