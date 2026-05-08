"use client";

/**
 * Calendar state — sprint assignments + lock — shared between
 * Calendar (drag-to-resequence) and Prioritize (commit-with-impact).
 */

import { useEffect, useState } from "react";

const ASSIGNMENT_KEY = "qp_calendar_assignments_v2";
const LOCK_KEY = "qp_calendar_locked_v2";
const EVENT_NAME = "qp_calendar_changed";

export type Assignments = Record<string, number>;

export function getAssignments(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ASSIGNMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAssignments(a: Assignments) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(a));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function setSingleAssignment(initiative_id: string, sprint_index: number) {
  const all = getAssignments();
  all[initiative_id] = sprint_index;
  saveAssignments(all);
}

export function getLocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LOCK_KEY) === "true";
}

export function saveLocked(b: boolean) {
  if (typeof window === "undefined") return;
  if (b) window.localStorage.setItem(LOCK_KEY, "true");
  else window.localStorage.removeItem(LOCK_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function clearCalendarState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ASSIGNMENT_KEY);
  window.localStorage.removeItem(LOCK_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export const CALENDAR_EVENT = EVENT_NAME;

export function useCalendarState() {
  const [assignments, setAssignmentsState] = useState<Assignments>({});
  const [locked, setLockedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAssignmentsState(getAssignments());
    setLockedState(getLocked());
    setHydrated(true);
    const handler = () => {
      setAssignmentsState(getAssignments());
      setLockedState(getLocked());
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { assignments, locked, hydrated };
}
