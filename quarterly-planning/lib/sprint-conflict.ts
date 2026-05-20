/**
 * Sprint conflict / commit impact engine.
 *
 * Given an initiative being committed to a target sprint, work out:
 *   - the load before and after the commit (raw, may exceed capacity)
 *   - which existing items have to be pushed out to make room
 *   - the resolved load per sprint after pushes are applied
 *   - a fully-resolved final assignment map ready to persist
 *
 * v3 (move #2): the engine now supports three strategies for resolving
 * over-capacity drops, surfaced to the UI at the moment of decision so
 * trade-offs are visible *before* commit, not narrated after.
 *
 *   • minimise_rice_loss      — keep highest-priority items in place,
 *                                push lowest-priority items downstream
 *   • minimise_deadline_risk  — keep deadline/compliance items in place,
 *                                push non-deadline items first
 *   • defer                    — don't reflow within Q2 at all; displaced
 *                                items get deferred to next quarter
 */

import type { Initiative } from "@/lib/types";
import type { Decision } from "@/lib/decisions";
import {
  SPRINTS,
  SPRINT_CAPACITY,
  effortPoints,
  parseSequenceToSprint,
} from "@/lib/sprint-data";
import type { Assignments } from "@/lib/calendar-state";

export type StrategyKind =
  | "minimise_rice_loss"
  | "minimise_deadline_risk"
  | "defer";

export const DEFERRED_SPRINT = -1;

export interface PushedItem {
  initiative_id: string;
  title: string;
  from_sprint: number;
  to_sprint: number; // DEFERRED_SPRINT (-1) if pushed out of Q2 entirely
  effort_points: number;
  deferred?: boolean;
}

export interface CommitImpact {
  target_sprint: number;
  target_sprint_label: string;
  before_load: number;
  after_load: number; // raw load if the item lands without any pushes
  resolved_load: number; // load after pushes applied
  capacity: number;
  overflow: boolean; // whether the raw add overflows
  pushed_items: PushedItem[];
  final_assignments: Assignments;
  resolved_sprint_loads: Record<number, number>;
  strategy: StrategyKind;
}

export interface StrategyOption {
  kind: StrategyKind;
  label: string;
  rationale: string;
  impact: CommitImpact;
  score_impact: number; // higher = more priority value displaced (worse trade)
}

export interface ComputeArgs {
  initiative: Initiative;
  allInitiatives: Initiative[];
  decisions: Decision[];
  assignments: Assignments;
  strategy?: StrategyKind;
  targetSprint?: number; // explicit override (used during drag-hover)
}

/* ────────── strategy candidate ranking ────────── */

function isDeadlineCritical(i: Initiative): boolean {
  return i.signal_type === "deadline" || i.signal_type === "compliance";
}

function pushPriorityScore(i: Initiative, strategy: StrategyKind): number {
  // Higher score = pushed first.
  const rank = i.priority_rank ?? 99;
  if (strategy === "minimise_deadline_risk") {
    // Non-deadline items push first; among deadline items, lowest priority pushes first.
    return (isDeadlineCritical(i) ? 0 : 1000) + rank;
  }
  // Default: minimise RICE loss → push lowest-priority first (highest rank number).
  return rank;
}

/* ────────── score impact (for ranking the 3 options visually) ────────── */

function computeScoreImpact(impact: CommitImpact, allInitiatives: Initiative[]): number {
  let total = 0;
  for (const pushed of impact.pushed_items) {
    const it = allInitiatives.find((i) => i.id === pushed.initiative_id);
    if (!it) continue;
    const priorityWeight = Math.max(1, 10 - (it.priority_rank ?? 5));
    // Deferred items count as a 5-sprint shift (worse than any in-quarter push).
    const shift = pushed.deferred ? 5 : pushed.to_sprint - pushed.from_sprint;
    total += priorityWeight * Math.max(1, shift);
  }
  return total;
}

/* ────────── core impact engine ────────── */

export function computeCommitImpact(args: ComputeArgs): CommitImpact {
  const { initiative, allInitiatives, decisions, assignments } = args;
  const strategy: StrategyKind = args.strategy ?? "minimise_rice_loss";

  const targetSprint =
    args.targetSprint ??
    assignments[initiative.id] ??
    parseSequenceToSprint(initiative.ai_recommendation.sequence);
  const targetSprintLabel =
    SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`;

  const decidedMap = new Map(decisions.map((d) => [d.initiative_id, d.action]));

  // Build current sprint occupancy excluding the item being committed
  // and excluding already-deferred items.
  const sprintItems: Record<number, Initiative[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const i of allInitiatives) {
    if (i.id === initiative.id) continue;
    const decided = decidedMap.get(i.id);
    if (decided === "deferred") continue;
    const sprint = assignments[i.id] ?? parseSequenceToSprint(i.ai_recommendation.sequence);
    if (sprint < 1 || sprint > SPRINTS.length) continue;
    sprintItems[sprint].push(i);
  }

  const itemEffort = effortPoints(initiative);
  const beforeLoad = (sprintItems[targetSprint] ?? []).reduce(
    (a, i) => a + effortPoints(i),
    0,
  );
  const afterLoad = beforeLoad + itemEffort;

  const sprintLoads: Record<number, number> = {};
  for (const idx of Object.keys(sprintItems).map(Number)) {
    sprintLoads[idx] = (sprintItems[idx] ?? []).reduce(
      (a, i) => a + effortPoints(i),
      0,
    );
  }
  sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) + itemEffort;

  const finalAssignments: Assignments = { ...assignments, [initiative.id]: targetSprint };
  const pushedItems: PushedItem[] = [];

  const workingItems: Record<number, Initiative[]> = {
    1: [...sprintItems[1]],
    2: [...sprintItems[2]],
    3: [...sprintItems[3]],
    4: [...sprintItems[4]],
  };

  let safety = 0;
  while ((sprintLoads[targetSprint] ?? 0) > SPRINT_CAPACITY && safety < 10) {
    safety++;

    const candidates = workingItems[targetSprint]
      .filter((i) => i.status !== "sequenced")
      .sort((a, b) => pushPriorityScore(b, strategy) - pushPriorityScore(a, strategy));

    if (candidates.length === 0) break;
    const pushTarget = candidates[0];
    const pushEffort = effortPoints(pushTarget);

    if (strategy === "defer") {
      // Push out of Q2 entirely — no in-quarter cascade.
      sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) - pushEffort;
      delete finalAssignments[pushTarget.id];
      workingItems[targetSprint] = workingItems[targetSprint].filter(
        (x) => x.id !== pushTarget.id,
      );
      pushedItems.push({
        initiative_id: pushTarget.id,
        title: pushTarget.title,
        from_sprint: targetSprint,
        to_sprint: DEFERRED_SPRINT,
        effort_points: pushEffort,
        deferred: true,
      });
      continue;
    }

    // In-quarter strategies: find next sprint with room.
    let landed = false;
    for (let s = targetSprint + 1; s <= SPRINTS.length; s++) {
      const projectedLoad = (sprintLoads[s] ?? 0) + pushEffort;
      if (projectedLoad <= SPRINT_CAPACITY) {
        sprintLoads[s] = projectedLoad;
        sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) - pushEffort;
        finalAssignments[pushTarget.id] = s;
        workingItems[targetSprint] = workingItems[targetSprint].filter(
          (x) => x.id !== pushTarget.id,
        );
        workingItems[s] = [...(workingItems[s] ?? []), pushTarget];
        pushedItems.push({
          initiative_id: pushTarget.id,
          title: pushTarget.title,
          from_sprint: targetSprint,
          to_sprint: s,
          effort_points: pushEffort,
        });
        landed = true;
        break;
      }
    }

    if (!landed) {
      // No downstream sprint has room — push to the last sprint regardless.
      const last = SPRINTS.length;
      sprintLoads[last] = (sprintLoads[last] ?? 0) + pushEffort;
      sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) - pushEffort;
      finalAssignments[pushTarget.id] = last;
      workingItems[targetSprint] = workingItems[targetSprint].filter(
        (x) => x.id !== pushTarget.id,
      );
      workingItems[last] = [...(workingItems[last] ?? []), pushTarget];
      pushedItems.push({
        initiative_id: pushTarget.id,
        title: pushTarget.title,
        from_sprint: targetSprint,
        to_sprint: last,
        effort_points: pushEffort,
      });
    }
  }

  return {
    target_sprint: targetSprint,
    target_sprint_label: targetSprintLabel,
    before_load: beforeLoad,
    after_load: afterLoad,
    resolved_load: sprintLoads[targetSprint] ?? 0,
    capacity: SPRINT_CAPACITY,
    overflow: afterLoad > SPRINT_CAPACITY,
    pushed_items: pushedItems,
    final_assignments: finalAssignments,
    resolved_sprint_loads: sprintLoads,
    strategy,
  };
}

/* ────────── strategy options for the trade-off panel ────────── */

const STRATEGY_LABEL: Record<StrategyKind, string> = {
  minimise_rice_loss: "Minimise score loss",
  minimise_deadline_risk: "Minimise deadline risk",
  defer: "Defer to next quarter",
};

const STRATEGY_RATIONALE: Record<StrategyKind, string> = {
  minimise_rice_loss:
    "Push the lowest-RICE items downstream. Keeps the highest-impact work on its current dates.",
  minimise_deadline_risk:
    "Protect deadline-sensitive items (compliance, time-bound). Push everything else first.",
  defer:
    "Don't reflow within Q2. Move displaced items to next quarter instead.",
};

export function computeStrategyOptions(args: ComputeArgs): StrategyOption[] {
  const strategies: StrategyKind[] = [
    "minimise_rice_loss",
    "minimise_deadline_risk",
    "defer",
  ];

  return strategies.map((kind) => {
    const impact = computeCommitImpact({ ...args, strategy: kind });
    return {
      kind,
      label: STRATEGY_LABEL[kind],
      rationale: STRATEGY_RATIONALE[kind],
      impact,
      score_impact: computeScoreImpact(impact, args.allInitiatives),
    };
  });
}
