import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Ministry, Member } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  User, 
  ShieldAlert, 
  Users, 
  BookOpen, 
  Music,
  Heart,
  Smile,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MinistriesProps {
  onDataChange?: () => void;
  isAdmin?: boolean;
}

export default function Ministries({ onDataChange, isAdmin = true }: MinistriesProps) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leaderId, setLeaderId] = useState<string>("");

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // View Members assigned state
  const [viewingMembersMin, setViewingMembersMin] = useState<Ministry | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [minData, memData] = await Promise.all([
        api.getMinistries(),
        api.getMembers()
      ]);
      setMinistries(minData);
      setMembers(memData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load ministries registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setEditingMinistry(null);
    setName("");
    setDescription("");
    setLeaderId("");
    setShowFormModal(true);
  };

  const openEditForm = (min: Ministry) => {
    setEditingMinistry(min);
    setName(min.name);
    setDescription(min.description || "");
    setLeaderId(min.leader_id ? min.leader_id.toString() : "");
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      description: description.trim() || null,
      leader_id: leaderId ? parseInt(leaderId, 10) : null
    };

    try {
      if (editingMinistry) {
        await api.updateMinistry(editingMinistry.id, payload);
      } else {
        await api.addMinistry(payload);
      }
      setShowFormModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Saving ministry failed: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMinistry(id);
      setDeletingId(null);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Deleting ministry failed: " + err.message);
    }
  };

  const getMinistryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("music") || n.includes("choir") || n.includes("sing") || n.includes("worship")) {
      return Music;
    }
    if (n.includes("youth") || n.includes("children")) {
      return Smile;
    }
    if (n.includes("usher") || n.includes("welcom") || n.includes("host")) {
      return Heart;
    }
    return BookOpen;
  };

  // Find members joined in each ministry
  const getAssignedMembers = (ministryName: string) => {
    return members.filter(m => 
      m.ministries_list && m.ministries_list.split(", ").includes(ministryName)
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2.5xl font-bold tracking-tight text-[#2D3E50] uppercase">Ministries & Groups</h1>
          <p className="text-sm font-normal text-[#636E72]">
            Configure volunteer guilds, administrative structures, and groups mapped within the database.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D3E50] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#1e2a36] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
          >
            <Plus className="h-4 w-4" />
            <span>New Ministry</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <p className="mt-3 text-xs text-[#A0A0A0] font-semibold uppercase tracking-wider">Drafting ministries panels...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-6 text-center">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 py-16 text-center rounded-xl border border-[#E5E1D8] bg-white text-[#A0A0A0]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#636E72]">No groups configured</p>
              <button 
                onClick={openAddForm}
                className="mt-3 text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:underline cursor-pointer"
              >
                Create your first volunteer group now
              </button>
            </div>
          ) : (
            ministries.map((min, idx) => {
              const Icon = getMinistryIcon(min.name);
              const assigned = getAssignedMembers(min.name);

              return (
                <motion.div
                  key={min.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group flex flex-col justify-between rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] transition-all"
                >
                  <div>
                    {/* Top line with Icon and badge */}
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-[#F5F2ED] border border-[#E5E1D8] p-2 text-[#2D3E50]">
                        <Icon className="h-4 w-4 text-[#C5A059]" />
                      </div>
                      <div className="flex items-center gap-1 hover:bg-[#F5F2ED] rounded px-2.5 py-1 text-[11px] font-bold text-[#636E72] border border-[#E5E1D8] cursor-pointer transition select-none"
                           onClick={() => setViewingMembersMin(min)}>
                        <Users className="h-3 w-3 text-[#A0A0A0]" />
                        <span>{min.member_count} Members</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                      <h3 className="font-display text-base font-bold text-[#2D3E50] group-hover:text-[#C5A059] transition">
                        {min.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-normal">
                        {min.description || "No specific mission or descriptions cataloged for this team."}
                      </p>
                    </div>
                  </div>

                  {/* Leader and Action Row */}
                  <div className="mt-6 border-t border-neutral-100 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Group Leader</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="h-3 w-3 text-neutral-400" />
                        <span className="text-xs font-bold text-neutral-700">
                          {min.leader_first ? `${min.leader_first} ${min.leader_last}` : <span className="text-neutral-400 font-medium italic">Unassigned</span>}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 select-none">
                        <button
                          onClick={() => openEditForm(min)}
                          className="p-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-cyan-600 hover:border-cyan-150 hover:bg-cyan-50/20 transition cursor-pointer"
                          title="Edit Ministry"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(min.id)}
                          className="p-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-rose-600 hover:border-rose-150 hover:bg-rose-50/20 transition cursor-pointer"
                          title="Delete group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* DETAILED GROUP MEMBERS RETROSPECTIVE POPUP */}
      <AnimatePresence>
        {viewingMembersMin !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150"
            >
              <div className="flex items-center justify-between border-b pb-3.5 mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-neutral-900">{viewingMembersMin.name} Roster</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Associated Congregants</p>
                </div>
                <button
                  onClick={() => setViewingMembersMin(null)}
                  className="rounded-xl p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Roster list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {getAssignedMembers(viewingMembersMin.name).length === 0 ? (
                  <p className="py-8 text-center text-xs text-neutral-400 italic">No members signed up to this ministry yet.</p>
                ) : (
                  getAssignedMembers(viewingMembersMin.name).map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-150 hover:bg-neutral-50/70 transition text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-neutral-100 text-neutral-500 font-semibold flex items-center justify-center">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-800 block">{m.first_name} {m.last_name}</span>
                          <span className="text-[10px] text-neutral-450">{m.email || "No email"}</span>
                        </div>
                      </div>
                      {/* Badge if group leader */}
                      {viewingMembersMin.leader_id === m.id ? (
                        <span className="bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          Group Leader
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-semibold">{m.status}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingMembersMin(null)}
                  className="min-w-[80px] h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT MINISTRY FORM MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h2 className="font-display text-base font-bold text-neutral-900">
                  {editingMinistry ? "Modify Ministry Group" : "Create New Ministry"}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                {/* Ministry title */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Ministry Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Media & Broadcast Guild"
                    className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Mission / Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe their spiritual missions or general scheduling logistics..."
                    className="w-full rounded-xl bg-neutral-50/70 border border-[#E5E1D8] p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition resize-none"
                  />
                </div>

                {/* Leader Selector drop down */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Assigned Leader (optional)</label>
                  <select
                    value={leaderId}
                    onChange={(e) => setLeaderId(e.target.value)}
                    className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                  >
                    <option value="">-- No leader appointed --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name} ({m.family_role} • {m.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-[#2D3E50] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] px-5 font-bold uppercase tracking-wider text-[#C5A059] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
                  >
                    Save Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
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
              <h3 className="font-display text-base font-bold text-neutral-900 font-sans">Delete group from records?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-semibold">
                This will unbind all active member associations from this group. Existing members' profiles will remain, but links to this team are permanently erased.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-bold transition cursor-pointer"
                >
                  No, Keep Group
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black transition cursor-pointer"
                >
                  Yes, Erase Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
