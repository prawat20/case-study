"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clock,
  Send,
  X,
  Sparkles,
  AlertTriangle,
  History,
  ChevronDown,
} from "lucide-react";
import type {
  Initiative,
  Framework,
  RecommendedAction,
} from "@/lib/types";
import {
  addDecision,
  getDecisions,
  getFrameworkOverrides,
  setFrameworkOverride,
  FRAMEWORK_OVERRIDES_EVENT,
} from "@/lib/decisions";
import { useDecisions } from "@/lib/use-decisions";
import { playCommitChime, playDeferTick } from "@/lib/sound";
import { getOKR } from "@/lib/strategic";
import { getScoring, listFrameworks } from "@/lib/frameworks";
import { Header } from "@/components/Header";
import { signalToKind } from "@/lib/inbox-helpers";
import { useCalendarState, saveAssignments } from "@/lib/calendar-state";
import { computeCommitImpact, type CommitImpact } from "@/lib/sprint-conflict";
import { SPRINTS } from "@/lib/sprint-data";
import initiativesJson from "@/data/initiatives.json";

const allInitiativesArr = initiativesJson as Initiative[];

type Mode =
  | "default"
  | "overriding"
  | "confirming"
  | "escalating"
  | "committing"
  | "deferred";

const ACTION_LABEL: Record<RecommendedAction, string> = {
  commit: "Commit",
  defer: "Defer",
  escalate: "Escalate",
};

const STAKEHOLDER_LABELS: Record<string, string> = {
  sales: "Sales",
  cs: "Customer Success",
  exec: "Exec",
  eng: "Engineering",
};

function actionTone(action: RecommendedAction): string {
  switch (action) {
    case "commit":
      return "var(--color-success)";
    case "defer":
      return "var(--color-tertiary)";
    case "escalate":
      return "var(--color-warning)";
  }
}

export function InitiativeDetail({ initiative }: { initiative: Initiative }) {
  const router = useRouter();
  const rec = initiative.ai_recommendation;
  const recAction = rec.action;

  const { decisions } = useDecisions();
  const { assignments } = useCalendarState();

  // Compute commit impact reactively — this is what powers the
  // dynamic trade-off preview and the confirm step.
  const commitImpact: CommitImpact = useMemo(
    () =>
      computeCommitImpact({
        initiative,
        allInitiatives: allInitiativesArr,
        decisions,
        assignments,
      }),
    [initiative, decisions, assignments],
  );

  const [mode, setMode] = useState<Mode>("default");
  const [overrideTo, setOverrideTo] = useState<RecommendedAction | null>(null);
  const [overrideText, setOverrideText] = useState("");
  const [escalateTags, setEscalateTags] = useState<Set<string>>(
    new Set(rec.suggested_escalation?.stakeholders ?? []),
  );
  const [escalateMessage, setEscalateMessage] = useState(
    rec.suggested_escalation?.draft_message ?? "",
  );
  const [toast, setToast] = useState<string | null>(null);
  const [priorOverride, setPriorOverride] = useState<{ rationale: string } | null>(null);
  const [activeFramework, setActiveFramework] = useState<Framework>(rec.framework);
  const [flyToCorner, setFlyToCorner] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const overrideInputRef = useRef<HTMLInputElement | null>(null);

  /* Hydrate framework override */
  useEffect(() => {
    function load() {
      const overrides = getFrameworkOverrides();
      const stored = overrides[initiative.id];
      if (stored && (listFrameworks() as string[]).includes(stored)) {
        setActiveFramework(stored as Framework);
      } else {
        setActiveFramework(rec.framework);
      }
    }
    load();
    window.addEventListener(FRAMEWORK_OVERRIDES_EVENT, load);
    return () => window.removeEventListener(FRAMEWORK_OVERRIDES_EVENT, load);
  }, [initiative.id, rec.framework]);

  /* System-learning cue */
  useEffect(() => {
    const decisions = getDecisions();
    const lastOverride = [...decisions]
      .reverse()
      .find((d) => d.action === "overridden" && d.initiative_id !== initiative.id);
    if (lastOverride && lastOverride.human_rationale) {
      setPriorOverride({ rationale: lastOverride.human_rationale });
    }
  }, [initiative.id]);

  const scoring = useMemo(
    () => getScoring(activeFramework, initiative),
    [activeFramework, initiative],
  );

  function pickFramework(fw: Framework) {
    setActiveFramework(fw);
    if (fw !== rec.framework) {
      setFrameworkOverride(initiative.id, fw);
      setToast(`Framework switched to ${fw}.`);
      setTimeout(() => setToast(null), 1800);
    } else {
      setFrameworkOverride(initiative.id, "");
    }
  }

  /* Auto-focus override input when entering that mode */
  useEffect(() => {
    if (mode === "overriding") {
      setTimeout(() => overrideInputRef.current?.focus(), 50);
    }
  }, [mode]);

  /* Keyboard map */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inForm =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");

      if (mode === "committing" || mode === "deferred") return;

      if (e.key === "Escape") {
        if (document.querySelector("[cmdk-root]")) return;
        if (mode !== "default") {
          setMode("default");
          setOverrideText("");
          setOverrideTo(null);
        } else {
          router.push("/inbox/");
        }
        return;
      }

      // Confirming mode: ↵ to confirm
      if (mode === "confirming" && e.key === "Enter") {
        e.preventDefault();
        finalizeCommit();
        return;
      }

      if (inForm) return;

      if (mode === "default") {
        if (e.key === "Enter") {
          e.preventDefault();
          chooseAction(recAction);
        } else if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          chooseAction("commit");
        } else if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          chooseAction("defer");
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          chooseAction("escalate");
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, recAction]);

  function chooseAction(action: RecommendedAction) {
    if (action === "escalate") {
      setMode("escalating");
      return;
    }
    if (action === recAction) {
      // Match AI rec
      if (action === "commit") {
        setMode("confirming");
      } else {
        defer();
      }
      return;
    }
    // Mismatch — capture override reason first
    setOverrideTo(action);
    setMode("overriding");
  }

  function submitOverride() {
    if (!overrideText.trim() || !overrideTo) return;
    if (overrideTo === "commit") {
      // After capturing reason, go to confirm step
      setMode("confirming");
    } else if (overrideTo === "defer") {
      finalizeDefer({ asOverride: true });
    }
  }

  function finalizeCommit() {
    setMode("committing");
    playCommitChime();
    setFlyToCorner(true);
    const isOverride = overrideTo !== null;
    // Apply the resolved sprint reflow — committed item lands in target,
    // pushed items move to their new sprint.
    saveAssignments(commitImpact.final_assignments);
    addDecision({
      initiative_id: initiative.id,
      action: isOverride ? "overridden" : "committed",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: isOverride ? `Commit — ${overrideText.trim()}` : undefined,
      sequence: commitImpact.target_sprint_label,
      decided_at: new Date().toISOString(),
    });
    const pushSummary =
      commitImpact.pushed_items.length > 0
        ? ` ${commitImpact.pushed_items.length} item${commitImpact.pushed_items.length === 1 ? "" : "s"} reflowed.`
        : "";
    setToast(`Committed to ${commitImpact.target_sprint_label}.${pushSummary}`);
    setTimeout(() => router.push("/calendar/"), 1100);
  }

  function defer() {
    finalizeDefer({ asOverride: false });
  }

  function finalizeDefer({ asOverride }: { asOverride: boolean }) {
    setMode("deferred");
    playDeferTick();
    addDecision({
      initiative_id: initiative.id,
      action: asOverride ? "overridden" : "deferred",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: asOverride ? `Defer — ${overrideText.trim()}` : undefined,
      sequence: asOverride ? "Overridden" : "Deferred",
      decided_at: new Date().toISOString(),
    });
    setToast("Deferred. Will resurface on context shift.");
    setTimeout(() => router.push("/inbox/"), 900);
  }

  function escalate() {
    if (escalateTags.size === 0) return;
    setMode("committing");
    playCommitChime();
    const matched = recAction === "escalate";
    addDecision({
      initiative_id: initiative.id,
      action: matched ? "escalated" : "overridden",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: matched
        ? `Escalated to: ${[...escalateTags].join(", ")}`
        : `Escalate (overrode ${ACTION_LABEL[recAction]}) — sent to ${[...escalateTags].join(", ")}`,
      decided_at: new Date().toISOString(),
    });
    setToast(`Escalated to ${[...escalateTags].join(", ")}. Awaiting input.`);
    setTimeout(() => router.push("/inbox/"), 1100);
  }

  const okrLabels = rec.okr_alignment
    .map((id) => getOKR(id)?.label)
    .filter(Boolean) as string[];

  const signalKind = signalToKind(initiative.signal_type);
  const arrLabel =
    initiative.arr_exposure_usd && initiative.arr_exposure_usd > 0
      ? `$${(initiative.arr_exposure_usd / 1000).toFixed(0)}k ARR exposure`
      : null;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-4 sm:px-6 pt-6 sm:pt-8 pb-24">
        {/* Top breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/inbox/"
            className="inline-flex items-center gap-1.5 text-[12.5px] transition"
            style={{ color: "var(--color-tertiary)" }}
          >
            <ArrowLeft size={13} />
            <span>Inbox</span>
          </Link>
          <Link
            href="/audit/"
            className="inline-flex items-center gap-1.5 text-[12px] transition"
            style={{ color: "var(--color-tertiary)" }}
          >
            <span>Audit log</span>
            <History size={12} />
          </Link>
        </div>

        {/* Title */}
        <p className="eyebrow mt-8">Prioritize</p>
        <h1
          className="font-display mt-2 text-[28px] leading-tight tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {initiative.title}
        </h1>

        {/* Metadata row */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px]" style={{ color: "var(--color-tertiary)" }}>
          <SignalChip kind={signalKind} />
          {arrLabel && (
            <>
              <span style={{ color: "var(--color-muted)" }}>·</span>
              <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>{arrLabel}</span>
            </>
          )}
          {initiative.stakeholder_signals.length > 0 && (
            <>
              <span style={{ color: "var(--color-muted)" }}>·</span>
              <span>{initiative.stakeholder_signals.length} stakeholder{initiative.stakeholder_signals.length === 1 ? "" : "s"}</span>
            </>
          )}
          <span style={{ color: "var(--color-muted)" }}>·</span>
          <span>{initiative.theme}</span>
        </div>

        {/* OKR alignment row */}
        {okrLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="eyebrow" style={{ color: "var(--color-muted)" }}>Aligned with</span>
            {okrLabels.map((l, i) => (
              <span
                key={i}
                className="inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        )}

        {/* System learning cue */}
        {priorOverride && mode === "default" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-start gap-3 rounded-lg px-4 py-3"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Sparkles size={13} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
            <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
              <span style={{ color: "var(--color-tertiary)" }}>Noting your last override:</span>{" "}
              you flagged &ldquo;{priorOverride.rationale}&rdquo; as a reason — I&rsquo;ve weighted that consideration in this recommendation.
            </p>
          </motion.div>
        )}

        {/* ─── Framework chips (compact) ─── */}
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          {listFrameworks().map((fw) => {
            const active = fw === activeFramework;
            const isAIPick = fw === rec.framework;
            return (
              <button
                key={fw}
                onClick={() => pickFramework(fw)}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition"
                style={{
                  background: active ? "var(--color-accent)" : "transparent",
                  color: active ? "var(--color-elevated)" : "var(--color-tertiary)",
                  border: "1px solid",
                  borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                }}
                title={isAIPick ? `AI picked ${fw}` : `Switch to ${fw}`}
              >
                <span>{fw}</span>
                {isAIPick && (
                  <span
                    aria-hidden
                    className="text-[10px] leading-none"
                    style={{
                      color: active ? "rgba(255,255,255,0.85)" : "var(--color-accent)",
                    }}
                  >
                    ✦
                  </span>
                )}
              </button>
            );
          })}
          <span className="ml-1 text-[11px]" style={{ color: "var(--color-muted)" }}>
            ✦ marks AI&rsquo;s pick
          </span>
        </div>

        {/* ─── The Decision card — score + impact + conflicts + recommendation in one frame ─── */}
        <section
          className="mt-4 rounded-2xl px-6 py-5"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            borderLeft: `2px solid ${actionTone(recAction)}`,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Headline: action + sequence + outcome */}
          <p className="eyebrow">{ACTION_LABEL[recAction]} · recommended</p>
          <p
            className="mt-1.5 text-[20px] tracking-tight"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            {ACTION_LABEL[recAction]} · {commitImpact.target_sprint_label}
          </p>
          <p className="mt-1 text-[13.5px] leading-snug" style={{ color: "var(--color-secondary)" }}>
            {rec.predicted_outcome}
          </p>

          <div className="my-5 h-px" style={{ background: "var(--color-border)" }} />

          {/* Compact decision strip */}
          <DecisionRow
            label="Score"
            primary={`${scoring.total.value}`}
            secondary={`${activeFramework}${activeFramework !== rec.framework ? " · override" : ""}`}
          />

          <DecisionRow
            label="Capacity"
            primary={
              <span
                className={
                  commitImpact.resolved_load > commitImpact.capacity ? "" : ""
                }
                style={{
                  color: commitImpact.resolved_load > commitImpact.capacity
                    ? "var(--color-warning)"
                    : "var(--color-primary)",
                }}
              >
                {commitImpact.before_load} → {commitImpact.resolved_load} / {commitImpact.capacity}p
              </span>
            }
            secondary={
              commitImpact.pushed_items.length > 0
                ? `${commitImpact.pushed_items.length} item${commitImpact.pushed_items.length === 1 ? "" : "s"} reflow`
                : "no reflow"
            }
            secondaryTone={commitImpact.pushed_items.length > 0 ? "warning" : "success"}
          >
            {commitImpact.pushed_items.length > 0 && (
              <div className="mt-2 space-y-1 pl-2">
                {commitImpact.pushed_items.map((p) => (
                  <p
                    key={p.initiative_id}
                    className="text-[12px]"
                    style={{ color: "var(--color-tertiary)" }}
                  >
                    <span style={{ color: "var(--color-secondary)" }}>{p.title}</span>
                    {" → "}
                    {SPRINTS[p.to_sprint - 1]?.label}
                  </p>
                ))}
              </div>
            )}
          </DecisionRow>

          <DecisionRow
            label="Conflicts"
            primary={
              rec.conflicts.length === 0 ? (
                <span style={{ color: "var(--color-success)" }}>None</span>
              ) : (
                <span style={{ color: "var(--color-warning)" }}>
                  {rec.conflicts.length} flagged
                </span>
              )
            }
            secondary={rec.conflicts.length > 0 ? rec.conflicts[0] : undefined}
            secondaryTone={rec.conflicts.length > 0 ? "warning" : undefined}
            isLast
          />
        </section>

        {/* ─── "Why this" — collapsed by default, expand for the long context ─── */}
        <button
          onClick={() => setWhyOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-medium transition hover:bg-card-hover"
          style={{ color: "var(--color-tertiary)" }}
          aria-expanded={whyOpen}
        >
          <ChevronDown
            size={14}
            style={{
              transform: whyOpen ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <span>Why this</span>
        </button>

        <AnimatePresence initial={false}>
          {whyOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-6">
                {/* Long rationale */}
                <div>
                  <p className="eyebrow">Rationale</p>
                  <p
                    className="font-display mt-2 text-[18px] leading-[1.45]"
                    style={{ color: "var(--color-primary)", fontWeight: 400 }}
                  >
                    {initiative.rationale_narrative}
                  </p>
                </div>

                {/* AI's action reason */}
                <div>
                  <p className="eyebrow">AI reasoning</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                    {rec.action_reason}
                  </p>
                  {rec.okr_contribution && (
                    <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
                      {rec.okr_contribution}
                    </p>
                  )}
                </div>

                {/* Framework rationale */}
                <div>
                  <p className="eyebrow">Why {activeFramework}</p>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                    <span style={{ color: "var(--color-tertiary)" }}>{scoring.description}</span>{" "}
                    {scoring.rationale}
                  </p>
                  {activeFramework !== rec.framework && (
                    <p className="mt-1.5 text-[12px]" style={{ color: "var(--color-accent)" }}>
                      AI originally picked {rec.framework} — {rec.framework_rationale}
                    </p>
                  )}
                </div>

                {/* Score breakdown */}
                <div>
                  <p className="eyebrow">Score breakdown</p>
                  <div
                    className="mt-2 overflow-hidden rounded-xl"
                    style={{
                      background: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${scoring.rows.length + 1}, minmax(0, 1fr))`,
                      }}
                    >
                      {scoring.rows.map((row, idx) => (
                        <ScoreCell
                          key={idx}
                          label={row.label}
                          value={row.value}
                          hint={row.hint}
                          isLast={false}
                        />
                      ))}
                      <ScoreCell
                        label={scoring.total.label}
                        value={scoring.total.value}
                        isLast
                        accent
                      />
                    </div>
                  </div>
                </div>

                {/* Strategic context */}
                {rec.tradeoffs.length > 0 && (
                  <div>
                    <p className="eyebrow">Strategic context</p>
                    <ul className="mt-2 space-y-2">
                      {rec.tradeoffs.map((t, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-[13px] leading-relaxed"
                          style={{ color: "var(--color-secondary)" }}
                        >
                          <span
                            className="mt-1.5 inline-block h-1 w-1 rounded-full shrink-0"
                            style={{ background: "var(--color-tertiary)" }}
                          />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full conflict list */}
                {rec.conflicts.length > 0 && (
                  <div>
                    <p className="eyebrow" style={{ color: "var(--color-warning)" }}>
                      Conflicts
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {rec.conflicts.map((c, idx) => (
                        <li
                          key={idx}
                          className="text-[13px] leading-relaxed"
                          style={{ color: "var(--color-secondary)" }}
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Action zone ─── */}
        <section
          className="mt-12 rounded-xl px-5 py-4"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {mode === "default" && (
            <p
              className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--color-tertiary)" }}
            >
              Decide
            </p>
          )}
          <AnimatePresence mode="wait">
            {/* Default — three-action bar */}
            {mode === "default" && (
              <motion.div
                key="action-bar"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-2"
              >
                <ActionButton
                  onClick={() => chooseAction("commit")}
                  primary={recAction === "commit"}
                  kbd={recAction === "commit" ? "↵" : "C"}
                  icon={<Check size={14} />}
                  label="Commit"
                />
                <ActionButton
                  onClick={() => chooseAction("defer")}
                  primary={recAction === "defer"}
                  kbd={recAction === "defer" ? "↵" : "D"}
                  icon={<Clock size={14} />}
                  label="Defer"
                />
                <ActionButton
                  onClick={() => chooseAction("escalate")}
                  primary={recAction === "escalate"}
                  kbd={recAction === "escalate" ? "↵" : "S"}
                  icon={<Send size={14} />}
                  label="Escalate"
                />
                <span className="ml-auto text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
                  ↵ follows AI · or pick any other
                </span>
              </motion.div>
            )}

            {/* Override-as-path — capture reason */}
            {mode === "overriding" && overrideTo && (
              <motion.div
                key="override"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span style={{ color: "var(--color-tertiary)" }}>Choosing</span>
                  <span className="font-medium" style={{ color: actionTone(overrideTo) }}>
                    {ACTION_LABEL[overrideTo]}
                  </span>
                  <span style={{ color: "var(--color-tertiary)" }}>instead of AI&rsquo;s</span>
                  <span className="font-medium" style={{ color: actionTone(recAction) }}>
                    {ACTION_LABEL[recAction]}
                  </span>
                </div>
                <label className="eyebrow mt-3 block">Why a different call?</label>
                <input
                  ref={overrideInputRef}
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitOverride();
                    }
                  }}
                  placeholder="Type a reason, then ↵"
                  className="mt-2 w-full bg-transparent text-[14px] outline-none placeholder:opacity-40"
                  style={{ color: "var(--color-primary)" }}
                />
                <div className="mt-3 flex items-center gap-3 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
                  <span>
                    <Kbd>↵</Kbd>{" "}
                    save · the system learns from your reason
                  </span>
                  <span>
                    <Kbd>Esc</Kbd>{" "}
                    cancel
                  </span>
                </div>
              </motion.div>
            )}

            {/* Confirming — real sprint impact before commit fires */}
            {mode === "confirming" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2">
                  <Check size={14} style={{ color: "var(--color-success)" }} />
                  <p className="text-[13px] font-medium" style={{ color: "var(--color-primary)" }}>
                    Commit to {commitImpact.target_sprint_label}?
                  </p>
                </div>

                <div className="mt-3 rounded-md px-3 py-3" style={{ background: "var(--color-page)" }}>
                  <SprintImpactBar impact={commitImpact} />

                  {commitImpact.pushed_items.length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11.5px] font-medium" style={{ color: "var(--color-warning)" }}>
                        Reflow needed —
                      </p>
                      {commitImpact.pushed_items.map((p) => (
                        <p
                          key={p.initiative_id}
                          className="text-[12px] leading-relaxed"
                          style={{ color: "var(--color-secondary)" }}
                        >
                          <span style={{ color: "var(--color-primary)" }}>{p.title}</span>{" "}
                          <span style={{ color: "var(--color-tertiary)" }}>
                            pushes {SPRINTS[p.from_sprint - 1]?.label} → {SPRINTS[p.to_sprint - 1]?.label}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="mt-2 text-[12px]"
                      style={{ color: "var(--color-success)" }}
                    >
                      No reflow needed.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMode("default");
                      setOverrideText("");
                      setOverrideTo(null);
                    }}
                    className="rounded-md px-3 py-1.5 text-[13px] font-medium transition hover:bg-card-hover"
                    style={{
                      background: "transparent",
                      color: "var(--color-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={finalizeCommit}
                    autoFocus
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition"
                    style={{
                      background: "var(--color-accent)",
                      color: "var(--color-elevated)",
                    }}
                  >
                    <Check size={13} />
                    Confirm
                    <Kbd light>↵</Kbd>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Escalating — stakeholders + draft */}
            {mode === "escalating" && (
              <motion.div
                key="escalate"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="flex items-start gap-2 rounded-md px-3 py-2 text-[12px]"
                  style={{
                    background: "var(--color-warning-soft)",
                    color: "var(--color-secondary)",
                  }}
                >
                  <AlertTriangle
                    size={12}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--color-warning)" }}
                  />
                  <span>
                    <strong style={{ color: "var(--color-primary)" }}>Escalate</strong>{" "}
                    means this needs stakeholder input before commit. Use for strategic ambiguity, capacity-vs-scope tension, or cross-team dependencies.
                  </span>
                </div>

                <p className="eyebrow mt-4">Stakeholders</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["sales", "cs", "exec", "eng"] as const).map((tag) => {
                    const active = escalateTags.has(tag);
                    const aiSuggested = rec.suggested_escalation?.stakeholders.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const next = new Set(escalateTags);
                          if (active) next.delete(tag);
                          else next.add(tag);
                          setEscalateTags(next);
                        }}
                        className="rounded-md px-3 py-1.5 text-[12px] font-medium transition"
                        style={{
                          background: active ? "var(--color-accent-soft)" : "var(--color-page)",
                          color: active ? "var(--color-accent)" : "var(--color-secondary)",
                          border: "1px solid",
                          borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                        }}
                      >
                        {STAKEHOLDER_LABELS[tag]}
                        {aiSuggested && !active && (
                          <span className="ml-1.5 text-[9.5px]" style={{ color: "var(--color-tertiary)" }}>
                            · AI suggests
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="eyebrow mt-4">Draft message</p>
                <textarea
                  value={escalateMessage}
                  onChange={(e) => setEscalateMessage(e.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-md px-3 py-2 text-[13.5px] outline-none"
                  style={{
                    background: "var(--color-page)",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-border)",
                  }}
                />

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setMode("default")}
                    className="rounded-md px-3 py-1.5 text-[13px] font-medium transition hover:bg-card-hover"
                    style={{
                      background: "transparent",
                      color: "var(--color-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={escalate}
                    disabled={escalateTags.size === 0}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition disabled:opacity-40"
                    style={{
                      background: "var(--color-accent)",
                      color: "var(--color-elevated)",
                    }}
                  >
                    <Send size={13} />
                    Send to{" "}
                    {escalateTags.size > 0
                      ? `${escalateTags.size} stakeholder${escalateTags.size > 1 ? "s" : ""}`
                      : "stakeholders"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2.5 text-[13px]"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-primary)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision-lands choreography */}
      <AnimatePresence>
        {flyToCorner && (
          <motion.div
            initial={{
              opacity: 1,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              scale: 1,
            }}
            animate={{
              opacity: 0,
              top: "8%",
              right: "5%",
              left: "auto",
              x: 0,
              y: 0,
              scale: 0.45,
            }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed z-50 rounded-lg px-3 py-2"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-accent)",
              boxShadow:
                "0 20px 40px -12px var(--color-accent-soft), 0 0 0 1px var(--color-accent-soft)",
            }}
          >
            <div className="text-[12.5px] font-medium" style={{ color: "var(--color-primary)" }}>
              {initiative.title}
            </div>
            <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-accent)" }}>
              → {rec.sequence}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function DecisionRow({
  label,
  primary,
  secondary,
  secondaryTone,
  isLast = false,
  children,
}: {
  label: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  secondaryTone?: "warning" | "success";
  isLast?: boolean;
  children?: React.ReactNode;
}) {
  const secondaryColor =
    secondaryTone === "warning"
      ? "var(--color-warning)"
      : secondaryTone === "success"
        ? "var(--color-success)"
        : "var(--color-tertiary)";
  return (
    <div
      className="py-2.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="text-[11.5px] uppercase tracking-[0.06em]"
          style={{ color: "var(--color-tertiary)", fontWeight: 600 }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2 text-right">
          <p
            className="font-numeric text-[14px] tabular-nums"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            {primary}
          </p>
          {secondary && (
            <p className="text-[12px]" style={{ color: secondaryColor }}>
              {secondary}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function SprintImpactBar({ impact }: { impact: CommitImpact }) {
  const beforePct = Math.min(100, (impact.before_load / impact.capacity) * 100);
  const newAddPct = Math.min(
    100 - beforePct,
    (Math.min(impact.resolved_load, impact.capacity) - impact.before_load) /
      impact.capacity *
      100,
  );
  const overflowPct = Math.max(0, ((impact.resolved_load - impact.capacity) / impact.capacity) * 100);
  const overflow = impact.resolved_load > impact.capacity;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[12.5px] font-medium" style={{ color: "var(--color-primary)" }}>
          {impact.target_sprint_label}
        </p>
        <p
          className="font-numeric text-[12px]"
          style={{ color: overflow ? "var(--color-warning)" : "var(--color-secondary)" }}
        >
          {impact.before_load} → {impact.resolved_load} / {impact.capacity}p
        </p>
      </div>

      <div
        className="mt-2 relative h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--color-border)" }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${beforePct}%` }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 h-full"
          style={{ background: "var(--color-tertiary)", opacity: 0.5 }}
        />
        <motion.div
          initial={false}
          animate={{ left: `${beforePct}%`, width: `${Math.max(0, newAddPct)}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="absolute top-0 h-full"
          style={{ background: overflow ? "var(--color-warning)" : "var(--color-accent)" }}
        />
      </div>

      <div className="mt-1.5 flex items-center gap-3 text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-tertiary)", opacity: 0.5 }} />
          Existing
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: overflow ? "var(--color-warning)" : "var(--color-accent)" }}
          />
          This commit
        </span>
        {overflow && (
          <span style={{ color: "var(--color-warning)" }}>
            · {Math.round(overflowPct)}p over before reflow
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreCell({
  label,
  value,
  hint,
  isLast,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  isLast: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className="px-4 py-4"
      style={{
        background: accent ? "var(--color-accent-soft)" : "transparent",
        borderRight: isLast ? "none" : "1px solid var(--color-border)",
      }}
    >
      <p className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </p>
      <p
        className="font-numeric mt-1.5 text-[18px] tabular-nums"
        style={{
          color: accent ? "var(--color-accent)" : "var(--color-primary)",
          fontWeight: accent ? 600 : 500,
        }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  const bgVar = `var(--color-chip-${kind}-bg)`;
  const fgVar = `var(--color-chip-${kind}-text)`;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ background: bgVar, color: fgVar }}
    >
      {kind}
    </span>
  );
}

function ActionButton({
  onClick,
  primary,
  kbd,
  icon,
  label,
}: {
  onClick: () => void;
  primary?: boolean;
  kbd: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium transition"
      style={
        primary
          ? {
              background: "var(--color-accent)",
              color: "var(--color-elevated)",
              boxShadow: "var(--shadow-sm)",
            }
          : {
              background: "transparent",
              color: "var(--color-secondary)",
              border: "1px solid var(--color-border)",
            }
      }
    >
      {icon}
      <span>{label}</span>
      <Kbd light={primary}>{kbd}</Kbd>
    </button>
  );
}

function Kbd({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <kbd
      className="ml-0.5 rounded px-1.5 py-0.5 font-mono text-[10px]"
      style={{
        background: light ? "rgba(255, 255, 255, 0.18)" : "var(--color-page)",
        color: light ? "rgba(255, 255, 255, 0.9)" : "var(--color-tertiary)",
        border: light ? "none" : "1px solid var(--color-border)",
      }}
    >
      {children}
    </kbd>
  );
}
