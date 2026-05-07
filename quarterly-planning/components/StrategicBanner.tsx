"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Target } from "lucide-react";
import {
  NORTH_STAR,
  QUARTERLY_OKRS,
  formatMetric,
} from "@/lib/strategic";

export function StrategicBanner() {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(
    (NORTH_STAR.current_value / NORTH_STAR.target_value) * 100,
  );
  const trendColor =
    NORTH_STAR.trend === "ahead"
      ? "var(--color-success)"
      : NORTH_STAR.trend === "behind"
        ? "var(--color-warning)"
        : "var(--color-secondary)";

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
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-base font-medium text-primary tabular-nums">
              {formatMetric(NORTH_STAR.current_value, NORTH_STAR.format)}
            </span>
            <span className="text-xs text-tertiary">of</span>
            <span className="text-sm text-secondary tabular-nums">
              {formatMetric(NORTH_STAR.target_value, NORTH_STAR.format)}
            </span>
            <span
              className="text-xs tabular-nums"
              style={{ color: trendColor }}
            >
              {pct}% · {NORTH_STAR.trend.replace("_", " ")}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--color-page)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: trendColor }}
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
