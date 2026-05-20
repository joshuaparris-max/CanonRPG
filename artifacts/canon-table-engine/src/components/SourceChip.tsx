import { getSourceBook, TIER_COLORS } from "@/data/sourceBooks";

interface SourceChipProps {
  sourceId: string;
  pageRef?: string;
  size?: "sm" | "md";
}

export function SourceChip({ sourceId, pageRef, size = "sm" }: SourceChipProps) {
  const book = getSourceBook(sourceId);
  const tier = book?.tier ?? 1;
  const colorClass = TIER_COLORS[tier];
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-mono font-medium ${colorClass} ${sizeClass}`}
      title={book?.title ?? sourceId}
    >
      {book?.shortTitle ?? sourceId}
      {pageRef && <span className="opacity-70">p.{pageRef}</span>}
    </span>
  );
}

interface TierBadgeProps {
  tier: 1 | 2 | 3 | 4;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const labels: Record<1 | 2 | 3 | 4, string> = {
    1: "Core",
    2: "FR/Sword Coast",
    3: "Expansion",
    4: "Setting",
  };
  return (
    <span
      className={`inline-flex items-center rounded border font-mono text-xs px-1.5 py-0.5 ${TIER_COLORS[tier]}`}
    >
      T{tier}: {labels[tier]}
    </span>
  );
}
