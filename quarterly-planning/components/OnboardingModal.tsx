"use client";

/**
 * Single-screen onboarding modal — the 5-surface loop + keyboard shortcuts.
 *
 * Auto-shows once on first visit (localStorage flag qp_onboarding_seen_v1);
 * after that, click the (?) chip in the header to re-open. Dismissible by
 * Esc / backdrop click / "Got it" button.
 *
 * openOnboarding() is a module-scope trigger so the Header's (?) button can
 * fire it without prop-drilling. Uses a `window` custom event under the hood.
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

const STORAGE_KEY = "qp_onboarding_seen_v1";
const EVENT_NAME = "qp:open-onboarding";

export function openOnboarding() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  // First-visit auto-open + manual open via event
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Wait a beat so the page paints first; less jarring than instant overlay
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

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

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-16 pb-8 sm:items-center sm:pt-4"
          style={{
            background: "rgba(26, 24, 21, 0.42)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] rounded-2xl"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)",
              maxHeight: "calc(100vh - 96px)",
              overflowY: "auto",
            }}
          >
            <div
              className="flex items-center justify-between px-5 sm:px-6 py-3.5"
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
                onClick={dismiss}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-tertiary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5">
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                Sift is a decision-orchestration workspace for product managers — capture an ask, sort it, place it on the calendar, ship it to the right audience, and learn from what you predicted vs. what landed.
              </p>

              <p
                className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--color-tertiary)" }}
              >
                The loop, in five surfaces
              </p>

              <ol className="mt-3 space-y-2.5">
                <Step
                  icon={<Plus size={13} />}
                  num="1"
                  title="Capture"
                  body="Press ⌘N anywhere to drop an ask. Source + signal auto-detect as you type."
                />
                <Step
                  icon={<Inbox size={13} />}
                  num="2"
                  title="Sort (Triage)"
                  body="On Now, swipe or click Promote / Defer / Route on the top card. Or open bulk triage for the swipe deck."
                />
                <Step
                  icon={<CalendarIcon size={13} />}
                  num="3"
                  title="Place (Calendar)"
                  body="Drag a promoted item into a sprint. If it overflows capacity, the Drop Planner expands — AI suggests, you decide row-by-row."
                />
                <Step
                  icon={<Users size={13} />}
                  num="4"
                  title="Ship (Stakeholders)"
                  body="Each audience gets a custom-shaped artifact — Slack for Sales, paragraph for Exec, plain-language for Customer, capacity table for Eng."
                />
                <Step
                  icon={<History size={13} />}
                  num="5"
                  title="Learn (Audit)"
                  body="Each commit logs a prediction. After 21 days, a review window opens — predicted vs. actual."
                />
                <Step
                  icon={<GitBranch size={13} />}
                  num="+"
                  title="Architecture"
                  body="The six-layer system map behind the build — read this if you want the case-study capability picture."
                />
              </ol>

              <p
                className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--color-tertiary)" }}
              >
                Keyboard shortcuts
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]" style={{ color: "var(--color-secondary)" }}>
                <ShortcutRow keys={["⌘", "K"]} label="Command palette" />
                <ShortcutRow keys={["⌘", "N"]} label="Capture an ask" />
                <ShortcutRow keys={["P"]} label="Promote top card (Now)" />
                <ShortcutRow keys={["D"]} label="Defer top card (Now)" />
                <ShortcutRow keys={["R"]} label="Route top card (Now)" />
                <ShortcutRow keys={["Esc"]} label="Close any modal" />
              </div>

              <p className="mt-6 text-[11.5px] leading-relaxed" style={{ color: "var(--color-tertiary)" }}>
                Stuck or want to start fresh? <span style={{ color: "var(--color-primary)" }}>Reset</span> in the header clears all demo state (your theme preference survives).
              </p>
            </div>

            <div
              className="flex items-center justify-between px-5 sm:px-6 py-3"
              style={{
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-page)",
              }}
            >
              <span className="text-[11px]" style={{ color: "var(--color-tertiary)" }}>
                Open again any time from the <span style={{ color: "var(--color-primary)" }}>?</span> in the header.
              </span>
              <button
                onClick={dismiss}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-[12.5px] font-medium transition"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-elevated)",
                }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
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
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          background: "var(--color-accent-soft)",
          color: "var(--color-accent)",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold" style={{ color: "var(--color-primary)" }}>
          <span
            className="font-numeric mr-1.5"
            style={{ color: "var(--color-tertiary)" }}
          >
            {num}
          </span>
          {title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--color-secondary)" }}>
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
