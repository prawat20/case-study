# CS2 Build Log

> Running record of what was actually built, what changed from the wireframe spec, and current demo state.
> Started 2026-05-07. Most recent entry 2026-05-12 (v3.3 — POV-gap closure + responsive sweep).

---

## Current state (v3.3 — 2026-05-12)

**Status:** v3.3 shipped to production via wrangler. Two more passes on top of v3.1 — v3.2 added the **Drop Planner** (explicit per-item displacement control on overflow drops); v3.3 closed the clustering-visibility gap and made the whole app responsive across mobile / tablet / desktop.
**Live:** https://case-study-iud.pages.dev/
**Preview (latest deploy):** https://102261c4.case-study-iud.pages.dev
**Source:** github.com/prawat20/case-study (local-only; **not pushed to GitHub** for v3.x — CS1 Caselet 1 docs are in the working tree and would be exposed publicly otherwise)
**Source-of-truth docs:** `docs/cs2_jbtd_and_pov.md` · `docs/cs2_design_system_v2.md` · `docs/cs2_ia_and_surfaces.md` · `docs/research_pm_pain_points.md`

### What changed v3.1 → v3.3 (two passes)

**v3.2 — Drop Planner (2026-05-11 PM)**
Triggered by user feedback: *"when I drag and drop any item from one sprint to another - as PM I should see the conflicts, trade-offs, which other task I can move out and to which sprint - basically that's true prioritisation."*

- **Two-step drop pattern.** Drop on an over-capacity sprint no longer auto-commits with an AI strategy. Instead the item enters a *pending* state and a planner panel expands inline above the sprint's items.
- **Per-item destination picker.** Each item currently in the target sprint gets a row: `Keep | Sprint 1 (Xp free) | Sprint 3 (Yp free) | Sprint 4 (Zp free) | Defer Q4`. Headroom recomputes live as the user toggles (accounts for items being moved INTO each sprint).
- **AI suggestion as advisory hint.** AI's default plan (sourced from `minimise_rice_loss` strategy) is pre-selected on each row with a ✦ badge on the suggested destination — PM can override any row.
- **Live trade-off summary.** Updates per toggle: `Freeing 2p of 2p needed ✓ · RICE cost: −0.5 · All deadlines protected` (or `1 deadline at risk` if a deadline-flagged item is moved).
- **Commit / Cancel discipline.** Commit button is disabled until capacity matches; Cancel reverts the pending drop cleanly. Replaces the prior 3-strategy panel for overflow drops. Non-overflow drops still slot in directly via the existing commit path.
- **AI is now advisory, not deciding.** This is the strongest POV-4 alignment in the build — directly answers "Trade-offs in the moment" with PM control over both *who* moves and *where they go*, instead of bundling them behind a strategy label.

**v3.3 — POV-gap closure + responsive sweep (2026-05-12)**
Triggered by an audit pass against `research_pm_pain_points.md` and `cs2_jbtd_and_pov.md`. Audit verdict: build addressed 7 of 7 JBTDs and 10 of 11 validated pains; one narrative gap — Opportunity Synthesis Engine (semantic clustering) was described on `/architecture/` but not demonstrated on the front-door inbox surface.

- **Clustering visibility (closes POV-2 gap on the inbox).**
  - New `ClusterSource` type on `Initiative` (`source`, `channel`, `quote`, `captured_at`). Two mock initiatives populated with realistic source bundles: **Bulk CSV** = 4 sources (Sales/Acme + Sales/Northwind + Support/Zendesk + Customer/Gong); **SAML SSO** = 3 sources (Sales/Initech + Sales/Soylent + CS/Notion).
  - New `ClusterChip` component — tap to expand a card showing each source's channel + verbatim quote + timestamp, with a footer line *"The same request arrived in N channels — Opportunity Synthesis Engine clustered them into one initiative."* No hover dependency so it works on touch.
  - Wired into: Now's inline triage card (full chip), Now's queue rows (compact `⊕N` indicator), the swipe deck's `InitiativeFront` (full chip).
- **Responsive sweep — mobile / tablet / desktop.**
  - **Header:** desktop keeps absolute-centered nav. Below `md` (768px), nav moves to a 2nd horizontally-scrollable row below the wordmark + right cluster. Solves the wordmark + nav + actions overlap on narrow widths.
  - **All page containers:** `px-6` → `px-4 sm:px-6`; vertical padding stepped down (`pt-10` → `pt-6 sm:pt-10`). Recovers ~16px of content width on mobile.
  - **Calendar header:** stacks vertically on `<sm`; H1 drops from 28→24px; date label hidden on `<sm` to keep sprint headers tidy; sprint header rows now `flex-wrap` so capacity + bar fall to a 2nd line if needed.
  - **Touch limitation disclosure:** Calendar shows an explicit *"Drag-and-drop is desktop-only. Use the swipe deck for mobile triage."* hint on `<md`. HTML5 DnD doesn't work on touch natively; cleaner to surface the limitation than ship broken interactions.
  - **AuditLog PredictionCard:** already-responsive `sm:grid-cols-[1fr_auto_1fr]` confirmed — stacks Predicted/Actual at `<sm`.
  - **Stakeholders master/detail:** existing `md:grid-cols-[260px_1fr]` keeps the rail beside detail at desktop; collapses to single column on mobile/tablet — confirmed working.
  - **DropPlanner choice button row:** uses `flex flex-wrap gap-1.5` — already wraps cleanly on narrow.

### What changed v3 → v3.1

- **Shortcut chips now cross-platform.** `⌘N` / `⌘K` swap to `Ctrl+N` / `Ctrl+K` on Windows via `useIsMac()` runtime detect. SSR defaults to Mac glyph (most common) and hydrates to the actual platform; `suppressHydrationWarning` keeps the swap silent.
- **Triage cards inline on Now (skip the list step).** The top untriaged item renders as a full card on Now — title, signal/ARR/score chips, predicted outcome ("If we ship —" block), and a Defer / Route / Promote action row with single-key shortcuts. Remaining items appear as compact "Next up" rows below; a small `Bulk triage →` link preserves the swipe-deck path for bulk mode. Press `P` / `D` / `R` to act on the top card without clicking; it animates out and the next card promotes up.
- **Calendar drop-preview banner.** Every sprint the user hovers during drag now shows a "Drop here" hint between header and items: non-overflow with no reflow ("Fills to 7/8p · nothing else moves"), non-overflow with reflow ("Fills to 8/8p · 1 reflow"), overflow ("Over by 2p · pick a strategy below"). Bridges the gap between "I'm dragging" and the post-drop toast.
- **Trade-off panel moved above items.** When overflow triggers, the 3-strategy panel now renders before the sprint's existing items, not below them — the decision UI is seen first instead of buried under content.
- **Downstream sprints highlight during drag.** Sprints receiving reflow items under the default strategy get a dashed-accent border + an inline `→ "Item X" reflows here` hint. The reflow chain is visible at a glance.
- **Prediction Review reworked.** `Now → "Predictions due"` now links to `/audit/#predictions`; the audit page reads the hash on mount and lands directly on the right tab. `PredictionCard` gains a verdict strip at the top (colored dot + `MISSED` / `PENDING` / `PARTIAL` / `MET` chip + headline like "Adoption 28% vs 60% target"). Predicted / Actual now render side-by-side in a 3-column grid with an arrow between them — instead of two stacked rounded boxes that required the user to manually compute the delta.
- **Copy density sweep.** Calendar subtitle trimmed; trade-off panel helper line dropped (the cards self-explain); overflow callout dropped tutorial-y "Move one item out" tail; Audit subtitle removed (duplicates the stats banner); Audit stats banner collapsed from 2-line to 1-line; "What was wrong with the prediction?" → "What to recalibrate"; triage bottom hint shortened. Net ~40% fewer words across the surfaces, no functional copy removed.

### What changed v2 → v3

- **5 top-nav items → 4.** Inbox folded into Now. `/inbox/` kept as a transparent redirect to `/` so any deep-link still resolves.
- **2 clicks to first triage card → 1.** Now home shows real inbox rows inline (synthesized arrival metadata + signal chips) under the NSM hero, with `Start triage →` + visible keyboard hints (P / D / R). `⌘N Capture` button visible top-right.
- **Calendar drag-to-full-sprint silent auto-reflow → explicit 3-strategy trade-off.** A panel slides in inline whenever a drop would overflow, with three named AI strategies as drop targets: **A · Minimise score loss** (default — push lowest-RICE items downstream) · **B · Minimise deadline risk** (protect deadline/compliance items, push everything else first) · **C · Defer to next quarter** (don't reflow within Q3, push displaced items to Q4 instead). Each card shows the rationale, the pushes that would happen, and a `score impact` value.
- **Live capacity preview during drag.** Each sprint shows `current → predicted` load (e.g. `12 → 20/12p`) the moment the drag enters. Border + capacity bar shift to amber on sprints that would overflow.
- **Reflow is animated, not snap.** Items in sprints use Framer Motion `layoutId` shared transitions, so when the reflow commits, displaced items *slide* to their new sprint over ~420ms. The optimisation is visible, not narrated.
- **Stakeholders hub → master/detail.** Persistent 260px left rail with 4 audience selectors (icons + label + blurb; format hint expands on active). Right pane is the artifact, keyed on audience so the materialize stagger re-fires on every switch. URL syncs via `?audience=sales|exec|customer|eng`. Default = sales. Switching audiences = 1 click, no route change. Legacy `/stakeholders/[audience]/` deep-links redirect to the unified URL with the audience pre-selected.
- **Triage done-state cleaned up.** "Back to Inbox" link removed (Inbox no longer exists as a destination); single sage CTA ("Place N in calendar →" if anything was promoted, else "Back to Now").

### Engine changes

- `lib/sprint-conflict.ts` extended with `StrategyKind = "minimise_rice_loss" | "minimise_deadline_risk" | "defer"`. New `computeStrategyOptions()` returns all three options. `computeCommitImpact()` now takes `strategy` + `targetSprint` args. The `defer` strategy pushes displaced items as deferred decisions (visible in Stakeholders + Audit). `score_impact = priority_weight × sprint_shift` summed per pushed item; deferred items count as a 5-sprint shift.
- `components/StakeholderArtifact.tsx` gained an `embedded` prop — when true, renders the artifact body (copy buttons + eyebrow + article + footnote) without Header/outer wrapper/back-link, for use inside the master/detail surface. The standalone variant still works at `/stakeholders/[audience]/` and isn't broken.
- `components/CalendarPlan.tsx` gained `SprintItemCard` wrapped in `motion.div layoutId={initiative.id}` for cross-sprint slide animation. Inner `<div>` carries HTML5 drag handlers (Framer Motion `motion.div` redefines `onDragStart` for its pointer-gesture system, which conflicts with the DnD signature we use; the split avoids the type conflict).
- `app/inbox/page.tsx` is now a single-purpose redirect-to-`/` stub (8 lines).
- `app/stakeholders/[audience]/page.tsx` keeps `generateStaticParams()` for build-time prerendering but delegates rendering to a small client redirector (`redirect-client.tsx`) that bounces to the unified URL.

### v2 reference (preserved below for historical context)

The v2 entry below documents the redesign that preceded v3. The current shipped state is v3; the surfaces table in the v2 section is now historical (e.g. the `/inbox/` row is no longer a destination surface, it's a redirect).

---

## Historical: v2 redesign state (2026-05-09)

**Status:** v2 redesign shipped. Step-change rebuild from JBTDs first. Six surfaces in the v2 IA, all wired end-to-end.
**Source-of-truth docs:** `docs/cs2_jbtd_and_pov.md` · `docs/cs2_design_system_v2.md` · `docs/cs2_ia_and_surfaces.md`

### Routes shipped (v2)

| Route | Purpose | Notes |
|---|---|---|
| `/` | **Now** (home) | NSM hero (Fraunces 48px), pace gap + same-day decision %, three "do today" cards (Triage / Sprint peek / Predictions due). Sprint card swaps to "N items waiting to place" when calendar rail has items. |
| `/inbox/` | **Inbox** list | Sectioned: Just landed (under 90 min) · Earlier · Ready to prioritize. Big "Start triage" sage CTA + `+ New (⌘N)`. |
| `/inbox/triage/` | **Triage** flow | Tinder-style swipe card. Right = Promote, left = Defer, R/up = Route. Velocity-aware threshold. PROMOTE/DEFER stamp tints during drag. Card front carries time/source/channel · title · synthesis · evidence quote · signal chip + ARR + RICE + effort + "If we ship —" predicted-outcome callout. **"Why this" expand inline** (Space) reveals score breakdown, AI reasoning, conflicts, trade-offs. 44px circular action buttons sit close below card. Stack hint peeks underneath active card. |
| `/calendar/` | **Calendar** puzzle | TO PLACE rail (sage dashed) at top + 4 sprint lanes + DEFER tray (warm dashed) at bottom. **Drag = decide**: rail → sprint commits + may auto-reflow lower-priority items; rail → defer pushes to next quarter. Capacity bars amber on overflow. Snap as Q3 plan only enables when rail empty + no overflow. |
| `/initiative/[id]/` | **Prioritize** (deep view) | Compact single Decision card consolidating Score · Capacity · Reflow · Conflicts · Recommendation · Predicted outcome. Framework picker (5 chips) above. **"Why this" expand** for rationale narrative + AI reasoning + score math + strategic context + full conflict list. Now the alt path; Calendar puzzle is primary. |
| `/stakeholders/` + `/stakeholders/[audience]/` | **Stakeholders** | Hub with 4 cards (Sales / Exec / Customer / Eng). Each artifact is *generated* per-audience (not filtered): lines fade in 50ms staggered. Copy-as-Slack and copy-as-email. |
| `/audit/` | **Audit** | Tabs: Decisions / Predictions. Predictions panel: prediction-vs-actual loop with mock 21d-old SAML prediction always seeded. System-learning summary banner with per-claim-type accuracy. |
| `/architecture/` | Architecture | Reviewer-facing only. Six-layer stack diagram, restyled v2. |
| `/quarter/` | (alias for `/calendar`) | Kept for backward compat. |
| `Cmd+K` overlay | Command palette | Restyled v2. Groups: Inbox / Navigate / Stakeholder views / Decisions / Theme / System. Reset demo nukes 5 stores: decisions, framework overrides, triage, captures, calendar. |
| `Cmd+N` overlay | Capture modal | Single textarea autofocus, source/channel/signal chips infer as you type, Enter saves with capture pluck chime. |

### v2 visual language

- **Light theme default**, dark optional via `data-theme` toggle in header.
- **Warm cream + sage** — page `#F8F5EE`, surface `#FFFFFF`, accent `#5A8F6F` (rare, marks active/CTA/confirmed).
- **Ink ladder is warm graphite**, never pure black: `#1A1815` / `#58524A` / `#8C857A` / `#B8B0A2`.
- **Three fonts** — Inter (UI), Fraunces (serif hero moments), JetBrains Mono (numerics).
- **Status warm-tinted**, never neon: success `#4A8159`, warning `#B5772A`, danger `#B04A47`.
- **Motion** — 100/180/320/720ms; ease-out entry, ease-in exit, spring overshoot only for celebration.
- **Sound** — 5 Web Audio chimes, ~30% softer than v1: capture pluck, triage tones (G4/B4/D5 by action), commit two-tone, defer tick, snap three-note resolving chord.

### State stores (localStorage)

| Key | Module | Purpose |
|---|---|---|
| `qp_decisions_v1` | `lib/decisions.ts` | Committed / Deferred / Escalated / Overridden |
| `qp_framework_overrides_v1` | `lib/decisions.ts` | Per-initiative framework switches |
| `qp_triage_v2` | `lib/triage.ts` | Triage actions (Promote/Route/Defer) |
| `qp_captures_v2` | `lib/captures.ts` | Items captured via ⌘N |
| `qp_calendar_assignments_v2` | `lib/calendar-state.ts` | Per-initiative sprint index overrides |
| `qp_calendar_locked_v2` | `lib/calendar-state.ts` | Whether the plan is snapped/locked |
| `qp_theme_v2` | `components/ThemeToggle.tsx` | light / dark preference |

`lib/calendar-state.useCalendarState` emits a custom event so Calendar / Prioritize / Stakeholders all refresh together. `lib/sprint-conflict.computeCommitImpact` is the centralized auto-reflow engine — reused by Prioritize commit and Calendar drag.

---

## Round 8 — v2 redesign (2026-05-09)

User direction on 2026-05-09: *"current UI/UX is not at all up to the mark, needs a step jump, like a wow."* Re-architected from JBTDs first, design system second, surfaces third.

**Sub-rounds:**

1. **Foundation** (`26a747a`) — design tokens + Fraunces serif + light/dark theme toggle. Wholesale palette swap from cold dark to warm cream + sage. Existing surfaces inherit the new look.
2. **Now (home)** (`d961018`) — replace Priority Stream front-door with NSM-hero aggregator + three "do today" cards. Existing initiative list moves to `/inbox` as a bridge.
3. **Inbox + Triage + Cmd+N** (`9d7d11d`) — proper sectioned Inbox, deck-of-cards triage flow (D/R/P keyboard), `⌘N` capture modal with auto-detect chips, Cmd+K palette restyled to v2 with new groups.
4. **Prioritize v2** (`aefaacb`) — framework picker as a 5-chip first-class control, scorecard table, commit-confirm step (replaces direct fire), override-as-path preserved.
5. **Calendar + Stakeholders + Audit + Architecture** (`c2a749c`) — full surface set in v2 visual language. Sprint lanes with HTML5 drag-to-resequence. Stakeholders hub + per-audience artifact generation. Audit Predictions tab. Architecture restyled.
6. **Real sprint impact on commit** (`4a970e1`) — `lib/sprint-conflict.computeCommitImpact` replaces static AI-authored trade-off text with computed sprint reflow. Commits write the resolved assignment map atomically.
7. **Compact Prioritize + triage intent labels** (`b6291b9`) — collapse 5 sections (Score / Recommendation / Trade-offs / Conflicts / Sprint impact) into one Decision card. "Why this" expand for depth. Triage buttons get one-line intent labels (*"not this quarter"* etc).
8. **Calendar = puzzle** (`9d2b9de`) — TO PLACE rail at top + DEFER tray at bottom. Drag from rail → sprint = commit. Drag → defer = push to next quarter. Auto-reflow on overflow. Snap as plan gated on rail-empty + no-overflow.
9. **Triage = Tinder swipe** (`a6e8e04`) — replace D/R/P button-driven deck with swipe interactions. Right/left thresholds, velocity-aware, tilt + tint during drag, PROMOTE/DEFER stamp overlays. "Why this" expand inline.
10. **Action buttons close to card** (`2a99957`) — drop minHeight floor on card stage so buttons sit ~16px under the card; tighten hint text.

**What's no longer in the build (deleted):** SprintView, QuarterPlan, StrategicBanner, SignalShifts components — replaced by Now / Calendar / Stakeholders.

---

## Round 9 — v3 flow optimization (2026-05-11)

User direction on 2026-05-11: *"I'm more interested in optimising the flow… do we really need separate Now and Inbox? When we drag and drop to a full sprint it pushes randomly — this entire experience needs to be more like puzzle solving for constraints and optimising. AI can do recommendations as well. Stakeholders tab can be more intuitive."*

This was a flow-architecture pass, not visual polish. Three moves shipped in one session, deployed in a single wrangler push (`https://c5b087c5.case-study-iud.pages.dev`, aliased to production).

### Move #1 — Surface consolidation: Now + Inbox merged

- `app/page.tsx` rewritten. Now home is the inbox. Sections shown inline below the NSM hero: **To triage** (top 4 untriaged rows with timestamp/source/channel/signal chip + `Start triage →` CTA + visible P/D/R kbd hints), **Ready to place** (promoted-but-unplaced items linking to Calendar), **Predictions due** (1-row link to Audit). Each section is hide-empty.
- Top nav reduced from 5 → 4 (`Now · Calendar · Stakeholders · Audit`). Active-page match for `/` now also includes `/inbox` and `/initiative` so the underline behaves correctly during the legacy redirect.
- `+ Capture ⌘N` button visible top-right of Now home, anchored next to the date eyebrow — discoverability was the v3-prior blocker.
- `app/inbox/page.tsx` collapsed to an 8-line client redirect to `/`. Preserves any external deep-links without orphan-linking from the live nav.
- Triage done-state: "Back to Inbox" secondary CTA removed (Inbox no longer exists as a destination); single sage CTA based on outcome.

### Move #2 — Calendar puzzle: live capacity preview + 3-strategy trade-off panel

The marquee move. The brief's rubric (creativity / depth / analytical reasoning / impact) now resolves on a single interaction: drag a rail item onto an over-capacity sprint.

**Engine extension (`lib/sprint-conflict.ts`):**
- `StrategyKind = "minimise_rice_loss" | "minimise_deadline_risk" | "defer"` type added.
- `computeCommitImpact()` signature gained `strategy` + `targetSprint` args; the candidate-ranking function `pushPriorityScore()` switches behaviour per strategy. Deadline-risk strategy treats `signal_type === "deadline" || "compliance"` as priority-protected (push last). Defer strategy pushes displaced items out of Q3 entirely and records them as deferred decisions (visible in downstream surfaces).
- New top-level `computeStrategyOptions()` returns `StrategyOption[]` with the rationale + impact + a `score_impact` rank (`priority_weight × sprint_shift`; deferred items weighted as a 5-sprint shift). This is what powers the 3-card trade-off panel.

**UI (`components/CalendarPlan.tsx`):**
- During drag (anywhere), each sprint shows a live `current → predicted` load chip in the corner (e.g. `12 → 20/12p`). Border + capacity bar shift to amber on sprints that would overflow under the default (option A) resolution. The AI-recommended sprint still gets the existing `AI suggests` chip.
- On hover over an over-capacity sprint, an inline `TradeOffPanel` slides in (`AnimatePresence` + height/opacity transition) below the sprint's items. Three cards labelled ⓐ ⓑ ⓒ, each with: strategy label · rationale · the pushes that would happen (in-quarter pushes show `↓ → S{n}`, deferred pushes show ⏱ `→ Q4`) · `score impact` (sage if best, amber if worst, secondary otherwise).
- Each card is its own drop target (`onDrop` + `e.stopPropagation()`). Dropping on a card commits with that strategy. Dropping on the sprint background = strategy A (default).
- `dragLeave` was made `relatedTarget`-aware so the panel doesn't disappear when the cursor crosses from sprint padding into the panel (a child of sprint).
- `SprintItemCard` outer wrapper is now `motion.div layoutId={initiative.id}` with `layout="position"`. When the reflow commits and an item remounts in a different sprint, Framer Motion animates its position over ~420ms. Inner `<div>` carries the HTML5 drag handlers — splitting was required because `motion.div` redefines `onDragStart` to a PointerEvent signature, conflicting with the DnD typing.

### Move #3 — Stakeholders master/detail

- `app/stakeholders/page.tsx` rewritten as master/detail (`grid-cols-[260px_1fr]` on md+). Left rail: 4 audience cards (Sales / Exec / Customer / Eng). Active card lifts elevation + sage border + accent dot + extra format-hint line. Right pane: the artifact body.
- URL syncs via `useSearchParams` + `router.replace({ scroll: false })` on selection. Default = sales. Suspense boundary required for static export (`useSearchParams` is dynamic). Skeleton renders during boundary fallback.
- `<StakeholderArtifact key={audience} embedded />` — the `key` forces remount on every audience switch so the materialize stagger re-fires, not just on first load. `embedded` is a new prop on `StakeholderArtifact` that skips Header + outer wrapper + back-link, returning just the right-pane content.
- Legacy `/stakeholders/[audience]/` deep-links kept static-exportable (`generateStaticParams`) but delegated to a small `redirect-client.tsx` that bounces to `/stakeholders/?audience=<key>`. The standalone `<StakeholderArtifact audience={...} />` (non-embedded) still works at that route as a fallback, though no live link in the app drives to it.

### Deploy

Per the user's "wrangler-only" call (CS1 Caselet 1 docs are in the same working tree and would otherwise become publicly readable on `github.com/prawat20/case-study`), this build was shipped to Cloudflare Pages without a `git push`. Local working tree still carries v3 changes uncommitted.

- Build: 23 static pages, `✓ Compiled successfully in ~6s`, `✓ Generating static pages using 7 workers (23/23)`.
- Deploy: `wrangler pages deploy out --project-name=case-study --branch=main --commit-dirty=true`.
- Smoke test post-deploy: `/`, `/calendar/`, `/stakeholders/`, `/stakeholders/sales/` (redirect), `/stakeholders/?audience=exec` — all 200.

### Click-count delta (full demo flow)

| Step | v2 clicks | v3 clicks |
|---|---|---|
| Land → first inbox row visible | 2 (Now → Inbox) | 0 (on Now) |
| Inbox visible → first triage card swiped | 2 (Start triage → swipe) | 1 (Start triage → swipe) |
| Triage done → calendar | 1 (Place N in calendar) | 1 (unchanged) |
| Calendar → first resolved over-capacity drop with visible trade-off | 0 (silent reflow, no trade-off shown) | 1 (drop with visible 3-option preview) |
| Stakeholders → switch audience | 2 (back → click new audience) | 1 (click rail) |

### Files touched

- `app/page.tsx` (full rewrite)
- `app/inbox/page.tsx` (collapsed to 8-line redirect stub)
- `app/inbox/triage/page.tsx` (done-state CTA cleanup)
- `app/stakeholders/page.tsx` (full rewrite to master/detail)
- `app/stakeholders/[audience]/page.tsx` (now delegates to redirect-client)
- `app/stakeholders/[audience]/redirect-client.tsx` (new)
- `components/Header.tsx` (NAV item reduced from 5 → 4; `/` match expanded)
- `components/CalendarPlan.tsx` (live capacity preview, trade-off panel, layoutId animations, dragLeave safety)
- `components/StakeholderArtifact.tsx` (added `embedded` prop)
- `lib/sprint-conflict.ts` (strategy-aware engine + `computeStrategyOptions()`)

---

## Round 10 — v3.1 polish pass (2026-05-11)

User direction same session as v3 ship: *"shortcuts are all considering mac, make it for windows compatible as well… should we not directly show triage cards in the now directly — why showing the list? prediction review is not clear. calendar view where we move tasks still not showing the user what are the conflict and trade-offs — there's some issue. overall UX should have minimal copy."*

Five surgical moves on top of v3. No architectural rework — interaction polish + clarity wins. Single wrangler deploy, no GitHub push.

### Move #1 — Cross-platform shortcut chips

- New `lib/platform.ts` exporting `useIsMac()` (a small SSR-safe hook; defaults to `true` on the server, swaps on client mount based on `navigator.userAgent`).
- New `components/ShortcutKbd.tsx` — platform-aware `<kbd>` that renders `⌘N` on Mac and `Ctrl+N` on Windows. Drop-in replacement for the prior hardcoded `<Kbd>⌘N</Kbd>` pattern.
- All five hardcoded mod-key labels swapped: `app/page.tsx` (empty state + `+ Capture` button), `components/Header.tsx` (palette opener), `components/CommandPalette.tsx` (capture command), `app/inbox/triage/page.tsx` (empty-state body — required converting `body` from `string` to `React.ReactNode` on the `EmptyState` component).
- Single-key chips (`P` / `D` / `R` / `Esc` / `Space`) intentionally left untouched — they're the same on both platforms.
- The underlying keyboard listeners already handled `metaKey || ctrlKey` — this was purely a label-display fix.

### Move #2 — Inline triage card on Now (hybrid C)

The user's "why showing the list?" question pointed at the home surface. v3 had Now showing 4 list rows + `Start triage →` CTA leading to `/inbox/triage/`. v3.1 collapses the redundancy:

- `app/page.tsx` "To triage" section rewritten. **Top item** renders as a full card: meta (time · source · channel) → title (17px) → chip row (signal + ARR + score) → predicted outcome ("If we ship —" block on accent-soft background) → action row at the bottom (Defer / Route / Promote pills with `←` / `↗` / `→` icons and `D` / `R` / `P` kbd chips).
- **Queue below** — remaining 3 items render as compact `QueueRow` rows under a small "Next up" eyebrow, each: dot · title · signal chip · time · source.
- New `InlineTriageCard` component lifts `setTriageAction(id, action)` + `playTriageTone(action)` (same engine the `/inbox/triage/` swipe deck uses). Keyboard handler on Now binds `P` / `D` / `R` / arrow keys to the top card, ignored when typing in an input or when a mod key is held. `AnimatePresence` with `mode="wait"` + `key={top.data.id}` so the decided card fades out before the next promotes in.
- "Why this →" link on the card footer routes to `/initiative/[id]/` for initiatives or `/inbox/triage/` for captures (no individual route for captures yet).
- `Bulk triage →` text link below the queue preserves the swipe-deck path for users who prefer rapid bulk mode. Demoted from primary CTA (v3) to secondary link (v3.1).
- The `Ready to place` + `Predictions due` sections beneath are unchanged.

### Move #3 — Calendar drop-preview + reflow chain visibility

The user's complaint that conflicts/trade-offs weren't showing pointed at three sub-issues: (a) non-overflow drops gave no preview at all — just a post-drop toast; (b) the trade-off panel was positioned BELOW the sprint's items, easy to miss on sprints with several cards; (c) downstream reflow targets weren't highlighted, so the chain was invisible until after commit.

- **New `DropPreview` sub-component** at the top of every hovered sprint during drag. Renders an inline pill between sprint header and items. Three states:
  - Non-overflow, no reflow: `Fills to 7/8p · nothing else moves` (accent tone)
  - Non-overflow with reflow: `Fills to 8/8p · 1 reflow` (accent tone)
  - Overflow: `Over by 2p · pick a strategy below` (warning tone, points to the panel below)
- **`TradeOffPanel` reordered** to render *before* the sprint's existing items. Previously slid in below items via `AnimatePresence` after the `flex flex-wrap` items list; now it renders directly under the `DropPreview` so the decision UI is the first thing the user sees after the header.
- **`reflowTargetSprints` Set** computed at the parent level from `defaultOption.impact.pushed_items` (filtering deferred items). During drag, any sprint in the set that's NOT the hovered sprint gets `border: 1px dashed var(--color-accent)` and an inline `→ "Item X" reflows here` hint above the items.
- Trade-off panel header copy tightened: "This drop overflows. Pick how to resolve:" + helper line → "Over capacity — release on a strategy" (single line; the 3 cards self-explain as drop targets so the "release on a card below" helper was redundant).
- Overflow callout outside drag: "Xp over capacity. Move one item out." → "Xp over capacity" (drops the tutorial-y instruction; the AlertTriangle icon already telegraphs action needed).

### Move #4 — Prediction Review verdict + auto-tab

The Prediction Review surface (Now → "Predictions due" link) had three friction points: (a) it landed on `/audit/` defaulting to the Decisions tab, requiring a manual click to Predictions; (b) each card stacked Predicted/Actual as two prose blocks with no visual verdict, forcing the user to read and manually compute the delta; (c) the only action was a free-text "What was wrong with the prediction?" textarea — high cognitive load before the user has any verdict signal.

- **Hash-based tab routing.** `app/page.tsx` Predictions Due link updated to `/audit/#predictions`. `components/AuditLog.tsx` gains a `useEffect` that reads `window.location.hash` on mount and calls `setTab("predictions")`. Also listens for `hashchange` so deep-pasted links work.
- **Verdict strip** added to the top of `PredictionCard`. Renders inside its own border-bottom strip (above the existing card body), filling with the verdict-soft background and showing: colored dot + `MISSED` / `PENDING` / `PARTIAL` / `MET` chip + headline ("Adoption 28% vs 60% target" for the SAML mock, "Review window opens at 21 days" for not-yet-due entries).
- `verdictFor(entry)` + `VERDICT_STYLE` map encapsulate the typed verdict computation. For now the SAML mock returns `missed` with the 28-vs-60 headline; <21-day entries return `pending`. Easy to extend with real outcome data — the structure is in place.
- **Predicted / Actual side-by-side** instead of stacked. 3-column CSS grid `1fr → auto → 1fr` with an `ArrowRight` icon in the middle (hidden on mobile). Verdict-colored border around the Actual box when the review window has elapsed. The visual comparison is now immediate instead of requiring the user to read two prose blocks and form an opinion.
- Recalibration textarea label: "What was wrong with the prediction?" → "What to recalibrate"; placeholder tightened from "The system reads this to recalibrate weighting. e.g. 'Adoption stalls without exec sponsor — weight that more.'" to "e.g. 'Weight exec-sponsor signal higher on adoption claims'".

### Move #5 — Copy density sweep

Targeted reductions on verbose / redundant / tutorial-y lines. No functional copy removed.

| Surface | Before | After |
|---|---|---|
| Calendar header (rail empty) | "Drag any item between sprints, or push to next quarter." | "Drag between sprints or push to next quarter." |
| Calendar header (rail full) | "Drag each item into the sprint where it fits. Capacity reflows automatically." | "Drag items into a sprint. Capacity reflows." |
| Trade-off panel | "This drop overflows. Pick how to resolve:" + helper line "Release on a card below to commit with that strategy. Release on the sprint = AI default." (2 lines) | "Over capacity — release on a strategy" (1 line) |
| Sprint overflow callout | "Xp over capacity. Move one item out." | "Xp over capacity" |
| Audit subtitle | "Every commit, defer, escalate, and override — kept with reasoning and a prediction the system can grade later." | (removed entirely — title `Decisions in memory` + stats banner already say it) |
| Audit stats banner | 2-line block with logged/override/triaged + "Prediction accuracy so far — revenue claims: X% · adoption claims: Y%. The system weights revenue claims higher." | Single line: "N logged · M override · K triaged · Accuracy: revenue X% · adoption Y%" |
| Prediction recalibration prompt | "What was wrong with the prediction?" + long placeholder | "What to recalibrate" + tighter placeholder |
| Triage bottom hint | "Swipe · click button · or use keyboard" | "Swipe, click, or use keys" |

### Deploy

Per the same wrangler-only convention (CS1 Caselet 1 docs still in working tree):

- Build: 23 static pages, `✓ Compiled successfully`, `✓ Generating static pages using 7 workers (23/23) in 729ms`.
- Deploy: `wrangler pages deploy out --project-name=case-study --branch=main --commit-dirty=true`.
- Preview URL: `https://aa3e8d8e.case-study-iud.pages.dev/`; production alias updated.
- Smoke test post-deploy: `/` returns 200 and grep confirms `Promote / Defer / Route / Bulk triage / Next up / If we ship` strings live on prod.

### Files touched

- `lib/platform.ts` **(new)** — `useIsMac()` hook + glyph map
- `components/ShortcutKbd.tsx` **(new)** — platform-aware `<kbd>` chip
- `app/page.tsx` — InlineTriageCard + QueueRow + keyboard handler; Predictions Due link `→ #predictions`; ShortcutKbd swap-in
- `app/inbox/triage/page.tsx` — `useIsMac` for empty-state kbd chip; `EmptyState.body` type widened to `ReactNode`; bottom hint copy trim
- `components/Header.tsx` — `useIsMac` import + conditional `⌘K`/`Ctrl+K`
- `components/CommandPalette.tsx` — `useIsMac` import + conditional `⌘N`/`Ctrl+N`
- `components/CalendarPlan.tsx` — `DropPreview` component; `reflowTargetSprints` Set + dashed-accent border on incoming-reflow sprints; trade-off panel moved above items; trade-off + overflow callout copy trimmed
- `components/AuditLog.tsx` — hash-based tab routing via `useEffect` + `hashchange`; `verdictFor()` + `VERDICT_STYLE` map; PredictionCard rebuilt with verdict strip + side-by-side Predicted/Actual; subtitle + stats banner copy trimmed

### Click-count delta (full demo flow, v3 → v3.1)

| Step | v3 clicks | v3.1 clicks |
|---|---|---|
| Land → first triage action committed | 2 (`Start triage` → action) | 1 (`P`/`D`/`R` on Now's top card) |
| Predictions due → see verdict | 2 (link → `Predictions` tab click) | 1 (link auto-lands on tab + verdict at top) |
| Calendar drop → see what reflows | 1 (drop, then read toast) | 0 (preview banner during hover, chain visible during drag) |

### Outstanding (carried over from v3)

The original v3-era polish list (Initiative Detail spacing, Sprint capacity-unit labeling, button hover/focus refinement, decision-lands animation timing 700→600, SignalShifts banner dismissibility, Quarter drag-handle affordance, etc.) remains untouched. This pass focused on the user's five specific calls instead. Pick up the original list if reviewer feedback flags any of those items.

The CS2 supporting writeup (North Star + 5 events to instrument + PM interview question bank) is still pending.

---

## Round 11 — v3.2 Drop Planner + v3.3 POV-gap + responsive (2026-05-11 → 2026-05-12)

Two passes captured here. v3.2 shipped same-day as v3.1 after explicit user pushback on the calendar trade-off UX. v3.3 shipped the next day after an audit pass against `research_pm_pain_points.md` and `cs2_jbtd_and_pov.md`.

### v3.2 — Drop Planner (2026-05-11 PM)

User direction: *"still the issue is when I drag and drop any item from one sprint to another - as PM I should see the conflicts, trade-offs, which other task I can move out and to which sprint - basically that's true prioritisation"*

The 3-strategy panel from v3 was strong on AI-as-actor (pick a strategy, AI picks items + destinations), weak on AI-as-advisor (PM picks items + destinations, AI advises). v3.2 reverses that polarity.

**Design calls (locked with user before build):**
- Trigger: **overflow drops only** (non-overflow drops still slot in directly — keeps quick moves fast)
- Pattern: **two-step** (drop → plan → commit) — breaks one-step drag-drop but lets the planner be fully interactive (you can click rows; you can't click during HTML5 drag)

**New component: `components/DropPlanner.tsx`**
- Header with three pieces of info: target sprint label, capacity preview (`6 + 4 → 10/8p · 2p short`), incoming item summary
- Per-item rows for each current item in the target sprint, each with: title, effort, signal chip, `Deadline` marker if applicable, plus a row of choice pills: `Keep | Sprint N (Xp free) | Sprint N (Yp free) | Defer Q4`
- `ChoiceButton` component renders the AI-suggested destination with a ✦ badge in the top-right corner (visible when not the active pick)
- Live capacity headroom recomputes via `computeHeadroom()` helper — accounts for items the user has *also* selected to move into a given sprint (so the headroom for Sprint 3 shrinks if you've already redirected two items there in the same plan)
- Trade-off summary footer: `Freeing 2p of 2p needed ✓ · RICE cost: −0.5 · All deadlines protected`. RICE cost computed as `priority_weight × shift` summed across moved items; deferred items count as a 5-sprint shift.
- Commit button is disabled until `freed >= needed`; Cancel button reverts the pending drop cleanly

**Wiring in CalendarPlan.tsx:**
- New state: `pendingDrop: PendingDrop | null` + `pendingFromSource: DragSource | null`
- `dropOnSprint()` early-returns into the planner when `(sprintLoad(target) + effortPoints(item)) > SPRINT_CAPACITY` instead of committing immediately. Seeds the choices from AI's default strategy (`minimise_rice_loss` from `computeStrategyOptions`).
- `commitPlan()` applies the plan: incoming → target via `newAssignments[incoming.id] = targetSprint`; for each `move` choice updates assignments; for each `defer` choice logs a deferred decision + removes the assignment.
- `cancelPlan()` resets the pending state.
- `updatePlanChoice(itemId, choice)` is passed to the planner as `onChange` for live updates.
- The previous `TradeOffPanel`, `DropPreview`, and incoming-reflow hint all suppress when `pendingDrop` is set (the planner replaces them as the focused interaction).

**The 3-strategy `TradeOffPanel` component still exists in the file but is no longer rendered** — kept for backward compat / quick rollback. `computeStrategyOptions()` is still called to seed the planner's default plan.

### v3.3 — POV-gap closure + responsive sweep (2026-05-12)

Audit pass first. Read `research_pm_pain_points.md` + `cs2_jbtd_and_pov.md` + `cs2_product_pov.md` and mapped current build against every JBTD + every "what none of them do well yet" point + every research-validated pain.

**Audit verdict (recorded in conversation):** Build addresses **7 of 7 JBTDs** and **10 of 11 validated pains**. The one gap worth closing before submission: **POV-2 / Pain Stage 2 — semantic clustering of intake.** Described on `/architecture/` page (Opportunity Synthesis Engine card) but not demonstrated on any front-door surface where a reviewer would actually look for it.

**Move 1 — Clustering visibility**

- Extended `lib/types.ts` with `ClusterSource` interface (`source`, `channel`, `quote`, `captured_at?`). Added optional `cluster_sources?: ClusterSource[]` field to `Initiative`.
- Populated 2 mock initiatives:
  - `init_bulk_csv` — 4 cluster sources: Sales/Acme (Slack DM), Sales/Northwind (Salesforce note), Support/Cohort-12 (Zendesk #48211), Customer/Globex (Gong call). Verbatim quotes capture the same underlying ask in different vocabulary across channels.
  - `init_saml_sso` — 3 cluster sources: Sales/Initech, Sales/Soylent, CS/quarterly-renewal-review. Same SAML/SSO request from 3 perspectives.
- New `components/ClusterChip.tsx`:
  - Two sizes: `sm` (dense, inline on cards) and `md` (roomier, initiative detail)
  - Tap-to-expand pattern (no hover dependency — works on touch)
  - Expanded card shows each source's title + channel + verbatim quote + timestamp, with a footer line: *"The same request arrived in N channels — Opportunity Synthesis Engine clustered them into one initiative."*
  - Z-index 30 dropdown anchored to chip with `w-[min(360px,calc(100vw-32px))]` so it fits on mobile without overflowing the viewport
- Wired in three places:
  - `app/page.tsx::InlineTriageCard` chip row — full ClusterChip
  - `app/page.tsx::QueueRow` — compact `⊕N` indicator (hidden on very-small breakpoint)
  - `app/inbox/triage/page.tsx::InitiativeFront` — full ClusterChip in the metadata row

**Move 2 — Responsive sweep**

| Surface | Mobile (≤480) | Tablet (~768) | Desktop (≥1024) |
|---|---|---|---|
| Header | wordmark + right cluster on row 1, scrollable nav on row 2 | same | centered absolute nav |
| Now | card + queue stack, queue source/date hidden | full | full |
| Calendar | wraps headers, drag warning, stacks load+bar | full | full |
| Stakeholders | rail above detail | rail above detail | rail beside detail |
| Audit | prediction cards stack predicted/actual | side-by-side | side-by-side |
| DropPlanner | choice button row wraps naturally | full | full |

- **Header** (`components/Header.tsx`): broke out of the absolute-centered nav at `<md`; nav becomes a 2nd row below the wordmark + right cluster with `overflow-x-auto` so all 4 items remain reachable even on 320px. Wordmark + right cluster get `shrink-0`.
- **Page containers**: 7 files touched (`app/page.tsx`, `components/CalendarPlan.tsx`, `components/AuditLog.tsx`, `app/stakeholders/page.tsx`, `components/InitiativeDetail.tsx`, `components/StakeholderArtifact.tsx` ×2, `app/architecture/page.tsx`, `app/initiative/[id]/page.tsx`, `app/inbox/triage/page.tsx`) — `px-6` → `px-4 sm:px-6` and vertical padding stepped down for narrow screens.
- **Calendar header** (`CalendarPlan.tsx`): stacks vertically `<sm`; H1 28→24px on small; date label hidden on `<sm`; sprint header rows `flex-wrap` with `gap-x-3 gap-y-2` so capacity falls to a 2nd line cleanly.
- **Calendar drag warning**: added a mobile-only line — *"Drag-and-drop is desktop-only. Use the swipe deck for mobile triage."* HTML5 DnD doesn't work on touch and adding `react-dnd-touch-backend` is out of scope; cleaner to acknowledge the limitation than ship broken drag.

### Deploy

Single wrangler deploy per pass.

- v3.2 preview: `https://86172fcb.case-study-iud.pages.dev`
- v3.3 preview: `https://102261c4.case-study-iud.pages.dev` (currently production-aliased)
- Build: 23 static pages (unchanged from v3). Each pass deployed via `wrangler pages deploy out --project-name=case-study --branch=main --commit-dirty=true`.
- Smoke tests post-deploy: `/`, `/calendar/`, `/audit/`, `/stakeholders/` — all 200. Grep confirms `Merged`, `⊕`, `px-4 sm:px-6` strings live in prod HTML.

### Files touched (v3.2 + v3.3 combined)

**v3.2:**
- `components/DropPlanner.tsx` (new) — the planner component + `PlanChoice` + `PendingDrop` types + `computeHeadroom()`
- `components/CalendarPlan.tsx` — `pendingDrop` state, planner wiring, two-step drop pattern, commit/cancel handlers, suppression of drop-preview + trade-off panel + incoming-reflow hint while planner is open

**v3.3:**
- `lib/types.ts` — `ClusterSource` type + optional `cluster_sources` field on `Initiative`
- `data/initiatives.json` — cluster_sources arrays on `init_bulk_csv` and `init_saml_sso`
- `components/ClusterChip.tsx` (new) — tap-to-expand chip
- `app/page.tsx` — ClusterChip in InlineTriageCard, `⊕N` indicator in QueueRow, responsive padding
- `app/inbox/triage/page.tsx` — ClusterChip in InitiativeFront, responsive padding
- `components/Header.tsx` — desktop-vs-mobile nav split
- `components/CalendarPlan.tsx` — sprint header flex-wrap, H1 responsive sizing, mobile drag-warning hint
- `components/AuditLog.tsx` — responsive padding
- `components/InitiativeDetail.tsx` — responsive padding
- `components/StakeholderArtifact.tsx` — responsive padding (×2)
- `app/stakeholders/page.tsx` — responsive padding (×2)
- `app/architecture/page.tsx` — responsive padding
- `app/initiative/[id]/page.tsx` — responsive padding

### Click-count delta (overflow drop flow, v3.1 → v3.3)

| Step | v3.1 | v3.2 / v3.3 |
|---|---|---|
| Drop on over-capacity sprint | 1 (drop on a strategy card from 3-option panel) | 1 (drop on sprint → planner opens) |
| See *which* item moves and *where* | Buried in strategy card body — must read | Visible per-row in planner with explicit selector |
| Override AI's choice of *which* item | Pick a different strategy (which may have different items) | Toggle Keep on any item, Move-to on another |
| Override AI's choice of *where* item goes | Not possible (strategy fixes destination) | Pick destination per item from headroom-aware buttons |
| Commit | Implicit (drop on card commits) | Explicit (Commit button after preview) |
| **Net** | 1 click, opaque trade-off | 1 drop + N optional toggles + 1 commit click — but every trade-off visible at the point of decision |

The extra clicks are the point — POV-4 says trade-offs are *part of the decision*, not a post-hoc surprise.

### Audit POV alignment summary (recorded at end of v3.3)

| Source rubric | Built surface | Status |
|---|---|---|
| JBTD-1 (Capture) + POV-1 | Cmd+N modal | ✓ |
| JBTD-2 (Triage fast) + POV-2 | Now inline card + swipe deck | ✓ |
| JBTD-3 (Right framework) + POV-3 | Initiative Detail framework switcher | ✓ |
| **JBTD-4 (Trade-offs in the moment) + POV-4** | **Drop Planner** | **✓✓ — strongest hit** |
| JBTD-5 (Sequence) + POV-5 | Calendar + capacity bars + reflow chain | ✓ |
| JBTD-6 (Multi-audience) + POV-6 | Stakeholders master/detail | ✓ |
| JBTD-7 (Defend + learn) + POV-7 | Audit + Predictions verdict | ✓ |
| Pain Stage 2 — Semantic clustering | ClusterChip on Now + Triage | ✓ (closed in v3.3) |
| Pain Stage 4 — Frameworks-as-judgment | Per-item override + AI rationale | ✓ |
| Pain — AI saves time, coordination eats it | Stakeholder pre-generated artifacts | ✓ |
| Pain — Outcome loop missing | Predictions tab + verdict (v3.1) | ✓ |

Still open: **Sub-100ms haptic feedback** (web limitation, audio-only proxy); **dependency lines on Calendar** (low-value vs effort); **"Draft the plan first"** (implicit via AI default placements rather than explicit accept-all UX). Defensible to flag in writeup; none are demo-blocking.

---

## v1 history (historical, 2026-05-07 → 2026-05-08)

The sections below describe the v1 build that v2 superseded. Kept for context.

---

## (v1) Current state — superseded

**Status (v1, archived):** POV-complete against the original wireframe spec. Replaced by v2 on 2026-05-09.
**Live (v1, archived):** https://case-study-iud.pages.dev/ (now serves v2)
**Source (v1, archived):** github.com/prawat20/case-study (last v1 commit `cd0985d`)

### Routes shipped

| Route | Purpose | Notes |
|---|---|---|
| `/` | Priority Stream | Calm vertical feed; cards sorted by `priority_rank`; AI-recommended action label per card; OKR alignment chip; Strategic Banner with North Star + 3 OKRs |
| `/initiative/[id]/` | Initiative Detail | Full-screen single-context decision surface; the unique-design moment. Hero rationale at 28px, evidence chips with source quotes, recommendation card, tradeoffs, conflicts, Sprint View, action bar |
| `/quarter/` | Quarterly Simulation | Audience render toggle (All / Exec / Eng / Sales / CS) — same data, different framing; layoutId pill animation on toggle; show committed/overridden/deferred state from audit |
| `/audit/` | Audit Log | Every decision logged with AI rec → user action → reason → mocked "system note" (closes the Decision Audit Log loop from the POV) |
| `/architecture/` | Architecture diagram | Six-layer system, ingestion → synthesis → orchestration → audit-loop |
| `Cmd+K` (overlay) | Command palette | cmdk-based; search initiatives, render audiences, audit log, architecture, reset demo |

### Cross-cutting features

- **Strategic banner on home** — North Star (Net New ARR $1.5M / $2.4M = 63%) + Quarter elapsed (Week 9 of 13 = 69%) → pace gap `-6pp behind`. Expandable to the 3 OKRs.
- **SignalShifts banner on home** — *"engine noticed N priority signals overnight"*; expandable to per-item shift detail (volume up, named-account ask, etc) with the AI's reasoning per shift. Visualizes the Dynamic Priority Engine's continuous-synthesis output.
- **AI recommends an explicit action per item** — `commit | defer | escalate` with prose reason. Demo split: 2 commit, 1 defer (Webhook → Q4), 1 escalate (SOC2 audit-window vs eng capacity).
- **Action bar always shows all 3 actions.** AI's rec gets primary highlight + ↵ shortcut; the other two are secondary buttons.
- **Override is a path, not a button.** Picking any action different from AI's rec triggers an inline prompt: *"Choosing [X] instead of AI's [Y]. Why?"*. Reason becomes the system-learning signal.
- **Sprint View** on Initiative Detail — vertical Q3 timeline (4 sprints), capacity bars per sprint (over-capacity flagged amber), current item highlighted with "← lands here" tag.
- **Framework chip** on Initiative Detail — each item carries `framework` (RICE / Strategic Bet / Value-Effort / ICE / WSJF) + AI rationale for the choice. Hover to see why AI picked it for this item type. Demo mix: Bulk CSV/SAML/Permission-Groups → RICE; SOC2 → Strategic Bet; Webhook/Slack-v2/Custom-Fields → Value-Effort; Mobile-Push → ICE.
- **Predicted outcome** on Initiative Detail (inline below recommendation) and Audit Log (per entry) — what AI expects if the recommendation is followed.
- **Trade-offs section** with concrete prose ripple effects.
- **System learning cue** — when user has overridden once, subsequent Initiative Details show a sparkle callout referencing the prior override.
- **Decision persistence** via `localStorage`. Committed items disappear from Priority Stream, surface in Quarter view as green dots, surface in Audit Log with system notes.
- **Decision-lands-in-corner animation** — on commit, mini card flies from the recommendation surface to the top-right with fade-out (~700ms).
- **Drag-to-resequence on Quarter All view** — HTML5 drag, drop targets light up accent-soft on hover, AI ripple toast on drop ("Moved X. Pushes 1 dependent item by 2 weeks. Confirm or revert?").
- **Ship + Snap on Quarter** — per-audience "Ship to [Audience]" button copies markdown to clipboard + fires snap chime; All view also has "Snap as Q3 plan" CTA that locks the plan with a three-note resolving chord.
- **Engage the Senses** — three Web Audio chimes: commit (two-tone D5+A5), defer (single G4 tick), snap (three-note resolving chord C5+E5+G5). No audio assets. Framer Motion choreography across all surfaces.

---

## Design tokens (locked)

- Mode: dark-first only. Light mode out of scope.
- Bg `#0a0a0b` page · `#111114` elevated · `#1a1a1f` card hover.
- Accent `#7c5cff` (calm violet — distinctive, not Linear's purple).
- Text `#fafafa` primary · `#a1a1aa` secondary · `#52525b` tertiary · `#71717a` muted.
- Status: `#22c55e` success · `#f59e0b` warning · `#ef4444` danger.
- Type: Inter (UI/headings, variable weight) + JetBrains Mono (timestamps/IDs).
- Max content width: 720px (single-column scan, no multi-column per DfD 1.5).
- Motion: 150ms ease-out default; <100ms feedback target.
- Radius: 8px (md), 12px (lg), 999px (chip).

---

## Iteration log (7 rounds)

### Round 1 — Initial scaffold (commit `6d6728d`)
Set up Next.js 16 + Tailwind v4 + TypeScript static export. Folder structure (`app/`, `components/`, `data/`, `lib/`). Design tokens in `globals.css`. Mocked initiatives JSON (8 items). Priority Stream first-pass with header chrome, greeting, decision cards.

### Round 2 — Priority sort + semantic chips (`d5bc561`)
Added `priority_rank` to needs-decision items; sorted Priority Stream by it. Added `signal_type` to all initiatives. Tagged each evidence item with `kind` (revenue / deals / support / deadline / strategic). New `EvidenceChip` component with semantic color tints (muted, calm — no rainbow). Greeting copy updated to "ordered by urgency."

### Round 3 — End-to-end loop (`23728eb`)
Built Initiative Detail (the unique-design moment) — full-screen, single context, AI-narrated 28px rationale, expandable evidence chips with source quotes, accent-bordered recommendation card, action bar with ↵/E/D/S keyboard shortcuts. Commit fires Web Audio chime + animated card pulse + toast + auto-navigate.

Built Quarterly Simulation with 5-way audience render toggle (All / Exec / Eng / Sales / CS). LayoutId pill animation. Each audience renders the same data with completely different framing (themes for Exec, effort for Eng, customer-facing for Sales, ticket-reduction for CS).

Built Architecture page (six-layer diagram with feedback-loop annotation). Built Cmd+K palette (cmdk lib). Wired global keyboard listener via `CommandPaletteProvider`. Esc-collision guard on Initiative Detail when palette is open. Decisions persist in localStorage.

### Round 4 — Strategic context + recommended actions + audit log (`cb5f3ff`)
Five PM-review gaps closed:

1. AI now recommends a specific **action** per item (commit / defer / escalate) with prose reason — not just a sequence.
2. **Strategic banner** on Priority Stream: North Star + 3 OKRs (Enterprise / Reliability / Compliance), expandable.
3. **Tradeoffs** section per Initiative Detail with concrete ripple language.
4. **Escalate definition** + auto-suggested stakeholders + AI-drafted message.
5. **Audit Log** page with mocked "system note" per decision.

Plus inline system-learning cue on subsequent Initiative Details after an override.

### Round 5 — Math fix + Sprint View + Override-as-path (`bfa4873`)
Four PM-review gaps closed:

1. **North Star math fixed.** Replaced confusing "75% behind" with two progress bars (ARR achieved + Quarter elapsed) and explicit pace-gap label.
2. **Action bar always shows all 3 actions.** Removed conditional hiding when AI rec matched.
3. **Override as path, not button.** When PM picks any non-AI action, inline prompt for reason.
4. **Sprint View added.** Vertical Q3 timeline showing existing items, capacity bars, current item highlighted.

### Round 6 — POV coverage audit, all 8 gaps closed (`3570b89`)

User asked for a coverage check against `cs2_product_pov.md`. Systematic claim-by-claim audit surfaced 8 explicit POV requirements not yet shipped. All closed in one pass:

1. **Decision-lands animation** — POV requirement: *"the decision card slides into the quarterly timeline in the background, visible at the corner of the screen — the PM sees their decision land."* Implemented as a mini card that flies from center to top-right with fade-out on commit, ~700ms.

2. **Drag-to-resequence on Quarter** — POV requirement: *"Drag to resequence."* HTML5 drag on Quarter All view; sprint sections light up accent-soft when hovered as drop targets.

3. **Live impact during drag** — POV requirement: *"AI shows live impact on conflicting items."* On drop, AI ripple toast: *"Moved X from Sprint A → B. Pushes 1 dependent item by 2 weeks. Confirm or revert?"*

4. **Ship audience view in one click** — POV requirement: *"PM ships any of those views in one click."* Per-audience "Ship to [Audience]" button replaces the old Copy-link footer. Copies markdown to clipboard + fires snap chime + confirmation toast.

5. **Sound on quarterly snap** — POV requirement under Engage Senses: *"Sound on quarterly snap (when a plan crystallizes)."* New `playSnapChime()` — three-note resolving chord (C5+E5+G5). Fires on Ship and on the new "Snap as Q3 plan" CTA.

6. **Framework switching per item type** — POV requirement (Pain mapping #11): *"Dynamic Priority Engine supports framework switching per item type."* Each `ai_recommendation` now carries `framework` + `framework_rationale`. Initiative Detail shows a hoverable framework chip explaining why AI picked it. Demo mix:
   - Bulk CSV / SAML / Permission Groups → **RICE**
   - SOC2 → **Strategic Bet**
   - Webhook / Slack v2 / Custom Fields → **Value/Effort**
   - Mobile Push → **ICE**

7. **Engine flags re-prioritization warranted** — POV requirement: *"engine flags when significant re-prioritization is warranted; the PM reviews and approves."* New `SignalShifts` banner above Strategic Banner: *"engine noticed N priority signals overnight"* — expandable per-item detail with the AI's reasoning per shift.

8. **Predicted outcome in Decision Audit Log** — POV requirement: *"every decision logged with the AI's rationale + the human's override + the predicted outcome."* `predicted_outcome` field per `ai_recommendation`. Surfaced inline on Initiative Detail (below recommendation card) and in Audit Log per entry.

Plus: Audit log link added to Initiative Detail header (next to Back) — closes the POV's "compactly accessible from Initiative Detail" requirement that previously was only via header/Cmd+K.

Build still clean: 15 static pages.

### Round 7 — Brief coverage audit (`154b33a` + `2f7c594`)

User asked for a coverage check against the actual case-study brief (in `_private/`), not the POV. Two gaps surfaced + closed:

1. **Build: framework of user's choice.** Brief literally says *"using a prioritization framework of the user's choice."* The build had AI picking the framework with no override path. Closed: framework chip on Initiative Detail is now a clickable picker. PM can switch any item to RICE / ICE / Value-Effort / Strategic Bet / WSJF. Override persists in localStorage (`qp_framework_overrides_v1`); cleared by Cmd+K reset. Visual: chip turns accent-violet when overridden; subscript switches from "AI picked this" to "Your override".

2. **Writeup: 3 brief deliverables.** Brief explicitly asks for North Star metric, 5 events to instrument, and PM interview question bank. None of these existed as a document yet (the NSM was sketched in the POV; events and interview bank were nowhere). Created `docs/cs2_supporting_writeup.md`:
   - **NSM:** median time from idea-surfaced → decision-logged. With justification, 4 alternatives I rejected, operational definition, and 6 supporting metrics (acceptance rate, alignment latency, churn rate, audit fidelity, plan diff drift).
   - **5 events:** `decision_logged` / `signal_shift_surfaced` / `audience_render_viewed` / `framework_overridden` / `plan_shipped`. Each with full property schema and a rationale tied to the *product decision the event drives*. Plus a "what I deliberately didn't instrument and why" cut list.
   - **PM interview bank:** 21 questions across 5 sections (current workflow / pain points / tools / reaction to thesis / reaction to specific features). Plus a 3-dimension validation rubric (pain acute, wedge resonates, tool reaction).

---

## Deviations from the wireframe spec

The wireframe (`docs/cs2_wireframes.md`) was the build contract; build evolved past it as PM feedback came in:

- **Action bar restructured.** Wireframe had 4 buttons (Commit / Override / Defer / Escalate). Final has 3 (Commit / Defer / Escalate); Override is a path triggered by non-AI actions.
- **Strategic banner added.** Not in the wireframe — emerged from PM feedback that NSM/OKR context was missing.
- **Audit Log page added.** Wireframe had it as "compact accordion inside Initiative Detail." Final is a full page (more discoverable, supports the system-learning narrative).
- **AI recommended action.** Wireframe had AI suggesting only a sequence; final has AI suggesting commit/defer/escalate with reasoning per item.
- **Sprint View added.** Not in wireframe — added per PM feedback that PMs need to see roadmap context to make informed decisions.

The wireframe is preserved as-is (the historical spec) rather than being rewritten — this build log carries the current state.

---

## Demo flow (numbered, sequential)

1. Land on `/` — see Strategic Banner (North Star + OKRs) + **SignalShifts banner** ("engine noticed 2 priority signals overnight"; click to expand). 4 cards each with action label + OKR chip.
2. Click **Bulk CSV** → see **framework chip** ("RICE") near recommendation; hover for rationale. **Predicted outcome** below: *"~$480k ARR closes by end of Q3."* Action bar primary CTA is "Commit ↵" (green). **Audit log link** in top-right next to Back.
3. Press `↵` → chime + recommendation pulse + **mini card flies to top-right corner with fade-out** + toast → back to home.
4. Open **SOC2 audit log** → primary CTA is "Escalate ↵" (yellow), framework chip shows "Strategic Bet." Press `↵` → escalate panel opens with definition, AI-suggested stakeholders, AI-drafted message ready to send.
5. Open **Webhook Retries** → primary CTA is "Defer ↵" (muted). Press `C` (Commit instead) → inline override prompt: *"Choosing Commit instead of AI's Defer. Why?"* → type reason → ↵.
6. Land back on `/` — see "decided this session" link, decisions filtered out.
7. Open the next undecided card → see **"Noting your last override"** sparkle cue.
8. Visit `/audit/` → see all decisions with AI rec → your action → reasoning → **predicted outcome** → system notes.
9. Visit `/quarter/` → see committed items as green dots, deferred as muted, override notes labelled. **Drag any item between sprints** in All view → drop target lights up → AI ripple toast on drop. Toggle audience: All → Exec → Eng → Sales → CS. **"Ship to [Audience]"** button copies markdown to clipboard + snap chime. **"Snap as Q3 plan"** CTA on All view locks the plan.
10. Visit `/architecture/` → layered system diagram.
11. `Cmd+K → "Reset demo"` → clears localStorage, fresh state.

---

## Outstanding

### CS2 UX polish pass (next session)
- Spacing rhythm refinement on Initiative Detail (especially around the 28px hero rationale)
- Sprint View capacity-unit labeling clarity (`5/6` vs `5 of 6 sprint-weeks` etc.)
- Override prompt phrasing
- Accent saturation A/B
- Chip color saturation
- Button hover/focus state refinement
- Quarter sprint dates alignment with the "Week 9 of 13" framing
- Audit Log "system note" tone calibration
- Decision-lands animation timing (current 700ms — feels right, may want 600ms)
- SignalShifts banner — should it be dismissible? Persist dismissal across reloads?
- Drag affordance on Quarter — currently grab cursor; could add a small drag handle icon for clarity

### CS2 supporting writeup (brief deliverable)
- **North Star metric.** Locked: median time from idea-surfaced → decision-logged. Plus 5 supporting metrics.
- **5 events to instrument** with rationale.
- **PM interview question bank** — exploratory questions to validate the product before broader build.

### CS1 written doc (separate brief)
- Caselet 1: Revolut Primacy painkiller/vitamin + 2 growth ideas + UX flow
- Caselet 2: Plottwyst pitch (persona/problem/proposition/MVP/revenue/TAM)

---

## Tech stack

- Next.js 16.2.5 (App Router, static export, Turbopack)
- React 19.2.4
- TypeScript
- Tailwind CSS v4 (CSS-first config via `@theme inline`)
- Framer Motion 12 (motion choreography)
- cmdk 1.1 (command palette)
- @radix-ui/react-dialog + react-dropdown-menu (accessible primitives)
- Lucide React 1.14 (icons)
- clsx + tailwind-merge (class composition)
- Web Audio API (synthesized chimes, no audio assets)

## Stats

- 15 static pages generated on each build (`/`, `/_not-found`, `/architecture`, `/audit`, `/quarter`, 8× `/initiative/[id]`, ...)
- Build time: ~4 seconds
- Initial JS bundle: small enough not to require optimization yet
- 0 backend, 0 auth, 0 external API dependencies at runtime

## Deploy commands

```bash
# Build the static export
cd quarterly-planning
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=case-study --branch=main --commit-dirty=true

# Push source to GitHub
cd ..
git add -A && git commit -m "..." && git push origin main
```

---

## Notes

- Repo + Pages project + domain are all temporary, scoped to the interview process. Tear-down post-decision is delete-the-Pages-project + archive-or-delete-repo. No DNS to clean up.
- Public repo by design — Bhavin's reviewers can browse the source and the commit history (showing the iteration loop is itself a positive signal).
- All work artifacts in `docs/` are public; original briefs + the Design for Delight wiki content live in `_private/` (gitignored) since they're material from the company we're applying to.
