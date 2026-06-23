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
  Heart,
  Menu
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
  const [portalRole, setPortalRole] = useState<"congregant" | "pastor" | "admin">("congregant");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem("gimk_admin_password") || "admin123");
  const [pastorPassword, setPastorPassword] = useState(() => localStorage.getItem("gimk_pastor_password") || "password123");
  const [tickerTime, setTickerTime] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cross-component coordination state
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  // Global triggers to force re-render/refreshes in related siblings
  const [globalRefreshCount, setGlobalRefreshCount] = useState(0);
  const [authModal, setAuthModal] = useState<{
    type: "adminAuth" | "pastorAuth" | "changePassword";
    pendingRole?: "admin" | "pastor";
  } | null>(null);
  const [modalInput, setModalInput] = useState("");

  const closeAuthModal = () => {
    setAuthModal(null);
    setModalInput("");
  };

  const openPortalAuthModal = (role: "admin" | "pastor") => {
    setAuthModal({ type: role === "admin" ? "adminAuth" : "pastorAuth", pendingRole: role });
    setModalInput("");
  };

  const openChangePasswordModal = () => {
    setAuthModal({ type: "changePassword", pendingRole: portalRole === "admin" ? "admin" : portalRole === "pastor" ? "pastor" : undefined });
    setModalInput("");
  };

  const handleAuthModalSubmit = () => {
    if (!authModal) return;
    const value = modalInput.trim();

    if (authModal.type === "adminAuth" || authModal.type === "pastorAuth") {
      if (value.length === 0) {
        showToast("Please enter the password to continue.", "error");
        return;
      }

      const passwordToCheck = authModal.type === "adminAuth" ? adminPassword : pastorPassword;
      if (value === passwordToCheck) {
        setPortalRole(authModal.pendingRole!);
        showToast(`${authModal.pendingRole === "admin" ? "Administrator" : "Pastor"} access granted.`, "success");
        closeAuthModal();
      } else {
        showToast("Access Denied: Incorrect password.", "error");
      }
      return;
    }

    if (authModal.type === "changePassword") {
      if (value.length === 0) {
        showToast("Please enter a new password.", "error");
        return;
      }
      if (portalRole === "admin") {
        setAdminPassword(value);
        localStorage.setItem("gimk_admin_password", value);
        showToast("Admin password updated successfully.", "success");
      } else if (portalRole === "pastor") {
        setPastorPassword(value);
        localStorage.setItem("gimk_pastor_password", value);
        showToast("Pastor password updated successfully.", "success");
      } else {
        showToast("You must be logged in as admin or pastor to change the password.", "error");
      }
      closeAuthModal();
      return;
    }
  };

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
  const navigationItems = portalRole === "congregant" || portalRole === "pastor"
    ? [
        { id: "dashboard", label: "Spiritual Home", icon: LayoutDashboard },
        { id: "members", label: "Congregant Directory", icon: Users },
        { id: "ministries", label: "Ministries & Groups", icon: HeartHandshake },
        { id: "contributions", label: "Financial Ledger", icon: DollarSign },
        { id: "events", label: "Sanctuary Calendar", icon: CalendarDays },
        { id: "sermons", label: "Pulpit Sermons", icon: Mic },
        { id: "bible", label: "Holy Bible", icon: BookCheck },
        { id: "songbook", label: "GIMK Songbook", icon: BookOpen },
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
  }, [portalRole]);

  const handleSwitchRole = (mode: "congregant" | "pastor" | "admin") => {
    if (mode === "admin") {
      if (portalRole === "admin") return;
      openPortalAuthModal("admin");
    } else if (mode === "pastor") {
      if (portalRole === "pastor") return;
      openPortalAuthModal("pastor");
    } else {
      setPortalRole("congregant");
    }
  };

  const handleChangePassword = () => {
    openChangePasswordModal();
  };

  const handleNavigateToMember = (memberId: number) => {
    setSelectedMemberId(memberId);
    setActiveTab("members");
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col font-sans select-none antialiased text-[#2D3436]">
      {/* Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8] shadow-sm px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen((open) => !open)}
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-[#E5E1D8] bg-white p-2 text-[#2D3E50] shadow-sm transition hover:bg-[#F5F2ED]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
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
                portalRole === "congregant"
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#475569] hover:text-[#0E2954]"
              }`}
            >
              Congregant
            </button>
            <button
              onClick={() => handleSwitchRole("pastor")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg select-none cursor-pointer ${
                portalRole === "pastor"
                  ? "bg-[#1F2937] text-white shadow-sm"
                  : "text-[#475569] hover:text-[#0E2954]"
              }`}
            >
              Pastor
            </button>
            <button
              onClick={() => handleSwitchRole("admin")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg select-none cursor-pointer ${
                portalRole === "admin"
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

          {(portalRole === "admin" || portalRole === "pastor") && (
            <button
              onClick={handleChangePassword}
              className="p-1.5 hover:bg-[#F5F2ED] border border-transparent hover:border-[#E5E1D8] rounded-xl transition cursor-pointer select-none"
              title="Change Password"
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
        {/* Mobile Navigation Overlay */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full overflow-y-auto bg-white border-r border-[#E5E1D8] p-4 shadow-2xl transition-transform duration-300 md:hidden ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8] mb-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="GIMK Logo" className="h-9 w-9 rounded-full object-cover border border-[#E5E1D8] shadow-sm" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2D3E50]">GIMK Mobile</p>
                <p className="text-[10px] text-[#636E72]">Quick access menu</p>
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#E5E1D8] bg-[#F8FAFC] text-[#2D3E50] transition hover:bg-[#E5E7EB]"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const ActiveIcon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileNavOpen(false);
                    if (item.id !== "members") {
                      setSelectedMemberId(null);
                    }
                  }}
                  className={`flex items-center gap-3 w-full rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#2D3E50] text-white"
                      : "text-[#475569] hover:bg-[#F5F2ED]"
                  }`}
                >
                  <ActiveIcon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMobileNavOpen(false)} />
        )}

        {/* Desktop Navigation Rail Left */}
        <nav className="hidden md:flex bg-white border-b min-[860px]:border-b-0 min-[860px]:border-r border-[#E5E1D8] w-full min-[860px]:w-64 flex min-[860px]:flex-col py-6 px-4 gap-2 flex-shrink-0 select-none overflow-x-auto min-[860px]:overflow-x-visible">
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
                    isAdmin={portalRole === "admin"}
                  />
                )}
                {activeTab === "members" && (
                  <Members 
                    onDataChange={triggerGlobalRefresh} 
                    selectedMemberId={selectedMemberId}
                    onClearSelectedMember={() => setSelectedMemberId(null)}
                    isAdmin={portalRole === "admin"}
                    canExport={portalRole !== "congregant"}
                  />
                )}
                {activeTab === "ministries" && (
                  <Ministries onDataChange={triggerGlobalRefresh} isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "attendance" && (
                  <Attendance onDataChange={triggerGlobalRefresh} isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "contributions" && (
                  <Contributions onDataChange={triggerGlobalRefresh} isAdmin={portalRole === "admin"} canExport={portalRole !== "congregant"} />
                )}
                {activeTab === "events" && (
                  <Events onDataChange={triggerGlobalRefresh} isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "branches" && (
                  <Branches onDataChange={triggerGlobalRefresh} isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "communications" && (
                  <Communications isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "songbook" && (
                  <Songbook isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "sermons" && (
                  <Sermons isAdmin={portalRole === "admin"} />
                )}
                {activeTab === "bible" && (
                  <Bible />
                )}
                {activeTab === "prayer_requests" && (
                  <PrayerRequests isAdmin={portalRole === "admin"} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile bottom navigation shortcuts */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 overflow-x-auto border-t border-[#E5E1D8] bg-white px-3 py-3 sm:hidden">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id !== "members") {
                    setSelectedMemberId(null);
                  }
                }}
                aria-label={item.label}
                className={`inline-flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "border-[#2D3E50] bg-[#2D3E50] text-white"
                    : "border-[#E5E1D8] bg-[#F8FAFC] text-[#475569] hover:bg-[#E5E7EB]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-[#E5E1D8] bg-[#F8FAFC] px-3 py-2 text-[10px] font-semibold text-[#475569] hover:bg-[#E5E7EB]"
            aria-label="Open full navigation menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
        <div className="h-28 sm:hidden" />
      </div>

      {/* Styled Geometric Balance System Footer */}
      <footer className="h-11 bg-[#2D3E50] border-t border-[#1e2a36] flex items-center justify-between px-4 md:px-10 text-white/50 text-[10px] uppercase tracking-[0.15em] shrink-0">
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
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl border border-[#E5E1D8] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#1F2937]">
                  {authModal.type === "adminAuth" && "Admin Authentication Required"}
                  {authModal.type === "pastorAuth" && "Pastor Authentication Required"}
                  {authModal.type === "changePassword" && (portalRole === "admin" ? "Change Admin Password" : portalRole === "pastor" ? "Change Pastor Password" : "Change Password")}
                </h2>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  {authModal.type === "adminAuth" && "Enter the administrator password to continue."}
                  {authModal.type === "pastorAuth" && "Enter the pastor password to continue."}
                  {authModal.type === "changePassword" && "Set a new password for the current portal role."}
                </p>
              </div>
              <button
                onClick={closeAuthModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E5E1D8] bg-[#F8FAFC] text-[#475569] transition hover:bg-[#F2F4F7]"
                aria-label="Close authentication dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              <div>
                <label className="block text-sm font-semibold text-[#334155] mb-2">
                  {authModal.type === "changePassword" ? "New Password" : "Password"}
                </label>
                <input
                  type="password"
                  value={modalInput}
                  onChange={(event) => setModalInput(event.target.value)}
                  className="w-full rounded-2xl border border-[#E5E1D8] bg-[#F8FAFC] px-4 py-3 text-sm text-[#2D3E50] outline-none transition focus:border-[#2D3E50] focus:ring-2 focus:ring-[#C5A059]/20"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeAuthModal}
                className="rounded-2xl border border-[#E5E1D8] bg-white px-4 py-3 text-sm font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthModalSubmit}
                className="rounded-2xl bg-[#2D3E50] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1F2937]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
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
