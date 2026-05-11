"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown } from "lucide-react";
import type { ClusterSource } from "@/lib/types";

/**
 * Cluster chip + expandable source list.
 * Surfaces the Opportunity Synthesis Engine's work: the same request that
 * arrived in N channels was semantically clustered into one initiative.
 *
 * Sized for two contexts: dense (inline on cards) and roomy (initiative
 * detail). Tap/click toggles the source list. No hover dependency so this
 * works on touch.
 */
export function ClusterChip({
  sources,
  size = "sm",
}: {
  sources: ClusterSource[];
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length < 2) return null;

  const dense = size === "sm";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-expanded={open}
        aria-label={`Merged from ${sources.length} sources — tap to expand`}
        className={`inline-flex items-center gap-1 rounded font-medium transition ${
          dense ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
        }`}
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
          border: "1px solid var(--color-accent)",
        }}
      >
        <Layers size={dense ? 10 : 11} />
        <span>
          Merged · {sources.length} source{sources.length === 1 ? "" : "s"}
        </span>
        <ChevronDown
          size={dense ? 9 : 10}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 mt-1.5 w-[min(360px,calc(100vw-32px))] rounded-lg p-3"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p
              className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--color-tertiary)" }}
            >
              Synthesis engine merged
            </p>
            <ul className="space-y-2">
              {sources.map((s, idx) => (
                <li
                  key={idx}
                  className="rounded-md px-2.5 py-2"
                  style={{ background: "var(--color-page)" }}
                >
                  <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]" style={{ color: "var(--color-tertiary)" }}>
                    <span className="font-semibold" style={{ color: "var(--color-secondary)" }}>
                      {s.source}
                    </span>
                    <span style={{ color: "var(--color-muted)" }}>·</span>
                    <span>{s.channel}</span>
                  </div>
                  <p
                    className="mt-1 text-[12px] leading-snug italic"
                    style={{ color: "var(--color-primary)" }}
                  >
                    &ldquo;{s.quote}&rdquo;
                  </p>
                </li>
              ))}
            </ul>
            <p
              className="mt-2 text-[10px]"
              style={{ color: "var(--color-muted)" }}
            >
              The same request arrived in {sources.length} channels — Opportunity
              Synthesis Engine clustered them into one initiative.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
