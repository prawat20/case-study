"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative, RecommendedAction } from "@/lib/types";
import { EvidenceChip } from "@/components/EvidenceChip";
import { useDecisions } from "@/lib/use-decisions";
import { Header } from "@/components/Header";
import { StrategicBanner } from "@/components/StrategicBanner";
import { SignalShifts } from "@/components/SignalShifts";
import { getOKR } from "@/lib/strategic";

const allInitiatives = initiativesJson as Initiative[];

const ACTION_LABEL: Record<RecommendedAction, string> = {
  commit: "Commit",
  defer: "Defer",
  escalate: "Escalate",
};

function actionColor(action: RecommendedAction): string {
  switch (action) {
    case "commit":
      return "var(--color-success)";
    case "defer":
      return "var(--color-muted)";
    case "escalate":
      return "var(--color-warning)";
  }
}

export default function Home() {
  const { decisions, hydrated } = useDecisions();
  const decidedIds = new Set(decisions.map((d) => d.initiative_id));
  const decidedToday = decisions.length;

  const needsDecision = allInitiatives
    .filter((i) => i.status === "needs_decision" && !decidedIds.has(i.id))
    .sort(
      (a, b) =>
        (a.priority_rank ?? Number.MAX_SAFE_INTEGER) -
        (b.priority_rank ?? Number.MAX_SAFE_INTEGER),
    );

  const monitoringCount = allInitiatives.filter(
    (i) => i.status !== "needs_decision",
  ).length;

  const allDone = hydrated && needsDecision.length === 0;

  return (
    <div className="min-h-screen bg-page text-primary">
      <Header />

      <main className="mx-auto max-w-[720px] px-8 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Good morning, Pravesh.
        </h1>
        <p className="mt-1 text-sm text-secondary">
          {allDone ? (
            <>
              You&rsquo;re caught up. The system is monitoring{" "}
              {monitoringCount} initiatives.
            </>
          ) : (
            <>
              {needsDecision.length} decision
              {needsDecision.length === 1 ? "" : "s"} today, ordered by
              urgency.
              {decidedToday > 0 && (
                <>
                  {" "}
                  <Link
                    href="/audit/"
                    className="text-tertiary transition hover:text-primary"
                  >
                    · {decidedToday} decided this session →
                  </Link>
                </>
              )}
            </>
          )}
        </p>

        <div className="mt-8 space-y-3">
          <StrategicBanner />
          <SignalShifts />
        </div>

        <div className="mt-10 space-y-3">
          {needsDecision.map((i, idx) => {
            const action = i.ai_recommendation.action;
            const okrLabels = i.ai_recommendation.okr_alignment
              .map((id) => getOKR(id)?.label)
              .filter(Boolean) as string[];
            return (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <Link
                  href={`/initiative/${i.id}/`}
                  className="group block cursor-pointer rounded-xl border border-[var(--color-border)] bg-elevated p-5 transition hover:bg-card-hover hover:border-[var(--color-border-strong)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-2 inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ background: actionColor(action) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-base font-medium">{i.title}</h2>
                        <span
                          className="shrink-0 text-[11px] uppercase tracking-[0.1em] font-semibold"
                          style={{ color: actionColor(action) }}
                        >
                          {ACTION_LABEL[action]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-secondary">
                        {i.synthesis_oneliner}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {i.evidence.slice(0, 3).map((ev, eidx) => (
                          <EvidenceChip key={eidx} evidence={ev} />
                        ))}
                      </div>
                      {okrLabels.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-tertiary">
                          <span>Aligned with</span>
                          {okrLabels.map((l, lidx) => (
                            <span key={lidx} style={{ color: "var(--color-accent)" }}>
                              {l}
                              {lidx < okrLabels.length - 1 ? "," : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-12 rounded-xl border border-[var(--color-border)] bg-elevated p-8 text-center"
          >
            <div className="text-2xl">◐</div>
            <p className="mt-4 text-base text-primary">
              You&rsquo;re caught up.
            </p>
            <p className="mt-1 text-sm text-secondary">
              {decidedToday} decision{decidedToday === 1 ? "" : "s"} logged
              this session.{" "}
              <Link
                href="/audit/"
                className="text-accent transition hover:underline"
              >
                Audit log →
              </Link>{" "}
              ·{" "}
              <Link
                href="/quarter/"
                className="text-accent transition hover:underline"
              >
                Quarter plan →
              </Link>
            </p>
          </motion.div>
        )}

        <p className="mt-20 text-xs text-tertiary">
          ◐ Quarterly Planning · case study build
        </p>
      </main>
    </div>
  );
}
