"use client";

import { motion } from "framer-motion";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { useDecisions } from "@/lib/use-decisions";
import { ArrowRight } from "lucide-react";

const allInitiatives = initiativesJson as Initiative[];

const SPRINT_CAPACITY = 6; // 6 capacity units per sprint (eng-week equivalent)

const SPRINTS = [
  { key: "Q3 Sprint 1", date: "Jul 1" },
  { key: "Q3 Sprint 2", date: "Jul 15" },
  { key: "Q3 Sprint 3", date: "Jul 29" },
  { key: "Q3 Sprint 4", date: "Aug 12" },
];

interface SprintItem {
  initiative: Initiative;
  isCurrent: boolean;
  isAISuggested: boolean; // suggested but not yet committed
  status: "sequenced" | "ai-suggested" | "this-item-preview";
}

export function SprintView({ currentInitiative }: { currentInitiative: Initiative }) {
  const { decisions } = useDecisions();

  // Build sprint -> items map
  function getItemsForSprint(sprintKey: string): SprintItem[] {
    const items: SprintItem[] = [];

    // The current initiative's proposed sprint (if it's in this sprint)
    if (currentInitiative.ai_recommendation.sequence === sprintKey) {
      items.push({
        initiative: currentInitiative,
        isCurrent: true,
        isAISuggested: true,
        status: "this-item-preview",
      });
    }

    // Already-sequenced items in this sprint (status=sequenced)
    for (const ini of allInitiatives) {
      if (ini.id === currentInitiative.id) continue;
      const decision = decisions.find((d) => d.initiative_id === ini.id);

      // If user committed this in current session
      if (
        decision?.action === "committed" &&
        ini.ai_recommendation.sequence === sprintKey
      ) {
        items.push({
          initiative: ini,
          isCurrent: false,
          isAISuggested: false,
          status: "sequenced",
        });
        continue;
      }

      // If pre-sequenced (status=sequenced in JSON)
      if (
        ini.status === "sequenced" &&
        ini.ai_recommendation.sequence === sprintKey &&
        !decision
      ) {
        items.push({
          initiative: ini,
          isCurrent: false,
          isAISuggested: false,
          status: "sequenced",
        });
      }
    }

    return items;
  }

  return (
    <section className="mt-12">
      <p className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
        Q3 sprint context · where this lands
      </p>

      <div className="mt-4 space-y-3">
        {SPRINTS.map((s) => {
          const items = getItemsForSprint(s.key);
          const totalEffort = items.reduce(
            (sum, it) => sum + it.initiative.ai_recommendation.effort_sprints,
            0,
          );
          const utilizationPct = Math.min(
            (totalEffort / SPRINT_CAPACITY) * 100,
            150,
          );
          const overCapacity = totalEffort > SPRINT_CAPACITY;
          const hasCurrent = items.some((it) => it.isCurrent);

          return (
            <div
              key={s.key}
              className="rounded-lg border bg-elevated p-4"
              style={{
                borderColor: hasCurrent
                  ? "var(--color-accent)"
                  : "var(--color-border)",
                borderWidth: hasCurrent ? "1px" : "1px",
                boxShadow: hasCurrent
                  ? "0 0 0 1px var(--color-accent-soft)"
                  : "none",
              }}
            >
              {/* Sprint header row */}
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-medium text-primary tabular-nums">
                    {s.key.replace("Q3 ", "")}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    · {s.date}
                  </span>
                  {hasCurrent && (
                    <span
                      className="text-[10px] uppercase tracking-[0.12em] font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      ← lands here
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Capacity bar */}
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-[var(--color-page)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(utilizationPct, 100)}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: overCapacity
                          ? "var(--color-warning)"
                          : "var(--color-tertiary)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] tabular-nums"
                    style={{
                      color: overCapacity
                        ? "var(--color-warning)"
                        : "var(--color-tertiary)",
                    }}
                  >
                    {totalEffort}/{SPRINT_CAPACITY}
                    {overCapacity && " ⚠"}
                  </span>
                </div>
              </div>

              {/* Items */}
              {items.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {items.map((it) => (
                    <li
                      key={it.initiative.id}
                      className="flex items-baseline gap-2 text-xs"
                    >
                      <span
                        className="inline-block h-1 w-1 rounded-full shrink-0"
                        style={{
                          background: it.isCurrent
                            ? "var(--color-accent)"
                            : "var(--color-secondary)",
                        }}
                      />
                      <span
                        className={
                          it.isCurrent
                            ? "font-medium text-primary"
                            : "text-secondary"
                        }
                      >
                        {it.initiative.title}
                      </span>
                      <span className="text-tertiary tabular-nums">
                        ({it.initiative.ai_recommendation.effort_sprints}sp)
                      </span>
                      {it.isCurrent && (
                        <ArrowRight
                          size={10}
                          className="text-accent ml-auto"
                          style={{ color: "var(--color-accent)" }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-xs text-tertiary italic">
                  Open · {SPRINT_CAPACITY} capacity available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
