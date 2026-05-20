// Strategic context for the quarter — North Star + OKRs.
// Drives the strategic banner on Priority Stream, OKR alignment on each
// Initiative Detail, and the AI's recommendation reasoning.

export interface NorthStar {
  metric: string;
  current_value: number;
  target_value: number;
  format: "usd" | "count" | "percent";
  period: string;
  // Time progress through the period — used to compute pace
  weeks_elapsed: number;
  weeks_total: number;
}

export interface NorthStarComputed {
  achieved_pct: number; // 0-100
  elapsed_pct: number; // 0-100
  pace_gap_pp: number; // positive = ahead, negative = behind
  trend: "ahead" | "on_track" | "behind";
}

export interface OKR {
  id: string;
  label: string;
  objective: string;
  key_results: string[];
}

// Q2 2026 — early-quarter anchor. Sprint 1 has shipped; Sprint 2 is in
// flight; Sprints 3 + 4 are planned. The 6pp "behind pace" trend is
// deliberate demo tension (NSM 25% achieved vs 31% elapsed).
export const NORTH_STAR: NorthStar = {
  metric: "Net New ARR",
  current_value: 600_000,
  target_value: 2_400_000,
  format: "usd",
  period: "Q2 2026",
  weeks_elapsed: 4,
  weeks_total: 13,
};

export function computeNorthStar(ns: NorthStar): NorthStarComputed {
  const achieved_pct = Math.round((ns.current_value / ns.target_value) * 100);
  const elapsed_pct = Math.round((ns.weeks_elapsed / ns.weeks_total) * 100);
  const pace_gap_pp = achieved_pct - elapsed_pct;
  const trend: NorthStarComputed["trend"] =
    pace_gap_pp >= 3 ? "ahead" : pace_gap_pp <= -3 ? "behind" : "on_track";
  return { achieved_pct, elapsed_pct, pace_gap_pp, trend };
}

export const QUARTERLY_OKRS: OKR[] = [
  {
    id: "enterprise_readiness",
    label: "Enterprise Readiness",
    objective: "Close $1.5M ARR in enterprise pipeline by Q2 end",
    key_results: [
      "3+ enterprise deals closed (>$200k ARR each)",
      "SAML SSO live and adopted by 2+ enterprise accounts",
      "Bulk import shipped — unblocks data migration objection",
    ],
  },
  {
    id: "reliability",
    label: "Reliability",
    objective: "Reduce support ticket volume by 30% on top reliability complaints",
    key_results: [
      "Webhook delivery retries shipped",
      "P95 API latency under 200ms",
      "Top-3 reliability ticket categories cut by 40%+",
    ],
  },
  {
    id: "compliance",
    label: "Compliance Posture",
    objective: "Pass SOC2 Type II audit in July — unlock $1.2M enterprise pipeline",
    key_results: [
      "Audit log export capability shipped",
      "Encryption at rest verified across all data stores",
      "SOC2 Type II certification received",
    ],
  },
];

export function formatMetric(value: number, format: NorthStar["format"]): string {
  if (format === "usd") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  }
  if (format === "percent") return `${value}%`;
  return value.toLocaleString();
}

export function getOKR(id: string): OKR | undefined {
  return QUARTERLY_OKRS.find((o) => o.id === id);
}
