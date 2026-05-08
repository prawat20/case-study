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

### 5b. Triage — flow mode (`/inbox/triage`)

The wow moment. Full-screen, single card, keyboard-first.

```
┌──────────────────────────────────────────────────────────┐
│                                                       3/5 │  ← progress in corner
│                                                          │
│                                                          │
│                                                          │
│              ┌──────────────────────────────┐            │
│              │ ◷ 11 min · Sales · Slack     │            │
│              │                              │            │
│              │ Acme blocked on SAML —       │            │
│              │ 3 deals stalling             │            │
│              │                              │            │
│              │ "We've had 3 enterprise      │            │
│              │ deals slip in the last 2     │            │
│              │ weeks. SAML support is the   │            │
│              │ blocker." — sales lead       │            │
│              │                              │            │
│              │ signal: revenue · $480K ARR  │            │
│              └──────────────────────────────┘            │
│                                                          │
│                                                          │
│        [D] Defer    [R] Route    [P] Promote             │
│                                                          │
│        AI suggests: Promote to prioritize                │
│        "Revenue-blocking + named accounts + recent"      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- Card is centered, ~480px wide, ~360px tall. Shadow-md. White on cream — floats.
- Three keyboard targets: `D` (defer to next quarter), `R` (route to another team/owner), `P` (promote to Prioritize surface).
- AI suggestion is below the actions, never above. *Maya decides first; AI is the ghost in the room.*
- Decision → card slides 120px in direction (D=down, R=right, P=up) + fades 240ms. Next card rises from y+24 to y+0.
- Counter top-right: `1/5 → 2/5 → ... → done`.
- `Esc` exits to list mode mid-flow with progress saved.
- "Done" state: page fades to a calm completion message — *"Inbox cleared. 3 promoted, 1 routed, 1 deferred."* + CTA to Prioritize first promoted item.

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

- Sprint headers are eyebrow-style. Capacity bar inline (sage = ok, amber = full, brick = overflow).
- Items are 160×64px chips, status icon left, name right.
- Drag chip between sprints — capacity bars animate, dependencies render as ghost-lines.
- "Snap as Q3 plan" CTA top-right — fires snap chime, locks plan, surfaces to Stakeholders surface.

This is where Cron-grade craft lands.

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

## 12. Build sequence

Surface-by-surface, each shipped to preview before next.

1. **Foundation** — design system tokens in `globals.css`, fonts loaded, `data-theme` toggle wired, motion config.
2. **Now** — home aggregator. Establishes the visual language end-to-end.
3. **Inbox + Triage** — Cmd+N capture, list mode, deck-of-cards triage flow. The first wow moment.
4. **Prioritize** — single-item depth, framework picker, scorecard, trade-off-on-commit.
5. **Calendar** — sprint-by-sprint, drag-to-resequence, capacity bars, ripple ghost.
6. **Stakeholders** — generated artifacts, four audiences, copy-paste-ready.
7. **Audit** — decisions + predictions tabs, system-learning callout.
8. **Cmd+K refit** — restyled palette, new actions wired.
9. **Architecture refresh** — same diagram, new design system applied.
10. **Polish pass** — sound tuning, motion timing review, accessibility audit, deploy.

Each step is its own commit, each ships to preview. You react after each.

---

**Next step:** start §12 step 1 (foundation). Tokens + fonts + theme toggle, no surfaces yet — establishes the new look at the layout level. Then Now page as the first surface to react to.
