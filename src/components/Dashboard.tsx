import React, { useEffect, useState } from "react";
import { api } from "../api";
import { DashboardStats } from "../types";
import { 
  Users, 
  DollarSign, 
  Calendar,
  Coins, 
  Activity, 
  ChevronRight, 
  TrendingUp, 
  PiggyBank,
  BookOpen,
  Sparkles,
  Search,
  FileText,
  Mic,
  Volume2,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CalendarDays
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { motion } from "motion/react";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectMember?: (id: number) => void;
  isAdmin?: boolean;
}

const COLORS = ["#1E40AF", "#3B82F6", "#0284C7", "#93C5FD", "#60A5FA", "#E2E8F0"];

const DEVOTIONAL_VERSES = [
  {
    ref: "Psalms 23:1",
    english: "The Lord is my shepherd; I shall not want.",
    kiswahili: "Bwana ndiye mchungaji wangu, Sitapungukiwa na kitu.",
    luo: "Yehova e jakwathna; ok nahawo gimoro duto."
  },
  {
    ref: "John 1:1",
    english: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    kiswahili: "Hapo mwanzo kulikuwako Neno, naye Neno alikuwako kwa Mungu, naye Neno alikuwa Mungu.",
    luo: "E chakruok ne nitie Wach, kendo Wach ne ni gi Nyasaye, kendo Wach ne e Nyasaye oguru."
  },
  {
    ref: "Luke 6:38",
    english: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap.",
    kiswahili: "Wapeni watu vitu, nanyi mtapewa; kipimo cha kujaa na kushindiliwa, na kusukwa-sukwa hata kumwagika, ndicho watu watakachowapa vifuani mwenu.",
    luo: "Miu, to nomiu; pim maber ma ochonye kendo oyengi mapaka fuyo e dhok nokuondiu."
  },
  {
    ref: "Hebrews 11:1",
    english: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    kiswahili: "Basi imani ni kuwa na hakika ya mambo yatarajiwayo, ni thibitisho la mambo yasiyoonekana.",
    luo: "To yie en thiri mar gigo ma ogore be, to bende en ranyisi mar gigo ma ok ne gi wengi."
  }
];

function getWeeklyTrends(attendanceTrend: any[]) {
  if (!attendanceTrend || attendanceTrend.length === 0) return [];

  const parsed = attendanceTrend.map(t => {
    const d = new Date(t.date);
    return {
      ...t,
      dateObj: d,
      time: d.getTime()
    };
  }).sort((a, b) => a.time - b.time);

  const latestTime = parsed[parsed.length - 1].time;
  const anchorDate = new Date(latestTime);

  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const end = new Date(anchorDate);
    end.setDate(anchorDate.getDate() - (i * 7));
    const start = new Date(anchorDate);
    start.setDate(anchorDate.getDate() - ((i + 1) * 7) + 1);

    const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime();

    const matched = parsed.filter(t => t.time >= startMs && t.time <= endMs);

    let averagePercentage = 0;
    let totalPresent = 0;
    let totalExpected = 0;

    if (matched.length > 0) {
      const sumPresent = matched.reduce((sum, item) => sum + item.present, 0);
      const sumTotal = matched.reduce((sum, item) => sum + item.total, 0);
      averagePercentage = sumTotal > 0 ? Math.round((sumPresent / sumTotal) * 100) : 0;
      totalPresent = sumPresent;
      totalExpected = sumTotal;
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    weeks.push({
      label: `Week ${4 - i}`,
      range: `${formatDate(start)} - ${formatDate(end)}`,
      percentage: averagePercentage,
      present: totalPresent,
      total: totalExpected,
      sessionsCount: matched.length
    });
  }

  return weeks.reverse();
}

export default function Dashboard({ onNavigate, onSelectMember, isAdmin = true }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"sessions" | "weekly">("weekly");

  // Congregant view specific states
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [allMembersList, setAllMembersList] = useState<any[]>([]);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [latestSermons, setLatestSermons] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const loadCongregantData = async () => {
    try {
      setLoading(true);
      const [members, sermons, events] = await Promise.all([
        api.getMembers().catch(() => []),
        api.getSermons().catch(() => []),
        api.getEvents().catch(() => [])
      ]);
      setAllMembersList(members);
      setLatestSermons(sermons.slice(0, 2));
      
      const futureEvents = events
        .filter(e => new Date(e.date).getTime() >= new Date().getTime() - 86400000)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUpcomingEvents(futureEvents.slice(0, 3));
    } catch (err: any) {
      console.error("Error fetching congregant home assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      loadCongregantData();
    }
  }, [isAdmin]);

  const fetchStewardshipStatement = async (memberId: number) => {
    try {
      setLoadingProfile(true);
      const data = await api.getMember(memberId);
      setSelectedMemberProfile(data);
    } catch (err) {
      console.error("Could not fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-neutral-500 font-sans uppercase tracking-wider">Assembling Sanctuary data ...</p>
      </div>
    );
  }

  // --- RENDERING VIEWER / CONGREGANT SIDE PORTAL ---
  if (!isAdmin) {
    const matchedMembers = allMembersList.filter(m => {
      if (!memberSearchQuery) return false;
      const term = memberSearchQuery.toLowerCase();
      return (
        m.first_name.toLowerCase().includes(term) ||
        m.last_name.toLowerCase().includes(term) ||
        (m.phone && m.phone.includes(term))
      );
    });

    const activeVerse = DEVOTIONAL_VERSES[activeVerseIndex];

    return (
      <div className="space-y-8 font-sans">
        
        {/* Welcome greeting banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-blue-700 shadow-lg">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
            <Sparkles className="h-96 w-96 text-white" />
          </div>
          
          <div className="max-w-xl position relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="Church Logo" className="h-10 w-10 rounded-full object-cover border border-blue-400/30 shadow-sm" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#38BDF8] bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-full inline-block">
                Welcome, Beloved Communicant 🌟
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase font-display tracking-tight leading-tight">
              Grace & Peace Be Multiplied Unto You
            </h1>
            <p className="text-xs md:text-sm text-blue-200 leading-relaxed">
              Your digital spiritual desk e soko (in the world). Read sacred trilingual scriptures, retrieve pulpit recordings, and check your registered church contributions securely offline.
            </p>
          </div>
        </div>

        {/* Home body grids splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Main (Scripture, Statements search) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Scripture of the day (Trilingual Slider) */}
            <div className="bg-white border border-[#CFD8E3] rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E1E9F0] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-150 rounded-lg text-blue-600">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Weekly Scripture Highlight</h3>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">Trilingual Concordance Reference</p>
                  </div>
                </div>

                {/* Switcher bullets */}
                <div className="flex items-center gap-1.5">
                  {DEVOTIONAL_VERSES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVerseIndex(idx)}
                      className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                        activeVerseIndex === idx ? "bg-blue-600 w-5" : "bg-neutral-200 hover:bg-neutral-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Devotional quote layouts */}
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">English (KJV)</span>
                  <p className="text-sm font-semibold italic text-slate-700 leading-relaxed font-sans">
                    "{activeVerse.english}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-[#CFD8E3]/60">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Swahili (Habari Njema)</span>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      "{activeVerse.kiswahili}"
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-[#CFD8E3]/60">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">Dholuo (Luo Concordance)</span>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      "{activeVerse.luo}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B] pt-2 border-t border-dashed border-[#CFD8E3]/60">
                  <span>Scripture: {activeVerse.ref}</span>
                  <button
                    onClick={() => onNavigate("bible")}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 uppercase tracking-wide cursor-pointer"
                  >
                    <span>Read Full Book</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>


            {/* 2. My Stewardship Checkup (Contributions Look-up) */}
            <div className="bg-white border border-[#CFD8E3] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#E1E9F0] pb-4 mb-5">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-150">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Member Stewardship Statement Lookup</h3>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Retrieve your recorded tithes, offerings, and charity funds securely from the GIMK general ledger offline database.
                  </p>
                </div>
              </div>

              {/* Lookup search layout */}
              {!selectedMemberProfile ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type your name or cellular number to search your profile..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-[#CFD8E3] rounded-xl pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white text-slate-800 transition"
                    />
                  </div>

                  {memberSearchQuery && matchedMembers.length > 0 && (
                    <div className="border border-[#CFD8E3] rounded-xl overflow-hidden divide-y divide-[#E1E9F0] max-h-48 overflow-y-auto shadow-inner bg-slate-50">
                      {matchedMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => fetchStewardshipStatement(m.id)}
                          className="w-full text-left p-3 hover:bg-white transition flex items-center justify-between text-xs cursor-pointer select-none"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block">
                              {m.first_name} {m.last_name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">
                              📞 {m.phone || "No Phone Number"} • {m.branch_name || "Ramba Headquarters"}
                            </span>
                          </div>
                          <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-550/10 px-2 py-0.5 rounded border border-blue-200">
                            Select Profile
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {memberSearchQuery && matchedMembers.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-[#CFD8E3] rounded-xl bg-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase">No matching member profiles</p>
                      <p className="text-[10px] text-slate-400 mt-1">If you are a regular congregant, check spelling or ask your Headquarters Clerk.</p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2.5 items-start mt-4">
                    <PiggyBank className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-relaxed font-semibold">
                      <strong>Privacy Assurance:</strong> Search takes place securely within our local SQLite engine. Names and donation histories exist for local accounting audits in accordance with Ramba-Kabondo Headquarters directives.
                    </p>
                  </div>
                </div>
              ) : (
                /* Profile & statement summary display */
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-[#CFD8E3]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 rounded-full inline-block mb-1.5 uppercase">
                        Verified Stewardship Account
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 font-display uppercase tracking-tight">
                        {selectedMemberProfile.first_name} {selectedMemberProfile.last_name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5">
                        {selectedMemberProfile.branch_name || "Ramba Headquarters"} • Joined: {new Date(selectedMemberProfile.join_date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMemberProfile(null);
                          setMemberSearchQuery("");
                        }}
                        className="px-3.5 py-1.5 border border-[#CFD8E3] hover:bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-500 transition cursor-pointer"
                      >
                        Reset Search
                      </button>
                    </div>
                  </div>

                  {/* Contributions table */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Statement of Offerings & Pledges</span>
                    
                    {selectedMemberProfile.contributions.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-[#CFD8E3] rounded-xl bg-slate-50">
                        <DollarSign className="h-7 w-7 text-neutral-300 mx-auto mb-1" />
                        <p className="text-xs text-neutral-400 font-bold uppercase">No records found</p>
                        <p className="text-[9px] text-neutral-400">There are no contributions registered for this profile yet.</p>
                      </div>
                    ) : (
                      <div className="border border-[#CFD8E3] rounded-xl overflow-hidden bg-white shadow-inner max-h-60 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 border-b border-[#CFD8E3] text-[9px] font-bold uppercase text-slate-400">
                            <tr>
                              <th className="p-3.5">Filing Date</th>
                              <th className="p-3.5">Type</th>
                              <th className="p-3.5">Payment Method</th>
                              <th className="p-3.5 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedMemberProfile.contributions.map((c: any) => (
                              <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="p-3.5 font-mono text-[10px] text-slate-500 font-bold">
                                  {new Date(c.date).toLocaleDateString("en-US", { dateStyle: "long" })}
                                </td>
                                <td className="p-3.5 font-bold text-slate-700">{c.type}</td>
                                <td className="p-3.5 font-semibold text-slate-500">{c.payment_method}</td>
                                <td className="p-3.5 font-display font-bold text-slate-800 text-right">
                                  {formatCurrency(c.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Stewardship total metrics aggregated */}
                    {selectedMemberProfile.contributions.length > 0 && (
                      <div className="flex bg-[#0E2954]/5 p-4 rounded-xl items-center justify-between border border-[#0E2954]/10">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4.5 w-4.5 text-[#2563EB]" />
                          <span className="text-[10px] font-bold text-[#0E2954] uppercase">Consolidated Tithe Aggregate</span>
                        </div>
                        <span className="font-mono font-black text-xs md:text-sm text-[#0E2954] bg-[#2563EB]/10 px-3.5 py-1.5 rounded-lg border border-[#2563EB]/25">
                          Total: {formatCurrency(
                            selectedMemberProfile.contributions.reduce((sum: number, item: any) => sum + item.amount, 0)
                          )}
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Main Sidebar (Events timeline, Sermons spotlights) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Timeline Events Calendar */}
            <div className="bg-white border border-[#CFD8E3] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <CalendarDays className="h-4.5 w-4.5 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Upcoming Fellowship Schedules</h3>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">No upcoming service events</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((e, idx) => {
                    const eventDate = new Date(e.date);
                    const formattedDate = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
                    return (
                      <div key={e.id} className="relative pl-4 border-l-2 border-[#2563EB]/30 space-y-1">
                        {/* Dot indicator */}
                        <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#2563EB]" />
                        
                        <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 font-mono">
                          <span>{formattedDate}</span>
                          <span>{e.time || "09:00 AM"}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{e.title}</h4>
                        <div className="text-[10px] text-slate-500 font-medium">📍 {e.branch_name || "HQ Tabernacle"}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => onNavigate("events")}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-lg tracking-wider text-center block"
              >
                View Full Church Calendar
              </button>
            </div>

            {/* Daily Video or Sermon spotlights summary snippet */}
            <div className="bg-[#0E2954] text-white rounded-2xl p-5 shadow-md border border-slate-700/40 space-y-3.5 relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <Mic className="h-32 w-32" />
              </div>

              <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                <Mic className="h-4.5 w-4.5 text-[#38BDF8]" />
                <h3 className="text-xs font-bold uppercase tracking-wide">Latest Pulpit Sermon</h3>
              </div>

              {latestSermons.length === 0 ? (
                <p className="text-[10px] text-zinc-400">No divine service podcasts have been posted yet.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono bg-blue-500/30 text-blue-200 border border-blue-400/20 rounded px-1.5 py-0.5 inline-block">
                      Delivery: {latestSermons[0].date}
                    </span>
                    <h4 className="text-xs font-black font-display text-white line-clamp-1 uppercase leading-snug">
                      "{latestSermons[0].title}"
                    </h4>
                    <p className="text-[10px] text-zinc-300 font-bold">📢 Preached by {latestSermons[0].speaker}</p>
                    {latestSermons[0].scripture && (
                      <p className="text-[9px] font-mono font-bold text-[#38BDF8]">📖 Scripture: {latestSermons[0].scripture}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigate("sermons")}
                    className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-bold uppercase rounded-lg tracking-wider transition text-center flex items-center justify-center gap-1.5 select-none"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Stream Audio & video</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // --- RENDERING SECURE ADMINISTRATIVE SIDE PORTAL (DEFAULT) ---
  if (error || !stats) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-rose-800">Connection Error</h3>
        <p className="mt-1 text-sm text-rose-600">{error || "Could not retrieve statistics."}</p>
        <button 
          onClick={loadData}
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const lastAttendancePercent = stats.attendanceTrend.length > 0 
    ? stats.attendanceTrend[stats.attendanceTrend.length - 1].percentage 
    : 100;

  return (
    <div className="space-y-8 font-sans">
      {/* Greetings section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <img src="/images/logo.jpg" alt="Church Logo" className="h-12 w-12 rounded-xl object-cover border border-[#CFD8E3] shadow-sm" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0E2954] md:text-3xl uppercase">
              Admin Sanctuary Indicators
            </h1>
            <p className="text-sm font-normal text-[#475569]">
              Real-time insights database covering memberships, finance ledgers, and events calendar.
            </p>
          </div>
        </div>
        <div className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#475569] shadow-sm border border-[#CFD8E3]">
          <Activity className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Local SQLite Active Connection</span>
          <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse"></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Active Congregation",
            value: stats.activeMembers,
            subtitle: `of ${stats.totalMembers} registered members`,
            icon: Users,
            color: "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20",
            tab: "members",
          },
          {
            title: "Month Donations",
            value: formatCurrency(stats.thisMonthContributions),
            subtitle: `${formatCurrency(stats.totalContributions)} overall funds`,
            icon: Coins,
            color: "text-[#0E2954] bg-[#E1E9F0] border-[#CFD8E3]",
            tab: "contributions",
          },
          {
            title: "Average Attendance",
            value: `${lastAttendancePercent}%`,
            subtitle: `${stats.attendanceTrend.length} services recorded`,
            icon: TrendingUp,
            color: "text-[#0E2954] bg-[#E1E9F0] border-[#CFD8E3]",
            tab: "attendance",
          },
          {
            title: "Upcoming Services",
            value: stats.upcomingEventsCount,
            subtitle: "schedules mapped",
            icon: Calendar,
            color: "text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20",
            tab: "events",
          },
        ].map((m, idx) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => onNavigate(m.tab)}
            id={`metric-card-${idx}`}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#CFD8E3] bg-white p-6 shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{m.title}</span>
              <div className={`rounded-lg border p-2 ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-display tracking-tight text-[#0E2954]">{m.value}</span>
              <p className="mt-1 text-xs text-[#475569]">{m.subtitle}</p>
            </div>
            <div className="absolute bottom-3 right-4 flex items-center gap-0.5 opacity-0 text-[10px] uppercase font-bold tracking-widest text-[#2563EB] transition-all group-hover:opacity-100">
              <span>View</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Attendance trend - Weekly Bars & Daily Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-[#CFD8E3] bg-white p-6 shadow-sm lg:col-span-8"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#0E2954] font-display uppercase tracking-tight">
                {chartView === "sessions" ? "Service Attendance Track" : "Weekly Attendance Analysis"}
              </h2>
              <p className="text-xs text-[#64748B]">
                {chartView === "sessions" 
                  ? "Percentage ratio present during divine services" 
                  : "Weekly attendance trends for the last month (grouped by 7-day bins)"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-[#E1E9F0] border border-[#CFD8E3] p-1 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setChartView("weekly")}
                  className={`rounded-md px-2.5 py-1 transition cursor-pointer select-none ${
                    chartView === "weekly"
                      ? "bg-white text-[#0E2954] shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-bold border border-[#CFD8E3]/50"
                      : "text-[#475569] hover:text-[#0E2954]"
                  }`}
                >
                  Weekly Trends
                </button>
                <button
                  type="button"
                  onClick={() => setChartView("sessions")}
                  className={`rounded-md px-2.5 py-1 transition cursor-pointer select-none ${
                    chartView === "sessions"
                      ? "bg-white text-[#0E2954] shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-bold border border-[#CFD8E3]/50"
                      : "text-[#475569] hover:text-[#0E2954]"
                  }`}
                >
                  All Sessions
                </button>
              </div>
              <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-[#E1E9F0] border border-[#CFD8E3] px-2.5 py-1.5 text-[11px] font-semibold text-[#475569]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]"></span>
                <span>Active Track</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartView === "sessions" ? (
              stats.attendanceTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl bg-[#F0F4F8] border border-dashed border-[#CFD8E3]">
                  <p className="text-xs text-slate-405">No attendance data logs recorded yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFD8E3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: "#64748B" }} 
                      stroke="#CFD8E3"
                      tickFormatter={(tick) => {
                        const d = new Date(tick);
                        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: "#64748B" }} 
                      stroke="#CFD8E3" 
                      unit="%"
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "1px solid #CFD8E3", fontSize: "12px", fontFamily: "inherit" }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}% (${props.payload.present}/${props.payload.total} members)`,
                        "Attendance Ratio"
                      ]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { dateStyle: "long" })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#2563EB" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorPercentage)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )
            ) : (
              (() => {
                const weeklyData = getWeeklyTrends(stats.attendanceTrend);
                return weeklyData.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-xl bg-[#F0F4F8] border border-dashed border-[#CFD8E3]">
                    <p className="text-xs text-slate-400">No weekly trends available for the current attendance logs.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFD8E3" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 10, fill: "#64748B" }} 
                        stroke="#CFD8E3"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10, fill: "#64748B" }} 
                        stroke="#CFD8E3" 
                        unit="%"
                        width={40}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: "12px", border: "1px solid #CFD8E3", fontSize: "11px", fontFamily: "inherit" }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value}% turnout average (${props.payload.sessionsCount} service(s) logged)`,
                          "Weekly Average Turnout"
                        ]}
                        labelFormatter={(label, items) => {
                          const item = items[0]?.payload;
                          return item ? `${item.label} (${item.range})` : label;
                        }}
                      />
                      <Bar 
                        dataKey="percentage" 
                        fill="#2563EB" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()
            )}
          </div>
        </motion.div>

        {/* Donation pie breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-[#CFD8E3] bg-white p-6 shadow-sm lg:col-span-4"
        >
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#0E2954] font-display uppercase tracking-tight">Donations Ledger Summary</h2>
            <p className="text-xs text-slate-400">Total breakdown of contribution values</p>
          </div>
          <div className="relative flex flex-col items-center justify-center h-64">
            {stats.typesBreakdown.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#F0F4F8] border border-dashed border-[#CFD8E3]">
                <p className="text-xs text-slate-400">No transactions categorized yet.</p>
              </div>
            ) : (
              <>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.typesBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.typesBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: "12px", border: "1px solid #CFD8E3", fontSize: "11px" }}
                        formatter={(value: number) => [formatCurrency(value), "Total Raised"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center amount */}
                <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
                  <PiggyBank className="h-4 w-4 text-[#2563EB]" />
                  <span className="text-[9px] font-bold tracking-[0.12em] text-[#64748B] uppercase mt-1">Total Pool</span>
                  <span className="text-lg font-bold text-[#0E2954] font-display mt-0.5">{formatCurrency(stats.totalContributions)}</span>
                </div>
              </>
            )}
          </div>
          {/* Legend customized */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-[#E1E9F0] text-[11px] font-semibold text-[#475569]">
            {stats.typesBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{item.name}</span>
                <span className="ml-auto font-bold text-[#0E2954]">{stats.totalContributions > 0 ? Math.round((item.value / stats.totalContributions) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid: Recent activities and registrations */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Contributions list */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#CFD8E3] bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between font-sans">
            <div>
              <h2 className="text-base font-bold text-[#0E2954] font-display uppercase tracking-tight">Recent Financial Posts</h2>
              <p className="text-xs text-slate-404 font-sans">Latest offerings and tithes registered in ledger</p>
            </div>
            <button 
              onClick={() => onNavigate("contributions")} 
              className="group flex items-center gap-0.5 text-xs font-bold uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <span>Ledger</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E1E9F0]">
            {stats.recentDonations.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No transactions recorded yet.</p>
            ) : (
              stats.recentDonations.map((d, index) => (
                <div key={index} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#E1E9F0] border border-[#CFD8E3] p-2 text-[#0E2954]">
                      <DollarSign className="h-4 w-4 text-[#2563EB]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">
                        {d.first_name ? `${d.first_name} ${d.last_name}` : "Member Contributor"}
                      </h4>
                      <p className="text-[10px] font-medium text-[#475569] mt-0.5">
                        {d.type} • {new Date(d.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </p>
                    </div>
                  </div>
                  <span className="font-display font-semibold text-[#0E2954] text-xs bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1 rounded-full">
                    +{formatCurrency(d.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recently joined members */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[#CFD8E3] bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0E2954] font-display uppercase tracking-tight">New Fellowship Members</h2>
              <p className="text-xs text-slate-400">Latest congregant profiles added to database</p>
            </div>
            <button 
              onClick={() => onNavigate("members")}
              className="group flex items-center gap-0.5 text-xs font-bold uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <span>Directory</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E1E9F0]">
            {stats.recentMembers.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No member accounts added yet.</p>
            ) : (
              stats.recentMembers.map((m, index) => {
                const statusColors: Record<string, string> = {
                  Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
                  Inactive: "bg-slate-100 text-[#475569] border-[#CFD8E3]",
                  Visitor: "bg-blue-50 text-blue-600 border-blue-100",
                };
                return (
                  <div key={index} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[#E1E9F0] p-2 text-[#475569]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800">
                          {m.first_name} {m.last_name}
                        </h4>
                        <p className="text-[10px] font-medium text-[#475569] mt-0.5">
                          Enrolled on {new Date(m.join_date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-xl border px-2.5 py-0.5 text-[10px] font-bold ${statusColors[m.status] || "bg-neutral-50"}`}>
                      {m.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
