/**
 * Stakeholder artifacts — generates audience-specific artifact content
 * from the current plan + committed decisions. Output is line-shaped
 * so the Stakeholders surface can render with a per-line materialize
 * stagger.
 */

import type { Initiative } from "@/lib/types";
import type { Decision } from "@/lib/decisions";
import { parseSequenceToSprint, SPRINTS, SPRINT_CAPACITY, effortPoints } from "@/lib/sprint-data";
import { NORTH_STAR, computeNorthStar, formatMetric } from "@/lib/strategic";

export type AudienceKey = "sales" | "exec" | "customer" | "eng";

export interface AudienceMeta {
  key: AudienceKey;
  label: string;
  blurb: string;
  format: string; // 1-line description of the artifact shape
}

export const AUDIENCES: AudienceMeta[] = [
  {
    key: "sales",
    label: "Sales",
    blurb: "Deal-by-deal mapping. What's blocked, what's unblocking, when.",
    format: "Per-deal lines · close timing · talking points",
  },
  {
    key: "exec",
    label: "Exec",
    blurb: "One paragraph + KPI strip. Pace and posture, not features.",
    format: "Paragraph · KPIs · one risk flag",
  },
  {
    key: "customer",
    label: "Customer",
    blurb: "What's shipping by month. No internal jargon.",
    format: "Plain bullets · ship dates · zero acronyms",
  },
  {
    key: "eng",
    label: "Engineering",
    blurb: "Capacity utilization + dependencies + tradeoffs.",
    format: "Capacity table · dependency notes · tradeoffs",
  },
];

export type Line =
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "para"; text: string }
  | { type: "section"; text: string }
  | { type: "bullet"; text: string; meta?: string }
  | { type: "kpi"; label: string; value: string; hint?: string }
  | { type: "row"; cells: string[] }
  | { type: "spacer" };

interface BuildContext {
  initiatives: Initiative[];
  decisions: Decision[];
  assignments: Record<string, number>;
}

function getSprintFor(i: Initiative, ctx: BuildContext): number {
  return ctx.assignments[i.id] ?? parseSequenceToSprint(i.ai_recommendation.sequence);
}

function committedItems(ctx: BuildContext): Initiative[] {
  const committed = new Set(
    ctx.decisions.filter((d) => d.action === "committed" || d.action === "overridden").map((d) => d.initiative_id),
  );
  // For demo: if nothing committed yet, surface the AI-recommended commits as "tentative"
  const tentative = ctx.initiatives.filter(
    (i) => i.ai_recommendation.action === "commit" && !committed.has(i.id),
  );
  const committedList = ctx.initiatives.filter((i) => committed.has(i.id));
  return [...committedList, ...tentative];
}

/* ─────────── Audience builders ─────────── */

function buildSales(ctx: BuildContext): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "title", text: "Q2 plan — what affects deals" });
  lines.push({ type: "subtitle", text: `Generated from your committed plan · Week ${NORTH_STAR.weeks_elapsed} of ${NORTH_STAR.weeks_total}` });
  lines.push({ type: "spacer" });

  const dealItems = ctx.initiatives.filter(
    (i) =>
      i.signal_type === "deal_blocker" || (i.arr_exposure_usd && i.arr_exposure_usd > 0),
  );
  const totalArr = dealItems.reduce((acc, i) => acc + (i.arr_exposure_usd ?? 0), 0);

  lines.push({
    type: "para",
    text: `${dealItems.length} active items influence open deals — $${(totalArr / 1000).toFixed(0)}k ARR collectively. Here's where each lands.`,
  });
  lines.push({ type: "spacer" });

  lines.push({ type: "section", text: "Active deal coverage" });

  for (const i of dealItems) {
    const sprint = getSprintFor(i, ctx);
    const sprintLabel = SPRINTS[sprint - 1]?.label ?? `Sprint ${sprint}`;
    const dateLabel = SPRINTS[sprint - 1]?.date_label ?? "TBD";
    const arr = i.arr_exposure_usd ?? 0;
    const arrText = arr > 0 ? `$${(arr / 1000).toFixed(0)}k ARR` : "no ARR exposure logged";
    lines.push({
      type: "bullet",
      text: `${i.title} — lands ${sprintLabel} (${dateLabel})`,
      meta: arrText,
    });
  }

  lines.push({ type: "spacer" });
  lines.push({ type: "section", text: "Talking points" });
  lines.push({ type: "bullet", text: "Lead with timeline, not feature scope. Sales conversations break on dates." });
  lines.push({ type: "bullet", text: "If a deal asks for a feature outside this plan, route via Cmd+N — don't promise." });
  lines.push({ type: "bullet", text: "Audit-log access is shipping Sprint 2 — unblocks SOC2 questions for enterprise." });

  return lines;
}

function buildExec(ctx: BuildContext): Line[] {
  const ns = computeNorthStar(NORTH_STAR);
  const trendPhrase =
    ns.trend === "behind"
      ? `${Math.abs(ns.pace_gap_pp)}pp behind`
      : ns.trend === "ahead"
        ? `${ns.pace_gap_pp}pp ahead`
        : "on pace";
  const committed = committedItems(ctx);

  // Top risk = most over-capacity sprint or highest-ARR uncommitted item
  const sprintLoad: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  ctx.initiatives.forEach((i) => {
    const s = getSprintFor(i, ctx);
    sprintLoad[s] = (sprintLoad[s] ?? 0) + effortPoints(i);
  });
  const overloaded = Object.entries(sprintLoad).find(([, l]) => l > SPRINT_CAPACITY);

  const lines: Line[] = [];
  lines.push({ type: "title", text: "Q2 read · for Exec" });
  lines.push({ type: "subtitle", text: "One-paragraph posture, KPIs, and the risk you should know." });
  lines.push({ type: "spacer" });

  lines.push({
    type: "para",
    text: `We're ${trendPhrase} on Net New ARR (${formatMetric(NORTH_STAR.current_value, NORTH_STAR.format)} of ${formatMetric(NORTH_STAR.target_value, NORTH_STAR.format)} — ${ns.achieved_pct}% achieved against ${ns.elapsed_pct}% elapsed). ${committed.length} initiatives are committed across the four Q2 sprints, weighted toward Enterprise Readiness. The plan trades partner-portal exploration for SAML + bulk-import — both directly tied to in-flight enterprise deals. Recommend we hold this posture; revisit at week 11.`,
  });
  lines.push({ type: "spacer" });

  lines.push({ type: "section", text: "KPIs" });
  lines.push({
    type: "kpi",
    label: "Net New ARR",
    value: `${formatMetric(NORTH_STAR.current_value, NORTH_STAR.format)} / ${formatMetric(NORTH_STAR.target_value, NORTH_STAR.format)}`,
    hint: trendPhrase,
  });
  lines.push({
    type: "kpi",
    label: "Sprint capacity utilization",
    value: `${Math.round((Object.values(sprintLoad).reduce((a, b) => a + b, 0) / (SPRINT_CAPACITY * 4)) * 100)}%`,
    hint: "across Q2",
  });
  lines.push({
    type: "kpi",
    label: "Items committed",
    value: `${committed.length}`,
    hint: `of ${ctx.initiatives.length} candidates`,
  });
  lines.push({ type: "spacer" });

  lines.push({ type: "section", text: "Risk to flag" });
  if (overloaded) {
    lines.push({
      type: "bullet",
      text: `Sprint ${overloaded[0]} is at ${Math.round((+overloaded[1] / SPRINT_CAPACITY) * 100)}% — recommend reflowing one item to Sprint 4.`,
    });
  } else {
    lines.push({
      type: "bullet",
      text: "No capacity overruns. Watch SOC2 audit-log dependency in Sprint 3 — eng called out medium confidence.",
    });
  }

  return lines;
}

// Calendar month each Q2 sprint completes in (by its end date) — customers think
// in months, not sprint windows.
const SHIP_MONTH_BY_SPRINT: Record<number, string> = { 1: "May", 2: "June", 3: "June", 4: "July" };
const MONTH_ORDER = ["May", "June", "July"];

function buildCustomer(ctx: BuildContext): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "title", text: "What's coming" });
  lines.push({ type: "subtitle", text: "The improvements headed your way this quarter." });
  lines.push({ type: "spacer" });

  // Customer-safe content only: confirmed work that's genuinely planned for THIS
  // quarter. Never deferred/exploratory items, never internal rationale (ARR,
  // deal counts, tickets, "escalated") — those live in synthesis_oneliner and
  // must not leave the building. We render i.customer (plain name + benefit).
  const committedIds = new Set(
    ctx.decisions
      .filter((d) => d.action === "committed" || d.action === "overridden")
      .map((d) => d.initiative_id),
  );
  const shipping = ctx.initiatives.filter((i) => {
    const confirmed = committedIds.has(i.id) || i.ai_recommendation.action === "commit";
    const thisQuarter = (i.ai_recommendation.sequence ?? "").startsWith("Q2");
    return confirmed && thisQuarter;
  });

  if (shipping.length === 0) {
    lines.push({
      type: "para",
      text: "We don't have new releases to confirm for you just yet — we'll share the plan as soon as it's set.",
    });
    return lines;
  }

  lines.push({
    type: "para",
    text: "Here's what your team will see roll out, grouped by month so you can plan training and adoption. We'll let you know as each one becomes available.",
  });
  lines.push({ type: "spacer" });

  const byMonth = new Map<string, Initiative[]>();
  for (const i of shipping) {
    const month = SHIP_MONTH_BY_SPRINT[getSprintFor(i, ctx)] ?? "Later this quarter";
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(i);
  }

  for (const month of [...MONTH_ORDER, "Later this quarter"]) {
    const items = byMonth.get(month);
    if (!items || items.length === 0) continue;
    lines.push({ type: "section", text: month });
    for (const i of items) {
      lines.push({
        type: "bullet",
        text: i.customer?.name ?? i.title,
        meta: i.customer?.summary,
      });
    }
    lines.push({ type: "spacer" });
  }

  lines.push({ type: "section", text: "Questions or requests?" });
  lines.push({ type: "bullet", text: "For anything time-sensitive, reach out to your Customer Success Manager — they'll make sure it reaches our product team." });
  lines.push({ type: "bullet", text: "Have a bigger idea? Our customer advisory board helps shape what we build next." });

  return lines;
}

function buildEng(ctx: BuildContext): Line[] {
  const lines: Line[] = [];
  lines.push({ type: "title", text: "Q2 capacity + dependencies" });
  lines.push({ type: "subtitle", text: "What's loaded where, and what could push." });
  lines.push({ type: "spacer" });

  lines.push({ type: "section", text: "Sprint capacity" });
  lines.push({ type: "row", cells: ["Sprint", "Window", "Load", "Capacity", "Util %"] });
  for (const sprint of SPRINTS) {
    const sprintItems = ctx.initiatives.filter((i) => getSprintFor(i, ctx) === sprint.index);
    const load = sprintItems.reduce((acc, i) => acc + effortPoints(i), 0);
    const pct = Math.round((load / SPRINT_CAPACITY) * 100);
    lines.push({
      type: "row",
      cells: [sprint.label, sprint.date_label, `${load}p`, `${SPRINT_CAPACITY}p`, `${pct}%`],
    });
  }
  lines.push({ type: "spacer" });

  lines.push({ type: "section", text: "Dependencies + tradeoffs" });
  for (const i of ctx.initiatives) {
    const tradeoffs = i.ai_recommendation.tradeoffs;
    if (tradeoffs.length === 0) continue;
    lines.push({ type: "bullet", text: `${i.title}`, meta: tradeoffs[0] });
  }

  return lines;
}

/* ─────────── Public entry ─────────── */

export function buildArtifact(audience: AudienceKey, ctx: BuildContext): Line[] {
  switch (audience) {
    case "sales":
      return buildSales(ctx);
    case "exec":
      return buildExec(ctx);
    case "customer":
      return buildCustomer(ctx);
    case "eng":
      return buildEng(ctx);
  }
}

/* ─────────── Render to plain text (for clipboard) ─────────── */

export function renderAsMarkdown(lines: Line[]): string {
  const out: string[] = [];
  for (const line of lines) {
    switch (line.type) {
      case "title":
        out.push(`# ${line.text}`);
        break;
      case "subtitle":
        out.push(`_${line.text}_`);
        break;
      case "section":
        out.push(`\n**${line.text}**`);
        break;
      case "para":
        out.push(line.text);
        break;
      case "bullet":
        out.push(line.meta ? `- ${line.text} — ${line.meta}` : `- ${line.text}`);
        break;
      case "kpi":
        out.push(`- **${line.label}:** ${line.value}${line.hint ? ` _(${line.hint})_` : ""}`);
        break;
      case "row":
        out.push(`| ${line.cells.join(" | ")} |`);
        break;
      case "spacer":
        out.push("");
        break;
    }
  }
  return out.join("\n");
}

export function renderAsSlack(lines: Line[]): string {
  const out: string[] = [];
  for (const line of lines) {
    switch (line.type) {
      case "title":
        out.push(`*${line.text}*`);
        break;
      case "subtitle":
        out.push(`_${line.text}_`);
        break;
      case "section":
        out.push(`\n*${line.text}*`);
        break;
      case "para":
        out.push(line.text);
        break;
      case "bullet":
        out.push(line.meta ? `• ${line.text} — _${line.meta}_` : `• ${line.text}`);
        break;
      case "kpi":
        out.push(`• *${line.label}:* ${line.value}${line.hint ? ` _(${line.hint})_` : ""}`);
        break;
      case "row":
        out.push(line.cells.join(" · "));
        break;
      case "spacer":
        out.push("");
        break;
    }
  }
  return out.join("\n");
}
