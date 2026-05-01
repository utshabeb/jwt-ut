"use client";

import { ALGORITHMS } from "@/lib/jwt/constants";

interface AlgorithmSelectorProps {
  value: string;
  onChange: (alg: string) => void;
}

export default function AlgorithmSelector({ value, onChange }: AlgorithmSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm px-2 py-1 rounded font-mono"
      style={{
        backgroundColor: "var(--jwt-surface2)",
        border: "1px solid var(--jwt-border)",
        color: "var(--jwt-text)",
      }}
    >
      {ALGORITHMS.map((alg) => (
        <option key={alg} value={alg}>
          {alg}
        </option>
      ))}
    </select>
  );
}
