"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Lock, AlertTriangle, ArrowRight, Inbox as InboxIcon, MoonStar } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import {
  SPRINTS,
  SPRINT_CAPACITY,
  effortPoints,
  parseSequenceToSprint,
} from "@/lib/sprint-data";
import { signalToKind } from "@/lib/inbox-helpers";
import { useDecisions } from "@/lib/use-decisions";
import { useTriage } from "@/lib/triage";
import { addDecision } from "@/lib/decisions";
import { playCommitChime, playDeferTick, playSnapChime } from "@/lib/sound";
import {
  useCalendarState,
  saveAssignments,
  saveLocked,
  setSingleAssignment,
} from "@/lib/calendar-state";
import { computeCommitImpact } from "@/lib/sprint-conflict";
import { getScoring } from "@/lib/frameworks";

const allInitiatives = initiativesJson as Initiative[];

type Placement =
  | { kind: "rail" }
  | { kind: "sprint"; index: number; soft: boolean }
  | { kind: "deferred" }
  | { kind: "hidden" };

type DragSource =
  | { kind: "rail"; id: string }
  | { kind: "sprint"; id: string; from: number }
  | { kind: "deferred"; id: string };

export function CalendarPlan() {
  const { assignments, locked } = useCalendarState();
  const { decisions } = useDecisions();
  const { triage } = useTriage();

  const [hovered, setHovered] = useState<number | "defer" | null>(null);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [snapPulse, setSnapPulse] = useState(false);

  const triageMap = useMemo(() => {
    const m = new Map<string, "promote" | "route" | "defer">();
    triage.forEach((t) => m.set(t.initiative_id, t.action));
    return m;
  }, [triage]);

  const decidedMap = useMemo(() => {
    const m = new Map<string, "committed" | "deferred" | "escalated" | "overridden">();
    decisions.forEach((d) => m.set(d.initiative_id, d.action));
    return m;
  }, [decisions]);

  function placementOf(i: Initiative): Placement {
    const decided = decidedMap.get(i.id);
    if (decided === "deferred") return { kind: "deferred" };
    if (decided === "committed" || decided === "overridden") {
      const idx = assignments[i.id] ?? parseSequenceToSprint(i.ai_recommendation.sequence);
      return { kind: "sprint", index: idx, soft: false };
    }
    const triaged = triageMap.get(i.id);
    if (triaged === "defer") return { kind: "deferred" };
    if (triaged === "route") return { kind: "hidden" };
    if (triaged === "promote") return { kind: "rail" };
    // Default — soft-placed at AI's sequence (or override)
    const idx = assignments[i.id] ?? parseSequenceToSprint(i.ai_recommendation.sequence);
    return { kind: "sprint", index: idx, soft: true };
  }

  const railItems = allInitiatives.filter((i) => placementOf(i).kind === "rail");
  const deferredItems = allInitiatives.filter((i) => placementOf(i).kind === "deferred");

  const itemsBySprint: Record<number, Initiative[]> = useMemo(() => {
    const map: Record<number, Initiative[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const i of allInitiatives) {
      const p = placementOf(i);
      if (p.kind === "sprint") {
        map[p.index] = map[p.index] ?? [];
        map[p.index].push(i);
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, decisions, triage]);

  const sprintLoad = (idx: number) =>
    (itemsBySprint[idx] ?? []).reduce((acc, i) => acc + effortPoints(i), 0);

  const anyOverflow = SPRINTS.some((s) => sprintLoad(s.index) > SPRINT_CAPACITY);
  const railEmpty = railItems.length === 0;
  const canSnap = railEmpty && !anyOverflow && !locked;

  /* ─────────── Drag handlers ─────────── */

  function dragStart(source: DragSource, e: React.DragEvent) {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", source.id);
    setDragSource(source);
  }

  function dragEnd() {
    setDragSource(null);
    setHovered(null);
  }

  function sprintDragOver(e: React.DragEvent, sprintIndex: number) {
    if (locked || !dragSource) return;
    e.preventDefault();
    setHovered(sprintIndex);
  }

  function deferDragOver(e: React.DragEvent) {
    if (locked || !dragSource) return;
    e.preventDefault();
    setHovered("defer");
  }

  function dropOnSprint(e: React.DragEvent, targetSprint: number) {
    if (locked || !dragSource) return;
    e.preventDefault();
    setHovered(null);
    const src = dragSource;
    setDragSource(null);

    const item = allInitiatives.find((i) => i.id === src.id);
    if (!item) return;

    if (src.kind === "sprint" && src.from === targetSprint) return;

    // Compute impact before placing — auto-reflow if needed
    const impact = computeCommitImpact({
      initiative: item,
      allInitiatives,
      decisions,
      assignments: {
        ...assignments,
        // For an item being dragged from one sprint to another, drop its
        // current binding so impact computes against its new target only.
        [item.id]: targetSprint,
      },
    });

    // For drag-from-sprint: target sprint is the drop target, not item's current
    // computeCommitImpact reads parseSequenceToSprint or assignments. Override target via assignments.
    const finalAssignments = {
      ...impact.final_assignments,
      [item.id]: targetSprint,
    };

    saveAssignments(finalAssignments);

    // Record decision based on source
    if (src.kind === "rail" || src.kind === "deferred") {
      addDecision({
        initiative_id: item.id,
        action: "committed",
        ai_suggestion: `${item.ai_recommendation.action} · ${item.ai_recommendation.sequence}`,
        sequence: SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`,
        decided_at: new Date().toISOString(),
      });
      playCommitChime();
    }
    // For drag-from-sprint, only update assignments (already committed or soft)

    const reflowCount = impact.pushed_items.length;
    let msg = `${item.title} → ${SPRINTS[targetSprint - 1]?.label}.`;
    if (reflowCount > 0) {
      msg += ` ${reflowCount} item${reflowCount === 1 ? "" : "s"} auto-reflowed to make room.`;
    }
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function dropOnDefer(e: React.DragEvent) {
    if (locked || !dragSource) return;
    e.preventDefault();
    setHovered(null);
    const src = dragSource;
    setDragSource(null);

    const item = allInitiatives.find((i) => i.id === src.id);
    if (!item) return;

    addDecision({
      initiative_id: item.id,
      action: "deferred",
      ai_suggestion: `${item.ai_recommendation.action} · ${item.ai_recommendation.sequence}`,
      sequence: "Deferred",
      decided_at: new Date().toISOString(),
    });
    playDeferTick();
    setToast(`${item.title} pushed to next quarter.`);
    setTimeout(() => setToast(null), 2400);
  }

  function dropFromDefer(e: React.DragEvent) {
    // Allow dropping a deferred item back to rail by dragging onto rail zone
    if (locked || !dragSource) return;
    e.preventDefault();
    if (dragSource.kind !== "deferred") return;
    const item = allInitiatives.find((i) => i.id === dragSource.id);
    if (!item) return;
    // Re-add as a "promoted" placeholder via decision removal — easiest path:
    // overwrite with a no-op committed-no-sprint then remove. For demo: just
    // overwrite with an "escalated" decision so it leaves the deferred bucket.
    // Cleaner: remove this decision entirely.
    const remaining = decisions.filter((d) => d.initiative_id !== item.id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("qp_decisions_v1", JSON.stringify(remaining));
      window.dispatchEvent(new Event("qp:decisions-updated"));
    }
    setDragSource(null);
    setToast(`${item.title} returned to placement.`);
    setTimeout(() => setToast(null), 2000);
  }

  /* ─────────── Snap ─────────── */

  function snap() {
    if (!canSnap) return;
    saveLocked(true);
    playSnapChime();
    setSnapPulse(true);
    setToast("Q3 plan locked. Stakeholder views updated.");
    setTimeout(() => setSnapPulse(false), 800);
    setTimeout(() => setToast(null), 2400);
  }

  function unsnap() {
    saveLocked(false);
    setToast("Plan unlocked. You can move items again.");
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mx-auto max-w-[920px] px-6 pt-8 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Calendar · Q3 2026</p>
          <h1
            className="font-display mt-2 text-[28px] leading-tight tracking-tight"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            {railEmpty
              ? locked
                ? "Q3 plan, locked"
                : "Q3 plan"
              : `Place ${railItems.length} item${railItems.length === 1 ? "" : "s"}`}
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--color-tertiary)" }}>
            {railEmpty
              ? "Drag any item between sprints, or push to next quarter."
              : "Drag each item into the sprint where it fits. Capacity reflows automatically."}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {!locked ? (
            <button
              onClick={snap}
              disabled={!canSnap}
              title={
                !canSnap
                  ? railEmpty
                    ? "Resolve sprint over-capacity first"
                    : "Place all rail items first"
                  : ""
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: canSnap ? "var(--color-accent)" : "var(--color-surface-sunken)",
                color: canSnap ? "var(--color-elevated)" : "var(--color-muted)",
                boxShadow: canSnap ? "var(--shadow-sm)" : "none",
              }}
            >
              Snap as Q3 plan
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={unsnap}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition"
              style={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-secondary)",
              }}
            >
              <Lock size={13} />
              Plan locked · Unlock
            </button>
          )}
        </div>
      </div>

      {/* TO PLACE rail — only visible when there's something to place */}
      <AnimatePresence>
        {!railEmpty && (
          <motion.section
            key="rail"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 rounded-2xl px-5 py-4"
            style={{
              background: "var(--color-accent-soft)",
              border: "1px dashed var(--color-accent)",
            }}
          >
            <div className="flex items-baseline gap-2">
              <p
                className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--color-accent)" }}
              >
                To place
              </p>
              <p className="font-numeric text-[10.5px]" style={{ color: "var(--color-accent)" }}>
                {railItems.length}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {railItems.map((i) => (
                <RailCard
                  key={i.id}
                  initiative={i}
                  locked={locked}
                  onDragStart={(e) => dragStart({ kind: "rail", id: i.id }, e)}
                  onDragEnd={dragEnd}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Sprint grid */}
      <motion.div
        animate={
          snapPulse
            ? { boxShadow: "0 0 0 4px var(--color-accent-soft)" }
            : { boxShadow: "0 0 0 0 transparent" }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 space-y-3 rounded-2xl"
      >
        {SPRINTS.map((sprint) => {
          const sprintItems = itemsBySprint[sprint.index] ?? [];
          const load = sprintLoad(sprint.index);
          const pct = Math.round((load / SPRINT_CAPACITY) * 100);
          const overflow = load > SPRINT_CAPACITY;
          const tight = load >= SPRINT_CAPACITY * 0.85 && !overflow;
          const isHovered = hovered === sprint.index && !!dragSource;
          const isAIRec =
            !!dragSource &&
            (() => {
              const it = allInitiatives.find((x) => x.id === dragSource.id);
              if (!it) return false;
              return parseSequenceToSprint(it.ai_recommendation.sequence) === sprint.index;
            })();

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => sprintDragOver(e, sprint.index)}
              onDragLeave={() => setHovered(null)}
              onDrop={(e) => dropOnSprint(e, sprint.index)}
              className="rounded-2xl px-5 py-4 transition-all"
              style={{
                background: isHovered ? "var(--color-accent-tint)" : "var(--color-elevated)",
                border: "1px solid",
                borderColor: isHovered
                  ? "var(--color-accent)"
                  : isAIRec && !!dragSource
                    ? "var(--color-accent-soft)"
                    : "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span
                    className="text-[15px] font-semibold tracking-tight shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {sprint.label}
                  </span>
                  <span
                    className="font-numeric text-[12px] shrink-0"
                    style={{ color: "var(--color-tertiary)" }}
                  >
                    {sprint.date_label}
                  </span>
                  <SprintStatusPill status={sprint.status} />
                  {isAIRec && !!dragSource && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: "var(--color-accent-soft)",
                        color: "var(--color-accent)",
                      }}
                    >
                      AI suggests
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="font-numeric text-[12px]"
                    style={{
                      color: overflow ? "var(--color-warning)" : "var(--color-secondary)",
                    }}
                  >
                    {load} / {SPRINT_CAPACITY}p
                  </span>
                  <CapacityBar pct={pct} overflow={overflow} tight={tight} />
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 flex flex-wrap gap-2">
                {sprintItems.length === 0 ? (
                  <p className="text-[12.5px]" style={{ color: "var(--color-muted)" }}>
                    {locked ? "—" : "Drop items here"}
                  </p>
                ) : (
                  sprintItems.map((it) => {
                    const placement = placementOf(it);
                    const soft = placement.kind === "sprint" && placement.soft;
                    return (
                      <SprintItemCard
                        key={it.id}
                        initiative={it}
                        soft={soft}
                        locked={locked}
                        onDragStart={(e) =>
                          dragStart(
                            { kind: "sprint", id: it.id, from: sprint.index },
                            e,
                          )
                        }
                        onDragEnd={dragEnd}
                      />
                    );
                  })
                )}
              </div>

              {overflow && (
                <div
                  className="mt-3 flex items-center gap-1.5 text-[12px]"
                  style={{ color: "var(--color-warning)" }}
                >
                  <AlertTriangle size={12} />
                  <span>
                    {load - SPRINT_CAPACITY}p over capacity. Move one item out.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Defer tray */}
      <section
        onDragOver={deferDragOver}
        onDragLeave={() => setHovered(null)}
        onDrop={dropOnDefer}
        className="mt-3 rounded-2xl px-5 py-4 transition-all"
        style={{
          background: hovered === "defer" ? "var(--color-warning-soft)" : "var(--color-surface-sunken)",
          border: "1px dashed",
          borderColor: hovered === "defer" ? "var(--color-warning)" : "var(--color-border-strong)",
        }}
      >
        <div className="flex items-baseline gap-2">
          <MoonStar
            size={13}
            style={{
              color: hovered === "defer" ? "var(--color-warning)" : "var(--color-tertiary)",
            }}
          />
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{
              color: hovered === "defer" ? "var(--color-warning)" : "var(--color-tertiary)",
            }}
          >
            Push to next quarter
          </p>
          <p className="font-numeric text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
            {deferredItems.length}
          </p>
        </div>
        {deferredItems.length === 0 ? (
          <p className="mt-2 text-[12px]" style={{ color: "var(--color-muted)" }}>
            Drag any item here to push it out of Q3.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {deferredItems.map((i) => (
              <DeferredCard
                key={i.id}
                initiative={i}
                locked={locked}
                onDragStart={(e) => dragStart({ kind: "deferred", id: i.id }, e)}
                onDragEnd={dragEnd}
              />
            ))}
          </div>
        )}
      </section>

      {/* Snap callout */}
      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-10 rounded-xl px-6 py-5"
          style={{
            background: "var(--color-accent-soft)",
            border: "1px solid var(--color-accent)",
          }}
        >
          <p className="text-[13.5px] font-medium" style={{ color: "var(--color-primary)" }}>
            Plan is locked. Time to share it.
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--color-secondary)" }}>
            Generate stakeholder-shaped artifacts in one click.
          </p>
          <Link
            href="/stakeholders/"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-elevated)",
            }}
          >
            Open stakeholders
            <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* No-rail empty hint when nothing to place */}
      {railEmpty && !locked && (
        <p className="mt-6 text-center text-[12px]" style={{ color: "var(--color-muted)" }}>
          <InboxIcon size={11} className="mr-1 inline-block" />
          Run triage on inbox items to add to the placement queue.
        </p>
      )}

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
    </main>
  );
}

/* ─────────── Sub-components ─────────── */

function RailCard({
  initiative,
  locked,
  onDragStart,
  onDragEnd,
}: {
  initiative: Initiative;
  locked: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const points = effortPoints(initiative);
  const score = getScoring(initiative.ai_recommendation.framework, initiative);
  const aiSprint = parseSequenceToSprint(initiative.ai_recommendation.sequence);
  const sigKind = signalToKind(initiative.signal_type);

  return (
    <Link
      href={`/initiative/${initiative.id}/`}
      draggable={!locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        cursor: locked ? "default" : "grab",
        minWidth: 200,
        maxWidth: 260,
      }}
      title={locked ? "Plan is locked" : "Drag into a sprint, or click for details"}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[13px] font-semibold leading-snug truncate"
          style={{ color: "var(--color-primary)" }}
        >
          {initiative.title}
        </span>
        <span
          className="font-numeric shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-medium"
          style={{
            background: `var(--color-chip-${sigKind}-bg)`,
            color: `var(--color-chip-${sigKind}-text)`,
          }}
        >
          {points}p
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--color-tertiary)" }}>
        <span>
          {score.total.label} <span className="font-numeric" style={{ color: "var(--color-secondary)" }}>{score.total.value}</span>
        </span>
        <span style={{ color: "var(--color-muted)" }}>·</span>
        <span style={{ color: "var(--color-accent)" }}>AI: Sprint {aiSprint}</span>
      </div>
    </Link>
  );
}

function SprintItemCard({
  initiative,
  soft,
  locked,
  onDragStart,
  onDragEnd,
}: {
  initiative: Initiative;
  soft: boolean;
  locked: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const points = effortPoints(initiative);
  const sigKind = signalToKind(initiative.signal_type);

  return (
    <div
      draggable={!locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 transition"
      style={{
        background: "var(--color-page)",
        border: soft ? "1px dashed var(--color-border-strong)" : "1px solid var(--color-border)",
        cursor: locked ? "default" : "grab",
      }}
      title={
        locked
          ? "Plan is locked"
          : soft
            ? "AI-placed (drag to reposition or commit elsewhere)"
            : "Committed (drag to reposition)"
      }
    >
      {!soft && (
        <Check size={11} className="shrink-0" style={{ color: "var(--color-success)" }} />
      )}
      <Link
        href={`/initiative/${initiative.id}/`}
        className="text-[12.5px] font-medium"
        style={{ color: "var(--color-primary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {initiative.title}
      </Link>
      <span
        className="font-numeric ml-1 rounded px-1.5 py-0.5 text-[10px]"
        style={{
          background: `var(--color-chip-${sigKind}-bg)`,
          color: `var(--color-chip-${sigKind}-text)`,
        }}
      >
        {points}p
      </span>
    </div>
  );
}

function DeferredCard({
  initiative,
  locked,
  onDragStart,
  onDragEnd,
}: {
  initiative: Initiative;
  locked: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable={!locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] transition"
      style={{
        background: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        color: "var(--color-tertiary)",
        cursor: locked ? "default" : "grab",
        textDecoration: "line-through",
        textDecorationColor: "var(--color-muted)",
      }}
      title="Drag back to a sprint to bring into Q3"
    >
      {initiative.title}
    </div>
  );
}

function SprintStatusPill({
  status,
}: {
  status: "shipped" | "in_flight" | "planned" | "future";
}) {
  const labels = {
    shipped: "Shipped",
    in_flight: "In flight",
    planned: "Planned",
    future: "Future",
  } as const;
  const colors = {
    shipped: { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
    in_flight: { bg: "var(--color-accent-soft)", fg: "var(--color-accent)" },
    planned: { bg: "var(--color-surface-sunken)", fg: "var(--color-tertiary)" },
    future: { bg: "var(--color-surface-sunken)", fg: "var(--color-muted)" },
  } as const;
  return (
    <span
      className="inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider"
      style={{ background: colors[status].bg, color: colors[status].fg }}
    >
      {labels[status]}
    </span>
  );
}

function CapacityBar({
  pct,
  overflow,
  tight,
}: {
  pct: number;
  overflow: boolean;
  tight: boolean;
}) {
  const cap = Math.min(120, pct);
  const color = overflow
    ? "var(--color-warning)"
    : tight
      ? "var(--color-warning)"
      : "var(--color-accent)";
  return (
    <div
      className="relative h-1.5 w-24 rounded-full overflow-hidden"
      style={{ background: "var(--color-border)" }}
    >
      <motion.div
        initial={false}
        animate={{ width: `${cap}%` }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-0 h-full"
        style={{ background: color }}
      />
    </div>
  );
}
