"use client";

import {
  formatNumericDate,
  isExpired,
  REGISTERED_CLAIM_DESCRIPTIONS,
} from "@/lib/jwt/constants";
import type { JWTPayload } from "@/lib/jwt/types";

interface ClaimsBreakdownProps {
  payload: JWTPayload;
}

export default function ClaimsBreakdown({ payload }: ClaimsBreakdownProps) {
  return (
    <div className="space-y-2 text-sm font-mono">
      {Object.entries(payload).map(([key, value]) => {
        const isRegistered = key in REGISTERED_CLAIM_DESCRIPTIONS;
        const isTimestamp = ["exp", "nbf", "iat"].includes(key) && typeof value === "number";
        const expired = key === "exp" && typeof value === "number" && isExpired(value);

        return (
          <div
            key={key}
            className="rounded p-2"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--jwt-border)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{ color: "var(--jwt-cyan)" }} className="font-semibold">
                {key}
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
                {JSON.stringify(value)}
                {expired && (
                  <span
                    style={{ color: "var(--jwt-red)" }}
                    className="ml-2 text-xs font-sans"
                  >
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
                {REGISTERED_CLAIM_DESCRIPTIONS[key]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
