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
  { value: "exists",      label: "exists",           needsValue: false },
  { value: "not_exists",  label: "does not exist",   needsValue: false },
  { value: "eq",          label: "equals",           needsValue: true  },
  { value: "not_eq",      label: "not equals",       needsValue: true  },
  { value: "contains",    label: "contains",         needsValue: true  },
  { value: "starts_with", label: "starts with",      needsValue: true  },
  { value: "ends_with",   label: "ends with",        needsValue: true  },
  { value: "gt",          label: "greater than",     needsValue: true  },
  { value: "lt",          label: "less than",        needsValue: true  },
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
  "#5b9fb5", // muted cyan
  "#9b6bb5", // muted purple
  "#3a9e7e", // muted green
  "#b5923a", // muted yellow/amber
  "#b54a6a", // muted red
  "#b56b3a", // muted orange
  "#6b6fb5", // muted indigo
  "#3a9e7e", // muted emerald — replaced with teal
  "#7a8fa6", // slate blue
  "#8a7a6a", // warm brown
];
