"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import {
  SPRINTS,
  SPRINT_CAPACITY,
  effortPoints,
  parseSequenceToSprint,
  type PlannedItem,
} from "@/lib/sprint-data";
import { signalToKind } from "@/lib/inbox-helpers";
import { useDecisions } from "@/lib/use-decisions";
import { playSnapChime } from "@/lib/sound";

const allInitiatives = initiativesJson as Initiative[];

const ASSIGNMENT_KEY = "qp_calendar_assignments_v2";
const PLAN_LOCKED_KEY = "qp_calendar_locked_v2";

type Assignments = Record<string, number>; // initiative_id → sprint index

function loadAssignments(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGNMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAssignments(a: Assignments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(a));
}

function loadLocked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PLAN_LOCKED_KEY) === "true";
}

function saveLocked(b: boolean) {
  if (typeof window === "undefined") return;
  if (b) localStorage.setItem(PLAN_LOCKED_KEY, "true");
  else localStorage.removeItem(PLAN_LOCKED_KEY);
}

export function CalendarPlan() {
  const [assignments, setAssignments] = useState<Assignments>({});
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [snapPulse, setSnapPulse] = useState(false);

  const { decisions } = useDecisions();
  const decidedMap = useMemo(() => {
    const m = new Map<string, "committed" | "deferred" | "escalated" | "overridden">();
    decisions.forEach((d) => m.set(d.initiative_id, d.action));
    return m;
  }, [decisions]);

  useEffect(() => {
    setAssignments(loadAssignments());
    setLocked(loadLocked());
  }, []);

  function setItemSprint(id: string, sprintIndex: number) {
    const next = { ...assignments, [id]: sprintIndex };
    setAssignments(next);
    saveAssignments(next);
  }

  /* Build planned items, with assignments override */
  const items = useMemo(() => {
    return allInitiatives
      .filter((i) => {
        const d = decidedMap.get(i.id);
        // Surface in calendar if: committed, in-flight by data, or simply for demo show
        return d === "committed" || i.status === "sequenced" || i.status === "needs_decision";
      })
      .map((i) => {
        const overrideIndex = assignments[i.id];
        const sprintIndex =
          overrideIndex ?? parseSequenceToSprint(i.ai_recommendation.sequence);
        const decided = decidedMap.get(i.id);
        const status: PlannedItem["status"] =
          decided === "committed"
            ? sprintIndex === 1
              ? "shipped"
              : sprintIndex === 2
                ? "in_flight"
                : "planned"
            : sprintIndex === 1
              ? "shipped"
              : sprintIndex === 2
                ? "in_flight"
                : "planned";
        return {
          initiative_id: i.id,
          title: i.title,
          effort_points: effortPoints(i),
          status,
          signal_kind: signalToKind(i.signal_type),
          arr_exposure_usd: i.arr_exposure_usd,
          sprintIndex,
        };
      });
  }, [assignments, decidedMap]);

  const itemsBySprint: Record<number, typeof items> = useMemo(() => {
    const map: Record<number, typeof items> = { 1: [], 2: [], 3: [], 4: [] };
    items.forEach((it) => {
      map[it.sprintIndex] = map[it.sprintIndex] ?? [];
      map[it.sprintIndex].push(it);
    });
    return map;
  }, [items]);

  function loadFor(sprintIndex: number, excludeId?: string): number {
    return (itemsBySprint[sprintIndex] ?? [])
      .filter((it) => it.initiative_id !== excludeId)
      .reduce((acc, it) => acc + it.effort_points, 0);
  }

  function handleDragStart(id: string) {
    if (locked) return;
    setDraggedId(id);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setHovered(null);
  }

  function handleDragOver(e: React.DragEvent, sprintIndex: number) {
    if (locked) return;
    e.preventDefault();
    setHovered(sprintIndex);
  }

  function handleDrop(e: React.DragEvent, sprintIndex: number) {
    if (locked) return;
    e.preventDefault();
    const id = draggedId;
    setHovered(null);
    setDraggedId(null);
    if (!id) return;
    const item = items.find((it) => it.initiative_id === id);
    if (!item) return;
    if (item.sprintIndex === sprintIndex) return;
    setItemSprint(id, sprintIndex);
    const newLoad = loadFor(sprintIndex, id) + item.effort_points;
    const overflow = newLoad - SPRINT_CAPACITY;
    let msg = `Moved ${item.title} to Sprint ${sprintIndex}.`;
    if (overflow > 0) {
      msg += ` Sprint ${sprintIndex} is now ${Math.round((newLoad / SPRINT_CAPACITY) * 100)}% — over capacity.`;
    }
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function snap() {
    setLocked(true);
    saveLocked(true);
    playSnapChime();
    setSnapPulse(true);
    setToast("Q3 plan locked. Stakeholder views updated.");
    setTimeout(() => setSnapPulse(false), 800);
    setTimeout(() => setToast(null), 2400);
  }

  function unsnap() {
    setLocked(false);
    saveLocked(false);
    setToast("Plan unlocked. You can move items again.");
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mx-auto max-w-[880px] px-6 pt-8 pb-24">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Calendar · Q3 2026</p>
          <h1
            className="font-display mt-2 text-[28px] leading-tight tracking-tight"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            Sprint plan
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--color-tertiary)" }}>
            Drag items between sprints. Capacity bars adjust live.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {!locked ? (
            <button
              onClick={snap}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-elevated)",
                boxShadow: "var(--shadow-sm)",
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

      <motion.div
        animate={snapPulse ? { boxShadow: "0 0 0 4px var(--color-accent-soft)" } : { boxShadow: "0 0 0 0 transparent" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 space-y-3 rounded-2xl"
      >
        {SPRINTS.map((sprint) => {
          const sprintItems = itemsBySprint[sprint.index] ?? [];
          const load = sprintItems.reduce((acc, it) => acc + it.effort_points, 0);
          const pct = Math.round((load / SPRINT_CAPACITY) * 100);
          const overflow = load > SPRINT_CAPACITY;
          const tight = load >= SPRINT_CAPACITY * 0.85 && !overflow;
          const isHovered = hovered === sprint.index && !!draggedId;

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => handleDragOver(e, sprint.index)}
              onDragLeave={() => setHovered(null)}
              onDrop={(e) => handleDrop(e, sprint.index)}
              className="rounded-2xl px-5 py-4 transition-all"
              style={{
                background: isHovered ? "var(--color-accent-tint)" : "var(--color-elevated)",
                border: `1px solid ${isHovered ? "var(--color-accent)" : "var(--color-border)"}`,
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
                  <span className="font-numeric text-[12px] shrink-0" style={{ color: "var(--color-tertiary)" }}>
                    {sprint.date_label}
                  </span>
                  <SprintStatusPill status={sprint.status} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="font-numeric text-[12px]"
                    style={{
                      color: overflow ? "var(--color-warning)" : "var(--color-secondary)",
                    }}
                  >
                    {load} / {SPRINT_CAPACITY}
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
                  sprintItems.map((it) => (
                    <CalendarItem
                      key={it.initiative_id}
                      item={it}
                      locked={locked}
                      onDragStart={() => handleDragStart(it.initiative_id)}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>

              {overflow && (
                <div
                  className="mt-3 flex items-center gap-1.5 text-[12px]"
                  style={{ color: "var(--color-warning)" }}
                >
                  <AlertTriangle size={12} />
                  <span>Sprint {sprint.index} is over capacity. Move one item.</span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Snap-flow CTA at bottom — link forward to Stakeholders */}
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

function CalendarItem({
  item,
  locked,
  onDragStart,
  onDragEnd,
}: {
  item: PlannedItem & { sprintIndex: number };
  locked: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const bgVar = `var(--color-chip-${item.signal_kind}-bg)`;
  const fgVar = `var(--color-chip-${item.signal_kind}-text)`;
  const isShipped = item.status === "shipped";
  const isInFlight = item.status === "in_flight";

  return (
    <div
      draggable={!locked}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.initiative_id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className="group flex items-center gap-2 rounded-lg px-3 py-2 transition"
      style={{
        background: "var(--color-page)",
        border: "1px solid var(--color-border)",
        cursor: locked ? "default" : "grab",
        opacity: isShipped ? 0.78 : 1,
      }}
      title={locked ? "Plan is locked" : "Drag to another sprint"}
    >
      {isShipped && (
        <Check size={11} className="shrink-0" style={{ color: "var(--color-success)" }} />
      )}
      {isInFlight && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: "var(--color-accent)" }}
        />
      )}
      <span
        className="text-[12.5px] font-medium"
        style={{
          color: "var(--color-primary)",
          textDecoration: isShipped ? "line-through" : "none",
          textDecorationColor: "var(--color-muted)",
        }}
      >
        {item.title}
      </span>
      <span
        className="font-numeric ml-1 rounded px-1.5 py-0.5 text-[10px]"
        style={{ background: bgVar, color: fgVar }}
      >
        {item.effort_points}p
      </span>
    </div>
  );
}

function SprintStatusPill({ status }: { status: "shipped" | "in_flight" | "planned" | "future" }) {
  const labels: Record<typeof status, string> = {
    shipped: "Shipped",
    in_flight: "In flight",
    planned: "Planned",
    future: "Future",
  };
  const colors: Record<typeof status, { bg: string; fg: string }> = {
    shipped: { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
    in_flight: { bg: "var(--color-accent-soft)", fg: "var(--color-accent)" },
    planned: { bg: "var(--color-surface-sunken)", fg: "var(--color-tertiary)" },
    future: { bg: "var(--color-surface-sunken)", fg: "var(--color-muted)" },
  };
  return (
    <span
      className="inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider"
      style={{ background: colors[status].bg, color: colors[status].fg }}
    >
      {labels[status]}
    </span>
  );
}

function CapacityBar({ pct, overflow, tight }: { pct: number; overflow: boolean; tight: boolean }) {
  const cap = Math.min(120, pct);
  const color = overflow
    ? "var(--color-warning)"
    : tight
      ? "var(--color-warning)"
      : "var(--color-accent)";
  return (
    <div className="relative h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
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
