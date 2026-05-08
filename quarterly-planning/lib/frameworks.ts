/**
 * Framework scoring synthesis — computes a per-framework breakdown
 * from an initiative's existing fields. Lets the Prioritize surface
 * render a visible scorecard for any framework the PM chooses without
 * authoring per-framework data per-initiative.
 *
 * The math here is pragmatic, not academically pure — enough to make
 * the relative ordering of items defensible in the demo. Real product
 * would source these inputs from configurable scoring rubrics.
 */

import type { Initiative, Framework } from "@/lib/types";

export interface ScoringRow {
  label: string;
  value: string;
  hint?: string;
}

export interface FrameworkScoring {
  framework: Framework;
  rows: ScoringRow[];
  total: { label: string; value: string };
  description: string; // 1-line "what this framework optimizes for"
  rationale: string; // why this initiative scores how it does
}

const ALL_FRAMEWORKS: Framework[] = [
  "RICE",
  "ICE",
  "Value/Effort",
  "Strategic Bet",
  "WSJF",
];

export function listFrameworks(): Framework[] {
  return ALL_FRAMEWORKS;
}

/* ─────────── Numeric helpers ─────────── */

const CONFIDENCE_PCT = { low: 50, medium: 75, high: 90 } as const;

function reach(initiative: Initiative): number {
  // Synthesize a "reach" score (number of accounts/users impacted) from
  // ARR exposure if present, otherwise from priority_rank as a stand-in.
  const arr = initiative.arr_exposure_usd ?? 0;
  if (arr > 0) {
    if (arr >= 1_000_000) return 30;
    if (arr >= 500_000) return 18;
    if (arr >= 200_000) return 12;
    if (arr >= 50_000) return 6;
    return 3;
  }
  const rank = initiative.priority_rank ?? 5;
  return Math.max(2, 14 - rank * 2);
}

function impactNumber(initiative: Initiative): number {
  const sig = initiative.signal_type;
  if (sig === "deal_blocker") return 3;
  if (sig === "compliance") return 3;
  if (sig === "deadline") return 3;
  if (sig === "support_pain") return 2;
  return 2;
}

function confidencePct(initiative: Initiative): number {
  return CONFIDENCE_PCT[initiative.ai_recommendation.eng_confidence];
}

function effortSprints(initiative: Initiative): number {
  return Math.max(1, initiative.ai_recommendation.effort_sprints);
}

function valueLabel(initiative: Initiative): "High" | "Medium" | "Low" {
  const arr = initiative.arr_exposure_usd ?? 0;
  if (arr >= 500_000) return "High";
  if (arr >= 100_000) return "Medium";
  if (initiative.signal_type === "compliance" || initiative.signal_type === "deadline") return "High";
  return "Low";
}

/* ─────────── Per-framework scoring ─────────── */

export function getScoring(framework: Framework, i: Initiative): FrameworkScoring {
  const r = reach(i);
  const imp = impactNumber(i);
  const conf = confidencePct(i);
  const eff = effortSprints(i);

  switch (framework) {
    case "RICE": {
      const score = (r * imp * (conf / 100)) / eff;
      return {
        framework,
        description: "Reach × Impact × Confidence ÷ Effort. Best for shippable features with measurable scope.",
        rationale: `${r} accounts reach × impact ${imp} × ${conf}% confidence ÷ ${eff} sprint${eff > 1 ? "s" : ""} effort.`,
        rows: [
          { label: "Reach", value: `${r} accts` },
          { label: "Impact", value: imp.toString(), hint: "1=low, 3=high" },
          { label: "Confidence", value: `${conf}%` },
          { label: "Effort", value: `${eff} sprint${eff > 1 ? "s" : ""}` },
        ],
        total: { label: "RICE", value: score.toFixed(1) },
      };
    }
    case "ICE": {
      const ease = Math.max(1, 11 - eff * 2);
      const score = (imp * 3 + (conf / 10) + ease) / 3;
      return {
        framework,
        description: "Impact × Confidence × Ease, averaged. Best for experiments with quick ship-to-learn cycles.",
        rationale: `Impact ${imp}/3 · confidence ${conf}% · ease ${ease}/10.`,
        rows: [
          { label: "Impact", value: imp.toString(), hint: "1-3" },
          { label: "Confidence", value: `${conf}%` },
          { label: "Ease", value: `${ease}/10` },
        ],
        total: { label: "ICE", value: score.toFixed(1) },
      };
    }
    case "Value/Effort": {
      const v = valueLabel(i);
      const ratio =
        v === "High" ? 3 / eff : v === "Medium" ? 2 / eff : 1 / eff;
      return {
        framework,
        description: "Pure value-to-effort ratio. Best for quick triage between obvious wins and obvious sinks.",
        rationale: `${v} value, ${eff} sprint${eff > 1 ? "s" : ""} effort.`,
        rows: [
          { label: "Value", value: v },
          { label: "Effort", value: `${eff} sprint${eff > 1 ? "s" : ""}` },
        ],
        total: { label: "Value/Effort", value: ratio.toFixed(2) },
      };
    }
    case "Strategic Bet": {
      const okrs = i.ai_recommendation.okr_alignment.length;
      const alignment = okrs >= 2 ? "Strong" : okrs === 1 ? "Single" : "Weak";
      const upside = valueLabel(i);
      const downside =
        i.signal_type === "compliance" || i.signal_type === "deadline"
          ? "Loss-avoidance"
          : "Opportunity-loss";
      return {
        framework,
        description: "Qualitative bet — OKR alignment, upside, downside. Best for big swings without comparable peers.",
        rationale: `${alignment} OKR alignment with ${upside.toLowerCase()} upside; downside is ${downside.toLowerCase()}.`,
        rows: [
          { label: "OKR alignment", value: alignment },
          { label: "Upside", value: upside },
          { label: "Downside", value: downside },
        ],
        total: { label: "Bet posture", value: alignment === "Strong" && upside === "High" ? "Take" : alignment === "Weak" ? "Park" : "Watch" },
      };
    }
    case "WSJF": {
      // Cost of delay = (user-business value + time criticality + risk reduction) / job size
      const tc =
        i.signal_type === "deal_blocker" || i.signal_type === "deadline" ? 9 : i.signal_type === "compliance" ? 8 : 5;
      const ubv = i.arr_exposure_usd && i.arr_exposure_usd >= 500_000 ? 9 : i.arr_exposure_usd && i.arr_exposure_usd >= 100_000 ? 7 : 5;
      const rr = i.signal_type === "compliance" ? 8 : 4;
      const cod = ubv + tc + rr;
      const wsjf = cod / eff;
      return {
        framework,
        description: "Cost of delay ÷ job size. Best for dependency-heavy work where timing matters.",
        rationale: `Cost of delay ${cod} (UBV ${ubv} + TC ${tc} + RR ${rr}) ÷ job size ${eff}.`,
        rows: [
          { label: "User-Biz Value", value: `${ubv}/10` },
          { label: "Time crit.", value: `${tc}/10` },
          { label: "Risk reduction", value: `${rr}/10` },
          { label: "Job size", value: `${eff} sprint${eff > 1 ? "s" : ""}` },
        ],
        total: { label: "WSJF", value: wsjf.toFixed(1) },
      };
    }
  }
}
