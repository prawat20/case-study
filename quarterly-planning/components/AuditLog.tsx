"use client";

import Link from "next/link";
import { useDecisions } from "@/lib/use-decisions";
import { clearDecisions, type Decision } from "@/lib/decisions";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { Sparkles, Check, Clock, AlertTriangle, Pencil } from "lucide-react";
import { motion } from "framer-motion";

const initiatives = initiativesJson as Initiative[];

const ACTION_LABEL = {
  committed: "Committed",
  deferred: "Deferred",
  escalated: "Escalated",
  overridden: "Overridden",
};

const ACTION_ICON = {
  committed: Check,
  deferred: Clock,
  escalated: AlertTriangle,
  overridden: Pencil,
};

const ACTION_COLOR = {
  committed: "var(--color-success)",
  deferred: "var(--color-muted)",
  escalated: "var(--color-warning)",
  overridden: "var(--color-accent)",
};

// Mocked "system learning" notes — what an audit-log capability would surface.
// In a real system these would be derived from override patterns; for the demo
// we generate them based on decision shape.
function systemNote(d: Decision, initiative?: Initiative): string | null {
  if (d.action === "overridden") {
    return `Recorded preference: "${d.human_rationale}". Pattern will be applied to similar items going forward — adjusting recommendation weights for ${initiative?.theme ?? "this theme"}.`;
  }
  if (d.action === "deferred" && initiative) {
    return `Noted: deferring ${initiative.theme} items at this priority tier. If the item resurfaces, weighting will be lower next cycle.`;
  }
  if (d.action === "escalated" && initiative) {
    return `Noted: items in ${initiative.theme} with strategic ambiguity routed to stakeholders. Future similar items will pre-suggest the same group.`;
  }
  return null;
}

export function AuditLog() {
  const { decisions, hydrated } = useDecisions();

  const sorted = [...decisions].sort((a, b) =>
    b.decided_at.localeCompare(a.decided_at),
  );

  return (
    <main className="mx-auto max-w-[720px] px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
      >
        ← Back
      </Link>

      <div className="mt-8 flex items-baseline justify-between gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        {decisions.length > 0 && (
          <button
            onClick={clearDecisions}
            className="text-xs text-tertiary transition hover:text-primary"
          >
            Reset demo
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-secondary">
        Every decision logged with the AI&rsquo;s recommendation, your action,
        and the system&rsquo;s learning note. This is how the priority engine
        improves between cycles.
      </p>

      {hydrated && sorted.length === 0 && (
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-elevated p-8 text-center">
          <Sparkles
            size={20}
            className="mx-auto"
            style={{ color: "var(--color-accent)" }}
          />
          <p className="mt-4 text-base text-primary">No decisions yet.</p>
          <p className="mt-1 text-sm text-secondary">
            Make a decision on the{" "}
            <Link href="/" className="text-accent transition hover:underline">
              Priority Stream
            </Link>{" "}
            to see how the system learns.
          </p>
        </div>
      )}

      <div className="mt-12 space-y-4">
        {sorted.map((d, idx) => {
          const initiative = initiatives.find((i) => i.id === d.initiative_id);
          const Icon = ACTION_ICON[d.action];
          const color = ACTION_COLOR[d.action];
          const note = systemNote(d, initiative);
          return (
            <motion.div
              key={d.initiative_id + d.decided_at}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="rounded-xl border border-[var(--color-border)] bg-elevated p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-primary">
                      {initiative?.title ?? d.initiative_id}
                    </span>
                    <span className="text-[11px] text-tertiary tabular-nums">
                      {new Date(d.decided_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr] gap-2 text-xs sm:grid-cols-[auto_1fr] sm:gap-x-4">
                    <span className="text-tertiary">AI suggested</span>
                    <span className="text-secondary">{d.ai_suggestion}</span>
                    <span className="text-tertiary">You chose</span>
                    <span style={{ color }} className="font-medium">
                      {ACTION_LABEL[d.action]}
                    </span>
                    {d.human_rationale && (
                      <>
                        <span className="text-tertiary">Reason</span>
                        <span className="italic text-secondary">
                          &ldquo;{d.human_rationale}&rdquo;
                        </span>
                      </>
                    )}
                  </div>

                  {initiative?.ai_recommendation.predicted_outcome && (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-[var(--color-page)] px-3 py-2">
                      <span
                        className="text-[10px] uppercase tracking-[0.12em] text-tertiary mt-0.5 shrink-0"
                      >
                        Predicted
                      </span>
                      <span className="text-[11px] leading-relaxed text-secondary">
                        {initiative.ai_recommendation.predicted_outcome}
                      </span>
                    </div>
                  )}

                  {note && (
                    <div className="mt-2 flex items-start gap-2 rounded-md bg-[var(--color-page)] px-3 py-2">
                      <Sparkles
                        size={12}
                        className="mt-0.5 shrink-0"
                        style={{ color: "var(--color-accent)" }}
                      />
                      <span className="text-[11px] leading-relaxed text-secondary">
                        <span className="text-tertiary">System note:</span>{" "}
                        {note}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
