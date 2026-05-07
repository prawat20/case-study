import type { Evidence, EvidenceKind } from "@/lib/types";

const tintByKind: Record<EvidenceKind, { bg: string; text: string }> = {
  revenue: {
    bg: "var(--color-chip-revenue-bg)",
    text: "var(--color-chip-revenue-text)",
  },
  deals: {
    bg: "var(--color-chip-deals-bg)",
    text: "var(--color-chip-deals-text)",
  },
  support: {
    bg: "var(--color-chip-support-bg)",
    text: "var(--color-chip-support-text)",
  },
  deadline: {
    bg: "var(--color-chip-deadline-bg)",
    text: "var(--color-chip-deadline-text)",
  },
  strategic: {
    bg: "var(--color-chip-strategic-bg)",
    text: "var(--color-chip-strategic-text)",
  },
};

export function EvidenceChip({ evidence }: { evidence: Evidence }) {
  const tint = tintByKind[evidence.kind ?? "strategic"];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
      style={{ background: tint.bg, color: tint.text }}
    >
      <span className="font-semibold tabular-nums">{evidence.metric}</span>
      <span className="opacity-70">{evidence.label}</span>
    </span>
  );
}
