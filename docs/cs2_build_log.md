# CS2 Build Log

> Running record of what was actually built, what changed from the wireframe spec, and current demo state.
> Started 2026-05-07. Most recent entry 2026-05-09.

---

## Current state (v2 — 2026-05-09)

**Status:** v2 redesign shipped. Step-change rebuild from JBTDs first. Six surfaces in the new IA, all wired end-to-end.
**Live:** https://case-study-iud.pages.dev/
**Source:** github.com/prawat20/case-study (latest `2a99957`)
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
