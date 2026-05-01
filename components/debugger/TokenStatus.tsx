"use client";

import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TokenStatusProps {
  status: "valid" | "invalid" | "unverified" | "expired";
  message?: string;
}

export default function TokenStatus({ status, message }: TokenStatusProps) {
  const configs = {
    valid: {
      icon: CheckCircle,
      label: message || "Signature Verified",
      bg: "rgba(0,200,150,0.12)",
      border: "rgba(0,200,150,0.4)",
      color: "var(--jwt-green)",
    },
    invalid: {
      icon: XCircle,
      label: message || "Invalid Signature",
      bg: "rgba(251,1,91,0.12)",
      border: "rgba(251,1,91,0.4)",
      color: "var(--jwt-red)",
    },
    expired: {
      icon: AlertCircle,
      label: message || "Token Expired",
      bg: "rgba(240,192,64,0.12)",
      border: "rgba(240,192,64,0.4)",
      color: "var(--jwt-yellow)",
    },
    unverified: {
      icon: AlertCircle,
      label: message || "Not Verified",
      bg: "rgba(136,136,170,0.12)",
      border: "rgba(136,136,170,0.3)",
      color: "var(--jwt-text-muted)",
    },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
      }}
    >
      <Icon size={14} />
      <span>{cfg.label}</span>
    </div>
  );
}
