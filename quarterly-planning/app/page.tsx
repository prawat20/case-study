"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Sparkles,
  ChevronDown,
  Send,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useCallback, useEffect, useState } from "react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative, RecommendedAction } from "@/lib/types";
import { Header } from "@/components/Header";
import { useDecisions } from "@/lib/use-decisions";
import { useTriage, setTriageAction, type TriageAction } from "@/lib/triage";
import { addDecision } from "@/lib/decisions";
import { recommendedTriageAction, TRIAGE_VERB } from "@/lib/ai-reco";
import { useCaptures, type Capture } from "@/lib/captures";
import { useCommandPalette } from "@/components/CommandProvider";
import { ShortcutKbd } from "@/components/ShortcutKbd";
import { playTriageTone } from "@/lib/sound";
import { getScoring } from "@/lib/frameworks";
import { NORTH_STAR } from "@/lib/strategic";
import {
  formatRelative,
  getChannelLabel,
  getMinutesAgo,
  getSourceLabel,
  signalToKind,
} from "@/lib/inbox-helpers";

const allInitiatives = initiativesJson as Initiative[];

// Shared with the full Decide view (InitiativeDetail) — escalate writes the same
// decision shape from either surface, so the Audit log reads identically.
const STAKEHOLDER_LABELS: Record<string, string> = {
  sales: "Sales",
  cs: "Customer Success",
  exec: "Exec",
  eng: "Engineering",
};
const ACTION_LABEL: Record<RecommendedAction, string> = {
  commit: "Commit",
  defer: "Defer",
  escalate: "Escalate",
};

type Row =
  | { kind: "initiative"; data: Initiative; minAgo: number }
  | { kind: "capture"; data: Capture; minAgo: number };

export default function NowPage() {
  const { decisions, hydrated: decisionsHydrated } = useDecisions();
  const { triage, hydrated: triageHydrated } = useTriage();
  const { captures, hydrated: capturesHydrated } = useCaptures();
  const { openCapture } = useCommandPalette();

  const triagedIds = useMemo(() => new Set(triage.map((t) => t.initiative_id)), [triage]);
  const decidedIds = useMemo(() => new Set(decisions.map((d) => d.initiative_id)), [decisions]);

  /* Build untriaged rows — captures land first, then needs_decision initiatives by recency */
  const untriaged: Row[] = useMemo(() => {
    const captureRows: Row[] = captures
      .filter((c) => !triagedIds.has(c.id))
      .map((c) => {
        const minAgo = Math.max(
          1,
          Math.round((Date.now() - new Date(c.captured_at).getTime()) / 60000),
        );
        return { kind: "capture" as const, data: c, minAgo };
      });

    const initiativeRows: Row[] = allInitiatives
      .filter(
        (i) =>
          i.status === "needs_decision" &&
          !triagedIds.has(i.id) &&
          !decidedIds.has(i.id),
      )
      .map((i) => ({ kind: "initiative" as const, data: i, minAgo: getMinutesAgo(i) }));

    return [...captureRows.sort((a, b) => a.minAgo - b.minAgo), ...initiativeRows.sort((a, b) => a.minAgo - b.minAgo)];
  }, [captures, triagedIds, decidedIds]);

  const triageCount = untriaged.length;
  const top = untriaged[0] ?? null;
  const moreCount = Math.max(0, triageCount - 1);

  const decideTop = useCallback(
    (action: TriageAction) => {
      if (!top) return;
      setTriageAction(top.data.id, action);
      playTriageTone(action);
    },
    [top],
  );

  /* Promoted but not yet placed — the handoff to Calendar (shown as a quiet link, not a section) */
  const promotedCount = useMemo(
    () =>
      allInitiatives.filter((i) => {
        const t = triage.find((x) => x.initiative_id === i.id);
        return t?.action === "promote" && !decidedIds.has(i.id);
      }).length,
    [triage, decidedIds],
  );

  const hydrated = decisionsHydrated && triageHydrated && capturesHydrated;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      {/* One decision in focus. North Star lives on Calendar; the pipeline lives on Inbox.
          The Now page asks exactly one question: what do you do with the next thing? */}
      <main className="mx-auto max-w-[600px] px-5 sm:px-6 pt-10 sm:pt-16 pb-24">
        {/* Quiet top row — where you are, and a way to capture */}
        <div className="flex items-center justify-between gap-4">
          <DateEyebrow />
          <CaptureButton onClick={openCapture} />
        </div>

        {/* The one thing */}
        {!hydrated ? (
          <div className="mt-10 h-[180px] rounded-2xl" style={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)" }} />
        ) : top ? (
          <div className="mt-10">
            <AnimatePresence mode="wait">
              <FocusCard key={top.data.id} row={top} onDecide={decideTop} />
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            message="Nothing waiting on you."
            sub={
              <>
                Capture an ask with <ShortcutKbd letter="N" /> when one lands.
              </>
            }
          />
        )}

        {/* Quiet exits — the rest of the pipeline, never competing with the decision */}
        {hydrated && (moreCount > 0 || promotedCount > 0) && (
          <div className="mt-10 flex flex-col gap-2.5">
            {moreCount > 0 && (
              <Link
                href="/inbox/triage/"
                className="group inline-flex items-center gap-2 text-[12.5px] transition"
                style={{ color: "var(--color-tertiary)" }}
              >
                <span className="font-numeric">{moreCount}</span>
                <span>more waiting</span>
                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            {promotedCount > 0 && (
              <Link
                href="/calendar/"
                className="group inline-flex items-center gap-2 text-[12.5px] transition"
                style={{ color: "var(--color-accent)" }}
              >
                <span className="font-numeric">{promotedCount}</span>
                <span>ready to place on the Calendar</span>
                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────── Components ────────── */

function DateEyebrow() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    setText(`${dayName}, ${monthDay} · Week ${NORTH_STAR.weeks_elapsed} of ${NORTH_STAR.weeks_total}`);
  }, []);

  return (
    <p
      className="text-[13px]"
      style={{ color: "var(--color-tertiary)" }}
      suppressHydrationWarning
    >
      {text || "—"}
    </p>
  );
}

function CaptureButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition hover:bg-[var(--color-card-hover)]"
      style={{ color: "var(--color-tertiary)" }}
      aria-label="Capture an ask"
    >
      <Plus size={13} />
      <span>Capture</span>
      <ShortcutKbd letter="N" subtle />
    </button>
  );
}

/* ─── The single focus card ─── */

function FocusCard({
  row,
  onDecide,
}: {
  row: Row;
  onDecide: (action: TriageAction) => void;
}) {
  const isInitiative = row.kind === "initiative";

  // AI layer — initiatives only. Captures have no scoring yet.
  const rec = isInitiative ? row.data.ai_recommendation : null;
  const score = isInitiative ? getScoring(rec!.framework, row.data) : null;
  const aiTriage: TriageAction | null = isInitiative ? recommendedTriageAction(rec!.action) : null;
  const arr = isInitiative ? row.data.arr_exposure_usd : undefined;

  const [showWhy, setShowWhy] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [tags, setTags] = useState<Set<string>>(
    () => new Set(rec?.suggested_escalation?.stakeholders ?? []),
  );
  const [message, setMessage] = useState(rec?.suggested_escalation?.draft_message ?? "");

  const openEscalate = useCallback(() => {
    setShowWhy(false);
    setEscalating(true);
  }, []);

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  // Escalate = a logged decision (not a parked triage), so it shows in the Audit log
  // exactly like the full Decide-view escalate. Item then leaves Now via decidedIds.
  function commitEscalate() {
    if (!rec || tags.size === 0) return;
    const recAction = rec.action;
    const matched = recAction === "escalate";
    const to = [...tags].join(", ");
    addDecision({
      initiative_id: row.data.id,
      action: matched ? "escalated" : "overridden",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: matched
        ? `Escalated to: ${to}`
        : `Escalate (overrode ${ACTION_LABEL[recAction]}) — sent to ${to}`,
      realized_action: "escalate",
      decided_at: new Date().toISOString(),
    });
    playTriageTone("escalate");
  }

  // Keyboard — act on the one card in focus. P/D are one-tap; E opens the escalate
  // prompt (a considered action). All ignored while typing or while the prompt is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && escalating) {
        e.preventDefault();
        setEscalating(false);
        return;
      }
      if (escalating) return;
      const k = e.key.toLowerCase();
      if (k === "p" || e.key === "ArrowRight") {
        e.preventDefault();
        onDecide("promote");
      } else if (k === "d" || e.key === "ArrowLeft") {
        e.preventDefault();
        onDecide("defer");
      } else if ((k === "e" || e.key === "ArrowUp") && rec) {
        e.preventDefault();
        openEscalate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDecide, escalating, rec, openEscalate]);

  const meta = isInitiative
    ? { time: formatRelative(row.minAgo), source: getSourceLabel(row.data), channel: getChannelLabel(row.data) }
    : { time: formatRelative(row.minAgo), source: row.data.source, channel: row.data.channel };
  const title = isInitiative ? row.data.title : row.data.text;
  const signalKind = signalToKind(isInitiative ? row.data.signal_type : row.data.signal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="px-6 pt-6 pb-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
          <span className="font-numeric">{meta.time}</span>
          <Dot />
          <span>{meta.source}</span>
          <Dot />
          <span>{meta.channel}</span>
          <SignalChip kind={signalKind} />
          {row.kind === "capture" && (
            <span
              className="rounded px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
            >
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="mt-2.5 text-[18px] leading-snug tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {title}
        </h2>

        {/* The AI's read — one quiet line (the only AI surface until you ask for more) */}
        {rec && score && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[12.5px]">
            <Sparkles size={12} className="shrink-0" style={{ color: "var(--color-accent)" }} />
            <span style={{ color: "var(--color-tertiary)" }}>AI recommends</span>
            <span className="font-semibold" style={{ color: "var(--color-accent)" }}>{TRIAGE_VERB[aiTriage!]}</span>
            <Dot />
            <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
              {score.total.label} {score.total.value}
            </span>
            {arr ? (
              <>
                <Dot />
                <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
                  ${(arr / 1000).toFixed(0)}k ARR
                </span>
              </>
            ) : null}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-3.5" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ActionPill kind="defer" recommended={aiTriage === "defer"} onClick={() => onDecide("defer")} />
            <ActionPill kind="escalate" recommended={aiTriage === "escalate"} active={escalating} onClick={openEscalate} />
            <ActionPill kind="promote" recommended={aiTriage === "promote"} onClick={() => onDecide("promote")} />
          </div>
          {rec && !escalating && (
            <button
              onClick={() => setShowWhy((v) => !v)}
              aria-expanded={showWhy}
              className="inline-flex items-center gap-1 text-[11.5px] transition hover:text-[var(--color-secondary)]"
              style={{ color: "var(--color-tertiary)" }}
            >
              Why this
              <ChevronDown
                size={13}
                className="transition-transform"
                style={{ transform: showWhy ? "rotate(180deg)" : "none" }}
              />
            </button>
          )}
        </div>

        {/* Escalate — a considered action: who needs to weigh in, and a note. Logs to Audit. */}
        <AnimatePresence initial={false}>
          {escalating && rec && (
            <motion.div
              key="escalate"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-1">
                <div
                  className="flex items-start gap-2 rounded-md px-3 py-2 text-[12px]"
                  style={{ background: "var(--color-warning-soft)", color: "var(--color-secondary)" }}
                >
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: "var(--color-warning)" }} />
                  <span>
                    <strong style={{ color: "var(--color-primary)" }}>Escalate</strong> means this needs stakeholder input before commit.
                  </span>
                </div>

                <p className="eyebrow mt-3" style={{ color: "var(--color-tertiary)" }}>Escalate to</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["sales", "cs", "exec", "eng"] as const).map((tag) => {
                    const active = tags.has(tag);
                    const aiSuggested = rec.suggested_escalation?.stakeholders.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="rounded-md px-2.5 py-1 text-[12px] font-medium transition"
                        style={{
                          background: active ? "var(--color-accent-soft)" : "var(--color-page)",
                          color: active ? "var(--color-accent)" : "var(--color-secondary)",
                          border: "1px solid",
                          borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                        }}
                      >
                        {STAKEHOLDER_LABELS[tag]}
                        {aiSuggested && !active && (
                          <span className="ml-1.5 text-[9.5px]" style={{ color: "var(--color-tertiary)" }}>· AI suggests</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="eyebrow mt-3" style={{ color: "var(--color-tertiary)" }}>Note</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="What do you need a call on?"
                  className="mt-2 w-full resize-none rounded-md px-3 py-2 text-[13px] outline-none"
                  style={{ background: "var(--color-page)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }}
                />

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setEscalating(false)}
                    className="rounded-md px-3 py-1.5 text-[12.5px] font-medium transition hover:bg-[var(--color-card-hover)]"
                    style={{ background: "transparent", color: "var(--color-secondary)", border: "1px solid var(--color-border)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={commitEscalate}
                    disabled={tags.size === 0}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition disabled:opacity-40"
                    style={{ background: "var(--color-accent)", color: "var(--color-elevated)" }}
                  >
                    <Send size={13} />
                    Send · Awaiting input
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why this — progressive disclosure. The full reasoning, only when asked. */}
        <AnimatePresence initial={false}>
          {showWhy && !escalating && rec && score && (
            <motion.div
              key="why"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <WhyThis rec={rec} score={score} initiativeId={row.kind === "initiative" ? row.data.id : ""} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WhyThis({
  rec,
  score,
  initiativeId,
}: {
  rec: Initiative["ai_recommendation"];
  score: ReturnType<typeof getScoring>;
  initiativeId: string;
}) {
  return (
    <div className="pt-4 mt-1">
      {/* Score */}
      <p className="eyebrow" style={{ color: "var(--color-tertiary)" }}>Score · {score.framework}</p>
      <div
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${score.rows.length + 1}, minmax(0, 1fr))` }}
      >
        {score.rows.map((r, i) => (
          <div key={i}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>{r.label}</p>
            <p className="font-numeric text-[13px]" style={{ color: "var(--color-secondary)", fontWeight: 500 }}>{r.value}</p>
          </div>
        ))}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>{score.total.label}</p>
          <p className="font-numeric text-[13px]" style={{ color: "var(--color-accent)", fontWeight: 600 }}>{score.total.value}</p>
        </div>
      </div>

      {/* Reasoning */}
      <p className="eyebrow mt-4" style={{ color: "var(--color-tertiary)" }}>AI reasoning</p>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>{rec.action_reason}</p>

      {/* Predicted outcome */}
      <p className="eyebrow mt-4" style={{ color: "var(--color-tertiary)" }}>If we ship</p>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>{rec.predicted_outcome}</p>

      {/* Conflicts */}
      {rec.conflicts.length > 0 && (
        <>
          <p className="eyebrow mt-4" style={{ color: "var(--color-warning)" }}>Conflicts</p>
          <ul className="mt-1 space-y-1">
            {rec.conflicts.map((c, i) => (
              <li key={i} className="text-[12px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>{c}</li>
            ))}
          </ul>
        </>
      )}

      {/* Trade-offs */}
      {rec.tradeoffs.length > 0 && (
        <>
          <p className="eyebrow mt-4" style={{ color: "var(--color-tertiary)" }}>Trade-offs</p>
          <ul className="mt-1 space-y-1">
            {rec.tradeoffs.map((t, i) => (
              <li key={i} className="text-[12px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>{t}</li>
            ))}
          </ul>
        </>
      )}

      {initiativeId && (
        <Link
          href={`/initiative/${initiativeId}/`}
          className="mt-4 inline-flex items-center gap-1 text-[12px] transition hover:underline"
          style={{ color: "var(--color-accent)" }}
        >
          Open full Decide view
          <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

function Dot() {
  return <span style={{ color: "var(--color-muted)" }}>·</span>;
}

function ActionPill({
  kind,
  onClick,
  recommended = false,
  active = false,
}: {
  kind: TriageAction;
  onClick: () => void;
  recommended?: boolean;
  active?: boolean;
}) {
  const isPromote = kind === "promote";
  const isDefer = kind === "defer";
  const Icon = isPromote ? ArrowRight : isDefer ? ArrowLeft : ArrowUpRight;
  const key = isPromote ? "P" : isDefer ? "D" : "E";
  const label = isPromote ? "Promote" : isDefer ? "Defer" : "Escalate";
  const tone = isPromote
    ? "var(--color-success)"
    : isDefer
      ? "var(--color-danger)"
      : "var(--color-tertiary)";

  // Two emphasis states: `recommended` = the AI's pick (brand-accent ✦); `active` =
  // this action's panel is currently open (escalate). Otherwise the action tone.
  const emphasised = recommended || active;
  return (
    <button
      onClick={onClick}
      aria-label={recommended ? `${label} — AI recommended` : label}
      aria-pressed={active || undefined}
      className="group inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition hover:bg-[var(--color-card-hover)]"
      style={{
        background: emphasised ? "var(--color-accent-soft)" : "var(--color-elevated)",
        border: `1px solid ${emphasised ? "var(--color-accent)" : tone}`,
        color: emphasised ? "var(--color-accent)" : tone,
        boxShadow: recommended ? "0 0 0 2px var(--color-accent-soft)" : "none",
      }}
    >
      {recommended && (
        <span aria-hidden className="text-[10px] leading-none" style={{ color: "var(--color-accent)" }}>
          ✦
        </span>
      )}
      <Icon size={13} />
      <span>{label}</span>
      <kbd
        className="ml-0.5 rounded border px-1 py-0.5 font-mono text-[9.5px]"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-page)",
          color: "var(--color-tertiary)",
        }}
      >
        {key}
      </kbd>
    </button>
  );
}

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  const bgVar = `var(--color-chip-${kind}-bg)`;
  const fgVar = `var(--color-chip-${kind}-text)`;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium"
      style={{ background: bgVar, color: fgVar }}
    >
      {kind}
    </span>
  );
}

function EmptyState({ message, sub }: { message: string; sub: React.ReactNode }) {
  return (
    <div
      className="mt-12 rounded-2xl p-10 text-center"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="font-display text-[24px]" style={{ color: "var(--color-accent)" }}>◆</div>
      <p className="mt-2 text-[14.5px] font-medium" style={{ color: "var(--color-primary)" }}>
        {message}
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--color-secondary)" }}>
        {sub}
      </p>
    </div>
  );
}
