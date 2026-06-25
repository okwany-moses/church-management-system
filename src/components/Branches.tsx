import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Branch, CellGroup } from "../types";
import { 
  Building2, 
  MapPin, 
  User, 
  Calendar, 
  Phone, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Globe, 
  Bookmark, 
  Sparkles,
  Heart,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Home,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BranchesProps {
  onDataChange?: () => void;
  isAdmin?: boolean;
}

export default function Branches({ onDataChange, isAdmin = true }: BranchesProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab control: "branches" | "cells"
  const [activeTab, setActiveTab] = useState<"branches" | "cells">("branches");

  // Modals state
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showCellModal, setShowCellModal] = useState(false);

  // Form State - Branches
  const [bName, setBName] = useState("");
  const [bLocation, setBLocation] = useState("");
  const [bPastor, setBPastor] = useState("");
  const [bDateOpened, setBDateOpened] = useState("");
  const [bContactPhone, setBContactPhone] = useState("");
  const [bMemberCount, setBMemberCount] = useState("");

  // Form State - Cell Groups
  const [cName, setCName] = useState("");
  const [cLeaderName, setCLeaderName] = useState("");
  const [cMeetingDay, setCMeetingDay] = useState("Sunday");
  const [cMeetingTime, setCMeetingTime] = useState("");
  const [cLocationDetails, setCLocationDetails] = useState("");
  const [cMembersCount, setCMembersCount] = useState("");

  // Search filter
  const [branchSearch, setBranchSearch] = useState("");
  const [cellSearch, setCellSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [bData, cData] = await Promise.all([
        api.getBranches(),
        api.getCellGroups()
      ]);
      setBranches(bData);
      setCellGroups(cData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve directory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !bLocation.trim() || !bPastor.trim()) {
      alert("Name, location, and pastor names are required.");
      return;
    }

    const payload = {
      name: bName.trim(),
      location: bLocation.trim(),
      pastor: bPastor.trim(),
      date_opened: bDateOpened || new Date().toISOString().split("T")[0],
      contact_phone: bContactPhone.trim() || null,
      member_count: bMemberCount ? parseInt(bMemberCount, 10) : 0
    };

    try {
      await api.addBranch(payload);
      setShowBranchModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to insert branch: " + err.message);
    }
  };

  const handleCellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cLeaderName.trim() || !cLocationDetails.trim()) {
      alert("Cell group name, leader, and meeting location details are required.");
      return;
    }

    const payload = {
      name: cName.trim(),
      leader_name: cLeaderName.trim(),
      meeting_day: cMeetingDay,
      meeting_time: cMeetingTime || "17:00",
      location_details: cLocationDetails.trim(),
      members_count: cMembersCount ? parseInt(cMembersCount, 10) : 0
    };

    try {
      await api.addCellGroup(payload);
      setShowCellModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to save cell group: " + err.message);
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (id === 1) {
      alert("Headquarters Ramba-Kabondo Branch is the heart of the system and cannot be deleted.");
      return;
    }
    if (!confirm("Are you sure you want to shut down or delete this branch registration?")) return;
    try {
      await api.deleteBranch(id);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Error removing branch: " + err.message);
    }
  };

  const handleDeleteCell = async (id: number) => {
    if (!confirm("Are you sure you want to remove this home cell fellowship?")) return;
    try {
      await api.deleteCellGroup(id);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Error removing cell group: " + err.message);
    }
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(branchSearch.toLowerCase()) || 
    b.location.toLowerCase().includes(branchSearch.toLowerCase()) || 
    b.pastor.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredCells = cellGroups.filter(c => 
    c.name.toLowerCase().includes(cellSearch.toLowerCase()) || 
    c.leader_name.toLowerCase().includes(cellSearch.toLowerCase()) || 
    c.location_details.toLowerCase().includes(cellSearch.toLowerCase())
  );

  // Headquarters coordinates
  const hqBranch = branches.find(b => b.id === 1);
  const totalBranchMembers = branches.reduce((sum, b) => sum + b.member_count, 0);

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E1D8] pb-5">
        <div>
          <h1 className="font-display font-black text-2xl text-[#2D3E50] tracking-tight uppercase flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#C5A059]" />
            Branches & Fellowships
          </h1>
          <p className="text-xs text-[#636E72] font-semibold mt-1">
            Configure newly established church branches and home cell groups managed from the Ramba-Kabondo Headquarters, Kenya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            activeTab === "branches" ? (
              <button
                onClick={() => {
                  setBName("");
                  setBLocation("");
                  setBPastor("");
                  setBDateOpened(new Date().toISOString().split("T")[0]);
                  setBContactPhone("");
                  setBMemberCount("");
                  setShowBranchModal(true);
                }}
                className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] px-4 font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-2 transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
              >
                <Plus className="h-4 w-4" />
                Establish New Branch
              </button>
            ) : (
              <button
                onClick={() => {
                  setCName("");
                  setCLeaderName("");
                  setCMeetingDay("Sunday");
                  setCMeetingTime("17:00");
                  setCLocationDetails("");
                  setCMembersCount("");
                  setShowCellModal(true);
                }}
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 font-bold uppercase tracking-wider text-white flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Register HQ Home Cell Group
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E1D8]">
        <button
          onClick={() => setActiveTab("branches")}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer flex items-center gap-2 ${
            activeTab === "branches"
              ? "border-[#2D3E50] text-[#2D3E50]"
              : "border-transparent text-[#636E72] hover:text-[#2D3E50]"
          }`}
        >
          <Globe className="h-4 w-4 text-[#C5A059]" />
          Regional Branch Registry ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab("cells")}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer flex items-center gap-2 ${
            activeTab === "cells"
              ? "border-[#2D3E50] text-[#2D3E50]"
              : "border-transparent text-[#636E72] hover:text-[#2D3E50]"
          }`}
        >
          <Home className="h-4 w-4 text-[#10B981]" />
          HQ Ramba-Kabondo Cell Groups ({cellGroups.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#A0A0A0] font-black uppercase text-xs animate-pulse">
          Syncing branch and cell configurations from the database...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: BRANCHES */}
          {activeTab === "branches" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* HQ Highlight Summary Row */}
              {hqBranch && (
                <div className="bg-gradient-to-br from-[#FDFCF8] via-white to-amber-50/20 border-2 border-[#C5A059] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute right-4 top-4 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200/50">
                    Central Executive Headquarters
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-rose-600 font-bold uppercase tracking-widest text-[9px] mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Global Mother Church
                    </div>
                    <h2 className="text-xl font-black font-display text-[#2D3E50] uppercase mt-1">
                      {hqBranch.name}
                    </h2>
                    <p className="text-[11px] text-[#636E72] font-semibold mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                      Location: Ramba, Kabondo District, Kenya
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-neutral-500 font-bold">
                      <span className="bg-[#2D3E50]/5 px-3 py-1.5 rounded-lg border border-[#2D3E50]/10 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#C5A059]" />
                        Overseer: {hqBranch.pastor}
                      </span>
                      <span className="bg-[#2D3E50]/5 px-3 py-1.5 rounded-lg border border-[#2D3E50]/10 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        HQ Members: {hqBranch.member_count}
                      </span>
                      <span className="bg-[#2D3E50]/5 px-3 py-1.5 rounded-lg border border-[#2D3E50]/10 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        Established: {hqBranch.date_opened}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#2D3E50] text-[#C5A059] p-4 rounded-xl border border-[#1e2a36] text-center shrink-0 min-w-[200px]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 block">System Global Census</span>
                    <strong className="text-3xl font-black font-display block mt-1.5">{totalBranchMembers}</strong>
                    <span className="text-[9px] text-white/50 uppercase tracking-widest block mt-1">Across All Districts</span>
                  </div>
                </div>
              )}

              {/* Branched grids list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3E50]">
                    Subordinate & District Branches Directory
                  </h3>
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter other branches..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="w-full h-8.5 rounded-xl border border-[#E5E1D8] bg-[#FDFCF8] pl-9 pr-3 text-xs focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>
                </div>

                {filteredBranches.filter(b => b.id !== 1).length === 0 ? (
                  <p className="text-center italic py-10 text-[#A0A0A0] bg-white border border-[#E5E1D8] rounded-2xl">
                    No district offices or satellite branches configured other than the Headquarters.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBranches.filter(b => b.id !== 1).map(branch => (
                      <div key={branch.id} className="bg-white border border-[#E5E1D8] p-5 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="bg-blue-50 text-blue-800 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-blue-100">
                              District Office
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="text-neutral-400 hover:text-rose-600 p-1.5 hover:bg-neutral-50 rounded-lg transition"
                                title="Delete Branch registration"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          
                          <h4 className="text-sm font-black text-[#2D3E50] uppercase mt-2.5">
                            {branch.name}
                          </h4>
                          
                          <p className="mt-2 text-neutral-500 font-semibold flex items-center gap-1.5 text-[10px]">
                            <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                            {branch.location}
                          </p>

                          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2 text-[10px] text-neutral-600 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-neutral-400" />
                              <span>Lead Pastor: <strong>{branch.pastor}</strong></span>
                            </div>
                            {branch.contact_phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Phone: {branch.contact_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold text-[#636E72]">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            Census: {branch.member_count} members
                          </span>
                          <span className="text-neutral-400 font-normal">Est: {branch.date_opened}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: CELL GROUPS */}
          {activeTab === "cells" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Explanation note */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 text-emerald-900 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3 max-w-2xl">
                  <Bookmark className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-emerald-950 text-xs block">Ramba HQ Home Cell Network</strong>
                    <span className="text-[10px] text-emerald-800 font-semibold mt-1 block leading-relaxed">
                      Small-group fellowships meeting weekly across the Ramba-Kabondo Headquarters parish district. These neighborhood units bolster local discipleship, outreach, and pastorate care under HQ overseer.
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    Sovereign HQ System
                  </span>
                </div>
              </div>

              {/* Cell group directory */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3E50]">
                    Active Discipleship Home Cells
                  </h3>
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search cells, leaders..."
                      value={cellSearch}
                      onChange={(e) => setCellSearch(e.target.value)}
                      className="w-full h-8.5 rounded-xl border border-[#E5E1D8] bg-[#FDFCF8] pl-9 pr-3 text-xs focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                    />
                  </div>
                </div>

                {filteredCells.length === 0 ? (
                  <p className="text-center italic py-10 text-[#A0A0A0] bg-white border border-[#E5E1D8] rounded-2xl">
                    No neighborhood home cells configured under the Headquarters parish.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCells.map(cell => (
                      <div key={cell.id} className="bg-white border border-[#E5E1D8] p-5 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border border-emerald-100">
                              HQ Home Fellowship
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteCell(cell.id)}
                                className="text-neutral-400 hover:text-rose-600 p-1 hover:bg-neutral-50 rounded transition"
                                title="Delete Cell group"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-[#2D3E50] uppercase mt-2.5">
                            {cell.name}
                          </h4>

                          <p className="mt-2 text-neutral-500 font-semibold flex items-center gap-1.5 text-[10px]">
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                            {cell.location_details}
                          </p>

                          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2 text-[10px] text-neutral-600 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-neutral-400" />
                              <span>Cell Leader: <strong>{cell.leader_name}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                              <span>Meets: <strong className="text-[#2D3E50]">{cell.meeting_day} @ {cell.meeting_time}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] font-bold text-emerald-950">
                          <span className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            Size: {cell.members_count} participants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* BRANCH ESTABLISHMENT MODAL */}
      <AnimatePresence>
        {showBranchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-150"
            >
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3 mb-4">
                <span className="font-display font-black text-xs uppercase tracking-wider text-[#2D3E50]">Establish New Parish Branch Office</span>
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleBranchSubmit} className="space-y-4 font-sans font-semibold text-xs text-left">
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">District / Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gideons International Nairobi Branch"
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition placeholder:text-neutral-350"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Location / District Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nairobi Central Commercial District, Kenya"
                    value={bLocation}
                    onChange={(e) => setBLocation(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Assigned Pastor *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pastor John Mwangi"
                      value={bPastor}
                      onChange={(e) => setBPastor(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Inception Date *</label>
                    <input
                      type="date"
                      required
                      value={bDateOpened}
                      onChange={(e) => setBDateOpened(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition font-bold"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. +254 712 345678"
                      value={bContactPhone}
                      onChange={(e) => setBContactPhone(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Initial Member Count</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 150"
                      value={bMemberCount}
                      onChange={(e) => setBMemberCount(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] text-[#C5A059] px-5 font-bold uppercase tracking-wider transition cursor-pointer shadow-sm"
                  >
                    Establish Branch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CELL GROUP ESTABLISHMENT MODAL */}
      <AnimatePresence>
        {showCellModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-150"
            >
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3 mb-4">
                <span className="font-display font-black text-xs uppercase tracking-wider text-emerald-900">Add Headquarters Home Cell Group</span>
                <button
                  type="button"
                  onClick={() => setShowCellModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCellSubmit} className="space-y-4 font-sans font-semibold text-xs text-left">
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Home Cell Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hope Grace Cell - Kabondo East"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition placeholder:text-neutral-350"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Cell Leader Fullname *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brother Samuel Omondi"
                    value={cLeaderName}
                    onChange={(e) => setCLeaderName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Meeting Weekday *</label>
                    <select
                      value={cMeetingDay}
                      onChange={(e) => setCMeetingDay(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold transition text-neutral-600 cursor-pointer"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Meeting Time (HH:MM) *</label>
                    <input
                      type="time"
                      required
                      value={cMeetingTime}
                      onChange={(e) => setCMeetingTime(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition font-black"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Location Details / Estate *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Ramba High School Area"
                      value={cLocationDetails}
                      onChange={(e) => setCLocationDetails(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Starting Member Count</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 15"
                      value={cMembersCount}
                      onChange={(e) => setCMembersCount(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCellModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-neutral-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 font-bold uppercase tracking-wider transition cursor-pointer shadow-sm"
                  >
                    Register Cell Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
