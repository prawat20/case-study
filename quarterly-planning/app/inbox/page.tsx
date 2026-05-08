"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative, RecommendedAction } from "@/lib/types";
import { EvidenceChip } from "@/components/EvidenceChip";
import { useDecisions } from "@/lib/use-decisions";
import { Header } from "@/components/Header";

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

export default function InboxPage() {
  const { decisions, hydrated } = useDecisions();
  const decidedIds = new Set(decisions.map((d) => d.initiative_id));

  const needsDecision = allInitiatives
    .filter((i) => i.status === "needs_decision" && !decidedIds.has(i.id))
    .sort(
      (a, b) =>
        (a.priority_rank ?? Number.MAX_SAFE_INTEGER) -
        (b.priority_rank ?? Number.MAX_SAFE_INTEGER),
    );

  const allDone = hydrated && needsDecision.length === 0;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-6 py-12">
        <p className="eyebrow">Inbox</p>
        <h1 className="font-display mt-2 text-[28px] font-medium leading-tight tracking-tight" style={{ color: "var(--color-primary)" }}>
          {needsDecision.length === 0
            ? "Inbox is clear."
            : `${needsDecision.length} ${needsDecision.length === 1 ? "ask" : "asks"} to triage`}
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--color-secondary)" }}>
          Capture, route, and promote. Each item is a decision waiting.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            disabled
            aria-label="Start triage flow (coming soon)"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium opacity-60 cursor-not-allowed"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-elevated)",
            }}
          >
            Start triage
            <span className="font-mono text-[10px] opacity-80">(soon)</span>
          </button>
          <span className="text-[12px]" style={{ color: "var(--color-tertiary)" }}>
            Triage flow ships next. For now, click any item to prioritize.
          </span>
        </div>

        <div className="mt-10 space-y-4">
          {needsDecision.map((i, idx) => {
            const action = i.ai_recommendation.action;
            return (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/initiative/${i.id}/`}
                  className="group block rounded-xl p-6 transition"
                  style={{
                    background: "var(--color-elevated)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ background: actionColor(action) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
                          {i.title}
                        </h2>
                        <span
                          className="shrink-0 text-[10px] uppercase tracking-[0.1em] font-semibold"
                          style={{ color: actionColor(action) }}
                        >
                          {ACTION_LABEL[action]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--color-secondary)" }}>
                        {i.synthesis_oneliner}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {i.evidence.slice(0, 3).map((ev, eidx) => (
                          <EvidenceChip key={eidx} evidence={ev} />
                        ))}
                      </div>
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
            className="mt-12 rounded-xl p-10 text-center"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="font-display text-[32px]" style={{ color: "var(--color-accent)" }}>◆</div>
            <p className="mt-4 text-[16px] font-medium" style={{ color: "var(--color-primary)" }}>
              Inbox is clear.
            </p>
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--color-secondary)" }}>
              {decisions.length} decision{decisions.length === 1 ? "" : "s"} logged this session.{" "}
              <Link href="/audit/" className="transition hover:underline" style={{ color: "var(--color-accent)" }}>
                Audit log →
              </Link>
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
