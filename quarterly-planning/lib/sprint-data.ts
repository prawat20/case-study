/**
 * Sprint data — synthesizes a Q3 plan from initiatives.json, with
 * capacity math, status, and date ranges. Lives client-side so the
 * Calendar surface can mutate it locally (drag-to-resequence) without
 * needing a backend.
 */

import type { Initiative } from "@/lib/types";

export interface Sprint {
  id: string;
  index: number; // 1-based
  label: string; // "Sprint 1"
  date_label: string; // "May 12 — May 23"
  capacity: number; // total points
  status: "shipped" | "in_flight" | "planned" | "future";
}

export interface PlannedItem {
  initiative_id: string;
  title: string;
  effort_points: number;
  status: "shipped" | "in_flight" | "planned";
  signal_kind: "revenue" | "deals" | "support" | "deadline" | "strategic";
  arr_exposure_usd?: number;
}

export const SPRINT_CAPACITY = 12;

export const SPRINTS: Sprint[] = [
  { id: "s1", index: 1, label: "Sprint 1", date_label: "May 12 — May 23", capacity: SPRINT_CAPACITY, status: "shipped" },
  { id: "s2", index: 2, label: "Sprint 2", date_label: "May 26 — Jun 6",  capacity: SPRINT_CAPACITY, status: "in_flight" },
  { id: "s3", index: 3, label: "Sprint 3", date_label: "Jun 9 — Jun 20",  capacity: SPRINT_CAPACITY, status: "planned" },
  { id: "s4", index: 4, label: "Sprint 4", date_label: "Jun 23 — Jul 4",  capacity: SPRINT_CAPACITY, status: "planned" },
];

/** Parse "Q3 Sprint 2" or similar → sprint index. Falls back to 3. */
export function parseSequenceToSprint(sequence: string | undefined): number {
  if (!sequence) return 3;
  const m = sequence.match(/Sprint\s*(\d)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 4) return n;
  }
  if (/sprint\s*1/i.test(sequence)) return 1;
  if (/sprint\s*2/i.test(sequence)) return 2;
  if (/sprint\s*3/i.test(sequence)) return 3;
  return 4;
}

/** Effort points = effort_sprints × 4 (so 1-sprint item = 4 of 12 capacity) */
export function effortPoints(initiative: Initiative): number {
  const e = initiative.ai_recommendation.effort_sprints;
  return Math.max(2, Math.min(12, e * 4));
}

/** Sprint index → status */
export function sprintStatusForIndex(index: number): Sprint["status"] {
  return SPRINTS[index - 1]?.status ?? "future";
}
