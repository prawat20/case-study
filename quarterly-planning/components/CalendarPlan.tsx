"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Lock, AlertTriangle, ArrowRight, Inbox as InboxIcon, MoonStar, Sparkles, ShieldAlert, Clock } from "lucide-react";
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
import {
  computeCommitImpact,
  computeStrategyOptions,
  type StrategyKind,
  type StrategyOption,
} from "@/lib/sprint-conflict";
import { getScoring } from "@/lib/frameworks";
import { DropPlanner, type PendingDrop, type PlanChoice } from "@/components/DropPlanner";

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
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [pendingFromSource, setPendingFromSource] = useState<DragSource | null>(null);

  const triageMap = useMemo(() => {
    const m = new Map<string, "promote" | "escalate" | "defer">();
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
    if (triaged === "escalate") return { kind: "hidden" };
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

  /* ─────────── Drag impact preview ─────────── */
  // Compute predicted resolved-loads + strategy options whenever a drag is in
  // progress and a sprint is hovered. This is what powers the v3 trade-off
  // panel: the user sees what each AI strategy would do *before* committing.

  const draggedInitiative: Initiative | null = useMemo(() => {
    if (!dragSource) return null;
    return allInitiatives.find((i) => i.id === dragSource.id) ?? null;
  }, [dragSource]);

  const hoveredSprintIndex: number | null = typeof hovered === "number" ? hovered : null;

  // Strategy options for the hovered sprint. Heavy enough to memoise so we don't
  // recompute three impact passes on every dragOver event tick.
  const strategyOptions: StrategyOption[] | null = useMemo(() => {
    if (!draggedInitiative || hoveredSprintIndex === null) return null;
    return computeStrategyOptions({
      initiative: draggedInitiative,
      allInitiatives,
      decisions,
      assignments,
      targetSprint: hoveredSprintIndex,
    });
  }, [draggedInitiative, hoveredSprintIndex, decisions, assignments]);

  // Default option (option A) — used when the user drops on the sprint itself.
  const defaultOption = strategyOptions?.[0] ?? null;
  // Will the hovered sprint overflow with no resolution? — drives whether to
  // render the trade-off panel.
  const hoveredOverflow = !!defaultOption?.impact.overflow;

  // Predicted resolved load per sprint, to render on each sprint corner during
  // drag. Uses the default-strategy resolution so the user sees what would
  // happen if they just drop without picking a strategy.
  const predictedLoads: Record<number, number> | null = useMemo(() => {
    if (!defaultOption) return null;
    return defaultOption.impact.resolved_sprint_loads;
  }, [defaultOption]);

  // Sprints that would receive reflow items under the default strategy — used
  // to highlight downstream sprints in the reflow chain during drag.
  const reflowTargetSprints: Set<number> = useMemo(() => {
    const s = new Set<number>();
    if (!defaultOption) return s;
    defaultOption.impact.pushed_items.forEach((p) => {
      if (!p.deferred && p.to_sprint > 0) s.add(p.to_sprint);
    });
    return s;
  }, [defaultOption]);

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
    // Shipped sprints are read-only — no drops accepted.
    if (SPRINTS[sprintIndex - 1]?.status === "shipped") return;
    e.preventDefault();
    setHovered(sprintIndex);
  }

  function deferDragOver(e: React.DragEvent) {
    if (locked || !dragSource) return;
    e.preventDefault();
    setHovered("defer");
  }

  function dropOnSprint(
    e: React.DragEvent,
    targetSprint: number,
    strategy: StrategyKind = "minimise_rice_loss",
  ) {
    if (locked || !dragSource) return;
    // Shipped sprints are read-only — silently ignore drops (the dragOver
    // guard already blocks the visual drop hint, this is belt + suspenders).
    if (SPRINTS[targetSprint - 1]?.status === "shipped") return;
    e.preventDefault();
    setHovered(null);
    const src = dragSource;
    setDragSource(null);

    const item = allInitiatives.find((i) => i.id === src.id);
    if (!item) return;

    if (src.kind === "sprint" && src.from === targetSprint) return;

    // OVERFLOW CASE → open the Drop Planner instead of auto-committing.
    // The PM gets explicit control over which items move and where.
    // Non-overflow drops still flow through the existing immediate-commit path.
    const willOverflow =
      (sprintLoad(targetSprint) + effortPoints(item)) > SPRINT_CAPACITY;
    if (willOverflow) {
      const itemsInTarget = (itemsBySprint[targetSprint] ?? []).filter(
        (i) => i.id !== item.id,
      );
      // Seed choices from AI's default plan (minimise_rice_loss).
      const aiOpt = strategyOptions?.find((o) => o.kind === "minimise_rice_loss");
      const choices: Record<string, PlanChoice> = {};
      const aiChoices: Record<string, PlanChoice> = {};
      for (const it of itemsInTarget) {
        const pushed = aiOpt?.impact.pushed_items.find((p) => p.initiative_id === it.id);
        let c: PlanChoice;
        if (!pushed) c = { kind: "keep" };
        else if (pushed.deferred) c = { kind: "defer" };
        else c = { kind: "move", toSprint: pushed.to_sprint };
        choices[it.id] = c;
        aiChoices[it.id] = c;
      }
      setPendingDrop({
        incoming: item,
        targetSprint,
        choices,
        aiChoices,
      });
      setPendingFromSource(src);
      return;
    }

    // Compute impact under the chosen strategy. The user has either accepted
    // the default (drop on the sprint = minimise_rice_loss) or actively picked
    // a different option from the trade-off panel.
    const impact = computeCommitImpact({
      initiative: item,
      allInitiatives,
      decisions,
      assignments: {
        ...assignments,
        [item.id]: targetSprint,
      },
      targetSprint,
      strategy,
    });

    const finalAssignments = {
      ...impact.final_assignments,
      [item.id]: targetSprint,
    };

    saveAssignments(finalAssignments);

    // Strategy "defer" pushes displaced items to next quarter — record those
    // displacements as deferred decisions so the Stakeholders + Audit surfaces
    // see them. The dropped item itself is still committed in-quarter.
    if (strategy === "defer" && impact.pushed_items.length > 0) {
      for (const pushed of impact.pushed_items) {
        if (!pushed.deferred) continue;
        const pushedItem = allInitiatives.find((x) => x.id === pushed.initiative_id);
        if (!pushedItem) continue;
        addDecision({
          initiative_id: pushedItem.id,
          action: "deferred",
          ai_suggestion: `${pushedItem.ai_recommendation.action} · ${pushedItem.ai_recommendation.sequence}`,
          sequence: "Deferred",
          decided_at: new Date().toISOString(),
        });
      }
    }

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

    const inQuarterReflowCount = impact.pushed_items.filter((p) => !p.deferred).length;
    const deferredCount = impact.pushed_items.filter((p) => p.deferred).length;
    let msg = `${item.title} → ${SPRINTS[targetSprint - 1]?.label}.`;
    if (inQuarterReflowCount > 0) {
      msg += ` ${inQuarterReflowCount} item${inQuarterReflowCount === 1 ? "" : "s"} reflowed`;
      if (strategy === "minimise_deadline_risk") {
        msg += " (deadline-protected)";
      }
      msg += ".";
    }
    if (deferredCount > 0) {
      msg += ` ${deferredCount} item${deferredCount === 1 ? "" : "s"} pushed to next quarter.`;
    }
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
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

  /* ─────────── Drop Planner — commit / cancel / update ─────────── */

  function updatePlanChoice(itemId: string, choice: PlanChoice) {
    if (!pendingDrop) return;
    setPendingDrop({
      ...pendingDrop,
      choices: { ...pendingDrop.choices, [itemId]: choice },
    });
  }

  function cancelPlan() {
    setPendingDrop(null);
    setPendingFromSource(null);
  }

  function commitPlan() {
    if (!pendingDrop || !pendingFromSource) return;
    const { incoming, targetSprint, choices } = pendingDrop;
    const src = pendingFromSource;

    // Apply the user's plan: incoming → target, every "move" updates
    // assignments, every "defer" gets a deferred decision logged.
    const newAssignments: typeof assignments = {
      ...assignments,
      [incoming.id]: targetSprint,
    };
    let movedCount = 0;
    let deferredCount = 0;
    for (const [itemId, choice] of Object.entries(choices)) {
      if (choice.kind === "keep") continue;
      if (choice.kind === "move") {
        newAssignments[itemId] = choice.toSprint;
        movedCount++;
      } else if (choice.kind === "defer") {
        const item = allInitiatives.find((i) => i.id === itemId);
        if (item) {
          addDecision({
            initiative_id: item.id,
            action: "deferred",
            ai_suggestion: `${item.ai_recommendation.action} · ${item.ai_recommendation.sequence}`,
            sequence: "Deferred",
            decided_at: new Date().toISOString(),
          });
        }
        // Remove from assignments map so it falls into the deferred bucket
        // when placementOf() reads it back.
        delete newAssignments[itemId];
        deferredCount++;
      }
    }
    saveAssignments(newAssignments);

    // If incoming was on the rail (or returning from deferred), log it as a
    // committed decision so it leaves those buckets.
    if (src.kind === "rail" || src.kind === "deferred") {
      addDecision({
        initiative_id: incoming.id,
        action: "committed",
        ai_suggestion: `${incoming.ai_recommendation.action} · ${incoming.ai_recommendation.sequence}`,
        sequence: SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`,
        decided_at: new Date().toISOString(),
      });
      playCommitChime();
    } else {
      playCommitChime();
    }

    // Friendly toast.
    let msg = `${incoming.title} → ${SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`}.`;
    if (movedCount > 0) msg += ` ${movedCount} item${movedCount === 1 ? "" : "s"} reflowed.`;
    if (deferredCount > 0) msg += ` ${deferredCount} pushed to Q3.`;
    setToast(msg);
    setTimeout(() => setToast(null), 3200);

    setPendingDrop(null);
    setPendingFromSource(null);
  }

  /* ─────────── Snap ─────────── */

  function snap() {
    if (!canSnap) return;
    saveLocked(true);
    playSnapChime();
    setSnapPulse(true);
    setToast("Q2 plan locked. Stakeholder views updated.");
    setTimeout(() => setSnapPulse(false), 800);
    setTimeout(() => setToast(null), 2400);
  }

  function unsnap() {
    saveLocked(false);
    setToast("Plan unlocked. You can move items again.");
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <main className="mx-auto max-w-[920px] px-4 sm:px-6 pt-6 sm:pt-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <p className="eyebrow">Calendar · Q2 2026</p>
          <h1
            className="font-display mt-2 text-[24px] sm:text-[28px] leading-tight tracking-tight"
            style={{ color: "var(--color-primary)", fontWeight: 500 }}
          >
            {railEmpty
              ? locked
                ? "Q2 plan, locked"
                : "Q2 plan"
              : `Place ${railItems.length} item${railItems.length === 1 ? "" : "s"}`}
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--color-tertiary)" }}>
            {railEmpty
              ? "Drag between sprints or push to next quarter."
              : "Drag items into a sprint. Capacity reflows."}
          </p>
          <p className="mt-1 text-[11px] md:hidden" style={{ color: "var(--color-muted)" }}>
            Drag-and-drop is desktop-only. Use the swipe deck for mobile triage.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
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
              Snap as Q2 plan
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
          // Shipped sprints are read-only — no drag/drop/hover affordances,
          // no AI-suggests highlight, no reflow targeting.
          const isShipped = sprint.status === "shipped";
          const isHovered = !isShipped && hovered === sprint.index && !!dragSource;
          const isAIRec =
            !isShipped &&
            !!dragSource &&
            (() => {
              const it = allInitiatives.find((x) => x.id === dragSource.id);
              if (!it) return false;
              return parseSequenceToSprint(it.ai_recommendation.sequence) === sprint.index;
            })();

          // Predicted load if the dragged item lands here under the default
          // strategy (option A). Used to render the live capacity preview.
          const predictedLoad =
            !isShipped && !!dragSource && predictedLoads
              ? predictedLoads[sprint.index] ?? load
              : load;
          const showPrediction = !isShipped && !!dragSource && predictedLoad !== load;
          const wouldOverflow = !isShipped && !!dragSource && predictedLoad > SPRINT_CAPACITY;
          const showTradeOffPanel = isHovered && hoveredOverflow && strategyOptions;
          // Items moving INTO this sprint under default strategy (chain effect).
          const incomingReflow = !isShipped && !!dragSource && reflowTargetSprints.has(sprint.index) && !isHovered;
          // Net incoming reflow items count for the inline chain hint.
          const incomingItems = incomingReflow && defaultOption
            ? defaultOption.impact.pushed_items.filter(
                (p) => !p.deferred && p.to_sprint === sprint.index,
              )
            : [];

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => sprintDragOver(e, sprint.index)}
              onDragLeave={(e) => {
                if (isShipped) return;
                // Don't un-hover when the cursor crosses into a child of the
                // sprint (eg. the trade-off panel or its strategy cards).
                const next = e.relatedTarget as Node | null;
                if (next && e.currentTarget.contains(next)) return;
                setHovered(null);
              }}
              onDrop={(e) => dropOnSprint(e, sprint.index)}
              aria-disabled={isShipped || undefined}
              className="rounded-2xl px-5 py-4 transition-all"
              style={{
                background: isShipped
                  ? "var(--color-surface-sunken)"
                  : isHovered
                    ? "var(--color-accent-tint)"
                    : incomingReflow
                      ? "var(--color-elevated)"
                      : "var(--color-elevated)",
                border: isShipped
                  ? "1px dashed"
                  : incomingReflow
                    ? "1px dashed"
                    : "1px solid",
                borderColor: isShipped
                  ? "var(--color-border)"
                  : isHovered
                    ? wouldOverflow
                      ? "var(--color-warning)"
                      : "var(--color-accent)"
                    : incomingReflow
                      ? "var(--color-accent)"
                      : isAIRec && !!dragSource
                        ? "var(--color-accent-soft)"
                        : "var(--color-border)",
                boxShadow: isShipped ? "none" : "var(--shadow-sm)",
                opacity: isShipped ? 0.62 : 1,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 min-w-0">
                  <span
                    className="text-[15px] font-semibold tracking-tight shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {sprint.label}
                  </span>
                  <span
                    className="hidden sm:inline font-numeric text-[12px] shrink-0"
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
                  {showPrediction ? (
                    <span
                      className="font-numeric text-[12px]"
                      style={{
                        color: wouldOverflow
                          ? "var(--color-warning)"
                          : "var(--color-accent)",
                      }}
                    >
                      <span style={{ color: "var(--color-tertiary)" }}>
                        {load}
                      </span>
                      {" → "}
                      {predictedLoad} / {SPRINT_CAPACITY}p
                    </span>
                  ) : (
                    <span
                      className="font-numeric text-[12px]"
                      style={{
                        color: overflow ? "var(--color-warning)" : "var(--color-secondary)",
                      }}
                    >
                      {load} / {SPRINT_CAPACITY}p
                    </span>
                  )}
                  <CapacityBar
                    pct={Math.round((predictedLoad / SPRINT_CAPACITY) * 100)}
                    overflow={wouldOverflow || overflow}
                    tight={tight}
                  />
                </div>
              </div>

              {/* Drop-preview banner — appears on every sprint the user hovers
                  during drag. Suppressed while the planner is open. */}
              <AnimatePresence>
                {isHovered && !!dragSource && defaultOption && !pendingDrop && (
                  <DropPreview
                    wouldOverflow={wouldOverflow}
                    overflowBy={Math.max(0, predictedLoad - SPRINT_CAPACITY)}
                    predictedLoad={predictedLoad}
                    capacity={SPRINT_CAPACITY}
                    pushedItems={defaultOption.impact.pushed_items}
                  />
                )}
              </AnimatePresence>

              {/* Drop Planner — opens on this sprint when the user drops an
                  over-capacity item. Two-step pattern: drop → plan → commit. */}
              <AnimatePresence>
                {pendingDrop && pendingDrop.targetSprint === sprint.index && (
                  <DropPlanner
                    pendingDrop={pendingDrop}
                    itemsInTarget={(itemsBySprint[sprint.index] ?? []).filter(
                      (it) => it.id !== pendingDrop.incoming.id,
                    )}
                    sprintLoads={Object.fromEntries(
                      SPRINTS.map((s) => [s.index, sprintLoad(s.index)]),
                    )}
                    itemsBySprint={itemsBySprint}
                    onChange={updatePlanChoice}
                    onCommit={commitPlan}
                    onCancel={cancelPlan}
                  />
                )}
              </AnimatePresence>

              {/* Incoming-reflow hint — appears on sprints downstream of the
                  hovered drop. Suppressed while the planner is open. */}
              {incomingReflow && incomingItems.length > 0 && !pendingDrop && (
                <div
                  className="mt-3 flex items-center gap-1.5 text-[11.5px]"
                  style={{ color: "var(--color-accent)" }}
                >
                  <ArrowRight size={11} />
                  <span>
                    {incomingItems.length === 1
                      ? `"${incomingItems[0].title}" reflows here`
                      : `${incomingItems.length} items reflow here`}
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="mt-4 flex flex-wrap gap-2">
                {sprintItems.length === 0 ? (
                  <p className="text-[12.5px]" style={{ color: "var(--color-muted)" }}>
                    {isShipped
                      ? "Shipped sprint · read-only"
                      : locked
                        ? "—"
                        : "Drop items here"}
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
                        shipped={isShipped}
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

              {overflow && !isHovered && (
                <div
                  className="mt-3 flex items-center gap-1.5 text-[12px]"
                  style={{ color: "var(--color-warning)" }}
                >
                  <AlertTriangle size={12} />
                  <span>{load - SPRINT_CAPACITY}p over capacity</span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Defer tray */}
      <section
        onDragOver={deferDragOver}
        onDragLeave={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && e.currentTarget.contains(next)) return;
          setHovered(null);
        }}
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
            Drag any item here to push it out of Q2.
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
  shipped,
  onDragStart,
  onDragEnd,
}: {
  initiative: Initiative;
  soft: boolean;
  locked: boolean;
  shipped?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const points = effortPoints(initiative);
  const sigKind = signalToKind(initiative.signal_type);

  // Outer motion.div carries the shared-layout transition (layoutId on the
  // initiative id means Framer Motion animates the card's position when it
  // remounts in another sprint). Inner div carries the HTML5 drag handlers,
  // since motion.div redefines onDragStart for its own pointer-based gesture
  // system and conflicts with the DnD signature we use elsewhere.
  return (
    <motion.div
      layoutId={`sprint-item-${initiative.id}`}
      layout="position"
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      <div
        draggable={!locked && !shipped}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 transition"
        style={{
          background: "var(--color-page)",
          border: soft ? "1px dashed var(--color-border-strong)" : "1px solid var(--color-border)",
          cursor: locked || shipped ? "default" : "grab",
        }}
        title={
          shipped
            ? "Shipped — read-only"
            : locked
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
    </motion.div>
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
      title="Drag back to a sprint to bring into Q2"
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

/* ─────────── DropPreview ───────────
 * Always-on hint for what happens when the user releases on the hovered
 * sprint. Bridges the gap between "I'm dragging" and the toast-after-drop
 * narration that the v2 build used to rely on. For overflow drops, it
 * defers the detailed strategy choice to the TradeOffPanel below.
 */

function DropPreview({
  wouldOverflow,
  overflowBy,
  predictedLoad,
  capacity,
  pushedItems,
}: {
  wouldOverflow: boolean;
  overflowBy: number;
  predictedLoad: number;
  capacity: number;
  pushedItems: { title: string; deferred?: boolean }[];
}) {
  const movedInQuarter = pushedItems.filter((p) => !p.deferred).length;
  const deferredCount = pushedItems.filter((p) => p.deferred).length;

  let summary: React.ReactNode;
  if (wouldOverflow) {
    summary = (
      <>
        Over by <span className="font-numeric font-semibold">{overflowBy}p</span> · pick a strategy below
      </>
    );
  } else if (movedInQuarter > 0 || deferredCount > 0) {
    const parts: string[] = [];
    if (movedInQuarter > 0) parts.push(`${movedInQuarter} reflow${movedInQuarter === 1 ? "s" : "s"}`);
    if (deferredCount > 0) parts.push(`${deferredCount} deferred`);
    summary = (
      <>
        Fills to <span className="font-numeric font-semibold">{predictedLoad}/{capacity}p</span> · {parts.join(" · ")}
      </>
    );
  } else {
    summary = (
      <>
        Fills to <span className="font-numeric font-semibold">{predictedLoad}/{capacity}p</span> · nothing else moves
      </>
    );
  }

  const tone = wouldOverflow ? "var(--color-warning)" : "var(--color-accent)";
  const bg = wouldOverflow ? "var(--color-warning-soft)" : "var(--color-accent-soft)";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-[11.5px]"
      style={{
        background: bg,
        color: tone,
        border: `1px solid ${tone}`,
      }}
    >
      <span className="font-semibold uppercase tracking-wider text-[9.5px]">Drop here</span>
      <span style={{ color: "var(--color-secondary)" }}>{summary}</span>
    </motion.div>
  );
}

/* ─────────── TradeOffPanel ───────────
 * Renders the three named AI strategies as drop targets when the user is
 * dragging an item onto a sprint that would overflow. Each option is itself a
 * drop zone — releasing on it commits with that strategy. Releasing on the
 * sprint background = option A (default).
 */

const STRATEGY_ICONS: Record<StrategyKind, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  minimise_rice_loss: Sparkles,
  minimise_deadline_risk: ShieldAlert,
  defer: Clock,
};

function TradeOffPanel({
  options,
  onPick,
}: {
  options: StrategyOption[];
  onPick: (kind: StrategyKind, e: React.DragEvent) => void;
}) {
  // Sort the visible order so option A (lowest score impact) shows first as
  // the AI default — but we keep its label "minimise_rice_loss" stable.
  // The brief asks for three named paths, in this fixed order:
  //   ⓐ minimise_rice_loss · ⓑ minimise_deadline_risk · ⓒ defer
  const orderedKinds: StrategyKind[] = [
    "minimise_rice_loss",
    "minimise_deadline_risk",
    "defer",
  ];
  const orderedOptions = orderedKinds
    .map((k) => options.find((o) => o.kind === k))
    .filter((o): o is StrategyOption => !!o);

  const minScore = Math.min(...orderedOptions.map((o) => o.score_impact));

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="mt-4 overflow-hidden"
    >
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-warning-soft)",
          border: "1px dashed var(--color-warning)",
        }}
      >
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--color-warning)" }}>
          <AlertTriangle size={12} />
          <span className="font-semibold">Over capacity — release on a strategy</span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {orderedOptions.map((opt, idx) => {
            const Icon = STRATEGY_ICONS[opt.kind];
            const letter = String.fromCharCode(65 + idx); // A B C
            const isAIDefault = opt.score_impact === minScore && opt.kind === "minimise_rice_loss";
            const inQuarterPushes = opt.impact.pushed_items.filter((p) => !p.deferred);
            const deferredPushes = opt.impact.pushed_items.filter((p) => p.deferred);

            return (
              <div
                key={opt.kind}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPick(opt.kind, e);
                }}
                className="rounded-lg p-3 transition cursor-pointer"
                style={{
                  background: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-numeric inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold"
                    style={{
                      background: "var(--color-surface-sunken)",
                      color: "var(--color-tertiary)",
                    }}
                  >
                    {letter}
                  </span>
                  <Icon size={12} style={{ color: "var(--color-secondary)" }} />
                  <span
                    className="text-[12.5px] font-semibold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {opt.label}
                  </span>
                  {isAIDefault && (
                    <span
                      className="ml-auto rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                      style={{
                        background: "var(--color-accent-soft)",
                        color: "var(--color-accent)",
                      }}
                    >
                      AI default
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11.5px] leading-snug" style={{ color: "var(--color-tertiary)" }}>
                  {opt.rationale}
                </p>
                {opt.impact.pushed_items.length === 0 ? (
                  <p className="mt-2 text-[11px]" style={{ color: "var(--color-muted)" }}>
                    Nothing has to move.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {inQuarterPushes.map((p) => (
                      <li
                        key={p.initiative_id}
                        className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: "var(--color-secondary)" }}
                      >
                        <span style={{ color: "var(--color-tertiary)" }}>↓</span>
                        <span className="truncate">{p.title}</span>
                        <span className="font-numeric shrink-0" style={{ color: "var(--color-tertiary)" }}>
                          → S{p.to_sprint}
                        </span>
                      </li>
                    ))}
                    {deferredPushes.map((p) => (
                      <li
                        key={p.initiative_id}
                        className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: "var(--color-secondary)" }}
                      >
                        <Clock size={10} style={{ color: "var(--color-warning)" }} />
                        <span className="truncate">{p.title}</span>
                        <span className="font-numeric shrink-0" style={{ color: "var(--color-warning)" }}>
                          → Q3
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div
                  className="mt-2.5 flex items-center justify-between text-[10.5px]"
                  style={{ color: "var(--color-tertiary)" }}
                >
                  <span>Score impact</span>
                  <span
                    className="font-numeric font-medium"
                    style={{
                      color:
                        opt.score_impact === minScore
                          ? "var(--color-success)"
                          : opt.score_impact > minScore * 2
                            ? "var(--color-warning)"
                            : "var(--color-secondary)",
                    }}
                  >
                    {opt.score_impact === 0 ? "none" : opt.score_impact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
