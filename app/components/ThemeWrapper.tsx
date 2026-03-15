"use client";

import { useTheme } from "@/app/contexts/ThemeContext";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <>{children}</>;
}
