export type InitiativeStatus =
  | "needs_decision"
  | "sequenced"
  | "deferred"
  | "escalated"
  | "monitoring";

export type StakeholderSignal = "sales" | "cs" | "support" | "exec" | "eng";

export type SignalType =
  | "deal_blocker"
  | "deadline"
  | "support_pain"
  | "compliance"
  | "strategic";

export type EvidenceKind =
  | "revenue"
  | "deals"
  | "support"
  | "deadline"
  | "strategic";

export interface Evidence {
  metric: string;
  label: string;
  source: string;
  quote?: string;
  kind?: EvidenceKind;
}

export type RecommendedAction = "commit" | "defer" | "escalate";

export interface AIRecommendation {
  action: RecommendedAction;
  action_reason: string;
  sequence: string;
  effort_sprints: number;
  eng_confidence: "low" | "medium" | "high";
  addresses: string[];
  conflicts: string[];
  tradeoffs: string[];
  okr_alignment: string[];
  okr_contribution?: string;
  suggested_escalation?: {
    stakeholders: string[];
    draft_message: string;
  };
}

export interface Initiative {
  id: string;
  title: string;
  synthesis_oneliner: string;
  rationale_narrative: string;
  evidence: Evidence[];
  ai_recommendation: AIRecommendation;
  status: InitiativeStatus;
  signal_type: SignalType;
  priority_rank?: number;
  stakeholder_signals: StakeholderSignal[];
  theme: string;
  arr_exposure_usd?: number;
}
