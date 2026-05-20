"use client";

/**
 * Right-side slide-in panel — "How Sift works."
 *
 * Triggered only by the header (?) button via openOnboarding(); no auto-fire
 * on first visit. No backdrop blur — the panel sits to the right and the user
 * can keep interacting with the page or just glance and dismiss.
 *
 * Dismiss via Esc, the close button, or clicking the dim overlay strip to the
 * left of the panel.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Inbox,
  Calendar as CalendarIcon,
  Users,
  History,
  GitBranch,
  Plus,
} from "lucide-react";

const EVENT_NAME = "qp:open-onboarding";

export function openOnboarding() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onOpenEvent() {
      setOpen(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener(EVENT_NAME, onOpenEvent);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVENT_NAME, onOpenEvent);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dim strip — clicking dismisses; no blur, no full-screen wash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(26, 24, 21, 0.18)" }}
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="How Sift works"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[400px] flex flex-col"
            style={{
              background: "var(--color-elevated)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="flex h-5 w-5 items-center justify-center rounded-[4px]"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-elevated)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ◆
                </span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--color-primary)" }}>
                  How Sift works
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-tertiary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                A decision-orchestration workspace for product managers. Capture an ask, triage it, place it on the calendar, ship it to the right audience, and learn from what you predicted.
              </p>

              <p
                className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--color-tertiary)" }}
              >
                The loop
              </p>

              <ol className="mt-3 space-y-2.5">
                <Step
                  icon={<Plus size={12} />}
                  num="1"
                  title="Capture"
                  body="⌘N anywhere. Source + signal auto-detect."
                />
                <Step
                  icon={<Inbox size={12} />}
                  num="2"
                  title="Triage"
                  body="On Now, act on the top card: Promote / Defer / Escalate. Or open Bulk triage for the swipe deck."
                />
                <Step
                  icon={<CalendarIcon size={12} />}
                  num="3"
                  title="Decide + Place"
                  body="Drag a promoted item into a Calendar sprint — that's the commit. If it overflows, the Drop Planner expands with per-item options."
                />
                <Step
                  icon={<Users size={12} />}
                  num="4"
                  title="Ship"
                  body="Stakeholders generates a per-audience artifact — Slack for Sales, paragraph for Exec, plain language for Customer, capacity table for Eng."
                />
                <Step
                  icon={<History size={12} />}
                  num="5"
                  title="Learn"
                  body="Each commit logs a prediction. After 21 days, the review window opens — predicted vs actual."
                />
                <Step
                  icon={<GitBranch size={12} />}
                  num="+"
                  title="Architecture"
                  body="The six-layer system map behind the build — for the case-study capability picture."
                />
              </ol>

              <p
                className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--color-tertiary)" }}
              >
                Shortcuts
              </p>
              <div className="mt-3 space-y-1.5 text-[12.5px]" style={{ color: "var(--color-secondary)" }}>
                <ShortcutRow keys={["⌘", "K"]} label="Command palette" />
                <ShortcutRow keys={["⌘", "N"]} label="Capture an ask" />
                <ShortcutRow keys={["P"]} label="Promote top card on Now" />
                <ShortcutRow keys={["D"]} label="Defer top card on Now" />
                <ShortcutRow keys={["E"]} label="Escalate top card on Now" />
                <ShortcutRow keys={["Esc"]} label="Close any modal / panel" />
              </div>

              <p className="mt-6 text-[11.5px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
                Stuck? <span style={{ color: "var(--color-primary)" }}>Reset</span> in the header clears all demo state (theme preference survives).
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Step({
  icon,
  num,
  title,
  body,
}: {
  icon: React.ReactNode;
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-primary)" }}>
          <span
            className="font-numeric mr-1.5"
            style={{ color: "var(--color-tertiary)" }}
          >
            {num}
          </span>
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--color-secondary)" }}>
          {body}
        </p>
      </div>
    </li>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={`${k}_${i}`}
            className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-page)",
              color: "var(--color-tertiary)",
            }}
          >
            {k}
          </kbd>
        ))}
      </span>
    </div>
  );
}
