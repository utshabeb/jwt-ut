"use client";

import { CheckCircle, XCircle, AlertCircle, Loader, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

type VerifyStatus = "valid" | "invalid" | "unverified" | "expired";
type JwksStatus = "idle" | "fetching" | "verified" | "failed" | "expired";

interface CombinedStatusProps {
  verifyStatus: VerifyStatus;
  verifyMessage?: string;
  jwksStatus: JwksStatus;
  jwksMessage?: string;
}

export default function CombinedStatus({
  verifyStatus,
  verifyMessage,
  jwksStatus,
  jwksMessage,
}: CombinedStatusProps) {
  // JWKS takes priority when active
  if (jwksStatus !== "idle") {
    const cfg = {
      fetching: {
        Icon: Loader,
        label: "Verifying via JWKS…",
        bg: "rgba(0,185,241,0.10)",
        border: "rgba(0,185,241,0.35)",
        color: "var(--jwt-cyan)",
        spin: true,
        dot: "var(--jwt-cyan)",
      },
      verified: {
        Icon: ShieldCheck,
        label: jwksMessage || "Verified via JWKS",
        bg: "rgba(0,200,150,0.12)",
        border: "rgba(0,200,150,0.4)",
        color: "var(--jwt-green)",
        spin: false,
        dot: "var(--jwt-green)",
      },
      failed: {
        Icon: ShieldX,
        label: "Invalid Signature",
        bg: "rgba(251,1,91,0.10)",
        border: "rgba(251,1,91,0.4)",
        color: "var(--jwt-red)",
        spin: false,
        dot: "var(--jwt-red)",
      },
      expired: {
        Icon: ShieldAlert,
        label: jwksMessage || "Token Expired",
        bg: "rgba(240,192,64,0.10)",
        border: "rgba(240,192,64,0.4)",
        color: "var(--jwt-yellow)",
        spin: false,
        dot: "var(--jwt-yellow)",
      },
    }[jwksStatus];

    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
      >
        {/* Animated dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: cfg.dot,
            boxShadow: `0 0 6px ${cfg.dot}`,
            animation: cfg.spin ? "pulse 1s infinite" : undefined,
          }}
        />
        <cfg.Icon size={14} className={cfg.spin ? "animate-spin" : ""} />
        <span>{cfg.label}</span>
        {jwksStatus === "verified" && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ backgroundColor: "rgba(0,200,150,0.15)", color: "var(--jwt-green)" }}
          >
            JWKS
          </span>
        )}
      </div>
    );
  }

  // Manual / HMAC verify status
  const cfg = {
    valid: {
      Icon: CheckCircle,
      label: verifyMessage || "Signature Verified",
      bg: "rgba(0,200,150,0.12)",
      border: "rgba(0,200,150,0.4)",
      color: "var(--jwt-green)",
      dot: "var(--jwt-green)",
    },
    invalid: {
      Icon: XCircle,
      label: verifyMessage || "Invalid Signature",
      bg: "rgba(251,1,91,0.10)",
      border: "rgba(251,1,91,0.4)",
      color: "var(--jwt-red)",
      dot: "var(--jwt-red)",
    },
    expired: {
      Icon: AlertCircle,
      label: verifyMessage || "Token Expired",
      bg: "rgba(240,192,64,0.10)",
      border: "rgba(240,192,64,0.4)",
      color: "var(--jwt-yellow)",
      dot: "var(--jwt-yellow)",
    },
    unverified: {
      Icon: AlertCircle,
      label: verifyMessage || "Not Verified",
      bg: "rgba(136,136,170,0.10)",
      border: "rgba(136,136,170,0.3)",
      color: "var(--jwt-text-muted)",
      dot: "var(--jwt-text-muted)",
    },
  }[verifyStatus];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
      />
      <cfg.Icon size={14} />
      <span>{cfg.label}</span>
    </div>
  );
}
