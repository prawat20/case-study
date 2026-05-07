"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Clock, AlertTriangle } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { useDecisions } from "@/lib/use-decisions";
import type { Decision } from "@/lib/decisions";

const initiatives = initiativesJson as Initiative[];

type Audience = "all" | "exec" | "eng" | "sales" | "cs";

const AUDIENCES: { key: Audience; label: string }[] = [
  { key: "all", label: "All" },
  { key: "exec", label: "Exec" },
  { key: "eng", label: "Eng" },
  { key: "sales", label: "Sales" },
  { key: "cs", label: "CS" },
];

const SPRINTS = [
  { key: "Q3 Sprint 1", date: "Jul 1" },
  { key: "Q3 Sprint 2", date: "Jul 15" },
  { key: "Q3 Sprint 3", date: "Jul 29" },
  { key: "Q3 Sprint 4", date: "Aug 12" },
];

type ItemStatus =
  | "sequenced" // committed (this session) or pre-sequenced
  | "ai-suggested" // AI recommends but not yet decided
  | "overridden" // user overrode AI
  | "escalated"
  | "deferred";

interface ResolvedItem {
  initiative: Initiative;
  status: ItemStatus;
  sequence: string;
  decision?: Decision;
}

function resolveItem(
  initiative: Initiative,
  decisions: Decision[],
): ResolvedItem {
  const decision = decisions.find((d) => d.initiative_id === initiative.id);
  if (decision) {
    if (decision.action === "committed") {
      return {
        initiative,
        status: "sequenced",
        sequence: initiative.ai_recommendation.sequence,
        decision,
      };
    }
    if (decision.action === "overridden") {
      return {
        initiative,
        status: "overridden",
        sequence: initiative.ai_recommendation.sequence,
        decision,
      };
    }
    if (decision.action === "deferred") {
      return {
        initiative,
        status: "deferred",
        sequence: "Deferred",
        decision,
      };
    }
    if (decision.action === "escalated") {
      return {
        initiative,
        status: "escalated",
        sequence: "Escalated",
        decision,
      };
    }
  }

  if (initiative.status === "sequenced") {
    return {
      initiative,
      status: "sequenced",
      sequence: initiative.ai_recommendation.sequence,
    };
  }

  if (initiative.status === "needs_decision") {
    return {
      initiative,
      status: "ai-suggested",
      sequence: initiative.ai_recommendation.sequence,
    };
  }

  return {
    initiative,
    status: "deferred",
    sequence: "Backlog",
  };
}

export function QuarterPlan() {
  return (
    <Suspense fallback={null}>
      <QuarterPlanInner />
    </Suspense>
  );
}

function QuarterPlanInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAudience =
    (searchParams.get("audience") as Audience) || "all";
  const [audience, setAudience] = useState<Audience>(initialAudience);
  const { decisions, hydrated } = useDecisions();

  // Keep URL in sync
  useEffect(() => {
    const url = audience === "all" ? "/quarter/" : `/quarter/?audience=${audience}`;
    window.history.replaceState({}, "", url);
  }, [audience]);

  const resolved: ResolvedItem[] = initiatives.map((i) =>
    resolveItem(i, decisions),
  );

  return (
    <main className="mx-auto max-w-[720px] px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
      >
        ← Back
      </Link>

      <div className="mt-8 flex items-baseline justify-between gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Q3 2026</h1>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-elevated p-1">
          {AUDIENCES.map((a) => (
            <button
              key={a.key}
              onClick={() => setAudience(a.key)}
              className="relative rounded-md px-3 py-1 text-xs font-medium transition"
              style={{
                color:
                  audience === a.key
                    ? "var(--color-primary)"
                    : "var(--color-tertiary)",
              }}
            >
              {audience === a.key && (
                <motion.span
                  layoutId="audience-pill"
                  className="absolute inset-0 rounded-md bg-card-hover"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-secondary">
        {audienceCaption(audience)}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={audience}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="mt-12"
        >
          {audience === "all" && (
            <AllView resolved={resolved} hydrated={hydrated} />
          )}
          {audience === "exec" && <ExecView resolved={resolved} />}
          {audience === "eng" && <EngView resolved={resolved} />}
          {audience === "sales" && <SalesView resolved={resolved} />}
          {audience === "cs" && <CSView resolved={resolved} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 flex items-center justify-end gap-3 text-xs text-tertiary">
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="transition hover:text-primary"
        >
          Copy link
        </button>
        <span>·</span>
        <span>Render saves automatically</span>
      </div>
    </main>
  );
}

function audienceCaption(a: Audience): string {
  switch (a) {
    case "all":
      return "Full plan view. Drag to resequence (visual only in this build).";
    case "exec":
      return "Themes, bets, and dollar exposure. Strategic level only.";
    case "eng":
      return "Items with effort estimates, confidence, and sprint counts.";
    case "sales":
      return "Customer-facing roadmap with safe Q-targeted dating.";
    case "cs":
      return "Support-pain reduction timeline by sprint.";
  }
}

function AllView({
  resolved,
  hydrated,
}: {
  resolved: ResolvedItem[];
  hydrated: boolean;
}) {
  const inSprint = (sprint: string) =>
    resolved.filter((r) => r.sequence === sprint && r.status !== "deferred");

  return (
    <div className="space-y-10">
      {SPRINTS.map((s) => {
        const items = inSprint(s.key);
        if (items.length === 0) return null;
        return (
          <div key={s.key}>
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                {s.key.replace("Q3 ", "")}
              </span>
              <span className="text-[11px] text-tertiary">— {s.date}</span>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((r) => (
                <ItemRow key={r.initiative.id} item={r} hydrated={hydrated} />
              ))}
            </div>
          </div>
        );
      })}

      {resolved.some((r) => r.status === "deferred") && hydrated && (
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
            Deferred
          </div>
          <div className="mt-3 space-y-2">
            {resolved
              .filter((r) => r.status === "deferred")
              .map((r) => (
                <ItemRow
                  key={r.initiative.id}
                  item={r}
                  hydrated={hydrated}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  hydrated,
}: {
  item: ResolvedItem;
  hydrated: boolean;
}) {
  const { initiative, status, decision } = item;
  const { ai_recommendation: rec } = initiative;

  const tone = (() => {
    if (!hydrated) return "default";
    if (status === "sequenced" && decision?.action === "committed")
      return "committed";
    if (status === "sequenced") return "default";
    if (status === "ai-suggested") return "ai";
    if (status === "overridden") return "override";
    if (status === "escalated") return "escalated";
    if (status === "deferred") return "deferred";
    return "default";
  })();

  return (
    <div
      className="flex items-start gap-3 rounded-lg border bg-elevated px-4 py-3"
      style={{
        borderColor:
          tone === "ai"
            ? "var(--color-border)"
            : tone === "deferred"
              ? "var(--color-border)"
              : "var(--color-border-strong)",
        opacity: tone === "deferred" ? 0.55 : 1,
        borderStyle: tone === "ai" ? "dashed" : "solid",
      }}
    >
      <span className="mt-1.5 inline-block h-2 w-2 rounded-full shrink-0">
        <span
          className="block h-full w-full rounded-full"
          style={{
            background:
              tone === "committed"
                ? "var(--color-success)"
                : tone === "override"
                  ? "var(--color-accent)"
                  : tone === "escalated"
                    ? "var(--color-warning)"
                    : tone === "deferred"
                      ? "var(--color-muted)"
                      : tone === "ai"
                        ? "var(--color-tertiary)"
                        : "var(--color-success)",
          }}
        />
      </span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={`/initiative/${initiative.id}/`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {initiative.title}
          </Link>
          <span className="text-[11px] text-tertiary tabular-nums shrink-0">
            {rec.effort_sprints} sprint{rec.effort_sprints > 1 ? "s" : ""} · {rec.eng_confidence}
          </span>
        </div>
        <div className="mt-1 text-xs text-secondary">
          {tone === "committed" && (
            <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
              <Check size={11} /> Committed this session
            </span>
          )}
          {tone === "override" && (
            <span className="inline-flex items-center gap-1 text-[var(--color-accent)]">
              <Check size={11} /> Overridden — {decision?.human_rationale}
            </span>
          )}
          {tone === "escalated" && (
            <span className="inline-flex items-center gap-1 text-[var(--color-warning)]">
              <AlertTriangle size={11} /> {decision?.human_rationale}
            </span>
          )}
          {tone === "deferred" && (
            <span className="inline-flex items-center gap-1 text-tertiary">
              <Clock size={11} /> Will resurface on context shift
            </span>
          )}
          {tone === "ai" && (
            <span className="text-tertiary">
              AI suggests · awaiting decision
            </span>
          )}
          {tone === "default" && status === "sequenced" && !decision && (
            <span className="text-tertiary">Sequenced</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExecView({ resolved }: { resolved: ResolvedItem[] }) {
  // Group sequenced + AI-suggested by theme
  const active = resolved.filter(
    (r) => r.status === "sequenced" || r.status === "ai-suggested",
  );
  const themes = Array.from(new Set(active.map((r) => r.initiative.theme)));

  const totalArr = active.reduce(
    (sum, r) => sum + (r.initiative.arr_exposure_usd ?? 0),
    0,
  );

  return (
    <div>
      <p className="text-base text-primary leading-relaxed">
        {themes.length} bet{themes.length === 1 ? "" : "s"},{" "}
        <span className="text-[var(--color-chip-revenue-text)] font-medium">
          ${(totalArr / 1_000_000).toFixed(1)}M
        </span>{" "}
        total ARR exposure.
      </p>

      <div className="mt-12 space-y-10">
        {themes.map((theme, idx) => {
          const themeItems = active.filter(
            (r) => r.initiative.theme === theme,
          );
          const themeArr = themeItems.reduce(
            (s, r) => s + (r.initiative.arr_exposure_usd ?? 0),
            0,
          );
          return (
            <div key={theme}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-tertiary tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium text-primary">{theme}</h3>
                <span className="text-sm text-secondary">
                  · ${(themeArr / 1000).toLocaleString()}k
                </span>
              </div>
              <p className="mt-2 ml-8 text-sm text-secondary leading-relaxed">
                {themeItems.map((r) => r.initiative.title).join(", ")}.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EngView({ resolved }: { resolved: ResolvedItem[] }) {
  return (
    <div className="space-y-10">
      {SPRINTS.map((s) => {
        const items = resolved.filter(
          (r) =>
            r.sequence === s.key &&
            (r.status === "sequenced" || r.status === "ai-suggested"),
        );
        if (items.length === 0) return null;
        const totalSprints = items.reduce(
          (sum, r) => sum + r.initiative.ai_recommendation.effort_sprints,
          0,
        );
        return (
          <div key={s.key}>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
                  {s.key.replace("Q3 ", "")}
                </span>
                <span className="text-[11px] text-tertiary">— {s.date}</span>
              </div>
              <span className="text-[11px] text-tertiary tabular-nums">
                {totalSprints} sprint-effort
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {items.map((r) => (
                <div
                  key={r.initiative.id}
                  className="flex items-baseline justify-between rounded-md border border-[var(--color-border)] bg-elevated px-3 py-2 text-sm"
                >
                  <span className="text-primary">{r.initiative.title}</span>
                  <span className="text-tertiary tabular-nums text-xs">
                    {r.initiative.ai_recommendation.effort_sprints}sp ·{" "}
                    {r.initiative.ai_recommendation.eng_confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SalesView({ resolved }: { resolved: ResolvedItem[] }) {
  const active = resolved.filter(
    (r) => r.status === "sequenced" || r.status === "ai-suggested",
  );
  const themes = Array.from(new Set(active.map((r) => r.initiative.theme)));

  return (
    <div className="space-y-10">
      {themes.map((theme) => {
        const themeItems = active.filter(
          (r) => r.initiative.theme === theme,
        );
        return (
          <div key={theme}>
            <div className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
              Targeting Q3 — {theme}
            </div>
            <ul className="mt-3 space-y-1.5">
              {themeItems.map((r) => (
                <li
                  key={r.initiative.id}
                  className="text-sm text-primary before:mr-2 before:text-tertiary before:content-['•']"
                >
                  {r.initiative.title.replace(/—.*/, "").trim()}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className="text-xs text-tertiary italic">
        Roadmap targets are best-effort and subject to change. Speak with your
        account team for committed dates.
      </p>
    </div>
  );
}

function CSView({ resolved }: { resolved: ResolvedItem[] }) {
  const items = resolved
    .filter(
      (r) =>
        r.status === "sequenced" || r.status === "ai-suggested",
    )
    .filter((r) => {
      const tickets = r.initiative.evidence.find((e) => e.label.includes("ticket"));
      return tickets && parseInt(tickets.metric) > 0;
    })
    .sort((a, b) => {
      // sort by sprint key
      const aIdx = SPRINTS.findIndex((s) => s.key === a.sequence);
      const bIdx = SPRINTS.findIndex((s) => s.key === b.sequence);
      return aIdx - bIdx;
    });

  if (items.length === 0) {
    return (
      <p className="text-sm text-secondary">
        No support-pain items currently sequenced for Q3.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((r) => {
        const sprint = SPRINTS.find((s) => s.key === r.sequence);
        const tickets = r.initiative.evidence.find((e) =>
          e.label.includes("ticket"),
        );
        return (
          <div
            key={r.initiative.id}
            className="rounded-lg border border-[var(--color-border)] bg-elevated p-4"
          >
            <div className="text-[11px] uppercase tracking-[0.12em] text-tertiary">
              By {sprint?.date ?? "—"}
            </div>
            <div className="mt-2 text-base font-medium text-primary">
              {r.initiative.title}
            </div>
            {tickets && (
              <div className="mt-1 text-xs text-secondary">
                Closes {tickets.metric} open {tickets.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
