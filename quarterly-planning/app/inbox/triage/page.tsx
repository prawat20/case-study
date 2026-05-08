"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowDown, ArrowRight, ArrowUp, X } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import {
  setTriageAction,
  useTriage,
  type TriageAction,
} from "@/lib/triage";
import { useCaptures } from "@/lib/captures";
import { useDecisions } from "@/lib/use-decisions";
import {
  formatRelative,
  getChannelLabel,
  getMinutesAgo,
  getSourceLabel,
  signalToKind,
} from "@/lib/inbox-helpers";
import { playTriageTone } from "@/lib/sound";
import type { Capture } from "@/lib/captures";

const allInitiatives = initiativesJson as Initiative[];

type QueueItem =
  | { kind: "initiative"; data: Initiative }
  | { kind: "capture"; data: Capture };

const ACTION_DIR: Record<TriageAction, { x: number; y: number }> = {
  promote: { x: 0, y: -120 },
  route: { x: 120, y: 0 },
  defer: { x: 0, y: 120 },
};

const ACTION_LABEL: Record<TriageAction, string> = {
  promote: "Promote",
  route: "Route",
  defer: "Defer",
};

const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (action: TriageAction | null) => ({
    opacity: 0,
    x: action ? ACTION_DIR[action].x : 0,
    y: action ? ACTION_DIR[action].y : 0,
    scale: 0.96,
    transition: { duration: 0.24, ease: [0.4, 0, 0.84, 0.4] },
  }),
};

const ACTION_KEY: Record<string, TriageAction> = {
  p: "promote",
  P: "promote",
  r: "route",
  R: "route",
  d: "defer",
  D: "defer",
  ArrowUp: "promote",
  ArrowRight: "route",
  ArrowDown: "defer",
};

export default function TriagePage() {
  const router = useRouter();
  const { triage, hydrated: triageHydrated } = useTriage();
  const { captures, hydrated: capturesHydrated } = useCaptures();
  const { decisions } = useDecisions();

  const triagedIds = useMemo(() => new Set(triage.map((t) => t.initiative_id)), [triage]);
  const decidedIds = useMemo(() => new Set(decisions.map((d) => d.initiative_id)), [decisions]);

  // Snapshot queue once both stores are hydrated. Subsequent triage decisions
  // do NOT re-shuffle the queue mid-flow.
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  useEffect(() => {
    if (!triageHydrated || !capturesHydrated) return;
    if (queue !== null) return;

    const captureItems: QueueItem[] = captures
      .filter((c) => !triagedIds.has(c.id))
      .map((c) => ({ kind: "capture", data: c }));

    const initiativeItems: QueueItem[] = allInitiatives
      .filter(
        (i) =>
          i.status === "needs_decision" &&
          !triagedIds.has(i.id) &&
          !decidedIds.has(i.id),
      )
      .sort(
        (a, b) =>
          (a.priority_rank ?? Number.MAX_SAFE_INTEGER) -
          (b.priority_rank ?? Number.MAX_SAFE_INTEGER),
      )
      .map((i) => ({ kind: "initiative", data: i }));

    setQueue([...captureItems, ...initiativeItems]);
  }, [triageHydrated, capturesHydrated, queue, captures, triagedIds, decidedIds]);

  const [index, setIndex] = useState(0);
  const [lastAction, setLastAction] = useState<TriageAction | null>(null);
  const [tally, setTally] = useState<Record<TriageAction, number>>({
    promote: 0,
    route: 0,
    defer: 0,
  });

  const total = queue?.length ?? 0;
  const current = queue && index < total ? queue[index] : null;
  const done = queue !== null && index >= total;

  const decide = useCallback(
    (action: TriageAction) => {
      if (!current) return;
      const id = current.kind === "initiative" ? current.data.id : current.data.id;
      setTriageAction(id, action);
      playTriageTone(action);
      setLastAction(action);
      setTally((prev) => ({ ...prev, [action]: prev[action] + 1 }));
      setIndex((i) => i + 1);
    },
    [current],
  );

  // Keyboard listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/inbox/");
        return;
      }
      const action = ACTION_KEY[e.key];
      if (action) {
        e.preventDefault();
        decide(action);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, decide, router]);

  /* ─── Empty state ─── */
  if (queue !== null && total === 0) {
    return (
      <EmptyState
        title="Nothing to triage."
        body="Your inbox is empty. Capture an ask with ⌘N or head back to Now."
      />
    );
  }

  /* ─── Done state ─── */
  if (done) {
    const totalDecided = tally.promote + tally.route + tally.defer;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--color-page)" }}
      >
        <Link
          href="/inbox/"
          className="absolute top-6 right-6 text-[12px] inline-flex items-center gap-1 transition"
          style={{ color: "var(--color-tertiary)" }}
        >
          <X size={14} /> Close
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[480px] text-center"
        >
          <div
            className="font-display mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[22px] mb-6"
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            ◆
          </div>
          <h1
            className="font-display text-[32px] leading-tight tracking-tight"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            Inbox cleared.
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "var(--color-secondary)" }}>
            {totalDecided} item{totalDecided === 1 ? "" : "s"} triaged this session
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="Promoted" value={tally.promote} accent />
            <Stat label="Routed" value={tally.route} />
            <Stat label="Deferred" value={tally.defer} />
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/inbox/"
              className="rounded-md px-4 py-2 text-[13px] font-medium transition"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-elevated)",
              }}
            >
              Back to Inbox
            </Link>
            <Link
              href="/"
              className="rounded-md px-4 py-2 text-[13px] font-medium transition"
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-secondary)",
              }}
            >
              Open Now
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Triage flow ─── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-page)" }}
    >
      {/* Top chrome — minimal */}
      <div className="flex items-center justify-between px-6 pt-6">
        <Link
          href="/inbox/"
          aria-label="Exit triage"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] transition hover:bg-card-hover"
          style={{ color: "var(--color-tertiary)" }}
        >
          <X size={14} />
          <span>Exit</span>
          <kbd
            className="ml-1 rounded border px-1.5 py-0.5 font-mono text-[10px]"
            style={{
              borderColor: "var(--color-border-strong)",
              background: "var(--color-elevated)",
              color: "var(--color-tertiary)",
            }}
          >
            Esc
          </kbd>
        </Link>

        <div className="flex items-center gap-2 font-numeric text-[12px]" style={{ color: "var(--color-tertiary)" }}>
          <span style={{ color: "var(--color-primary)" }}>{Math.min(index + 1, total)}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
      </div>

      {/* Card stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-full max-w-[480px]" style={{ minHeight: 360 }}>
          <AnimatePresence mode="wait" custom={lastAction}>
            {current && (
              <motion.div
                key={current.data.id}
                custom={lastAction}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {current.kind === "initiative" ? (
                  <InitiativeCard initiative={current.data} />
                ) : (
                  <CaptureCard capture={current.data} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action row */}
        <div className="mt-10 flex items-center gap-2">
          <ActionButton kind="defer" onClick={() => decide("defer")} />
          <ActionButton kind="route" onClick={() => decide("route")} />
          <ActionButton kind="promote" onClick={() => decide("promote")} />
        </div>

        {/* AI suggestion line */}
        <div className="mt-6 max-w-[440px] text-center min-h-[36px]">
          {current?.kind === "initiative" ? (
            <SuggestionLine action={current.data.ai_recommendation.action === "commit" ? "promote" : current.data.ai_recommendation.action === "escalate" ? "promote" : "defer"} reason={current.data.ai_recommendation.action_reason} />
          ) : (
            <p className="text-[12px]" style={{ color: "var(--color-tertiary)" }}>
              Newly captured — no recommendation yet. You decide.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-6 text-[11px]" style={{ color: "var(--color-muted)" }}>
        <KbdHint k="D" label="Defer" />
        <KbdHint k="R" label="Route" />
        <KbdHint k="P" label="Promote" />
      </div>
    </div>
  );
}

/* ────────────────── Sub-components ────────────────── */

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const minAgo = getMinutesAgo(initiative);
  const source = getSourceLabel(initiative);
  const channel = getChannelLabel(initiative);
  const evidenceQuote = initiative.evidence.find((e) => e.quote)?.quote;
  const arr = initiative.arr_exposure_usd;
  const signalKind = signalToKind(initiative.signal_type);

  return (
    <div className="px-7 pt-6 pb-7">
      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
        <span className="font-numeric">{formatRelative(minAgo)}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>from {source}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>via {channel}</span>
      </div>

      <h2
        className="mt-3 text-[19px] font-semibold leading-snug tracking-tight"
        style={{ color: "var(--color-primary)" }}
      >
        {initiative.title}
      </h2>

      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
        {initiative.synthesis_oneliner}
      </p>

      {evidenceQuote && (
        <blockquote
          className="mt-4 border-l-2 pl-3 text-[13px] italic"
          style={{
            borderColor: "var(--color-border-strong)",
            color: "var(--color-tertiary)",
          }}
        >
          &ldquo;{evidenceQuote}&rdquo;
        </blockquote>
      )}

      <div className="mt-5 flex items-center gap-2">
        <SignalChip kind={signalKind} />
        {arr ? (
          <span className="text-[12px] font-numeric" style={{ color: "var(--color-secondary)" }}>
            ${(arr / 1000).toFixed(0)}k ARR exposure
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CaptureCard({ capture }: { capture: Capture }) {
  const minAgo = Math.max(
    1,
    Math.round((Date.now() - new Date(capture.captured_at).getTime()) / 60000),
  );
  return (
    <div className="px-7 pt-6 pb-7">
      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
        <span className="font-numeric">{formatRelative(minAgo)}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>from {capture.source}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>via {capture.channel}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
          }}
        >
          New
        </span>
      </div>

      <p
        className="mt-4 text-[16px] leading-relaxed"
        style={{ color: "var(--color-primary)" }}
      >
        {capture.text}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <SignalChip kind={signalToKind(capture.signal)} />
      </div>
    </div>
  );
}

function ActionButton({
  kind,
  onClick,
}: {
  kind: TriageAction;
  onClick: () => void;
}) {
  const Icon = kind === "defer" ? ArrowDown : kind === "route" ? ArrowRight : ArrowUp;
  const key = kind === "defer" ? "D" : kind === "route" ? "R" : "P";
  const isPromote = kind === "promote";
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all"
      style={{
        background: isPromote ? "var(--color-accent)" : "var(--color-elevated)",
        color: isPromote ? "var(--color-elevated)" : "var(--color-secondary)",
        border: isPromote ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        boxShadow: isPromote ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      <Icon size={14} />
      <span>{ACTION_LABEL[kind]}</span>
      <kbd
        className="ml-1 rounded px-1 py-0.5 font-mono text-[10px]"
        style={{
          background: isPromote ? "rgba(255,255,255,0.18)" : "var(--color-page)",
          color: isPromote ? "rgba(255,255,255,0.9)" : "var(--color-tertiary)",
        }}
      >
        {key}
      </kbd>
    </button>
  );
}

function SuggestionLine({ action, reason }: { action: TriageAction; reason: string }) {
  return (
    <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
      <span style={{ color: "var(--color-secondary)" }}>System suggests</span>{" "}
      <span className="font-medium" style={{ color: "var(--color-accent)" }}>
        {ACTION_LABEL[action].toLowerCase()}
      </span>{" "}
      — {reason}
    </p>
  );
}

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  const bgVar = `var(--color-chip-${kind}-bg)`;
  const fgVar = `var(--color-chip-${kind}-text)`;
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium"
      style={{ background: bgVar, color: fgVar }}
    >
      {kind}
    </span>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="font-numeric text-[28px] font-medium"
        style={{ color: accent ? "var(--color-accent)" : "var(--color-primary)" }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
        {label}
      </div>
    </div>
  );
}

function KbdHint({ k, label }: { k: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <kbd
        className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
        style={{
          borderColor: "var(--color-border-strong)",
          background: "var(--color-elevated)",
          color: "var(--color-secondary)",
        }}
      >
        {k}
      </kbd>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--color-page)" }}
    >
      <div
        className="font-display flex h-12 w-12 items-center justify-center rounded-full text-[22px] mb-6"
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
        }}
      >
        ◆
      </div>
      <h1
        className="font-display text-[28px] leading-tight tracking-tight"
        style={{ color: "var(--color-primary)", fontWeight: 500 }}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-[400px] text-[14px]" style={{ color: "var(--color-secondary)" }}>
        {body}
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-md px-4 py-2 text-[13px] font-medium transition"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-elevated)",
          }}
        >
          Back to Now
        </Link>
        <Link
          href="/inbox/"
          className="rounded-md px-4 py-2 text-[13px] font-medium transition"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-secondary)",
          }}
        >
          Open Inbox
        </Link>
      </div>
    </div>
  );
}
