"use client";

import { useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import { LIBRARIES, LANGUAGES } from "@/data/libraries";
import type { Library } from "@/data/libraries";

const FEATURE_KEYS = ["sign","verify","iss","sub","aud","exp","nbf","iat","jti","typ"] as const;
const ALGO_GROUPS = [
  ["HS256","HS384","HS512"],
  ["RS256","RS384","RS512"],
  ["ES256","ES256K","ES384","ES512"],
  ["PS256","PS384","PS512"],
  ["EdDSA"],
];

export default function LibrariesPage() {
  const [selectedLang, setSelectedLang] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = LIBRARIES.filter((lib) => {
    const langMatch = selectedLang === "All" || lib.language === selectedLang;
    const searchMatch =
      !search ||
      lib.name.toLowerCase().includes(search.toLowerCase()) ||
      lib.author.toLowerCase().includes(search.toLowerCase());
    return langMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--jwt-text)" }}>
        Libraries for Token Signing/Verification
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--jwt-text-muted)" }}>
        Filter by language and find the JWT library that suits your stack.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor:
                selectedLang === lang
                  ? "var(--jwt-cyan)"
                  : "var(--jwt-surface)",
              color:
                selectedLang === lang ? "#0f3460" : "var(--jwt-text-muted)",
              border: "1px solid var(--jwt-border)",
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search libraries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 rounded text-sm mb-8"
        style={{
          backgroundColor: "var(--jwt-surface)",
          border: "1px solid var(--jwt-border)",
          color: "var(--jwt-text)",
        }}
      />

      {/* Count */}
      <p className="text-xs mb-4" style={{ color: "var(--jwt-text-muted)" }}>
        Showing {filtered.length} of {LIBRARIES.length} libraries
      </p>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((lib) => (
          <LibraryCard key={lib.name} lib={lib} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: "var(--jwt-text-muted)" }}>
            No libraries found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ lib }: { lib: Library }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lib.installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: "var(--jwt-surface)",
        border: "1px solid var(--jwt-border)",
      }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--jwt-surface2)",
                color: "var(--jwt-cyan)",
                border: "1px solid var(--jwt-border)",
              }}
            >
              {lib.language}
            </span>
            {lib.minVersion && (
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: "rgba(240,192,64,0.1)",
                  color: "var(--jwt-yellow)",
                  border: "1px solid rgba(240,192,64,0.3)",
                }}
              >
                Min: {lib.minVersion}
              </span>
            )}
          </div>
          <h3 className="font-semibold font-mono text-sm" style={{ color: "var(--jwt-text)" }}>
            {lib.name}
          </h3>
          {lib.authorUrl ? (
            <a
              href={lib.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              {lib.author}
            </a>
          ) : (
            <span className="text-xs" style={{ color: "var(--jwt-text-muted)" }}>
              {lib.author}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--jwt-yellow)" }}
          >
            <Star size={12} fill="currentColor" />
            {lib.stars >= 1000
              ? `${(lib.stars / 1000).toFixed(1)}k`
              : lib.stars}
          </span>
          <a
            href={lib.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded hover-text transition-colors"
            style={{
              color: "var(--jwt-cyan)",
              border: "1px solid var(--jwt-cyan)",
            }}
          >
            <ExternalLink size={11} />
            View repo
          </a>
        </div>
      </div>

      {/* Install command */}
      <div
        className="flex items-center justify-between rounded p-3 mb-4 font-mono text-xs"
        style={{
          backgroundColor: "var(--jwt-code-bg)",
          border: "1px solid var(--jwt-border)",
        }}
      >
        <code style={{ color: "var(--jwt-green)" }}>{lib.installCmd}</code>
        <button
          onClick={handleCopy}
          className="ml-3 text-xs px-2 py-1 rounded flex-shrink-0 transition-colors"
          style={{
            color: copied ? "var(--jwt-green)" : "var(--jwt-text-muted)",
            border: "1px solid var(--jwt-border)",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Feature matrix + algorithms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Features */}
        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--jwt-text-muted)" }}>
            Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FEATURE_KEYS.map((key) => {
              const supported = lib.features[key];
              return (
                <span
                  key={key}
                  className="text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    backgroundColor: supported
                      ? "rgba(0,200,150,0.1)"
                      : "rgba(136,136,170,0.08)",
                    color: supported
                      ? "var(--jwt-green)"
                      : "var(--jwt-text-muted)",
                    border: supported
                      ? "1px solid rgba(0,200,150,0.3)"
                      : "1px solid var(--jwt-border)",
                    opacity: supported ? 1 : 0.5,
                  }}
                >
                  {key}
                </span>
              );
            })}
          </div>
        </div>

        {/* Algorithms */}
        <div>
          <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--jwt-text-muted)" }}>
            Algorithms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALGO_GROUPS.flat().map((alg) => {
              const supported = lib.algorithms.includes(alg);
              return (
                <span
                  key={alg}
                  className="text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    backgroundColor: supported
                      ? "rgba(0,185,241,0.1)"
                      : "rgba(136,136,170,0.08)",
                    color: supported ? "var(--jwt-cyan)" : "var(--jwt-text-muted)",
                    border: supported
                      ? "1px solid rgba(0,185,241,0.3)"
                      : "1px solid var(--jwt-border)",
                    opacity: supported ? 1 : 0.4,
                  }}
                >
                  {alg}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
