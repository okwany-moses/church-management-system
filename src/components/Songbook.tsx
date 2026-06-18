import React, { useState, useEffect, useRef } from "react";
import { Hymn } from "../data/hymns";
import { api } from "../api";
import { 
  Search, 
  Languages, 
  Plus,
  Play, 
  Square, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Bookmark, 
  BookmarkPlus, 
  BookmarkCheck, 
  ChevronRight, 
  Check, 
  Music, 
  Volume2, 
  Type, 
  Info, 
  ArrowLeft,
  X,
  Trash2,
  FileText,
  FileDown,
  UploadCloud,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const HYMN_CATEGORIES = [
  "All", 
  "Grace & Salvation",
  "Praise & Worship", 
  "Hymns of Faith", 
  "Choir Specials", 
  "Youth Songs"
];

export default function Songbook({ isAdmin = true }: { isAdmin?: boolean }) {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  // Navigation states
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  
  // Master PDF Settings
  const [masterPdfUrl, setMasterPdfUrl] = useState(() => localStorage.getItem("gimk_master_songbook_pdf") || "");
  const [showSettings, setShowSettings] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Audio synthesizer states
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Layout / custom view preferences
  const [viewLanguage, setViewLanguage] = useState<"english" | "kiswahili" | "luo" | "side-by-side">("side-by-side");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState<number>(16); // px font size for lyrics
  const [presentationMode, setPresentationMode] = useState(false);

  // Playlist / bookmarks local storage state
  const [favorites, setFavorites] = useState<number[]>([]);
  const [servicePlaylist, setServicePlaylist] = useState<number[]>([]);

  // Add Hymn State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHymn, setNewHymn] = useState({
    number: "",
    category: "Praise & Worship",
    key: "C Major",
    author: "",
    scripture: "",
    description: "",
    pdf_url: "",
    pdf_page: "",
    languages: {
      english: { title: "", verses: [""] },
      kiswahili: { title: "", verses: [""] },
      luo: { title: "", verses: [""] }
    }
  });
  const [submitting, setSubmitting] = useState(false);

  const handlePublishHymn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHymn.number || !newHymn.languages.english.title) {
      alert("Hymn number and at least an English title are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.addHymn({
        ...newHymn,
        number: parseInt(newHymn.number, 10),
        pdf_page: newHymn.pdf_page ? parseInt(newHymn.pdf_page, 10) : undefined
      });
      setShowAddModal(false);
      loadHymns();
      alert("Hymn published successfully!");
    } catch (err: any) {
      alert("Error publishing hymn: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockPdfUpload = () => {
    setNewHymn(prev => ({ ...prev, pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }));
    alert("Virtual PDF document linked successfully!");
  };

  const handleSaveMasterPdf = () => {
    localStorage.setItem("gimk_master_songbook_pdf", masterPdfUrl);
    setShowSettings(false);
    alert("Master Songbook PDF updated!");
  };

  const loadHymns = async () => {
    try {
      const data = await api.getHymns();
      setHymns(data);
      if (Array.isArray(data)) setHymns(data);
    } catch (err) {
      console.error("Error loading hymns:", err);
    }
  };

  const handleDeleteHymn = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this hymn?")) return;
    try {
      await api.deleteHymn(id);
      if (selectedHymn?.id === id) setSelectedHymn(null);
      loadHymns();
    } catch (err: any) {
      alert("Error deleting hymn: " + err.message);
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    loadHymns();
    const savedFavorites = localStorage.getItem("gideons_songbook_favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedPlaylist = localStorage.getItem("gideons_songbook_playlist");
    if (savedPlaylist) setServicePlaylist(JSON.parse(savedPlaylist));
  }, []);

  // Sync favorites helper
  const toggleFavorite = (num: number) => {
    const updated = favorites.includes(num)
      ? favorites.filter(id => id !== num)
      : [...favorites, num];
    setFavorites(updated);
    localStorage.setItem("gideons_songbook_favorites", JSON.stringify(updated));
  };

  // Sync playlist helper
  const togglePlaylistItem = (num: number) => {
    const updated = servicePlaylist.includes(num)
      ? servicePlaylist.filter(id => id !== num)
      : [...servicePlaylist, num];
    setServicePlaylist(updated);
    localStorage.setItem("gideons_songbook_playlist", JSON.stringify(updated));
  };

  // Instant filtering
  const filteredHymns = hymns.filter(h => {
    const matchesCategory = selectedCategory === "All" || h.category === selectedCategory;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    // Search by number directly
    const matchesNumber = h.number.toString() === query;

    // Search inside titles
    const matchesEnglishTitle = h.languages?.english?.title?.toLowerCase().includes(query);
    const matchesKiswahiliTitle = h.languages?.kiswahili?.title?.toLowerCase().includes(query);
    const matchesLuoTitle = h.languages?.luo?.title?.toLowerCase().includes(query);

    // Search inside verses text
    const matchesLyrics = [
      ...(h.languages?.english?.verses || []),
      ...(h.languages?.kiswahili?.verses || []),
      ...(h.languages?.luo?.verses || [])
    ].some(verse => verse?.toLowerCase().includes(query));

    return matchesCategory && (matchesNumber || matchesEnglishTitle || matchesKiswahiliTitle || matchesLuoTitle || matchesLyrics);
  });

  // Synthesizer Tune Playback
  const playHymnMelodyKey = (hymn: Hymn) => {
    if (isPlaying) {
      stopMelody();
      return;
    }

    const notes = hymn.melodyNotes || [];
    if (notes.length === 0) return;

    // Set up audio context
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    setIsPlaying(true);
    let noteIdx = 0;

    const playNextNote = () => {
      if (noteIdx >= notes.length) {
        stopMelody();
        return;
      }

      setActiveNoteIdx(noteIdx);
      const currentNote = notes[noteIdx];
      const freqMap: Record<string, number> = {
        "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99,
        "G4": 392.00, "G#4": 415.30, "A4": 440.00, "Bb4": 466.16, "B4": 493.88,
        "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "Gb5": 739.99,
        "G5": 783.99, "Ab5": 830.61, "A5": 880.00
      };

      const freq = freqMap[currentNote.note] || 440;

      // Primary synth oscillator (warm triangle wave for organ feel)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Sub harmonic for rich acoustic warm organ volume backing
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(freq / 2, ctx.currentTime);

      // Volume envelope to prevent sharp pops
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (currentNote.duration / 1000) - 0.05);

      subGain.gain.setValueAtTime(0, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.03);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (currentNote.duration / 1000) - 0.05);

      osc.connect(gainNode);
      subOsc.connect(subGain);
      
      gainNode.connect(ctx.destination);
      subGain.connect(ctx.destination);

      osc.start();
      subOsc.start();
      
      osc.stop(ctx.currentTime + (currentNote.duration / 1000));
      subOsc.stop(ctx.currentTime + (currentNote.duration / 1000));

      audioIntervalRef.current = setTimeout(() => {
        noteIdx++;
        playNextNote();
      }, currentNote.duration);
    };

    playNextNote();
  };

  const stopMelody = () => {
    setIsPlaying(false);
    setActiveNoteIdx(null);
    if (audioIntervalRef.current) {
      clearTimeout(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div id="church-songbook-root" className="h-[calc(100vh-140px)] flex flex-col bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-sm">
      
      {/* Upper toolbar banner */}
      <div className="bg-[#2D3E50] text-[#FDFCF8] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2a36]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl text-[#C5A059]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider font-display select-none">Divine Multilingual Songbook</h1>
            <p className="text-[10px] text-zinc-300 font-medium">Dual & Tri-language verse-aligned hymn comparison tracker</p>
          </div>
          <div className="ml-4">
            {isAdmin && (
              <button
                onClick={() => {
                  setNewHymn({
                    number: (hymns.length + 1).toString(),
                    category: "Praise & Worship",
                    key: "C Major",
                    author: "",
                    scripture: "",
                    description: "",
                    languages: { english: { title: "", verses: [""] }, kiswahili: { title: "", verses: [""] }, luo: { title: "", verses: [""] } },
                    pdf_url: "",
                    pdf_page: ""
                  });
                  setShowAddModal(true);
                }}
                className="bg-[#C5A059] text-[#2D3E50] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#b08e4d] transition flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Publish Hymn
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition text-zinc-300 hover:text-white"
              title="Songbook Settings"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Categories slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {HYMN_CATEGORIES.map((cat) => (
            <button
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer select-none ${
                selectedCategory === cat
                  ? "bg-[#C5A059] text-[#2D3E50] shadow-sm"
                  : "bg-[#1e2a36] text-zinc-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master PDF Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: "auto" }} 
            exit={{ height: 0 }}
            className="bg-[#1e2a36] border-b border-white/5 overflow-hidden"
          >
            <div className="p-4 flex flex-col md:flex-row items-end gap-4 max-w-4xl">
              <div className="flex-grow">
                <label className="block text-[9px] font-black uppercase text-zinc-400 mb-1">Master Songbook PDF URL (300+ Pages File)</label>
                <input 
                  type="text" 
                  value={masterPdfUrl} 
                  onChange={(e) => setMasterPdfUrl(e.target.value)}
                  placeholder="https://example.com/full-songbook.pdf"
                  className="w-full h-9 bg-black/20 border border-white/10 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <button onClick={handleSaveMasterPdf} className="h-9 bg-[#C5A059] text-[#2D3E50] px-4 rounded-lg text-[10px] font-black uppercase">Save Configuration</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interface layout */}
      <div className="flex-grow flex overflow-hidden relative">
        
        {/* Sidebar Navigation Column */}
        <div 
          id="songbook-sidebar"
          className={`${
            sidebarOpen ? "w-80 border-r" : "w-0 overflow-hidden"
          } transition-all duration-300 bg-[#FDFCF8] border-[#E5E1D8] flex flex-col shrink-0 overflow-y-auto`}
        >
          {/* Quick Find input bar */}
          <div className="p-4 border-b border-[#E5E1D8] bg-white sticky top-0 z-10 flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#A0A0A0]" />
              <input
                id="hymn-search-input"
                type="text"
                placeholder="Search number, title, or lyric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-[#2D3E50] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              />
              {searchQuery && (
                <button
                  id="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 hover:text-[#2D3E50] text-[#A0A0A0] transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* List selector stats bar */}
            <div className="flex items-center justify-between text-[10px] font-bold text-[#A0A0A0] uppercase px-1 mt-1">
              <span>Hymns ({filteredHymns.length})</span>
              {favorites.length > 0 && (
                <span className="text-[#C5A059] font-black">{favorites.length} Favorites</span>
              )}
            </div>
          </div>

          {/* Hymn lists entries */}
          <div className="flex-grow overflow-y-auto p-2 space-y-1">
            {filteredHymns.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="h-8 w-8 text-[#A0A0A0]/40 mx-auto mb-2" />
                <p className="text-xs text-[#A0A0A0] font-bold uppercase tracking-wider">No matching hymns</p>
                <p className="text-[11px] text-[#A0A0A0]/70 mt-1">Try searching a different keyword or number.</p>
              </div>
            ) : (
              filteredHymns.map((hymn) => {
                const isSelected = selectedHymn?.number === hymn.number;
                const isFav = favorites.includes(hymn.number);
                const isInPlaylist = servicePlaylist.includes(hymn.number);

                return (
                  <button
                    id={`hymn-item-${hymn.number}`}
                    key={hymn.number}
                    onClick={() => {
                      setSelectedHymn(hymn);
                      stopMelody();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      isSelected
                        ? "bg-[#2D3E50] border-[#2D3E50] text-white shadow-md shadow-[#2D3E50]/10"
                        : "bg-white hover:bg-[#F5F2ED] border-[#E5E1D8] text-[#2D3E50]"
                    }`}
                  >
                    <div className="flex-grow mr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase ${
                          isSelected ? "bg-[#C5A059] text-[#2D3E50]" : "bg-[#F5F2ED] text-[#636E72]"
                        }`}>
                          #{hymn.number}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          isSelected ? "text-amber-200" : "text-[#A0A0A0]"
                        }`}>
                          {hymn.key} • {hymn.category}
                        </span>
                      </div>
                      
                      <div className="text-left mt-1.5 font-bold text-xs">
                        <p className="line-clamp-1">{hymn.languages.english.title}</p>
                        <p className={`text-[10px] font-medium leading-tight line-clamp-1 mt-0.5 ${
                          isSelected ? "text-zinc-300" : "text-[#636E72]"
                        }`}>
                          Swa: {hymn.languages.kiswahili.title} • Luo: {hymn.languages.luo.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isFav && (
                        <Bookmark className="h-3.5 w-3.5 text-[#C5A059] fill-[#C5A059]" />
                      )}
                      {isInPlaylist && (
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="In Sunday Playlist" />
                      )}
                      <ChevronRight className={`h-4 w-4 ${isSelected ? "text-[#C5A059]" : "text-[#A0A0A0]"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Persistent Service Playlist Board inside sidebar base */}
          {servicePlaylist.length > 0 && (
            <div className="border-t border-[#E5E1D8] bg-[#F5F2ED] p-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#2D3E50] uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <BookmarkCheck className="h-4 w-4 text-[#C5A059]" />
                  Sunday Playlist ({servicePlaylist.length})
                </span>
                <button
                  id="clear-playlist-btn"
                  onClick={() => {
                    setServicePlaylist([]);
                    localStorage.setItem("gideons_songbook_playlist", JSON.stringify([]));
                  }}
                  className="text-[9px] text-red-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {servicePlaylist.map((num) => {
                  const hObj = hymns.find(h => h.number === num);
                  if (!hObj) return null;
                  return (
                    <div 
                      key={num}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#E5E1D8] text-[11px] font-bold text-[#2D3E50]"
                    >
                      <button
                        id={`playlist-item-${num}`}
                        onClick={() => {
                          setSelectedHymn(hObj);
                          stopMelody();
                        }}
                        className="truncate hover:text-[#C5A059] flex-grow text-left cursor-pointer"
                      >
                        #{num} - {hObj.languages.english.title}
                      </button>
                      <button
                        id={`del-playlist-item-${num}`}
                        onClick={() => togglePlaylistItem(num)}
                        className="text-[#A0A0A0] hover:text-[#2D3E50] ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content Viewer Main Column */}
        <div className="flex-grow flex flex-col bg-[#FDFCF8] overflow-hidden">
          
          {selectedHymn ? (
            <div className="flex-grow flex flex-col overflow-hidden relative">
              
              {/* Active Hymn Bar Controls */}
              <div className="bg-white border-b border-[#E5E1D8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <button
                    id="toggle-sidebar-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 hover:bg-[#F5F2ED] rounded-lg border border-[#E5E1D8] text-[#636E72] hover:text-[#2D3E50] cursor-pointer"
                    title={sidebarOpen ? "Collapse Navigation Sidebar" : "Expand Navigation Sidebar"}
                  >
                    <ArrowLeft className={`h-4 w-4 transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] px-2 py-0.5 rounded-md">
                        Hymn #{selectedHymn.number}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Key: {selectedHymn.key}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-[#2D3E50] font-sans uppercase mt-1">
                      {selectedHymn.languages.english.title}
                    </h2>
                  </div>
                </div>

                {/* Control Action icons */}
                <div className="flex items-center gap-2.5">
                  
                  {/* Synth Organ MIDI Tune button */}
                  <div className="flex items-center gap-1.5 bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl px-3 py-1 text-[11px] font-bold text-[#2D3E50]">
                    <Music className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span className="hidden min-[1000px]:inline">Choir Help pitch:</span>
                    <button
                      id="synth-play-pitch-btn"
                      onClick={() => playHymnMelodyKey(selectedHymn)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white uppercase tracking-wider transition font-black cursor-pointer ${
                        isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-[#C5A059] hover:bg-[#b08e4d]"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-2.5 w-2.5 fill-white" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-2.5 w-2.5 fill-white" />
                          <span>Hum Tune</span>
                        </>
                      )}
                    </button>
                  </div>

                  {(selectedHymn.pdf_url || (masterPdfUrl && selectedHymn.pdf_page)) && (
                    <a
                      href={selectedHymn.pdf_url || `${masterPdfUrl}#page=${selectedHymn.pdf_page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase"
                      title={selectedHymn.pdf_page ? `Open PDF at Page ${selectedHymn.pdf_page}` : "Download Sheet PDF"}
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="hidden min-[1100px]:inline">
                        {selectedHymn.pdf_page ? `Page ${selectedHymn.pdf_page}` : "Sheet PDF"}
                      </span>
                    </a>
                  )}

                  {/* Add, Favorite, presentation triggers */}
                  <div className="flex items-center gap-1 rounded-lg bg-zinc-100 border border-zinc-200 p-1">
                    <button
                      id="add-playlist-badge-btn"
                      onClick={() => togglePlaylistItem(selectedHymn.number)}
                      className={`p-1.5 rounded-md transition cursor-pointer ${
                        servicePlaylist.includes(selectedHymn.number)
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-[#636E72] hover:text-[#2D3E50] hover:bg-[#F5F2ED]"
                      }`}
                      title={servicePlaylist.includes(selectedHymn.number) ? "Remove from Service Playlist" : "Add to Service Playlist"}
                    >
                      {servicePlaylist.includes(selectedHymn.number) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      id="add-fav-badge-btn"
                      onClick={() => toggleFavorite(selectedHymn.number)}
                      className={`p-1.5 rounded-md transition cursor-pointer ${
                        favorites.includes(selectedHymn.number)
                          ? "bg-[#C5A059] text-[#2D3E50] shadow-sm"
                          : "text-[#636E72] hover:text-[#2D3E50] hover:bg-[#F5F2ED]"
                      }`}
                      title={favorites.includes(selectedHymn.number) ? "Unfavorite Song" : "Favorite Song"}
                    >
                      <Bookmark className={`h-4 w-4 ${favorites.includes(selectedHymn.number) ? "fill-[#2D3E50]" : ""}`} />
                    </button>

                    <button
                      id="toggle-presentation-btn"
                      onClick={() => setPresentationMode(true)}
                      className="p-1.5 text-[#636E72] hover:text-[#2D3E50] hover:bg-[#F5F2ED] rounded-md transition cursor-pointer"
                      title="Sermon Screen Presentation Mode"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>

                    {isAdmin && (
                      <button
                        id={`delete-hymn-btn-${selectedHymn.id}`}
                        onClick={() => selectedHymn && handleDeleteHymn(selectedHymn.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition cursor-pointer"
                        title="Delete Hymn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Font Adjuster Button */}
                  <div className="flex items-center gap-1 rounded-lg bg-zinc-100 border border-zinc-200 p-1">
                    <button
                      id="decrease-font-btn"
                      onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                      className="p-1 bg-white border border-[#E5E1D8] text-xs font-bold font-mono rounded hover:bg-[#F5F2ED] text-[#2D3E50] cursor-pointer"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <span className="text-[9px] font-mono font-bold text-[#636E72] px-1.5">{fontSize}px</span>
                    <button
                      id="increase-font-btn"
                      onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                      className="p-1 bg-white border border-[#E5E1D8] text-xs font-bold font-mono rounded hover:bg-[#F5F2ED] text-[#2D3E50] cursor-pointer"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>

                </div>
              </div>

              {/* View options headers selector Bar */}
              <div className="bg-[#F5F2ED] border-b border-[#E5E1D8] px-6 py-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#636E72]">
                  <Languages className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span className="uppercase tracking-wider">Configure Screen Language:</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-white border border-[#E5E1D8] p-1 text-[11px] font-semibold text-[#636E72]">
                  {(["english", "kiswahili", "luo", "side-by-side"] as const).map((lang) => (
                    <button
                      id={`lang-btn-${lang}`}
                      key={lang}
                      onClick={() => setViewLanguage(lang)}
                      className={`px-2.5 py-1 rounded transition select-none cursor-pointer text-xs md:text-[11px] ${
                        viewLanguage === lang
                          ? "bg-[#2D3E50] text-[#C5A059] font-bold"
                          : "hover:text-[#2D3E50] hover:bg-[#F5F2ED]"
                      }`}
                    >
                      {lang === "side-by-side" ? "Multi-Sync (Columns)" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glowing Organ MIDI Playback Track visualizer when active */}
              {isPlaying && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#2D3E50] uppercase tracking-wider">
                      MIDI Pitch Organ Playing: {selectedHymn.languages.english.title} (Key of {selectedHymn.key})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 max-w-xs md:max-w-md overflow-hidden text-[9px] font-bold font-mono text-[#A0A0A0]">
                    {selectedHymn.melodyNotes?.map((n, i) => (
                      <span 
                        key={i} 
                        className={`px-1.5 py-0.5 rounded ${
                          activeNoteIdx === i 
                            ? "bg-[#C5A059] text-[#2D3E50] scale-110 font-bold" 
                            : "bg-[#F5F2ED] text-[#A0A0A0]"
                        }`}
                      >
                        {n.note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Core verse comparative render area */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8">
                
                <div className="mb-6 bg-white border border-[#E5E1D8] rounded-xl p-5 shadow-sm max-w-4xl mx-auto flex items-start gap-4">
                  <Info className="h-5 w-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h3 className="font-bold text-[#2D3E50] uppercase tracking-wide">Historical Record</h3>
                    <p className="text-[#636E72] mt-1 text-[11px] leading-relaxed">
                      {selectedHymn.description}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-[#A0A0A0] mt-2 italic uppercase">
                      Author: {selectedHymn.author} • Scripture: {selectedHymn.scripture}
                    </p>
                  </div>
                </div>

                {/* Lyrics Display Panel */}
                <div className="max-w-6xl mx-auto">
                  {viewLanguage !== "side-by-side" ? (
                    
                    /* Single Language Lyric sheet styled beautifully */
                    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 md:p-10 shadow-sm max-w-2xl mx-auto">
                      <div className="text-center mb-8 border-b border-[#F5F2ED] pb-6">
                        <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest block">
                          Divine Lyrics Sheet
                        </span>
                        <h2 className="text-xl font-bold font-display text-[#2D3E50] uppercase tracking-tight mt-1">
                          {selectedHymn.languages[viewLanguage].title}
                        </h2>
                        <p className="text-[10px] text-[#A0A0A0] uppercase font-bold mt-1">
                          Hymn #{selectedHymn.number} • Language: {viewLanguage}
                        </p>
                      </div>

                      <div className="space-y-8">
                        {(selectedHymn.languages[viewLanguage]?.verses || []).map((verse, vIdx) => {
                          const isChorus = verse.toLowerCase().startsWith("chorus") || verse.includes("Then sings my soul") || verse.toLowerCase().includes("sings my soul");
                          
                          return (
                            <div 
                              key={vIdx} 
                              className={`flex gap-4 ${
                                isChorus ? "bg-[#F5F2ED]/50 border-l-4 border-[#C5A059] p-4 rounded-r-xl" : ""
                              }`}
                            >
                              <span className="text-[11px] font-mono font-bold text-[#A0A0A0] select-none text-right shrink-0 w-6 pt-0.5">
                                {isChorus ? "Cho" : `${vIdx + 1}.`}
                              </span>
                              <p 
                                className="font-sans text-[#2D3E50] whitespace-pre-wrap leading-relaxed font-semibold transition-all duration-150"
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                {verse}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    
                    /* Side-by-Side Synced Verse Columns - A MASTERPIECE OF ACCORDANCE COMPLIANCE */
                    <div>
                      <div className="text-center mb-6">
                        <span className="text-[10px] font-mono font-bold text-[#C5A059] uppercase tracking-widest block">
                          Parallel Verse Alignments
                        </span>
                        <h2 className="text-sm font-bold text-[#2D3E50] mt-1">
                          ENG: {selectedHymn.languages.english.title} • SWA: {selectedHymn.languages.kiswahili.title} • LUO: {selectedHymn.languages.luo.title}
                        </h2>
                        <p className="text-[9px] text-[#A0A0A0] uppercase tracking-wider font-bold mt-1">
                          Verse-by-verse comparison grids help with translation and unified singing
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Loop through each verse up to maximum index among languages to print corresponding rows */}
                        {Array.from({ 
                          length: Math.max(
                            selectedHymn.languages.english.verses.length,
                            selectedHymn.languages.kiswahili.verses.length,
                            selectedHymn.languages.luo.verses.length
                          )
                        }).map((_, verseIdx) => {
                          const engV = selectedHymn.languages.english.verses[verseIdx] || "";
                          const swaV = selectedHymn.languages.kiswahili.verses[verseIdx] || "";
                          const luoV = selectedHymn.languages.luo.verses[verseIdx] || "";

                          // Detect if any is chorus
                          const isChorus = [engV, swaV, luoV].some(v => 
                            v.toLowerCase().startsWith("chorus") || v.includes("Then sings my soul") || v.toLowerCase().includes("then sings")
                          );

                          return (
                            <div 
                              id={`comparative-verse-${verseIdx}`}
                              key={verseIdx}
                              className={`border rounded-2xl overflow-hidden transition shadow-sm ${
                                isChorus 
                                  ? "bg-amber-50/20 border-amber-200/60" 
                                  : "bg-white border-[#E5E1D8]"
                              }`}
                            >
                              <div className="bg-[#F5F2ED]/70 border-b border-[#E5E1D8] px-4 py-1.5 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-[#2D3E50] uppercase font-mono font-black">
                                  {isChorus ? "Refrain / Chorus" : `Stanza / Verse ${verseIdx + 1}`}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8]">
                                
                                {/* English Column */}
                                <div className="p-5 flex flex-col justify-between">
                                  <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-2 block">English</span>
                                  <p 
                                    className="font-sans text-[#2D3E50] whitespace-pre-wrap leading-relaxed font-semibold transition-all"
                                    style={{ fontSize: `${fontSize}px` }}
                                  >
                                    {engV || "—"}
                                  </p>
                                </div>

                                {/* Swahili Column */}
                                <div className="p-5 flex flex-col justify-between">
                                  <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-2 block">Kiswahili</span>
                                  <p 
                                    className="font-sans text-[#2D3E50] whitespace-pre-wrap leading-relaxed font-semibold transition-all"
                                    style={{ fontSize: `${fontSize}px` }}
                                  >
                                    {swaV || "—"}
                                  </p>
                                </div>

                                {/* Luo Column */}
                                <div className="p-5 flex flex-col justify-between">
                                  <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-2 block">Luo (Dholuo)</span>
                                  <p 
                                    className="font-sans text-[#2D3E50] whitespace-pre-wrap leading-relaxed font-semibold transition-all"
                                    style={{ fontSize: `${fontSize}px` }}
                                  >
                                    {luoV || "—"}
                                  </p>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              {/* Screen wide presentation modal popup */}
              <AnimatePresence>
                {presentationMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-slate-950 backdrop-blur-md flex flex-col p-6 overflow-hidden text-neutral-100"
                  >
                    {/* Presentation settings top bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-white/10 px-2.5 py-1 rounded-md font-mono text-amber-400 font-bold">
                          PROJECTION DISPLAY
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          Hymn #{selectedHymn.number} - {selectedHymn.languages.english.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          id="pres-font-dec-btn"
                          onClick={() => setFontSize(Math.max(16, fontSize - 1))}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded cursor-pointer"
                          title="Smaller Font"
                        >
                          A-
                        </button>
                        <span className="text-[10px] font-mono font-bold">{fontSize}px</span>
                        <button
                          id="pres-font-inc-btn"
                          onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded cursor-pointer"
                          title="Larger Font"
                        >
                          A+
                        </button>
                        <button
                          id="pres-close-btn"
                          onClick={() => setPresentationMode(false)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition ml-2 cursor-pointer"
                        >
                          <Minimize2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Projected central scrolled slides */}
                    <div className="flex-grow overflow-y-auto flex flex-col items-center justify-center py-10 max-w-4xl mx-auto space-y-12 pb-24 px-4 w-full text-center">
                      {(selectedHymn.languages[viewLanguage === "side-by-side" ? "english" : viewLanguage]?.verses || []).map((verse, idx) => {
                        const isChorus = verse.toLowerCase().startsWith("chorus") || verse.includes("Then sings my soul") || verse.toLowerCase().includes("sings my soul");
                        
                        return (
                          <div 
                            key={idx} 
                            style={{ fontSize: `${fontSize * 1.5}px` }}
                            className={`w-full max-w-3xl leading-relaxed whitespace-pre-wrap font-serif select-none transition-all ${
                              isChorus 
                                ? "text-amber-400 border-l border-r border-amber-400/20 py-4 px-6 bg-white/5 rounded-xl font-bold" 
                                : "text-white font-medium"
                            }`}
                          >
                            {verse}
                            {selectedHymn.languages.kiswahili.verses[idx] && viewLanguage === "side-by-side" && (
                              <p className="text-[#A08850] mt-3 font-sans opacity-95 text-[0.75em] leading-relaxed">
                                {selectedHymn.languages.kiswahili.verses[idx]}
                              </p>
                            )}
                            {selectedHymn.languages.luo.verses[idx] && viewLanguage === "side-by-side" && (
                              <p className="text-sky-300 mt-2 font-sans opacity-90 text-[0.70em] leading-relaxed">
                                {selectedHymn.languages.luo.verses[idx]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 uppercase font-mono tracking-widest text-center pointer-events-none">
                      Press Escape or Esc to Exit Projection mode • Perfect Contrast for church walls & projector screens
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : (
            
            /* Empty selection state instruction placeholder banner */
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-[#FDFCF8]">
              <div className="h-16 w-16 bg-[#F5F2ED] border border-[#E5E1D8] text-[#C5A059] rounded-2xl flex items-center justify-center mb-4 shadow-sm animate-bounce">
                <BookOpen className="h-8 w-8" />
              </div>
              <h2 className="text-base font-bold text-[#2D3E50] uppercase tracking-tight font-display">No Hymn Selected</h2>
              <p className="text-xs text-[#636E72] max-w-md mt-2 font-medium leading-relaxed">
                Choose a divine hymn from the sidebar directory, or use the seek bar to filter by hymn number, English/Swahili/Luo titles, and lyric verses.
              </p>

              {/* Quick instructions panel */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full text-left">
                
                <div className="bg-white border border-[#E5E1D8] p-4 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-50 rounded-lg text-[#C5A059]">
                      <Languages className="h-4 w-4" />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#2D3E50] uppercase">Muti-Language Columns</h4>
                  </div>
                  <p className="text-[10px] text-[#636E72] leading-relaxed font-medium">
                    Read aligned lines in English, Kiswahili and Luo side-by-side during translation services.
                  </p>
                </div>

                <div className="bg-white border border-[#E5E1D8] p-4 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
                      <Music className="h-4 w-4" />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#2D3E50] uppercase">Audio Tune Hummer</h4>
                  </div>
                  <p className="text-[10px] text-[#636E72] leading-relaxed font-medium">
                    Click "Hum Tune" keys to activate the built-in browser synth organ and practice classic hymnal pitches!
                  </p>
                </div>

                <div className="bg-white border border-[#E5E1D8] p-4 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <BookmarkPlus className="h-4 w-4" />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#2D3E50] uppercase">Service Scheduler</h4>
                  </div>
                  <p className="text-[10px] text-[#636E72] leading-relaxed font-medium">
                    Stage select hymns to "Sunday Playlist" to curate and lock down the choir timeline for next service.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* PUBLISH HYMN MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <div>
                  <h2 className="font-display font-black text-lg text-[#2D3E50] uppercase tracking-tight">Archive New Digital Hymn</h2>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">GIMK Headquarters Liturgical Publisher</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 rounded-xl transition"><X className="h-5 w-5 text-neutral-400" /></button>
              </div>

              <form onSubmit={handlePublishHymn} className="space-y-6 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Hymn No. *</label><input type="number" required value={newHymn.number} onChange={e => setNewHymn({...newHymn, number: e.target.value})} className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-[#C5A059]" /></div>
                  <div><label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Musical Key</label><input type="text" value={newHymn.key} onChange={e => setNewHymn({...newHymn, key: e.target.value})} placeholder="e.g. F Major" className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:border-[#C5A059]" /></div>
                  <div><label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Category</label><select value={newHymn.category} onChange={e => setNewHymn({...newHymn, category: e.target.value})} className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-2 focus:outline-none focus:border-[#C5A059]">{HYMN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Original Author</label><input type="text" value={newHymn.author} onChange={e => setNewHymn({...newHymn, author: e.target.value})} className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-4" /></div>
                  <div><label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Scripture Reference</label><input type="text" value={newHymn.scripture} onChange={e => setNewHymn({...newHymn, scripture: e.target.value})} placeholder="e.g. Psalms 23:1" className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-4" /></div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-blue-900 font-bold uppercase text-[10px] tracking-wider">PDF Page Mapping</h4>
                    <p className="text-blue-700 text-[9px] mt-0.5">Link an individual PDF or specify the page number in the Master Songbook.</p>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Page #" value={newHymn.pdf_page} onChange={e => setNewHymn({...newHymn, pdf_page: e.target.value})} className="h-8 bg-white border border-blue-200 rounded-lg px-2 text-[10px] w-16 focus:outline-none font-bold" />
                    <input type="text" placeholder="Or Individual PDF URL..." value={newHymn.pdf_url} onChange={e => setNewHymn({...newHymn, pdf_url: e.target.value})} className="h-8 bg-white border border-blue-200 rounded-lg px-2 text-[10px] w-32 focus:outline-none" />
                    <button type="button" onClick={handleMockPdfUpload} className="h-8 bg-blue-600 text-white px-3 rounded-lg flex items-center gap-1.5 uppercase text-[9px] font-black hover:bg-blue-700 transition"><UploadCloud className="h-3.5 w-3.5" /> Mock Upload</button>
                  </div>
                </div>

                <div className="space-y-4 border-t border-neutral-100 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* English */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-[#2D3E50] uppercase tracking-widest bg-[#F5F2ED] px-2 py-1 rounded">English (KJV)</span>
                      <input type="text" placeholder="Hymn Title" value={newHymn.languages.english.title} onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, english: {...newHymn.languages.english, title: e.target.value}}})} className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3" />
                      <textarea rows={6} placeholder="Enter verses (Separate with double line break)..." onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, english: {...newHymn.languages.english, verses: e.target.value.split('\n\n')}}})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 resize-none text-[11px] font-medium leading-relaxed" />
                    </div>
                    {/* Kiswahili */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Kiswahili</span>
                      <input type="text" placeholder="Hymn Title" value={newHymn.languages.kiswahili.title} onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, kiswahili: {...newHymn.languages.kiswahili, title: e.target.value}}})} className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3" />
                      <textarea rows={6} placeholder="Ingiza mistari..." onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, kiswahili: {...newHymn.languages.kiswahili, verses: e.target.value.split('\n\n')}}})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 resize-none text-[11px] font-medium leading-relaxed" />
                    </div>
                    {/* Luo */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Dholuo (Luo)</span>
                      <input type="text" placeholder="Hymn Title" value={newHymn.languages.luo.title} onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, luo: {...newHymn.languages.luo, title: e.target.value}}})} className="w-full h-9 bg-neutral-50 border border-neutral-200 rounded-lg px-3" />
                      <textarea rows={6} placeholder="Ket weche mag wer..." onChange={e => setNewHymn({...newHymn, languages: {...newHymn.languages, luo: {...newHymn.languages.luo, verses: e.target.value.split('\n\n')}}})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 resize-none text-[11px] font-medium leading-relaxed" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-500 uppercase text-[9px] font-black mb-1">Hymn Description / History</label>
                  <textarea rows={2} value={newHymn.description} onChange={e => setNewHymn({...newHymn, description: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 resize-none" />
                </div>

                <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-xl text-neutral-500 font-black uppercase tracking-widest hover:bg-neutral-50 transition cursor-pointer">Discard</button>
                  <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-xl bg-slate-900 text-[#C5A059] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 flex items-center gap-2">
                    {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Publish to Library
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
