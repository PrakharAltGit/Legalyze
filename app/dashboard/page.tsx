"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { Button } from "@/app/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/Card";
import {
  FileText,
  Clock,
  CheckCircle,
  Upload,
  ChevronRight,
  X,
  Send,
  Loader2,
  ListChecks,
  MessageSquare,
  Trash2,
  GitCommitHorizontal,
  RefreshCw,
  Scale,
  ShieldAlert,
  UserX,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DocRecord {
  id: string;
  name: string;
  uploadedAt: string;
  text: string;
  summary: string;
  keyPoints: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category: "incident" | "filing" | "hearing" | "evidence" | "verdict" | "other";
}

interface IpcSection {
  section: string;
  actName: string;
  shortDescription: string;
  appliedTo: string;
  reason: string;
  outcome: "convicted" | "acquitted" | "charges framed" | "under trial" | "not specified";
}

type ActiveTab = "summary" | "chat" | "timeline" | "ipc";

const CATEGORY_CONFIG: Record<
  TimelineEvent["category"],
  { color: string; bg: string; border: string; dot: string; label: string }
> = {
  incident: {color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/20", border: "border-red-200 dark:border-red-800/40", dot: "bg-red-500", label: "Incident",
  },
  filing: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800/40",
    dot: "bg-amber-500",
    label: "Filing",
  },
  hearing: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800/40",
    dot: "bg-blue-500",
    label: "Hearing",
  },
  evidence: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800/40",
    dot: "bg-purple-500",
    label: "Evidence",
  },
  verdict: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
    label: "Verdict",
  },
  other: {
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/50",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    label: "Event",
  },
};

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timeline state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [timelineGenerated, setTimelineGenerated] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // IPC state
  const [ipcSections, setIpcSections] = useState<IpcSection[]>([]);
  const [ipcLoading, setIpcLoading] = useState(false);
  const [ipcError, setIpcError] = useState<string | null>(null);
  const [ipcGenerated, setIpcGenerated] = useState(false);

  // Load docs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("legalyze_docs");
    if (stored) setDocs(JSON.parse(stored));
  }, []);

  // Reset panels when doc changes
  useEffect(() => {
    setChatHistory([]);
    setChatInput("");
    setActiveTab("summary");
    setTimelineEvents([]);
    setTimelineError(null);
    setTimelineGenerated(false);
    setIpcSections([]);
    setIpcError(null);
    setIpcGenerated(false);
  }, [selectedDoc?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSelectDoc = (doc: DocRecord) => setSelectedDoc(doc);

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    localStorage.setItem("legalyze_docs", JSON.stringify(updated));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedDoc || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userMessage },
    ];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          context: selectedDoc.text,
          history: chatHistory,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get answer");
      }
      const data = await response.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.answer }]);
    } catch (err: any) {
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: `Error: ${err.message}. Make sure Ollama is running.`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateTimeline = async () => {
    if (!selectedDoc || timelineLoading) return;
    setTimelineLoading(true);
    setTimelineError(null);
    setTimelineEvents([]);
    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedDoc.text }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate timeline");
      }
      const data = await response.json();
      setTimelineEvents(data.events);
      setTimelineGenerated(true);
      // Scroll timeline to start after render
      setTimeout(() => {
        timelineScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setTimelineError(err.message || "Something went wrong.");
    } finally {
      setTimelineLoading(false);
    }
  };

  const generateIpc = async () => {
    if (!selectedDoc || ipcLoading) return;
    setIpcLoading(true);
    setIpcError(null);
    setIpcSections([]);
    try {
      const response = await fetch("/api/ipc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedDoc.text }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to extract IPC sections");
      }
      const data = await response.json();
      setIpcSections(data.sections);
      setIpcGenerated(true);
    } catch (err: any) {
      setIpcError(err.message || "Something went wrong.");
    } finally {
      setIpcLoading(false);
    }
  };

  // Convert vertical wheel scroll to horizontal scroll on timeline
  const handleTimelineWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  };


  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 ease-in-out" style={{ marginLeft: "var(--sidebar-width)" }}>
        <div className="p-8 lg:p-10 h-screen flex flex-col">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Your legal case workspace</p>
            </div>
            <Link href="/upload">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Stats
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Cases", value: docs.length.toString(), icon: FileText, color: "blue" },
              { label: "Active", value: docs.length.toString(), icon: CheckCircle, color: "emerald" },
              { label: "Recent", value: docs.length > 0 ? "1" : "0", icon: Clock, color: "amber" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} variant="glass">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        stat.color === "blue" && "bg-blue-100 dark:bg-blue-950/30",
                        stat.color === "emerald" && "bg-emerald-100 dark:bg-emerald-950/30",
                        stat.color === "amber" && "bg-amber-100 dark:bg-amber-950/30",
                      )}>
                        <Icon className={cn(
                          "h-6 w-6",
                          stat.color === "blue" && "text-blue-600 dark:text-blue-400",
                          stat.color === "emerald" && "text-emerald-600 dark:text-emerald-400",
                          stat.color === "amber" && "text-amber-600 dark:text-amber-400",
                        )} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div> */}

          {/* Main split panel */}
          <div className="flex gap-6 flex-1 min-h-0">

            {/* Document List */}
            <div className={cn(
              "transition-all duration-300",
              selectedDoc ? "w-72 shrink-0" : "flex-1"
            )}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Documents</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3">
                  {docs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/30 mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        No documents yet
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                        Upload a legal document to get started
                      </p>
                      <Link href="/upload">
                        <Button className="gap-2" size="sm">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectDoc(doc)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group",
                            "hover:bg-slate-100 dark:hover:bg-slate-800",
                            selectedDoc?.id === doc.id
                              ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-200 dark:ring-blue-800"
                              : "bg-white dark:bg-slate-900"
                          )}
                        >
                          <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            selectedDoc?.id === doc.id
                              ? "bg-blue-100 dark:bg-blue-900/50"
                              : "bg-slate-100 dark:bg-slate-800"
                          )}>
                            <FileText className={cn(
                              "h-4 w-4",
                              selectedDoc?.id === doc.id
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-500 dark:text-slate-400"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              selectedDoc?.id === doc.id
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-slate-800 dark:text-slate-200"
                            )}>
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{formatDate(doc.uploadedAt)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteDoc(doc.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/30 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-colors",
                              selectedDoc?.id === doc.id ? "text-blue-500" : "text-slate-400"
                            )} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detail Panel */}
            {selectedDoc && (
              <div className="flex-1 min-w-0 flex flex-col">
                <Card className="flex-1 flex flex-col min-h-0">

                  {/* Panel header + tabs */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 mb-4 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {selectedDoc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 mb-4">
                      <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                        {/* Summary tab */}
                        <button
                          onClick={() => setActiveTab("summary")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            activeTab === "summary"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          Summary
                        </button>
                        {/* Chat tab */}
                        <button
                          onClick={() => setActiveTab("chat")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            activeTab === "chat"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Chat
                          {chatHistory.length > 0 && (
                            <span className="bg-blue-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                              {Math.floor(chatHistory.length / 2)}
                            </span>
                          )}
                        </button>
                        {/* Timeline tab */}
                        <button
                          onClick={() => setActiveTab("timeline")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            activeTab === "timeline"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          <GitCommitHorizontal className="h-3.5 w-3.5" />
                          Timeline
                          {timelineGenerated && timelineEvents.length > 0 && (
                            <span className="bg-indigo-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                              {timelineEvents.length}
                            </span>
                          )}
                        </button>
                        {/* IPC tab */}
                        <button
                          onClick={() => setActiveTab("ipc")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            activeTab === "ipc"
                              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          )}
                        >
                          <Scale className="h-3.5 w-3.5" />
                          IPC
                          {ipcGenerated && ipcSections.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                              {ipcSections.length}
                            </span>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* ── SUMMARY TAB ── */}
                  {activeTab === "summary" && (
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                          Summary
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {selectedDoc.summary}
                          </p>
                        </div>
                      </div>

                      {selectedDoc.keyPoints && selectedDoc.keyPoints.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                            Key Points
                          </h3>
                          <ul className="space-y-2">
                            {selectedDoc.keyPoints.map((point, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800"
                              >
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50 mt-0.5">
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    {i + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {point}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                          Explore this case further
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Chat with the AI or view the full case timeline.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setActiveTab("chat")}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Open Chat
                          </button>
                          <button
                            onClick={() => { setActiveTab("timeline"); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <GitCommitHorizontal className="h-3.5 w-3.5" />
                            View Timeline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── CHAT TAB ── */}
                  {activeTab === "chat" && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {chatHistory.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/30 mb-3">
                              <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Ask about this case
                            </p>
                            <p className="text-xs text-slate-400 max-w-xs">
                              Ask any question — parties involved, dates, clauses, obligations, and more.
                            </p>
                          </div>
                        ) : (
                          chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                            >
                              {msg.role === "assistant" && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mt-0.5">
                                  <span className="text-[10px] font-bold text-white">AI</span>
                                </div>
                              )}
                              <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                msg.role === "user"
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
                              )}>
                                {msg.content}
                              </div>
                              {msg.role === "user" && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">U</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {chatLoading && (
                          <div className="flex gap-3 justify-start">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600">
                              <span className="text-[10px] font-bold text-white">AI</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                              <div className="flex gap-1 items-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
                        <div className="flex gap-2">
                          <textarea
                            value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask a question about this case..." rows={1}
                            className={cn("flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm", "bg-white dark:bg-slate-900", "border-slate-200 dark:border-slate-700", "text-slate-900 dark:text-slate-100", "placeholder:text-slate-400", "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500", "transition-all"
                            )}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!chatInput.trim() || chatLoading}
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                              chatInput.trim() && !chatLoading
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            )}
                          >
                            {chatLoading
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Send className="h-4 w-4" />
                            }
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                          Press Enter to send · Shift+Enter for new line
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── TIMELINE TAB ── */}
                  {activeTab === "timeline" && (
                    <div className="flex-1 flex flex-col min-h-0">

                      {/* Not yet generated */}
                      {!timelineGenerated && !timelineLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-10">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/30 mb-4">
                            <GitCommitHorizontal className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Generate Case Timeline
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                            The AI will extract every key event from this document — from the incident to the final verdict — and lay them out chronologically.
                          </p>
                          <button
                            onClick={generateTimeline}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 transition-all"
                          >
                            <GitCommitHorizontal className="h-4 w-4" />
                            Generate Timeline
                          </button>
                        </div>
                      )}

                      {/* Loading */}
                      {timelineLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4">
                          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Analysing document...
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Extracting events and dates from the case
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {timelineError && !timelineLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 max-w-sm w-full text-center">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                              Failed to generate timeline
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{timelineError}</p>
                            <button
                              onClick={generateTimeline}
                              className="flex items-center gap-1.5 mx-auto text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Try again
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timeline rendered */}
                      {timelineGenerated && !timelineLoading && timelineEvents.length > 0 && (
                        <div className="flex-1 flex flex-col min-h-0">
                          {/* Legend + regenerate */}
                          <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0 flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              {(Object.keys(CATEGORY_CONFIG) as TimelineEvent["category"][]).map((cat) => (
                                <div key={cat} className="flex items-center gap-1.5">
                                  <div className={cn("h-2 w-2 rounded-full", CATEGORY_CONFIG[cat].dot)} />
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {CATEGORY_CONFIG[cat].label}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={generateTimeline}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Regenerate
                            </button>
                          </div>

                          {/* Horizontal scrollable timeline — wheel scrolls horizontally */}
                          <div
                            ref={timelineScrollRef}
                            onWheel={handleTimelineWheel}
                            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                            className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-4 cursor-grab active:cursor-grabbing"
                            style={{ minHeight: 0 }}
                          >
                            {/*
                              Layout strategy:
                              - Fixed total height container: 420px
                              - Centre line sits exactly at 50% (210px from top)
                              - Above cards occupy top 0–160px, stem 160–210px
                              - Below cards occupy 210–370px stem from 210px
                              - Date labels sit just outside the stem on each side
                            */}
                            <div
                              className="relative"
                              style={{
                                minWidth: `${timelineEvents.length * 230}px`,
                                height: "420px",
                              }}
                            >
                              {/* Centre line — exactly at 210px from top */}
                              <div
                                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-300 via-blue-300 to-emerald-300 dark:from-indigo-600 dark:via-blue-600 dark:to-emerald-600"
                                style={{ top: "210px" }}
                              />

                              {timelineEvents.map((event, i) => {
                                const cfg = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
                                const isAbove = i % 2 === 0;
                                const cx = i * 230 + 115;
                                const lineY = 210;
                                const cardH = 150;
                                const stemH = 36;
                                const dotR = 8;

                                return (
                                  <div key={i}>
                                    {isAbove ? (
                                      <>
                                        {/* Invisible hover zone: covers card + stem + dot area */}
                                        <div
                                          className="absolute z-20"
                                          style={{
                                            left: `${cx - 88}px`,
                                            top: `${lineY - stemH - cardH}px`,
                                            width: "176px",
                                            height: `${cardH + stemH + dotR * 2}px`,
                                            cursor: "default",
                                          }}
                                          onMouseEnter={() => setHoveredEvent(i)}
                                          onMouseLeave={() => { setHoveredEvent(null); setTooltipPos(null); }}
                                        />

                                        {/* Card above */}
                                        <div
                                          className={cn(
                                            "absolute w-44 rounded-xl border p-3 shadow-sm transition-all duration-200",
                                            cfg.bg, cfg.border,
                                            hoveredEvent === i ? "shadow-lg brightness-110" : ""
                                          )}
                                          style={{ left: `${cx - 88}px`, top: `${lineY - stemH - cardH}px`, height: `${cardH}px`, overflow: "hidden" }}
                                        >
                                          <div className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", cfg.color)}>{cfg.label}</div>
                                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">{event.title}</div>
                                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{event.description}</div>
                                        </div>

                                        {/* Stem */}
                                        <div className="absolute w-px bg-slate-300 dark:bg-slate-600"
                                          style={{ left: `${cx}px`, top: `${lineY - stemH}px`, height: `${stemH - dotR}px` }} />

                                        {/* Dot */}
                                        <div
                                          className={cn("absolute rounded-full border-2 border-white dark:border-slate-900 shadow-md z-10 transition-transform duration-150", cfg.dot, hoveredEvent === i ? "scale-150" : "")}
                                          style={{ width: "16px", height: "16px", left: `${cx - dotR}px`, top: `${lineY - dotR}px` }}
                                        />

                                        {/* Date below dot */}
                                        <div className="absolute text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center"
                                          style={{ width: "120px", left: `${cx - 60}px`, top: `${lineY + dotR + 6}px` }}>
                                          {event.date}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {/* Date above dot */}
                                        <div className="absolute text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center"
                                          style={{ width: "120px", left: `${cx - 60}px`, top: `${lineY - dotR - 20}px` }}>
                                          {event.date}
                                        </div>

                                        {/* Dot */}
                                        <div
                                          className={cn("absolute rounded-full border-2 border-white dark:border-slate-900 shadow-md z-10 transition-transform duration-150", cfg.dot, hoveredEvent === i ? "scale-150" : "")}
                                          style={{ width: "16px", height: "16px", left: `${cx - dotR}px`, top: `${lineY - dotR}px` }}
                                        />

                                        {/* Stem */}
                                        <div className="absolute w-px bg-slate-300 dark:bg-slate-600"
                                          style={{ left: `${cx}px`, top: `${lineY + dotR}px`, height: `${stemH - dotR}px` }} />

                                        {/* Card below */}
                                        <div
                                          className={cn(
                                            "absolute w-44 rounded-xl border p-3 shadow-sm transition-all duration-200",
                                            cfg.bg, cfg.border,
                                            hoveredEvent === i ? "shadow-lg brightness-110" : ""
                                          )}
                                          style={{ left: `${cx - 88}px`, top: `${lineY + stemH}px`, height: `${cardH}px`, overflow: "hidden" }}
                                        >
                                          <div className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", cfg.color)}>{cfg.label}</div>
                                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">{event.title}</div>
                                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{event.description}</div>
                                        </div>

                                        {/* Invisible hover zone: covers dot + stem + card area */}
                                        <div
                                          className="absolute z-20"
                                          style={{
                                            left: `${cx - 88}px`,
                                            top: `${lineY - dotR}px`,
                                            width: "176px",
                                            height: `${dotR * 2 + stemH + cardH}px`,
                                            cursor: "default",
                                          }}
                                          onMouseEnter={() => setHoveredEvent(i)}
                                          onMouseLeave={() => { setHoveredEvent(null); setTooltipPos(null); }}
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Fixed-position tooltip — renders outside overflow container so it's never clipped */}
                          {hoveredEvent !== null && tooltipPos && (() => {
                            const ev = timelineEvents[hoveredEvent];
                            const cfg2 = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.other;
                            const tipW = 240;
                            const tipH = 120;
                            const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
                            const vh = typeof window !== "undefined" ? window.innerHeight : 800;
                            const tx = Math.min(tooltipPos.x + 16, vw - tipW - 8);
                            const ty = Math.min(tooltipPos.y + 16, vh - tipH - 8);
                            return (
                              <div
                                className={cn(
                                  "fixed z-50 rounded-xl border p-3 shadow-2xl pointer-events-none",
                                  cfg2.bg, cfg2.border
                                )}
                                style={{ left: tx, top: ty, width: tipW }}
                              >
                                <div className={cn("text-[10px] font-semibold uppercase tracking-wider mb-1", cfg2.color)}>
                                  {cfg2.label} · {ev.date}
                                </div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5 leading-tight">
                                  {ev.title}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {ev.description}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── IPC SECTIONS TAB ── */}
                  {activeTab === "ipc" && (
                    <div className="flex-1 flex flex-col min-h-0">

                      {/* Not yet generated */}
                      {!ipcGenerated && !ipcLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-10">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/30 mb-4">
                            <Scale className="h-7 w-7 text-rose-600 dark:text-rose-400" />
                          </div>
                          <p className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            Extract Legal Sections
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                            The AI will identify every IPC section, act, and legal provision applied in this case — who they were applied to and why.
                          </p>
                          <button
                            onClick={generateIpc}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 transition-all"
                          >
                            <Scale className="h-4 w-4" />
                            Extract IPC Sections
                          </button>
                        </div>
                      )}

                      {/* Loading */}
                      {ipcLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4">
                          <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Scanning legal sections...</p>
                            <p className="text-xs text-slate-400 mt-1">Identifying IPC sections, acts, and provisions</p>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {ipcError && !ipcLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 max-w-sm w-full text-center">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Failed to extract sections</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{ipcError}</p>
                            <button onClick={generateIpc} className="flex items-center gap-1.5 mx-auto text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                              <RefreshCw className="h-3.5 w-3.5" />Try again
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      {ipcGenerated && !ipcLoading && (
                        <div className="flex-1 overflow-y-auto p-5">

                          {/* Header row */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4 text-rose-500" />
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {ipcSections.length} Legal Section{ipcSections.length !== 1 ? "s" : ""} Found
                              </span>
                            </div>
                            <button
                              onClick={generateIpc}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                              <RefreshCw className="h-3 w-3" />Regenerate
                            </button>
                          </div>

                          {ipcSections.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">
                              No IPC sections or legal provisions found in this document.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {ipcSections.map((sec, i) => {
                                const outcomeConfig = {
                                  convicted:       { icon: Gavel,        color: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-950/40",     label: "Convicted" },
                                  acquitted:       { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/40", label: "Acquitted" },
                                  "charges framed":{ icon: ShieldAlert,  color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/40",  label: "Charges Framed" },
                                  "under trial":   { icon: HelpCircle,   color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-950/40",   label: "Under Trial" },
                                  "not specified": { icon: XCircle,      color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800",    label: "Not Specified" },
                                };
                                const oc = outcomeConfig[sec.outcome] ?? outcomeConfig["not specified"];
                                const OcIcon = oc.icon;

                                return (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                                  >
                                    {/* Card top bar */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40">
                                          <Scale className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{sec.section}</p>
                                          <p className="text-[10px] text-slate-400 truncate">{sec.actName}</p>
                                        </div>
                                      </div>
                                      {/* Outcome badge */}
                                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ml-3", oc.bg, oc.color)}>
                                        <OcIcon className="h-3 w-3" />
                                        {oc.label}
                                      </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-4 py-3 space-y-3">
                                      {/* What it covers */}
                                      <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                          What it covers
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                          {sec.shortDescription}
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Applied to */}
                                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <UserX className="h-3 w-3 text-rose-500" />
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                              Applied To
                                            </p>
                                          </div>
                                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            {sec.appliedTo}
                                          </p>
                                        </div>

                                        {/* Why applied */}
                                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <ShieldAlert className="h-3 w-3 text-amber-500" />
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                              Why Applied
                                            </p>
                                          </div>
                                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {sec.reason}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}


                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}