import React, { useEffect, useState } from "react";
import { api } from "../api";
import { ChurchEvent, Ministry } from "../types";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Clock, 
  MapPin, 
  Layers, 
  X, 
  ShieldAlert,
  CalendarDays,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadCSV, downloadICS } from "../utils/exporter";

interface EventsProps {
  onDataChange?: () => void;
  isAdmin?: boolean;
}

export default function Events({ onDataChange, isAdmin = true }: EventsProps) {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter schedules (Upcoming / Past)
  const [timelineTab, setTimelineTab] = useState<"upcoming" | "historical">("upcoming");

  // Form modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [ministryId, setMinistryId] = useState<string>("");

  // Deletion Tracking
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleExportEventsCSV = () => {
    const list = events.map(e => ({
      date: e.date,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time || "",
      location: e.location || "",
      ministry_name: e.ministry_name || "General Gathering",
      description: e.description || ""
    }));
    downloadCSV(list, ["Date", "Title", "Start Time", "End Time", "Location", "Ministry Name", "Description"], "GIMK-Events-Schedules-List");
  };

  const handleDownloadEventICS = (ev: ChurchEvent) => {
    downloadICS([ev], `Event_${ev.title.replace(/[\s\W]+/g, "_")}`);
  };

  const handleDownloadAllEventsICS = () => {
    downloadICS(events, "GIMK-Full-Church-Calendar");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, minData] = await Promise.all([
        api.getEvents(),
        api.getMinistries()
      ]);
      setEvents(eventsData);
      setMinistries(minData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load events database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndTime("11:00");
    setLocation("Main Sanctuary");
    setMinistryId("");
    setShowFormModal(true);
  };

  const openEditForm = (ev: ChurchEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description || "");
    setDate(ev.date);
    setStartTime(ev.start_time);
    setEndTime(ev.end_time || "");
    setLocation(ev.location || "");
    setMinistryId(ev.ministry_id ? ev.ministry_id.toString() : "");
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) {
      alert("Title, Date, and Start Time are required.");
      return;
    }

    const payload = {
      title,
      description: description.trim() || null,
      date,
      start_time: startTime,
      end_time: endTime || null,
      location: location.trim() || null,
      ministry_id: ministryId ? parseInt(ministryId, 10) : null
    };

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, payload);
      } else {
        await api.addEvent(payload);
      }
      setShowFormModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Saving event failed: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEvent(id);
      setDeletingId(null);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Deleting event failed: " + err.message);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, mins] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedH = h % 12 || 12;
    return `${formattedH}:${mins} ${ampm}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter(e => {
    if (timelineTab === "upcoming") {
      return e.date >= todayStr;
    } else {
      return e.date < todayStr;
    }
  });

  // Sort upcoming ascending, past descending
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (timelineTab === "upcoming") {
      return a.date.localeCompare(b.date);
    } else {
      return b.date.localeCompare(a.date);
    }
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2.5xl font-bold tracking-tight text-[#2D3E50] uppercase">Events & Schedules</h1>
          <p className="text-sm font-normal text-[#636E72]">
            Register weekly services, choir practices, picnics, and community outreach.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 select-none">
          <button
            onClick={handleExportEventsCSV}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 transition cursor-pointer"
            title="Download full events calendar as spreadsheets"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadAllEventsICS}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 transition cursor-pointer"
            title="Download full calendar as an iCal .ics event file"
          >
            <Calendar className="h-4 w-4 text-[#C5A059]" />
            <span>Download All ICS</span>
          </button>

          {isAdmin && (
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2D3E50] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C5A059] hover:bg-[#1e2a36] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Event</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <p className="mt-3 text-xs text-[#A0A0A0] font-semibold uppercase tracking-wider">Drawing calendar timelines...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-6 text-center">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs switch (Upcoming vs Historical) */}
          <div className="flex border-b border-neutral-200 select-none">
            {[
              { id: "upcoming", label: "Upcoming Schedules" },
              { id: "historical", label: "Past Logs Archives" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimelineTab(tab.id as any)}
                className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer relative ${
                  timelineTab === tab.id 
                    ? "border-[#C5A059] text-[#2D3E50]" 
                    : "border-transparent text-neutral-400 hover:text-[#2D3E50]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Deck List */}
          <div className="grid gap-5 md:grid-cols-2">
            {sortedEvents.length === 0 ? (
              <div className="shadow-sm md:col-span-2 py-16 text-center border border-[#E5E1D8] rounded-xl bg-white text-[#A0A0A0] font-sans">
                <CalendarDays className="h-10 w-10 text-[#C5A059]/40 mx-auto" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#636E72]">No scheduled events found.</p>
                <button 
                  onClick={openAddForm}
                  className="mt-2 text-xs text-[#C5A059] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Create an event posting now
                </button>
              </div>
            ) : (
              sortedEvents.map(e => {
                const dateObj = new Date(e.date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex rounded-2xl border border-neutral-150 bg-white shadow-sm overflow-hidden p-4 group hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] transition-all"
                  >
                    {/* Date Block Left */}
                    <div className="flex flex-col items-center justify-center bg-neutral-50 border rounded-xl px-4 py-2 text-center h-fit min-w-[70px] flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{weekday}</span>
                      <span className="text-2xl font-black font-display text-[#2D3E50] my-1 leading-tight">{day}</span>
                      <span className="text-[10px] font-bold text-[#C5A059] tracking-widest">{month}</span>
                    </div>

                    {/* Meta Details Middle */}
                    <div className="ml-4 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Tags line */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {e.ministry_name ? (
                            <span className="inline-flex items-center gap-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded px-2 py-0.5 text-[9px] font-bold text-[#C5A059] uppercase tracking-wider">
                              <Layers className="h-2.5 w-2.5" />
                              {e.ministry_name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-neutral-100 border rounded px-2 py-0.5 text-[9px] font-semibold text-[#636E72]">
                              General Gathering
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-display font-bold text-sm text-[#2D3E50] group-hover:text-[#C5A059] transition mt-2 leading-tight">
                          {e.title}
                        </h3>
                        {e.description && (
                          <p className="mt-1 text-xs text-[#636E72] leading-relaxed font-normal line-clamp-2">
                            {e.description}
                          </p>
                        )}
                      </div>

                      {/* Location & Time icons block */}
                      <div className="mt-4 border-t border-neutral-100 pt-2.5 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-neutral-450 uppercase tracking-wide">
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{formatTime(e.start_time)}{e.end_time ? ` - ${formatTime(e.end_time)}` : ""}</span>
                          </div>
                          {e.location && (
                            <div className="flex items-center gap-1 max-w-[180px] truncate">
                              <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                              <span className="truncate">{e.location}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDownloadEventICS(e)}
                          className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 rounded px-2 py-1 transition cursor-pointer select-none"
                          title="Save this event to Apple/Outlook/Google Calendar (.ics)"
                        >
                          <Download className="h-3 w-3" />
                          <span>Add to Cal</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick controls right */}
                    {isAdmin && (
                      <div className="ml-2 flex flex-col items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition select-none">
                        <button
                          onClick={() => openEditForm(e)}
                          className="p-1.5 border border-neutral-100 hover:border-neutral-250 rounded-lg text-neutral-404 hover:text-cyan-600 hover:bg-neutral-50 transition"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeletingId(e.id)}
                          className="p-1.5 border border-neutral-100 hover:border-neutral-250 rounded-lg text-neutral-404 hover:text-rose-600 hover:bg-neutral-50 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SCHEDULER INPUT FORM POPUP */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150 text-xs"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3.5">
                <div>
                  <h2 className="font-display text-base font-bold text-neutral-900">
                    {editingEvent ? "Modify Scheduled Event" : "Create Calendar Booking"}
                  </h2>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Scheduler Module</p>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="rounded-lg p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Event Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wednesday Midweek Praise"
                    className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold text-[#2D3436] transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Event Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide notes list, special goals, or speaker details..."
                    className="w-full rounded-xl bg-neutral-50/70 border border-[#E5E1D8] p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition resize-none"
                  />
                </div>

                {/* Grid: Date */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition"
                  />
                </div>

                {/* Grid: Times */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition"
                    />
                  </div>
                </div>

                {/* Grid: Location / Ministry */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Physical Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Choir Hall"
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-medium text-[#2D3436] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Host Ministry</label>
                    <select
                      value={ministryId}
                      onChange={(e) => setMinistryId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50/70 border border-[#E5E1D8] px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                    >
                      <option value="">General (No group host)</option>
                      {ministries.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Controls */}
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
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVELATION DELETION CONFIRM */}
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
              <h3 className="font-display text-base font-bold text-neutral-900 font-sans">Cancel booking event?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-semibold">
                Are you sure you want to cancel and remove this scheduled event booking from the SQLite records? This cannot be undone.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-bold transition cursor-pointer"
                >
                  No, Keep Event
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deletingId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black transition cursor-pointer"
                >
                  Yes, Cancel Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
