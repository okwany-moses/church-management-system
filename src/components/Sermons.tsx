import React, { useState, useEffect, useRef } from "react";
import { Sermon } from "../types";
import { api } from "../api";
import { 
  Search, 
  Mic, 
  Video, 
  Play, 
  Pause, 
  Plus, 
  Calendar, 
  User, 
  BookOpen, 
  FileText, 
  Trash2, 
  UploadCloud, 
  CheckCircle,
  Volume2,
  VolumeX,
  X,
  Radio,
  FileVolume,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadCSV } from "../utils/exporter";

export default function Sermons({ isAdmin = true }: { isAdmin?: boolean }) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Media Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [duration, setDuration] = useState(180); // in seconds, default virtual
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activePlaybackType, setActivePlaybackType] = useState<"audio" | "video" | null>(null);

  // New Sermon Upload Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("Apostle Newton Atela");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [scripture, setScripture] = useState("");
  const [content, setContent] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const handleExportSermonsCatalog = () => {
    const headers = ["Date", "Title", "Speaker", "Scripture", "Content Summary", "Audio URL", "Video URL"];
    downloadCSV(sermons, headers, "GIMK-Sermons-Catalog");
  };

  const handleDownloadSelectedSermonText = () => {
    if (!selectedSermon) return;
    const fileContent = `GIDEONS INTERNATIONAL MINISTRIES KENYA (GIMK)
===================================================
SERMON TRANSCRIPT & STUDY GUIDE REPORT
---------------------------------------------------
Title:       ${selectedSermon.title}
Preacher:    ${selectedSermon.speaker}
Date:        ${selectedSermon.date}
Scriptures:  ${selectedSermon.scripture || "General Pulpit"}
---------------------------------------------------

SERMON CONTENT NOTES:
${selectedSermon.content || "No transcripts or notes configured for this sermon."}

===================================================
Downloaded from GIMK Digital Sanctuary Pulpit on ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sermon_Notes_${selectedSermon.title.replace(/[\s\W]+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadSermons = async () => {
    try {
      setLoading(true);
      const data = await api.getSermons();
      setSermons(data);
      if (data.length > 0 && !selectedSermon) {
        setSelectedSermon(data[0]);
      }
    } catch (err) {
      console.error("Error loading sermons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, []);

  // Filtered Sermons List
  const filteredSermons = sermons.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.speaker.toLowerCase().includes(q) ||
      (s.scripture && s.scripture.toLowerCase().includes(q)) ||
      s.date.includes(q)
    );
  });

  // Simulated timer for player
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);

  // Handle play toggle
  const togglePlay = (type: "audio" | "video") => {
    if (activePlaybackType !== type) {
      setActivePlaybackType(type);
      setAudioProgress(0);
      setIsPlaying(true);
      if (type === "audio") audioRef.current?.play();
    } else {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format Helper for Time (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  // Post new sermon
  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !speaker || !date) {
      setFormError("Title, preacher/speaker, and date are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.addSermon({
        title,
        speaker,
        date,
        scripture: scripture || null,
        content: content || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
      });

      setSuccessToast("Sermon uploaded successfully to the HQ database!");
      setTimeout(() => setSuccessToast(""), 4000);

      // Clean inputs
      setTitle("");
      setScripture("");
      setContent("");
      setAudioUrl("");
      setVideoUrl("");
      setShowAddForm(false);
      loadSermons();
    } catch (err: any) {
      setFormError(err.message || "Failed to save sermon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSermon = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this sermon from GIMK digital library?")) return;
    try {
      await api.deleteSermon(id);
      if (selectedSermon?.id === id) {
        setSelectedSermon(null);
      }
      setSuccessToast("Sermon deleted successfully from GIMK library.");
      setTimeout(() => setSuccessToast(""), 3000);
      loadSermons();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Mock Drop of virtual media
  const handleMockUpload = (type: "audio" | "video") => {
    if (type === "audio") {
      setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
      alert("Virtual Audio track successfully linked!");
    } else {
      setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
      alert("Virtual Video broadcast successfully linked!");
    }
  };

  return (
    <div id="sermons-tab-root" className="h-[calc(100vh-140px)] flex flex-col bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-sm">
      
      {/* Alert element for successes */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bar header banner */}
      <div className="bg-[#2D3E50] text-[#FDFCF8] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2a36]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl text-[#C5A059]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider font-display select-none">HHQ Sermons & Messages</h1>
            <p className="text-[10px] text-zinc-300 font-medium">Upload audio podcasts, pulpit transcripts and digital recordings for members</p>
          </div>
        </div>

         {/* Action controls */}
         <div className="flex items-center gap-2">
           <button
             onClick={handleExportSermonsCatalog}
             disabled={sermons.length === 0}
             className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20 hover:border-white/40 hover:bg-white/5 disabled:opacity-50 transition cursor-pointer select-none flex items-center gap-1.5 text-zinc-100"
             title="Export full sermon catalog (CSV)"
           >
             <FileSpreadsheet className="h-3.5 w-3.5 text-[#C5A059]" />
             <span>Export Catalog CSV</span>
           </button>
           {isAdmin && (
             <button
               id="sermon-upload-toggle-btn"
               onClick={() => setShowAddForm(!showAddForm)}
               className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#C5A059] text-[#2D3E50] hover:bg-[#b08e4d] transition cursor-pointer select-none flex items-center gap-1.5"
             >
               {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
               <span>{showAddForm ? "Close Panel" : "Publish Sermon"}</span>
             </button>
           )}
         </div>
      </div>

      {/* Primary Layout splitting index from view */}
      <div className="flex-grow flex overflow-hidden relative">
        
        {/* Left column listing */}
        <div className="w-80 border-r border-[#E5E1D8] bg-[#FDFCF8] flex flex-col shrink-0">
          
          {/* Quick search */}
          <div className="p-4 border-b border-[#E5E1D8] bg-white sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A0A0A0]" />
              <input
                id="sermon-search-input"
                type="text"
                placeholder="Search preacher, date, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-[#2D3E50] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              />
            </div>
            <div className="text-[10px] uppercase font-bold text-[#A0A0A0] mt-2 px-1">
              Active Broadcasts ({filteredSermons.length})
            </div>
          </div>

          {/* List entries */}
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="text-center py-20 text-xs text-[#A0A0A0] font-bold uppercase">Scanning library...</div>
            ) : filteredSermons.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="h-8 w-8 text-[#A0A0A0]/40 mx-auto mb-2" />
                <p className="text-xs text-[#A0A0A0] font-bold uppercase tracking-wider">No Sermons Found</p>
                <p className="text-[10px] text-[#A0A0A0]/70 mt-1">Try refining your search keyword or date.</p>
              </div>
            ) : (
              filteredSermons.map((sermon) => {
                const isSelected = selectedSermon?.id === sermon.id;
                return (
                  <button
                    id={`sermon-item-${sermon.id}`}
                    key={sermon.id}
                    onClick={() => {
                      setSelectedSermon(sermon);
                      setIsPlaying(false);
                      setAudioProgress(0);
                      setActivePlaybackType(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#2D3E50] border-[#2D3E50] text-white shadow-md shadow-[#2D3E50]/10"
                        : "bg-white hover:bg-[#F5F2ED] border-[#E5E1D8] text-[#2D3E50]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-[#C5A059] text-[#2D3E50]" : "bg-[#F5F2ED] text-[#636E72]"
                      }`}>
                        {sermon.date}
                      </span>
                      <div className="flex items-center gap-1">
                        {sermon.audio_url && <Mic className="h-3 w-3 text-emerald-500" />}
                        {sermon.video_url && <Video className="h-3 w-3 text-sky-500" />}
                      </div>
                    </div>

                    <h3 className="font-bold text-xs mt-2 line-clamp-1">{sermon.title}</h3>
                    
                    <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                      <User className="h-3 w-3 text-[#A0A0A0]" />
                      <p className={`font-semibold ${isSelected ? "text-neutral-300" : "text-[#636E72]"}`}>
                        {sermon.speaker}
                      </p>
                    </div>

                    {sermon.scripture && (
                      <p className={`text-[9px] font-mono mt-1 font-bold ${isSelected ? "text-amber-200" : "text-[#C5A059]"}`}>
                        📖 {sermon.scripture}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column view reader details OR Upload form */}
        <div className="flex-grow bg-[#FDFCF8] overflow-y-auto relative">
          
          {showAddForm ? (
            
            /* PUBLISH SERMON COMPREHENSIVE FORM */
            <div className="p-6 md:p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest block">HQ Clerical Publisher</span>
                <h2 className="text-base font-bold text-[#2D3E50] uppercase mt-1">Upload New Pulpit Lesson</h2>
                <p className="text-[11px] text-[#636E72] mt-1 leading-relaxed">
                  Record and file weekly sermons in GIMK virtual database to distribute messages with localized congregants of Ramba, Nairobi, and Mombasa branches.
                </p>
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs font-semibold mb-4">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddSermon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block mb-1">Sermon Title *</label>
                    <input
                      id="form-sermon-title"
                      type="text"
                      required
                      placeholder="e.g. Entering God's Glory"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-[#E5E1D8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block mb-1">Preacher / Speaker *</label>
                    <select
                      id="form-sermon-speaker"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                      className="w-full bg-white border border-[#E5E1D8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    >
                      <option value="Apostle Newton Atela">Apostle Newton Atela</option>
                      <option value="Rev. Joseph Omwamba">Rev. Joseph Omwamba</option>
                      <option value="Evangelist Mary Atieno">Evangelist Mary Atieno</option>
                      <option value="Elder John Ochieng">Elder John Ochieng</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block mb-1">Pulpit Delivery Date *</label>
                    <input
                      id="form-sermon-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-[#E5E1D8] rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block mb-1">Scripture Reference (Optional)</label>
                    <input
                      id="form-sermon-scripture"
                      type="text"
                      placeholder="e.g. Genesis 12:1-4"
                      value={scripture}
                      onChange={(e) => setScripture(e.target.value)}
                      className="w-full bg-white border border-[#E5E1D8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block mb-1">Sermon Summary & Transcription Notes</label>
                  <textarea
                    id="form-sermon-content"
                    rows={4}
                    placeholder="Enter transcript summaries, sermon key points, or full texts..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white border border-[#E5E1D8] rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-[#C5A059] focus:outline-none resize-none"
                  />
                </div>

                {/* Media Links Mock attachments */}
                <div className="bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl p-4 space-y-3.5">
                  <span className="text-[10px] font-bold text-[#2D3E50] uppercase tracking-wider block">Attached Media Audio/Video Channels</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-[#636E72] uppercase block mb-1">Audio Recording URL</span>
                      <div className="flex gap-1.5">
                        <input
                          id="form-sermon-audiourl"
                          type="text"
                          placeholder="Mock audio url..."
                          value={audioUrl}
                          onChange={(e) => setAudioUrl(e.target.value)}
                          className="flex-grow bg-white border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleMockUpload("audio")}
                          className="bg-[#2D3E50] text-[#C5A059] px-2 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Fill Mock Track
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-[#636E72] uppercase block mb-1">Video Stream URL</span>
                      <div className="flex gap-1.5">
                        <input
                          id="form-sermon-videourl"
                          type="text"
                          placeholder="Mock video url..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="flex-grow bg-white border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleMockUpload("video")}
                          className="bg-[#2D3E50] text-[#C5A059] px-2 py-1 text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Fill Mock Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-[#E5E1D8] rounded-xl text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-[#F5F2ED] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-sermon-btn"
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>{submitting ? "Uploading message..." : "File Sermon Entry"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : selectedSermon ? (
            
            /* SERMON READER & PLAYER VIEW */
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E5E1D8] pb-6 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] px-2 py-0.5 rounded-md">
                      Pulpit Date: {selectedSermon.date}
                    </span>
                    {selectedSermon.scripture && (
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-[#C5A059] border border-amber-100 px-2 py-0.5 rounded-md">
                        Scripture: {selectedSermon.scripture}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold font-display text-[#2D3E50] uppercase leading-tight">
                    {selectedSermon.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#636E72] pt-1">
                    <User className="h-4 w-4 text-[#C5A059]" />
                    <span>Delivered by <strong className="text-[#2D3E50]">{selectedSermon.speaker}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 select-none">
                  <button
                    onClick={handleDownloadSelectedSermonText}
                    className="p-2 border border-[#E5E1D8] bg-[#FDFCF8] hover:bg-amber-50/40 text-[#636E72] hover:text-[#C5A059] hover:border-amber-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                    title="Download written sermon report & transcripts"
                  >
                    <Download className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Download Notes</span>
                  </button>

                  {isAdmin && (
                    <button
                      id={`delete-sermon-btn-${selectedSermon.id}`}
                      onClick={() => handleDeleteSermon(selectedSermon.id)}
                      className="p-2 border border-[#E5E1D8] hover:bg-rose-50 text-neutral-400 hover:text-red-500 rounded-xl transition cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider shrink-0"
                      title="Remove Sermon from online catalog"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete Sermon</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Media play sections if attachments exist */}
              {(selectedSermon.audio_url || selectedSermon.video_url) && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider block">Available Media Recordings:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Audio streaming player panel */}
                    {selectedSermon.audio_url ? (
                      <div className="bg-[#2D3E50]/5 border border-[#2D3E50]/15 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="h-4.5 w-4.5 text-[#C5A059]" />
                            <span className="text-xs font-bold text-[#2D3E50] uppercase">Audio Broadcast Podcast</span>
                            <audio 
                              ref={audioRef} 
                              src={selectedSermon.audio_url} 
                              onTimeUpdate={(e) => setAudioProgress(Math.floor(e.currentTarget.currentTime))}
                              onLoadedMetadata={(e) => setDuration(Math.floor(e.currentTarget.duration))}
                              onEnded={() => setIsPlaying(false)}
                              className="hidden"
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Connected</span>
                        </div>

                        {/* Interactive sound wave simulation */}
                        <div className="flex items-center gap-1 h-8 my-4 justify-center">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1 rounded-full bg-[#C5A059] transition-all`}
                              style={{ 
                                height: isPlaying && activePlaybackType === "audio"
                                  ? `${Math.max(4, Math.sin(audioProgress + i) * 24 + 12)}px` 
                                  : "8px" 
                              }}
                            />
                          ))}
                        </div>

                        {/* Media controls */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#636E72]">
                            <span>{activePlaybackType === "audio" ? formatTime(audioProgress) : "0:00"}</span>
                            <span>{formatTime(duration)}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              id="audio-play-toggle-btn"
                              onClick={() => togglePlay("audio")}
                              className="p-2.5 bg-[#C5A059] hover:bg-[#b08e4d] text-[#2D3E50] rounded-xl transition cursor-pointer"
                            >
                              {isPlaying && activePlaybackType === "audio" ? <Pause className="h-4.5 w-4.5 fill-[#2D3E50]" /> : <Play className="h-4.5 w-4.5 fill-[#2D3E50]" />}
                            </button>
                            
                            {/* Track bar progress */}
                            <div className="flex-grow bg-zinc-200 h-1.5 rounded-full overflow-hidden relative cursor-pointer">
                              <div 
                                className="bg-[#C5A059] h-full transition-all" 
                                style={{ width: `${activePlaybackType === "audio" ? (audioProgress / duration) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="border border-dashed border-[#E5E1D8] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <FileVolume className="h-7 w-7 text-neutral-300" />
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">No Audio link filed</span>
                      </div>
                    )}


                    {/* Video streaming broadcast panel */}
                    {selectedSermon.video_url ? (
                      <div className="bg-[#2D3E50]/5 border border-[#2D3E50]/15 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Video className="h-4.5 w-4.5 text-sky-600" />
                            <span className="text-xs font-bold text-[#2D3E50] uppercase">Video Stream Broadcast</span>
                          </div>
                          <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded uppercase">Satellite</span>
                        </div>

                        {/* Interactive HTML5 embedded player or mock display */}
                        {isPlaying && activePlaybackType === "video" ? (
                          <div className="rounded-xl overflow-hidden border border-zinc-200 mb-3 bg-black aspect-video relative">
                            <video 
                              src={selectedSermon.video_url} 
                              controls 
                              autoPlay 
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div 
                            onClick={() => togglePlay("video")}
                            className="rounded-xl bg-slate-900 flex flex-col items-center justify-center aspect-video cursor-pointer border border-zinc-700/50 relative hover:opacity-90 mb-3 group"
                          >
                            <div className="p-3 bg-white/10 rounded-full text-[#C5A059] group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 fill-[#C5A059]" />
                            </div>
                            <span className="text-[9px] font-mono text-zinc-300 font-bold mt-2 uppercase tracking-wider">Click stream to load video</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#636E72]">
                          <span>Satellite Stream</span>
                          <button
                            id="video-play-mock-btn"
                            onClick={() => togglePlay("video")}
                            className="text-xs text-[#C5A059] hover:underline cursor-pointer"
                          >
                            {isPlaying && activePlaybackType === "video" ? "Hide Stream" : "Open Stream"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#E5E1D8] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <Video className="h-7 w-7 text-neutral-300" />
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">No video stream filed</span>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Transcript summary */}
              <div className="bg-white border border-[#E5E1D8] p-6 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D3E50] uppercase tracking-wider border-b border-[#F5F2ED] pb-3">
                  <FileText className="h-4.5 w-4.5 text-[#C5A059]" />
                  <span>Sermon transcript & Summary details</span>
                </div>
                
                <p className="font-sans text-xs md:text-sm text-[#2D3D50] leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedSermon.content || "No detailed written transcripts or pulpit notes were submitted with this filing sermon record. For deep doctrinal study, please contact the branch administrator or senior church elders."}
                </p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Mic className="h-12 w-12 text-[#C5A059] animate-bounce mb-3" />
              <h2 className="text-sm font-bold text-[#2D3E50] uppercase tracking-wider">GIMK Library Empty</h2>
              <p className="text-xs text-[#636E72] max-w-sm mt-1.5 leading-relaxed font-semibold">
                There are no published sermons currently stored. Open the "Publish Sermon" panel above to save a message!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
