import React, { useEffect, useState } from "react";
import { api } from "../api";
import { AttendanceSession, Member, AttendanceRecord } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  FileText, 
  UserCheck, 
  CheckCircle2, 
  X,
  XCircle,
  HelpCircle,
  Clock,
  Eye,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AttendanceProps {
  onDataChange?: () => void;
  isAdmin?: boolean;
}

export default function Attendance({ onDataChange, isAdmin = true }: AttendanceProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal control
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);

  // Form parameters
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [memberStatuses, setMemberStatuses] = useState<Record<number, "Present" | "Absent" | "Excused">>({});

  // Single inspect detail popup
  const [inspectSession, setInspectSession] = useState<{ session: AttendanceSession; records: AttendanceRecord[] } | null>(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Deletion tracking
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, membersData] = await Promise.all([
        api.getSessions(),
        api.getMembers()
      ]);
      setSessions(sessionsData);
      setMembers(membersData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setEditingSession(null);
    setTitle("Sunday Divine Worship");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    
    // Preset everyone to Present by default to make logging faster
    const defaultStatuses: Record<number, "Present" | "Absent" | "Excused"> = {};
    members.forEach(m => {
      // Don't pre-register inactive players
      if (m.status !== "Inactive") {
        defaultStatuses[m.id] = "Present";
      } else {
        defaultStatuses[m.id] = "Absent";
      }
    });
    setMemberStatuses(defaultStatuses);
    setShowFormModal(true);
  };

  const openEditForm = async (session: AttendanceSession) => {
    try {
      setLoadingInspect(true);
      const details = await api.getSessionDetails(session.id);
      setEditingSession(session);
      setTitle(details.session.title);
      setDate(details.session.date);
      setNotes(details.session.notes || "");

      const mappedStatuses: Record<number, "Present" | "Absent" | "Excused"> = {};
      details.records.forEach(r => {
        mappedStatuses[r.member_id] = r.status || "Absent";
      });
      // Handle members missing in historical registers
      members.forEach(m => {
        if (!mappedStatuses[m.id]) {
          mappedStatuses[m.id] = "Absent";
        }
      });

      setMemberStatuses(mappedStatuses);
      setShowFormModal(true);
    } catch (err: any) {
      alert("Error loading logs for editing: " + err.message);
    } finally {
      setLoadingInspect(false);
    }
  };

  const inspectLogs = async (id: number) => {
    try {
      setLoadingInspect(true);
      const details = await api.getSessionDetails(id);
      setInspectSession(details);
    } catch (err: any) {
      alert("Error calling records database: " + err.message);
    } finally {
      setLoadingInspect(false);
    }
  };

  const setStatusForMember = (memberId: number, status: "Present" | "Absent" | "Excused") => {
    setMemberStatuses(prev => ({
      ...prev,
      [memberId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert("Service Title and Date are required.");
      return;
    }

    const payload = {
      title,
      date,
      notes: notes.trim() || null,
      records: memberStatuses
    };

    try {
      if (editingSession) {
        await api.updateSession(editingSession.id, payload);
      } else {
        await api.addSession(payload);
      }
      setShowFormModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Logging attendance failed: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteSession(id);
      setDeletingId(null);
      if (inspectSession?.session.id === id) {
        setInspectSession(null);
      }
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Removal of session failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2.5xl font-bold tracking-tight text-[#2D3E50] uppercase">Attendance Registrar</h1>
          <p className="text-sm font-normal text-[#636E72]">
            Sign off member registers, view Sunday attendance metrics, and map community ratios.
          </p>
        </div>
      {isAdmin && (
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D3E50] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#1e2a36] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
        >
          <Plus className="h-4 w-4" />
          <span>Take Roll Call</span>
        </button>
      )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <p className="mt-3 text-xs text-[#A0A0A0] font-semibold uppercase tracking-wider">Assembling registrar logs...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-6 text-center">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* List of past logged registrar sessions */}
          <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm overflow-hidden flex flex-col h-fit font-sans">
            <div className="border-b bg-[#F5F2ED]/80 border-[#E5E1D8] px-5 py-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#636E72] uppercase tracking-[0.15em] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#A0A0A0]" />
                <span>Attendance Logs Session</span>
              </span>
              <span className="bg-[#E5E1D8] text-[#2D3E50] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {sessions.length} recorded
              </span>
            </div>
            
            <div className="divide-y divide-[#F5F2ED] max-h-[72vh] overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-16 text-xs text-[#A0A0A0] font-medium">
                  No attendance session records saved. Use the button to take roll call!
                </div>
              ) : (
                sessions.map(s => {
                  const hasStats = s.total_count && s.total_count > 0;
                  const ratio = hasStats ? Math.round(((s.present_count || 0) / (s.total_count || 1)) * 100) : 0;

                  return (
                    <div key={s.id} className="group p-4 flex items-center justify-between hover:bg-[#F5F2ED]/30 transition">
                      <div className="mr-3 overflow-hidden">
                        <span className="text-[10px] font-bold text-[#C5A059] uppercase flex items-center gap-1.5 tracking-wider font-sans">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(s.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                        </span>
                        <h3 className="font-display font-medium text-sm text-[#2D3E50] truncate mt-1 leading-tight">
                          {s.title}
                        </h3>
                        {s.notes && (
                          <p className="text-[10px] text-[#636E72] truncate mt-0.5 max-w-[280px]">
                            {s.notes}
                          </p>
                        )}
                      </div>

                      {/* Stats and buttons */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {hasStats && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#2D3436] tracking-tight block">
                              {s.present_count} / {s.total_count} Present
                            </span>
                            <span className={`text-[10px] font-bold block mt-0.5 uppercase tracking-wide ${
                              ratio >= 80 ? "text-[#C5A059]" :
                              ratio >= 50 ? "text-amber-600" :
                              "text-rose-600"
                            }`}>
                              {ratio}% Turnout
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 select-none">
                          <button
                            onClick={() => inspectLogs(s.id)}
                            className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-100 text-neutral-500 transition"
                            title="Inspect Sheet"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditForm(s)}
                                className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-cyan-600 transition"
                                title="Edit Roll Call"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingId(s.id)}
                                className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 transition"
                                title="Delete Log"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Inspection View Panel */}
          <div className="rounded-2xl border border-neutral-150 bg-white shadow-sm overflow-hidden">
            {loadingInspect ? (
              <div className="py-24 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent"></div>
                <p className="mt-2 text-xs text-neutral-400">Inspecting database logs...</p>
              </div>
            ) : inspectSession ? (
              <div className="flex flex-col h-full">
                {/* Header info */}
                <div className="p-5 border-b bg-neutral-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Roster Register Inspect</span>
                  <h2 className="font-display font-bold text-base text-[#2D3E50] mt-1">{inspectSession.session.title}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Service conducted on {new Date(inspectSession.session.date).toLocaleDateString("en-US", { dateStyle: "full" })}
                  </p>
                  
                  {inspectSession.session.notes && (
                    <div className="mt-4 p-3.5 bg-neutral-50 border border-[#E5E1D8] rounded-xl text-[#2D3E50]/80 leading-relaxed italic text-xs">
                      {inspectSession.session.notes}
                    </div>
                  )}
                </div>

                {/* Listing */}
                <div className="p-5 overflow-y-auto max-h-[50vh] divide-y divide-neutral-100">
                  {inspectSession.records.map((r, i) => {
                    const statusColors: Record<string, string> = {
                      Present: "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30",
                      Absent: "bg-rose-50 text-rose-700 border-rose-100",
                      Excused: "bg-amber-50 text-amber-700 border-amber-100",
                    };

                    return (
                      <div key={i} className="flex items-center justify-between py-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-[10px] text-neutral-500">
                            {r.first_name[0]}{r.last_name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-800 block">{r.first_name} {r.last_name}</span>
                            <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold">{r.member_status}</span>
                          </div>
                        </div>

                        <span className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${statusColors[r.status]}`}>
                          {r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                <FileText className="h-10 w-10 text-neutral-300" />
                <h3 className="font-display text-sm font-bold text-neutral-400 mt-4">Inspect Roll Records</h3>
                <p className="mt-1 text-xs text-neutral-400 max-w-xs font-medium">
                  Click the inspect eye icon ( <Eye className="h-3 w-3 inline" /> ) on any past log to review absolute congregant presence records and turnouts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC ROLL CALL SHEETS MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3.5">
                <div>
                  <h2 className="font-display text-base font-bold text-neutral-900">
                    {editingSession ? "Modify Attendance Sign-Off" : "Roll Call Sign-Off Register"}
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Database Write Lock</p>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-650 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Meta details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Service or Event Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sunday Morning Worship"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Service Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                </div>

                {/* Sermon / Assembly notes */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Assembly Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Sermon keywords, pastoral notes list, or climatic restraints..."
                    className="w-full rounded-xl bg-neutral-50/70 border border-[#E5E1D8] p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition resize-none"
                  />
                </div>

                {/* Roll sheets listing */}
                <div className="space-y-1.5 border-t border-[#E5E1D8] pt-3">
                  <label className="block font-bold text-[#636E72] mb-2">Congregant Presence Log</label>
                  
                  {members.length === 0 ? (
                    <p className="text-xs text-[#A0A0A0] italic py-4">No members registered in database directories yet.</p>
                  ) : (
                    <div className="max-h-[35vh] overflow-y-auto divide-y divide-neutral-100 pr-1 border border-[#E5E1D8] rounded-xl bg-[#FDFCF8] p-2">
                      {members.map(m => {
                        const activeStatus = memberStatuses[m.id] || "Absent";

                        return (
                          <div key={m.id} className="flex items-center justify-between py-2.5">
                            <div className="flex items-center gap-2 max-w-[200px] truncate">
                              <div className="h-6.5 w-6.5 rounded-full bg-[#E5E1D8] flex items-center justify-center font-bold text-[9px] text-[#2D3E50] flex-shrink-0">
                                {m.first_name[0]}{m.last_name[0]}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-[#2D3E50] text-[11px] block truncate">{m.first_name} {m.last_name}</span>
                                <span className="text-[9px] text-[#636E72] block mt-0.5">{m.status}</span>
                              </div>
                            </div>

                            {/* Options Radio row */}
                            <div className="flex items-center gap-1.5 border border-[#E5E1D8] rounded-lg bg-white p-1">
                              {[
                                { val: "Present", color: "text-[#C5A059] bg-[#C5A059]/10 hover:bg-[#C5A059]/20 border-[#C5A059]/30" },
                                { val: "Absent", color: "text-rose-700 bg-rose-50 hover:bg-rose-105 border-rose-100" },
                                { val: "Excused", color: "text-amber-700 bg-amber-50 hover:bg-amber-100/70 border-amber-100" }
                              ].map(opt => {
                                const selected = activeStatus === opt.val;
                                return (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setStatusForMember(m.id, opt.val as any)}
                                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition cursor-pointer select-none ${
                                      selected ? opt.color : "bg-transparent text-neutral-400 hover:text-neutral-650 border-transparent"
                                    }`}
                                  >
                                    {opt.val}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Form controls */}
                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-[#2D3E50] transition cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] px-5 font-bold uppercase tracking-wider text-[#C5A059] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
                  >
                    Post Attendance Sheet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-neutral-150 text-center text-xs"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 font-sans">Delete attendance log?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-semibold">
                Deleting this log will permanently erase all turning values, statistics, and presence checkboxes associated with this specific date on the database.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-bold transition cursor-pointer"
                >
                  No, Keep Log
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black transition cursor-pointer"
                >
                  Yes, Remove Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
