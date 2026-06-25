import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Member, Ministry, Contribution, Branch, CellGroup } from "../types";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Eye, 
  X, 
  ShieldAlert,
  User,
  UploadCloud,
  FileText,
  Phone, 
  Mail, 
  Calendar,
  Layers,
  HeartHandshake,
  DollarSign,
  FileSpreadsheet,
  MapPin,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadCSV } from "../utils/exporter";

interface MembersProps {
  onDataChange?: () => void;
  selectedMemberId?: number | null;
  onClearSelectedMember?: () => void;
  isAdmin?: boolean;
  canExport?: boolean;
}

export default function Members({ onDataChange, selectedMemberId, onClearSelectedMember, isAdmin = true, canExport = false }: MembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [cellGroupFilter, setCellGroupFilter] = useState("All");
  const [ministryFilter, setMinistryFilter] = useState("All");
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Selected Member Details Modal
  const [detailsMember, setDetailsMember] = useState<(Member & { ministries: Ministry[]; contributions: Contribution[] }) | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form Fields State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Visitor">("Active");
  const [gender, setGender] = useState<string>("Male");
  const [familyRole, setFamilyRole] = useState<"Head" | "Spouse" | "Child" | "Single">("Single");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedMinistries, setSelectedMinistries] = useState<number[]>([]);
  const [branchId, setBranchId] = useState("");
  const [cellGroupId, setCellGroupId] = useState("");

  // Delete Confirm Dialog state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, ministriesData, branchesData, cellsData] = await Promise.all([
        api.getMembers(),
        api.getMinistries(),
        api.getBranches(),
        api.getCellGroups()
      ]);
      setMembers(membersData);
      setMinistries(ministriesData);
      setBranches(branchesData);
      setCellGroups(cellsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for external trigger from dashboard navigation (selectedMemberId prop)
  useEffect(() => {
    if (selectedMemberId != null) {
      viewDetails(selectedMemberId);
    }
  }, [selectedMemberId]);

  const viewDetails = async (id: number) => {
    try {
      setLoadingDetails(true);
      const data = await api.getMember(id);
      setDetailsMember(data);
    } catch (err: any) {
      alert("Error loading member details: " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsMember(null);
    if (onClearSelectedMember) {
      onClearSelectedMember();
    }
  };

  const openAddForm = () => {
    setEditingMember(null);
    setFirstName("");
    setLastName("");
    setTitle("");
    setEmail("");
    setPhone("");
    setJoinDate(new Date().toISOString().split("T")[0]);
    setStatus("Active");
    setGender("Male");
    setFamilyRole("Single");
    setBirthDate("");
    setNotes("");
    setSelectedMinistries([]);
    setBranchId("");
    setCellGroupId("");
    setShowFormModal(true);
  };

  const openEditForm = (member: Member) => {
    // Need to fetch individual member details to see their mapped ministry IDs
    setEditingMember(member);
    setFirstName(member.first_name);
    setLastName(member.last_name);
    setTitle((member as any).title || "");
    setEmail(member.email || "");
    setPhone(member.phone || "");
    setJoinDate(member.join_date);
    setStatus(member.status);
    setGender(member.gender || "Male");
    setFamilyRole(member.family_role);
    setBirthDate(member.birth_date || "");
    setNotes(member.notes || "");
    setBranchId(member.branch_id?.toString() || "");
    setCellGroupId(member.cell_group_id?.toString() || "");
    
    // Fetch individual mapped ministries to prep checkboxes
    api.getMember(member.id).then(res => {
      setSelectedMinistries(res.ministries.map(m => m.id));
      setShowFormModal(true);
    }).catch(err => {
      setSelectedMinistries([]);
      setShowFormModal(true);
    });
  };

  const toggleMinistryChecked = (id: number) => {
    setSelectedMinistries(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !joinDate) {
      alert("First Name, Last Name, and Join Date are required.");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      title: title.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      join_date: joinDate,
      status,
      gender: gender as any,
      family_role: familyRole,
      birth_date: birthDate || null,
      notes: notes.trim() || null,
      ministry_ids: selectedMinistries,
      branch_id: branchId ? parseInt(branchId, 10) : null,
      cell_group_id: cellGroupId ? parseInt(cellGroupId, 10) : null
    };

    try {
      if (editingMember) {
        await api.updateMember(editingMember.id, payload);
      } else {
        await api.addMember(payload);
      }
      setShowFormModal(false);
      loadData();
      if (onDataChange) onDataChange();
      // If editing details member, refresh details modal
      if (detailsMember && editingMember && detailsMember.id === editingMember.id) {
        viewDetails(editingMember.id);
      }
    } catch (err: any) {
      alert("Saving member failed: " + err.message);
      console.error("Saving member failed:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMember(id);
      setDeletingId(null);
      if (detailsMember?.id === id) {
        setDetailsMember(null);
      }
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Deletion failed: " + err.message);
      console.error("Deletion failed:", err);
    }
  };

  // Process filters
  const filteredMembers = members.filter(m => {
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || 
      (m.email && m.email.toLowerCase().includes(query)) ||
      (m.phone && m.phone.includes(query));

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    
    const matchesMinistry = ministryFilter === "All" || 
      (m.ministries_list && m.ministries_list.split(", ").includes(ministryFilter));
    
    const matchesBranch = branchFilter === "All" || 
      (m.branch_id && m.branch_id.toString() === branchFilter);

    const matchesCellGroup = cellGroupFilter === "All" ||
      (m.cell_group_id && m.cell_group_id.toString() === cellGroupFilter);

    return matchesSearch && matchesStatus && matchesMinistry && matchesBranch && matchesCellGroup;
  });

  const toggleSelectMember = (id: number) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(memberId => memberId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedMemberIds.length === 0) {
      alert("No members selected for deletion.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedMemberIds.length} selected members? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteMembersBulk(selectedMemberIds);
      setSelectedMemberIds([]);
      setSelectAll(false);
      loadData();
      if (onDataChange) onDataChange();
      alert(`${selectedMemberIds.length} members deleted successfully.`);
    } catch (err: any) {
      alert("Bulk deletion failed: " + err.message);
      console.error("Bulk deletion failed:", err);
    }
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setImportMessage("Please select a CSV file to upload.");
      return;
    }
    setImportMessage("Uploading and importing members...");
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const response = await api.importMembersCsv(formData); // Assuming api.ts handles FormData
      setImportMessage(response.message || "Import successful!");
      setShowImportModal(false);
      loadData();
    } catch (err: any) {
      setImportMessage("Import failed: " + (err.message || "Unknown error"));
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID", "First Name", "Last Name", "Email", "Phone", "Join Date", 
      "Status", "Family Role", "Registered Ministries", "Birth Date", "Notes"
    ];
    downloadCSV(filteredMembers, headers, "GIMK-Congregant-Directory");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2.5xl font-bold tracking-tight text-[#2D3E50] uppercase">Congregant Directory</h1>
          <p className="text-sm font-normal text-[#636E72]">
            Database records for church fellowship active members, visitors, and ministry associations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <button
              onClick={handleExportCSV}
              disabled={filteredMembers.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 transition cursor-pointer"
              title="Export list to CSV format"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
              title="Import members from CSV file"
            >
              <UploadCloud className="h-4 w-4 text-blue-600" />
              <span>Import CSV</span>
            </button>
          )}

          {isAdmin && selectedMemberIds.length > 0 && (
            <button onClick={handleDeleteSelected} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-600 transition cursor-pointer shadow-sm shadow-rose-500/15">
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedMemberIds.length})</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D3E50] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#1e2a36] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Member</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <p className="mt-3 text-xs text-[#A0A0A0] font-semibold uppercase tracking-wider">Retrieving profiles directory...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-6 text-center">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      ) : (
        <>
          {/* Filtering Tools Panel */}
          <div className="grid gap-3 rounded-xl border border-[#E5E1D8] bg-white p-4 shadow-sm min-[830px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Search Input */}
            <div className="relative min-[830px]:col-span-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#A0A0A0] pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl bg-[#F5F2ED]/50 border border-[#E5E1D8] pl-10 pr-4 text-xs font-semibold text-[#2D3436] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
              />
            </div>

            {/* Status Filter */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A0A0A0] pointer-events-none">
                  <Filter className="h-3.5 w-3.5" />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F5F2ED]/50 border border-[#E5E1D8] pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-[#636E72] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer appearance-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Ministry Filter */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A0A0A0] pointer-events-none">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <select
                  value={ministryFilter}
                  onChange={(e) => setMinistryFilter(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F5F2ED]/50 border border-[#E5E1D8] pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-[#636E72] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer appearance-none"
                >
                  <option value="All">All ministries</option>
                  {ministries.map(min => (
                    <option key={min.id} value={min.name}>{min.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A0A0A0] pointer-events-none">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F5F2ED]/50 border border-[#E5E1D8] pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-[#636E72] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer appearance-none"
                >
                  <option value="All">All branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id.toString()}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cell Group Filter */}
            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#A0A0A0] pointer-events-none">
                  <Home className="h-3.5 w-3.5" />
                </span>
                <select
                  value={cellGroupFilter}
                  onChange={(e) => setCellGroupFilter(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F5F2ED]/50 border border-[#E5E1D8] pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-[#636E72] focus:outline-none focus:border-[#C5A059] focus:bg-white transition cursor-pointer appearance-none"
                >
                  <option value="All">All cell groups</option>
                  {cellGroups.map(cg => (
                    <option key={cg.id} value={cg.id.toString()}>{cg.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-hidden rounded-xl border border-[#E5E1D8] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F2ED]/80 border-b border-[#E5E1D8] text-[10px] font-bold uppercase tracking-widest text-[#636E72]">
                    {isAdmin && (
                      <th className="py-4 px-3">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
                      </th>)}
                    <th className="py-4 px-6">Reg No.</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-4">Contact Info</th>
                    <th className="py-4 px-4">Ministries</th>
                    <th className="py-4 px-4">Affiliation</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2ED] text-xs">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-neutral-400">
                        No member records match the active criteria filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const statusColors: Record<string, string> = {
                        Active: "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20",
                        Inactive: "bg-[#F5F2ED] text-[#636E72] border-[#E5E1D8]",
                        Visitor: "bg-[#2D3E50]/10 text-[#2D3E50] border-[#2D3E50]/20",
                      };

                      return (
                        <tr key={m.id} className="hover:bg-neutral-50/50 transition duration-150">
                          {isAdmin && (
                            <td className="py-4 px-3">
                              <input
                                type="checkbox"
                                checked={selectedMemberIds.includes(m.id)}
                                onChange={() => toggleSelectMember(m.id)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
                            </td>)}
                          {/* Registration Number */}
                          <td className="py-4 px-6">
                            {(m as any).registration_number ? (
                              <span className="font-mono font-bold text-[#2D3E50] bg-[#F5F2ED] px-2 py-1 rounded border border-[#E5E1D8] text-[10px]">
                                {(m as any).registration_number}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-400 italic">Unregistered</span>
                            )}
                          </td>
                          {/* Name + Joined Date */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] font-bold text-xs flex-shrink-0">
                                {m.first_name[0]}{m.last_name[0]}
                              </div>
                              <div>
                                <span className="font-bold text-neutral-800 leading-tight block">
                                  {m.first_name} {m.last_name}
                                </span>
                                {(m as any).title && (
                                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest block">
                                    {(m as any).title}
                                  </span>
                                )}
                                <span className="text-[10px] font-medium text-neutral-400 block mt-0.5">
                                  Enrolled {new Date(m.join_date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              {m.email ? (
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <Mail className="h-3 w-3 text-neutral-400" />
                                  <span>{m.email}</span>
                                </div>
                              ) : null}
                              {m.phone ? (
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <Phone className="h-3 w-3 text-neutral-400" />
                                  <span>{m.phone}</span>
                                </div>
                              ) : null}
                              {!m.email && !m.phone ? <span className="text-neutral-400 font-sans italic">None</span> : null}
                            </div>
                          </td>

                          {/* Ministries */}
                          <td className="py-4 px-4">
                            {m.ministries_list ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {m.ministries_list.split(", ").map(minName => (
                                  <span key={minName} className="inline-block bg-neutral-100 rounded px-2 py-0.5 text-[10px] font-semibold text-neutral-600 border border-neutral-200 truncate max-w-[120px]">
                                    {minName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">None</span>
                            )}
                          </td>

                          {/* Branch/Cell Affiliation */}
                          <td className="py-4 px-4">
                            <div className="text-[10px] font-bold text-[#2D3E50]">{m.branch_name || "—"}</div>
                            <div className="text-[9px] text-emerald-600 font-semibold">{m.cell_group_name || ""}</div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColors[m.status]}`}>
                              {m.status}
                            </span>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-4 font-semibold text-neutral-600">
                            {m.family_role}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 select-none">
                              <button
                                onClick={() => viewDetails(m.id)}
                                className="p-1 px-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 hover:text-neutral-800 text-neutral-500 transition inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => openEditForm(m)}
                                    className="p-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-cyan-600 hover:border-cyan-100 hover:bg-cyan-50/50 transition cursor-pointer"
                                    title="Edit Record"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(m.id)}
                                    className="p-1.5 border border-neutral-200 rounded-lg text-neutral-400 hover:text-rose-600 hover:border-rose-150 hover:bg-rose-50/50 transition cursor-pointer"
                                    title="Delete Profile"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Total Footer stat */}
            <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-3.5 flex items-center justify-between text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              <span>Catalog Index</span>
              <span>Showing {filteredMembers.length} of {members.length} records</span>
            </div>
          </div>
        </>
      )}

      {/* RENDER DETAILED PROFILES MODAL */}
      <AnimatePresence>
        {detailsMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseDetails}
                className="absolute right-4 top-4 rounded-xl p-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] text-base font-bold font-display">
                  {detailsMember.first_name[0]}{detailsMember.last_name[0]}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-[#2D3E50] leading-tight">
                    {detailsMember.first_name} {detailsMember.last_name}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-2 items-center text-xs">
                    <span className="font-semibold text-[#A0A0A0]">ID: #{detailsMember.id}</span>
                    <span className="h-1.5 w-1.5 bg-neutral-300 rounded-full"></span>
                    <span className="font-semibold bg-[#F5F2ED] text-[#636E72] px-2.5 py-0.5 rounded border border-[#E5E1D8]">
                      {detailsMember.family_role}
                    </span>
                    <span className="h-1.5 w-1.5 bg-neutral-300 rounded-full"></span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[10px] ${
                      detailsMember.status === "Active" ? "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30" :
                      detailsMember.status === "Visitor" ? "bg-[#2D3E50]/10 text-[#2D3E50] border-[#2D3E50]/20" :
                      "bg-[#F5F2ED] text-[#636E72] border-[#E5E1D8]"
                    }`}>
                      {detailsMember.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data panels */}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <div className="space-y-4 rounded-xl bg-neutral-50 p-4 border border-neutral-150">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>Profile Registry</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-neutral-400">Email Address</span>
                      <span className="font-bold text-neutral-700 truncate max-w-[180px]">{detailsMember.email || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-neutral-400">Phone Number</span>
                      <span className="font-bold text-neutral-700">{detailsMember.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-neutral-400">Gender Identity</span>
                      <span className="font-bold text-neutral-700">{detailsMember.gender || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-neutral-400">Date of Birth</span>
                      <span className="font-bold text-neutral-700">
                        {detailsMember.birth_date ? new Date(detailsMember.birth_date).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-400">Enrolled Date</span>
                      <span className="font-bold text-neutral-700 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-400" />
                        {new Date(detailsMember.join_date).toLocaleDateString("en-US", { dateStyle: "long" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cabinet of Ministry Mappings */}
                <div className="space-y-4 rounded-xl bg-neutral-50 p-4 border border-neutral-150">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    <span>Ministry Roles</span>
                  </h3>
                  {detailsMember.ministries.length === 0 ? (
                    <p className="text-xs italic text-neutral-400 py-3">This member is not associated with any active ministries.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailsMember.ministries.map(min => (
                        <div key={min.id} className="rounded-lg bg-white border border-neutral-200 px-3 py-2 text-xs">
                          <span className="font-bold text-neutral-800 block">{min.name}</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{min.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Ledger contribution history in Modal */}
              <div className="mt-6 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Contribution History</span>
                </h3>
                {detailsMember.contributions.length === 0 ? (
                  <p className="text-xs italic text-neutral-400 py-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/55 p-4 text-center">
                    No donations or offering registrations mapped inside the database ledger.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
                    {detailsMember.contributions.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 text-xs">
                        <div>
                          <span className="font-bold text-neutral-700 block">{c.type}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {new Date(c.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                          </span>
                        </div>
                        <span className="font-display font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 text-[10px]">
                          + {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(c.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio Notes */}
              {detailsMember.notes ? (
                <div className="mt-6 border-t border-neutral-100 pt-4 text-xs space-y-1.5">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">Enroller Biographic Notes</span>
                  <p className="text-neutral-600 bg-amber-50/40 p-3.5 border border-amber-100/50 rounded-xl leading-relaxed italic">
                    {detailsMember.notes}
                  </p>
                </div>
              ) : null}

              {/* Bottom Quick Bar Actions */}
              <div className="mt-8 flex gap-3 justify-end border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseDetails();
                    openEditForm(detailsMember);
                  }}
                  className="rounded-xl border border-neutral-250 bg-neutral-50 hover:bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 transition cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="rounded-xl bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SAVING / ENROLLMENT FORM MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <h2 className="font-display text-lg font-bold text-neutral-900">
                  {editingMember ? "Modify Member Profile" : "Enroll New Congregant"}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
                {/* Row 1: Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Thomas"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Andrews"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Leader Title (Pastoral / Church role)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Apostle, Pastor, Deacon"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold text-[#C5A059] transition uppercase tracking-wider"
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. thomas@mail.com"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 555-0192"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                </div>

                {/* Row 3: Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Join Fellowship Date *</label>
                    <input
                      type="date"
                      required
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                    />
                  </div>
                </div>

                {/* Row: Branch & Cell Group */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Affiliated Branch</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#636E72] cursor-pointer transition"
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Home Cell Group</label>
                    <select
                      value={cellGroupId}
                      onChange={(e) => setCellGroupId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#636E72] cursor-pointer transition"
                    >
                      <option value="">-- Select Cell Group --</option>
                      {cellGroups.map(cg => <option key={cg.id} value={cg.id}>{cg.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Status / Gender / Family */}
                <div className="grid gap-4 min-[560px]:grid-cols-3">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Status Enrolled</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                    >
                      <option value="Active">Active Profile</option>
                      <option value="Visitor">Visitor Guest</option>
                      <option value="Inactive">Inactive Profile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Gender Identification</label>
                    <select
                      value={gender || "Male"}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Family Role</label>
                    <select
                      value={familyRole}
                      onChange={(e) => setFamilyRole(e.target.value as any)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                    >
                      <option value="Single">Single</option>
                      <option value="Head">Head of Family</option>
                      <option value="Spouse">Spouse Partner</option>
                      <option value="Child">Chamber Child</option>
                    </select>
                  </div>
                </div>

                {/* Ministry Checkboxes mapping selector */}
                <div className="space-y-2 border-t border-[#E5E1D8] pt-2.5">
                  <label className="block font-bold text-[#636E72]">Assign to Active Ministry / Volunteers groups</label>
                  {ministries.length === 0 ? (
                    <p className="italic text-[#A0A0A0]">No ministries recorded to link. Create ministries in the next tab.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 max-h-32 overflow-y-auto p-2 bg-[#F5F2ED]/50 rounded-xl border border-[#E5E1D8]">
                      {ministries.map(min => (
                        <label key={min.id} className="flex items-center gap-2.5 p-1.5 cursor-pointer select-none">
                           <input
                             type="checkbox"
                             checked={selectedMinistries.includes(min.id)}
                             onChange={() => toggleMinistryChecked(min.id)}
                             className="h-4 w-4 rounded-md text-[#C5A059] border-[#E5E1D8] focus:ring-[#C5A059] cursor-pointer"
                           />
                           <span className="font-bold text-[#636E72]">{min.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Biographic Notes */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Registry Biographic Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide comments, health parameters, or enrollment history notes..."
                    className="w-full rounded-xl bg-neutral-50/70 border border-[#E5E1D8] p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition resize-none"
                  />
                </div>

                {/* Confirm Button row */}
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
                    Confirm & Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETION MODAL */}
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
              <h3 className="font-display text-base font-bold text-neutral-900">Are you absolutely sure?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-medium">
                Deleting this member will also remove their associated links inside active ministries, attendance records, and history registers.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-semibold transition cursor-pointer"
                >
                  No, Keep Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deletingId;
                    if (id !== null) {
                      handleDelete(id);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition cursor-pointer"
                >
                  Yes, Remove Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
