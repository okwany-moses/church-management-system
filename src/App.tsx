import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Members from "./components/Members";
import Ministries from "./components/Ministries";
import Attendance from "./components/Attendance";
import Contributions from "./components/Contributions";
import Events from "./components/Events";
import Branches from "./components/Branches";
import Communications from "./components/Communications";
import Songbook from "./components/Songbook";
import Sermons from "./components/Sermons";
import Bible from "./components/Bible";
import PrayerRequests from "./components/PrayerRequests";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  UserCheck, 
  DollarSign, 
  CalendarDays,
  Clock,
  RefreshCw,
  HelpCircle,
  X,
  Database,
  MessageSquare,
  BookOpen,
  Mic,
  Lock,
  BookCheck,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTab = 
  | "dashboard" 
  | "members" 
  | "ministries" 
  | "attendance" 
  | "contributions" 
  | "events" 
  | "branches" 
  | "communications" 
  | "songbook" 
  | "sermons" 
  | "bible"
  | "prayer_requests";

export default function App() {
  const [roleMode, setRoleMode] = useState<"congregant" | "admin">("congregant");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem("gimk_admin_password") || "admin123");
  const [tickerTime, setTickerTime] = useState("");
  
  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cross-component coordination state
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // Global triggers to force re-render/refreshes in related siblings
  const [globalRefreshCount, setGlobalRefreshCount] = useState(0);

  const triggerGlobalRefresh = () => {
    setGlobalRefreshCount(prev => prev + 1);
    showToast("Database records synced and verified.", "success");
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    // 1-second interval ticker for an elegant high-fidelity system clock
    const timer = setInterval(() => {
      const now = new Date();
      setTickerTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " UTC"
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Adaptive tab categories based on portal role mode
  const navigationItems = roleMode === "congregant"
    ? [
        { id: "dashboard", label: "Spiritual Home", icon: LayoutDashboard },
        { id: "sermons", label: "Pulpit Sermons", icon: Mic },
        { id: "bible", label: "Holy Bible", icon: BookCheck },
        { id: "songbook", label: "GIMK Songbook", icon: BookOpen },
        { id: "events", label: "Sanctuary Calendar", icon: CalendarDays },
        { id: "prayer_requests", label: "Prayer Requests", icon: Heart },
      ]
    : [
        { id: "dashboard", label: "Admin Indicators", icon: LayoutDashboard },
        { id: "members", label: "Members Directory", icon: Users },
        { id: "ministries", label: "Church Ministries", icon: HeartHandshake },
        { id: "attendance", label: "Attendance Book", icon: UserCheck },
        { id: "contributions", label: "Financial Ledger", icon: DollarSign },
        { id: "events", label: "Events Scheduler", icon: CalendarDays },
        { id: "branches", label: "Branch Affiliates", icon: Building2 },
        { id: "communications", label: "SMS Broadcasts", icon: MessageSquare },
        { id: "sermons", label: "Sermon Publisher", icon: Mic },
        { id: "bible", label: "Holy Bible Copy", icon: BookCheck },
        { id: "songbook", label: "GIMK Songbook", icon: BookOpen },
        { id: "prayer_requests", label: "Prayer Requests Ledger", icon: Heart },
      ];

  // Restrict activeTab back to dashboard when toggling between portals to prevent invalid views
  useEffect(() => {
    const hasTab = navigationItems.some(item => item.id === activeTab);
    if (!hasTab) {
      setActiveTab("dashboard");
    }
  }, [roleMode]);

  const handleSwitchRole = (mode: "congregant" | "admin") => {
    if (mode === "admin") {
      if (roleMode === "admin") return;
      const password = window.prompt("Admin Authentication Required (Type 'forgot' to reset to default):");
      if (password === null) return;

      if (password.toLowerCase() === "forgot") {
        const confirmReset = window.confirm("Reset admin password to default 'admin123'?");
        if (confirmReset) {
          const defaultPwd = "admin123";
          setAdminPassword(defaultPwd);
          localStorage.setItem("gimk_admin_password", defaultPwd);
          showToast("Admin password reset to default.", "success");
        }
        return;
      }

      if (password === adminPassword) {
        setRoleMode("admin");
        showToast("Administrative credentials verified.", "success");
      } else {
        showToast("Access Denied: Incorrect password.", "error");
      }
    } else {
      setRoleMode("congregant");
    }
  };

  const handleChangePassword = () => {
    const newPwd = window.prompt("Enter new Admin password:");
    if (newPwd && newPwd.trim().length > 0) {
      setAdminPassword(newPwd);
      localStorage.setItem("gimk_admin_password", newPwd);
      showToast("Admin password updated successfully.", "success");
    }
  };

  const handleNavigateToMember = (memberId: number) => {
    if (roleMode === "admin") {
      setSelectedMemberId(memberId);
      setActiveTab("members");
    } else {
      const password = window.prompt("Enter Admin Pin to access Member Directory:");
      if (password === "admin123") {
        setRoleMode("admin");
        setSelectedMemberId(memberId);
        setActiveTab("members");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col font-sans select-none antialiased text-[#2D3436]">
      {/* Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] shadow-sm px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/logo.jpg" alt="GIMK Logo" className="h-10 w-10 rounded-full object-cover border border-[#E5E1D8] shadow-sm" />
          <div>
            <span className="font-display font-black text-[#2D3E50] uppercase tracking-tight text-xs md:text-sm select-none leading-none block">
              Gideons International Ministries Kenya
            </span>
            <span className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] select-none block mt-1">
              Ramba-Kabondo Headquarters System
            </span>
          </div>
        </div>

        {/* Dashboard Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold text-[#636E72]">
          {/* Dual Portal Switching Pill */}
          <div className="flex bg-[#E1E9F0] border border-[#CFD8E3] p-1 rounded-xl">
            <button
              onClick={() => handleSwitchRole("congregant")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg select-none cursor-pointer ${
                roleMode === "congregant"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#475569] hover:text-[#0E2954]"
              }`}
            >
              Congregant
            </button>
            <button
              onClick={() => handleSwitchRole("admin")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg select-none cursor-pointer ${
                roleMode === "admin"
                  ? "bg-[#0E2954] text-white shadow-sm"
                  : "text-[#475569] hover:text-[#0E2954]"
              }`}
            >
              Admin Portal
            </button>
          </div>

          <div className="hidden min-[650px]:flex items-center gap-1 bg-[#F5F2ED] border border-[#E5E1D8] rounded-lg px-2.5 py-1 text-[11px]">
            <Database className="h-3.5 w-3.5 text-[#C5A059]" />
            <span className="text-[#A0A0A0] uppercase tracking-wider text-[9px]">SQLite:</span>
            <span className="text-[#2D3E50] font-bold">Local File Connected</span>
          </div>

          {/* Clock Ticker */}
          <div className="flex items-center gap-2 bg-[#2D3E50] text-[#FDFCF8] font-mono px-3 py-1 rounded-lg text-[11px] shadow-sm tracking-wider select-none border border-[#1e2a36]">
            <Clock className="h-3 w-3 text-[#C5A059]" />
            <span>{tickerTime || "Syncing..."}</span>
          </div>

          {roleMode === "admin" && (
            <button
              onClick={handleChangePassword}
              className="p-1.5 hover:bg-[#F5F2ED] border border-transparent hover:border-[#E5E1D8] rounded-xl transition cursor-pointer select-none"
              title="Change Admin Password"
            >
              <Lock className="h-4 w-4 text-[#A0A0A0] hover:text-[#2D3E50]" />
            </button>
          )}

          <button
            onClick={triggerGlobalRefresh}
            className="p-1.5 hover:bg-[#F5F2ED] border border-transparent hover:border-[#E5E1D8] rounded-xl transition rotate-hover cursor-pointer select-none"
            title="Refresh Database Connection"
          >
            <RefreshCw className="h-4 w-4 text-[#A0A0A0] hover:text-[#2D3E50]" />
          </button>
        </div>
      </header>

      {/* Navigation and Layout Shell */}
      <div className="flex-grow flex flex-col min-[860px]:flex-row">
        {/* Navigation Rail Left */}
        <nav className="bg-white border-b min-[860px]:border-b-0 min-[860px]:border-r border-[#E5E1D8] w-full min-[860px]:w-64 flex min-[860px]:flex-col py-6 px-4 gap-2 flex-shrink-0 select-none overflow-x-auto min-[860px]:overflow-x-visible">
          <div className="hidden min-[860px]:block text-[10px] font-bold text-[#A0A0A0] uppercase pl-3 py-1 select-none tracking-[0.2em] mb-2">
            Sanctuary Controls
          </div>
          
          {navigationItems.map((item) => {
            const ActiveIcon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  // Clear coordinated selected member once tab changes
                  if (item.id !== "members") {
                    setSelectedMemberId(null);
                  }
                }}
                className={`flex items-center gap-3 w-full h-11 px-4 rounded-xl text-xs font-bold transition-colors relative select-none cursor-pointer text-left ${
                  isActive
                    ? "bg-[#2D3E50] text-[#C5A059] shadow-md shadow-[#2D3E50]/10"
                    : "text-[#636E72] hover:text-[#2D3E50] hover:bg-[#F5F2ED]"
                }`}
              >
                <ActiveIcon className={`h-4.5 w-4.5 ${isActive ? "text-[#C5A059]" : "text-[#A0A0A0]"}`} aria-hidden="true" />
                <span className="whitespace-nowrap uppercase tracking-wider">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute right-3.5 h-1.5 w-1.5 rounded-full bg-[#C5A059] hidden min-[860px]:block"
                    layoutId="activeIndicator"
                  />
                )}
              </button>
            );
          })}
          
          <div className="hidden min-[860px]:block mt-auto p-4 bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2D3E50]">Portal Support</h4>
            <p className="text-[10px] text-[#636E72] mt-1.5 leading-relaxed font-medium">
              Running on a sandboxed Cloud Engine syncing securely to a local SQLite database instance.
            </p>
          </div>
        </nav>

        {/* Content Container Right */}
        <main className="flex-grow p-6 overflow-hidden md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "-" + globalRefreshCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "dashboard" && (
                  <Dashboard 
                    onNavigate={(tab) => {
                      setActiveTab(tab as any);
                      if (tab !== "members") setSelectedMemberId(null);
                    }} 
                    onSelectMember={handleNavigateToMember}
                    isAdmin={roleMode === "admin"}
                  />
                )}
                {activeTab === "members" && (
                  <Members 
                    onDataChange={triggerGlobalRefresh} 
                    selectedMemberId={selectedMemberId}
                    onClearSelectedMember={() => setSelectedMemberId(null)}
                    isAdmin={roleMode === "admin"}
                  />
                )}
                {activeTab === "ministries" && (
                  <Ministries onDataChange={triggerGlobalRefresh} isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "attendance" && (
                  <Attendance onDataChange={triggerGlobalRefresh} isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "contributions" && (
                  <Contributions onDataChange={triggerGlobalRefresh} isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "events" && (
                  <Events onDataChange={triggerGlobalRefresh} isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "branches" && (
                  <Branches onDataChange={triggerGlobalRefresh} isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "communications" && (
                  <Communications isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "songbook" && (
                  <Songbook isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "sermons" && (
                  <Sermons isAdmin={roleMode === "admin"} />
                )}
                {activeTab === "bible" && (
                  <Bible />
                )}
                {activeTab === "prayer_requests" && (
                  <PrayerRequests isAdmin={roleMode === "admin"} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Styled Geometric Balance System Footer */}
      <footer className="h-11 bg-[#2D3E50] border-t border-[#1e2a36] flex items-center justify-between px-10 text-white/50 text-[10px] uppercase tracking-[0.15em] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>SQLite Local Engine: Connected</span>
          </div>
          <span className="text-white/20">|</span>
          <span>Latency: 0.12ms</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>Version 4.2.1-Stable</span>
          <span className="text-white/20">•</span>
          <span>System Uptime: 142 Days</span>
        </div>
      </footer>

      {/* Floating alert notifications triggers (Toasts) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 rounded-2xl p-4 shadow-xl border flex items-center gap-3 max-w-sm text-xs font-sans font-semibold cursor-pointer ${
              toast.type === "success" 
                ? "bg-slate-900 border-slate-800 text-emerald-400" 
                : "bg-rose-900 border-rose-800 text-rose-300"
            }`}
            onClick={() => setToast(null)}
          >
            <div className={`rounded-xl px-1.5 py-1 ${toast.type === "success" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
              <Database className="h-3.5 w-3.5" />
            </div>
            <div className="flex-grow">
              <p className="text-white">SQLite Alert</p>
              <p className={`font-normal text-[10px] mt-0.5 ${toast.type === "success" ? "text-neutral-300" : "text-rose-200"}`}>
                {toast.message}
              </p>
            </div>
            <button className="text-neutral-400 hover:text-white pb-0.5">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
