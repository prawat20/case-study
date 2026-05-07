# Quarterly Planning — Wireframe Spec

> The build contract. Every screen, every element, every interaction.
> Status: locked 2026-05-07. Build proceeds against this; deviations flow back here.

---

## Global system

### Routing

| Route | Screen |
|---|---|
| `/` | Priority Stream (default home) |
| `/initiative/[id]` | Initiative Detail |
| `/quarter` | Quarterly Simulation |
| `/architecture` | Architecture diagram (static) |
| `Cmd+K` (overlay) | Command palette |

### Design tokens

- **Mode:** dark-mode primary (Linear/Superhuman energy). Light-mode is out of scope for v1.
- **Background:** `#0a0a0b` (page), `#111114` (elevated surfaces), `#1a1a1f` (cards on hover/focus)
- **Text:** `#fafafa` primary, `#a1a1aa` secondary, `#52525b` tertiary
- **Accent:** single color — `#7c5cff` (a calm violet — distinctive, not Linear's purple, not Superhuman's blue). Used for CTAs, focus rings, AI-synthesis indicators.
- **Status dots:** `#22c55e` (committed), `#f59e0b` (needs decision), `#ef4444` (conflict), `#71717a` (deferred)
- **Typography:** Inter (UI), Inter Display (headlines), JetBrains Mono (timestamps, IDs)
- **Type scale:** 11 / 13 / 14 / 16 / 18 / 24 / 32 / 48
- **Spacing:** 4px base; scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- **Radius:** 8px standard, 12px for prominent surfaces, 999px for chips
- **Max content width:** 720px — single-column, forces no left-right scanning
- **Motion:** 150ms ease-out (default), 300ms spring (decision-lands animation), all under 100ms feedback target

### Global header (every screen except Initiative Detail)

```
┌─────────────────────────────────────────────────────────┐
│  ◐ workspace name                Week 19 · May 7 — 13   │
│                                            ⌘K   pravesh │
└─────────────────────────────────────────────────────────┘
```

- Left: minimal logo (a single character mark — `◐`) + workspace name in 14px secondary
- Right: live week indicator (e.g., "Week 19 · May 7 — 13"), `⌘K` chip (clickable, opens command palette), user avatar (clickable, dropdown = settings stub)
- Total height: 56px. Border-bottom: 1px `#1a1a1f`.
- The header is the only persistent chrome. No left nav, no tabs, no breadcrumbs. One-page-one-context.

---

## Screen 1 — Priority Stream

**Role in the flow:** the home. Where the PM lands every morning. The calm, opinionated feed of decisions that need attention today.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│   ◐ Workspace                            ⌘K   pravesh   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Good morning, Pravesh. 4 decisions today.             │
│   The system is watching 23 more — none need you yet.   │
│                                                         │
│   ╭─────────────────────────────────────────────────╮  │
│   │ ● Bulk CSV import for enterprise               │  │
│   │   Blocking 3 deals worth $480k. Sales escalated │  │
│   │   this week. Recommend: Sprint 1 of Q3.         │  │
│   │                                          Decide ▶│  │
│   ╰─────────────────────────────────────────────────╯  │
│                                                         │
│   ╭─────────────────────────────────────────────────╮  │
│   │ ● SSO via SAML — needs decision                │  │
│   │   ...                                            │  │
│   ╰─────────────────────────────────────────────────╯  │
│                                                         │
│   [3 more cards, vertically stacked, single-column]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Greeting line** (top, 24px, primary text): `Good morning, [Name]. [N] decisions today.` — AI-synthesized count, never zero unless truly nothing.
- **Sub-greeting** (14px, secondary): `The system is watching [N] more — none need you yet.` — communicates that the system is *thinking* even when the screen is calm.
- **Decision cards** (vertical stack, 16px gap):
  - Each card: ~88px tall, 720px wide
  - Status dot (left, 8px circle, color from token set)
  - **Title line** (16px, primary, semibold): the AI-synthesized one-liner — *what it is*
  - **Subline** (14px, secondary): *why now* + *who needs it most* — compressed
  - **Right action chip**: `Decide ▶` (12px, accent color, hover-reveals keyboard shortcut hint `↵ to open`)
- **No date column, no priority column, no scoring column.** The AI has already done that work. The card content reflects the synthesis; the matrix of inputs is hidden.

### Interactions

- **Hover card**: subtle background lift to `#1a1a1f`, elevation shadow, sub-100ms
- **Click card** or **press `↵` when focused**: navigate to `/initiative/[id]`
- **Arrow keys**: focus moves between cards (focus ring in accent color)
- **`E` while card focused**: quick-defer (toast: "Deferred. The system will resurface when context shifts.")
- **`Cmd+K`**: opens command palette overlay

### Empty state

When no decisions need attention:

> ```
> ╭─────────────────────────────────────────────────╮
> │   ◐                                              │
> │   You're caught up.                              │
> │   The system is monitoring 23 initiatives.       │
> │   I'll surface what needs you.                   │
> ╰─────────────────────────────────────────────────╯
> ```

Centered. Calm. Quietly confident. Says "the system is on duty" without crowding.

### DfD compliance check

- ✅ Zero clutter — only what's necessary on each card
- ✅ Use fewer words — every line is 1 short sentence max
- ✅ Smart defaults — AI has pre-synthesized; no scoring fields visible
- ✅ One page, one context — only decisions today
- ✅ Visual hierarchy — top-to-bottom scanning only, no columns
- ✅ Instant feedback — focus ring + hover lift under 100ms
- ✅ Familiar mental model — looks like an inbox/feed

---

## Screen 2 — Initiative Detail (the unique design moment)

**Role in the flow:** the decision surface. Where the PM commits, overrides, or defers. The single highest-frequency action in the whole product.

### Layout — full-screen, single context, no global header

```
┌─────────────────────────────────────────────────────────┐
│  ←  Bulk CSV import for enterprise                      │
│                                                         │
│                                                         │
│   This unblocks 3 deals worth $480k ARR.                │
│   Sales escalated it this week — second time            │
│   this quarter. The pattern is clear: enterprise        │
│   buyers expect bulk import on day one.                 │
│                                                         │
│   ──────────────────────────────────────────────        │
│                                                         │
│   Evidence                                              │
│   ╭──────╮ ╭──────╮ ╭──────╮ ╭──────╮ ╭──────╮         │
│   │ $480k│ │ 3 deals│ │ 11   │ │ 4    │ │ 2x   │       │
│   │ ARR  │ │  open │ │ tickets│ │ calls│ │ this │       │
│   ╰──────╯ ╰──────╯ ╰──────╯ ╰──────╯ ╰──────╯         │
│                                                         │
│   ──────────────────────────────────────────────        │
│                                                         │
│   ╭─────────────────────────────────────────────╮      │
│   │ Recommended                                  │      │
│   │ Sequence in Sprint 1 of Q3.                  │      │
│   │ Estimated effort: 3 sprints (eng-confidence  │      │
│   │ medium). Addresses 3 of top 5 enterprise     │      │
│   │ blockers. No conflicts detected.             │      │
│   ╰─────────────────────────────────────────────╯      │
│                                                         │
│                                                         │
│   ↵ Commit       E Override       D Defer       S Esc  │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Top bar** (56px): back arrow (←) + initiative name in 16px primary. Nothing else. No global header, no Cmd+K chip — this screen is fully focused.
- **Hero rationale** (32px primary text, max 3 sentences, ~600px width centered): the AI-synthesized *narrative*. Reads like a 1-paragraph memo from a senior PM. **This is the unique-design moment** — most prioritization tools show a form; we show a thought.
- **Evidence chips section**:
  - Label "Evidence" in 12px tertiary, uppercase, letter-spaced
  - 5-6 chips horizontally, 88px wide each, 64px tall, rounded 12px, dark `#111114`
  - Each chip: bold number (24px primary) + tiny caption (11px secondary)
  - **Click chip** → expands inline (300ms spring) showing the underlying quote/source ("VP Eng at Acme Corp on Apr 30 call: 'CSV import is the #1 onboarding blocker'")
- **Recommendation card** (card surface, ~600px wide, accent left border 2px):
  - Label "Recommended" in 12px accent, uppercase, letter-spaced
  - 4-line synthesis: sequence + effort + impact + conflicts
  - This is the AI's full recommendation in plain language — what most tools bury in fields
- **Action bar** (bottom, 56px tall, sticky):
  - 4 actions, each: keyboard hint chip + label
  - `↵ Commit` (accent button, primary), `E Override`, `D Defer`, `S Escalate` (ghost buttons)

### Interactions

- **`↵` (return)**: commits the AI's recommendation. Fires the decision-lands animation:
  1. Sub-100ms haptic + soft sound (a single low chime)
  2. The recommendation card briefly pulses
  3. A miniature card representation flies from center to top-right and disappears (representing the decision dropping into the quarterly timeline)
  4. Toast at top: "Decision logged. Sequenced in Q3 Sprint 1."
  5. Auto-navigate back to `/` after 800ms
- **`E` (override)**: the recommendation card transforms into an inline text input ("Why a different call?") + sequence selector. Type, hit `↵`, decision logged with both AI suggestion AND human override (audit log).
- **`D` (defer)**: defers the decision. Toast: "Deferred. Will resurface on context shift."
- **`S` (escalate)**: opens an inline mini-form ("Tag stakeholders: ___"). Tag, send. The system drafts an alignment summary the user can review before sending.
- **`←` or `Esc`**: back to Priority Stream, no change.
- **Click any evidence chip**: expand inline, show source. Click again to collapse.

### Edge cases

- **No clear AI recommendation** (low confidence): the recommendation card shows "Insufficient signal — needs your judgment" + raw evidence. Forces PM thinking instead of fake confidence.
- **Conflict detected**: the recommendation card has a red dot + line "Conflict: this would push [other initiative] by 2 weeks." `↵` to commit anyway, `↵+Shift` to commit AND auto-resequence.

### DfD compliance check

- ✅ Zero clutter — full-screen single decision, nothing competes
- ✅ Use fewer words — narrative is ~50 words; recommendation is ~30 words
- ✅ Smart defaults — AI has done all scoring; PM only confirms
- ✅ One page, one context — literally one decision per screen
- ✅ No multi-column scanning — chips are horizontal but only one row, not a matrix
- ✅ Instant feedback — keystroke commits with haptic+sound under 100ms
- ✅ Engage the senses — haptic + sound + micro-animation on commit
- ✅ Purpose-built design — this IS the iPod-wheel/Tinder-swipe moment

---

## Screen 3 — Quarterly Simulation

**Role in the flow:** the synthesis surface. Where the PM looks at the whole quarter, drags to resequence, and renders the plan for different audiences.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  ◐ Workspace                            ⌘K   pravesh   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Q3 2026 ▾                       Render: All ▾         │
│                                                         │
│   ── Sprint 1 — Jul 1 ─────────────────────────         │
│                                                         │
│   ●  Bulk CSV import for enterprise                     │
│      Sequenced from queue · 3 sprints                   │
│                                                         │
│   ●  SSO via SAML                                       │
│      Sequenced from queue · 2 sprints                   │
│                                                         │
│   ── Sprint 2 — Jul 15 ────────────────────────         │
│                                                         │
│   ●  Webhook delivery retries                           │
│      Sequenced from queue · 1 sprint                    │
│                                                         │
│   ──  ... continued below ...                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Elements

- **Quarter selector** (top-left): `Q3 2026 ▾` — dropdown to switch quarter
- **Audience render toggle** (top-right): `Render: All ▾` — dropdown with options:
  - **All** (default — full PM view)
  - **Exec** — collapses to top 3 strategic bets, $$ impact, theme summary
  - **Eng** — shows effort estimates, dependencies, sprint counts
  - **Sales** — customer-facing language, safe dating ("targeting Q3"), no internal terms
  - **CS** — fix-by dates for support-flagged items, list format
- **Timeline body**: vertical column, sprint-grouped sections, single-column layout
  - Sprint dividers: 12px tertiary uppercase label + horizontal rule
  - Each item: status dot + title + subline (effort + sequence rationale)
  - 720px wide, centered

### Interactions

- **Drag an item between sprints**: AI calculates ripple effects in real-time:
  - Drop position previews the new sequence
  - If a conflict (capacity overrun, dependency violation), a small red badge appears: `↘ Pushes 'Bulk import' to Sprint 3`
  - Drop to confirm; the AI auto-adjusts dependent items if they fit; toasts the change
- **Click an item**: opens the Initiative Detail for that item (same `/initiative/[id]` route)
- **Audience toggle change**: 300ms cross-fade transition between renders. Same data, different framing/level of detail.
- **Cmd+K**: command palette with quarter-relevant commands ("Render for Exec", "Show conflicts only", "Export draft")

### Audience-render specifics

When toggle is **Exec**:

```
Q3 2026 — Strategic Themes
Three bets, $1.4M total ARR exposure.

01. Enterprise readiness ($820k)
    Bulk import, SSO, webhook reliability.

02. Self-serve activation ($340k)
    New onboarding, in-app guides.

03. Compliance posture ($240k)
    SOC2 type II prep, audit logging.
```

Same underlying data, very different surface. Forces zero analytical work for the exec.

When toggle is **Sales**:

```
Q3 Roadmap (customer-facing)

Targeting Q3 — Enterprise readiness suite
  • Bulk CSV import
  • SAML SSO
  • Webhook retry logic

Targeting Q3 — Self-serve experience improvements
  ...
```

Safe dates ("targeting"), no effort estimates, no internal language.

### DfD compliance check

- ✅ Zero clutter — no gantt, no matrix, no kanban-board complexity
- ✅ Single column — vertical scan only, no left-right
- ✅ Smart defaults — AI sequences first; PM rearranges
- ✅ Reduce analytical choices — audience toggle does the format-thinking for the PM

---

## Architecture diagram (static page at `/architecture`)

**Role:** signals systems thinking. Bhavin's team will read this like a builder.

### Layout

A single SVG-based diagram, ~600px tall, centered, with annotations.

```
            ┌──────────────────────────────────┐
            │     6.  Decision Audit Log       │
            │     (closes the learning loop)   │
            └──────────────────────────────────┘
                          ▲
            ┌──────────────────────────────────┐
            │  5.  Roadmap Drafting + Render   │
            │  4.  Stakeholder Alignment       │
            │  3.  Dynamic Priority Engine     │
            │  2.  Opportunity Synthesis       │
            └──────────────────────────────────┘
                          ▲
            ┌──────────────────────────────────┐
            │     1.  Context Graph            │
            │   (organizational memory layer)  │
            └──────────────────────────────────┘
                          ▲
            Slack · Jira · CRM · Calls · Analytics
            (continuous ingestion)
```

Beside each layer, a 2-line annotation explaining what it does and what pain it attacks. Designed in the same color palette, line-art style. Hand-tuned SVG, not boxes-and-arrows from a chart library.

The page also has a 3-paragraph narrative below the diagram explaining the layered thesis: ingestion → synthesis → orchestration → learning. Same vocabulary as the POV doc.

---

## Cmd+K command palette (overlay, every screen)

### Layout

Triggered with `Cmd+K`. Centers as a 560px modal, dark overlay behind. Auto-focuses input.

```
┌─────────────────────────────────────────────╮
│  ⌘K  type a command or search...           │
├─────────────────────────────────────────────┤
│  ─ Decisions                                │
│  ↵  Decide on Bulk CSV import               │
│     Decide on SSO via SAML                  │
│  ─ Plan                                     │
│     Render plan for Exec                    │
│     Render plan for Sales                   │
│     Show conflicts                          │
│  ─ Audit                                    │
│     Open audit log                          │
╰─────────────────────────────────────────────╯
```

### Behavior

- Input filters commands as you type (fuzzy)
- ↑ / ↓ arrows to navigate, ↵ to execute
- `Esc` to close
- ~6 commands surfaced by default; full list on empty input

This satisfies "AI is ambient, not chat" — the command bar is a familiar mental model (Linear/Superhuman/Vercel) but is the closest thing to a "talk to the system" surface we offer.

---

## Mocked data shape

A single `data/initiatives.json` file with ~22 initiatives. Each:

```json
{
  "id": "init_bulk_csv",
  "title": "Bulk CSV import for enterprise",
  "synthesis_oneliner": "Blocking 3 deals worth $480k ARR. Sales escalated this week.",
  "rationale_narrative": "This unblocks 3 deals worth $480k ARR. Sales escalated it this week — second time this quarter. The pattern is clear: enterprise buyers expect bulk import on day one.",
  "evidence": [
    { "metric": "$480k", "label": "ARR exposure", "source": "Salesforce, 3 open opps" },
    { "metric": "3", "label": "open deals", "source": "Salesforce" },
    { "metric": "11", "label": "support tickets", "source": "Zendesk, last 30 days" },
    { "metric": "4", "label": "customer calls", "source": "Gong call logs" },
    { "metric": "2x", "label": "this quarter", "source": "Sales escalation log" }
  ],
  "ai_recommendation": {
    "sequence": "Q3 Sprint 1",
    "effort_sprints": 3,
    "eng_confidence": "medium",
    "addresses": ["3 of top 5 enterprise blockers"],
    "conflicts": []
  },
  "status": "needs_decision",
  "stakeholder_signals": ["sales", "cs"]
}
```

22 initiatives, mixed across statuses (needs_decision: 4, sequenced: 12, deferred: 4, escalated: 2). Realistic B2B SaaS feature names — no fantasy.

---

## What we're NOT building

Locked from the POV's "Out of Scope" — surfacing here so we don't drift:

- ❌ Ingestion config screens (Slack/Jira/CRM connectors) — assumed solved
- ❌ Settings, admin, team management
- ❌ Real auth, real backend, real persistence (state lives in client-side React state + JSON fixtures)
- ❌ Export to Notion/PDF/etc.
- ❌ Onboarding flow beyond a single welcome card on first load
- ❌ Standalone AI chat panel (anti-pattern)
- ❌ Analytics dashboards / metric views
- ❌ Mobile responsive (desktop-only for v1; can stub a "best on desktop" message at narrow widths)

---

## Build order

1. Scaffold (Next.js + Tailwind + tokens + folder structure) — 30 min
2. Mocked data — 30 min
3. Priority Stream — 1.5h
4. Initiative Detail (hero polish — most time here) — 3h
5. Quarterly Simulation + audience render — 2h
6. Architecture page — 45 min
7. Cmd+K command palette — 1h
8. Motion / haptics / sound polish — 1.5h
9. Copy pass + microcopy review — 1h
10. Deploy to Cloudflare Pages — 30 min

Total: ~12 hours focused build. Paralleliable — supporting writeup (NSM, events, interview questions) drafts during build sessions.
