"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function DebugThemePage() {
  console.log("DebugThemePage rendering");
  
  try {
    const { theme, toggleTheme } = useTheme();
    console.log("Theme context loaded:", { theme, toggleTheme });

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Theme Debug Page
          </h1>
          
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Current theme: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{theme}</span>
            </p>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => {
                  console.log("Button clicked - current theme:", theme);
                  toggleTheme();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Switch to Dark
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  console.log("Manual toggle test");
                  if (typeof toggleTheme === 'function') {
                    toggleTheme();
                  } else {
                    console.error("toggleTheme is not a function");
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Test Toggle Function
              </button>
            </div>
            
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p>Open browser console (F12) to see debug messages</p>
              <p>Click the buttons above and watch the console</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Light Mode Test</h3>
              <div className="bg-slate-100 text-slate-900 p-2 rounded">This should be light</div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Dark Mode Test</h3>
              <div className="bg-slate-800 text-slate-100 p-2 rounded">This should be dark</div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in DebugThemePage:", error);
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <h1 className="text-2xl font-bold text-red-900 mb-4">Theme Context Error</h1>
        <p className="text-red-700">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
