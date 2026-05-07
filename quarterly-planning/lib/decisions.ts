export type DecisionAction =
  | "committed"
  | "deferred"
  | "escalated"
  | "overridden";

export interface Decision {
  initiative_id: string;
  action: DecisionAction;
  ai_suggestion: string;
  human_rationale?: string;
  sequence?: string;
  decided_at: string;
}

const KEY = "qp_decisions_v1";
const EVENT = "qp:decisions-updated";

export function getDecisions(): Decision[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Decision[]) : [];
  } catch {
    return [];
  }
}

export function setDecisions(decisions: Decision[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(decisions));
  window.dispatchEvent(new Event(EVENT));
}

export function addDecision(d: Decision) {
  const others = getDecisions().filter(
    (x) => x.initiative_id !== d.initiative_id,
  );
  setDecisions([...others, d]);
}

export function clearDecisions() {
  setDecisions([]);
}

export const DECISIONS_EVENT = EVENT;
