"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, ShieldAlert, MoonStar, AlertTriangle, ArrowRight } from "lucide-react";
import type { Initiative } from "@/lib/types";
import { effortPoints, SPRINTS, SPRINT_CAPACITY } from "@/lib/sprint-data";
import { signalToKind } from "@/lib/inbox-helpers";

/**
 * PlanChoice — per-item destination choice in the planner.
 *  - "keep"  → item stays in the target sprint (and contributes to overflow)
 *  - "move"  → item moves to another in-quarter sprint
 *  - "defer" → item is pushed to Q4
 */
export type PlanChoice =
  | { kind: "keep" }
  | { kind: "move"; toSprint: number }
  | { kind: "defer" };

export type PendingDrop = {
  incoming: Initiative;
  targetSprint: number;
  /** Map: initiative_id (of items currently in the target sprint) → PlanChoice */
  choices: Record<string, PlanChoice>;
  /** AI's default plan, used to render the ✦ "AI suggests" hint. */
  aiChoices: Record<string, PlanChoice>;
};

type Props = {
  pendingDrop: PendingDrop;
  /** Items currently assigned to the target sprint (before plan applied). */
  itemsInTarget: Initiative[];
  /** Current capacity loads for every in-quarter sprint (excluding incoming). */
  sprintLoads: Record<number, number>;
  /** Initiatives currently sitting in non-target sprints (used to display sprint contents in the move-to picker hover). */
  itemsBySprint: Record<number, Initiative[]>;
  onChange: (itemId: string, choice: PlanChoice) => void;
  onCommit: () => void;
  onCancel: () => void;
};

/**
 * Drop Planner — the prioritisation worksheet.
 * Opens after a drop on an over-capacity sprint. Lets the PM pick which items
 * to displace, where each one goes, and shows the live trade-off summary.
 */
export function DropPlanner({
  pendingDrop,
  itemsInTarget,
  sprintLoads,
  itemsBySprint,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  const { incoming, targetSprint, choices, aiChoices } = pendingDrop;
  const incomingPoints = effortPoints(incoming);

  // Compute the "freed" capacity from the user's current choices.
  let freed = 0;
  let ricePushed = 0;
  let deadlinesAtRisk = 0;
  for (const item of itemsInTarget) {
    const c = choices[item.id];
    if (!c || c.kind === "keep") continue;
    freed += effortPoints(item);
    // RICE cost = priority_weight × shift (1-5; defer counts as 5)
    const priorityWeight = Math.max(1, 10 - (item.priority_rank ?? 5));
    const shift = c.kind === "defer" ? 5 : Math.abs(c.toSprint - targetSprint);
    ricePushed += priorityWeight * Math.max(1, shift);
    if (item.signal_type === "deadline" || item.signal_type === "compliance") {
      deadlinesAtRisk += 1;
    }
  }

  const beforeLoad = sprintLoads[targetSprint] ?? 0;
  const afterLoad = beforeLoad + incomingPoints - freed;
  const needed = Math.max(0, beforeLoad + incomingPoints - SPRINT_CAPACITY);
  const matched = freed >= needed;
  const short = Math.max(0, needed - freed);

  // For each in-quarter sprint other than the target, compute headroom under
  // the user's current plan (taking into account items the user is moving IN).
  const headroom = computeHeadroom({
    sprintLoads,
    choices,
    itemsInTarget,
    targetSprint,
  });

  const targetLabel = SPRINTS[targetSprint - 1]?.label ?? `Sprint ${targetSprint}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -6, height: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3 overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-xl"
        style={{
          background: "var(--color-elevated)",
          border: "1px solid var(--color-warning)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header — what's coming in, capacity preview */}
        <div
          className="rounded-t-xl px-4 py-3"
          style={{
            background: "var(--color-warning-soft)",
            borderBottom: "1px solid var(--color-warning)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle size={13} style={{ color: "var(--color-warning)" }} />
              <p className="text-[12.5px] font-semibold" style={{ color: "var(--color-warning)" }}>
                Plan {targetLabel}
              </p>
            </div>
            <p
              className="font-numeric text-[12px]"
              style={{ color: matched ? "var(--color-success)" : "var(--color-warning)" }}
            >
              {beforeLoad} + {incomingPoints} → {afterLoad}/{SPRINT_CAPACITY}p {matched ? "✓" : `· ${short}p short`}
            </p>
          </div>
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--color-secondary)" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{incoming.title}</span>
            <span style={{ color: "var(--color-muted)" }}> · </span>
            {incomingPoints}p incoming. Pick what moves out.
          </p>
        </div>

        {/* Item rows */}
        <div className="px-4 py-3 space-y-3">
          {itemsInTarget.map((item) => (
            <PlanRow
              key={item.id}
              item={item}
              choice={choices[item.id] ?? { kind: "keep" }}
              aiChoice={aiChoices[item.id] ?? { kind: "keep" }}
              targetSprint={targetSprint}
              headroom={headroom}
              itemsBySprint={itemsBySprint}
              onChange={(c) => onChange(item.id, c)}
            />
          ))}
        </div>

        {/* Trade-off summary */}
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface-sunken)",
          }}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
            <span style={{ color: "var(--color-tertiary)" }}>Trade-off:</span>
            <span style={{ color: matched ? "var(--color-success)" : "var(--color-warning)" }}>
              <span className="font-numeric">{freed}p</span> freed of <span className="font-numeric">{needed}p</span> needed
              {matched ? " ✓" : ""}
            </span>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: ricePushed > 0 ? "var(--color-secondary)" : "var(--color-tertiary)" }}>
              RICE cost: <span className="font-numeric">{ricePushed > 0 ? `−${ricePushed.toFixed(1)}` : "0"}</span>
            </span>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: deadlinesAtRisk > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
              {deadlinesAtRisk === 0 ? "All deadlines protected" : `${deadlinesAtRisk} deadline${deadlinesAtRisk > 1 ? "s" : ""} at risk`}
            </span>
          </div>
        </div>

        {/* Commit / Cancel */}
        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition hover:bg-[var(--color-card-hover)]"
            style={{
              background: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-secondary)",
            }}
          >
            <X size={13} />
            Cancel
          </button>
          <button
            onClick={onCommit}
            disabled={!matched}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: matched ? "var(--color-accent)" : "var(--color-surface-sunken)",
              color: matched ? "var(--color-elevated)" : "var(--color-muted)",
              boxShadow: matched ? "var(--shadow-sm)" : "none",
            }}
          >
            <Check size={13} />
            Commit plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── PlanRow ─────────── */

function PlanRow({
  item,
  choice,
  aiChoice,
  targetSprint,
  headroom,
  itemsBySprint,
  onChange,
}: {
  item: Initiative;
  choice: PlanChoice;
  aiChoice: PlanChoice;
  targetSprint: number;
  headroom: Record<number, number>;
  itemsBySprint: Record<number, Initiative[]>;
  onChange: (c: PlanChoice) => void;
}) {
  const points = effortPoints(item);
  const signal = signalToKind(item.signal_type);
  const isDeadline = item.signal_type === "deadline" || item.signal_type === "compliance";
  const otherSprints = SPRINTS.filter((s) => s.index !== targetSprint);

  function isActive(c: PlanChoice): boolean {
    if (choice.kind === "keep" && c.kind === "keep") return true;
    if (choice.kind === "defer" && c.kind === "defer") return true;
    if (choice.kind === "move" && c.kind === "move" && choice.toSprint === c.toSprint) return true;
    return false;
  }

  function isAISuggestion(c: PlanChoice): boolean {
    if (aiChoice.kind === "keep" && c.kind === "keep") return true;
    if (aiChoice.kind === "defer" && c.kind === "defer") return true;
    if (aiChoice.kind === "move" && c.kind === "move" && aiChoice.toSprint === c.toSprint) return true;
    return false;
  }

  return (
    <div className="rounded-md px-3 py-2" style={{ background: "var(--color-page)" }}>
      {/* Item meta */}
      <div className="flex flex-wrap items-center gap-2">
        <p
          className="text-[13px] font-medium truncate"
          style={{ color: "var(--color-primary)", flex: "1 1 auto", minWidth: 0 }}
        >
          {item.title}
        </p>
        <span className="font-numeric text-[11px] shrink-0" style={{ color: "var(--color-tertiary)" }}>
          {points}p
        </span>
        <SignalChip kind={signal} />
        {isDeadline && (
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-warning)" }}>
            Deadline
          </span>
        )}
      </div>

      {/* Choice buttons */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <ChoiceButton
          active={isActive({ kind: "keep" })}
          aiHint={isAISuggestion({ kind: "keep" })}
          onClick={() => onChange({ kind: "keep" })}
          label="Keep"
        />
        {otherSprints.map((s) => {
          const free = headroom[s.index] ?? 0;
          const fits = free >= points;
          return (
            <ChoiceButton
              key={s.index}
              active={isActive({ kind: "move", toSprint: s.index })}
              aiHint={isAISuggestion({ kind: "move", toSprint: s.index })}
              onClick={() => onChange({ kind: "move", toSprint: s.index })}
              label={`${s.label}`}
              sub={fits ? `${free}p free` : `${free}p free · tight`}
              dim={!fits}
            />
          );
        })}
        <ChoiceButton
          active={isActive({ kind: "defer" })}
          aiHint={isAISuggestion({ kind: "defer" })}
          onClick={() => onChange({ kind: "defer" })}
          label="Defer Q4"
          icon={MoonStar}
        />
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  aiHint,
  onClick,
  label,
  sub,
  dim,
  icon: Icon,
}: {
  active: boolean;
  aiHint: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  dim?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] font-medium transition"
      style={{
        background: active ? "var(--color-accent)" : "var(--color-elevated)",
        color: active ? "var(--color-elevated)" : dim ? "var(--color-muted)" : "var(--color-secondary)",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        boxShadow: active ? "var(--shadow-sm)" : "none",
      }}
    >
      {Icon && <Icon size={11} />}
      <span>{label}</span>
      {sub && (
        <span
          className="font-numeric text-[10px]"
          style={{ color: active ? "var(--color-elevated)" : "var(--color-tertiary)", opacity: 0.85 }}
        >
          {sub}
        </span>
      )}
      {aiHint && !active && (
        <span
          aria-label="AI suggestion"
          className="absolute -right-1 -top-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-elevated)",
            fontSize: 8,
            fontWeight: 700,
          }}
        >
          ✦
        </span>
      )}
    </button>
  );
}

function SignalChip({ kind }: { kind: "revenue" | "deals" | "support" | "deadline" | "strategic" }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{
        background: `var(--color-chip-${kind}-bg)`,
        color: `var(--color-chip-${kind}-text)`,
      }}
    >
      {kind}
    </span>
  );
}

/* ─────────── Headroom computation ───────────
 * For each in-quarter sprint, return how much free capacity it has under the
 * user's CURRENT plan. The target sprint always returns 0 because the
 * incoming item is provisionally there. Other sprints account for any
 * items the user has selected to move INTO them.
 */

function computeHeadroom({
  sprintLoads,
  choices,
  itemsInTarget,
  targetSprint,
}: {
  sprintLoads: Record<number, number>;
  choices: Record<string, PlanChoice>;
  itemsInTarget: Initiative[];
  targetSprint: number;
}): Record<number, number> {
  const result: Record<number, number> = {};
  for (const sprint of SPRINTS) {
    const idx = sprint.index;
    if (idx === targetSprint) {
      result[idx] = 0;
      continue;
    }
    const baseLoad = sprintLoads[idx] ?? 0;
    // Add the effort of items the user is moving INTO this sprint.
    let incoming = 0;
    for (const item of itemsInTarget) {
      const c = choices[item.id];
      if (c && c.kind === "move" && c.toSprint === idx) {
        incoming += effortPoints(item);
      }
    }
    result[idx] = Math.max(0, SPRINT_CAPACITY - baseLoad - incoming);
  }
  return result;
}
