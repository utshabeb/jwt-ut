import type { TokenConfig, ClaimRule } from "./types";
import type { JWTPayload } from "@/lib/jwt/types";

function evalRule(rule: ClaimRule, payload: JWTPayload): boolean {
  const raw = payload[rule.key];
  const exists = raw !== undefined && raw !== null;

  switch (rule.operator) {
    case "exists":
      return exists;

    case "not_exists":
      return !exists;

    case "eq":
      if (!exists) return false;
      return String(raw) === rule.value.trim();

    case "not_eq":
      if (!exists) return false;
      return String(raw) !== rule.value.trim();

    case "contains":
      if (!exists) return false;
      return String(raw).toLowerCase().includes(rule.value.trim().toLowerCase());

    case "starts_with":
      if (!exists) return false;
      return String(raw).toLowerCase().startsWith(rule.value.trim().toLowerCase());

    case "ends_with":
      if (!exists) return false;
      return String(raw).toLowerCase().endsWith(rule.value.trim().toLowerCase());

    case "gt": {
      if (!exists) return false;
      const n = Number(raw);
      const v = Number(rule.value.trim());
      return !isNaN(n) && !isNaN(v) && n > v;
    }

    case "lt": {
      if (!exists) return false;
      const n = Number(raw);
      const v = Number(rule.value.trim());
      return !isNaN(n) && !isNaN(v) && n < v;
    }

    default:
      return false;
  }
}

/**
 * Returns the first config whose ALL rules match the given payload.
 */
export function matchToken(
  payload: JWTPayload | null,
  configs: TokenConfig[]
): TokenConfig | null {
  if (!payload || configs.length === 0) return null;

  for (const config of configs) {
    if (config.rules.length === 0) continue;
    const allMatch = config.rules.every(
      (rule) => rule.key.trim() !== "" && evalRule(rule, payload)
    );
    if (allMatch) return config;
  }

  return null;
}
