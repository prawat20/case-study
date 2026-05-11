import Link from "next/link";
import { Header } from "@/components/Header";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12.5px] transition"
          style={{ color: "var(--color-tertiary)" }}
        >
          ← Back
        </Link>

        <p className="eyebrow mt-8">System</p>
        <h1
          className="font-display mt-2 text-[28px] leading-tight tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          Architecture
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
          A layered system. Ingestion at the bottom feeds the synthesis layers in the middle.
          The decision audit log closes the loop back into the priority engine — so the system learns from every override.
        </p>

        <div className="mt-12 space-y-3">
          <Layer
            number={6}
            title="Decision Audit Log"
            description="Every decision logged with rationale + predicted outcome. Quarterly retrospective auto-surfaces predicted-vs-actual."
            highlight
          />
          <Connector />
          <Layer
            number={5}
            title="Roadmap Drafting + Stakeholder Render"
            description="Pre-fills quarterly plans, drag-to-resequence with capacity awareness, generates audience-shaped artifacts (Sales / Exec / Customer / Eng)."
          />
          <Layer
            number={4}
            title="Stakeholder Alignment Copilot"
            description="Surfaces conflicts, drafts alignment summaries, predicts escalation risk. Compresses the coordination loop."
          />
          <Layer
            number={3}
            title="Dynamic Priority Engine"
            description="Continuous synthesis, gated publication. Flags significant re-prioritization without auto-resequencing the public plan."
          />
          <Layer
            number={2}
            title="Opportunity Synthesis Engine"
            description="Semantic clustering of duplicate requests, summarization of customer pain, theme extraction. Replaces hours of manual tagging."
          />
          <Connector />
          <Layer
            number={1}
            title="Context Graph"
            description="Continuous ingestion across Slack, Jira, CRM, support tickets, customer calls, analytics. Builds an organizational memory layer."
            foundation
          />
          <Connector small />
          <p
            className="text-center text-[10.5px] uppercase tracking-[0.18em] py-2"
            style={{ color: "var(--color-tertiary)" }}
          >
            Slack · Jira · CRM · Calls · Analytics
          </p>
        </div>

        <div
          className="mt-16 rounded-xl px-6 py-6"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
            Why this shape
          </h3>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            Most prioritization tools live in layer 5 alone. They are systems of record — they store the prioritized list after the PM has already done the thinking. This system inverts that. Layers 1-3 do the synthesis. The PM operates in 4-5. Layer 6 makes the system learn.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            The build in this case study covers layers 4-5 with realistic mocked data. Layers 1-3 (ingestion, synthesis, engine) are the architectural precondition; their existence is assumed in the brief.
          </p>
        </div>
      </main>
    </div>
  );
}

function Layer({
  number,
  title,
  description,
  highlight,
  foundation,
}: {
  number: number;
  title: string;
  description: string;
  highlight?: boolean;
  foundation?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl px-5 py-5"
      style={{
        background: foundation ? "var(--color-surface-sunken)" : "var(--color-elevated)",
        border: "1px solid",
        borderColor: highlight
          ? "var(--color-accent)"
          : foundation
            ? "var(--color-border-strong)"
            : "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="font-numeric mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium"
        style={{
          background: highlight ? "var(--color-accent)" : "var(--color-page)",
          color: highlight ? "var(--color-elevated)" : "var(--color-tertiary)",
          border: highlight ? "none" : "1px solid var(--color-border-strong)",
        }}
      >
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function Connector({ small }: { small?: boolean }) {
  return (
    <div className="flex justify-center">
      <div
        className="w-px"
        style={{
          height: small ? 16 : 12,
          background: "var(--color-border-strong)",
        }}
      />
    </div>
  );
}
