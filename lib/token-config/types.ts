export type RuleOperator =
  | "exists"      // key is present (value ignored)
  | "not_exists"  // key is absent  (value ignored)
  | "eq"          // === value
  | "not_eq"      // !== value
  | "contains"    // string contains value
  | "starts_with" // string starts with value
  | "ends_with"   // string ends with value
  | "gt"          // numeric >  value
  | "lt";         // numeric <  value

export interface RuleOperatorMeta {
  value: RuleOperator;
  label: string;       // short label shown in dropdown
  needsValue: boolean; // whether the value input is relevant
}

export const RULE_OPERATORS: RuleOperatorMeta[] = [
  { value: "exists",      label: "exists",      needsValue: false },
  { value: "not_exists",  label: "not exists",  needsValue: false },
  { value: "eq",          label: "=",           needsValue: true  },
  { value: "not_eq",      label: "≠",           needsValue: true  },
  { value: "contains",    label: "contains",    needsValue: true  },
  { value: "starts_with", label: "starts with", needsValue: true  },
  { value: "ends_with",   label: "ends with",   needsValue: true  },
  { value: "gt",          label: ">",           needsValue: true  },
  { value: "lt",          label: "<",           needsValue: true  },
];

export interface ClaimRule {
  key:      string;
  operator: RuleOperator;
  value:    string; // ignored when operator is exists / not_exists
}

export interface TokenConfig {
  id:    string;
  name:  string;
  color: string;
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
