"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Save, X, PlusCircle, Settings2, ShieldQuestion } from "lucide-react";
import type { TokenConfig, ClaimRule } from "@/lib/token-config/types";
import { CONFIG_COLORS } from "@/lib/token-config/types";
import { loadConfigs, saveConfigs } from "@/lib/token-config/storage";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const EMPTY_RULE: ClaimRule = { key: "", value: "" };

function RuleRow({
  rule,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  rule: ClaimRule;
  index: number;
  onChange: (i: number, r: ClaimRule) => void;
  onRemove: (i: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={rule.key}
        onChange={(e) => onChange(index, { ...rule, key: e.target.value })}
        placeholder="claim key (e.g. iss)"
        className="flex-1 rounded px-3 py-1.5 text-xs font-mono outline-none"
        style={{
          backgroundColor: "var(--jwt-input-bg)",
          border: "1px solid var(--jwt-border)",
          color: "var(--jwt-text)",
        }}
        spellCheck={false}
      />
      <span className="text-xs shrink-0" style={{ color: "var(--jwt-text-muted)" }}>=</span>
      <input
        type="text"
        value={rule.value}
        onChange={(e) => onChange(index, { ...rule, value: e.target.value })}
        placeholder="any value"
        className="flex-1 rounded px-3 py-1.5 text-xs font-mono outline-none"
        style={{
          backgroundColor: "var(--jwt-input-bg)",
          border: "1px solid var(--jwt-border)",
          color: "var(--jwt-text)",
        }}
        spellCheck={false}
      />
      {canRemove && (
        <button
          onClick={() => onRemove(index)}
          className="hover-text transition-colors p-1 rounded shrink-0"
          style={{ color: "var(--jwt-text-muted)" }}
          title="Remove rule"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

interface FormState {
  id: string | null; // null = new
  name: string;
  color: string;
  rules: ClaimRule[];
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  color: CONFIG_COLORS[0],
  rules: [{ ...EMPTY_RULE }],
};

export default function ConfigTab() {
  const [configs, setConfigs] = useState<TokenConfig[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    setConfigs(loadConfigs());
  }, []);

  function persist(updated: TokenConfig[]) {
    setConfigs(updated);
    saveConfigs(updated);
  }

  function openNew() {
    setForm({ ...EMPTY_FORM, rules: [{ ...EMPTY_RULE }] });
    setNameError("");
  }

  function openEdit(cfg: TokenConfig) {
    setForm({
      id: cfg.id,
      name: cfg.name,
      color: cfg.color,
      rules: cfg.rules.length > 0 ? cfg.rules.map((r) => ({ ...r })) : [{ ...EMPTY_RULE }],
    });
    setNameError("");
  }

  function closeForm() {
    setForm(null);
    setNameError("");
  }

  function handleSave() {
    if (!form) return;
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setNameError("Config name is required.");
      return;
    }
    const validRules = form.rules.filter((r) => r.key.trim() !== "");
    if (validRules.length === 0) {
      setNameError("Add at least one rule with a claim key.");
      return;
    }
    setNameError("");

    if (form.id === null) {
      // create
      const newCfg: TokenConfig = {
        id: generateId(),
        name: trimmedName,
        color: form.color,
        rules: validRules,
      };
      persist([...configs, newCfg]);
    } else {
      // update
      persist(
        configs.map((c) =>
          c.id === form.id
            ? { ...c, name: trimmedName, color: form.color, rules: validRules }
            : c
        )
      );
    }
    closeForm();
  }

  function handleDelete(id: string) {
    persist(configs.filter((c) => c.id !== id));
    if (form?.id === id) closeForm();
  }

  function addRule() {
    if (!form) return;
    setForm({ ...form, rules: [...form.rules, { ...EMPTY_RULE }] });
  }

  function updateRule(i: number, r: ClaimRule) {
    if (!form) return;
    const rules = form.rules.map((old, idx) => (idx === i ? r : old));
    setForm({ ...form, rules });
  }

  function removeRule(i: number) {
    if (!form) return;
    const rules = form.rules.filter((_, idx) => idx !== i);
    setForm({ ...form, rules: rules.length > 0 ? rules : [{ ...EMPTY_RULE }] });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── LEFT: Config list ── */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "var(--jwt-surface)",
          border: "1px solid var(--jwt-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={15} style={{ color: "var(--jwt-cyan)" }} />
            <h2
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--jwt-text-muted)" }}
            >
              Token Configs
            </h2>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover-text"
            style={{
              color: "var(--jwt-cyan)",
              border: "1px solid var(--jwt-cyan)",
              backgroundColor: "transparent",
            }}
          >
            <Plus size={12} />
            New Config
          </button>
        </div>

        {configs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg"
            style={{ border: "1px dashed var(--jwt-border)" }}
          >
            <ShieldQuestion size={28} style={{ color: "var(--jwt-text-muted)" }} />
            <p className="text-xs text-center" style={{ color: "var(--jwt-text-muted)" }}>
              No configs yet. Create one to start detecting token types.
            </p>
            <button
              onClick={openNew}
              className="text-xs px-3 py-1.5 rounded-lg hover-text transition-colors"
              style={{
                color: "var(--jwt-cyan)",
                border: "1px solid var(--jwt-cyan)",
              }}
            >
              <Plus size={11} className="inline mr-1" />
              Create first config
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {configs.map((cfg) => (
              <li
                key={cfg.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{
                  backgroundColor: "var(--jwt-code-bg)",
                  border: `1px solid var(--jwt-border)`,
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                {/* Color dot */}
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: cfg.color,
                    flexShrink: 0,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--jwt-text)" }}>
                    {cfg.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--jwt-text-muted)" }}>
                    {cfg.rules.length} rule{cfg.rules.length !== 1 ? "s" : ""}
                    {" · "}
                    {cfg.rules
                      .slice(0, 2)
                      .map((r) => (r.value ? `${r.key}=${r.value}` : r.key))
                      .join(", ")}
                    {cfg.rules.length > 2 ? "…" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(cfg)}
                    className="p-1.5 rounded hover-text transition-colors"
                    style={{ color: "var(--jwt-text-muted)" }}
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cfg.id)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: "var(--jwt-text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--jwt-red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--jwt-text-muted)")}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* How it works */}
        <div
          className="rounded-lg px-4 py-3 text-xs space-y-1"
          style={{
            backgroundColor: "var(--jwt-code-bg)",
            border: "1px solid var(--jwt-border)",
            color: "var(--jwt-text-muted)",
          }}
        >
          <p className="font-semibold uppercase tracking-wide" style={{ color: "var(--jwt-text-muted)" }}>How it works</p>
          <p>Paste a JWT in the <strong style={{ color: "var(--jwt-text)" }}>Decoder</strong> tab. The app checks all rules in each config against the decoded payload.</p>
          <p>A config <strong style={{ color: "var(--jwt-text)" }}>matches</strong> when <em>all</em> its rules pass. The first matching config is shown as a badge.</p>
          <p><strong style={{ color: "var(--jwt-text)" }}>Key only</strong> (empty value) → claim must exist. <strong style={{ color: "var(--jwt-text)" }}>Key + value</strong> → exact match.</p>
        </div>
      </div>

      {/* ── RIGHT: Create / Edit form ── */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: "var(--jwt-surface)",
          border: "1px solid var(--jwt-border)",
        }}
      >
        {form === null ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <Settings2 size={32} style={{ color: "var(--jwt-border)" }} />
            <p className="text-sm" style={{ color: "var(--jwt-text-muted)" }}>
              Select a config to edit, or create a new one.
            </p>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg hover-text transition-colors"
              style={{
                color: "var(--jwt-cyan)",
                border: "1px solid var(--jwt-cyan)",
              }}
            >
              <Plus size={12} />
              New Config
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Form header */}
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "var(--jwt-text-muted)" }}
              >
                {form.id === null ? "New Config" : "Edit Config"}
              </h3>
              <button
                onClick={closeForm}
                className="hover-text transition-colors p-1"
                style={{ color: "var(--jwt-text-muted)" }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--jwt-text-muted)" }}>
                Config Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setNameError(""); }}
                placeholder="e.g. Azure AD, Auth0, Internal API…"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--jwt-input-bg)",
                  border: nameError ? "1px solid var(--jwt-red)" : "1px solid var(--jwt-border)",
                  color: "var(--jwt-text)",
                }}
                spellCheck={false}
              />
              {nameError && (
                <p className="text-xs" style={{ color: "var(--jwt-red)" }}>⚠ {nameError}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--jwt-text-muted)" }}>
                Badge Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {CONFIG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    title={c}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: c,
                      border: form.color === c ? `2px solid var(--jwt-text)` : "2px solid transparent",
                      outline: form.color === c ? `2px solid ${c}` : "none",
                      outlineOffset: 1,
                      transition: "outline 0.15s, border 0.15s",
                    }}
                  />
                ))}
                {/* Preview */}
                <span
                  className="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${form.color}22`,
                    color: form.color,
                    border: `1px solid ${form.color}55`,
                  }}
                >
                  {form.name || "Preview"}
                </span>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--jwt-text-muted)" }}>
                  Claim Rules <span style={{ color: "var(--jwt-text-muted)", fontWeight: 400 }}>(ALL must match)</span>
                </label>
                <button
                  onClick={addRule}
                  className="flex items-center gap-1 text-xs hover-text transition-colors"
                  style={{ color: "var(--jwt-cyan)" }}
                >
                  <PlusCircle size={12} />
                  Add rule
                </button>
              </div>

              {/* Column headers */}
              <div className="flex gap-2 text-xs px-0.5" style={{ color: "var(--jwt-text-muted)" }}>
                <span className="flex-1">Claim Key</span>
                <span className="text-xs w-3" />
                <span className="flex-1">Value <span style={{ opacity: 0.6 }}>(empty = key exists)</span></span>
                <span className="w-6" />
              </div>

              <div className="space-y-2">
                {form.rules.map((rule, i) => (
                  <RuleRow
                    key={i}
                    rule={rule}
                    index={i}
                    onChange={updateRule}
                    onRemove={removeRule}
                    canRemove={form.rules.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: form.color,
                  color: "#ffffff",
                }}
              >
                <Save size={13} />
                {form.id === null ? "Create Config" : "Save Changes"}
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2 rounded-lg text-sm hover-text transition-colors"
                style={{
                  color: "var(--jwt-text-muted)",
                  border: "1px solid var(--jwt-border)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
