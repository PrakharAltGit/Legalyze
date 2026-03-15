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

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load docs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("legalyze_docs");
    if (stored) {
      setDocs(JSON.parse(stored));
    }
  }, []);

  // Reset chat when doc changes
  useEffect(() => {
    setChatHistory([]);
    setChatInput("");
    setActiveTab("summary");
  }, [selectedDoc?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSelectDoc = (doc: DocRecord) => {
    setSelectedDoc(doc);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("legalyze_docs", JSON.stringify(updated));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedDoc || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMessage }];
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
        { role: "assistant", content: `Error: ${err.message}. Make sure Ollama is running.` },
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 h-screen flex flex-col">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Your legal case workspace</p>
            </div>
            <Link href="/upload">
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </div>

          {/* Stats */}
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
          </div>

          {/* Main content: split panel */}
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
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No documents yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Upload a legal document to get started</p>
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

            {/* Summary + Chat Panel */}
            {selectedDoc && (
              <div className="flex-1 min-w-0 flex flex-col">
                <Card className="flex-1 flex flex-col min-h-0">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {selectedDoc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {/* Tabs */}
                      <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
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
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Tab */}
                  {activeTab === "summary" && (
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {/* Summary */}
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

                      {/* Key Points */}
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

                      {/* Ask questions CTA */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                          Have questions about this case?
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Use the Chat tab to ask the AI anything about this document.
                        </p>
                        <button
                          onClick={() => setActiveTab("chat")}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Open Chat
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chat Tab */}
                  {activeTab === "chat" && (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Messages */}
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
                              Ask any question about the document — parties involved, dates, clauses, obligations, etc.
                            </p>
                          </div>
                        ) : (
                          chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex gap-3",
                                msg.role === "user" ? "justify-end" : "justify-start"
                              )}
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

                      {/* Chat input */}
                      <div className="border-t border-slate-200 dark:border-slate-800 p-4 shrink-0">
                        <div className="flex gap-2">
                          <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about this case..."
                            rows={1}
                            className={cn(
                              "flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm",
                              "bg-white dark:bg-slate-900",
                              "border-slate-200 dark:border-slate-700",
                              "text-slate-900 dark:text-slate-100",
                              "placeholder:text-slate-400",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
                              "transition-all"
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
                            {chatLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                          Press Enter to send · Shift+Enter for new line
                        </p>
                      </div>
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