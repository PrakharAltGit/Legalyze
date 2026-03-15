"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeTestPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Theme Test Page
        </h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Current theme: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{theme}</span>
          </p>
          
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Light Mode Colors</h2>
            <div className="space-y-2">
              <div className="bg-slate-100 text-slate-900 p-2 rounded">Slate 100/900</div>
              <div className="bg-white text-slate-600 border border-slate-200 p-2 rounded">White/Slate 600</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Dark Mode Colors</h2>
            <div className="space-y-2">
              <div className="bg-slate-800 text-slate-100 p-2 rounded">Slate 800/100</div>
              <div className="bg-slate-900 text-slate-400 border border-slate-700 p-2 rounded">Slate 900/400</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
