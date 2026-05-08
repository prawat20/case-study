"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { Header } from "@/components/Header";
import { useDecisions } from "@/lib/use-decisions";
import {
  NORTH_STAR,
  computeNorthStar,
  formatMetric,
} from "@/lib/strategic";
import { useEffect, useState } from "react";

const allInitiatives = initiativesJson as Initiative[];

export default function NowPage() {
  const { decisions, hydrated } = useDecisions();
  const decidedIds = new Set(decisions.map((d) => d.initiative_id));

  const inboxCount = allInitiatives.filter(
    (i) => i.status === "needs_decision" && !decidedIds.has(i.id),
  ).length;

  // Demo placeholders — these become real data when Calendar + Audit ship
  const overnightShifts: number = 2;
  const sprintItemsInFlight: number = 4;
  const sprintCapacity: number = 87;
  const sprintRiskCount: number = 1;
  const predictionsDue: number = 1;

  // Leading indicator — "% same-day decided" — fixed for demo
  const sameDayDecisionPct = 67;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-6 pt-10 pb-24">
        <DateEyebrow />

        <NSMHero />

        <div className="mt-3 flex items-center gap-2 text-[12px]" style={{ color: "var(--color-tertiary)" }}>
          <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>{sameDayDecisionPct}%</span>
          <span>of items decided same day they land</span>
        </div>

        <div className="mt-12">
          <p className="eyebrow">Today</p>
          <div className="mt-4 space-y-4">
            <DoTodayCard
              index={0}
              href="/inbox/"
              primary={
                inboxCount === 0
                  ? "Inbox is clear"
                  : `${inboxCount} ${inboxCount === 1 ? "item" : "items"} waiting in your inbox`
              }
              secondary={
                overnightShifts > 0
                  ? `${overnightShifts} shifted priority overnight`
                  : "Nothing changed overnight"
              }
              cta={inboxCount === 0 ? "Open inbox" : "Triage"}
              accent={inboxCount > 0}
              hydrated={hydrated}
            />

            <DoTodayCard
              index={1}
              href="/quarter/"
              primary={`Sprint 2 of Q3, ${sprintItemsInFlight} items in flight`}
              secondary={`Capacity ${sprintCapacity}% · ${sprintRiskCount === 0 ? "No risks flagged" : `${sprintRiskCount} risk on track`}`}
              cta="Open plan"
              accent={false}
              hydrated={hydrated}
            />

            <DoTodayCard
              index={2}
              href="/audit/"
              primary={
                predictionsDue === 0
                  ? "No predictions due"
                  : `${predictionsDue} prediction${predictionsDue === 1 ? "" : "s"} due for review`
              }
              secondary={
                predictionsDue === 0
                  ? "All recent predictions still in window"
                  : `"SAML unlocks 3 deals" — 3 weeks old`
              }
              cta={predictionsDue === 0 ? "Open audit" : "Review"}
              accent={false}
              hydrated={hydrated}
            />
          </div>
        </div>

        <div className="mt-20 flex items-center gap-2 text-[11px]" style={{ color: "var(--color-tertiary)" }}>
          <span aria-hidden style={{ color: "var(--color-accent)" }}>◆</span>
          <span>Glide · case study build</span>
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
      {/* Track */}
      <div
        className="h-1.5 rounded-full"
        style={{ background: "var(--color-border)" }}
      />
      {/* Achieved fill */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${achieved}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute top-0 left-0 h-1.5 rounded-full"
        style={{ background: "var(--color-accent)" }}
      />
      {/* Elapsed marker */}
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

function DoTodayCard({
  index,
  href,
  primary,
  secondary,
  cta,
  accent,
  hydrated,
}: {
  index: number;
  href: string;
  primary: string;
  secondary: string;
  cta: string;
  accent: boolean;
  hydrated: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: hydrated ? 1 : 0, y: hydrated ? 0 : 8 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.06 }}
    >
      <Link
        href={href}
        className="group flex items-center justify-between rounded-xl px-6 py-5 transition-all"
        style={{
          background: "var(--color-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span
            aria-hidden
            className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: accent ? "var(--color-accent-soft)" : "var(--color-surface-sunken)",
              color: accent ? "var(--color-accent)" : "var(--color-tertiary)",
            }}
          >
            <span className="font-numeric text-[12px] font-semibold">
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
          <div className="min-w-0">
            <p
              className="text-[14.5px] font-medium truncate"
              style={{ color: "var(--color-primary)" }}
            >
              {primary}
            </p>
            <p className="mt-0.5 text-[13px] truncate" style={{ color: "var(--color-tertiary)" }}>
              {secondary}
            </p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[13px] font-medium shrink-0 transition-colors"
          style={{ color: accent ? "var(--color-accent)" : "var(--color-secondary)" }}
        >
          {cta}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
