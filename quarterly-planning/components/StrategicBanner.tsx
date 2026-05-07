"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Target } from "lucide-react";
import {
  NORTH_STAR,
  QUARTERLY_OKRS,
  formatMetric,
  computeNorthStar,
} from "@/lib/strategic";

export function StrategicBanner() {
  const [expanded, setExpanded] = useState(false);
  const { achieved_pct, elapsed_pct, pace_gap_pp, trend } =
    computeNorthStar(NORTH_STAR);

  const trendColor =
    trend === "ahead"
      ? "var(--color-success)"
      : trend === "behind"
        ? "var(--color-warning)"
        : "var(--color-secondary)";

  const trendLabel =
    trend === "ahead"
      ? `+${pace_gap_pp}pp ahead of pace`
      : trend === "behind"
        ? `${pace_gap_pp}pp behind pace`
        : "on pace";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-elevated">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-card-hover"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-accent-soft)]">
          <Target size={14} style={{ color: "var(--color-accent)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
              {NORTH_STAR.period} North Star
            </span>
            <span className="text-[11px] text-tertiary">·</span>
            <span className="text-[11px] text-tertiary">
              {NORTH_STAR.metric}
            </span>
            <span
              className="ml-auto text-[11px] tabular-nums font-medium"
              style={{ color: trendColor }}
            >
              {trendLabel}
            </span>
          </div>

          {/* Two-line progress: ARR achieved vs Quarter elapsed */}
          <div className="mt-3 space-y-2">
            <ProgressRow
              label="ARR achieved"
              valueLabel={`${formatMetric(NORTH_STAR.current_value, NORTH_STAR.format)} of ${formatMetric(NORTH_STAR.target_value, NORTH_STAR.format)}`}
              pct={achieved_pct}
              color="var(--color-chip-revenue-text)"
            />
            <ProgressRow
              label="Quarter elapsed"
              valueLabel={`Week ${NORTH_STAR.weeks_elapsed} of ${NORTH_STAR.weeks_total}`}
              pct={elapsed_pct}
              color="var(--color-tertiary)"
            />
          </div>
        </div>
        <ChevronDown
          size={14}
          className="shrink-0 text-tertiary transition"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border)] px-5 py-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                Quarter OKRs
              </div>
              <div className="mt-3 space-y-3">
                {QUARTERLY_OKRS.map((okr, idx) => (
                  <div key={okr.id} className="flex gap-3">
                    <span className="font-mono text-xs text-tertiary tabular-nums shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary">
                        {okr.label}
                      </div>
                      <div className="mt-0.5 text-xs text-secondary leading-relaxed">
                        {okr.objective}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressRow({
  label,
  valueLabel,
  pct,
  color,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-tertiary">{label}</span>
        <span className="text-secondary tabular-nums">
          {valueLabel}{" "}
          <span className="text-tertiary">· {pct}%</span>
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--color-page)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
