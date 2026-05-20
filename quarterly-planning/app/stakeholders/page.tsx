"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, BarChart3, Headphones, Cpu } from "lucide-react";
import { Header } from "@/components/Header";
import { StakeholderArtifact } from "@/components/StakeholderArtifact";
import { AUDIENCES, type AudienceKey } from "@/lib/stakeholder-artifacts";

const VALID_AUDIENCES = new Set(AUDIENCES.map((a) => a.key));
const DEFAULT_AUDIENCE: AudienceKey = "sales";

export default function StakeholdersPage() {
  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />
      <Suspense fallback={<MasterDetailSkeleton />}>
        <MasterDetail />
      </Suspense>
    </div>
  );
}

/* ─────────── Master / Detail ─────────── */

function MasterDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const raw = searchParams.get("audience");
  const audience: AudienceKey =
    raw && VALID_AUDIENCES.has(raw as AudienceKey)
      ? (raw as AudienceKey)
      : DEFAULT_AUDIENCE;

  function selectAudience(key: AudienceKey) {
    if (key === audience) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("audience", key);
    router.replace(`/stakeholders/?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
      {/* Page header */}
      <p className="eyebrow">Stakeholders</p>
      <h1
        className="font-display mt-2 text-[28px] leading-tight tracking-tight"
        style={{ color: "var(--color-primary)", fontWeight: 500 }}
      >
        One plan, four shapes.
      </h1>
      <p className="mt-2 max-w-[560px] text-[14px]" style={{ color: "var(--color-secondary)" }}>
        Each artifact is generated from your committed Q2 plan — written for the audience, not just filtered for them. Pick an audience to switch the right pane.
      </p>

      {/* Master / Detail grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Master rail */}
        <aside className="space-y-2">
          {AUDIENCES.map((a, idx) => (
            <AudienceCard
              key={a.key}
              audience={a.key}
              label={a.label}
              blurb={a.blurb}
              format={a.format}
              active={a.key === audience}
              index={idx}
              onSelect={() => selectAudience(a.key)}
            />
          ))}

          <p
            className="mt-4 px-2 text-[11.5px] leading-relaxed"
            style={{ color: "var(--color-tertiary)" }}
          >
            Lock the calendar plan first (
            <Link
              href="/calendar/"
              style={{ color: "var(--color-accent)" }}
              className="underline-offset-2 hover:underline"
            >
              open Calendar
            </Link>{" "}
            → Snap as Q2 plan) so artifacts reflect the latest sequencing.
          </p>
        </aside>

        {/* Detail pane — keyed on audience so the materialize stagger
            re-fires on every selection, not just first mount */}
        <section>
          <StakeholderArtifact key={audience} audience={audience} embedded />
        </section>
      </div>
    </main>
  );
}

/* ─────────── Master rail card ─────────── */

const AUDIENCE_ICONS: Record<AudienceKey, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  sales: Users,
  exec: BarChart3,
  customer: Headphones,
  eng: Cpu,
};

function AudienceCard({
  audience,
  label,
  blurb,
  format,
  active,
  index,
  onSelect,
}: {
  audience: AudienceKey;
  label: string;
  blurb: string;
  format: string;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  const Icon = AUDIENCE_ICONS[audience];
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.04 + index * 0.04 }}
      onClick={onSelect}
      className="group block w-full text-left rounded-xl px-4 py-3 transition"
      style={{
        background: active ? "var(--color-elevated)" : "transparent",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        boxShadow: active ? "var(--shadow-sm)" : "none",
        cursor: "pointer",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
          style={{
            background: active ? "var(--color-accent-soft)" : "var(--color-surface-sunken)",
            color: active ? "var(--color-accent)" : "var(--color-tertiary)",
          }}
        >
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className="text-[13.5px] font-semibold tracking-tight"
              style={{ color: active ? "var(--color-primary)" : "var(--color-secondary)" }}
            >
              For {label}
            </p>
            {active && (
              <motion.span
                layoutId="audience-active-dot"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden
              />
            )}
          </div>
          <p
            className="mt-1 text-[12px] leading-snug"
            style={{ color: active ? "var(--color-secondary)" : "var(--color-tertiary)" }}
          >
            {blurb}
          </p>
          {active && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.32, delay: 0.05 }}
              className="mt-2 text-[10.5px] uppercase tracking-wider"
              style={{ color: "var(--color-tertiary)", letterSpacing: "0.06em" }}
            >
              {format}
            </motion.p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────── Skeleton (for Suspense boundary while searchParams resolves) ─────────── */

function MasterDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-6 sm:pt-10 pb-24">
      <p className="eyebrow">Stakeholders</p>
      <div className="mt-2 h-7 w-72 rounded" style={{ background: "var(--color-surface-sunken)" }} />
      <div className="mt-2 h-4 w-96 rounded" style={{ background: "var(--color-surface-sunken)" }} />
      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl"
              style={{ background: "var(--color-surface-sunken)" }}
            />
          ))}
        </div>
        <div className="h-96 rounded-xl" style={{ background: "var(--color-surface-sunken)" }} />
      </div>
    </main>
  );
}
