// Strategic context for the quarter — North Star + OKRs.
// Drives the strategic banner on Priority Stream, OKR alignment on each
// Initiative Detail, and the AI's recommendation reasoning.

export interface NorthStar {
  metric: string;
  current_value: number;
  target_value: number;
  format: "usd" | "count" | "percent";
  period: string;
  trend: "ahead" | "on_track" | "behind";
}

export interface OKR {
  id: string;
  label: string;
  objective: string;
  key_results: string[];
}

export const NORTH_STAR: NorthStar = {
  metric: "Net New ARR",
  current_value: 1_800_000,
  target_value: 2_400_000,
  format: "usd",
  period: "Q3 2026",
  trend: "behind",
};

export const QUARTERLY_OKRS: OKR[] = [
  {
    id: "enterprise_readiness",
    label: "Enterprise Readiness",
    objective: "Close $1.5M ARR in enterprise pipeline by Q3 end",
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
    objective: "Pass SOC2 Type II audit in October — unlock $1.2M enterprise pipeline",
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
