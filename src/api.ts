import { Member, Ministry, Contribution, AttendanceSession, AttendanceRecord, ChurchEvent, DashboardStats, Branch, CellGroup, Expenditure, SmsLog, VideoCallLog, LedgerSummary, Sermon, PrayerRequest } from "./types";
import { Hymn } from "./data/hymns";

export const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Stats
  getStats: () => request<DashboardStats>("/stats"),

  // Members
  getMembers: () => request<Member[]>("/members"),
  getMember: (id: number) => request<Member & { ministries: Ministry[]; contributions: Contribution[] }>(`/members/${id}`),
  addMember: (m: Partial<Member> & { ministry_ids?: number[] }) => request<{ id: number }>("/members", {
    method: "POST",
    body: JSON.stringify(m),
  }),
  updateMember: (id: number, m: Partial<Member> & { ministry_ids?: number[] }) => request<{ message: string }>(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(m),
  }),
  deleteMember: (id: number) => request<{ message: string }>(`/members/${id}`, {
    method: "DELETE",
  }),

  // Ministries
  getMinistries: () => request<Ministry[]>("/ministries"),
  addMinistry: (min: Partial<Ministry>) => request<{ id: number }>("/ministries", {
    method: "POST",
    body: JSON.stringify(min),
  }),
  updateMinistry: (id: number, min: Partial<Ministry>) => request<{ message: string }>(`/ministries/${id}`, {
    method: "PUT",
    body: JSON.stringify(min),
  }),
  deleteMinistry: (id: number) => request<{ message: string }>(`/ministries/${id}`, {
    method: "DELETE",
  }),

  // Attendance
  getSessions: () => request<AttendanceSession[]>("/attendance/sessions"),
  getSessionDetails: (id: number) => request<{ session: AttendanceSession; records: AttendanceRecord[] }>(`/attendance/sessions/${id}`),
  addSession: (session: Partial<AttendanceSession> & { records: Record<number, string> }) => request<{ id: number }>("/attendance/sessions", {
    method: "POST",
    body: JSON.stringify(session),
  }),
  updateSession: (id: number, session: Partial<AttendanceSession> & { records: Record<number, string> }) => request<{ message: string }>(`/attendance/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(session),
  }),
  deleteSession: (id: number) => request<{ message: string }>(`/attendance/sessions/${id}`, {
    method: "DELETE",
  }),

  // Contributions
  getContributions: () => request<Contribution[]>("/contributions"),
  addContribution: (c: Partial<Contribution>) => request<{ id: number }>("/contributions", {
    method: "POST",
    body: JSON.stringify(c),
  }),
  deleteContribution: (id: number) => request<{ message: string }>(`/contributions/${id}`, {
    method: "DELETE",
  }),

  // Events (Calendar)
  getEvents: () => request<ChurchEvent[]>("/events"),
  addEvent: (e: Partial<ChurchEvent>) => request<{ id: number }>("/events", {
    method: "POST",
    body: JSON.stringify(e),
  }),
  updateEvent: (id: number, e: Partial<ChurchEvent>) => request<{ message: string }>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(e),
  }),
  deleteEvent: (id: number) => request<{ message: string }>(`/events/${id}`, {
    method: "DELETE",
  }),

  // Branches
  getBranches: () => request<Branch[]>("/branches"),
  addBranch: (b: Partial<Branch>) => request<{ id: number }>("/branches", {
    method: "POST",
    body: JSON.stringify(b),
  }),
  updateBranch: (id: number, b: Partial<Branch>) => request<{ message: string }>(`/branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(b),
  }),
  deleteBranch: (id: number) => request<{ message: string }>(`/branches/${id}`, {
    method: "DELETE",
  }),

  // Cell Groups
  getCellGroups: () => request<CellGroup[]>("/cell_groups"),
  addCellGroup: (cg: Partial<CellGroup>) => request<{ id: number }>("/cell_groups", {
    method: "POST",
    body: JSON.stringify(cg),
  }),
  updateCellGroup: (id: number, cg: Partial<CellGroup>) => request<{ message: string }>(`/cell_groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(cg),
  }),
  deleteCellGroup: (id: number) => request<{ message: string }>(`/cell_groups/${id}`, {
    method: "DELETE",
  }),

  // Expenditures
  getExpenditures: () => request<Expenditure[]>("/expenditures"),
  addExpenditure: (ex: Partial<Expenditure>) => request<{ id: number }>("/expenditures", {
    method: "POST",
    body: JSON.stringify(ex),
  }),
  updateExpenditure: (id: number, ex: Partial<Expenditure>) => request<{ message: string }>(`/expenditures/${id}`, {
    method: "PUT",
    body: JSON.stringify(ex),
  }),
  deleteExpenditure: (id: number) => request<{ message: string }>(`/expenditures/${id}`, {
    method: "DELETE",
  }),

  // Accounts Ledger Balance Sheet
  getLedgerSummary: () => request<LedgerSummary>("/ledger"),

  // Communications (SMS & Video)
  getSmsLogs: () => request<SmsLog[]>("/communications/sms"),
  sendSmsSimulated: (log: { message: string; recipients_count: number; recipients_names: string; group_type: string; phones: string[] }) => request<{ id: number; status: string; message: string }>("/communications/sms", {
    method: "POST",
    body: JSON.stringify(log),
  }),
  getVideoCallLogs: () => request<VideoCallLog[]>("/communications/video"),
  logVideoCall: (log: { title: string; duration_minutes: number; host_name: string; meeting_code: string; participants_count: number }) => request<{ id: number }>("/communications/video", {
    method: "POST",
    body: JSON.stringify(log),
  }),

  // Sermons
  getSermons: () => request<Sermon[]>("/sermons"),
  addSermon: (s: Partial<Sermon>) => request<{ id: number }>("/sermons", {
    method: "POST",
    body: JSON.stringify(s),
  }),
  deleteSermon: (id: number) => request<{ message: string }>(`/sermons/${id}`, {
    method: "DELETE",
  }),

  // Prayer Requests
  getPrayerRequests: () => request<PrayerRequest[]>("/prayer-requests"),
  addPrayerRequest: (pr: Partial<PrayerRequest>) => request<PrayerRequest>("/prayer-requests", {
    method: "POST",
    body: JSON.stringify(pr),
  }),
  markPrayedFor: (id: number) => request<{ message: string }>(`/prayer-requests/${id}/pray`, {
    method: "PUT",
  }),
  deletePrayerRequest: (id: number) => request<{ message: string }>(`/prayer-requests/${id}`, {
    method: "DELETE",
  }),

  // Hymns
  getHymns: () => request<Hymn[]>("/hymns"),
  addHymn: (h: Partial<Hymn>) => request<{ id: number }>("/hymns", {
    method: "POST",
    body: JSON.stringify(h),
  }),
  deleteHymn: (id: number) => request<{ message: string }>(`/hymns/${id}`, {
    method: "DELETE",
  }),
};
