# Information Architecture + Surface Map

> The surface skeleton, route map, and per-surface design intent that the CS2 build runs on. Downstream of `product_pov.md` (the seven JBTDs); upstream of every component in `quarterly-planning/components/`.

---

## 1. Five surfaces, one loop

The seven JBTDs map to five destination surfaces plus an off-loop case-study artifact. **Now** is the home that aggregates the loop and carries the front of capture + triage; the other four are the body of the loop.

> **Shipped (Round 16).** The NSM/North Star hero moved off Now to a quiet line on the **Calendar**, and Now became a single-decision-in-focus surface; the "% decided same day" leading indicator was dropped. The surface map below is preserved as design-time intent (see also the "Shipped consolidation" note under Surface 2).

| # | Surface       | Route               | Owns JBTD(s)        | Purpose                                                                |
|---|---------------|---------------------|---------------------|------------------------------------------------------------------------|
| 1 | Now           | `/`                 | JBTD-1, JBTD-2, aggregator (1–7) | Where the PM lands. NSM hero, inline triage rows, capture (`⌘N`), `Start triage →` CTA. |
| 2 | Prioritize    | `/initiative/[id]`  | JBTD-3, JBTD-4      | Single-item depth — framework, scorecard, trade-offs, commit. (Surface named "Prioritize"; route kept `/initiative`.) |
| 3 | Calendar      | `/calendar`         | JBTD-5              | Sprint-by-sprint plan as a drag-and-drop puzzle. Live capacity, AI-advisory Drop Planner on overflow. |
| 4 | Stakeholders  | `/stakeholders`     | JBTD-6              | Master/detail with persistent audience rail. Generated artifacts per audience, copy-paste-ready. |
| 5 | Audit         | `/audit`            | JBTD-7              | Decision log + prediction-vs-actual review loop.                       |
| – | Architecture  | `/architecture`     | (reviewer artifact) | Off-loop. Six-layer AI capability stack diagram for the case-study reviewer. |

---

## 2. The route map

```
/                          Now (home, aggregator + capture + triage front)
/inbox                     → redirect to /  (deep-link compatibility)
/quarter                   → alias for /calendar (deep-link compatibility)
/initiative/[id]           Prioritize — single-item depth
/calendar                  Calendar — sprint-by-sprint plan + Drop Planner
/stakeholders              Stakeholders — master/detail (?audience=sales|exec|customer|eng)
/stakeholders/[audience]   → redirect to /stakeholders?audience=[...]
/audit                     Audit + learn (#predictions hash for direct tab landing)
/architecture              Case-study capability map (reviewer-facing)
```

### Vocabulary choices

- **Inbox** rather than "Priority Stream." Nothing is prioritized until the PM triages it; the name should not pre-commit the outcome.
- **Prioritize** rather than "Initiative Detail." Detail is description-mode; Prioritize is decision-mode. Vocabulary should reveal intent.
- **Calendar** rather than "Quarterly Simulation." Planning here should feel as natural as Cron, not like a simulation.

### Calendar — explicit trade-off, not silent auto-reflow

When a drag would overflow a sprint, a Drop Planner panel expands inline with per-item destination control:

- Each item currently in the target sprint gets a row with destination buttons: `Keep | Sprint 1 (Xp free) | Sprint 3 (Yp free) | Sprint 4 (Zp free) | Defer Q3`. Headroom recomputes live as the PM toggles.
- An AI-suggested plan is pre-selected on each row with a ✦ badge on the suggested destination — the PM can override any row.
- A live trade-off summary updates per toggle: `Freeing 2p of 2p needed ✓ · RICE cost: −0.5 · All deadlines protected`.
- Commit is disabled until capacity matches; cancel reverts cleanly.
- On commit, reflowed items animate between sprints via Framer Motion `layoutId` shared-layout transitions (~420ms slide, no snap-disappear).

AI is **advisory, not deciding** — the PM controls *who* moves and *where they go*, not just which strategy label runs.

### Stakeholders — master/detail

A single surface, persistent 260px left rail with four audience cards (Sales, Exec, Customer, Engineering), right pane carrying the generated artifact. URL syncs to `?audience=sales|exec|customer|eng`. The artifact body remounts on every audience switch so the materialize stagger re-fires. Each artifact ships with `Copy as Slack` and `Copy as email` actions — clipboard-ready, no manual reformatting.

---

## 3. Navigation pattern — single calm header

No sidebar. No collapsible rail. **One thin top header.**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ◇ Sift   Now   Calendar   Stakeholders   Audit   Architecture   ?  ↻  ⌘K   │
└──────────────────────────────────────────────────────────────────────────────┘
```

> **Sift is the product.** Maya's fictional employer is *Glide* (see `product_pov.md`) — kept separate so the wordmark doesn't read as the company.

- 56px tall, `--surface` background, `--shadow-sm`, hairline `--border-subtle` bottom.
- Logo (Sift diamond) is sage. Wordmark in `--ink-1`, weight 600.
- Nav items: 14px Inter, `--ink-2` default, `--ink-1` on active surface, `--accent` on active page (single underline `--accent` 2px below).
- Right cluster: **?** opens the *How Sift works* side panel (400px right slide-in; no backdrop blur, no auto-fire — opens only on click, page stays interactive, mounted at body level so the fixed panel resolves against the viewport not the blurred header); **theme toggle**; **↻ Reset** clears the six demo-state stores after a confirm step (theme preference survives); **⌘K** chip opens the command palette.
- **Architecture is in the primary nav.** The original POV stance held Architecture as Cmd+K-only because it's not part of the daily loop. That tradeoff is wrong for this build — Architecture is the **case-study capability map**, and a reviewer who can't find it loses the most load-bearing context. Daily users would still default to Now / Calendar; the extra nav item costs them ~zero.
- **Stakeholders is in the primary nav** for the same reason — it's where the brief's "communicate per audience" JBTD lives, and reviewers should find it without Cmd+K.

Why no sidebar — Linear/Height/Tability all use sidebars. They're the right answer for *projects-with-issues* tools. We're not that. We're a *calm-flow planning* tool. Sidebar = constant navigation reminder = subtle cognitive load. Top header = "you're here, that's enough."

---

## 4. Surface 1 — Now (home)

**Owns:** aggregator. First impression on every visit.

**Content stack (single column, 720px max):**

```
┌─────────────────────────────────────────────────┐
│  Wednesday, May 8  ·  Week 4 of 13              │  ← contextual eyebrow
│                                                 │
│  Net New ARR     $600k of $2.4M                 │  ← NSM display
│  ▓▓░░░░░░░░    25% achieved                    │
│  Pace             −6pp behind                   │  ← gentle, not alarming
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│  Today                                          │  ← eyebrow
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 5 items waiting in your inbox             │  │  ← Triage CTA card
│  │ 2 shifted priority overnight              │  │
│  │                              Triage →     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ Sprint 2 of Q2, 4 items in flight         │  │  ← Calendar peek card
│  │ Capacity: 87%      Risk: SAML on track    │  │
│  │                              Open plan →  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 1 prediction due for review               │  │  ← Audit/learn card
│  │ "SAML unlocks 3 deals" — 3 weeks old      │  │
│  │                              Review →     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Design notes:**
- The NSM number uses `Display-NSM` (40px Fraunces). Single hero number on the page.
- Three "do today" cards stack vertically — never a grid. Each card is one decision worth making this hour.
- "% same-day decided" leading indicator lives next to NSM in small caption — Maya's planning-flow health metric.
- Empty state (no inbox, no predictions due): "Inbox is clear. Q2 is on pace." + a single sage `Plan ahead →` link to Calendar.

---

## 5. Surface 2 — Inbox (capture + triage)

**Owns:** JBTD-1 (capture), JBTD-2 (triage).

> **Shipped consolidation.** The standalone Inbox list (5a) folded into **Now**'s inline triage in v3 — `/inbox` now redirects to `/`, and the top untriaged item renders as a live card directly on Now (with the next few queued below). The full-screen swipe deck (5b) shipped at `/inbox/triage` for bulk triage. This section keeps the original two-mode design intent; the live build surfaces list-mode inline on Now and reserves the deck for bulk runs.

Two modes on the same route:

### 5a. Inbox — list mode (`/inbox`)

What Maya sees when she opens Inbox without committing to triage. Stack of un-triaged items as a vertical list. Header has the **count + "Start triage"** CTA (sage, primary).

```
┌──────────────────────────────────────────────────┐
│  Inbox                                           │
│  5 to triage  ·  3 escalated  ·  2 promoted today  │
│                                                  │
│  [Start triage]              + New (⌘N)          │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│  Just landed                                     │
│                                                  │
│  ◷ 11 min ago  ·  from Sales  ·  via Slack       │
│  Acme blocked on SAML — 3 deals stalling         │
│  signal: revenue                                 │
│                                                  │
│  ◷ 24 min ago  ·  from Support  ·  via Linear    │
│  Bulk import bug — 47 tickets in 2 weeks         │
│  signal: customer                                │
│                                                  │
│  ◷ 1h ago  ·  from CPO  ·  via email             │
│  "Where's our AI angle?" — exec ask              │
│  signal: strategic                               │
└──────────────────────────────────────────────────┘
```

- Single column. Each row ~56px tall, generous vertical rhythm.
- Time-since-arrival is the lead — "11 min ago" tells Maya which is fresh.
- Source + channel as secondary metadata.
- Signal-tag (revenue / customer / strategic / etc) as a single-color chip.
- Click any row → opens triage flow at that item.

### 5b. Triage — Tinder swipe card (`/inbox/triage`) **[shipped — final design]**

The wow moment. Full-screen, single card, **Tinder-style swipe-driven** with keyboard fallback.

> **Funnel framing.** Triage actions are **Promote / Defer / Escalate** (the sort step — Escalate here means "flag for input before I can sort it"). Decide is **Commit / Defer / Escalate** and happens in two places — (a) the **Calendar drop** (dragging a promoted item into a sprint = commit; the Drop Planner fires on overflow), or (b) the **Initiative Detail** page (the deeper view with framework picker, conflicts, predicted outcome). The Now page's "Ready to place" section surfaces both paths explicitly — clicking a row opens Decide; the "Open Calendar" CTA goes to drop-and-commit.

```
┌──────────────────────────────────────────────────────────┐
│                                                       3/5 │  ← progress
│              ┌──────────────────────────────┐            │
│              │ ◷ 11m · Sales · Slack        │            │
│              │                              │            │
│              │ Acme blocked on SAML —       │            │
│              │ 3 deals stalling             │            │
│              │                              │            │
│              │ "We've had 3 enterprise      │            │
│              │ deals slip..." — Acme        │            │
│              │                              │            │
│              │ revenue · $480k · RICE 14.4  │            │
│              │ · 3 sprints                  │            │
│              │                              │            │
│              │ ✦ If we ship — 3 deals close │            │
│              │   in ~6 weeks                │            │
│              │                              │            │
│              │ ⌄ Why this  [Space]          │            │
│              └──────────────────────────────┘            │
│                                                          │
│              ⊘   ↗   →                                   │
│           Defer Escalate Promote                         │
│                                                          │
│              Swipe · click button · keyboard             │
└──────────────────────────────────────────────────────────┘
```

- **Drag right (or `→` / `P`) → Promote.** Card tilts +12°, sage tint emerges from right edge, "PROMOTE" stamp at +12° fades in.
- **Drag left (or `←` / `D`) → Defer.** Brick tint, "DEFER" stamp at -12°.
- **Click ↗ button or press `E` → Escalate.** Rare; "needs input before I can commit." Doesn't deserve a primary gesture.
- **Velocity-aware threshold** — fast flick triggers earlier than slow drag; below threshold the card springs back to center.
- **Past threshold** the card snaps off-screen with rotation; next card rises from y+24.
- **Counter top-right** ticks `1/N → 2/N → done`. **Esc** exits to list mode mid-flow.
- **Card front** carries everything needed for fast judgment: time/source/channel · title · synthesis · evidence quote · signal chip + ARR + RICE score + effort sprints · "If we ship —" predicted-outcome callout (sage-soft).
- **The AI-recommended action is highlighted.** The matching action button (Promote / Defer / Escalate) carries the accent ✦ "AI's pick" treatment with an "✦ AI recommends {action}" caption, so the PM sees the system's call before acting — and any divergence is logged. (Same treatment on the Now inline triage card.) AI `commit → Promote`, `defer → Defer`, `escalate → Escalate`.
- **"Why this" expands inline** (Space or click) without leaving the card. Reveals: full score breakdown, AI's `action_reason`, conflicts to surface, full trade-offs list. Tap again to collapse.
- **44×44 circular action buttons** sit ~16px below the card — secondary affordances. Defer (red), Escalate (neutral), Promote (green).
- A **24px ghost slice** peeks below the active card edge — Tinder's "stack of cards" cue.
- **Done state**: *"Inbox cleared."* with promoted/escalated/deferred tally. Sage CTA: **Place N in calendar →** when promotions exist.

### Capture — `Cmd+N` modal (global)

```
┌──────────────────────────────────────┐
│ ◇  Capture an ask                ✕  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ |                                │ │  ← single text field, autofocus
│ │                                  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Auto-detected:                       │
│   source: from sales · revenue       │
│                                      │
│      [Esc] cancel    [⏎] capture     │
└──────────────────────────────────────┘
```

- Single text field, autofocus.
- As Maya types, system infers source/signal beneath. Inferred chips are editable.
- `Enter` saves to inbox. Capture chime fires. Modal closes. *No friction.*

---

## 6. Surface 3 — Prioritize (`/initiative/[id]`)

**Owns:** JBTD-3 (framework), JBTD-4 (trade-offs).

Single-item depth surface that holds the framework moment and the trade-off moment. Four design moves carry the surface:

1. **Framework picker is a first-class control** (not a chip popover). Top of the surface. PM picks RICE / ICE / Value-Effort / Strategic Bet / WSJF; the **scorecard re-renders below**.
2. **Trade-offs section is part of the commit confirmation**, not above-the-fold. When PM clicks Commit, an inline confirm shows: *"Committing this will push X to Sprint 4 and free Y for Sprint 2. Confirm?"*
3. **Predicted outcome stays inline** below the recommendation card.
4. **Override-as-path stays** — choosing non-AI action triggers the inline reason prompt.

Page skeleton:

```
┌────────────────────────────────────────────────────┐
│  ←  Inbox                              Audit log →  │
│                                                    │
│  Acme blocked on SAML                              │  ← page title (28px serif)
│  signal: revenue · $480K ARR · 3 deals             │
│                                                    │
│ ─────────────────────────────────────────────── │
│                                                    │
│  Framework                                         │  ← eyebrow
│  ◉ RICE   ○ ICE   ○ Value-Effort   ○ Strategic Bet │
│  AI picked RICE: shippable, scopeable, comparable  │
│                                                    │
│  Score                                             │
│  ┌──────────┬───────┬───────┬──────────┬────────┐  │
│  │ Reach    │ Impact│ Conf  │ Effort   │ RICE   │  │
│  │ 12 acct  │  3    │ 80%   │ 2 sprint │  14.4  │  │
│  └──────────┴───────┴───────┴──────────┴────────┘  │
│                                                    │
│  Recommendation                                    │
│  Commit · Sprint 2                                 │
│  Predicted: 3 deals close within 6 weeks           │
│                                                    │
│  Trade-offs (preview)                              │
│  Committing pushes Webhook v2 to Sprint 4.         │
│  No dependency conflict. Eng capacity ok.          │
│                                                    │
│ ─────────────────────────────────────────────── │
│                                                    │
│   [Commit ⏎]   [Defer]   [Escalate]                │
└────────────────────────────────────────────────────┘
```

---

## 7. Surface 4 — Calendar (`/calendar`)

**Owns:** JBTD-5. The missing surface.

Sprint-by-sprint vertical timeline. Each sprint is a horizontal lane (~120px tall) with capacity bar. Items drag between sprints; ghost-rendered ripple shows downstream impact in real time.

```
┌───────────────────────────────────────────────────────────────┐
│  Q2 2026 · Week 9 of 13                  Snap as Q2 plan ▸   │
│                                                               │
│ ─────────────────────────────────────────────────────────── │
│                                                               │
│  Sprint 1 · May 12-23 · 92% capacity      ✓ shipped          │
│  ┌────────────────┐ ┌────────────────┐                       │
│  │ Bulk CSV       │ │ Webhook v1     │                       │
│  │ ✓ shipped      │ │ ✓ shipped      │                       │
│  └────────────────┘ └────────────────┘                       │
│                                                               │
│  Sprint 2 · May 26-Jun 6 · 87% capacity   ⏵ in flight        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│  │ SAML           │ │ Audit log v1   │ │ Onboarding 2.0 │    │
│  │ ⏵ in flight    │ │ ⏵ in flight    │ │ ⏵ in flight    │    │
│  └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                               │
│  Sprint 3 · Jun 9-20 · 104% capacity ⚠     planned           │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│  │ Webhook v2     │ │ SOC2 audit log │ │ Bulk import fix│    │
│  └────────────────┘ └────────────────┘ └────────────────┘    │
│  ⚠ Sprint 3 is over capacity. Move one item.                 │
│                                                               │
│  Sprint 4 · Jun 23-Jul 4 · 0% capacity     planning          │
│  (drop items here)                                            │
└───────────────────────────────────────────────────────────────┘
```

- Sprint headers are eyebrow-style. Capacity bar inline (sage = ok, amber = tight or overflow).
- Items are chips with title + effort-points badge tinted by signal kind.
- Drag chip between sprints — capacity bars animate live.
- "Snap as Q2 plan" CTA top-right — fires snap chime, locks plan, surfaces sage callout linking to Stakeholders.

### What actually shipped — the **puzzle** model

The implementation evolved past a pure "calendar with drag." Per user direction on 2026-05-09 (*"placement IS the prioritization, like a puzzle"*), the surface now has three zones:

1. **TO PLACE rail** at the top (sage dashed border) — items promoted via triage but not yet placed in a sprint. Each rail card shows title, effort points, RICE score, and AI's suggested-sprint chip. **The rail is the queue from triage.** It hides itself when empty.
2. **Four sprint lanes** as above. The AI-suggested sprint outlines softly while a card is being dragged ("AI suggests" pill on the sprint header).
3. **DEFER tray** at the bottom (warm dashed border) — drop any item here to push it out of Q2. Drag a deferred item back to a sprint to bring it into Q2 again.

**Drag = decide.** Drag rail → sprint commits the item (logs a `committed` decision via `addDecision`). Drag rail → defer tray records a `deferred` decision. Drag sprint → sprint just resequences. **No abstract Commit button on Calendar** — the placement IS the commit (per JBTD-4).

**Auto-reflow on overflow**: dropping into a full sprint fires `lib/sprint-conflict.computeCommitImpact`. Lower-priority items push to the next available sprint with a quiet toast announcing the chain. PM is free to drag pushed items back if they don't like the choice.

**Snap as Q2 plan** only enables when the rail is empty AND no sprint is over capacity. Forces the puzzle to actually be solved before the plan locks.

**Visual state** the PM can read at a glance:
- **Soft-placed** (AI-suggested, PM hasn't touched): dashed border
- **Committed** (PM placed): solid border + sage check
- **Deferred**: strikethrough, in the tray
- **AI-rec sprint while dragging**: sage outline + "AI suggests" pill

**Sprint lifecycle** (added 2026-05-20 for logical consistency with the NSM weeks-elapsed clock):
- **Shipped** — past sprint. Lane dimmed (opacity 0.62), dashed muted border, "Shipped" pill. **No drops accepted**, items inside not draggable, no AI-suggests highlight, not selected as a reflow destination. The PM can't act on a sprint that already shipped — surfacing it as a valid drop target would be a lie.
- **In flight** — current sprint. Drops accepted; visually carries the "In flight" pill so late-adds read as the scope-creep they are.
- **Planned** — future sprints. Normal drop targets.
- The temporal anchor (`weeks_elapsed` in `lib/strategic.ts`) and the sprint statuses (`lib/sprint-data.ts`) are kept in sync — moving one without the other creates the same kind of internal inconsistency that caused this fix.

---

## 8. Surface 5 — Stakeholders (`/stakeholders`)

**Owns:** JBTD-6.

Hub showing four audience artifacts. Each is a *generated note*, not a filtered view.

```
┌──────────────────────────────────────────────────┐
│  Stakeholders                                    │
│  Generated from your committed Q2 plan           │
│                                                  │
│  ┌─────────────┬─────────────┬─────────────┐    │
│  │ Sales       │ Exec        │ Customer    │    │
│  │ deal-by-    │ one para +  │ what's      │    │
│  │ deal map    │ one chart   │ shipping    │    │
│  │ View →      │ View →      │ View →      │    │
│  └─────────────┴─────────────┴─────────────┘    │
│  ┌─────────────┐                                 │
│  │ Eng         │                                 │
│  │ capacity +  │                                 │
│  │ dependency  │                                 │
│  │ View →      │                                 │
│  └─────────────┘                                 │
└──────────────────────────────────────────────────┘
```

Click into one (`/stakeholders/sales`) — full artifact renders with materialize choreography (lines fade in 80ms staggered). Buttons: `Copy as Slack`, `Copy as Email`, `Open in new tab`. Each format is shaped for the audience — sales gets named deals + close timing, exec gets paragraph + KPI, eng gets capacity table + dependencies.

---

## 9. Surface 6 — Audit (`/audit`)

**Owns:** JBTD-7.

Two-tab structure:
1. **Activity** — chronological list of *every* PM action (triage **and** decisions), each annotated with what the system recommended: *"You {Promoted / Committed · Sprint 2 / Deferred / …} → ✦ AI recommended {Commit / Defer / Escalate}."* Divergences (PM chose differently) are highlighted with an accent border + *"↻ Diverged — feeds recalibration"* and the rationale; matches show a quiet *"✓ Matched the system."* A calibration summary (actions logged · followed AI · diverged) frames divergences as the training signal, with a Divergences-only filter to isolate them. **This is the AI-native loop made visible — the gap between recommendation and action is the signal that recalibrates the engine.**
2. **Predictions** — items where prediction's review window has elapsed. Each card shows "Predicted X. Actual: Y. Note?" with a free-text capture and a "this prediction was wrong because…" prompt that shapes future weights.

System-learning cue: a sage callout — *"You've reviewed 7 predictions. Your accuracy on revenue claims is 71%; on adoption claims, 38%. The system is weighting revenue claims higher in suggestions."*

---

## 10. Cmd+K — global power

Cmd+K stays. It now handles:
- Jump to surface (Now, Inbox, Calendar, Audit, Stakeholders, Architecture)
- Capture (`new ask`)
- Run triage (start the deck flow)
- Open one stakeholder artifact (`for sales`, `for exec`)
- Reset demo
- Toggle theme (light / dark)

Built on the `cmdk` library, restyled to the project palette.

---

## 11. Anti-patterns explicitly avoided

| Avoided | Reason |
|---|---|
| Audience-toggle quarter view | Same data filtered four ways pretends the audiences read the same shape; they don't. Per-audience generated artifacts replace it. |
| "Initiative Detail" framing | Detail is description-mode; the surface is decision-mode. Renamed `Prioritize`. |
| SignalShifts banner on the home | Front-door noise. Folded into Triage as "N items shifted priority overnight; re-triage first?" |
| Sprint View embedded in Initiative Detail | Sequencing is its own JBTD; it earns its own surface (`Calendar`). |
| Dark theme as default | Cold dark on cold black reads as Bloomberg terminal; light cream + sage is the default, dark is opt-in. |
| Multi-column tables on any surface | Forces multi-axis scanning; violates Zero Cognitive Load. Every surface is single-column or vertical. |
| Standalone AI chat panel | Anti-pattern per the design rubric — AI is in-place advisor, not a separate persona to talk to. |
