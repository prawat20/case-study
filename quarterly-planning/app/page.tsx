"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMemo, useCallback } from "react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { Header } from "@/components/Header";
import { useDecisions } from "@/lib/use-decisions";
import { useTriage, setTriageAction, type TriageAction } from "@/lib/triage";
import { useCaptures, type Capture } from "@/lib/captures";
import { useCommandPalette } from "@/components/CommandProvider";
import { ShortcutKbd } from "@/components/ShortcutKbd";
import { ClusterChip } from "@/components/ClusterChip";
import { playTriageTone } from "@/lib/sound";
import { getScoring } from "@/lib/frameworks";
import {
  NORTH_STAR,
  computeNorthStar,
  formatMetric,
} from "@/lib/strategic";
import {
  formatRelative,
  getChannelLabel,
  getMinutesAgo,
  getSourceLabel,
  signalToKind,
  JUST_LANDED_CUTOFF_MIN,
} from "@/lib/inbox-helpers";
import { useEffect, useState } from "react";

const allInitiatives = initiativesJson as Initiative[];
const VISIBLE_TRIAGE_ROWS = 4;

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
  const queue = untriaged.slice(1, VISIBLE_TRIAGE_ROWS);
  const overflowCount = Math.max(0, triageCount - VISIBLE_TRIAGE_ROWS);
  const freshCount = untriaged.filter((r) => r.minAgo <= JUST_LANDED_CUTOFF_MIN).length;

  const decideTop = useCallback(
    (action: TriageAction) => {
      if (!top) return;
      setTriageAction(top.data.id, action);
      playTriageTone(action);
    },
    [top],
  );

  // Keyboard shortcuts — act on the top card directly. Ignore when typing in an
  // input/textarea or when the command palette is open.
  useEffect(() => {
    if (!top) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "p" || e.key === "ArrowRight") {
        e.preventDefault();
        decideTop("promote");
      } else if (k === "d" || e.key === "ArrowLeft") {
        e.preventDefault();
        decideTop("defer");
      } else if (k === "r" || e.key === "ArrowUp") {
        e.preventDefault();
        decideTop("route");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [top, decideTop]);

  /* Promoted but not yet placed — feeds the Calendar handoff */
  const promotedItems = useMemo(
    () =>
      allInitiatives.filter((i) => {
        const t = triage.find((x) => x.initiative_id === i.id);
        return t?.action === "promote" && !decidedIds.has(i.id);
      }),
    [triage, decidedIds],
  );

  /* Predictions due — single demo entry that's always seeded */
  const predictionsDue: number = 1;

  const hydrated = decisionsHydrated && triageHydrated && capturesHydrated;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
        {/* Top row — date + capture affordance */}
        <div className="flex items-start justify-between gap-4">
          <DateEyebrow />
          <CaptureButton onClick={openCapture} />
        </div>

        <NSMHero />

        <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
          <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>67%</span>
          <span>of items decided same day they land · quarter to date</span>
        </div>

        {/* ─────────── To triage ─────────── */}
        <SectionEyebrow
          label="To triage"
          count={triageCount}
          fresh={freshCount}
          hydrated={hydrated}
        />

        {hydrated && triageCount === 0 ? (
          <EmptyState
            message="Nothing waiting on you."
            sub={
              <>
                Capture an ask with{" "}
                <ShortcutKbd letter="N" />
                {" "}when one lands.
              </>
            }
          />
        ) : (
          <div className="mt-4">
            {/* Top card — act on the next item directly */}
            <AnimatePresence mode="wait">
              {top && (
                <InlineTriageCard
                  key={top.data.id}
                  row={top}
                  onDecide={decideTop}
                />
              )}
            </AnimatePresence>

            {/* Queue — remaining items as compact rows */}
            {queue.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="eyebrow" style={{ color: "var(--color-tertiary)" }}>
                  Next up
                </p>
                {queue.map((row, idx) => (
                  <QueueRow key={row.data.id} row={row} index={idx} />
                ))}
                {overflowCount > 0 && (
                  <p className="pl-7 pt-1 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
                    + {overflowCount} more
                  </p>
                )}
              </div>
            )}

            {/* Secondary path — full swipe deck for bulk triage */}
            <div className="mt-5">
              <Link
                href="/inbox/triage/"
                className="inline-flex items-center gap-1 text-[12px] transition hover:underline"
                style={{ color: "var(--color-tertiary)" }}
              >
                Bulk triage
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

        {/* ─────────── Ready to place ─────────── */}
        {hydrated && promotedItems.length > 0 && (
          <>
            <SectionEyebrow label="Ready to place" count={promotedItems.length} fresh={0} hydrated />
            <div className="mt-4 space-y-1">
              {promotedItems.slice(0, 4).map((i, idx) => (
                <PromotedRow key={i.id} initiative={i} index={idx} />
              ))}
              {promotedItems.length > 4 && (
                <p className="pl-7 pt-1 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
                  + {promotedItems.length - 4} more promoted
                </p>
              )}
              <div className="mt-5">
                <Link
                  href="/calendar/"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition"
                  style={{
                    background: "var(--color-elevated)",
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  Open Calendar
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ─────────── Predictions due ─────────── */}
        {hydrated && predictionsDue > 0 && (
          <>
            <SectionEyebrow label="Predictions due" count={predictionsDue} fresh={0} hydrated />
            <div className="mt-4">
              <Link
                href="/audit/#predictions"
                className="group flex items-center justify-between rounded-lg px-4 py-3 transition hover:bg-[var(--color-card-hover)]"
                style={{ background: "transparent" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="inline-flex h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "var(--color-warning)" }}
                  />
                  <p className="text-[14px]" style={{ color: "var(--color-primary)" }}>
                    "SAML unlocks 3 deals" — 21 days old
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[12.5px] shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--color-tertiary)" }}
                >
                  Review
                  <ArrowRight size={12} />
                </span>
              </Link>
            </div>
          </>
        )}

        <div className="mt-20 flex items-center gap-2 text-[11px]" style={{ color: "var(--color-tertiary)" }}>
          <span aria-hidden style={{ color: "var(--color-accent)" }}>◆</span>
          <span>Sift · case study build</span>
        </div>
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
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        color: "var(--color-secondary)",
      }}
      aria-label="Capture an ask"
    >
      <Plus size={13} />
      <span>Capture</span>
      <ShortcutKbd letter="N" subtle />
    </button>
  );
}

function NSMHero() {
  const ns = computeNorthStar(NORTH_STAR);
  const trendCopy =
    ns.trend === "behind"
      ? `${Math.abs(ns.pace_gap_pp)}pp behind pace`
      : ns.trend === "ahead"
        ? `${ns.pace_gap_pp}pp ahead of pace`
        : "On pace";
  const trendColor =
    ns.trend === "behind"
      ? "var(--color-warning)"
      : ns.trend === "ahead"
        ? "var(--color-accent)"
        : "var(--color-secondary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3"
    >
      <p className="eyebrow mb-3" style={{ color: "var(--color-tertiary)" }}>
        North Star · {NORTH_STAR.period}
      </p>

      <div className="flex items-baseline gap-3">
        <span
          className="font-display"
          style={{
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            fontWeight: 500,
            color: "var(--color-primary)",
          }}
        >
          {formatMetric(NORTH_STAR.current_value, NORTH_STAR.format)}
        </span>
        <span
          className="font-display"
          style={{
            fontSize: 22,
            lineHeight: 1.1,
            fontWeight: 400,
            color: "var(--color-tertiary)",
          }}
        >
          of {formatMetric(NORTH_STAR.target_value, NORTH_STAR.format)}
        </span>
      </div>

      <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--color-secondary)" }}>
        {NORTH_STAR.metric}
      </p>

      <div className="mt-5 max-w-[480px]">
        <ProgressBar achieved={ns.achieved_pct} elapsed={ns.elapsed_pct} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-[12.5px]">
        <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
          {ns.achieved_pct}% achieved
        </span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
          {ns.elapsed_pct}% elapsed
        </span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span className="font-medium" style={{ color: trendColor }}>
          {trendCopy}
        </span>
      </div>
    </motion.div>
  );
}

function ProgressBar({ achieved, elapsed }: { achieved: number; elapsed: number }) {
  return (
    <div className="relative">
      <div
        className="h-1.5 rounded-full"
        style={{ background: "var(--color-border)" }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${achieved}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute top-0 left-0 h-1.5 rounded-full"
        style={{ background: "var(--color-accent)" }}
      />
      <motion.div
        initial={{ left: 0, opacity: 0 }}
        animate={{ left: `${elapsed}%`, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="absolute -top-1 h-3.5 w-0.5"
        style={{ background: "var(--color-secondary)" }}
        aria-label={`Time elapsed marker at ${elapsed}%`}
      />
    </div>
  );
}

function SectionEyebrow({
  label,
  count,
  fresh,
  hydrated,
}: {
  label: string;
  count: number;
  fresh: number;
  hydrated: boolean;
}) {
  return (
    <div className="mt-12 flex items-baseline gap-2">
      <p className="eyebrow">{label}</p>
      {hydrated && count > 0 && (
        <>
          <span className="font-numeric text-[11px]" style={{ color: "var(--color-tertiary)" }}>
            {count}
          </span>
          {fresh > 0 && (
            <span
              className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
              }}
            >
              {fresh} new
            </span>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Inline Triage Card (top of "To triage") ─── */

function InlineTriageCard({
  row,
  onDecide,
}: {
  row: Row;
  onDecide: (action: TriageAction) => void;
}) {
  const isInitiative = row.kind === "initiative";
  const meta = isInitiative
    ? {
        time: formatRelative(row.minAgo),
        source: getSourceLabel(row.data),
        channel: getChannelLabel(row.data),
      }
    : {
        time: formatRelative(row.minAgo),
        source: row.data.source,
        channel: row.data.channel,
      };
  const title = isInitiative ? row.data.title : row.data.text;
  const signalKind = signalToKind(
    isInitiative ? row.data.signal_type : row.data.signal,
  );
  const arr = isInitiative ? row.data.arr_exposure_usd : undefined;
  const predicted = isInitiative ? row.data.ai_recommendation.predicted_outcome : null;
  const score = isInitiative
    ? getScoring(row.data.ai_recommendation.framework, row.data)
    : null;
  const clusterSources = isInitiative ? row.data.cluster_sources : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Meta */}
        <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
          <span className="font-numeric">{meta.time}</span>
          <span style={{ color: "var(--color-muted)" }}>·</span>
          <span>{meta.source}</span>
          <span style={{ color: "var(--color-muted)" }}>·</span>
          <span>{meta.channel}</span>
          {row.kind === "capture" && (
            <span
              className="ml-1 rounded px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
              }}
            >
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="mt-2.5 text-[17px] leading-snug tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {title}
        </h3>

        {/* Chips row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
          <SignalChip kind={signalKind} />
          {arr ? (
            <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
              ${(arr / 1000).toFixed(0)}k ARR
            </span>
          ) : null}
          {score && (
            <>
              <span style={{ color: "var(--color-muted)" }}>·</span>
              <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>
                {score.total.label} {score.total.value}
              </span>
            </>
          )}
          {clusterSources && clusterSources.length >= 2 && (
            <ClusterChip sources={clusterSources} size="sm" />
          )}
        </div>

        {/* Predicted outcome */}
        {predicted && (
          <div
            className="mt-3 flex items-start gap-2 rounded-md px-3 py-2"
            style={{ background: "var(--color-accent-soft)" }}
          >
            <Sparkles size={11} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
            <span className="text-[12.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
              <span style={{ color: "var(--color-tertiary)" }}>If we ship —</span>{" "}
              <span style={{ color: "var(--color-primary)" }}>{predicted}</span>
            </span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div
        className="flex items-center justify-between gap-2 border-t px-4 py-3"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface-sunken)" }}
      >
        <div className="flex items-center gap-2">
          <ActionPill kind="defer" onClick={() => onDecide("defer")} />
          <ActionPill kind="route" onClick={() => onDecide("route")} />
          <ActionPill kind="promote" onClick={() => onDecide("promote")} />
        </div>
        <Link
          href={isInitiative ? `/initiative/${row.data.id}/` : "/inbox/triage/"}
          className="text-[11.5px] transition hover:underline"
          style={{ color: "var(--color-tertiary)" }}
        >
          Why this →
        </Link>
      </div>
    </motion.div>
  );
}

function ActionPill({ kind, onClick }: { kind: TriageAction; onClick: () => void }) {
  const isPromote = kind === "promote";
  const isDefer = kind === "defer";
  const Icon = isPromote ? ArrowRight : isDefer ? ArrowLeft : ArrowUpRight;
  const key = isPromote ? "P" : isDefer ? "D" : "R";
  const label = isPromote ? "Promote" : isDefer ? "Defer" : "Route";
  const tone = isPromote
    ? "var(--color-success)"
    : isDefer
      ? "var(--color-danger)"
      : "var(--color-tertiary)";

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="group inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition hover:bg-[var(--color-card-hover)]"
      style={{
        background: "var(--color-elevated)",
        border: `1px solid ${tone}`,
        color: tone,
      }}
    >
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

/* ─── Queue row (compact, below the top card) ─── */

function QueueRow({ row, index }: { row: Row; index: number }) {
  const sourceLabel = row.kind === "initiative" ? getSourceLabel(row.data) : row.data.source;
  const title = row.kind === "initiative" ? row.data.title : row.data.text;
  const signalKind = signalToKind(
    row.kind === "initiative" ? row.data.signal_type : row.data.signal,
  );
  const fresh = row.minAgo <= JUST_LANDED_CUTOFF_MIN;
  const clusterCount =
    row.kind === "initiative" ? row.data.cluster_sources?.length ?? 0 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/inbox/triage/"
        className="group flex items-center gap-3 rounded-md px-3 py-2 transition hover:bg-[var(--color-card-hover)]"
      >
        <span
          className="inline-flex h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: fresh ? "var(--color-accent)" : "var(--color-muted)" }}
        />
        <p className="flex-1 min-w-0 truncate text-[13px]" style={{ color: "var(--color-secondary)" }}>
          {title}
        </p>
        {clusterCount >= 2 && (
          <span
            className="hidden sm:inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium shrink-0"
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
            title={`Merged from ${clusterCount} sources`}
          >
            ⊕{clusterCount}
          </span>
        )}
        <SignalChip kind={signalKind} />
        <span className="text-[11px] font-numeric shrink-0" style={{ color: "var(--color-tertiary)" }}>
          {formatRelative(row.minAgo)}
        </span>
        <span className="hidden sm:inline text-[11px] shrink-0" style={{ color: "var(--color-muted)" }}>
          {sourceLabel}
        </span>
      </Link>
    </motion.div>
  );
}

function PromotedRow({ initiative, index }: { initiative: Initiative; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/initiative/${initiative.id}/`}
        className="group flex items-center justify-between rounded-lg px-4 py-2.5 transition hover:bg-[var(--color-card-hover)]"
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: "var(--color-accent)" }}
          />
          <p
            className="text-[14px] truncate"
            style={{ color: "var(--color-primary)" }}
          >
            {initiative.title}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[12.5px] shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--color-accent)" }}
        >
          Place
          <ArrowRight size={12} />
        </span>
      </Link>
    </motion.div>
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
      className="mt-6 rounded-xl p-8 text-center"
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

