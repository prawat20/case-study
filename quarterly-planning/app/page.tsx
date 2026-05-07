import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";

const initiatives = initiativesJson as Initiative[];

export default function Home() {
  const needsDecision = initiatives.filter(
    (i) => i.status === "needs_decision",
  );
  const monitoring = initiatives.filter((i) => i.status !== "needs_decision");

  return (
    <div className="min-h-screen bg-page text-primary">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">◐</span>
          <span className="text-sm text-secondary">Workspace</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-tertiary">
          <span>Week 19 · May 7 — 13</span>
          <kbd className="rounded border border-[var(--color-border-strong)] bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-secondary">
            ⌘K
          </kbd>
          <div className="h-7 w-7 rounded-full bg-elevated" />
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-8 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          Good morning, Pravesh.
        </h1>
        <p className="mt-1 text-sm text-secondary">
          {needsDecision.length} decisions today. The system is watching{" "}
          {monitoring.length} more — none need you yet.
        </p>

        <div className="mt-12 space-y-3">
          {needsDecision.map((i) => (
            <article
              key={i.id}
              className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-elevated p-5 transition hover:bg-card-hover"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-2 inline-block h-2 w-2 rounded-full"
                  style={{ background: "var(--color-warning)" }}
                />
                <div className="flex-1">
                  <h2 className="text-base font-medium">{i.title}</h2>
                  <p className="mt-1 text-sm text-secondary">
                    {i.synthesis_oneliner}
                  </p>
                </div>
                <span className="text-xs text-accent opacity-0 transition group-hover:opacity-100">
                  Decide ↵
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-16 text-xs text-tertiary">
          Scaffold ready · Priority Stream renders below first pass · Initiative
          Detail and Quarterly Simulation come next.
        </p>
      </main>
    </div>
  );
}
