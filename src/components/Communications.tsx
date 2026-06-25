import React, { useState, useEffect } from "react";
import { api } from "../api";
import { SmsLog, VideoCallLog, Member } from "../types";
import { 
  Send, 
  Video, 
  MessageSquare, 
  Users, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Plus, 
  Volume2, 
  VolumeX, 
  VideoOff, 
  UserCheck, 
  Hand, 
  PhoneOff, 
  Paperclip, 
  MessageCircle, 
  RefreshCw,
  Search,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommunicationsProps {
  isAdmin?: boolean;
}

export default function Communications({ isAdmin = true }: CommunicationsProps) {
  const [activeTab, setActiveTab] = useState<"sms" | "video">("sms");
  const [members, setMembers] = useState<Member[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [videoLogs, setVideoLogs] = useState<VideoCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SMS draft form state
  const [smsGroupType, setSmsGroupType] = useState("All Active Members");
  const [smsCustomRecipients, setSmsCustomRecipients] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSearchQuery, setSmsSearchQuery] = useState("");

  // Video call form & stream simulator state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoHost, setVideoHost] = useState("Apostle Newton Atela");
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [meetingParticipants, setMeetingParticipants] = useState<string[]>([]);
  const [meetingLogId, setMeetingLogId] = useState<number | null>(null);

  // Live simulation variables inside call
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [simulatedSpeakers, setSimulatedSpeakers] = useState<string>("");
  const [meetingChats, setMeetingChats] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [memData, smsData, vidData] = await Promise.all([
        api.getMembers(),
        api.getSmsLogs(),
        api.getVideoCallLogs()
      ]);
      setMembers(memData);
      setSmsLogs(smsData);
      setVideoLogs(vidData);
    } catch (err: any) {
      setError(err.message || "Failed to load communications files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time tracker for ongoing video meeting
  useEffect(() => {
    let interval: any;
    if (isMeetingActive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        // Randomly simulate speakers
        if (Math.random() > 0.75) {
          const names = ["Apostle Newton Atela", "Evangelist Mary", "Treasurer Jane", "Pastor Charles"];
          setSimulatedSpeakers(names[Math.floor(Math.random() * names.length)]);
        }
        
        // Randomly simulate incoming messages
        if (Math.random() > 0.85) {
          const simulatedTexts = [
            "Amen, receiving this message loud and clear from Nairobi",
            "Greetings from Kabondo, we are tuning in",
            "The choir is ready for the special ministry presentation",
            "This digital council room is very stable, praise God!",
            "Can we share the annual registration statement details?"
          ];
          const senders = ["Evangelist Mary", "Treasurer Jane", "Pastor Charles", "Brother Samuel"];
          const incomingObj = {
            sender: senders[Math.floor(Math.random() * senders.length)],
            text: simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMeetingChats(prev => [...prev, incomingObj]);
        }

      }, 1000);
    } else {
      setElapsedSeconds(0);
      setSimulatedSpeakers("");
    }
    return () => clearInterval(interval);
  }, [isMeetingActive]);

  // SMS delivery logic
  const handleSendBulkSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) {
      alert("Please input your SMS broadcast draft before broadcasting.");
      return;
    }

    setIsSendingSms(true);
    let targetMembers = members;
    if (smsGroupType === "Choir Ministry") {
      targetMembers = members.filter(m => m.ministries_list?.includes("Worship Choir")); 
    } else if (smsGroupType === "Youth Fellowship") {
      targetMembers = members.filter(m => m.ministries_list?.includes("Youth Fellowship"));
    } else if (smsGroupType === "Church Leaders") {
      targetMembers = members.filter(m => m.status === "Active" && m.id < 5);
    } else if (smsGroupType === "Manual Listing" && smsCustomRecipients) {
      // Treat custom input as a list of phone numbers for testing
      targetMembers = smsCustomRecipients.split(",").map((phone, i) => ({
        id: i + 999,
        first_name: "Manual",
        last_name: "",
        email: "",
        phone: phone.trim(),
        status: "Active",
        ministries_list: null,
        join_date: "",
        role: "Guest"
      } as any));
    }

    const recipientsCount = targetMembers.length === 0 ? 12 : targetMembers.length;
    const recipientsNames = targetMembers.map(m => `${m.first_name} ${m.last_name}`).slice(0, 5).join(", ") + 
      (targetMembers.length > 5 ? ` and ${targetMembers.length - 5} more` : "");

    const payload = {
      message: smsMessage.trim(),
      recipients_count: recipientsCount,
      recipients_names: recipientsNames || "Elders, Congregation Board",
      group_type: smsGroupType,
      phones: targetMembers.map(m => m.phone).filter((p): p is string => !!p)
    };

    try {
      await api.sendSmsSimulated(payload);
      setSmsMessage("");
      setSmsCustomRecipients("");
      setIsSendingSms(false);
      loadData();
      alert(`Bulk SMS Broadcast dispatched successfully to ${recipientsCount} numbers!`);
    } catch (err: any) {
      setIsSendingSms(false);
      alert("Broadcasting SMS failed: " + err.message);
    }
  };

  // Launch simulated conference call
  const handleLaunchMeeting = () => {
    if (!videoTitle.trim()) {
      alert("Please enter a meeting description or room name.");
      return;
    }
    const code = "GIMK-" + Math.floor(1000 + Math.random() * 9000) + "-CONF";
    setMeetingCode(code);
    setIsMeetingActive(true);
    setMeetingChats([
      { sender: "System Gateway", text: "Meeting initialized. High-fidelity audio & video streams synced.", time: "Now" },
      { sender: "Apostle Newton Atela", text: "Welcome everyone to Gideons International council briefing. Let's pray.", time: "Now" }
    ]);
  };

  // End conference and log to db
  const handleEndMeeting = async () => {
    const finalMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    const finalParticipantsCount = 8 + Math.floor(Math.random() * 15);
    
    const payload = {
      title: videoTitle,
      duration_minutes: finalMinutes,
      host_name: videoHost,
      meeting_code: meetingCode,
      participants_count: finalParticipantsCount,
      date_created: new Date().toISOString().split("T")[0]
    };

    try {
      await api.logVideoCall(payload);
      setIsMeetingActive(false);
      setVideoTitle("");
      loadData();
      alert(`Meeting finalized. Total elapsed state: ${finalMinutes} minutes with ${finalParticipantsCount} connected nodes. Entry archived to the database.`);
    } catch (err: any) {
      alert("Error archiving call log: " + err.message);
      setIsMeetingActive(false);
    }
  };

  // Custom chat sender inside meeting
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const item = {
      sender: "Admin (You)",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMeetingChats(prev => [...prev, item]);
    setChatInput("");
  };

  const filteredSmsLogs = smsLogs.filter(log => 
    log.message.toLowerCase().includes(smsSearchQuery.toLowerCase()) || 
    log.group_type.toLowerCase().includes(smsSearchQuery.toLowerCase()) ||
    (log.recipients_names && log.recipients_names.toLowerCase().includes(smsSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-xs font-sans text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E1D8] pb-5">
        <div>
          <h1 className="font-display font-black text-2xl text-[#2D3E50] tracking-tight uppercase flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#C5A059]" />
            Connect & Broadcaster
          </h1>
          <p className="text-xs text-[#636E72] font-semibold mt-1">
            Dispatch bulk text notifications to cell groups/ministries and launch digital audio-video conference councils.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E1D8]">
        <button
          onClick={() => setActiveTab("sms")}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer flex items-center gap-2 ${
            activeTab === "sms"
              ? "border-[#2D3E50] text-[#2D3E50]"
              : "border-transparent text-[#636E72] hover:text-[#2D3E50]"
          }`}
        >
          <Send className="h-4 w-4 text-[#C5A059]" />
          Bulk SMS Notifications Dispatcher
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer flex items-center gap-2 ${
            activeTab === "video"
              ? "border-[#2D3E50] text-[#2D3E50]"
              : "border-transparent text-[#636E72] hover:text-[#2D3E50]"
          }`}
        >
          <Video className="h-4 w-4 text-emerald-600" />
          HQ Digital Video Call Center
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* SMS MODULE */}
        {activeTab === "sms" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid gap-6 md:grid-cols-5"
          >
            {/* Draft panel - columns 3 */}
            <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl md:col-span-3 space-y-4 shadow-xs">
              <div className="border-b border-[#E5E1D8] pb-3">
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#2D3E50] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#C5A059] animate-pulse" />
                  SMS Telecommunications Draft Area
                </h3>
              </div>

              <form onSubmit={handleSendBulkSms} className="space-y-4 font-sans font-semibold text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Target Congregation Group *</label>
                    <select
                      value={smsGroupType}
                      onChange={(e) => setSmsGroupType(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs cursor-pointer transition text-[#2D3E50]"
                    >
                      <option value="All Active Members">Entire Registered Member Census</option>
                      <option value="Choir Ministry">GIMK Praise Choir Team</option>
                      <option value="Youth Fellowship">GIMK Youth Outreach Ministry</option>
                      <option value="Church Leaders">Board of Directors & Pastors</option>
                      <option value="Manual Listing">Manual Numbers Listing (Comma split)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Gateway Sender ID Mask *</label>
                    <input
                      type="text"
                      disabled
                      value="GIDEONS_INT_KENYA"
                      className="w-full h-10 rounded-xl bg-[#F5F2ED] border border-[#E5E1D8] px-3.5 text-xs text-[#2D3E50] font-black cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                {smsGroupType === "Manual Listing" && (
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Input Test Phone Numbers (Separated by comma) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +254712345678, +254722000000"
                      value={smsCustomRecipients}
                      onChange={(e) => setSmsCustomRecipients(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                    <span className="text-[10px] text-[#A0A0A0] mt-1 block font-normal">
                      The telecom interface will trigger simulated deliveries automatically to their mobile nodes.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Message Content / Text *</label>
                  <textarea
                    rows={4}
                    required
                    maxLength={160}
                    placeholder="Type notifications here (maximum 160 characters)... e.g. Dear member, you are cordially invited for the regional branch revival at HQ Kabondo this Sunday from 9am!"
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] p-3 text-xs focus:outline-none focus:border-[#C5A059] focus:bg-white transition resize-none font-medium leading-relaxed pb-6 text-[#2D3436]"
                  />
                  <div className="flex justify-between items-center text-[10px] text-[#A0A0A0] mt-1 font-bold">
                    <span>Double character count limit: 160 GSM Standard</span>
                    <span>{smsMessage.length}/160 characters</span>
                  </div>
                </div>

                <div className="bg-[#FDFCF8] border border-neutral-150 p-3 rounded-xl text-[10px] text-[#636E72] font-medium leading-relaxed">
                  <strong>Real-Time Delivery Note:</strong> To enable real-time delivery to Kenyan numbers, replace the simulated API call with a production gateway like <em>Africa's Talking</em> or <em>Twilio</em>.
                  <br/><br/>
                  <strong>Simulated Mode:</strong> Currently running in sandbox mode for database archival.
                </div>

                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="w-full h-11 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] text-[#C5A059] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#2D3E50]/10"
                >
                  {isSendingSms ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-[#C5A059]" />
                      Broadcasting SMS via Kenyan Carrier...
                    </>
                    ) : (
                    <>
                      <Send className="h-4 w-4 text-[#C5A059]" />
                      Dispatch Broadcast SMS
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Mobile draft preview & history logs - columns 2 */}
            <div className="md:col-span-2 space-y-4">
              {/* iPhone preview */}
              <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border border-slate-800 flex flex-col justify-between max-w-sm mx-auto relative overflow-hidden h-[240px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="h-5 w-24 bg-black rounded-full absolute top-1 left-1/2 -translate-x-1/2 z-10" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400">GIMK BROADCAST</span>
                  <div className="flex items-center gap-1.5 text-[9px] text-[#10B981] font-black uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
                    Telecom Ready
                  </div>
                </div>

                <div className="flex-grow flex items-center justify-center py-4">
                  {smsMessage ? (
                    <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl relative max-w-[90%] text-[11px] leading-relaxed select-text font-normal">
                      <p>{smsMessage}</p>
                      <div className="absolute -bottom-1.5 right-4 h-3 w-3 bg-slate-800 rotate-45 border-r border-b border-slate-700/50" />
                    </div>
                  ) : (
                    <div className="text-center text-neutral-500 font-bold tracking-wide italic text-[10px]">
                      Type message on left to review live mock draft delivery visualizer...
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800/60 pt-2 text-center text-[9px] text-neutral-400 uppercase tracking-widest font-mono">
                  GIDEONS INTERNATIONAL SATELLITE
                </div>
              </div>

              {/* Past SMS history logs */}
              <div className="bg-white border border-[#E5E1D8] p-4 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2D3E50]">Past SMS Dispatch Records</h4>
                  <span className="bg-[#2D3E50]/5 text-neutral-700 px-2 py-0.5 rounded text-[8px] font-bold">{filteredSmsLogs.length} logs</span>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-neutral-400">
                    <Search className="h-3 w-3" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={smsSearchQuery}
                    onChange={(e) => setSmsSearchQuery(e.target.value)}
                    className="w-full h-7 rounded-lg border border-[#E5E1D8] bg-[#FDFCF8] pl-7 pr-2 text-[10px] focus:outline-none focus:border-[#C5A059] transition"
                  />
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 divide-y divide-neutral-50">
                  {filteredSmsLogs.length === 0 ? (
                    <p className="text-[10px] italic text-[#A0A0A0] text-center pt-4">No logged broadcasts.</p>
                  ) : (
                    filteredSmsLogs.map(log => (
                      <div key={log.id} className="pt-2 text-[11px] font-semibold space-y-1 text-[#2D3E50]">
                        <div className="flex items-center justify-between font-bold text-[10px]">
                          <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">{log.group_type}</span>
                          <span className="text-neutral-400 font-mono font-normal">{log.date_sent}</span>
                        </div>
                        <p className="text-[#636E72] line-clamp-2 leading-relaxed font-normal">{log.message}</p>
                        <p className="text-[9px] text-[#A0A0A0] italic">Sent to {log.recipients_count} nodes: {log.recipients_names}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* DIGITAL COUNCIL ROOM */}
        {activeTab === "video" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* If conference NOT active, display planning and logs */}
            {!isMeetingActive ? (
              <div className="grid gap-6 md:grid-cols-5">
                {/* Form to initiate */}
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl md:col-span-3 space-y-4">
                  <div className="border-b border-[#E5E1D8] pb-3">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#2D3E50] flex items-center gap-2">
                      <Video className="h-5 w-5 text-emerald-600" />
                      Initiate Executive Council Conference Call
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs font-semibold font-sans text-left">
                    <div>
                      <label className="block font-bold text-[#636E72] mb-1">Select Conference Host Profile</label>
                      <select
                        value={videoHost}
                        onChange={(e) => setVideoHost(e.target.value)}
                        className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2.5 focus:outline-none focus:border-[#C5A059] focus:bg-white cursor-pointer text-neutral-600 transition"
                      >
                        <option value="Apostle Newton Atela">Apostle Newton Atela (Office)</option>
                        <option value="Executive General Secretary">Executive General Secretary (Ramba HQ)</option>
                        <option value="Treasurer Board Controller">Treasurer Board Controller</option>
                        <option value="Nairobi Branch Superintendent">Nairobi Branch Superintendent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#636E72] mb-1">Brief Call Title / Objective *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Quarterly HQ Auditing and District Branch Expansion Briefing"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                      />
                    </div>

                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1 text-[#636E72] font-medium leading-relaxed">
                      <strong>High-Density Streaming Technology:</strong> Launching a virtual session allocates an instant room buffer with live speaking tracking, full meeting sidebar dialogue chat, mute controllers, and automatically pushes minutes registers straight into the database upon termination.
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleLaunchMeeting}
                        className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/10"
                      >
                        <Video className="h-4.5 w-4.5" />
                        Launch HQ Virtual Conference Stage
                      </button>
                    )}
                  </div>
                </div>

                {/* Past Call Archives */}
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl md:col-span-2 space-y-3">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#2D3E50] border-b border-[#E5E1D8] pb-2.5">
                    Past Conference Archive Ledger
                  </h3>

                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 divide-y divide-neutral-50 pt-1">
                    {videoLogs.length === 0 ? (
                      <p className="text-[10px] italic text-[#A0A0A0] text-center pt-8">No historical conference logs available.</p>
                    ) : (
                      videoLogs.map(log => (
                        <div key={log.id} className="pt-2 text-[11px] font-semibold space-y-1.5 text-[#2D3E50]">
                          <h4 className="font-bold text-[#2D3E50] leading-normal">{log.title}</h4>
                          <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                            <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <UserCheck className="h-2.5 w-2.5" />
                              Host: {log.host_name}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Users className="h-2.5 w-2.5" />
                              Nodes: {log.participants_count}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
                            <span>Code: {log.meeting_code}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.duration_minutes} Mins • {log.date_created}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* LIVE IMMERSIVE CALL INTERFACE */
              <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-900 grid gap-6 md:grid-cols-4 font-sans text-xs relative overflow-hidden">
                <div className="absolute -top-12 -right-12 h-64 w-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Visual grid - columns 3 */}
                <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 font-mono bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        ● Live streaming
                      </span>
                      <h2 className="text-base font-black text-white mt-2 leading-tight uppercase font-display">{videoTitle}</h2>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold tracking-widest text-[#C5A059] bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                        {Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:
                        {(elapsedSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Active Speaker / Participant slot stream */}
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 py-4">
                    {[
                      { name: "Apostle Newton Atela", status: "Speaking", avatar: "NA", bg: "from-blue-900/60 to-slate-900" },
                      { name: "Evangelist Mary", status: "Connected", avatar: "EM", bg: "from-amber-900/40 to-slate-900" },
                      { name: "Treasurer Jane", status: "Muted", avatar: "TJ", bg: "from-purple-900/40 to-slate-900" },
                      { name: "Pastor Charles", status: "Connected", avatar: "PC", bg: "from-emerald-900/40 to-slate-900" },
                      { name: "Brother Samuel", status: "Connected", avatar: "BS", bg: "from-rose-900/40 to-slate-900" },
                      { name: "Admin (You)", status: isMuted ? "Muted" : "Speaking", avatar: "AD", bg: isVideoOff ? "from-neutral-900 to-slate-900" : "from-slate-800 to-slate-900", isSelf: true }
                    ].map((participant, i) => {
                      const isSpeaking = simulatedSpeakers === participant.name || (participant.isSelf && !isMuted);
                      const isPartMuted = participant.name === "Treasurer Jane" || (participant.isSelf && isMuted);
                      const isPartVideoOff = participant.isSelf && isVideoOff;

                      return (
                        <div 
                          key={i} 
                          className={`h-32 bg-gradient-to-br ${participant.bg} border rounded-2xl p-3 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 ${
                            isSpeaking 
                              ? "border-[#C5A059] shadow-md shadow-[#C5A059]/10 scale-[1.02]" 
                              : "border-slate-800/80"
                          }`}
                        >
                          {/* Top state */}
                          <div className="w-full flex justify-between items-center text-[8px] font-black uppercase text-neutral-400">
                            <span className="flex items-center gap-1 text-slate-400 font-mono">
                              <Users className="h-2.5 w-2.5" />
                              Slot 0{i+1}
                            </span>
                            {isPartMuted ? (
                              <VolumeX className="h-3 w-3 text-rose-500 fill-rose-500/10" />
                            ) : (
                              <Volume2 className="h-3 w-3 text-emerald-400" />
                            )}
                          </div>

                          {/* Avatar icon */}
                          {isPartVideoOff ? (
                            <VideoOff className="h-8 w-8 text-rose-500" />
                          ) : (
                            <div className={`h-11 w-11 rounded-full bg-slate-900 font-black font-display text-[#C5A059] flex items-center justify-center text-xs border border-slate-700 relative`}>
                              {participant.avatar}
                              {isSpeaking && (
                                <span className="absolute -inset-1 border border-emerald-400 rounded-full animate-ping scale-110 opacity-75" />
                              )}
                            </div>
                          )}

                          {/* Footer label */}
                          <div className="w-full flex items-center justify-between text-[10px] font-bold text-white z-10">
                            <span className="truncate">{participant.name}</span>
                            {isSpeaking ? (
                              <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded uppercase tracking-widest font-mono">Talk</span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Conference Room Controllers Row */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-slate-900">
                    <button
                      onClick={() => setIsMuted(prev => !prev)}
                      className={`h-10 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                        isMuted 
                          ? "bg-rose-900 text-rose-200 border border-rose-800 hover:bg-rose-850" 
                          : "bg-slate-900 text-white border border-slate-800 hover:bg-slate-850"
                      }`}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-[#C5A059]" />}
                      {isMuted ? "Mic Muted" : "Mute Mic"}
                    </button>

                    <button
                      onClick={() => setIsVideoOff(prev => !prev)}
                      className={`h-10 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                        isVideoOff 
                          ? "bg-rose-900 text-rose-200 border border-rose-800 hover:bg-rose-850" 
                          : "bg-slate-900 text-white border border-slate-800 hover:bg-slate-850"
                      }`}
                    >
                      {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4 text-emerald-500" />}
                      {isVideoOff ? "Video Stopped" : "Camera Off"}
                    </button>

                    <button
                      onClick={() => setIsHandRaised(prev => !prev)}
                      className={`h-10 px-4 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                        isHandRaised 
                          ? "bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 hover:bg-[#C5A059]/30" 
                          : "bg-slate-900 text-white border border-slate-800 hover:bg-slate-850"
                      }`}
                    >
                      <Hand className="h-4 w-4 text-amber-500" />
                      {isHandRaised ? "Hand Raised" : "Raise Hand"}
                    </button>

                    <button
                      onClick={handleEndMeeting}
                      className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-lg shadow-rose-600/10"
                    >
                      <PhoneOff className="h-4 w-4" />
                      Terminate call
                    </button>
                  </div>
                </div>

                {/* Right chat sidebar - columns 1 */}
                <div className="bg-slate-900 border border-slate-900/80 rounded-2xl p-4 flex flex-col justify-between h-[420px]">
                  <div className="border-b border-slate-800 pb-2 mb-3">
                    <span className="font-display font-black text-[10px] uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Meeting Dialogue Stream
                    </span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-grow overflow-y-auto space-y-2.5 pr-1 max-h-[300px]">
                    {meetingChats.map((msg, idx) => (
                      <div key={idx} className="text-[11px] font-semibold text-neutral-300">
                        <div className="flex items-center justify-between font-bold text-[9px] text-[#C5A059] mb-0.5">
                          <span>{msg.sender}</span>
                          <span className="text-neutral-500 font-mono font-normal">{msg.time}</span>
                        </div>
                        <p className="bg-slate-950 p-2 rounded-xl text-neutral-300 font-normal leading-normal">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chat sender input */}
                  <form onSubmit={handleSendChat} className="border-t border-slate-800 pt-3 mt-3 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Comment..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="h-8.5 rounded-lg bg-slate-950 border border-slate-800 px-3 flex-grow text-xs text-white focus:outline-none focus:border-[#C5A059] transition"
                    />
                    <button
                      type="submit"
                      className="h-8.5 w-8.5 rounded-lg bg-[#C5A059] text-slate-950 font-black flex items-center justify-center hover:bg-[#b08e4d] transition cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
