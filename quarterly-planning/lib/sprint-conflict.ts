/**
 * Compute commit impact — given an initiative being committed, work
 * out the target sprint, the current load, the load after committing,
 * which (if any) items need to be pushed to next sprints to make room,
 * and a fully-resolved final assignment map.
 *
 * This is the JBTD-4 move surfaced at the moment of decision: trade-offs
 * are not abstract narration, they're the actual sprint reflow that will
 * happen if the PM confirms.
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

export interface PushedItem {
  initiative_id: string;
  title: string;
  from_sprint: number;
  to_sprint: number;
  effort_points: number;
}

export interface CommitImpact {
  target_sprint: number;
  target_sprint_label: string;
  before_load: number;
  after_load: number; // can exceed capacity prior to push
  resolved_load: number; // load after pushes applied
  capacity: number;
  overflow: boolean; // whether the raw add overflows
  pushed_items: PushedItem[];
  final_assignments: Assignments;
  // Resolved load per sprint after pushes
  resolved_sprint_loads: Record<number, number>;
}

export interface ComputeArgs {
  initiative: Initiative;
  allInitiatives: Initiative[];
  decisions: Decision[];
  assignments: Assignments;
}

export function computeCommitImpact(args: ComputeArgs): CommitImpact {
  const { initiative, allInitiatives, decisions, assignments } = args;

  const targetSprint =
    assignments[initiative.id] ??
    parseSequenceToSprint(initiative.ai_recommendation.sequence);
  const targetSprintLabel =
    SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`;

  const decidedMap = new Map(decisions.map((d) => [d.initiative_id, d.action]));

  // Build current sprint occupancy excluding the item being committed
  // and excluding already-deferred items
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

  // Final per-sprint load tracker, mutated as items are pushed
  const sprintLoads: Record<number, number> = {};
  for (const idx of Object.keys(sprintItems).map(Number)) {
    sprintLoads[idx] = (sprintItems[idx] ?? []).reduce(
      (a, i) => a + effortPoints(i),
      0,
    );
  }
  // Lock in the new item in target sprint
  sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) + itemEffort;

  const finalAssignments: Assignments = { ...assignments, [initiative.id]: targetSprint };
  const pushedItems: PushedItem[] = [];

  // Working copy of who's in each sprint, so we can pop pushers out
  const workingItems: Record<number, Initiative[]> = {
    1: [...sprintItems[1]],
    2: [...sprintItems[2]],
    3: [...sprintItems[3]],
    4: [...sprintItems[4]],
  };

  // While target sprint is over capacity, push lowest-priority candidate
  let safety = 0;
  while ((sprintLoads[targetSprint] ?? 0) > SPRINT_CAPACITY && safety < 10) {
    safety++;
    // Already-shipped or in-flight (sprint 1 & 2 with status "sequenced") are not push candidates
    const candidates = workingItems[targetSprint]
      .filter((i) => i.status !== "sequenced") // committed already-running items resist push
      .sort((a, b) => (b.priority_rank ?? 99) - (a.priority_rank ?? 99));

    if (candidates.length === 0) break;
    const pushTarget = candidates[0];
    const pushEffort = effortPoints(pushTarget);

    // Find next sprint with room
    let landed = false;
    for (let s = targetSprint + 1; s <= SPRINTS.length; s++) {
      const projectedLoad = (sprintLoads[s] ?? 0) + pushEffort;
      if (projectedLoad <= SPRINT_CAPACITY) {
        sprintLoads[s] = projectedLoad;
        sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) - pushEffort;
        finalAssignments[pushTarget.id] = s;
        workingItems[targetSprint] = workingItems[targetSprint].filter((x) => x.id !== pushTarget.id);
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
      // No downstream sprint has room — push to the last sprint regardless (visible overflow)
      const last = SPRINTS.length;
      sprintLoads[last] = (sprintLoads[last] ?? 0) + pushEffort;
      sprintLoads[targetSprint] = (sprintLoads[targetSprint] ?? 0) - pushEffort;
      finalAssignments[pushTarget.id] = last;
      workingItems[targetSprint] = workingItems[targetSprint].filter((x) => x.id !== pushTarget.id);
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
  };
}
