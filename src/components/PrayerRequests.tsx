import React, { useEffect, useState } from "react";
import { api } from "../api";
import { PrayerRequest } from "../types";
import { 
  Heart, 
  Lock, 
  Unlock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Trash2, 
  Plus, 
  X, 
  Sparkles,
  MessageSquare,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PrayerRequestsProps {
  isAdmin?: boolean;
}

export default function PrayerRequests({ isAdmin = false }: PrayerRequestsProps) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [requesterName, setRequesterName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestText, setRequestText] = useState("");
  const [isPrivate, setIsPrivate] = useState(true); // default to private/confidential

  // Filter / Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Prayed For">("All");
  const [privacyFilter, setPrivacyFilter] = useState<"All" | "Private" | "Public">("All");

  // Local notifications / UX state
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  // Fetch Prayer Requests
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPrayerRequests();
      setPrayers(data);
    } catch (err: any) {
      console.error("Failed to load prayer requests:", err);
      setError(err?.message || "Failed to load prayer requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  // Handle Prayer Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await api.addPrayerRequest({
        requester_name: requesterName.trim() || "Anonymous",
        phone: phone.trim() || null,
        request_text: requestText.trim(),
        is_private: isPrivate ? 1 : 0
      });

      // Clear Form
      setRequesterName("");
      setPhone("");
      setRequestText("");
      setIsPrivate(true);

      setSuccessMsg("Your prayer request has been submitted securely of our intercessors.");
      
      // Auto dismiss success message after 5 seconds
      setTimeout(() => setSuccessMsg(null), 5000);

      // Refresh list
      await fetchPrayers();
    } catch (err: any) {
      setError(err?.message || "Failed to submit request. Please verify connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as Prayed For
  const handleMarkPrayed = async (id: number) => {
    try {
      setActioningId(id);
      await api.markPrayedFor(id);
      
      // Local updates for snappy UI response
      setPrayers(prev => prev.map(p => p.id === id ? { ...p, status: "Prayed For" } : p));
    } catch (err: any) {
      alert("Error marking prayer request: " + err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this prayer request record?")) return;
    try {
      setActioningId(id);
      await api.deletePrayerRequest(id);
      setPrayers(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Error deleting request: " + err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Filter requests based on role and options
  const filteredPrayers = prayers.filter(p => {
    // 1. If not admin, hide private requests completely unless they submitted it
    // Note: Since we don't have separate accounts, non-admins simply cannot view any request marked as private
    if (!isAdmin && p.is_private === 1) {
      return false;
    }

    // 2. Search query filter
    const matchesSearch = 
      p.request_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery));

    // 3. Status filter
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;

    // 4. Privacy Filter (Admin only)
    let matchesPrivacy = true;
    if (isAdmin) {
      if (privacyFilter === "Private") matchesPrivacy = p.is_private === 1;
      if (privacyFilter === "Public") matchesPrivacy = p.is_private === 0;
    }

    return matchesSearch && matchesStatus && matchesPrivacy;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="prayer-requests-root-view">
      {/* Dynamic Header Badge / Headline */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E1D8] pb-6">
        <div className="flex items-center gap-4">
          <img src="/images/logo.jpg" alt="Church Logo" className="h-12 w-12 rounded-xl object-cover border border-[#E5E1D8]" />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C5A059]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9E7A3B]">
              <Heart className="h-3.5 w-3.5 fill-current text-[#C5A059]" />
              Intercessory Service
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#2D3E50]">
              {isAdmin ? "Pastoral Prayer Ledger" : "Intercession & Blessings"}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              {isAdmin 
                ? "View, track, and mark submitted congregation prayer requests as prayed for." 
                : "Let us stand together in prayer. Submit a confidential request to our intercessory team below."
              }
            </p>
          </div>
        </div>

        {/* Global Action State */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] bg-[#E5E1D8]/30 px-3 py-1.5 rounded-xl border border-[#E5E1D8] font-medium text-[#2D3E50] select-none">
            Active Requests: {filteredPrayers.length}
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Submission Form (only visible contextually, but always accessible to congregants) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6">
            <div className="bg-[#2D3E50] text-[#E5E1D8] rounded-2xl p-6 shadow-md border border-[#2D3E50]/10 overflow-hidden relative">
              
              {/* Subtle background glow effect */}
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-[#C5A059]/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-[#E5E1D8]/10 pb-4 mb-5">
                <Sparkles className="h-4.5 w-4.5 text-[#C5A059]" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Add Prayer Request
                </h3>
              </div>

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3.5 bg-[#C5A059]/15 border border-[#C5A059]/30 rounded-xl text-xs text-[#E5E1D8] flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {error && !successMsg && (
                <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <X className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs" id="submit-prayer-request-form">
                
                {/* Requester name */}
                <div className="space-y-1.5">
                  <label htmlFor="requester-name-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A0A0A0]" />
                    <input
                      id="requester-name-input"
                      type="text"
                      placeholder="Leave blank for Anonymous"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full bg-[#1e2a36] border border-[#3A4E63] focus:border-[#C5A059] text-white pl-9 pr-3.5 py-2 rounded-xl outline-none transition placeholder-neutral-500"
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div className="space-y-1.5">
                  <label htmlFor="requester-phone-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A0A0A0]" />
                    <input
                      id="requester-phone-input"
                      type="tel"
                      placeholder="e.g. 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#1e2a36] border border-[#3A4E63] focus:border-[#C5A059] text-white pl-9 pr-3.5 py-2 rounded-xl outline-none transition placeholder-neutral-500"
                    />
                  </div>
                </div>

                {/* Request details */}
                <div className="space-y-1.5">
                  <label htmlFor="requester-text-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Prayer Request (Required)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A0A0A0]" />
                    <textarea
                      id="requester-text-input"
                      rows={4}
                      required
                      placeholder="Write your prayers, needs, or praises here..."
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      className="w-full bg-[#1e2a36] border border-[#3A4E63] focus:border-[#C5A059] text-white pl-9 pr-3.5 py-2 rounded-xl outline-none transition placeholder-neutral-500 resize-none min-h-[90px]"
                    />
                  </div>
                </div>

                {/* Confidential / Privacy toggle */}
                <div className="bg-[#1e2a36] border border-[#3A4E63] rounded-xl p-3.5 space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Privacy Directives
                  </span>
                  
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] text-[#E5E1D8]">
                      {isPrivate ? "🔒 Confidential (Pastors Only)" : "🌐 Share on Public Prayer Wall"}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                        isPrivate ? "bg-[#C5A059]" : "bg-neutral-600"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                          isPrivate ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-neutral-400">
                    {isPrivate 
                      ? "Only pastors and intercessors will view this request. It will never be visible on public walls." 
                      : "Shared on the community board for mutual prayer, using the name specified above."
                    }
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !requestText.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#C5A059] text-[#2D3E50] hover:bg-[#b5924d] transition duration-150 cursor-pointer select-none disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
                >
                  {submitting ? "Submitting..." : (
                    <>
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Hand: Prayer List Catalog (Public or Full Admin lists) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls Bar for Searching / Filtering */}
          <div className="bg-[#FDFCF8] border border-[#E5E1D8] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs text-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                id="search-prayers-query"
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] rounded-xl outline-none focus:border-[#C5A059] transition text-xs"
              />
            </div>

            {/* Filters selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              
              {/* Status filter button group */}
              <div className="flex rounded-lg border border-[#E5E1D8] p-0.5 bg-[#F5F2ED] text-[10px] font-bold">
                <button
                  onClick={() => setStatusFilter("All")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                    statusFilter === "All" ? "bg-white text-[#2D3E50] shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("Pending")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                    statusFilter === "Pending" ? "bg-amber-100 text-amber-700 shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter("Prayed For")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                    statusFilter === "Prayed For" ? "bg-emerald-100 text-emerald-700 shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                  }`}
                >
                  Prayed For
                </button>
              </div>

              {/* Privacy filter (Admin Only) */}
              {isAdmin && (
                <div className="flex rounded-lg border border-[#E5E1D8] p-0.5 bg-[#F5F2ED] text-[10px] font-bold">
                  <button
                    onClick={() => setPrivacyFilter("All")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                      privacyFilter === "All" ? "bg-white text-[#2D3E50] shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                    }`}
                  >
                    All Privacy
                  </button>
                  <button
                    onClick={() => setPrivacyFilter("Private")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                      privacyFilter === "Private" ? "bg-[#2D3E50] text-[#E5E1D8] shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                    }`}
                  >
                    Confidential
                  </button>
                  <button
                    onClick={() => setPrivacyFilter("Public")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer select-none uppercase tracking-wider ${
                      privacyFilter === "Public" ? "bg-sky-100 text-sky-800 shadow-xs" : "text-neutral-500 hover:text-[#2D3E50]"
                    }`}
                  >
                    Public Wall
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C5A059] border-t-transparent" />
              <p className="text-xs text-neutral-400">Consulting sanctuary records...</p>
            </div>
          ) : filteredPrayers.length === 0 ? (
            <div className="border border-dashed border-[#E5E1D8] rounded-2xl p-12 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-neutral-300 stroke-[1.5] mb-2" />
              <h4 className="font-semibold text-xs text-[#2D3E50] uppercase tracking-wider">No requests found</h4>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-sm mx-auto">
                {isAdmin 
                  ? "There are no incoming prayer requests matching your current filter criteria." 
                  : "The community Sanctuary Wall is clear. Be the first to submit a shared request or testimony!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout text-xs">
                {filteredPrayers.map((p) => {
                  const isPending = p.status === "Pending";
                  const dateLabel = new Date(p.date_submitted).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={p.id}
                      className={`border rounded-2xl p-5 shadow-sm transition-all duration-150 relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                        isPending 
                          ? "bg-white border-[#E5E1D8] hover:border-[#CFD8E3]" 
                          : "bg-[#FDFCF8]/50 border-[#E5E1D8] opacity-90"
                      }`}
                    >
                      {/* Left: Metadata & Text body */}
                      <div className="space-y-3 flex-1">
                        
                        {/* Title and metadata details line */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <img
                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(p.requester_name)}&backgroundColor=e5e1d8`}
                            alt="Avatar"
                            className="w-[22px] h-[22px] rounded-full shrink-0 border border-[#E5E1D8]"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-bold text-xs text-[#2D3E50]">
                            {p.requester_name}
                          </span>

                          {p.phone && isAdmin && (
                            <span className="text-[10px] font-mono text-neutral-400 select-all font-semibold flex items-center gap-0.5">
                              📞 {p.phone}
                            </span>
                          )}

                          <span className="text-neutral-300">•</span>
                          
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {dateLabel}
                          </span>

                          {/* Lock indication */}
                          {p.is_private === 1 ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#E5E1D8] bg-[#2D3E50] px-1.5 py-0.5 rounded-full select-none" title="Confidential - Pastors Only">
                              <Lock className="h-2.5 w-2.5" />
                              <span>Confidential</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#9E7A3B] bg-[#C5A059]/10 px-1.5 py-0.5 rounded-full select-none" title="Shared publicly with Sanctuary">
                              <Unlock className="h-2.5 w-2.5" />
                              <span>Public Wall</span>
                            </span>
                          )}
                        </div>

                        {/* Text request content */}
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans whitespace-pre-wrap select-text">
                          "{p.request_text}"
                        </p>

                        {/* Answered indicator details */}
                        {!isPending && (
                          <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5 fill-current text-emerald-500" />
                            <span>Lifted in Prayer & Interceded For</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions Controls (Admin can mark prayed or delete) */}
                      <div className="flex flex-row md:flex-col items-center gap-2 self-end md:self-center shrink-0">
                        {isAdmin && (
                          <>
                            {isPending ? (
                              <button
                                onClick={() => handleMarkPrayed(p.id)}
                                disabled={actioningId === p.id}
                                className="px-3 py-1.5 border border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition select-none flex items-center gap-1 shrink-0"
                                title="Mark as lifted to God in intercessory prayer"
                              >
                                <Heart className="h-3 w-3 fill-current text-amber-600" />
                                <span>Complete Prayer</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-wider select-none px-2 py-1">
                                Finished 
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteRequest(p.id)}
                              disabled={actioningId === p.id}
                              className="p-2 border border-[#E5E1D8] hover:bg-rose-50 text-neutral-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}

                        {/* Congregant feedback (If not admin and is pending, show waiting heart animation) */}
                        {!isAdmin && isPending && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider select-none bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                            <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                            <span>Being Interceded</span>
                          </div>
                        )}
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
