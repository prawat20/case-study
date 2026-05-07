"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

// Mocked overnight signal shifts. In a real system these come from the
// Dynamic Priority Engine flagging items whose synthesis weights have moved.
const SHIFTS = [
  {
    initiative_id: "init_webhook_retry",
    title: "Webhook delivery retries",
    direction: "up" as const,
    delta: "support volume +30% in last 24h",
    note: "AI is monitoring — may reconsider Q3 commit if volume crosses 25 tickets.",
  },
  {
    initiative_id: "init_custom_fields",
    title: "Custom field types",
    direction: "up" as const,
    delta: "Acme account directly requested",
    note: "Confidence signal rising — promoted in Q4 stack ranking.",
  },
];

export function SignalShifts() {
  const [expanded, setExpanded] = useState(false);

  if (SHIFTS.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-elevated">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-card-hover"
      >
        <Bell
          size={13}
          className="shrink-0"
          style={{ color: "var(--color-accent)" }}
        />
        <span className="text-xs text-secondary">
          The engine noticed{" "}
          <span className="font-medium text-primary">
            {SHIFTS.length} priority signals
          </span>{" "}
          overnight
        </span>
        <ChevronRight
          size={12}
          className="ml-auto shrink-0 text-tertiary transition"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-[var(--color-border)]"
          >
            <div className="space-y-2 px-4 py-3">
              {SHIFTS.map((s) => (
                <Link
                  key={s.initiative_id}
                  href={`/initiative/${s.initiative_id}/`}
                  className="flex items-start gap-3 rounded-md px-2 py-1.5 transition hover:bg-card-hover"
                >
                  <span
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--color-warning)" }}
                  >
                    {s.direction === "up" ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="text-primary">
                      <span className="font-medium">{s.title}</span>
                      <span className="text-tertiary"> · {s.delta}</span>
                    </div>
                    <div className="mt-0.5 text-tertiary leading-relaxed">
                      {s.note}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
