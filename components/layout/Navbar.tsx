"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const navLinks = [
  { href: "/", label: "Debugger" },
  { href: "/introduction", label: "Introduction" },
  { href: "/libraries", label: "Libraries" },
  { href: "https://github.com/utdevnp", label: "GitHub", external: true },
];

const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun size={14} />, label: "Light" },
  { value: "dark", icon: <Moon size={14} />, label: "Dark" },
  { value: "system", icon: <Monitor size={14} />, label: "System" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  // Only show active theme state after client hydration to avoid mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      style={{ backgroundColor: "var(--jwt-surface)", borderBottom: "1px solid var(--jwt-border)" }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            style={{ backgroundColor: "var(--jwt-cyan)" }}
            className="w-7 h-7 rounded flex items-center justify-center"
          >
            <ShieldCheck size={16} color="#0f3460" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--jwt-text)" }}>
            jwt<span style={{ color: "var(--jwt-cyan)" }}>.io</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = !link.external && pathname === link.href;
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--jwt-text-muted)" }}
                  className="px-3 py-1.5 text-sm rounded hover-text transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: isActive ? "var(--jwt-cyan)" : "var(--jwt-text-muted)",
                    borderBottom: isActive ? "2px solid var(--jwt-cyan)" : "2px solid transparent",
                  }}
                  className="px-3 py-1.5 text-sm rounded-t transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden text-xs"
            style={{ border: "1px solid var(--jwt-border)", backgroundColor: "var(--jwt-surface2)" }}
          >
            {themeOptions.map((opt) => {
              const isActive = mounted && theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  title={opt.label}
                  aria-label={`Switch to ${opt.label} theme`}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors${isActive ? "" : " hover-text"}`}
                  style={{
                    backgroundColor: isActive ? "var(--jwt-cyan)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--jwt-text-muted)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {opt.icon}
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
