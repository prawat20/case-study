/**
 * Inbox display helpers — synthesize arrival metadata for items in
 * initiatives.json (which doesn't carry arrival timestamps). These
 * are demo-only; real wire-in would come from the capture pipeline.
 */

import type { Initiative, StakeholderSignal, SignalType } from "@/lib/types";

const SOURCE_LABEL: Record<StakeholderSignal, string> = {
  sales: "Sales",
  cs: "Customer Success",
  support: "Support",
  exec: "CPO",
  eng: "Engineering",
};

const CHANNEL_BY_SIGNAL: Record<SignalType, string> = {
  deal_blocker: "Slack",
  support_pain: "Linear",
  compliance: "Email",
  deadline: "Slack",
  strategic: "Email",
};

/* Synthesized "minutes ago" — keyed off priority_rank for demo coherence. */
const MINUTES_BY_RANK: Record<number, number> = {
  1: 11,
  2: 24,
  3: 62,
  4: 138,
  5: 224,
  6: 312,
  7: 480,
  8: 720,
};

export function getSourceLabel(initiative: Initiative): string {
  const first = initiative.stakeholder_signals[0];
  return first ? SOURCE_LABEL[first] : "Unattributed";
}

export function getChannelLabel(initiative: Initiative): string {
  return CHANNEL_BY_SIGNAL[initiative.signal_type] ?? "Notes";
}

export function getMinutesAgo(initiative: Initiative): number {
  const rank = initiative.priority_rank ?? 8;
  return MINUTES_BY_RANK[rank] ?? 720;
}

export function formatRelative(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/**
 * "Just landed" cutoff — items <= this many minutes are grouped under
 * the freshest section.
 */
export const JUST_LANDED_CUTOFF_MIN = 90;

/**
 * Map our triage signal categories to evidence-chip kinds for visual reuse.
 */
export function signalToKind(signal: SignalType | string): "revenue" | "deals" | "support" | "deadline" | "strategic" {
  if (signal === "deal_blocker") return "deals";
  if (signal === "support_pain") return "support";
  if (signal === "compliance") return "deadline";
  if (signal === "deadline") return "deadline";
  if (signal === "strategic") return "strategic";
  // capture-flavored signals
  if (signal === "revenue") return "revenue";
  if (signal === "customer") return "support";
  return "strategic";
}
