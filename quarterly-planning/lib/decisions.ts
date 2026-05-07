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

// User-chosen framework overrides per initiative (the brief: "framework of user's choice")
const FRAMEWORK_KEY = "qp_framework_overrides_v1";
const FRAMEWORK_EVENT = "qp:framework-overrides-updated";

export type FrameworkOverrides = Record<string, string>;

export function getFrameworkOverrides(): FrameworkOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FRAMEWORK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setFrameworkOverride(initiativeId: string, framework: string) {
  if (typeof window === "undefined") return;
  const all = getFrameworkOverrides();
  all[initiativeId] = framework;
  localStorage.setItem(FRAMEWORK_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(FRAMEWORK_EVENT));
}

export function clearFrameworkOverrides() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FRAMEWORK_KEY);
  window.dispatchEvent(new Event(FRAMEWORK_EVENT));
}

export const FRAMEWORK_OVERRIDES_EVENT = FRAMEWORK_EVENT;
