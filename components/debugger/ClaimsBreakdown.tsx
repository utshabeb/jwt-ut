"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import {
  formatNumericDate,
  isExpired,
  REGISTERED_CLAIM_DESCRIPTIONS,
} from "@/lib/jwt/constants";
import type { JWTPayload } from "@/lib/jwt/types";

interface ClaimsBreakdownProps {
  payload: JWTPayload;
  searchable?: boolean;
}

export default function ClaimsBreakdown({ payload, searchable = false }: ClaimsBreakdownProps) {
  const [query, setQuery] = useState("");

  const entries = Object.entries(payload);
  const q = query.trim().toLowerCase();

  const filtered = q
    ? entries.filter(([key, value]) =>
        key.toLowerCase().includes(q) ||
        JSON.stringify(value).toLowerCase().includes(q) ||
        (REGISTERED_CLAIM_DESCRIPTIONS[key] ?? "").toLowerCase().includes(q)
      )
    : entries;

  return (
    <div className="space-y-2">
      {/* Search bar — only shown when searchable */}
      {searchable && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{
            border: "1px solid var(--jwt-border)",
            backgroundColor: "var(--jwt-input-bg)",
          }}
        >
          <Search size={13} style={{ color: "var(--jwt-text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search claims…"
            spellCheck={false}
            className="flex-1 bg-transparent outline-none text-xs font-mono"
            style={{ color: "var(--jwt-text)" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ color: "var(--jwt-text-muted)" }}
              className="hover-text transition-colors"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Claims list */}
      <div className="space-y-2 text-sm font-mono">
        {filtered.length === 0 ? (
          <p className="text-xs py-2 text-center" style={{ color: "var(--jwt-text-muted)" }}>
            No claims match &ldquo;{query}&rdquo;
          </p>
        ) : (
          filtered.map(([key, value]) => {
            const isRegistered = key in REGISTERED_CLAIM_DESCRIPTIONS;
            const isTimestamp = ["exp", "nbf", "iat"].includes(key) && typeof value === "number";
            const expired = key === "exp" && typeof value === "number" && isExpired(value);

            // Highlight matching text
            const highlight = (text: string) => {
              if (!q) return <>{text}</>;
              const idx = text.toLowerCase().indexOf(q);
              if (idx === -1) return <>{text}</>;
              return (
                <>
                  {text.slice(0, idx)}
                  <mark
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "#000000",
                      borderRadius: "3px",
                      padding: "1px 3px",
                      fontWeight: 700,
                      boxShadow: "0 0 0 1px #f59e0b",
                      WebkitTextFillColor: "#000000",
                    }}
                  >
                    {text.slice(idx, idx + q.length)}
                  </mark>
                  {text.slice(idx + q.length)}
                </>
              );
            };

            return (
              <div
                key={key}
                className="rounded p-2"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--jwt-border)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span style={{ color: "var(--jwt-cyan)" }} className="font-semibold">
                    {highlight(key)}
                  </span>
                  <span
                    style={{
                      color: expired
                        ? "var(--jwt-red)"
                        : typeof value === "string"
                        ? "var(--jwt-purple)"
                        : typeof value === "number"
                        ? "var(--jwt-yellow)"
                        : typeof value === "boolean"
                        ? "var(--jwt-green)"
                        : "var(--jwt-text)",
                    }}
                    className="text-right break-all"
                  >
                    {highlight(JSON.stringify(value))}
                    {expired && (
                      <span style={{ color: "var(--jwt-red)" }} className="ml-2 text-xs font-sans">
                        ⚠ expired
                      </span>
                    )}
                  </span>
                </div>
                {isTimestamp && typeof value === "number" && (
                  <div className="mt-1 text-xs font-sans" style={{ color: "var(--jwt-text-muted)" }}>
                    {formatNumericDate(value)}
                  </div>
                )}
                {isRegistered && (
                  <div className="mt-0.5 text-xs font-sans" style={{ color: "var(--jwt-text-muted)" }}>
                    {highlight(REGISTERED_CLAIM_DESCRIPTIONS[key])}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Result count when searching */}
      {q && filtered.length > 0 && (
        <p className="text-xs text-right" style={{ color: "var(--jwt-text-muted)" }}>
          {filtered.length} of {entries.length} claims
        </p>
      )}
    </div>
  );
}
