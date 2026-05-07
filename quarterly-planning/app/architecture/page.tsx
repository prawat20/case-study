import Link from "next/link";
import { Header } from "@/components/Header";

export default function Architecture() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <Header />

      <main className="mx-auto max-w-[720px] px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
        >
          ← Back
        </Link>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">System</h1>
        <p className="mt-2 text-sm text-secondary leading-relaxed">
          A layered system. Ingestion at the bottom feeds the synthesis layers
          in the middle. The decision audit log closes the loop back into the
          priority engine — so the system learns from every override.
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
            title="Roadmap Drafting + Audience-Tuned Render"
            description="Pre-fills quarterly plans, simulates sequence tradeoffs, renders the same plan in four audience modes (Exec, Eng, Sales, CS)."
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
          <div className="text-center text-[11px] uppercase tracking-[0.18em] text-tertiary py-2">
            Slack · Jira · CRM · Calls · Analytics
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-[var(--color-border)] bg-elevated p-6">
          <h3 className="text-base font-medium text-primary">
            Why this shape
          </h3>
          <p className="mt-3 text-sm text-secondary leading-relaxed">
            Most prioritization tools live in layer 5 alone. They are systems
            of record — they store the prioritized list after the PM has
            already done the thinking. This system inverts that. Layers 1-3
            do the synthesis. The PM operates in 4-5. Layer 6 makes the
            system learn.
          </p>
          <p className="mt-3 text-sm text-secondary leading-relaxed">
            The build in this case study covers layers 4-5 with realistic
            mocked data. Layers 1-3 (ingestion, synthesis, engine) are the
            architectural precondition; their existence is assumed in the
            brief.
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
      className="flex items-start gap-4 rounded-xl border bg-elevated p-5"
      style={{
        borderColor: highlight
          ? "var(--color-accent)"
          : foundation
            ? "var(--color-border-strong)"
            : "var(--color-border)",
        background: foundation ? "var(--color-card-hover)" : undefined,
      }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs tabular-nums"
        style={{
          background: highlight
            ? "var(--color-accent)"
            : "var(--color-page)",
          color: highlight ? "#fff" : "var(--color-tertiary)",
          border: highlight
            ? "none"
            : "1px solid var(--color-border-strong)",
        }}
      >
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-medium text-primary">{title}</h3>
        <p className="mt-1 text-sm text-secondary leading-relaxed">
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
