"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  ArrowUpRight,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
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
import { getScoring } from "@/lib/frameworks";
import { useIsMac } from "@/lib/platform";
import { ClusterChip } from "@/components/ClusterChip";

const allInitiatives = initiativesJson as Initiative[];

type QueueItem =
  | { kind: "initiative"; data: Initiative }
  | { kind: "capture"; data: Capture };

const ACTION_LABEL: Record<TriageAction, string> = {
  promote: "Promote",
  route: "Route",
  defer: "Defer",
};

const SWIPE_THRESHOLD = 110;

const cardExitVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (action: TriageAction | null) => {
    if (action === "promote")
      return { opacity: 0, x: 600, rotate: 18, transition: { duration: 0.28, ease: [0.4, 0, 0.84, 0.4] } };
    if (action === "defer")
      return { opacity: 0, x: -600, rotate: -18, transition: { duration: 0.28, ease: [0.4, 0, 0.84, 0.4] } };
    if (action === "route")
      return { opacity: 0, y: -600, rotate: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.84, 0.4] } };
    return { opacity: 0, y: 24, transition: { duration: 0.18 } };
  },
};

export default function TriagePage() {
  const router = useRouter();
  const { triage, hydrated: triageHydrated } = useTriage();
  const { captures, hydrated: capturesHydrated } = useCaptures();
  const { decisions } = useDecisions();

  const triagedIds = useMemo(() => new Set(triage.map((t) => t.initiative_id)), [triage]);
  const decidedIds = useMemo(() => new Set(decisions.map((d) => d.initiative_id)), [decisions]);

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
  const [expanded, setExpanded] = useState(false);

  const total = queue?.length ?? 0;
  const current = queue && index < total ? queue[index] : null;
  const done = queue !== null && index >= total;

  // Reset expansion when card changes
  useEffect(() => {
    setExpanded(false);
  }, [index]);

  const decide = useCallback(
    (action: TriageAction) => {
      if (!current) return;
      const id = current.data.id;
      setTriageAction(id, action);
      playTriageTone(action);
      setLastAction(action);
      setTally((prev) => ({ ...prev, [action]: prev[action] + 1 }));
      setIndex((i) => i + 1);
    },
    [current],
  );

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === "Escape") {
        e.preventDefault();
        router.push("/inbox/");
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setExpanded((v) => !v);
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "p" || e.key === "ArrowRight") {
        e.preventDefault();
        decide("promote");
      } else if (k === "d" || e.key === "ArrowLeft") {
        e.preventDefault();
        decide("defer");
      } else if (k === "r" || e.key === "ArrowUp") {
        e.preventDefault();
        decide("route");
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
        body={<>Your inbox is empty. Capture an ask with <KbdInline letter="N" /> or head back to Now.</>}
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
            {totalDecided} item{totalDecided === 1 ? "" : "s"} triaged
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="Promoted" value={tally.promote} accent />
            <Stat label="Routed" value={tally.route} />
            <Stat label="Deferred" value={tally.defer} />
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {tally.promote > 0 ? (
              <>
                <Link
                  href="/calendar/"
                  className="rounded-md px-4 py-2 text-[13px] font-medium transition"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-elevated)",
                  }}
                >
                  Place {tally.promote} in calendar →
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
                  Back to Now
                </Link>
              </>
            ) : (
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
            )}
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
      {/* Top chrome */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="relative w-full max-w-[520px]">
          {/* Next card peeking from below — sits behind the active card */}
          {queue && index + 1 < total && (
            <div
              className="absolute inset-x-0 -bottom-2 mx-auto rounded-2xl"
              style={{
                height: 16,
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                opacity: 0.4,
                transform: "scale(0.96)",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
          )}

          <AnimatePresence mode="wait" custom={lastAction}>
            {current && (
              <SwipeCard
                key={current.data.id}
                item={current}
                expanded={expanded}
                onToggleExpand={() => setExpanded((v) => !v)}
                onDecide={decide}
                lastAction={lastAction}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons — sit right under the card */}
        <p
          className="mt-5 text-center text-[9.5px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--color-tertiary)" }}
        >
          Sort
          <span className="ml-1 normal-case font-normal tracking-normal" style={{ color: "var(--color-muted)" }}>
            · triage step; deeper Decide happens on the initiative page
          </span>
        </p>
        <div className="mt-2 flex items-center gap-3">
          <ActionButton kind="defer" onClick={() => decide("defer")} />
          <ActionButton kind="route" onClick={() => decide("route")} />
          <ActionButton kind="promote" onClick={() => decide("promote")} />
        </div>

        <p
          className="mt-3 text-[10.5px] text-center"
          style={{ color: "var(--color-muted)" }}
        >
          Swipe, click, or use keys
        </p>
      </div>
    </div>
  );
}

/* ─────────── Swipe Card ─────────── */

function SwipeCard({
  item,
  expanded,
  onToggleExpand,
  onDecide,
  lastAction,
}: {
  item: QueueItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onDecide: (action: TriageAction) => void;
  lastAction: TriageAction | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-14, 0, 14]);
  const promoteOpacity = useTransform(x, [40, 200], [0, 1]);
  const deferOpacity = useTransform(x, [-200, -40], [1, 0]);
  const acceptTint = useTransform(x, [40, 200], [0, 0.18]);
  const declineTint = useTransform(x, [-200, -40], [0.18, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 600) {
      onDecide("promote");
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -600) {
      onDecide("defer");
    } else {
      // Snap back via animation
      x.set(0);
    }
  }

  return (
    <motion.div
      key={item.data.id}
      custom={lastAction}
      variants={cardExitVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.32}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      whileTap={{ cursor: "grabbing" }}
      className="relative rounded-2xl overflow-hidden"
    >
      <div
        className="rounded-2xl"
        style={{
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
          cursor: "grab",
        }}
      >
        {/* Tint overlays */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: "var(--color-success)", opacity: acceptTint }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: "var(--color-danger)", opacity: declineTint }}
        />

        {/* Direction labels */}
        <motion.div
          className="absolute top-6 left-6 pointer-events-none"
          style={{ opacity: deferOpacity }}
        >
          <div
            className="rounded-md border-2 px-2 py-1 text-[14px] font-bold uppercase tracking-wider"
            style={{
              borderColor: "var(--color-danger)",
              color: "var(--color-danger)",
              transform: "rotate(-12deg)",
            }}
          >
            Defer
          </div>
        </motion.div>
        <motion.div
          className="absolute top-6 right-6 pointer-events-none"
          style={{ opacity: promoteOpacity }}
        >
          <div
            className="rounded-md border-2 px-2 py-1 text-[14px] font-bold uppercase tracking-wider"
            style={{
              borderColor: "var(--color-success)",
              color: "var(--color-success)",
              transform: "rotate(12deg)",
            }}
          >
            Promote
          </div>
        </motion.div>

        {/* Card body */}
        <div className="relative px-7 pt-6 pb-5">
          {item.kind === "initiative" ? (
            <InitiativeFront initiative={item.data} />
          ) : (
            <CaptureFront capture={item.data} />
          )}

          {/* Expand/collapse toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium transition hover:bg-card-hover"
            style={{ color: "var(--color-tertiary)" }}
            aria-expanded={expanded}
          >
            <ChevronDown
              size={13}
              style={{
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
            <span>{expanded ? "Hide detail" : "Why this"}</span>
            <kbd
              className="ml-1 rounded border px-1 py-0.5 font-mono text-[10px]"
              style={{
                borderColor: "var(--color-border-strong)",
                background: "var(--color-page)",
                color: "var(--color-tertiary)",
              }}
            >
              Space
            </kbd>
          </button>

          <AnimatePresence initial={false}>
            {expanded && item.kind === "initiative" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ExpandedDetail initiative={item.data} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Card content ─────────── */

function InitiativeFront({ initiative }: { initiative: Initiative }) {
  const minAgo = getMinutesAgo(initiative);
  const source = getSourceLabel(initiative);
  const channel = getChannelLabel(initiative);
  const evidenceQuote = initiative.evidence.find((e) => e.quote)?.quote;
  const arr = initiative.arr_exposure_usd;
  const signalKind = signalToKind(initiative.signal_type);
  const score = getScoring(initiative.ai_recommendation.framework, initiative);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
          <span className="font-numeric">{formatRelative(minAgo)}</span>
          <span style={{ color: "var(--color-muted)" }}>·</span>
          <span>{source}</span>
          <span style={{ color: "var(--color-muted)" }}>·</span>
          <span>{channel}</span>
        </div>
      </div>

      <h2
        className="mt-3 text-[20px] font-semibold leading-snug tracking-tight"
        style={{ color: "var(--color-primary)" }}
      >
        {initiative.title}
      </h2>

      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
        {initiative.synthesis_oneliner}
      </p>

      {evidenceQuote && (
        <blockquote
          className="mt-3 border-l-2 pl-3 text-[12.5px] italic leading-relaxed"
          style={{
            borderColor: "var(--color-border-strong)",
            color: "var(--color-tertiary)",
          }}
        >
          &ldquo;{evidenceQuote}&rdquo;
        </blockquote>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SignalChip kind={signalKind} />
        {arr ? (
          <span className="font-numeric text-[12px]" style={{ color: "var(--color-secondary)" }}>
            ${(arr / 1000).toFixed(0)}k ARR
          </span>
        ) : null}
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span className="font-numeric text-[12px]" style={{ color: "var(--color-secondary)" }}>
          {score.total.label} {score.total.value}
        </span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span className="text-[12px]" style={{ color: "var(--color-tertiary)" }}>
          {initiative.ai_recommendation.effort_sprints} sprint
          {initiative.ai_recommendation.effort_sprints > 1 ? "s" : ""}
        </span>
        {initiative.cluster_sources && initiative.cluster_sources.length >= 2 && (
          <ClusterChip sources={initiative.cluster_sources} size="md" />
        )}
      </div>

      <div
        className="mt-4 flex items-start gap-2 rounded-md px-3 py-2"
        style={{ background: "var(--color-accent-soft)" }}
      >
        <Sparkles size={11} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
        <span className="text-[12px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
          <span style={{ color: "var(--color-tertiary)" }}>If we ship —</span>{" "}
          <span style={{ color: "var(--color-primary)" }}>{initiative.ai_recommendation.predicted_outcome}</span>
        </span>
      </div>
    </div>
  );
}

function CaptureFront({ capture }: { capture: Capture }) {
  const minAgo = Math.max(
    1,
    Math.round((Date.now() - new Date(capture.captured_at).getTime()) / 60000),
  );
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
        <span className="font-numeric">{formatRelative(minAgo)}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>{capture.source}</span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span>{capture.channel}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
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

      <div className="mt-4 flex items-center gap-2">
        <SignalChip kind={signalToKind(capture.signal)} />
        <span className="text-[12px]" style={{ color: "var(--color-tertiary)" }}>
          Newly captured — no AI scoring yet. You decide.
        </span>
      </div>
    </div>
  );
}

function ExpandedDetail({ initiative }: { initiative: Initiative }) {
  const score = getScoring(initiative.ai_recommendation.framework, initiative);
  const rec = initiative.ai_recommendation;
  return (
    <div className="mt-3 space-y-4">
      <div
        className="rounded-md px-3 py-2.5"
        style={{ background: "var(--color-page)" }}
      >
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--color-tertiary)" }}
        >
          Score · {score.framework}
        </p>
        <div
          className="mt-2 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${score.rows.length + 1}, minmax(0, 1fr))` }}
        >
          {score.rows.map((r, idx) => (
            <div key={idx}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                {r.label}
              </p>
              <p className="font-numeric text-[13px]" style={{ color: "var(--color-secondary)", fontWeight: 500 }}>
                {r.value}
              </p>
            </div>
          ))}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              {score.total.label}
            </p>
            <p
              className="font-numeric text-[13px]"
              style={{ color: "var(--color-accent)", fontWeight: 600 }}
            >
              {score.total.value}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11.5px] italic" style={{ color: "var(--color-tertiary)" }}>
          {score.rationale}
        </p>
      </div>

      <div>
        <p
          className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--color-tertiary)" }}
        >
          AI reasoning
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
          {rec.action_reason}
        </p>
        {rec.okr_contribution && (
          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
            {rec.okr_contribution}
          </p>
        )}
      </div>

      {rec.conflicts.length > 0 && (
        <div>
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--color-warning)" }}
          >
            Conflicts to surface
          </p>
          <ul className="mt-1 space-y-1">
            {rec.conflicts.map((c, idx) => (
              <li
                key={idx}
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--color-secondary)" }}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rec.tradeoffs.length > 0 && (
        <div>
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--color-tertiary)" }}
          >
            Trade-offs
          </p>
          <ul className="mt-1 space-y-1">
            {rec.tradeoffs.map((t, idx) => (
              <li
                key={idx}
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--color-secondary)" }}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────── Action buttons (small, secondary) ─────────── */

const ACTION_INTENT: Record<TriageAction, string> = {
  defer: "not this quarter",
  route: "someone else owns this",
  promote: "needs my decision",
};

function ActionButton({ kind, onClick }: { kind: TriageAction; onClick: () => void }) {
  const Icon = kind === "defer" ? ArrowLeft : kind === "route" ? ArrowUpRight : ArrowRightIcon;
  const key = kind === "defer" ? "←" : kind === "route" ? "R" : "→";
  const isPromote = kind === "promote";
  const isDefer = kind === "defer";

  const tone = isPromote
    ? "var(--color-success)"
    : isDefer
      ? "var(--color-danger)"
      : "var(--color-tertiary)";

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        aria-label={`${ACTION_LABEL[kind]} — ${ACTION_INTENT[kind]}`}
        className="group flex h-11 w-11 items-center justify-center rounded-full transition-all"
        style={{
          background: "var(--color-elevated)",
          border: `1px solid ${tone}`,
          color: tone,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Icon size={16} />
      </button>
      <p className="text-[10px] font-medium" style={{ color: "var(--color-tertiary)" }}>
        {ACTION_LABEL[kind]}
      </p>
      <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
        {key}
      </p>
    </div>
  );
}

/* ─────────── Misc ─────────── */

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium"
      style={{
        background: `var(--color-chip-${kind}-bg)`,
        color: `var(--color-chip-${kind}-text)`,
      }}
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

function KbdInline({ letter }: { letter: string }) {
  const isMac = useIsMac();
  return (
    <kbd
      suppressHydrationWarning
      className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
      style={{
        borderColor: "var(--color-border-strong)",
        background: "var(--color-page)",
        color: "var(--color-tertiary)",
      }}
    >
      {isMac ? `⌘${letter}` : `Ctrl+${letter}`}
    </kbd>
  );
}

function EmptyState({ title, body }: { title: string; body: React.ReactNode }) {
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
