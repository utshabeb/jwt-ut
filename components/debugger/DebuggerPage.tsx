"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trash2, RefreshCw, ScanSearch, PenLine, Braces, List } from "lucide-react";
import CopyButton from "./CopyButton";
import ClaimsBreakdown from "./ClaimsBreakdown";
import CombinedStatus from "./CombinedStatus";
import AlgorithmSelector from "./AlgorithmSelector";
import JsonView from "./JsonView";
import {
  decodeJWT,
  signJWT,
  verifyJWT,
} from "@/lib/jwt/index";
import type { JOSEHeader, JWTPayload } from "@/lib/jwt/types";
import {
  DEFAULT_SECRET,
  DEFAULT_HEADER,
  DEFAULT_PAYLOAD,
  algRequiresAsymmetricKey,
  isHmacAlg,
} from "@/lib/jwt/constants";
import { isPublicToken } from "@/lib/jwt/jwks";

// ---- Auto-resizing textarea ----
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  style,
  spellCheck,
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={{ ...style, resize: "none", overflow: "hidden" }}
      spellCheck={spellCheck}
      rows={1}
    />
  );
}

// ---- Default example token (pre-signed HS256) ----
const EXAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

type TabType = "decoder" | "encoder";
type ViewType = "json" | "claims";

export default function DebuggerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("decoder");

  // --- Encoded token ---
  const [encodedToken, setEncodedToken] = useState(EXAMPLE_TOKEN);

  // --- Decoded state ---
  const [headerJson, setHeaderJson] = useState(
    JSON.stringify(DEFAULT_HEADER, null, 2)
  );
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify(DEFAULT_PAYLOAD, null, 2)
  );
  const [headerView, setHeaderView] = useState<ViewType>("json");
  const [payloadView, setPayloadView] = useState<ViewType>("json");

  // --- Signature/key ---
  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState(DEFAULT_SECRET);
  const [secretBase64, setSecretBase64] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  // --- Status ---
  const [verifyStatus, setVerifyStatus] = useState<
    "valid" | "invalid" | "unverified" | "expired"
  >("unverified");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [parseError, setParseError] = useState("");

  // --- JWKS auto-verify ---
  const [jwksStatus, setJwksStatus] = useState<"idle" | "fetching" | "verified" | "failed" | "expired">("idle");
  const [jwksMessage, setJwksMessage] = useState("");
  const jwksAbortRef = useRef<AbortController | null>(null);

  // Prevent loops between encoded <-> decoded edits
  const isUpdatingFromEncoded = useRef(false);
  const isUpdatingFromDecoded = useRef(false);

  // ---- Decode encoded token → update decoded panels ----
  const decodeToken = useCallback(
    (token: string) => {
      if (!token.trim()) {
        setParseError("");
        setVerifyStatus("unverified");
        return;
      }
      const result = decodeJWT(token.trim());
      if ("error" in result) {
        setParseError(result.error.message);
        setVerifyStatus("invalid");
        return;
      }
      setParseError("");
      if (!isUpdatingFromDecoded.current) {
        isUpdatingFromEncoded.current = true;
        setHeaderJson(JSON.stringify(result.header, null, 2));
        setPayloadJson(JSON.stringify(result.payload, null, 2));
        setAlgorithm(result.header.alg || "HS256");
        isUpdatingFromEncoded.current = false;
      }
    },
    []
  );

  // ---- Verify signature whenever token or key changes ----
  const verifyToken = useCallback(
    async (token: string, key: string, alg: string, isBase64: boolean) => {
      if (!token.trim()) {
        setVerifyStatus("unverified");
        setVerifyMessage("");
        return;
      }
      if (alg === "none") {
        setVerifyStatus("unverified");
        setVerifyMessage("Unsecured JWT (alg=none)");
        return;
      }
      if (!key.trim()) {
        setVerifyStatus("unverified");
        setVerifyMessage("Enter a key to verify");
        return;
      }
      try {
        const result = await verifyJWT(token.trim(), key, {
          allowUnsecured: false,
          ignoreExpiration: false,
          secretBase64: isBase64,
        } as Parameters<typeof verifyJWT>[2]);

        if (result.valid) {
          setVerifyStatus("valid");
          setVerifyMessage("Signature Verified");
        } else if (result.error?.code === "TOKEN_EXPIRED") {
          setVerifyStatus("expired");
          setVerifyMessage(result.error.message);
        } else {
          setVerifyStatus("invalid");
          setVerifyMessage(result.error?.message || "Invalid Signature");
        }
      } catch {
        setVerifyStatus("invalid");
        setVerifyMessage("Verification error");
      }
    },
    []
  );

  // ---- Re-sign decoded → update encoded token ----
  const reSign = useCallback(
    async (
      hdrJson: string,
      plJson: string,
      alg: string,
      key: string,
      isBase64: boolean
    ) => {
      try {
        const header: JOSEHeader = JSON.parse(hdrJson);
        const payload: JWTPayload = JSON.parse(plJson);
        // Override alg in header from selector
        header.alg = alg as JOSEHeader["alg"];

        const token = await signJWT(payload, key, {
          algorithm: alg as JOSEHeader["alg"],
          header,
          secretBase64: isBase64,
        });
        isUpdatingFromDecoded.current = true;
        setEncodedToken(token);
        isUpdatingFromDecoded.current = false;
        return token;
      } catch {
        // JSON parse error — don't update
        return null;
      }
    },
    []
  );

  // Effect: when encoded token changes → decode
  useEffect(() => {
    if (!isUpdatingFromDecoded.current) {
      decodeToken(encodedToken);
    }
  }, [encodedToken, decodeToken]);

  // Effect: when decoded fields change → re-sign
  useEffect(() => {
    if (!isUpdatingFromEncoded.current && activeTab === "encoder") {
      const key = algRequiresAsymmetricKey(algorithm) ? privateKey : secret;
      reSign(headerJson, payloadJson, algorithm, key, secretBase64).then(
        (token) => {
          if (token) {
            verifyToken(
              token,
              algRequiresAsymmetricKey(algorithm) ? publicKey : secret,
              algorithm,
              secretBase64
            );
          }
        }
      );
    }
  }, [
    headerJson,
    payloadJson,
    algorithm,
    secret,
    privateKey,
    publicKey,
    secretBase64,
    activeTab,
    reSign,
    verifyToken,
  ]);

  // Effect: verify when token or key changes
  useEffect(() => {
    const key = algRequiresAsymmetricKey(algorithm) ? publicKey : secret;
    verifyToken(encodedToken, key, algorithm, secretBase64);
  }, [encodedToken, algorithm, secret, publicKey, secretBase64, verifyToken]);

  // Effect: JWKS auto-verify when token has a public issuer
  useEffect(() => {
    if (!encodedToken.trim() || parseError) {
      setJwksStatus("idle");
      setJwksMessage("");
      return;
    }
    if (!isPublicToken(encodedToken)) {
      setJwksStatus("idle");
      setJwksMessage("");
      return;
    }

    // Cancel any in-flight request
    jwksAbortRef.current?.abort();
    const ac = new AbortController();
    jwksAbortRef.current = ac;

    setJwksStatus("fetching");
    setJwksMessage("Fetching JWKS...");

    fetch("/api/jwt/jwks-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: encodedToken.trim() }),
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((data: { valid: boolean; error?: string; kid?: string; issuer?: string }) => {
        if (ac.signal.aborted) return;
        if (data.valid) {
          setJwksStatus("verified");
          setJwksMessage(data.kid ? `Verified via JWKS (kid: ${data.kid})` : "Verified via JWKS");
        } else {
          // Check if it's an expiry issue vs bad signature
          const msg = data.error ?? "JWKS verification failed";
          const isExpired = msg.toLowerCase().includes("expir");
          setJwksStatus(isExpired ? "expired" : "failed");
          setJwksMessage(msg);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setJwksStatus("failed");
        setJwksMessage(err instanceof Error ? err.message : "JWKS fetch error");
      });

    return () => ac.abort();
  }, [encodedToken, parseError]);

  // ---- Handlers ----
  const handleGenerateExample = async () => {
    const payload = { ...DEFAULT_PAYLOAD, iat: Math.floor(Date.now() / 1000) };
    const token = await signJWT(payload, DEFAULT_SECRET, {
      algorithm: "HS256",
      header: { alg: "HS256", typ: "JWT" },
    });
    setEncodedToken(token);
    setSecret(DEFAULT_SECRET);
    setAlgorithm("HS256");
  };

  const handleAlgorithmChange = async (alg: string) => {
    setAlgorithm(alg);
    if (isHmacAlg(alg)) {
      try {
        const header: JOSEHeader = { ...JSON.parse(headerJson), alg: alg as JOSEHeader["alg"] };
        setHeaderJson(JSON.stringify(header, null, 2));
        const payload: JWTPayload = JSON.parse(payloadJson);
        const token = await signJWT(payload, secret, {
          algorithm: alg as JOSEHeader["alg"],
          header,
          secretBase64,
        });
        setEncodedToken(token);
      } catch {
        // ignore
      }
    }
  };

  // Parse current header/payload for display
  let parsedHeader: JOSEHeader | null = null;
  let parsedPayload: JWTPayload | null = null;
  try { parsedHeader = JSON.parse(headerJson); } catch { /* ignore */ }
  try { parsedPayload = JSON.parse(payloadJson); } catch { /* ignore */ }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--jwt-text)" }}>
          JSON Web Tokens
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--jwt-text-muted)" }}>
          Decode, verify, and generate JWTs — an open, industry standard{" "}
          <a
            href="https://tools.ietf.org/html/rfc7519"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--jwt-cyan)" }}
            className="hover:underline"
          >
            RFC 7519
          </a>{" "}
          method for representing claims securely between two parties.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6">
        {(["decoder", "encoder"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-2 px-5 py-2.5 text-base font-semibold rounded-t"
            style={{
              backgroundColor:
                activeTab === tab ? "var(--jwt-surface)" : "transparent",
              color:
                activeTab === tab ? "var(--jwt-cyan)" : "var(--jwt-text-muted)",
              borderBottom:
                activeTab === tab
                  ? "2px solid var(--jwt-cyan)"
                  : "2px solid transparent",
            }}
          >
            {tab === "decoder"
              ? <><ScanSearch size={16} /> Decoder</>
              : <><PenLine size={16} /> Encoder</>}
          </button>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ====== LEFT: Encoded Token ====== */}
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{
            backgroundColor: "var(--jwt-surface)",
            border: "1px solid var(--jwt-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--jwt-text-muted)" }}>
              {activeTab === "decoder" ? "Encoded Token — paste below" : "Encoded Token"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateExample}
                className="text-xs px-2 py-1 rounded flex items-center gap-1 hover-text transition-colors"
                style={{
                  color: "var(--jwt-cyan)",
                  border: "1px solid var(--jwt-cyan)",
                  backgroundColor: "transparent",
                }}
              >
                <RefreshCw size={11} />
                Generate example
              </button>
            </div>
          </div>

          {/* Single color-coded editable input */}
          <ColoredTokenInput
            value={encodedToken}
            onChange={setEncodedToken}
            hasError={!!parseError}
          />

          {parseError && (
            <p className="text-xs" style={{ color: "var(--jwt-red)" }}>
              ⚠ {parseError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <CombinedStatus
              verifyStatus={verifyStatus}
              verifyMessage={verifyMessage}
              jwksStatus={jwksStatus}
              jwksMessage={jwksMessage}
            />
            <div className="flex items-center gap-2">
              <CopyButton text={encodedToken} />
              <button
                onClick={() => {
                  setEncodedToken("");
                  setVerifyStatus("unverified");
                  setVerifyMessage("");
                  setParseError("");
                  setJwksStatus("idle");
                  setJwksMessage("");
                }}
                style={{ color: "var(--jwt-text-muted)" }}
                className="hover-text transition-colors p-1 rounded"
                title="Clear"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ====== RIGHT: Decoded ====== */}
        <div className="flex flex-col gap-4">
          {/* Header Panel */}
          <Panel
            title="Decoded Header"
            color="var(--jwt-red)"
            view={headerView}
            onViewChange={setHeaderView}
            jsonValue={headerJson}
            onJsonChange={setHeaderJson}
            parsedValue={parsedHeader}
            editable={activeTab === "encoder"}
          />

          {/* Payload Panel */}
          <Panel
            title="Decoded Payload"
            color="var(--jwt-purple)"
            view={payloadView}
            onViewChange={setPayloadView}
            jsonValue={payloadJson}
            onJsonChange={setPayloadJson}
            parsedValue={parsedPayload}
            editable={activeTab === "encoder"}
          />

          {/* Signature Verification */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: "var(--jwt-surface)",
              border: "1px solid var(--jwt-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Signature Verification
              </h3>
              <AlgorithmSelector
                value={algorithm}
                onChange={handleAlgorithmChange}
              />
            </div>

            {/* Pseudocode formula */}
            <div
              className="rounded p-3 font-mono text-xs mb-4 leading-relaxed"
              style={{
                backgroundColor: "var(--jwt-code-bg)",
                border: "1px solid var(--jwt-border)",
                color: "var(--jwt-text-muted)",
              }}
            >
              {isHmacAlg(algorithm) ? (
                <>
                  <span style={{ color: "var(--jwt-cyan)" }}>
                    {algorithm}
                  </span>
                  <span style={{ color: "var(--jwt-text)" }}>(</span>
                  <br />
                  {"  "}
                  <span style={{ color: "var(--jwt-red)" }}>
                    base64UrlEncode(header)
                  </span>
                  {" + "}
                  <span style={{ color: "var(--jwt-text)" }}>&quot;.&quot;</span>
                  {" + "}
                  <br />
                  {"  "}
                  <span style={{ color: "var(--jwt-purple)" }}>
                    base64UrlEncode(payload)
                  </span>
                  <span style={{ color: "var(--jwt-text)" }}>,</span>
                  <br />
                  {"  "}
                  <span style={{ color: "var(--jwt-yellow)" }}>secret</span>
                  <br />
                  <span style={{ color: "var(--jwt-text)" }}>)</span>
                </>
              ) : (
                <>
                  <span style={{ color: "var(--jwt-cyan)" }}>
                    {algorithm}
                  </span>
                  <span style={{ color: "var(--jwt-text)" }}>(</span>
                  <br />
                  {"  "}
                  <span style={{ color: "var(--jwt-red)" }}>
                    base64UrlEncode(header)
                  </span>
                  {" + "}
                  <span style={{ color: "var(--jwt-text)" }}>&quot;.&quot;</span>
                  {" + "}
                  <span style={{ color: "var(--jwt-purple)" }}>
                    base64UrlEncode(payload)
                  </span>
                  <span style={{ color: "var(--jwt-text)" }}>,</span>
                  <br />
                  {"  "}
                  <span style={{ color: "var(--jwt-yellow)" }}>
                    privateKey
                  </span>
                  <br />
                  <span style={{ color: "var(--jwt-text)" }}>)</span>
                </>
              )}
            </div>

            {/* Key inputs */}
            {algorithm === "none" ? (
              <p
                className="text-sm"
                style={{ color: "var(--jwt-yellow)" }}
              >
                ⚠ Unsecured JWT — no signature is applied or verified.
              </p>
            ) : isHmacAlg(algorithm) ? (
              <div className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "var(--jwt-text-muted)" }}
                >
                  Secret
                </label>
                <div className="relative">
                 <AutoTextarea
                    value={secret}
                    onChange={(e) => setSecret((e.target as HTMLTextAreaElement).value)}
                    rows={2}
                    placeholder="Enter HMAC secret..."
                    className="w-full rounded p-3 font-mono text-sm"
                    style={{
                      backgroundColor: "var(--jwt-input-bg)",
                      border: "1px solid var(--jwt-border)",
                      color: "var(--jwt-text)",
                    }}
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <CopyButton text={secret} />
                    <button
                      onClick={() => setSecret("")}
                      style={{ color: "var(--jwt-text-muted)" }}
                      className="hover-text transition-colors p-1"
                      title="Clear"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--jwt-text-muted)" }}>
                  <input
                    type="checkbox"
                    checked={secretBase64}
                    onChange={(e) => setSecretBase64(e.target.checked)}
                    className="rounded"
                  />
                  Base64URL Encoded secret
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wide mb-1 block"
                    style={{ color: "var(--jwt-text-muted)" }}
                  >
                    Public Key (verify)
                  </label>
                  <AutoTextarea
                    value={publicKey}
                    onChange={(e) => setPublicKey((e.target as HTMLTextAreaElement).value)}
                    rows={4}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;..."
                    className="w-full rounded p-3 font-mono text-xs"
                    style={{
                      backgroundColor: "var(--jwt-input-bg)",
                      border: "1px solid var(--jwt-border)",
                      color: "var(--jwt-text)",
                    }}
                    spellCheck={false}
                  />
                </div>
                {activeTab === "encoder" && (
                  <div>
                    <label
                      className="text-xs font-medium uppercase tracking-wide mb-1 block"
                      style={{ color: "var(--jwt-text-muted)" }}
                    >
                      Private Key (sign)
                    </label>
                    <AutoTextarea
                      value={privateKey}
                      onChange={(e) => setPrivateKey((e.target as HTMLTextAreaElement).value)}
                      rows={4}
                      placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
                      className="w-full rounded p-3 font-mono text-xs"
                      style={{
                        backgroundColor: "var(--jwt-input-bg)",
                        border: "1px solid var(--jwt-border)",
                        color: "var(--jwt-text)",
                      }}
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-xs" style={{ color: "var(--jwt-text-muted)" }}>
        <span>
          <span style={{ color: "var(--jwt-red)" }}>■</span> Header
        </span>
        <span>
          <span style={{ color: "var(--jwt-purple)" }}>■</span> Payload
        </span>
        <span>
          <span style={{ color: "var(--jwt-cyan)" }}>■</span> Signature
        </span>
      </div>
    </div>
  );
}

// ---- Reusable JSON/Claims panel ----
interface PanelProps {
  title: string;
  color: string;
  view: ViewType;
  onViewChange: (v: ViewType) => void;
  jsonValue: string;
  onJsonChange: (v: string) => void;
  parsedValue: JOSEHeader | JWTPayload | null;
  editable: boolean;
}

function Panel({
  title,
  color,
  view,
  onViewChange,
  jsonValue,
  onJsonChange,
  parsedValue,
  editable,
}: PanelProps) {
  const [jsonError, setJsonError] = useState("");

  const handleJsonChange = (val: string) => {
    onJsonChange(val);
    try {
      JSON.parse(val);
      setJsonError("");
    } catch (e: unknown) {
      setJsonError(e instanceof SyntaxError ? e.message : "Invalid JSON");
    }
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--jwt-surface)",
        border: `1px solid var(--jwt-border)`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded overflow-hidden text-xs"
            style={{ border: "1px solid var(--jwt-border)" }}
          >
            {(["json", "claims"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    view === v ? "var(--jwt-surface2)" : "transparent",
                  color: view === v ? color : "var(--jwt-text-muted)",
                }}
              >
                {v === "json" ? <><Braces size={12} /> JSON</> : <><List size={12} /> Claims</>}
              </button>
            ))}
          </div>
          <CopyButton text={jsonValue} />
        </div>
      </div>

      {/* Content */}
      {view === "json" ? (
        <JsonView
          value={jsonValue}
          onChange={handleJsonChange}
          editable={editable}
          minRows={title.includes("Header") ? 3 : 5}
          hasError={!!jsonError}
          errorMessage={jsonError}
          accentColor={color}
        />
      ) : (
        parsedValue ? (
          <ClaimsBreakdown payload={parsedValue as JWTPayload} />
        ) : (
          <p className="text-xs" style={{ color: "var(--jwt-text-muted)" }}>
            Invalid JSON — fix to see claims breakdown
          </p>
        )
      )}
    </div>
  );
}

// ---- Single color-coded token input ----
function ColoredTokenInput({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Rebuild inner HTML from value without moving caret if content matches
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const parts = value.split(".");
    let html: string;
    if (parts.length === 3 && value.trim()) {
      html =
        `<span style="color:var(--jwt-red)">${esc(parts[0])}</span>` +
        `<span style="color:var(--jwt-text)">.</span>` +
        `<span style="color:var(--jwt-purple)">${esc(parts[1])}</span>` +
        `<span style="color:var(--jwt-text)">.</span>` +
        `<span style="color:var(--jwt-cyan)">${esc(parts[2])}</span>`;
    } else {
      html = `<span style="color:var(--jwt-text)">${esc(value)}</span>`;
    }
    // Only update DOM if content actually changed (avoids caret jump)
    if (el.innerHTML !== html) {
      // Save and restore caret
      const sel = window.getSelection();
      let caretOffset = 0;
      if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
        caretOffset = getCaretOffset(el);
      }
      el.innerHTML = html || "";
      if (document.activeElement === el) {
        setCaretOffset(el, caretOffset);
      }
    }
  }, [value]);

  function handleInput() {
    if (isComposing.current) return;
    const el = divRef.current;
    if (!el) return;
    onChange(el.innerText.replace(/\n/g, "").trim());
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\s/g, "");
    document.execCommand("insertText", false, text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") e.preventDefault(); // no newlines
  }

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
      data-placeholder="Paste a JWT here…"
      spellCheck={false}
      className="w-full rounded p-3 font-mono text-sm leading-relaxed break-all outline-none"
      style={{
        backgroundColor: "var(--jwt-input-bg)",
        border: hasError ? "1px solid var(--jwt-red)" : "1px solid var(--jwt-border)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    />
  );
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0).cloneRange();
  range.selectNodeContents(el);
  range.setEnd(sel.anchorNode!, sel.anchorOffset);
  return range.toString().length;
}

function setCaretOffset(el: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  let remaining = offset;
  function walk(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        range.setStart(node, remaining);
        range.collapse(true);
        return true;
      }
      remaining -= len;
    } else {
      for (const child of Array.from(node.childNodes)) {
        if (walk(child)) return true;
      }
    }
    return false;
  }
  walk(el);
  sel.removeAllRanges();
  sel.addRange(range);
}
