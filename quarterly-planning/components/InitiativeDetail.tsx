"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Pencil, Clock, Send, X } from "lucide-react";
import type { Initiative, Evidence, EvidenceKind } from "@/lib/types";
import { addDecision } from "@/lib/decisions";
import { playCommitChime, playDeferTick } from "@/lib/sound";

const tintByKind: Record<EvidenceKind, { bg: string; text: string }> = {
  revenue: {
    bg: "var(--color-chip-revenue-bg)",
    text: "var(--color-chip-revenue-text)",
  },
  deals: {
    bg: "var(--color-chip-deals-bg)",
    text: "var(--color-chip-deals-text)",
  },
  support: {
    bg: "var(--color-chip-support-bg)",
    text: "var(--color-chip-support-text)",
  },
  deadline: {
    bg: "var(--color-chip-deadline-bg)",
    text: "var(--color-chip-deadline-text)",
  },
  strategic: {
    bg: "var(--color-chip-strategic-bg)",
    text: "var(--color-chip-strategic-text)",
  },
};

type Mode = "default" | "overriding" | "escalating" | "committing" | "deferred";

const STAKEHOLDERS = ["sales", "cs", "exec", "eng"] as const;

export function InitiativeDetail({ initiative }: { initiative: Initiative }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("default");
  const [expandedChip, setExpandedChip] = useState<number | null>(null);
  const [overrideText, setOverrideText] = useState("");
  const [escalateTags, setEscalateTags] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input when entering override mode
  useEffect(() => {
    if (mode === "overriding") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in an input
      const target = e.target as HTMLElement | null;
      const inForm =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (mode === "committing" || mode === "deferred") return;

      if (e.key === "Escape") {
        // Don't navigate back if the command palette is open above us
        if (document.querySelector("[cmdk-root]")) return;
        if (mode !== "default") {
          setMode("default");
          setOverrideText("");
          setEscalateTags(new Set());
        } else {
          router.push("/");
        }
        return;
      }

      if (inForm) return;

      if (e.key === "Enter" && mode === "default") {
        e.preventDefault();
        commitDefault();
      } else if ((e.key === "e" || e.key === "E") && mode === "default") {
        e.preventDefault();
        setMode("overriding");
      } else if ((e.key === "d" || e.key === "D") && mode === "default") {
        e.preventDefault();
        defer();
      } else if ((e.key === "s" || e.key === "S") && mode === "default") {
        e.preventDefault();
        setMode("escalating");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function commitDefault() {
    setMode("committing");
    playCommitChime();
    addDecision({
      initiative_id: initiative.id,
      action: "committed",
      ai_suggestion: initiative.ai_recommendation.sequence,
      sequence: initiative.ai_recommendation.sequence,
      decided_at: new Date().toISOString(),
    });
    setToast(
      `Committed. Sequenced in ${initiative.ai_recommendation.sequence}.`,
    );
    setTimeout(() => router.push("/"), 1100);
  }

  function commitOverride() {
    if (!overrideText.trim()) return;
    setMode("committing");
    playCommitChime();
    addDecision({
      initiative_id: initiative.id,
      action: "overridden",
      ai_suggestion: initiative.ai_recommendation.sequence,
      human_rationale: overrideText.trim(),
      sequence: "Overridden",
      decided_at: new Date().toISOString(),
    });
    setToast("Overridden. Decision logged with your rationale.");
    setTimeout(() => router.push("/"), 1100);
  }

  function defer() {
    setMode("deferred");
    playDeferTick();
    addDecision({
      initiative_id: initiative.id,
      action: "deferred",
      ai_suggestion: initiative.ai_recommendation.sequence,
      decided_at: new Date().toISOString(),
    });
    setToast("Deferred. Will resurface on context shift.");
    setTimeout(() => router.push("/"), 900);
  }

  function escalate() {
    if (escalateTags.size === 0) return;
    setMode("committing");
    playCommitChime();
    addDecision({
      initiative_id: initiative.id,
      action: "escalated",
      ai_suggestion: initiative.ai_recommendation.sequence,
      human_rationale: `Escalated to: ${[...escalateTags].join(", ")}`,
      decided_at: new Date().toISOString(),
    });
    setToast(`Escalated to ${[...escalateTags].join(", ")}. Awaiting input.`);
    setTimeout(() => router.push("/"), 1100);
  }

  return (
    <div className="min-h-screen bg-page text-primary">
      <div className="mx-auto max-w-[720px] px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </Link>

        <div className="mt-10 flex items-baseline justify-between gap-6">
          <h1 className="text-xl font-medium tracking-tight">
            {initiative.title}
          </h1>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-tertiary">
            {initiative.theme}
          </span>
        </div>

        {/* Hero rationale — the unique-design moment */}
        <p
          className="mt-12 text-[28px] leading-[1.35] tracking-tight text-primary"
          style={{ fontWeight: 400 }}
        >
          {initiative.rationale_narrative}
        </p>

        {/* Evidence section */}
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

        {/* Recommendation card */}
        <section className="mt-12">
          <p className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
            Recommended
          </p>
          <AnimatePresence mode="wait">
            {mode === "default" || mode === "committing" ? (
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
                style={{ borderLeftColor: "var(--color-accent)" }}
              >
                <p className="text-base text-primary leading-relaxed">
                  Sequence in <strong>{initiative.ai_recommendation.sequence}</strong>.
                  Estimated effort:{" "}
                  <span className="text-secondary">
                    {initiative.ai_recommendation.effort_sprints} sprints
                    (eng confidence{" "}
                    {initiative.ai_recommendation.eng_confidence}).
                  </span>
                  {initiative.ai_recommendation.addresses.length > 0 && (
                    <>
                      {" "}
                      <span className="text-secondary">
                        Addresses{" "}
                        {initiative.ai_recommendation.addresses.join(", ")}.
                      </span>
                    </>
                  )}{" "}
                  <span className="text-secondary">
                    {initiative.ai_recommendation.conflicts.length > 0
                      ? `Conflicts: ${initiative.ai_recommendation.conflicts.join("; ")}.`
                      : "No conflicts detected."}
                  </span>
                </p>
              </motion.div>
            ) : mode === "overriding" ? (
              <motion.div
                key="override"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-[var(--color-border-strong)] bg-elevated p-6"
              >
                <label className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
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
                    save
                  </span>
                  <span>
                    <kbd className="rounded border border-[var(--color-border-strong)] bg-page px-1.5 py-0.5 font-mono text-[10px]">
                      Esc
                    </kbd>{" "}
                    cancel
                  </span>
                </div>
              </motion.div>
            ) : mode === "escalating" ? (
              <motion.div
                key="escalate"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-[var(--color-border-strong)] bg-elevated p-6"
              >
                <label className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                  Tag stakeholders
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STAKEHOLDERS.map((tag) => {
                    const active = escalateTags.has(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const next = new Set(escalateTags);
                          if (active) next.delete(tag);
                          else next.add(tag);
                          setEscalateTags(next);
                        }}
                        className="rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition"
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
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={escalate}
                  disabled={escalateTags.size === 0}
                  className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-40"
                  style={{
                    background: "var(--color-accent)",
                    color: "#fff",
                  }}
                >
                  <Send size={14} />
                  Send to{" "}
                  {escalateTags.size > 0
                    ? `${escalateTags.size} stakeholder${escalateTags.size > 1 ? "s" : ""}`
                    : "stakeholders"}
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        {/* Action bar */}
        <div className="mt-12 flex items-center gap-2 border-t border-[var(--color-border)] pt-6">
          {mode === "default" ? (
            <>
              <ActionButton
                onClick={commitDefault}
                primary
                kbd="↵"
                icon={<Check size={14} />}
                label="Commit"
              />
              <ActionButton
                onClick={() => setMode("overriding")}
                kbd="E"
                icon={<Pencil size={14} />}
                label="Override"
              />
              <ActionButton
                onClick={defer}
                kbd="D"
                icon={<Clock size={14} />}
                label="Defer"
              />
              <ActionButton
                onClick={() => setMode("escalating")}
                kbd="S"
                icon={<Send size={14} />}
                label="Escalate"
              />
            </>
          ) : (
            <button
              onClick={() => {
                setMode("default");
                setOverrideText("");
                setEscalateTags(new Set());
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
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
      style={
        primary
          ? { background: "var(--color-accent)", color: "#fff" }
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
          background: primary ? "rgba(255,255,255,0.18)" : "var(--color-page)",
          color: primary ? "#fff" : "var(--color-tertiary)",
        }}
      >
        {kbd}
      </kbd>
    </button>
  );
}
