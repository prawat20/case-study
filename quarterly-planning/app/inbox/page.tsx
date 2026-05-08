"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { Header } from "@/components/Header";
import { useTriage } from "@/lib/triage";
import { useCaptures, type Capture } from "@/lib/captures";
import { useDecisions } from "@/lib/use-decisions";
import { useCommandPalette } from "@/components/CommandProvider";
import {
  formatRelative,
  getChannelLabel,
  getMinutesAgo,
  getSourceLabel,
  signalToKind,
  JUST_LANDED_CUTOFF_MIN,
} from "@/lib/inbox-helpers";

const allInitiatives = initiativesJson as Initiative[];

type Row =
  | { kind: "initiative"; data: Initiative; minAgo: number }
  | { kind: "capture"; data: Capture; minAgo: number };

export default function InboxPage() {
  const { triage, hydrated: triageHydrated } = useTriage();
  const { captures, hydrated: capturesHydrated } = useCaptures();
  const { decisions } = useDecisions();
  const { openCapture } = useCommandPalette();

  const triageMap = useMemo(() => {
    const m = new Map<string, "promote" | "route" | "defer">();
    triage.forEach((t) => m.set(t.initiative_id, t.action));
    return m;
  }, [triage]);

  const decidedIds = useMemo(() => new Set(decisions.map((d) => d.initiative_id)), [decisions]);

  /* Build untriaged rows (captures + needs_decision initiatives) */
  const untriaged: Row[] = useMemo(() => {
    const captureRows: Row[] = captures
      .filter((c) => !triageMap.has(c.id))
      .map((c) => {
        const minAgo = Math.max(
          1,
          Math.round((Date.now() - new Date(c.captured_at).getTime()) / 60000),
        );
        return { kind: "capture" as const, data: c, minAgo };
      });

    const initiativeRows: Row[] = allInitiatives
      .filter(
        (i) =>
          i.status === "needs_decision" &&
          !triageMap.has(i.id) &&
          !decidedIds.has(i.id),
      )
      .map((i) => ({ kind: "initiative" as const, data: i, minAgo: getMinutesAgo(i) }))
      .sort((a, b) => a.minAgo - b.minAgo);

    return [...captureRows.sort((a, b) => a.minAgo - b.minAgo), ...initiativeRows];
  }, [captures, triageMap, decidedIds]);

  const justLanded = untriaged.filter((r) => r.minAgo <= JUST_LANDED_CUTOFF_MIN);
  const earlier = untriaged.filter((r) => r.minAgo > JUST_LANDED_CUTOFF_MIN);

  const promotedIds = triage.filter((t) => t.action === "promote").map((t) => t.initiative_id);
  const promoted = allInitiatives.filter((i) => promotedIds.includes(i.id));

  const routedCount = triage.filter((t) => t.action === "route").length;
  const deferredCount = triage.filter((t) => t.action === "defer").length;

  const hydrated = triageHydrated && capturesHydrated;
  const totalToTriage = untriaged.length;

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-6 pt-10 pb-24">
        <p className="eyebrow">Inbox</p>
        <h1
          className="font-display mt-2 text-[28px] leading-tight tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {totalToTriage === 0 ? "Inbox is clear." : `${totalToTriage} to triage`}
        </h1>

        {/* Stats line */}
        <p className="mt-2 text-[13px]" style={{ color: "var(--color-tertiary)" }}>
          {hydrated ? (
            <>
              {totalToTriage > 0 && (
                <>
                  <span style={{ color: "var(--color-secondary)" }}>{totalToTriage}</span> to triage
                </>
              )}
              {(routedCount > 0 || deferredCount > 0 || promoted.length > 0) && (
                <>
                  {totalToTriage > 0 && <span style={{ color: "var(--color-muted)" }}> · </span>}
                  {promoted.length > 0 && (
                    <>
                      <span style={{ color: "var(--color-secondary)" }}>{promoted.length}</span> promoted
                    </>
                  )}
                  {routedCount > 0 && (
                    <>
                      {promoted.length > 0 && <span style={{ color: "var(--color-muted)" }}> · </span>}
                      <span style={{ color: "var(--color-secondary)" }}>{routedCount}</span> routed
                    </>
                  )}
                  {deferredCount > 0 && (
                    <>
                      {(promoted.length > 0 || routedCount > 0) && <span style={{ color: "var(--color-muted)" }}> · </span>}
                      <span style={{ color: "var(--color-secondary)" }}>{deferredCount}</span> deferred
                    </>
                  )}
                </>
              )}
              {totalToTriage === 0 && promoted.length === 0 && routedCount === 0 && deferredCount === 0 && (
                <>Capture an ask to start triage.</>
              )}
            </>
          ) : (
            <>&nbsp;</>
          )}
        </p>

        {/* Action row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/inbox/triage/"
            aria-disabled={totalToTriage === 0}
            tabIndex={totalToTriage === 0 ? -1 : 0}
            onClick={(e) => {
              if (totalToTriage === 0) e.preventDefault();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition"
            style={{
              background: totalToTriage === 0 ? "var(--color-surface-sunken)" : "var(--color-accent)",
              color: totalToTriage === 0 ? "var(--color-muted)" : "var(--color-elevated)",
              boxShadow: totalToTriage === 0 ? "none" : "var(--shadow-sm)",
              opacity: totalToTriage === 0 ? 0.6 : 1,
              cursor: totalToTriage === 0 ? "not-allowed" : "pointer",
            }}
          >
            Start triage
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={openCapture}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition hover:bg-card-hover"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-secondary)",
            }}
          >
            <Plus size={14} />
            <span>New</span>
            <kbd
              className="ml-1 rounded border px-1.5 py-0.5 font-mono text-[10px]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-page)",
                color: "var(--color-tertiary)",
              }}
            >
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Just landed section */}
        {justLanded.length > 0 && (
          <Section title="Just landed">
            {justLanded.map((row, idx) => (
              <InboxRow key={row.kind === "initiative" ? row.data.id : row.data.id} row={row} index={idx} fresh />
            ))}
          </Section>
        )}

        {/* Earlier today */}
        {earlier.length > 0 && (
          <Section title="Earlier">
            {earlier.map((row, idx) => (
              <InboxRow
                key={row.kind === "initiative" ? row.data.id : row.data.id}
                row={row}
                index={justLanded.length + idx}
                fresh={false}
              />
            ))}
          </Section>
        )}

        {/* Promoted (ready to prioritize) */}
        {promoted.length > 0 && (
          <Section title="Ready to prioritize">
            {promoted.map((i, idx) => (
              <PromotedRow key={i.id} initiative={i} index={idx} />
            ))}
          </Section>
        )}

        {/* Empty-state lift */}
        {hydrated && totalToTriage === 0 && promoted.length === 0 && (
          <div
            className="mt-12 rounded-xl p-10 text-center"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="font-display text-[28px]" style={{ color: "var(--color-accent)" }}>◆</div>
            <p className="mt-3 text-[15px] font-medium" style={{ color: "var(--color-primary)" }}>
              Nothing waiting on you.
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--color-secondary)" }}>
              Capture an ask with{" "}
              <kbd
                className="rounded border px-1.5 py-0.5 font-mono text-[11px]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-page)",
                  color: "var(--color-tertiary)",
                }}
              >
                ⌘N
              </kbd>{" "}
              when one lands.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <p className="eyebrow">{title}</p>
      <div className="mt-4 space-y-1.5">{children}</div>
    </section>
  );
}

function InboxRow({ row, index, fresh }: { row: Row; index: number; fresh: boolean }) {
  const minAgo = row.minAgo;
  const sourceLabel = row.kind === "initiative" ? getSourceLabel(row.data) : row.data.source;
  const channelLabel = row.kind === "initiative" ? getChannelLabel(row.data) : row.data.channel;
  const signalKind = signalToKind(
    row.kind === "initiative" ? row.data.signal_type : row.data.signal,
  );
  const title = row.kind === "initiative" ? row.data.title : row.data.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/inbox/triage/"
        className="group flex items-start gap-4 rounded-lg px-4 py-3.5 transition"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--color-elevated)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div className="shrink-0 pt-0.5">
          <span
            className="inline-flex h-1.5 w-1.5 rounded-full"
            style={{
              background: fresh ? "var(--color-accent)" : "var(--color-muted)",
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--color-tertiary)" }}>
            <span className="font-numeric">{formatRelative(minAgo)}</span>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span>from {sourceLabel}</span>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span>via {channelLabel}</span>
            {row.kind === "capture" && (
              <span
                className="ml-1 rounded px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                }}
              >
                New
              </span>
            )}
          </div>
          <p
            className="mt-1 text-[14px] leading-snug"
            style={{ color: "var(--color-primary)" }}
          >
            {title}
          </p>
          <div className="mt-2">
            <SignalChip kind={signalKind} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PromotedRow({ initiative, index }: { initiative: Initiative; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/initiative/${initiative.id}/`}
        className="group flex items-center justify-between rounded-lg px-4 py-3 transition"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--color-elevated)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: "var(--color-accent)" }}
          />
          <p
            className="text-[14px] truncate"
            style={{ color: "var(--color-primary)" }}
          >
            {initiative.title}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[12.5px] shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--color-accent)" }}
        >
          Prioritize
          <ArrowRight size={12} />
        </span>
      </Link>
    </motion.div>
  );
}

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  const bgVar = `var(--color-chip-${kind}-bg)`;
  const fgVar = `var(--color-chip-${kind}-text)`;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium"
      style={{ background: bgVar, color: fgVar }}
    >
      {kind}
    </span>
  );
}
