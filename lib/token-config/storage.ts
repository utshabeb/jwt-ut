import type { TokenConfig } from "./types";

const STORAGE_KEY = "jwt-ut:token-configs";

/** Migrate old rules that lack an operator field */
function migrate(configs: TokenConfig[]): TokenConfig[] {
  return configs.map((cfg) => ({
    ...cfg,
    rules: cfg.rules.map((r) => ({
      ...r,
      operator: r.operator ?? ("eq" as const),
    })),
  }));
}

export function loadConfigs(): TokenConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? migrate(parsed) : [];
  } catch {
    return [];
  }
}

export function saveConfigs(configs: TokenConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}
