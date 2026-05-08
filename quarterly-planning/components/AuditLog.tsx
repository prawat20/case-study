"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  AlertTriangle,
  Pencil,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { useDecisions } from "@/lib/use-decisions";
import { useTriage } from "@/lib/triage";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import type { Decision } from "@/lib/decisions";

const allInitiatives = initiativesJson as Initiative[];

type Tab = "decisions" | "predictions";

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
  const [tab, setTab] = useState<Tab>("decisions");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const decidedDecorated = useMemo(() => {
    return decisions
      .map((d) => ({
        decision: d,
        initiative: allInitiatives.find((i) => i.id === d.initiative_id),
      }))
      .filter((x) => x.initiative)
      .sort(
        (a, b) =>
          new Date(b.decision.decided_at).getTime() -
          new Date(a.decision.decided_at).getTime(),
      );
  }, [decisions]);

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

  const totalOverrides = decisions.filter((d) => d.action === "overridden").length;
  const accuracyRevenue = 71;
  const accuracyAdoption = 38;

  return (
    <main className="mx-auto max-w-[720px] px-6 pt-10 pb-24">
      <p className="eyebrow">Audit · Q3 2026</p>
      <h1
        className="font-display mt-2 text-[28px] leading-tight tracking-tight"
        style={{ color: "var(--color-primary)", fontWeight: 500 }}
      >
        Decisions in memory
      </h1>
      <p className="mt-2 text-[13.5px]" style={{ color: "var(--color-secondary)" }}>
        Every commit, defer, escalate, and override — kept with reasoning and a prediction the system can grade later.
      </p>

      {hydrated && decisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex items-start gap-3 rounded-lg px-4 py-3"
          style={{
            background: "var(--color-accent-soft)",
            border: "1px solid var(--color-accent)",
          }}
        >
          <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>
              {decisions.length} decision{decisions.length === 1 ? "" : "s"} logged · {totalOverrides} override{totalOverrides === 1 ? "" : "s"} · {triage.length} triaged
            </span>
            <br />
            Prediction accuracy so far — revenue claims: <span className="font-numeric" style={{ color: "var(--color-accent)" }}>{accuracyRevenue}%</span> · adoption claims: <span className="font-numeric" style={{ color: "var(--color-accent)" }}>{accuracyAdoption}%</span>. The system weights revenue claims higher.
          </p>
        </motion.div>
      )}

      <div className="mt-8 flex items-center gap-1">
        <TabButton active={tab === "decisions"} onClick={() => setTab("decisions")}>
          Decisions
          <span className="ml-1.5 font-numeric text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
            {decidedDecorated.length}
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
        {tab === "decisions" && (
          <motion.div
            key="decisions"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 space-y-3"
          >
            {!hydrated ? null : decidedDecorated.length === 0 ? (
              <EmptyCard
                title="No decisions logged yet."
                body="Open Inbox → triage → prioritize → commit. Each step lands here."
                cta={{ href: "/inbox/", label: "Open Inbox" }}
              />
            ) : (
              decidedDecorated.map(({ decision, initiative }, idx) => (
                <DecisionCard
                  key={`${decision.initiative_id}_${decision.decided_at}`}
                  decision={decision}
                  initiative={initiative!}
                  index={idx}
                />
              ))
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
                cta={{ href: "/inbox/", label: "Open Inbox" }}
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

function DecisionCard({
  decision,
  initiative,
  index,
}: {
  decision: Decision;
  initiative: Initiative;
  index: number;
}) {
  const meta = actionMeta(decision.action);
  const time = formatDecisionTime(decision.decided_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl px-5 py-4"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: meta.soft, color: meta.color }}
        >
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
              {initiative.title}
            </p>
            <span className="font-numeric text-[11.5px] shrink-0" style={{ color: "var(--color-tertiary)" }}>
              {time}
            </span>
          </div>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--color-tertiary)" }}>
            <span style={{ color: meta.color }}>{meta.label}</span>
            {decision.sequence && decision.sequence !== "Overridden" && decision.sequence !== "Deferred" && (
              <>
                {" · "}
                <span>{decision.sequence}</span>
              </>
            )}
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            <span style={{ color: "var(--color-tertiary)" }}>AI suggestion —</span>{" "}
            {decision.ai_suggestion}
          </p>
          {decision.human_rationale && (
            <p
              className="mt-1.5 rounded-md px-3 py-2 text-[12.5px] leading-relaxed"
              style={{
                background: "var(--color-page)",
                color: "var(--color-secondary)",
              }}
            >
              <span style={{ color: "var(--color-tertiary)" }}>Your rationale —</span>{" "}
              {decision.human_rationale}
            </p>
          )}
          {initiative.ai_recommendation.predicted_outcome && (
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
              <Sparkles size={10} className="mr-1 inline-block" style={{ color: "var(--color-accent)" }} />
              <span style={{ color: "var(--color-tertiary)" }}>Predicted —</span>{" "}
              <span style={{ color: "var(--color-secondary)" }}>{initiative.ai_recommendation.predicted_outcome}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl px-5 py-4"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid",
        borderColor: due ? "var(--color-accent)" : "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
              {entry.initiative.title}
            </p>
            {due && (
              <span
                className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                }}
              >
                Due for review
              </span>
            )}
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

      <div className="mt-3 space-y-2 text-[12.5px] leading-relaxed">
        <div
          className="rounded-md px-3 py-2"
          style={{ background: "var(--color-accent-soft)" }}
        >
          <span style={{ color: "var(--color-tertiary)" }}>Predicted —</span>{" "}
          <span style={{ color: "var(--color-primary)" }}>{entry.initiative.ai_recommendation.predicted_outcome}</span>
        </div>

        <div
          className="rounded-md px-3 py-2"
          style={{ background: "var(--color-page)" }}
        >
          <span style={{ color: "var(--color-tertiary)" }}>Actual —</span>{" "}
          <span style={{ color: due ? "var(--color-secondary)" : "var(--color-muted)" }}>
            {due
              ? "2 of 3 deals closed; 1 stalled. SAML adoption ~28% on enterprise demos (target was 60%)."
              : "Window not yet elapsed."}
          </span>
        </div>
      </div>

      {due && (
        <div className="mt-3">
          <label className="eyebrow">What was wrong with the prediction?</label>
          <textarea
            value={reviewNote}
            onChange={(e) => onReviewNote(e.target.value)}
            placeholder="The system reads this to recalibrate weighting. e.g. 'Adoption stalls without exec sponsor — weight that more.'"
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

function actionMeta(action: Decision["action"]) {
  switch (action) {
    case "committed":
      return {
        icon: <Check size={13} />,
        label: "Committed",
        color: "var(--color-success)",
        soft: "var(--color-success-soft)",
      };
    case "deferred":
      return {
        icon: <Clock size={13} />,
        label: "Deferred",
        color: "var(--color-tertiary)",
        soft: "var(--color-surface-sunken)",
      };
    case "escalated":
      return {
        icon: <AlertTriangle size={13} />,
        label: "Escalated",
        color: "var(--color-warning)",
        soft: "var(--color-warning-soft)",
      };
    case "overridden":
      return {
        icon: <Pencil size={13} />,
        label: "Overridden",
        color: "var(--color-accent)",
        soft: "var(--color-accent-soft)",
      };
  }
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
