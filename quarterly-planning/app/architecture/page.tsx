import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";

/**
 * Architecture — the six-layer system map, grouped into three functional
 * bands so the stack reads as layers, not a list:
 *   • System learns        — Layer 6 (the audit/recalibration loop)
 *   • You operate here     — Layers 5–4 (the PM workspace this build covers)
 *   • System synthesizes   — Layers 3–1 (the substrate the brief assumes)
 *
 * The recalibration loop (Layer 6 → Layer 3) is drawn explicitly: every
 * override the PM logs flows back down to tune the priority engine.
 */

type LayerDef = {
  number: number;
  title: string;
  description: string;
  loopSource?: boolean; // Layer 6 — where divergence signal originates
  loopTarget?: boolean; // Layer 3 — where it recalibrates
  foundation?: boolean; // Layer 1 — grounded base
};

type ZoneDef = {
  key: string;
  label: string;
  sublabel: string;
  band: "learn" | "operate" | "synthesize";
  layers: LayerDef[];
};

const ZONES: ZoneDef[] = [
  {
    key: "learn",
    label: "System learns",
    sublabel: "closes the loop",
    band: "learn",
    layers: [
      {
        number: 6,
        title: "Decision Audit Log",
        description:
          "Every action logged against the recommendation. Each divergence is a labelled training signal; predicted-vs-actual surfaces at the 21-day mark.",
        loopSource: true,
      },
    ],
  },
  {
    key: "operate",
    label: "You operate here",
    sublabel: "the PM workspace · this build",
    band: "operate",
    layers: [
      {
        number: 5,
        title: "Roadmap Drafting + Stakeholder Render",
        description:
          "Pre-fills quarterly plans, drag-to-resequence with capacity awareness, generates audience-shaped artifacts (Sales / Exec / Customer / Eng).",
      },
      {
        number: 4,
        title: "Stakeholder Alignment Copilot",
        description:
          "Surfaces conflicts, drafts alignment summaries, predicts escalation risk. Compresses the coordination loop.",
      },
    ],
  },
  {
    key: "synthesize",
    label: "System synthesizes",
    sublabel: "the substrate · assumed by the brief",
    band: "synthesize",
    layers: [
      {
        number: 3,
        title: "Dynamic Priority Engine",
        description:
          "Continuous synthesis, gated publication. Flags significant re-prioritization without auto-resequencing the public plan.",
        loopTarget: true,
      },
      {
        number: 2,
        title: "Opportunity Synthesis Engine",
        description:
          "Semantic clustering of duplicate requests, summarization of customer pain, theme extraction. Replaces hours of manual tagging.",
      },
      {
        number: 1,
        title: "Context Graph",
        description:
          "Continuous ingestion across Slack, Jira, CRM, support tickets, customer calls, analytics. Builds an organizational memory layer.",
        foundation: true,
      },
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[760px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
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
          A layered system. Ingestion at the base feeds the synthesis layers; the PM operates
          in the middle band; the audit log on top closes the loop — every override flows back
          down to recalibrate the priority engine.
        </p>

        {/* The stack */}
        <div className="relative mt-12">
          {/* Continuous spine connecting the layer numbers */}
          <div
            aria-hidden
            className="absolute w-px"
            style={{ left: 15, top: 12, bottom: 64, background: "var(--color-border-strong)" }}
          />

          <div className="space-y-7">
            {ZONES.map((zone) => (
              <section key={zone.key}>
                <ZoneHeader zone={zone} />
                <div className="mt-2.5 space-y-2">
                  {zone.layers.map((layer) => (
                    <LayerSlab key={layer.number} layer={layer} band={zone.band} />
                  ))}
                </div>
              </section>
            ))}

            {/* Ingestion sources feeding Layer 1 */}
            <div className="flex items-center gap-3 pl-11">
              <span aria-hidden style={{ color: "var(--color-border-strong)" }}>
                ↓
              </span>
              <p
                className="text-[10.5px] uppercase tracking-[0.18em]"
                style={{ color: "var(--color-tertiary)" }}
              >
                Slack · Jira · CRM · Calls · Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Why this shape */}
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
            Most prioritization tools live in layer 5 alone. They are systems of record — they
            store the prioritized list after the PM has already done the thinking. This system
            inverts that. Layers 1–3 do the synthesis. The PM operates in 4–5. Layer 6 makes the
            system learn.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            The build in this case study covers layers 4–5 with realistic mocked data. Layers 1–3
            (ingestion, synthesis, engine) are the architectural precondition; their existence is
            assumed in the brief.
          </p>
        </div>
      </main>
    </div>
  );
}

function ZoneHeader({ zone }: { zone: ZoneDef }) {
  const tone =
    zone.band === "operate" ? "var(--color-accent)" : "var(--color-tertiary)";
  return (
    <div className="flex items-baseline gap-2 pl-11">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: tone }}
      />
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: tone }}
      >
        {zone.label}
      </span>
      <span className="text-[11.5px]" style={{ color: "var(--color-muted)" }}>
        {zone.sublabel}
      </span>
    </div>
  );
}

function LayerSlab({ layer, band }: { layer: LayerDef; band: ZoneDef["band"] }) {
  const isOperate = band === "operate";

  // Visual language: the PM band is accent-tinted (your active workspace);
  // the loop endpoints (6, 3) carry an accent border so the eye pairs them;
  // the foundation is grounded/sunken.
  const background = isOperate
    ? "var(--color-accent-soft)"
    : layer.foundation
      ? "var(--color-surface-sunken)"
      : "var(--color-elevated)";
  const borderColor = layer.loopSource || layer.loopTarget
    ? "var(--color-accent)"
    : isOperate
      ? "var(--color-accent)"
      : layer.foundation
        ? "var(--color-border-strong)"
        : "var(--color-border)";

  return (
    <div className="relative flex items-start gap-3">
      {/* Number badge — sits on the spine */}
      <div
        className="font-numeric relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
        style={{
          background: isOperate ? "var(--color-accent)" : "var(--color-page)",
          color: isOperate ? "var(--color-elevated)" : "var(--color-tertiary)",
          border: isOperate ? "none" : "1px solid var(--color-border-strong)",
        }}
      >
        {layer.number}
      </div>

      {/* Slab */}
      <div
        className="flex-1 rounded-xl px-5 py-4"
        style={{
          background,
          border: "1px solid",
          borderColor,
          boxShadow: layer.foundation ? "none" : "var(--shadow-sm)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-primary)" }}>
            {layer.title}
          </h3>
          {isOperate && (
            <span
              className="rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--color-accent)", color: "var(--color-elevated)" }}
            >
              You
            </span>
          )}
          {layer.loopTarget && (
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
              style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
            >
              <RefreshCw size={9} />
              Recalibrated by L6
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
          {layer.description}
        </p>

        {/* Loop source → explicit feedback connector down to Layer 3 */}
        {layer.loopSource && (
          <div
            className="mt-3 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px]"
            style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
          >
            <RefreshCw size={11} className="shrink-0" />
            <span>
              Overrides + verdicts flow back to the Dynamic Priority Engine (L3) — the system
              recalibrates.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
