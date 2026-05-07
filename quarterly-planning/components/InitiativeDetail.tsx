"use client";

import { useEffect, useRef, useState } from "react";
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
  Info,
} from "lucide-react";
import type {
  Initiative,
  Evidence,
  EvidenceKind,
  RecommendedAction,
} from "@/lib/types";
import {
  addDecision,
  getDecisions,
  getFrameworkOverrides,
  setFrameworkOverride,
  FRAMEWORK_OVERRIDES_EVENT,
} from "@/lib/decisions";
import { playCommitChime, playDeferTick } from "@/lib/sound";
import { getOKR } from "@/lib/strategic";
import { SprintView } from "@/components/SprintView";

const tintByKind: Record<EvidenceKind, { bg: string; text: string }> = {
  revenue: { bg: "var(--color-chip-revenue-bg)", text: "var(--color-chip-revenue-text)" },
  deals: { bg: "var(--color-chip-deals-bg)", text: "var(--color-chip-deals-text)" },
  support: { bg: "var(--color-chip-support-bg)", text: "var(--color-chip-support-text)" },
  deadline: { bg: "var(--color-chip-deadline-bg)", text: "var(--color-chip-deadline-text)" },
  strategic: { bg: "var(--color-chip-strategic-bg)", text: "var(--color-chip-strategic-text)" },
};

type Mode =
  | "default"
  | "overriding" // user picked an action that differs from AI rec
  | "escalating" // escalate path (with stakeholders + draft msg)
  | "committing" // committed/done — animation playing, navigating away
  | "deferred";

const ACTION_LABEL: Record<RecommendedAction, string> = {
  commit: "Commit",
  defer: "Defer",
  escalate: "Escalate",
};

const ACTION_VERB: Record<RecommendedAction, string> = {
  commit: "I recommend committing this.",
  defer: "I recommend deferring this.",
  escalate: "I recommend escalating this.",
};

const STAKEHOLDER_LABELS: Record<string, string> = {
  sales: "Sales",
  cs: "Customer Success",
  exec: "Exec",
  eng: "Engineering",
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

export function InitiativeDetail({ initiative }: { initiative: Initiative }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("default");
  // When user picks a non-AI action, we capture which action they're doing → triggers override prompt
  const [overrideTo, setOverrideTo] = useState<RecommendedAction | null>(null);
  const [expandedChip, setExpandedChip] = useState<number | null>(null);
  const [overrideText, setOverrideText] = useState("");
  const [escalateTags, setEscalateTags] = useState<Set<string>>(
    new Set(initiative.ai_recommendation.suggested_escalation?.stakeholders ?? []),
  );
  const [escalateMessage, setEscalateMessage] = useState(
    initiative.ai_recommendation.suggested_escalation?.draft_message ?? "",
  );
  const [toast, setToast] = useState<string | null>(null);
  const [priorOverride, setPriorOverride] = useState<{
    rationale: string;
  } | null>(null);
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false);
  const [showFrameworkPicker, setShowFrameworkPicker] = useState(false);
  const [activeFramework, setActiveFramework] = useState<string>(
    initiative.ai_recommendation.framework,
  );
  const [flyToCorner, setFlyToCorner] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Hydrate user-overridden framework from localStorage
  useEffect(() => {
    function load() {
      const overrides = getFrameworkOverrides();
      if (overrides[initiative.id]) {
        setActiveFramework(overrides[initiative.id]);
      } else {
        setActiveFramework(initiative.ai_recommendation.framework);
      }
    }
    load();
    window.addEventListener(FRAMEWORK_OVERRIDES_EVENT, load);
    return () =>
      window.removeEventListener(FRAMEWORK_OVERRIDES_EVENT, load);
  }, [initiative.id, initiative.ai_recommendation.framework]);

  function pickFramework(fw: string) {
    setActiveFramework(fw);
    setShowFrameworkPicker(false);
    if (fw !== initiative.ai_recommendation.framework) {
      setFrameworkOverride(initiative.id, fw);
      setToast(`Framework switched to ${fw}. AI will re-score on next sync.`);
      setTimeout(() => setToast(null), 2200);
    }
  }

  const rec = initiative.ai_recommendation;
  const recAction = rec.action;

  // System learning cue
  useEffect(() => {
    const decisions = getDecisions();
    const lastOverride = [...decisions]
      .reverse()
      .find(
        (d) => d.action === "overridden" && d.initiative_id !== initiative.id,
      );
    if (lastOverride && lastOverride.human_rationale) {
      setPriorOverride({ rationale: lastOverride.human_rationale });
    }
  }, [initiative.id]);

  // Auto-focus the override input
  useEffect(() => {
    if (mode === "overriding") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inForm =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (mode === "committing" || mode === "deferred") return;

      if (e.key === "Escape") {
        if (document.querySelector("[cmdk-root]")) return;
        if (mode !== "default") {
          setMode("default");
          setOverrideText("");
          setOverrideTo(null);
        } else {
          router.push("/");
        }
        return;
      }

      if (inForm) return;

      if (e.key === "Enter" && mode === "default") {
        e.preventDefault();
        chooseAction(recAction);
      } else if ((e.key === "c" || e.key === "C") && mode === "default") {
        e.preventDefault();
        chooseAction("commit");
      } else if ((e.key === "d" || e.key === "D") && mode === "default") {
        e.preventDefault();
        chooseAction("defer");
      } else if ((e.key === "s" || e.key === "S") && mode === "default") {
        e.preventDefault();
        chooseAction("escalate");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, recAction]);

  function chooseAction(action: RecommendedAction) {
    if (action === "escalate") {
      // Escalate has its own UI regardless of whether it matches AI rec
      setMode("escalating");
      return;
    }
    if (action === recAction) {
      // Match AI rec — direct action, no reason needed
      if (action === "commit") commit();
      else if (action === "defer") defer();
      return;
    }
    // Mismatch — capture as override with reason
    setOverrideTo(action);
    setMode("overriding");
  }

  function commit() {
    setMode("committing");
    playCommitChime();
    setFlyToCorner(true);
    addDecision({
      initiative_id: initiative.id,
      action: "committed",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      sequence: rec.sequence,
      decided_at: new Date().toISOString(),
    });
    setToast(`Committed. Sequenced in ${rec.sequence}.`);
    setTimeout(() => router.push("/"), 1100);
  }

  function commitOverride() {
    if (!overrideText.trim() || !overrideTo) return;
    setMode("committing");
    if (overrideTo === "defer") playDeferTick();
    else {
      playCommitChime();
      setFlyToCorner(true);
    }
    addDecision({
      initiative_id: initiative.id,
      action: "overridden",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: `${ACTION_LABEL[overrideTo]} — ${overrideText.trim()}`,
      sequence: overrideTo === "commit" ? rec.sequence : "Overridden",
      decided_at: new Date().toISOString(),
    });
    setToast(
      `Overridden — chose ${ACTION_LABEL[overrideTo]} instead of ${ACTION_LABEL[recAction]}.`,
    );
    setTimeout(() => router.push("/"), 1100);
  }

  function defer() {
    setMode("deferred");
    playDeferTick();
    addDecision({
      initiative_id: initiative.id,
      action: "deferred",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      decided_at: new Date().toISOString(),
    });
    setToast("Deferred. Will resurface on context shift.");
    setTimeout(() => router.push("/"), 900);
  }

  function escalate() {
    if (escalateTags.size === 0) return;
    setMode("committing");
    playCommitChime();
    const matchedRec = recAction === "escalate";
    addDecision({
      initiative_id: initiative.id,
      action: matchedRec ? "escalated" : "overridden",
      ai_suggestion: `${ACTION_LABEL[recAction]} · ${rec.sequence}`,
      human_rationale: matchedRec
        ? `Escalated to: ${[...escalateTags].join(", ")}`
        : `Escalate (overrode ${ACTION_LABEL[recAction]}) — sent to ${[...escalateTags].join(", ")}`,
      decided_at: new Date().toISOString(),
    });
    setToast(`Escalated to ${[...escalateTags].join(", ")}. Awaiting input.`);
    setTimeout(() => router.push("/"), 1100);
  }

  const okrLabels = rec.okr_alignment
    .map((id) => getOKR(id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-page text-primary">
      <div className="mx-auto max-w-[720px] px-8 py-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
          <Link
            href="/audit/"
            className="inline-flex items-center gap-1.5 text-xs text-tertiary transition hover:text-primary"
          >
            <History size={12} />
            <span>Audit log</span>
          </Link>
        </div>

        <div className="mt-10 flex items-baseline justify-between gap-6">
          <h1 className="text-xl font-medium tracking-tight">
            {initiative.title}
          </h1>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-tertiary">
            {initiative.theme}
          </span>
        </div>

        {/* OKR alignment */}
        {okrLabels.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
            <span className="text-tertiary">Aligned with:</span>
            {okrLabels.map((label, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* System-learning cue */}
        {priorOverride && mode === "default" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-elevated px-4 py-3"
          >
            <Sparkles
              size={14}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--color-accent)" }}
            />
            <div className="text-xs leading-relaxed text-secondary">
              <span className="text-tertiary">Noting your last override:</span>{" "}
              you flagged &ldquo;{priorOverride.rationale}&rdquo; as a reason —
              I&rsquo;ve weighted that consideration in the recommendation
              below.
            </div>
          </motion.div>
        )}

        {/* Hero rationale */}
        <p
          className="mt-12 text-[28px] leading-[1.35] tracking-tight text-primary"
          style={{ fontWeight: 400 }}
        >
          {initiative.rationale_narrative}
        </p>

        {/* Evidence */}
        <section className="mt-16">
          <p className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
            Evidence
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {initiative.evidence.map((ev, idx) => (
              <ChipWithSource
                key={idx}
                ev={ev}
                expanded={expandedChip === idx}
                onToggle={() =>
                  setExpandedChip(expandedChip === idx ? null : idx)
                }
              />
            ))}
          </div>
        </section>

        {/* Recommendation / Override / Escalate */}
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
            Recommendation
          </p>

          <AnimatePresence mode="wait">
            {(mode === "default" || mode === "committing") && (
              <motion.div
                key="rec-card"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: mode === "committing" ? 1.015 : 1,
                }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border-l-2 border border-[var(--color-border)] bg-elevated p-6"
                style={{ borderLeftColor: actionColor(recAction) }}
              >
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="text-[11px] uppercase tracking-[0.12em] font-semibold"
                    style={{ color: actionColor(recAction) }}
                  >
                    {ACTION_LABEL[recAction]}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    · {rec.sequence}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    · {rec.effort_sprints} sprint
                    {rec.effort_sprints > 1 ? "s" : ""}
                  </span>
                  <span className="text-[11px] text-tertiary">
                    · {rec.eng_confidence} confidence
                  </span>
                </div>
                <p className="mt-3 text-base text-primary leading-relaxed">
                  {ACTION_VERB[recAction]}{" "}
                  <span className="text-secondary">{rec.action_reason}</span>
                </p>
                {rec.okr_contribution && (
                  <p className="mt-2 text-sm text-tertiary leading-relaxed">
                    {rec.okr_contribution}
                  </p>
                )}

                {/* Framework chip + picker + predicted outcome */}
                <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                  <div className="relative flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowFrameworkPicker(!showFrameworkPicker)}
                      onMouseEnter={() => setShowFrameworkInfo(true)}
                      onMouseLeave={() => setShowFrameworkInfo(false)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium transition"
                      style={{
                        background:
                          activeFramework !== rec.framework
                            ? "var(--color-accent-soft)"
                            : "var(--color-page)",
                        color:
                          activeFramework !== rec.framework
                            ? "var(--color-accent)"
                            : "var(--color-secondary)",
                        border: "1px solid var(--color-border-strong)",
                      }}
                    >
                      <span className="text-tertiary">Framework:</span>
                      <span>{activeFramework}</span>
                      <Info size={10} className="text-tertiary" />
                    </button>
                    <span className="text-[11px] text-tertiary">
                      ·{" "}
                      {activeFramework === rec.framework
                        ? "AI picked this — click to switch"
                        : "Your override"}
                    </span>

                    <AnimatePresence>
                      {showFrameworkPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.14 }}
                          className="absolute left-0 top-7 z-10 min-w-[200px] rounded-lg border border-[var(--color-border-strong)] bg-elevated p-1 shadow-xl"
                        >
                          {[
                            "RICE",
                            "ICE",
                            "Value/Effort",
                            "Strategic Bet",
                            "WSJF",
                          ].map((fw) => {
                            const isCurrent = fw === activeFramework;
                            const isAIRec = fw === rec.framework;
                            return (
                              <button
                                key={fw}
                                onClick={() => pickFramework(fw)}
                                className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs transition hover:bg-card-hover"
                                style={{
                                  color: isCurrent
                                    ? "var(--color-primary)"
                                    : "var(--color-secondary)",
                                  background: isCurrent
                                    ? "var(--color-card-hover)"
                                    : "transparent",
                                }}
                              >
                                <span>{fw}</span>
                                <span className="ml-2 text-[10px] text-tertiary">
                                  {isAIRec && "AI default"}
                                  {isCurrent && !isAIRec && "selected"}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showFrameworkInfo && !showFrameworkPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-xs italic text-tertiary leading-relaxed">
                          {rec.framework_rationale}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-md bg-page px-3 py-2 text-xs">
                  <Sparkles
                    size={11}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <span className="leading-relaxed text-secondary">
                    <span className="text-tertiary">
                      Predicted outcome:
                    </span>{" "}
                    {rec.predicted_outcome}
                  </span>
                </div>
              </motion.div>
            )}

            {mode === "overriding" && overrideTo && (
              <motion.div
                key="override"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-[var(--color-border-strong)] bg-elevated p-6"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-tertiary">Choosing</span>
                  <span
                    className="font-medium"
                    style={{ color: actionColor(overrideTo) }}
                  >
                    {ACTION_LABEL[overrideTo]}
                  </span>
                  <span className="text-tertiary">instead of AI&rsquo;s</span>
                  <span
                    className="font-medium"
                    style={{ color: actionColor(recAction) }}
                  >
                    {ACTION_LABEL[recAction]}
                  </span>
                </div>
                <label className="mt-4 block text-[11px] uppercase tracking-[0.12em] text-tertiary">
                  Why a different call?
                </label>
                <input
                  ref={inputRef}
                  value={overrideText}
                  onChange={(e) => setOverrideText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitOverride();
                    }
                  }}
                  placeholder="Type a reason, then ↵"
                  className="mt-2 w-full bg-transparent text-base text-primary placeholder:text-tertiary outline-none"
                />
                <div className="mt-3 flex items-center gap-3 text-xs text-tertiary">
                  <span>
                    <kbd className="rounded border border-[var(--color-border-strong)] bg-page px-1.5 py-0.5 font-mono text-[10px]">
                      ↵
                    </kbd>{" "}
                    save · the system learns from your reason
                  </span>
                  <span>
                    <kbd className="rounded border border-[var(--color-border-strong)] bg-page px-1.5 py-0.5 font-mono text-[10px]">
                      Esc
                    </kbd>{" "}
                    cancel
                  </span>
                </div>
              </motion.div>
            )}

            {mode === "escalating" && (
              <motion.div
                key="escalate"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-[var(--color-border-strong)] bg-elevated p-6"
              >
                <div className="flex items-start gap-2 rounded-md bg-page px-3 py-2 text-xs text-secondary">
                  <AlertTriangle
                    size={12}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--color-warning)" }}
                  />
                  <span>
                    <strong className="text-primary">Escalate</strong> means
                    this decision needs stakeholder alignment or exec input
                    before you can confidently commit. Use for strategic
                    ambiguity, capacity-vs-scope tension, or cross-team
                    dependencies.
                  </span>
                </div>

                <div className="mt-4">
                  <label className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                    Stakeholders
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["sales", "cs", "exec", "eng"] as const).map((tag) => {
                      const active = escalateTags.has(tag);
                      const aiSuggested =
                        rec.suggested_escalation?.stakeholders.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const next = new Set(escalateTags);
                            if (active) next.delete(tag);
                            else next.add(tag);
                            setEscalateTags(next);
                          }}
                          className="relative rounded-md px-3 py-1.5 text-xs font-medium transition"
                          style={{
                            background: active
                              ? "var(--color-accent-soft)"
                              : "var(--color-page)",
                            color: active
                              ? "var(--color-accent)"
                              : "var(--color-secondary)",
                            border: "1px solid var(--color-border-strong)",
                          }}
                        >
                          {STAKEHOLDER_LABELS[tag]}
                          {aiSuggested && !active && (
                            <span
                              className="ml-1.5 text-[9px]"
                              style={{ color: "var(--color-tertiary)" }}
                            >
                              · AI suggests
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                    Draft message
                    {rec.suggested_escalation && (
                      <span className="ml-2 normal-case text-tertiary">
                        · AI-drafted, edit as needed
                      </span>
                    )}
                  </label>
                  <textarea
                    value={escalateMessage}
                    onChange={(e) => setEscalateMessage(e.target.value)}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-md border border-[var(--color-border)] bg-page px-3 py-2 text-sm text-primary outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <button
                  onClick={escalate}
                  disabled={escalateTags.size === 0}
                  className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  <Send size={14} />
                  Send to{" "}
                  {escalateTags.size > 0
                    ? `${escalateTags.size} stakeholder${escalateTags.size > 1 ? "s" : ""}`
                    : "stakeholders"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Trade-offs */}
        {(mode === "default" || mode === "committing") &&
          rec.tradeoffs.length > 0 && (
            <section className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                Trade-offs · what shifts in the roadmap
              </p>
              <ul className="mt-4 space-y-2">
                {rec.tradeoffs.map((t, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-sm text-secondary leading-relaxed"
                  >
                    <span
                      className="mt-1.5 inline-block h-1 w-1 rounded-full shrink-0"
                      style={{ background: "var(--color-tertiary)" }}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        {/* Conflicts */}
        {(mode === "default" || mode === "committing") &&
          rec.conflicts.length > 0 && (
            <section className="mt-8">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-warning)]">
                Conflicts
              </p>
              <ul className="mt-3 space-y-1.5">
                {rec.conflicts.map((c, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-secondary leading-relaxed"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

        {/* Sprint context view */}
        {(mode === "default" || mode === "committing") && (
          <SprintView currentInitiative={initiative} />
        )}

        {/* Action bar — always 3 actions */}
        <div className="mt-12 flex items-center gap-2 border-t border-[var(--color-border)] pt-6">
          {mode === "default" ? (
            <>
              <ActionButton
                onClick={() => chooseAction("commit")}
                primary={recAction === "commit"}
                kbd={recAction === "commit" ? "↵" : "C"}
                icon={<Check size={14} />}
                label="Commit"
                tone={actionColor("commit")}
              />
              <ActionButton
                onClick={() => chooseAction("defer")}
                primary={recAction === "defer"}
                kbd={recAction === "defer" ? "↵" : "D"}
                icon={<Clock size={14} />}
                label="Defer"
                tone={actionColor("defer")}
              />
              <ActionButton
                onClick={() => chooseAction("escalate")}
                primary={recAction === "escalate"}
                kbd={recAction === "escalate" ? "↵" : "S"}
                icon={<Send size={14} />}
                label="Escalate"
                tone={actionColor("escalate")}
              />
              <span className="ml-auto text-[11px] text-tertiary">
                ↵ follows AI · or pick any other
              </span>
            </>
          ) : (
            <button
              onClick={() => {
                setMode("default");
                setOverrideText("");
                setOverrideTo(null);
              }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-secondary transition hover:text-primary"
            >
              <X size={14} />
              <span>Cancel</span>
              <kbd className="ml-1 rounded border border-[var(--color-border-strong)] bg-page px-1.5 py-0.5 font-mono text-[10px] text-tertiary">
                Esc
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-lg border border-[var(--color-border-strong)] bg-elevated px-4 py-2.5 text-sm text-primary shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision-lands-in-timeline mini card animation */}
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
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="pointer-events-none fixed z-50 rounded-lg border bg-elevated px-3 py-2 shadow-2xl"
            style={{
              borderColor: "var(--color-accent)",
              boxShadow:
                "0 20px 40px -12px var(--color-accent-soft), 0 0 0 1px var(--color-accent-soft)",
            }}
          >
            <div className="text-xs font-medium text-primary">
              {initiative.title}
            </div>
            <div className="mt-0.5 text-[10px] text-tertiary">
              → {rec.sequence}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChipWithSource({
  ev,
  expanded,
  onToggle,
}: {
  ev: Evidence;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tint = tintByKind[ev.kind ?? "strategic"];
  return (
    <div className="inline-flex flex-col">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition hover:scale-[1.02]"
        style={{ background: tint.bg, color: tint.text }}
      >
        <span className="font-semibold tabular-nums">{ev.metric}</span>
        <span className="opacity-70">{ev.label}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-md bg-page px-3 py-2 text-xs leading-relaxed text-secondary"
          >
            <div className="text-tertiary">Source</div>
            <div className="mt-0.5">{ev.source}</div>
            {ev.quote && (
              <div className="mt-2 border-l-2 border-[var(--color-border-strong)] pl-2 italic text-secondary">
                {ev.quote}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({
  onClick,
  primary,
  kbd,
  icon,
  label,
  tone,
}: {
  onClick: () => void;
  primary?: boolean;
  kbd: string;
  icon: React.ReactNode;
  label: string;
  tone?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
      style={
        primary
          ? {
              background: tone ?? "var(--color-accent)",
              color: "#0a0a0b",
            }
          : {
              background: "var(--color-elevated)",
              color: "var(--color-secondary)",
              border: "1px solid var(--color-border-strong)",
            }
      }
    >
      {icon}
      <span>{label}</span>
      <kbd
        className="ml-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
        style={{
          background: primary ? "rgba(0,0,0,0.18)" : "var(--color-page)",
          color: primary ? "#0a0a0b" : "var(--color-tertiary)",
        }}
      >
        {kbd}
      </kbd>
    </button>
  );
}
