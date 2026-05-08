"use client";

/**
 * Captured asks — items added via Cmd+N. They appear at the top of Inbox
 * as "Just landed" until triaged.
 */

import { useEffect, useState } from "react";

export interface Capture {
  id: string;
  text: string;
  source: string;
  channel: string;
  signal: string;
  arr_exposure_usd?: number;
  captured_at: string;
}

const STORAGE_KEY = "qp_captures_v2";
const EVENT_NAME = "qp_captures_changed";

function readAll(): Capture[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Capture[];
  } catch {
    return [];
  }
}

function writeAll(list: Capture[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getCaptures(): Capture[] {
  return readAll();
}

export function addCapture(c: Omit<Capture, "id" | "captured_at">) {
  const id = `cap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const captured_at = new Date().toISOString();
  const list = readAll();
  list.unshift({ ...c, id, captured_at });
  writeAll(list);
}

export function clearCaptures() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useCaptures() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCaptures(readAll());
    setHydrated(true);
    const handler = () => setCaptures(readAll());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { captures, hydrated };
}

/* ─────────── Source / signal inference ────────── */

export function inferCaptureMeta(text: string): {
  source: string;
  channel: string;
  signal: string;
} {
  const lower = text.toLowerCase();

  let source = "Unattributed";
  if (/\b(sales|deal|account|prospect|pipeline|enterprise)\b/.test(lower)) source = "Sales";
  else if (/\b(support|ticket|bug|broken|crash)\b/.test(lower)) source = "Support";
  else if (/\b(cs|customer success|csat|churn|adoption)\b/.test(lower)) source = "Customer Success";
  else if (/\b(cpo|exec|leadership|board|investor)\b/.test(lower)) source = "Exec";
  else if (/\b(eng|engineering|tech debt|refactor|infra)\b/.test(lower)) source = "Engineering";

  let channel = "Notes";
  if (/\b(slack|dm|message)\b/.test(lower)) channel = "Slack";
  else if (/\b(email|inbox)\b/.test(lower)) channel = "Email";
  else if (/\b(call|gong|meeting)\b/.test(lower)) channel = "Customer call";
  else if (/\b(linear|ticket|issue)\b/.test(lower)) channel = "Linear";

  let signal = "strategic";
  if (/\b(arr|revenue|deal|enterprise|expansion|\$)\b/.test(lower)) signal = "revenue";
  else if (/\b(churn|csat|nps|customer|adoption|onboarding)\b/.test(lower)) signal = "customer";
  else if (/\b(bug|crash|outage|broken|down|p95|latency)\b/.test(lower)) signal = "support";
  else if (/\b(soc|gdpr|compliance|audit|deadline|launch)\b/.test(lower)) signal = "deadline";

  return { source, channel, signal };
}
