"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  Moon,
  Sun,
  Scale,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "4rem" : "16rem"
    );
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl",
        "border-r border-slate-200 dark:border-slate-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Legalyze
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="hidden flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto">
              <Scale className="h-5 w-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              "hover:bg-slate-200 dark:hover:bg-slate-800",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                  "hover:bg-slate-200 dark:hover:bg-slate-800",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-blue-600 dark:text-blue-400")} />
                {!collapsed && (
                  <span className={cn("text-sm font-medium", isActive && "text-blue-600 dark:text-blue-400")}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              "hover:bg-slate-200 dark:hover:bg-slate-800",
              "text-slate-600 dark:text-slate-400",
              collapsed && "justify-center px-2"
            )}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                {!collapsed && <span className="text-sm font-medium">Dark Mode</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
