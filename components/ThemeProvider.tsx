"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolved: "dark",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemPref(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(t: Theme): "dark" | "light" {
  return t === "system" ? getSystemPref() : t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start as "system" on server — avoids SSR/client mismatch
  const [theme, setThemeState] = useState<Theme>("system");
  // Track whether we've mounted so Navbar reads correct theme after hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored preference after mount (client-only)
    try {
      const v = localStorage.getItem("jwt-theme");
      if (v === "light" || v === "dark" || v === "system") {
        setThemeState(v);
      }
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  // Apply data-theme to <html> whenever theme changes
  useEffect(() => {
    const r = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", r);
  }, [theme]);

  // Re-apply when system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      try {
        const stored = localStorage.getItem("jwt-theme");
        if (!stored || stored === "system") {
          document.documentElement.setAttribute("data-theme", getSystemPref());
        }
      } catch { /* ignore */ }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function setTheme(t: Theme) {
    try { localStorage.setItem("jwt-theme", t); } catch { /* ignore */ }
    setThemeState(t);
  }

  const resolved = resolveTheme(theme);

  // Pass `mounted` so consumers can defer rendering theme-dependent UI
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "system", setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
