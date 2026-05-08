# CS2 v2 — IA + Surface Map

**Status:** draft for review (2026-05-08). Built downstream of `cs2_jbtd_and_pov.md` and `cs2_design_system_v2.md`. This locks the surface skeleton and route map before any component code is written.

---

## 1. Six surfaces, one loop

The seven JBTDs map to six surfaces — **Now** is the home that aggregates the loop, the other five are the loop itself.

| # | Surface       | Route               | Owns JBTD(s)        | Purpose statement                                                  |
|---|---------------|---------------------|---------------------|--------------------------------------------------------------------|
| 1 | Now           | `/`                 | aggregator (1-7)    | Where Maya lands. Calm overview of NSM, what's waiting, what's next. |
| 2 | Inbox         | `/inbox`            | JBTD-1, JBTD-2      | Capture + triage. Deck-of-cards triage flow. Front-door of the loop. |
| 3 | Prioritize    | `/prioritize/[id]`  | JBTD-3, JBTD-4      | Single-item depth — framework, scorecard, trade-offs, commit.        |
| 4 | Calendar      | `/calendar`         | JBTD-5              | The missing surface today. Sprint-by-sprint plan, drag-resequence.   |
| 5 | Stakeholders  | `/stakeholders`     | JBTD-6              | Generated artifacts per audience. Copy-paste-ready.                  |
| 6 | Audit         | `/audit`            | JBTD-7              | Decision log + prediction-vs-actual learning loop.                   |
| – | Architecture  | `/architecture`     | (case-study artifact) | Reviewer-facing only. Shows the AI capability stack.               |

**Architecture stays** — it's a deliverable for the case-study reviewer, not for Maya. Lives off the main loop.

---

## 2. The route map

```
/                       Now (home, aggregator)
/inbox                  Inbox — capture + triage
/inbox/triage           Triage flow (deck-of-cards full-screen mode)
/prioritize/[id]        Prioritize — single-item depth (replaces /initiative/[id])
/calendar               Calendar — sprint-by-sprint plan
/stakeholders           Stakeholders — generated artifacts hub
/stakeholders/[audience] One audience artifact (sales / exec / customer / eng)
/audit                  Audit + learn
/architecture           Case-study capability map (reviewer-facing)
```

### What's removed from current build

- `/quarter` → split. Sprint visibility moves to `/calendar`. Audience views move to `/stakeholders`.
- `/initiative/[id]` → renamed `/prioritize/[id]` to align with JBTD vocabulary.

### What's renamed and why

- "Priority Stream" → **Inbox**. The current name implies pre-prioritized; the JBTD-2 promise is that *nothing is prioritized until Maya triages it*.
- "Initiative Detail" → **Prioritize**. Detail is description-mode; Prioritize is decision-mode. Vocabulary should reveal intent.
- "Quarterly Simulation" → **Calendar**. "Simulation" is fancy-dress for what should feel as natural as Cron.

---

## 3. Navigation pattern — single calm header

No sidebar. No collapsible rail. **One thin top header.**

```
┌────────────────────────────────────────────────────────────────────┐
│  ◇ Glide          Now    Inbox  Prioritize  Calendar  Audit    ⌘K  │
└────────────────────────────────────────────────────────────────────┘
```

- 56px tall, `--surface` background, `--shadow-sm`, hairline `--border-subtle` bottom.
- Logo (Glide diamond) is sage. Wordmark in `--ink-1`, weight 600.
- Nav items: 14px Inter, `--ink-2` default, `--ink-1` on active surface, `--accent` on active page (single underline `--accent` 2px below).
- `⌘K` chip on the right — `--ink-3`, mono, opens command palette.
- **Stakeholders + Architecture are not in the top nav** — accessed via Cmd+K. They're not part of the daily loop.

Why no sidebar — Linear/Height/Tability all use sidebars. They're the right answer for *projects-with-issues* tools. We're not that. We're a *calm-flow planning* tool. Sidebar = constant navigation reminder = subtle cognitive load. Top header = "you're here, that's enough."

---

## 4. Surface 1 — Now (home)

**Owns:** aggregator. First impression on every visit.

**Content stack (single column, 720px max):**

```
┌─────────────────────────────────────────────────┐
│  Wednesday, May 8  ·  Week 9 of 13              │  ← contextual eyebrow
│                                                 │
│  Net New ARR     $1.5M of $2.4M                 │  ← NSM display
│  ▓▓▓▓▓▓▓░░░    63% achieved                    │
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
│  │ Sprint 2 of Q3, 4 items in flight         │  │  ← Calendar peek card
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
- Empty state (no inbox, no predictions due): "Inbox is clear. Q3 is on pace." + a single sage `Plan ahead →` link to Calendar.

---

## 5. Surface 2 — Inbox (capture + triage)

**Owns:** JBTD-1 (capture), JBTD-2 (triage).

Two modes on the same route:

### 5a. Inbox — list mode (`/inbox`)

What Maya sees when she opens Inbox without committing to triage. Stack of un-triaged items as a vertical list. Header has the **count + "Start triage"** CTA (sage, primary).

```
┌──────────────────────────────────────────────────┐
│  Inbox                                           │
│  5 to triage  ·  3 routed  ·  2 promoted today  │
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
│             Defer Route Promote                          │
│                                                          │
│              Swipe · click button · keyboard             │
└──────────────────────────────────────────────────────────┘
```

- **Drag right (or `→` / `P`) → Promote.** Card tilts +12°, sage tint emerges from right edge, "PROMOTE" stamp at +12° fades in.
- **Drag left (or `←` / `D`) → Defer.** Brick tint, "DEFER" stamp at -12°.
- **Click ↗ button or press `R` → Route.** Rare; "someone else owns this." Doesn't deserve a primary gesture.
- **Velocity-aware threshold** — fast flick triggers earlier than slow drag; below threshold the card springs back to center.
- **Past threshold** the card snaps off-screen with rotation; next card rises from y+24.
- **Counter top-right** ticks `1/N → 2/N → done`. **Esc** exits to list mode mid-flow.
- **Card front** carries everything needed for fast judgment: time/source/channel · title · synthesis · evidence quote · signal chip + ARR + RICE score + effort sprints · "If we ship —" predicted-outcome callout (sage-soft).
- **"Why this" expands inline** (Space or click) without leaving the card. Reveals: full score breakdown, AI's `action_reason`, conflicts to surface, full trade-offs list. Tap again to collapse.
- **44×44 circular action buttons** sit ~16px below the card — secondary affordances. Defer (red), Route (neutral), Promote (green).
- A **24px ghost slice** peeks below the active card edge — Tinder's "stack of cards" cue.
- **Done state**: *"Inbox cleared."* with promoted/routed/deferred tally. Sage CTA: **Place N in calendar →** when promotions exist.

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

## 6. Surface 3 — Prioritize (`/prioritize/[id]`)

**Owns:** JBTD-3 (framework), JBTD-4 (trade-offs).

Lifted from current `Initiative Detail` but rebuilt against design system v2 + JBTD-3/4. Major changes:

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
│  Q3 2026 · Week 9 of 13                  Snap as Q3 plan ▸   │
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
- "Snap as Q3 plan" CTA top-right — fires snap chime, locks plan, surfaces sage callout linking to Stakeholders.

### What actually shipped — the **puzzle** model

The implementation evolved past a pure "calendar with drag." Per user direction on 2026-05-09 (*"placement IS the prioritization, like a puzzle"*), the surface now has three zones:

1. **TO PLACE rail** at the top (sage dashed border) — items promoted via triage but not yet placed in a sprint. Each rail card shows title, effort points, RICE score, and AI's suggested-sprint chip. **The rail is the queue from triage.** It hides itself when empty.
2. **Four sprint lanes** as above. The AI-suggested sprint outlines softly while a card is being dragged ("AI suggests" pill on the sprint header).
3. **DEFER tray** at the bottom (warm dashed border) — drop any item here to push it out of Q3. Drag a deferred item back to a sprint to bring it into Q3 again.

**Drag = decide.** Drag rail → sprint commits the item (logs a `committed` decision via `addDecision`). Drag rail → defer tray records a `deferred` decision. Drag sprint → sprint just resequences. **No abstract Commit button on Calendar** — the placement IS the commit (per JBTD-4).

**Auto-reflow on overflow**: dropping into a full sprint fires `lib/sprint-conflict.computeCommitImpact`. Lower-priority items push to the next available sprint with a quiet toast announcing the chain. PM is free to drag pushed items back if they don't like the choice.

**Snap as Q3 plan** only enables when the rail is empty AND no sprint is over capacity. Forces the puzzle to actually be solved before the plan locks.

**Visual state** the PM can read at a glance:
- **Soft-placed** (AI-suggested, PM hasn't touched): dashed border
- **Committed** (PM placed): solid border + sage check
- **Deferred**: strikethrough, in the tray
- **AI-rec sprint while dragging**: sage outline + "AI suggests" pill

---

## 8. Surface 5 — Stakeholders (`/stakeholders`)

**Owns:** JBTD-6.

Hub showing four audience artifacts. Each is a *generated note*, not a filtered view.

```
┌──────────────────────────────────────────────────┐
│  Stakeholders                                    │
│  Generated from your committed Q3 plan           │
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
1. **Decisions** — chronological list of every commit/defer/escalate, with reasoning, framework, predicted outcome, override note (if any).
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

Same `cmdk` library. Restyled to match design system v2.

---

## 11. What's gone from the current build

| Removed | Replaced by |
|---|---|
| `/quarter` (audience-toggle Q view) | `/calendar` + `/stakeholders` (split) |
| `/initiative/[id]` route | `/prioritize/[id]` (rename) |
| Strategic banner + SignalShifts as front-door | Now-page summary cards (NSM display + Triage CTA + sprint peek) |
| Sprint View component embedded in Initiative Detail | Pulled out to `/calendar` as primary surface |
| Audience render toggle on Quarter | Removed; Stakeholder surface owns it |
| Dark theme as default | Light theme default; dark via `data-theme` |

---

## 12. Build sequence — what actually shipped (2026-05-09)

All ten steps shipped, plus three follow-up rounds in response to user feedback during the build.

| # | Commit | What landed |
|---|---|---|
| 1 | `26a747a` | Foundation — tokens + fonts + theme toggle |
| 2 | `d961018` | Now (home aggregator) + Inbox bridge |
| 3 | `9d7d11d` | Inbox + deck-of-cards triage + Cmd+N capture + Cmd+K refit |
| 4 | `aefaacb` | Prioritize v2 — framework picker + scorecard + commit-confirm |
| 5 | `c2a749c` | Calendar + Stakeholders + Audit + Architecture |
| 6 | `4a970e1` | **Real sprint impact on commit** — auto-reflow via `computeCommitImpact` |
| 7 | `b6291b9` | **Compact Prioritize** to single Decision card · triage intent labels |
| 8 | `9d2b9de` | **Calendar = puzzle** — TO PLACE rail + DEFER tray + drag-to-decide |
| 9 | `a6e8e04` | **Triage = Tinder swipe** with "Why this" inline expand |
| 10 | `2a99957` | Triage action buttons close to card |

The three highlighted rounds (6, 8, 9) emerged from user feedback during the build — items that the original IA spec had right in spirit but not in the specific interaction model. The doc above has been updated to reflect the actual shipped surfaces.

---

**v2 build complete.** Next: CS1 written doc (Revolut Primacy + Plottwyst pitch).
