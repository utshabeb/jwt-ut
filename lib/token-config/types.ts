export interface ClaimRule {
  key: string;
  value: string; // empty = "key must exist"; non-empty = exact value match
}

export interface TokenConfig {
  id: string;
  name: string;
  color: string; // hex accent color
  rules: ClaimRule[];
}

export const CONFIG_COLORS = [
  "#00b9f1", // cyan
  "#d63aff", // purple
  "#00c896", // green
  "#f0c040", // yellow
  "#fb015b", // red
  "#f97316", // orange
  "#818cf8", // indigo
  "#34d399", // emerald
];
