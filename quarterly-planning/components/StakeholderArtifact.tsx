"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy, MessageSquare, Mail, FileDown } from "lucide-react";
import initiativesJson from "@/data/initiatives.json";
import type { Initiative } from "@/lib/types";
import { useDecisions } from "@/lib/use-decisions";
import { Header } from "@/components/Header";
import {
  AUDIENCES,
  type AudienceKey,
  buildArtifact,
  renderAsMarkdown,
  renderAsSlack,
  type Line,
} from "@/lib/stakeholder-artifacts";

const allInitiatives = initiativesJson as Initiative[];
const ASSIGNMENT_KEY = "qp_calendar_assignments_v2";

function loadAssignments(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGNMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function StakeholderArtifact({ audience }: { audience: AudienceKey }) {
  const meta = AUDIENCES.find((a) => a.key === audience);
  const { decisions } = useDecisions();
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState<"slack" | "email" | null>(null);

  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  const lines: Line[] = useMemo(() => {
    if (!meta) return [];
    return buildArtifact(audience, {
      initiatives: allInitiatives,
      decisions,
      assignments,
    });
  }, [audience, meta, decisions, assignments]);

  if (!meta) {
    return (
      <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
        <Header />
        <main className="mx-auto max-w-[720px] px-6 py-16">
          <h1>Audience not found</h1>
        </main>
      </div>
    );
  }

  function copyAs(format: "slack" | "email") {
    const text = format === "slack" ? renderAsSlack(lines) : renderAsMarkdown(lines);
    navigator.clipboard?.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />

      <main className="mx-auto max-w-[720px] px-6 pt-8 pb-24">
        <div className="flex items-center justify-between">
          <Link
            href="/stakeholders/"
            className="inline-flex items-center gap-1.5 text-[12.5px] transition"
            style={{ color: "var(--color-tertiary)" }}
          >
            <ArrowLeft size={13} />
            <span>Stakeholders</span>
          </Link>
          <div className="flex items-center gap-2">
            <CopyButton
              icon={<MessageSquare size={13} />}
              label={copied === "slack" ? "Copied" : "Copy as Slack"}
              onClick={() => copyAs("slack")}
              copied={copied === "slack"}
            />
            <CopyButton
              icon={<Mail size={13} />}
              label={copied === "email" ? "Copied" : "Copy as email"}
              onClick={() => copyAs("email")}
              copied={copied === "email"}
            />
          </div>
        </div>

        <p className="eyebrow mt-8">For {meta.label}</p>

        {/* Artifact */}
        <article
          className="mt-3 rounded-xl px-7 py-7"
          style={{
            background: "var(--color-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {lines.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
            >
              <LineRenderer line={line} />
            </motion.div>
          ))}
        </article>

        <p className="mt-6 text-[11.5px]" style={{ color: "var(--color-muted)" }}>
          <FileDown size={11} className="mr-1 inline-block" />
          Synthesized from your committed plan + sprint assignments. Re-renders when either changes.
        </p>
      </main>
    </div>
  );
}

/* ─────────── Line renderer ─────────── */

function LineRenderer({ line }: { line: Line }) {
  switch (line.type) {
    case "title":
      return (
        <h1
          className="font-display text-[24px] leading-tight tracking-tight"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {line.text}
        </h1>
      );
    case "subtitle":
      return (
        <p
          className="mt-1 text-[12.5px]"
          style={{ color: "var(--color-tertiary)", fontStyle: "italic" }}
        >
          {line.text}
        </p>
      );
    case "section":
      return (
        <p
          className="eyebrow mt-6"
          style={{ color: "var(--color-secondary)" }}
        >
          {line.text}
        </p>
      );
    case "para":
      return (
        <p
          className="mt-3 text-[14.5px] leading-relaxed"
          style={{ color: "var(--color-secondary)" }}
        >
          {line.text}
        </p>
      );
    case "bullet":
      return (
        <div className="mt-2.5 flex items-start gap-3">
          <span
            className="mt-2 inline-block h-1 w-1 rounded-full shrink-0"
            style={{ background: "var(--color-tertiary)" }}
          />
          <div className="text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
            <span style={{ color: "var(--color-primary)" }}>{line.text}</span>
            {line.meta && (
              <>
                {" — "}
                <span style={{ color: "var(--color-tertiary)" }}>{line.meta}</span>
              </>
            )}
          </div>
        </div>
      );
    case "kpi":
      return (
        <div className="mt-3 flex items-baseline justify-between gap-3 rounded-md px-3 py-2.5" style={{ background: "var(--color-page)" }}>
          <div>
            <p className="text-[12.5px] font-medium" style={{ color: "var(--color-primary)" }}>{line.label}</p>
            {line.hint && (
              <p className="mt-0.5 text-[11px]" style={{ color: "var(--color-tertiary)" }}>
                {line.hint}
              </p>
            )}
          </div>
          <p
            className="font-numeric text-[16px] font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            {line.value}
          </p>
        </div>
      );
    case "row":
      return (
        <div
          className="mt-1 grid gap-2 px-2 py-1.5 text-[12.5px]"
          style={{
            gridTemplateColumns: `repeat(${line.cells.length}, minmax(0, 1fr))`,
            color: "var(--color-secondary)",
          }}
        >
          {line.cells.map((c, i) => (
            <span key={i} className="font-numeric truncate">
              {c}
            </span>
          ))}
        </div>
      );
    case "spacer":
      return <div className="h-2" />;
    default:
      return null;
  }
}

function CopyButton({
  icon,
  label,
  onClick,
  copied,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  copied: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition"
      style={{
        background: copied ? "var(--color-accent-soft)" : "var(--color-elevated)",
        color: copied ? "var(--color-accent)" : "var(--color-secondary)",
        border: `1px solid ${copied ? "var(--color-accent)" : "var(--color-border)"}`,
      }}
    >
      {copied ? <Check size={12} /> : icon}
      <span>{label}</span>
    </button>
  );
}
