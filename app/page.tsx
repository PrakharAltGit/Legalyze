"use client";

import { Button } from "@/app/components/Button";
import { useTheme } from "@/app/contexts/ThemeContext";
import {
  Scale,
  ArrowRight,
  Shield,
  FileText,
  Clock,
  Zap,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "Get instant summaries powered by advanced language models.",
  },
  {
    icon: Clock,
    title: "Timeline Generation",
    description: "Automatically extract and organize chronological events.",
  },
  {
    icon: Scale,
    title: "Legal Section Identification",
    description: "Automatically detect and organize statutory sections (IPC, BNS, BNSS, and other laws) referenced in the case.",
  },
  {
    icon: FileText,
    title: "Case Chat Assistant",
    description: "Ask AI questions about your case and get context-aware answers on demand.",
  },
  
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="Theme min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Legalyze
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </button>
              <Link href="/">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Powered by Advanced AI
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-6">
            AI Case{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Summarizer
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Upload. Analyze. Summarize.{" "}
            <span className="text-slate-900 dark:text-slate-100 font-medium">
              Faster than ever.
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline" size="lg">
                Upload Case
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools designed for legal professionals, researchers, and investigators.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 xl:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative w-full max-w-[26rem] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 dark:group-hover:from-blue-950/20 dark:group-hover:to-indigo-950/20 transition-all duration-300" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/30 mb-4">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-indigo-600">
                <Scale className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Legalyze
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              2026 Legalyze. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
