"use client";
import { useState } from "react";
import { X, BookOpen } from "lucide-react";

export default function Banner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      style={{ backgroundColor: "var(--jwt-surface2)", borderBottom: "1px solid var(--jwt-border)" }}
      className="w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--jwt-text-muted)" }}>
          <BookOpen size={14} style={{ color: "var(--jwt-cyan)" }} />
          <span>
            Get up-to-speed with JSON Web Tokens.{" "}
            <a
              href="https://auth0.com/resources/ebooks/jwt-handbook"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--jwt-cyan)" }}
              className="hover:underline font-medium"
            >
              Get the JWT Handbook for free →
            </a>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{ color: "var(--jwt-text-muted)" }}
          className="hover-text transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
