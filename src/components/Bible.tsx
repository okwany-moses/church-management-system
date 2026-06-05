import React, { useState, useEffect } from "react";
import { BIBLE_BOOKS, Book, Chapter, Verse } from "../data/bible";
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Globe, 
  Languages, 
  Bookmark, 
  BookmarkPlus, 
  Sparkles, 
  Type, 
  ArrowLeftRight, 
  AlignLeft,
  BookCheck,
  Check,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState<Book>(BIBLE_BOOKS?.[0] || {} as Book);
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(BIBLE_BOOKS?.[0]?.chapters?.[0] || {} as Chapter);
  const [viewMode, setViewMode] = useState<"english" | "kiswahili" | "luo" | "parallel">("parallel");
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState<number>(15);
  const [highlightedVerses, setHighlightedVerses] = useState<string[]>([]); // key: book-chap-verse

  // Load preferences / highlighted verses
  useEffect(() => {
    const saved = localStorage.getItem("gimk_bible_highlights");
    if (saved) {
      setHighlightedVerses(JSON.parse(saved));
    }
  }, []);

  // Reset chapter automatically when book changes to prevent displaying old book content
  useEffect(() => {
    if (selectedBook.name) {
      const firstChapter = selectedBook.chapters?.[0] || { chapterNumber: 0, verses: [] } as any;
      setSelectedChapter(firstChapter);
    }
  }, [selectedBook.name]);

  const toggleHighlight = (verseKey: string) => {
    const updated = highlightedVerses.includes(verseKey)
      ? highlightedVerses.filter(k => k !== verseKey)
      : [...highlightedVerses, verseKey];
    setHighlightedVerses(updated);
    localStorage.setItem("gimk_bible_highlights", JSON.stringify(updated));
  };

  // Select another book and automatically default to its first chapter
  const handleSelectBook = (book: Book) => {
    if (!book) return;
    setSelectedBook(book);
  };

  // Filter verses based on search query
  const filteredVerses = (selectedChapter?.verses || []).filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.english.toLowerCase().includes(q) ||
      v.kiswahili.toLowerCase().includes(q) ||
      v.luo.toLowerCase().includes(q) ||
      v.number.toString() === q
    );
  });

  return (
    <div id="bible-reader-root" className="h-[calc(100vh-140px)] flex flex-col bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-sm">
      
      {/* Upper Navigation Header Banner */}
      <div className="bg-[#2D3E50] text-[#FDFCF8] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2a36]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl text-[#C5A059]">
            <BookCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider font-display select-none">Holy Bible Reader</h1>
            <p className="text-[10px] text-zinc-300 font-medium">Trilingual Scriptural Concordance (English, Kiswahili, Dholuo)</p>
          </div>
        </div>

        {/* Quick select Books list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {BIBLE_BOOKS.map((b) => (
            <button
              id={`bible-book-select-${b.name.toLowerCase()}`}
              key={b.name}
              onClick={() => handleSelectBook(b)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer select-none ${
                selectedBook.name === b.name
                  ? "bg-[#C5A059] text-[#2D3E50] shadow-sm"
                  : "bg-[#1e2a36] text-zinc-300 hover:text-white"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Side Control Panel (Chapters list & Search & Highlights) */}
        <div className="w-72 border-r border-[#E5E1D8] bg-[#FDFCF8] flex flex-col shrink-0">
          
          {/* Chapter Selector & Search */}
          <div className="p-4 border-b border-[#E5E1D8] space-y-3 bg-white">
            <div>
              <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider block mb-1.5">Select Chapter:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {selectedBook.chapters.map((ch) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => setSelectedChapter(ch)}
                    className={`p-2 font-mono text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                      selectedChapter.chapterNumber === ch.chapterNumber
                        ? "bg-[#2D3E50] border-[#2D3E50] text-[#C5A059] shadow-sm"
                        : "bg-white border-[#E5E1D8] text-[#2D3E50] hover:bg-[#F5F2ED]"
                    }`}
                  >
                    {ch.chapterNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#A0A0A0]" />
              <input
                id="bible-search-input"
                type="text"
                placeholder="Search words in chapter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F2ED] border border-[#E5E1D8] rounded-xl pl-8 pr-3 py-2 text-[11px] font-semibold text-[#2D3E50] focus:ring-1 focus:ring-[#C5A059] focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="p-4 flex-grow overflow-y-auto space-y-4">
            <div className="bg-[#2D3E50]/5 rounded-xl p-3 border border-[#2D3E50]/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-[#C5A059]" />
                <h4 className="text-[11px] font-bold text-[#2D3E50] uppercase">Scripture Highlights</h4>
              </div>
              <p className="text-[10px] text-[#636E72] leading-relaxed">
                Bookmark verses to highlight them during sermon sessions and unified prayer layouts. Your selections are kept offline.
              </p>
            </div>

            {/* List of Marked Verses */}
            <div>
              <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider block mb-2">Bookmarked Verses ({highlightedVerses.length})</span>
              {highlightedVerses.length === 0 ? (
                <div className="text-center py-6 bg-white border border-dashed border-[#E5E1D8] rounded-xl">
                  <Bookmark className="h-6 w-6 text-[#A0A0A0]/40 mx-auto mb-1" />
                  <p className="text-[9px] text-[#A0A0A0] font-bold uppercase">No verses marked</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {highlightedVerses.map((key) => {
                    const [bName, chap, vNum] = key.split("-");
                    return (
                      <div 
                        key={key}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#E5E1D8] text-[10px] text-[#2D3E50] font-bold"
                      >
                        <span className="truncate">
                          {bName} {chap}:{vNum}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`go-to-highlight-${key}`}
                            onClick={() => {
                              const matchB = BIBLE_BOOKS.find(b => b.name === bName);
                              if (matchB) {
                                setSelectedBook(matchB);
                                const matchCh = matchB.chapters.find(ch => ch.chapterNumber === parseInt(chap));
                                if (matchCh) setSelectedChapter(matchCh);
                              }
                            }}
                            className="text-[#C5A059] hover:underline cursor-pointer"
                          >
                            Read
                          </button>
                          <span className="text-[#E5E1D8]">|</span>
                          <button
                            id={`remove-highlight-${key}`}
                            onClick={() => toggleHighlight(key)}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Supported Translations Indicator Footer */}
          <div className="p-4 border-t border-[#E5E1D8] bg-[#F5F2ED] text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wide space-y-1">
            <p>• KJV Reference (English)</p>
            <p>• Habari Njema (Kiswahili)</p>
            <p>• Luo Bible (Dholuo Concordance)</p>
          </div>
        </div>

        {/* Right Scripture Column Viewer */}
        <div className="flex-grow flex flex-col bg-[#FDFCF8] overflow-hidden">
          
          {/* Top toolbar with font adjuster and layout selection */}
          <div className="bg-white border-b border-[#E5E1D8] px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#F5F2ED] border border-[#E5E1D8] text-[#2D3E50] px-2 py-0.5 rounded-md">
                {selectedBook.name} • Chapter {selectedChapter.chapterNumber}
              </span>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md uppercase">
                {selectedBook.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Layout view controls */}
              <div className="flex items-center gap-1 rounded-lg bg-zinc-100 border border-zinc-200 p-0.5 text-[10px] font-bold text-[#636E72]">
                {(["english", "kiswahili", "luo", "parallel"] as const).map((mode) => (
                  <button
                    id={`bible-view-mode-${mode}`}
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded transition select-none cursor-pointer uppercase tracking-wider ${
                      viewMode === mode
                        ? "bg-[#2D3E50] text-[#C5A059]"
                        : "hover:text-[#2D3E50] hover:bg-zinc-200"
                    }`}
                  >
                    {mode === "parallel" ? "Aligned parallel" : mode}
                  </button>
                ))}
              </div>

              {/* Font Sizer */}
              <div className="flex items-center gap-1 rounded-lg bg-zinc-100 border border-zinc-200 p-0.5">
                <button
                  id="bible-decrease-font-btn"
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="p-1 px-1.5 bg-white border border-[#E5E1D8] text-[10px] font-bold rounded hover:bg-[#F5F2ED] text-[#2D3E50] cursor-pointer"
                >
                  A-
                </button>
                <span className="text-[9px] font-mono font-bold text-[#636E72] px-1">{fontSize}px</span>
                <button
                  id="bible-increase-font-btn"
                  onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                  className="p-1 px-1.5 bg-white border border-[#E5E1D8] text-[10px] font-bold rounded hover:bg-[#F5F2ED] text-[#2D3E50] cursor-pointer"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Scripture Scroll sheet container */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              
              {filteredVerses.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xs text-[#A0A0A0] font-bold uppercase tracking-wider">No matching scripture verses found</p>
                  <p className="text-[10px] text-[#A0A0A0]/70 mt-1">Try resetting the text inside your search box.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVerses.map((verse) => {
                    const verseKey = `${selectedBook.name}-${selectedChapter.chapterNumber}-${verse.number}`;
                    const isMuted = searchQuery && !verse.english.toLowerCase().includes(searchQuery.toLowerCase()) && !verse.kiswahili.toLowerCase().includes(searchQuery.toLowerCase()) && !verse.luo.toLowerCase().includes(searchQuery.toLowerCase());
                    const isMarked = highlightedVerses.includes(verseKey);

                    if (viewMode !== "parallel") {
                      // Single Translation Verse Sheet view
                      const currentLanguageText = verse[viewMode as keyof Omit<Verse, "number">];
                      return (
                        <div 
                          key={verse.number}
                          className={`group flex gap-4 p-3.5 rounded-xl border transition-all ${
                            isMarked 
                              ? "bg-amber-50/50 border-amber-300/60 shadow-xs" 
                              : "bg-white border-[#E5E1D8] hover:bg-[#F5F2ED]/40"
                          } ${isMuted ? "opacity-30" : "opacity-100"}`}
                        >
                          <div className="flex flex-col items-center shrink-0 w-8">
                            <span className="text-xs font-mono font-bold text-[#C5A059]">
                              v{verse.number}
                            </span>
                            <button
                              id={`bookmark-single-btn-${verseKey}`}
                              onClick={() => toggleHighlight(verseKey)}
                              className="mt-1 opacity-0 group-hover:opacity-100 transition text-[#A0A0A0] hover:text-[#C5A059]"
                            >
                              <Bookmark className={`h-3.5 w-3.5 ${isMarked ? "fill-[#C5A059] text-[#C5A059]" : ""}`} />
                            </button>
                          </div>
                          <div className="flex-grow">
                            <p 
                              className="font-sans text-[#2D3E50] leading-relaxed font-semibold transition-all duration-150"
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {currentLanguageText}
                            </p>
                            <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block mt-1.5">
                              {selectedBook.name} {selectedChapter.chapterNumber}:{verse.number} • Translation: {viewMode}
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // Aligned parallel trilingual grid
                      return (
                        <div 
                          id={`aligned-bible-grid-${verse.number}`}
                          key={verse.number}
                          className={`rounded-2xl border overflow-hidden transition-all shadow-xs ${
                            isMarked 
                              ? "bg-amber-50/20 border-amber-300" 
                              : "bg-white border-[#E5E1D8] hover:border-zinc-300"
                          } ${isMuted ? "opacity-30" : "opacity-100"}`}
                        >
                          {/* Row micro indicator */}
                          <div className="bg-[#F5F2ED]/60 border-b border-[#E5E1D8] px-4 py-1.5 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-[#2D3E50] uppercase font-mono font-black">
                              Verse {verse.number}
                            </span>
                            <button
                              id={`bookmark-grid-btn-${verseKey}`}
                              onClick={() => toggleHighlight(verseKey)}
                              className="text-[10px] font-bold text-[#A0A0A0] hover:text-[#C5A059] flex items-center gap-1"
                            >
                              <Bookmark className={`h-3 w-3 ${isMarked ? "fill-[#C5A059] text-[#C5A059]" : ""}`} />
                              <span>{isMarked ? "Highlighted" : "Highlight"}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8]">
                            
                            {/* English */}
                            <div className="p-4 flex flex-col justify-between">
                              <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-1.5">English (KJV)</span>
                              <p 
                                className="font-sans text-[#2D3E50] leading-relaxed font-semibold transition-all"
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                {verse.english}
                              </p>
                            </div>

                            {/* Kiswahili */}
                            <div className="p-4 flex flex-col justify-between">
                              <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-1.5">Kiswahili</span>
                              <p 
                                className="font-sans text-[#2D3E50] leading-relaxed font-semibold transition-all"
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                {verse.kiswahili}
                              </p>
                            </div>

                            {/* Luo */}
                            <div className="p-4 flex flex-col justify-between">
                              <span className="text-[9px] font-mono font-bold text-[#A0A0A0] uppercase mb-1.5">Dholuo (Luo)</span>
                              <p 
                                className="font-sans text-[#2D3E50] leading-relaxed font-semibold transition-all"
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                {verse.luo}
                              </p>
                            </div>

                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
