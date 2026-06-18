export type MemberStatus = "Active" | "Inactive" | "Visitor";
export type FamilyRole = "Head" | "Spouse" | "Child" | "Single";
export type Gender = "Male" | "Female" | "Other" | null;

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  join_date: string;
  status: MemberStatus;
  gender: Gender;
  family_role: FamilyRole;
  birth_date: string | null;
  notes: string | null;
  ministries_list?: string;
  branch_id?: number | null;
  cell_group_id?: number | null;
  branch_name?: string | null;
  cell_group_name?: string | null;
}

export interface Ministry {
  id: number;
  name: string;
  description: string | null;
  leader_id: number | null;
  leader_first?: string | null;
  leader_last?: string | null;
  member_count?: number;
}

export interface Contribution {
  id: number;
  member_id: number | null;
  amount: number;
  type: string; // Tithe, Offering, Building Fund, Mission, Special, etc.
  date: string;
  payment_method: string; // Cash, Check, Card, Online, Bank Transfer
  notes: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  branch_id?: number | null;
  cell_group_id?: number | null;
  branch_name?: string | null;
  cell_group_name?: string | null;
}

export interface AttendanceSession {
  id: number;
  title: string;
  date: string;
  notes: string | null;
  present_count?: number;
  total_count?: number;
}

export interface AttendanceRecord {
  member_id: number;
  first_name: string;
  last_name: string;
  gender: Gender;
  member_status: MemberStatus;
  status: "Present" | "Absent" | "Excused";
}

export interface ChurchEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  ministry_id: number | null;
  ministry_name?: string | null;
}

export interface DashboardStats {
  activeMembers: number;
  totalMembers: number;
  thisMonthContributions: number;
  totalContributions: number;
  upcomingEventsCount: number;
  typesBreakdown: Array<{ name: string; value: number }>;
  attendanceTrend: Array<{
    date: string;
    title: string;
    percentage: number;
    present: number;
    total: number;
  }>;
  recentMembers: Array<{
    first_name: string;
    last_name: string;
    join_date: string;
    status: MemberStatus;
  }>;
  recentDonations: Array<{
    amount: number;
    type: string;
    date: string;
    first_name: string | null;
    last_name: string | null;
  }>;
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  pastor: string;
  date_opened: string;
  contact_phone: string | null;
  member_count: number;
}

export interface CellGroup {
  id: number;
  name: string;
  leader_name: string;
  meeting_day: string;
  meeting_time: string;
  location_details: string;
  members_count: number;
}

export interface Expenditure {
  id: number;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  date: string;
  branch_id: number | null;
  branch_name?: string | null;
}

export interface SmsLog {
  id: number;
  message: string;
  recipients_count: number;
  recipients_names: string | null;
  date_sent: string;
  group_type: string;
}

export interface VideoCallLog {
  id: number;
  title: string;
  duration_minutes: number | null;
  host_name: string | null;
  date_created: string;
  meeting_code: string;
  participants_count: number;
}

export interface LedgerSummary {
  totalEarned: number;
  totalExpenditure: number;
  netLedgerBalance: number;
  incomeBreakdown: Array<{ name: string; value: number }>;
  expenseBreakdown: Array<{ name: string; value: number }>;
  contributions: Contribution[];
  expenditures: Expenditure[];
}

export interface Sermon {
  id: number;
  title: string;
  speaker: string;
  date: string;
  scripture: string | null;
  content: string | null;
  audio_url: string | null;
  video_url: string | null;
}

export interface PrayerRequest {
  id: number;
  requester_name: string;
  phone: string | null;
  request_text: string;
  is_private: number; // 1 for private/anonymous to portal, 0 for accessible/visible
  status: "Pending" | "Prayed For";
  date_submitted: string;
}
