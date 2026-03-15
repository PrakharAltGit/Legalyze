"use client";

import { useState, useRef } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { Button } from "@/app/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/Card";
import { ArrowLeft, Upload, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type UploadStatus = "idle" | "reading" | "summarizing" | "done" | "error";

interface ProcessingStep {
  label: string;
  active: boolean;
  done: boolean;
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    // Use local bundled worker — avoids CDN fetch failures
    const workerUrl = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const validTypes = ["application/pdf", "text/plain"];
    const validExtensions = [".pdf", ".txt", ".doc", ".docx"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setErrorMsg("Unsupported file type. Please upload a PDF or TXT file.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);

    try {
      setStatus("reading");
      let text = "";

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      if (!text || text.length < 50) {
        throw new Error(
          "Could not extract readable text from this file. Make sure it is not a scanned image-only PDF."
        );
      }

      setStatus("summarizing");
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate summary");
      }

      const result = await response.json();

      const docId = `doc_${Date.now()}`;
      const docData = {
        id: docId,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        text,
        summary: result.summary,
        keyPoints: result.keyPoints,
      };

      const existing = JSON.parse(localStorage.getItem("legalyze_docs") || "[]");
      existing.unshift(docData);
      localStorage.setItem("legalyze_docs", JSON.stringify(existing));

      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Make sure Ollama is running.");
      setStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const isProcessing = status === "reading" || status === "summarizing";

  const statusConfig = {
    idle: null,
    reading: { icon: Loader2, text: "Reading document...", color: "text-blue-500", spin: true },
    summarizing: { icon: Loader2, text: "AI is summarizing...", color: "text-indigo-500", spin: true },
    done: { icon: CheckCircle, text: "Done! Redirecting to dashboard...", color: "text-emerald-500", spin: false },
    error: { icon: AlertCircle, text: errorMsg || "An error occurred", color: "text-red-500", spin: false },
  };

  const currentStatus = statusConfig[status];

  // Defined outside JSX with explicit type to avoid TypeScript inference errors
  const processingSteps: ProcessingStep[] = [
    {
      label: "Reading file",
      active: status === "reading",
      done: status === "summarizing" || status === "done",
    },
    {
      label: "AI Summarizing",
      active: status === "summarizing",
      done: status === "done",
    },
    {
      label: "Saving",
      active: false,
      done: status === "done",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2 -ml-3 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Upload Document
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Upload your legal documents for AI-powered summarization
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                  "border-slate-300 dark:border-slate-700",
                  "hover:border-blue-500 dark:hover:border-blue-400",
                  "bg-slate-50 dark:bg-slate-900/50",
                  isDragging && "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
                  isProcessing && "pointer-events-none opacity-75"
                )}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/30 mx-auto mb-4">
                  {status === "idle" || status === "error" ? (
                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  ) : status === "done" ? (
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                </div>

                {fileName && status !== "idle" && (
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  </div>
                )}

                {currentStatus ? (
                  <div
                    className={cn(
                      "flex items-center justify-center gap-2 text-sm font-medium mb-2",
                      currentStatus.color
                    )}
                  >
                    <currentStatus.icon
                      className={cn("h-4 w-4", currentStatus.spin && "animate-spin")}
                    />
                    {currentStatus.text}
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Drop your files here
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      or click to browse files
                    </p>
                  </>
                )}

                {(status === "idle" || status === "error") && (
                  <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200">
                    Select File
                  </span>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                  Supports: PDF, TXT (Max 50MB) — Ollama must be running locally
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Processing steps indicator */}
              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-8">
                  {processingSteps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-colors",
                          step.done
                            ? "bg-emerald-500"
                            : step.active
                            ? "bg-blue-500 animate-pulse"
                            : "bg-slate-300 dark:bg-slate-700"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          step.done
                            ? "text-emerald-500"
                            : step.active
                            ? "text-blue-500"
                            : "text-slate-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}