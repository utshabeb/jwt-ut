"use client";

import { Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface CopyButtonProps {
  text: string;
  size?: number;
}

export default function CopyButton({ text, size = 14 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{ color: copied ? "var(--jwt-green)" : "var(--jwt-text-muted)" }}
      className="hover-text transition-colors p-1 rounded"
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
