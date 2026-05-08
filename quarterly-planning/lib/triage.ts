"use client";

/**
 * Triage state — promote / route / defer decisions made on Inbox items
 * before they reach the Prioritize surface. Pre-prioritization layer.
 */

import { useEffect, useState } from "react";

export type TriageAction = "promote" | "route" | "defer";

export interface TriageDecision {
  initiative_id: string;
  action: TriageAction;
  decided_at: string; // ISO
}

const STORAGE_KEY = "qp_triage_v2";
const EVENT_NAME = "qp_triage_changed";

function readAll(): TriageDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TriageDecision[];
  } catch {
    return [];
  }
}

function writeAll(list: TriageDecision[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getTriage(): TriageDecision[] {
  return readAll();
}

export function setTriageAction(initiative_id: string, action: TriageAction) {
  const list = readAll().filter((t) => t.initiative_id !== initiative_id);
  list.push({ initiative_id, action, decided_at: new Date().toISOString() });
  writeAll(list);
}

export function clearTriage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useTriage() {
  const [triage, setTriage] = useState<TriageDecision[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTriage(readAll());
    setHydrated(true);
    const handler = () => setTriage(readAll());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { triage, hydrated };
}
