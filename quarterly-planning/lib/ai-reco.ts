/**
 * AI-recommendation mapping + divergence helpers.
 *
 * The AI always recommends in the {commit, defer, escalate} space
 * (RecommendedAction). The PM acts in two other vocabularies:
 *   • Triage (Now card / swipe deck): promote | escalate | defer
 *   • Decisions (commit-confirm / calendar / escalate): committed | deferred
 *     | escalated | overridden
 *
 * To compare "what the AI recommended" against "what the PM actually did"
 * we normalise everything to RecommendedAction. Divergence — where the PM
 * chose differently — is the signal that recalibrates the engine, so it's
 * surfaced as a first-class concept in the Audit log.
 */

import type { RecommendedAction } from "@/lib/types";
import type { TriageAction } from "@/lib/triage";
import type { Decision, DecisionAction } from "@/lib/decisions";

/* ── label vocabularies ── */

export const ACTION_VERB: Record<RecommendedAction, string> = {
  commit: "Commit",
  defer: "Defer",
  escalate: "Escalate",
};

export const TRIAGE_VERB: Record<TriageAction, string> = {
  promote: "Promote",
  defer: "Defer",
  escalate: "Escalate",
};

/* ── cross-vocabulary maps ── */

/** AI recommendation → the equivalent triage action (Now card / swipe deck). */
export const AI_TO_TRIAGE: Record<RecommendedAction, TriageAction> = {
  commit: "promote",
  defer: "defer",
  escalate: "escalate",
};

/** Triage action → the AI-space action it corresponds to. */
export const TRIAGE_TO_AI: Record<TriageAction, RecommendedAction> = {
  promote: "commit",
  defer: "defer",
  escalate: "escalate",
};

/** The triage action the AI would take for a given recommendation. */
export function recommendedTriageAction(aiAction: RecommendedAction): TriageAction {
  return AI_TO_TRIAGE[aiAction];
}

/**
 * The concrete RecommendedAction a logged decision realised.
 *
 * committed/deferred/escalated map directly. "overridden" decisions carry the
 * realised choice in `realized_action` (set by the deep Decide view); when
 * that's absent (older data) we can't tell, so we return null.
 */
export function realizedActionOf(decision: Decision): RecommendedAction | null {
  if (decision.realized_action) return decision.realized_action;
  return decisionActionToAI(decision.action);
}

function decisionActionToAI(action: DecisionAction): RecommendedAction | null {
  switch (action) {
    case "committed":
      return "commit";
    case "deferred":
      return "defer";
    case "escalated":
      return "escalate";
    case "overridden":
      return null; // realised choice lives in realized_action
  }
}
