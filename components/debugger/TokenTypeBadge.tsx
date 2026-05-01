import type { TokenConfig } from "@/lib/token-config/types";
import { Settings2 } from "lucide-react";

interface TokenTypeBadgeProps {
  match: TokenConfig | null;
  onGoToConfig?: () => void;
}

export default function TokenTypeBadge({ match, onGoToConfig }: TokenTypeBadgeProps) {
  if (!match) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: `${match.color}18`,
        border: `1px solid ${match.color}55`,
        color: match.color,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: match.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span className="font-semibold">{match.name}</span>
      <span style={{ color: `${match.color}99` }}>token detected</span>
      {onGoToConfig && (
        <button
          onClick={onGoToConfig}
          className="ml-auto hover-text transition-colors"
          style={{ color: `${match.color}99` }}
          title="View config"
        >
          <Settings2 size={12} />
        </button>
      )}
    </div>
  );
}
