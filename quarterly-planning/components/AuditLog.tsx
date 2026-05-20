"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  ArrowRight,
  Send,
  RefreshCw,
} from "lucide-react";
import { useDecisions } from "@/lib/use-decisions";
import { useTriage, type TriageDecision } from "@/lib/triage";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative, RecommendedAction } from "@/lib/types";
import type { Decision } from "@/lib/decisions";
import {
  ACTION_VERB,
  TRIAGE_VERB,
  TRIAGE_TO_AI,
  realizedActionOf,
} from "@/lib/ai-reco";

const allInitiatives = initiativesJson as Initiative[];

type Tab = "activity" | "predictions";

/**
 * A single PM action — triage (promote/route/defer) or a logged decision —
 * decorated with what the AI recommended and whether the PM diverged. The
 * unified activity stream is the heart of the calibration loop: every divergence
 * is a labelled training signal.
 */
interface ActivityEntry {
  id: string;
  kind: "triage" | "decision";
  initiative: Initiative;
  at: string;
  aiAction: RecommendedAction;
  pmAction: RecommendedAction | null;
  diverged: boolean;
  pmLabel: string;
  rationale?: string;
  predicted?: string;
}

interface PredictionEntry {
  decision: Decision;
  initiative: Initiative;
  ageDays: number;
  isMock: boolean;
}

const MOCK_INITIATIVE = allInitiatives.find((i) => i.id === "init_saml_sso");

const MOCK_PREDICTION: PredictionEntry | null = MOCK_INITIATIVE
  ? {
      decision: {
        initiative_id: "init_saml_sso",
        action: "committed",
        ai_suggestion: "Commit · Q3 Sprint 2",
        sequence: "Q3 Sprint 2",
        decided_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
      initiative: MOCK_INITIATIVE,
      ageDays: 21,
      isMock: true,
    }
  : null;

export function AuditLog() {
  const { decisions, hydrated } = useDecisions();
  const { triage } = useTriage();
  const [tab, setTab] = useState<Tab>("activity");
  const [divergedOnly, setDivergedOnly] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Land on the right tab from a deep link (#predictions from Now →
  // "Predictions due"). "#activity"/"#decisions" both open Activity.
  useEffect(() => {
    function applyHash() {
      if (typeof window === "undefined") return;
      const h = window.location.hash.replace("#", "").toLowerCase();
      if (h === "predictions") setTab("predictions");
      else if (h === "activity" || h === "decisions") setTab("activity");
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Unified activity stream — every PM action (triage + decisions), annotated
  // with the AI recommendation and whether the PM diverged from it.
  const activity: ActivityEntry[] = useMemo(() => {
    const out: ActivityEntry[] = [];

    for (const t of triage as TriageDecision[]) {
      const ini = allInitiatives.find((i) => i.id === t.initiative_id);
      if (!ini) continue;
      const aiAction = ini.ai_recommendation.action;
      const pmAction = TRIAGE_TO_AI[t.action];
      out.push({
        id: `triage_${t.initiative_id}_${t.decided_at}`,
        kind: "triage",
        initiative: ini,
        at: t.decided_at,
        aiAction,
        pmAction,
        diverged: pmAction !== aiAction,
        pmLabel: TRIAGE_VERB[t.action],
      });
    }

    for (const d of decisions) {
      const ini = allInitiatives.find((i) => i.id === d.initiative_id);
      if (!ini) continue;
      const aiAction = ini.ai_recommendation.action;
      const pmAction = realizedActionOf(d);
      const diverged = pmAction ? pmAction !== aiAction : d.action === "overridden";
      out.push({
        id: `decision_${d.initiative_id}_${d.decided_at}`,
        kind: "decision",
        initiative: ini,
        at: d.decided_at,
        aiAction,
        pmAction,
        diverged,
        pmLabel: decisionPmLabel(d),
        rationale: d.human_rationale,
        predicted: ini.ai_recommendation.predicted_outcome,
      });
    }

    return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [triage, decisions]);

  const divergedEntries = activity.filter((a) => a.diverged);
  const divergedCount = divergedEntries.length;
  const matchedCount = activity.length - divergedCount;
  const visibleActivity = divergedOnly ? divergedEntries : activity;

  const predictionEntries: PredictionEntry[] = useMemo(() => {
    const real = decisions
      .filter((d) => d.action === "committed" || d.action === "overridden")
      .map((d) => {
        const ini = allInitiatives.find((i) => i.id === d.initiative_id);
        if (!ini) return null;
        const ageDays = Math.max(
          0,
          Math.floor((Date.now() - new Date(d.decided_at).getTime()) / (1000 * 60 * 60 * 24)),
        );
        return { decision: d, initiative: ini, ageDays, isMock: false } as PredictionEntry;
      })
      .filter(Boolean) as PredictionEntry[];

    if (!MOCK_PREDICTION) return real;
    const exists = real.some((r) => r.decision.initiative_id === MOCK_PREDICTION.decision.initiative_id);
    return exists ? real : [...real, MOCK_PREDICTION];
  }, [decisions]);

  const elapsedEntries = predictionEntries.filter((p) => p.ageDays >= 21);
  const reviewWindowOpen = elapsedEntries.length;

  return (
    <main className="mx-auto max-w-[720px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
      <p className="eyebrow">Audit · Q3 2026</p>
      <h1
        className="font-display mt-2 text-[28px] leading-tight tracking-tight"
        style={{ color: "var(--color-primary)", fontWeight: 500 }}
      >
        Decisions in memory
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
        Every action is logged against what the system recommended. Where you choose
        differently, that gap becomes a training signal — it recalibrates how the priority
        engine weights similar items.
      </p>

      {/* Calibration summary */}
      {hydrated && activity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-5 py-3.5"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Stat value={activity.length} label="actions logged" />
          <Divider />
          <Stat value={matchedCount} label="followed AI" tone="var(--color-success)" />
          <Divider />
          <Stat value={divergedCount} label="diverged" tone="var(--color-accent)" />
          <span
            className="ml-auto text-[12px]"
            style={{ color: "var(--color-tertiary)" }}
          >
            {divergedCount > 0 ? (
              <>{divergedCount} signal{divergedCount === 1 ? "" : "s"} queued for recalibration</>
            ) : reviewWindowOpen > 0 ? (
              <>{reviewWindowOpen} prediction{reviewWindowOpen === 1 ? "" : "s"} due for review</>
            ) : (
              <>In step with the system</>
            )}
          </span>
        </motion.div>
      )}

      <div className="mt-8 flex items-center gap-1">
        <TabButton active={tab === "activity"} onClick={() => setTab("activity")}>
          Activity
          <span className="ml-1.5 font-numeric text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
            {activity.length}
          </span>
        </TabButton>
        <TabButton active={tab === "predictions"} onClick={() => setTab("predictions")}>
          Predictions
          <span className="ml-1.5 font-numeric text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
            {predictionEntries.length}
          </span>
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        {tab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6"
          >
            {!hydrated ? null : activity.length === 0 ? (
              <EmptyCard
                title="No actions logged yet."
                body="Triage an item or commit a decision. Every action — and every time you diverge from the system — lands here."
                cta={{ href: "/inbox/triage/", label: "Start triage" }}
              />
            ) : (
              <>
                {divergedCount > 0 && (
                  <div
                    className="mb-4 inline-flex items-center gap-0.5 rounded-lg p-0.5"
                    style={{ background: "var(--color-surface-sunken)" }}
                  >
                    <FilterChip active={!divergedOnly} onClick={() => setDivergedOnly(false)}>
                      All
                    </FilterChip>
                    <FilterChip active={divergedOnly} onClick={() => setDivergedOnly(true)}>
                      <RefreshCw size={11} className="mr-1 inline-block" />
                      Divergences {divergedCount}
                    </FilterChip>
                  </div>
                )}
                <div className="space-y-3">
                  {visibleActivity.map((entry, idx) => (
                    <ActivityCard key={entry.id} entry={entry} index={idx} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {tab === "predictions" && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 space-y-3"
          >
            {predictionEntries.length === 0 ? (
              <EmptyCard
                title="No predictions yet."
                body="Predictions are recorded automatically when you commit a decision."
                cta={{ href: "/inbox/triage/", label: "Start triage" }}
              />
            ) : (
              predictionEntries.map((p, idx) => (
                <PredictionCard
                  key={`${p.decision.initiative_id}_${idx}`}
                  entry={p}
                  index={idx}
                  reviewNote={reviewNotes[p.initiative.id] ?? ""}
                  onReviewNote={(t) =>
                    setReviewNotes((prev) => ({ ...prev, [p.initiative.id]: t }))
                  }
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 py-1.5 text-[13px] font-medium transition"
      style={{
        color: active ? "var(--color-primary)" : "var(--color-tertiary)",
      }}
    >
      {children}
      {active && (
        <motion.span
          layoutId="audit-tab-underline"
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            height: 2,
            width: 16,
            background: "var(--color-accent)",
            borderRadius: 999,
          }}
        />
      )}
    </button>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="font-numeric text-[17px] tabular-nums"
        style={{ color: tone ?? "var(--color-primary)", fontWeight: 600 }}
      >
        {value}
      </span>
      <span className="text-[12px]" style={{ color: "var(--color-tertiary)" }}>
        {label}
      </span>
    </span>
  );
}

function Divider() {
  return <span aria-hidden className="h-4 w-px" style={{ background: "var(--color-border)" }} />;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-2.5 py-1 text-[12px] font-medium transition"
      style={{
        background: active ? "var(--color-elevated)" : "transparent",
        color: active ? "var(--color-primary)" : "var(--color-tertiary)",
        boxShadow: active ? "var(--shadow-sm)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function decisionPmLabel(d: Decision): string {
  switch (d.action) {
    case "committed":
      return d.sequence && d.sequence !== "Deferred" && d.sequence !== "Overridden"
        ? `Committed · ${d.sequence}`
        : "Committed";
    case "deferred":
      return "Deferred to next quarter";
    case "escalated":
      return "Escalated to stakeholders";
    case "overridden":
      return d.realized_action ? `Overrode → ${ACTION_VERB[d.realized_action]}` : "Overrode AI";
  }
}

function ActivityCard({ entry, index }: { entry: ActivityEntry; index: number }) {
  const diverged = entry.diverged;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl px-5 py-4"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        borderLeft: diverged ? "3px solid var(--color-accent)" : "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
            {entry.initiative.title}
          </p>
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
            style={{ background: "var(--color-surface-sunken)", color: "var(--color-tertiary)" }}
          >
            {entry.kind === "triage" ? "Triage" : "Decision"}
          </span>
        </div>
        <span className="font-numeric text-[11.5px] shrink-0" style={{ color: "var(--color-tertiary)" }}>
          {formatDecisionTime(entry.at)}
        </span>
      </div>

      {/* You did X · AI recommended Y */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        <span style={{ color: "var(--color-tertiary)" }}>You</span>
        <span className="font-medium" style={{ color: "var(--color-primary)" }}>
          {entry.pmLabel}
        </span>
        <ArrowRight size={12} style={{ color: "var(--color-muted)" }} />
        <Sparkles size={11} style={{ color: "var(--color-accent)" }} />
        <span style={{ color: "var(--color-tertiary)" }}>AI recommended</span>
        <span
          className="font-medium"
          style={{ color: diverged ? "var(--color-accent)" : "var(--color-secondary)" }}
        >
          {ACTION_VERB[entry.aiAction]}
        </span>
      </div>

      {/* Verdict */}
      {diverged ? (
        <div
          className="mt-3 flex items-start gap-2 rounded-md px-3 py-2"
          style={{ background: "var(--color-accent-soft)" }}
        >
          <RefreshCw size={12} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold" style={{ color: "var(--color-accent)" }}>
              Diverged — feeds recalibration
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
              {entry.rationale
                ? entry.rationale
                : "The engine will weight this pattern toward your call on similar items."}
            </p>
          </div>
        </div>
      ) : (
        <p
          className="mt-2.5 inline-flex items-center gap-1.5 text-[11.5px]"
          style={{ color: "var(--color-success)" }}
        >
          <Check size={12} /> Matched the system
        </p>
      )}
    </motion.div>
  );
}

type Verdict = "missed" | "partial" | "met" | "pending";

function verdictFor(entry: PredictionEntry): {
  kind: Verdict;
  headline: string;
  actual: string;
} {
  // Window hasn't elapsed yet — neutral verdict.
  if (entry.ageDays < 21) {
    return {
      kind: "pending",
      headline: "Review window opens at 21 days",
      actual: "Window not yet elapsed.",
    };
  }
  // Mock SAML case — adoption fell short of target.
  if (entry.initiative.id === "init_saml_sso") {
    return {
      kind: "missed",
      headline: "Adoption 28% vs 60% target",
      actual: "2 of 3 deals closed; 1 stalled. SAML adoption ~28% on enterprise demos.",
    };
  }
  return {
    kind: "partial",
    headline: "Partial — review notes below",
    actual: "Outcome data pending — log what you saw.",
  };
}

const VERDICT_STYLE: Record<Verdict, { dot: string; text: string; bg: string; label: string }> = {
  missed: {
    dot: "var(--color-warning)",
    text: "var(--color-warning)",
    bg: "var(--color-warning-soft)",
    label: "Missed",
  },
  partial: {
    dot: "var(--color-accent)",
    text: "var(--color-accent)",
    bg: "var(--color-accent-soft)",
    label: "Partial",
  },
  met: {
    dot: "var(--color-success)",
    text: "var(--color-success)",
    bg: "var(--color-success-soft)",
    label: "Met",
  },
  pending: {
    dot: "var(--color-muted)",
    text: "var(--color-tertiary)",
    bg: "var(--color-surface-sunken)",
    label: "Pending",
  },
};

function PredictionCard({
  entry,
  index,
  reviewNote,
  onReviewNote,
}: {
  entry: PredictionEntry;
  index: number;
  reviewNote: string;
  onReviewNote: (s: string) => void;
}) {
  const overdue = entry.ageDays >= 14;
  const due = entry.ageDays >= 21;
  const verdict = verdictFor(entry);
  const style = VERDICT_STYLE[verdict.kind];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid",
        borderColor: due ? "var(--color-border-strong)" : "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Verdict strip — top-of-card visual answer. */}
      <div
        className="flex items-center gap-2 px-5 py-2.5 border-b"
        style={{
          background: style.bg,
          borderColor: "var(--color-border)",
        }}
      >
        <span
          aria-hidden
          className="inline-flex h-2 w-2 rounded-full shrink-0"
          style={{ background: style.dot }}
        />
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.1em] shrink-0"
          style={{ color: style.text }}
        >
          {style.label}
        </span>
        <span className="text-[12.5px] truncate" style={{ color: "var(--color-secondary)" }}>
          {verdict.headline}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
                {entry.initiative.title}
              </p>
              {entry.isMock && (
                <span
                  className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
                  style={{
                    background: "var(--color-surface-sunken)",
                    color: "var(--color-tertiary)",
                  }}
                >
                  Mock
                </span>
              )}
            </div>
            <p className="mt-1 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
              Decision logged {entry.ageDays === 0 ? "today" : `${entry.ageDays} day${entry.ageDays === 1 ? "" : "s"} ago`}
              {overdue && !due ? " · review window opens at 21d" : ""}
            </p>
          </div>
        </div>

        {/* Predicted vs Actual — side by side */}
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] items-stretch">
          <div
            className="rounded-md px-3 py-2.5"
            style={{ background: "var(--color-accent-soft)" }}
          >
            <p
              className="text-[9.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--color-tertiary)" }}
            >
              Predicted
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--color-primary)" }}>
              {entry.initiative.ai_recommendation.predicted_outcome}
            </p>
          </div>

          {/* Arrow — desktop only */}
          <div className="hidden sm:flex items-center justify-center" aria-hidden>
            <ArrowRight size={14} style={{ color: "var(--color-tertiary)" }} />
          </div>

          <div
            className="rounded-md px-3 py-2.5"
            style={{
              background: "var(--color-page)",
              border: due ? `1px solid ${style.dot}` : undefined,
            }}
          >
            <p
              className="text-[9.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--color-tertiary)" }}
            >
              Actual
            </p>
            <p
              className="mt-1 text-[12.5px] leading-relaxed"
              style={{ color: due ? "var(--color-primary)" : "var(--color-muted)" }}
            >
              {verdict.actual}
            </p>
          </div>
        </div>

        {due && (
          <div className="mt-4">
            <label className="eyebrow">What to recalibrate</label>
            <textarea
              value={reviewNote}
              onChange={(e) => onReviewNote(e.target.value)}
              placeholder="e.g. 'Weight exec-sponsor signal higher on adoption claims'"
              rows={2}
              className="mt-2 w-full resize-none rounded-md px-3 py-2 text-[12.5px] outline-none"
              style={{
                background: "var(--color-page)",
                color: "var(--color-primary)",
                border: "1px solid var(--color-border)",
              }}
            />
            {reviewNote.trim().length > 0 && (
              <button
                className="mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-elevated)",
                }}
              >
                <Send size={12} />
                Save & recalibrate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyCard({ title, body, cta }: { title: string; body: string; cta: { href: string; label: string } }) {
  return (
    <div
      className="rounded-xl px-6 py-10 text-center"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="font-display text-[24px]" style={{ color: "var(--color-accent)" }}>◆</div>
      <p className="mt-3 text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
        {title}
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--color-secondary)" }}>
        {body}
      </p>
      <Link
        href={cta.href}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium"
        style={{
          background: "var(--color-accent)",
          color: "var(--color-elevated)",
        }}
      >
        {cta.label}
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function formatDecisionTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
