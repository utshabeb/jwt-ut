"use client";

import { useState, useRef } from "react";

interface Token {
  type: "brace" | "bracket" | "key" | "string" | "number" | "boolean" | "null" | "colon" | "comma" | "whitespace";
  value: string;
}

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < json.length) {
    const ch = json[i];

    if (/\s/.test(ch)) {
      let ws = "";
      while (i < json.length && /\s/.test(json[i])) ws += json[i++];
      tokens.push({ type: "whitespace", value: ws });
      continue;
    }

    if (ch === '"') {
      let str = '"';
      i++;
      while (i < json.length) {
        if (json[i] === "\\") {
          str += json[i] + (json[i + 1] ?? "");
          i += 2;
        } else if (json[i] === '"') {
          str += '"'; i++; break;
        } else {
          str += json[i++];
        }
      }
      let j = i;
      while (j < json.length && /\s/.test(json[j])) j++;
      tokens.push({ type: json[j] === ":" ? "key" : "string", value: str });
      continue;
    }

    if (ch === "-" || /\d/.test(ch)) {
      let num = "";
      while (i < json.length && /[-\d.eE+]/.test(json[i])) num += json[i++];
      tokens.push({ type: "number", value: num });
      continue;
    }

    if (json.startsWith("true", i))  { tokens.push({ type: "boolean", value: "true" });  i += 4; continue; }
    if (json.startsWith("false", i)) { tokens.push({ type: "boolean", value: "false" }); i += 5; continue; }
    if (json.startsWith("null", i))  { tokens.push({ type: "null",    value: "null" });  i += 4; continue; }

    if (ch === "{" || ch === "}") { tokens.push({ type: "brace",   value: ch }); i++; continue; }
    if (ch === "[" || ch === "]") { tokens.push({ type: "bracket", value: ch }); i++; continue; }
    if (ch === ":") { tokens.push({ type: "colon",  value: ch }); i++; continue; }
    if (ch === ",") { tokens.push({ type: "comma",  value: ch }); i++; continue; }

    tokens.push({ type: "whitespace", value: ch });
    i++;
  }

  return tokens;
}

const COLOR: Record<Token["type"], string> = {
  key:        "var(--json-key)",
  string:     "var(--json-string)",
  number:     "var(--json-number)",
  boolean:    "var(--json-boolean)",
  null:       "var(--json-null)",
  brace:      "var(--json-punct)",
  bracket:    "var(--json-punct)",
  colon:      "var(--json-punct)",
  comma:      "var(--json-punct)",
  whitespace: "var(--jwt-text)",
};

interface JsonViewProps {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  minRows?: number;
  hasError?: boolean;
  errorMessage?: string;
  accentColor?: string;
}

export default function JsonView({
  value,
  onChange,
  editable = false,
  minRows = 3,
  hasError = false,
  errorMessage,
  accentColor,
}: JsonViewProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  let display = value;
  try { display = JSON.stringify(JSON.parse(value), null, 2); } catch { /* keep raw */ }

  const tokens = tokenize(editable ? value : display);

  const borderColor = hasError
    ? "var(--jwt-red)"
    : focused
    ? (accentColor ?? "var(--jwt-cyan)")
    : "var(--jwt-border)";

  const minH = `${minRows * 1.75}rem`;

  const sharedStyle: React.CSSProperties = {
    fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",Consolas,monospace',
    fontSize: "0.875rem",
    lineHeight: "1.75rem",
    padding: "1rem",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    minHeight: minH,
    width: "100%",
    boxSizing: "border-box",
    height: "auto",
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: "var(--jwt-code-bg)",
        transition: "border-color 0.15s",
      }}
    >
      {/* Read-only: just the highlighted pre */}
      {!editable && (
        <pre style={{ ...sharedStyle, background: "transparent", color: "var(--jwt-text)", overflow: "visible", height: "auto" }}>
          {tokens.map((tok, i) => (
            <span key={i} style={{ color: COLOR[tok.type] }}>{tok.value}</span>
          ))}
        </pre>
      )}

      {/* Editable: CSS-grid stack so both layers size together */}
      {editable && (
        <div style={{ display: "grid" }}>
          {/* Highlight layer — sits in grid cell, drives height via content */}
          <pre
            ref={highlightRef}
            aria-hidden
            style={{
              ...sharedStyle,
              gridArea: "1 / 1",
              background: "transparent",
              pointerEvents: "none",
              userSelect: "none",
              visibility: "visible",
              overflow: "hidden",
            }}
          >
            {tokens.map((tok, i) => (
              <span key={i} style={{ color: COLOR[tok.type] }}>{tok.value}</span>
            ))}
            {/* trailing space so empty textarea matches pre height */}
            {" "}
          </pre>

          {/* Textarea — overlays same grid cell, transparent text, caret visible */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            style={{
              ...sharedStyle,
              gridArea: "1 / 1",
              background: "transparent",
              color: "transparent",
              caretColor: "var(--jwt-text)",
              outline: "none",
              resize: "none",
              overflow: "hidden",
              border: "none",
            }}
          />
        </div>
      )}

      {/* Error bar */}
      {hasError && errorMessage && (
        <div
          className="px-4 py-2 text-xs font-mono flex items-center gap-1.5"
          style={{
            borderTop: "1px solid var(--jwt-red)",
            backgroundColor: "rgba(251,1,91,0.08)",
            color: "var(--jwt-red)",
          }}
        >
          ⚠ {errorMessage}
        </div>
      )}
    </div>
  );
}
