import type { TokenConfig } from "./types";
import type { JWTPayload } from "@/lib/jwt/types";

/**
 * Returns the first config whose rules ALL match the given payload.
 * Rule logic:
 *   - rule.value is empty  → claim key must exist in payload
 *   - rule.value non-empty → claim key must exist AND equal rule.value (string comparison)
 */
export function matchToken(
  payload: JWTPayload | null,
  configs: TokenConfig[]
): TokenConfig | null {
  if (!payload || configs.length === 0) return null;

  for (const config of configs) {
    if (config.rules.length === 0) continue;

    const allMatch = config.rules.every((rule) => {
      if (!rule.key.trim()) return false;
      const claimValue = payload[rule.key];
      const exists = claimValue !== undefined && claimValue !== null;
      if (!exists) return false;
      if (rule.value.trim() === "") return true; // key-only check
      return String(claimValue) === rule.value.trim();
    });

    if (allMatch) return config;
  }

  return null;
}
