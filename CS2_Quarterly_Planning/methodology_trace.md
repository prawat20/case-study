# CS2 — Methodology Trace

> The process record behind the CS2 deliverable. How the build was approached, what each layer carries, and the engineering and design choices that compound across surfaces. Reads in past tense as a final-state trace, not a working log.

---

## Approach in one paragraph

CS2 was built **POV-first, surface-last**. The persona, seven JBTDs, and per-JBTD design rubric were locked before any pixels — every design move had to trace back to one of the seven POVs or it was out. The visual / motion / sonic vocabulary was locked next, then the surface map, then the build. The result is a five-surface app that demonstrates an opinionated end-to-end loop (capture → triage → place → communicate → learn) rather than a feature-laden tool. The brief explicitly assumes ingestion is solved upstream; the build covers the post-ingestion slice, which is also where the PM's day actually lives.

---

## Source-of-truth documents

| Layer | Document | What it locks |
|---|---|---|
| Research | [`research/pm_pain_points.md`](research/pm_pain_points.md) | Six-stage workflow synthesis · pain points per stage · tool-landscape gap analysis · framework biases |
| Product POV | [`product_pov.md`](product_pov.md) | Maya (persona) · seven JBTDs · POV-per-JBTD design rubric · North Star principle · explicit out-of-scope |
| Design system | [`design_system.md`](design_system.md) | Palette · typography · spacing · motion · sound · accessibility · what's deliberately avoided |
| Information architecture | [`ia_and_surfaces.md`](ia_and_surfaces.md) | Five surfaces · route map · per-surface design intent · anti-patterns explicitly avoided |
| Brief deliverables | [`supporting_writeup.md`](supporting_writeup.md) | North Star metric · five events to instrument · PM interview question bank |

---

## Layer 1 — Research

The wedge surfaced from the workflow synthesis was: **the problem is not that PMs lack frameworks or tools; the problem is that every existing tool is a system of record — it stores the prioritised list after the PM has already done the thinking.** The thinking is what's painful, slow, and political, and that's where AI-native software should compress.

The strongest evidence anchor: ~60% of PMs still use Notion + spreadsheets despite paid alternatives (Productboard, Aha!, Airfocus, JPD, ProductPlan). The paid tools haven't earned the actual workflow.

Six workflow stages were named (intake → cluster + dedup → enrich → score + rank → plan + sequence → communicate + iterate). The cluster-and-dedup stage was identified as the highest-leverage place for AI — semantic clustering is exactly what LLM embeddings do well, and it's almost universally absent from existing tools. This finding became POV-2 (Triage) and surfaces directly in the app's clustering-visibility chip.

---

## Layer 2 — Product POV

**Persona.** Maya, Senior PM at a Series-C B2B SaaS — concrete to the point that designs could be stress-tested against her actual week (6.2 hrs/day in meetings, ~70 min of usable "deep work" Monday morning, 3-day quarterly planning week dominated by *retroactive justification* of intuitive Week-1 decisions). Four stakeholders weight different evidence: Sales lead, CS lead, Eng lead, Exec sponsor. Her job is not to pick a winner — it's to build a defensible plan and get all four to nod.

**Seven JBTDs** in loop order: Capture → Triage → Prioritize (framework moment) → Resolve trade-offs → Sequence → Communicate per audience → Audit + learn. Each becomes a POV — a design rubric the build can be checked against.

**Per-JBTD design rubric.** Each POV declares both what to believe *and* what to reject. Example: POV-2 (Triage) believes in deck-of-cards full-screen one-at-a-time decisions; rejects multi-row tables of un-triaged items (the cognitive cost of seeing the pile is what makes triage feel infinite) and bulk-action checkboxes (encourage rubber-stamping). When a build choice gets ambiguous, the POV re-reads as the tiebreaker.

**North Star.** Median time from idea-surfaced → decision-logged. Leading indicator: % of items decided same day they're captured. Rejected NSM candidates documented in [`supporting_writeup.md`](supporting_writeup.md) §1 with reasons (plans shipped per quarter is gameable; NPS is soft; DAU is vanity for a decision-orchestration tool).

---

## Layer 3 — Design system

**Palette.** Warm cream page (`#F8F5EE`), pure white elevated surfaces, sage `#5A8F6F` as the single accent. The choice traces to two research signals: 2026 minimalism's shift to "rooted earth tones" and Amie's joyful-but-not-loud language. Sage was picked deliberately over Linear violet (too associated with Linear), amber (competes with status warning), lavender (2026 cliché), and deep ink-blue (austere, kills joy).

**Typography.** Three families. **Inter** for ~95% of UI, **Fraunces** display serif for personality moments (page hero, NSM number, decision-lands celebration text, max 2-3 instances per surface), **JetBrains Mono** for numerics, timestamps, IDs. Body sits at 14px / 1.55 line-height because cream backgrounds need breathing room — 13px reads anemic.

**Motion.** Four durations (100ms / 180ms / 320ms / 720ms) and three easings (ease-out for entry, ease-in for exit, spring overshoot only for celebration). Decision-lands choreography fires on commit; reflowed Calendar items use `motion.div layoutId` shared-layout transitions for ~420ms slides between sprints. The system explicitly avoids: bouncy springs outside celebration moments, parallax, glassmorphism beyond the cmd palette, page transitions that move whole layout, loading spinners (replaced by skeleton states).

**Sound.** Five Web Audio chimes, gain tuned ~30% softer than a typical dark-context UI — cream needs quieter sound. Capture pluck (A5), three triage tones by action (G4/B4/D5), commit two-tone (D5+A5), snap three-note resolving chord. Silence path is browser tab-mute; an in-app toggle is deferred (the chime set is conservative enough that the build doesn't yet earn one).

**The three principles that override every choice.** Zero Cognitive Load (DfD-1) · Restraint (Amie's *"products die from obesity"*) · Calm flow over output (Linear's *"when execution becomes the default, we devalue the why"*).

---

## Layer 4 — Information architecture

Five destination surfaces aligned to the seven JBTDs. **Now** is the home that aggregates the loop and carries the front of capture + triage; the other four are the body.

| Surface | Owns | Mechanic |
|---|---|---|
| Now (`/`) | JBTD-1, JBTD-2, aggregator | NSM hero in Fraunces 48px · inline triage rows · `⌘N` capture · `Start triage →` CTA |
| Prioritize (`/prioritize/[id]`) | JBTD-3, JBTD-4 | Framework picker (5 chips) as first-class control · scorecard re-renders below · commit-confirm with sprint impact |
| Calendar (`/calendar`) | JBTD-5 | Sprint-by-sprint drag-and-drop puzzle · Drop Planner on overflow · animated reflow |
| Stakeholders (`/stakeholders`) | JBTD-6 | Master/detail · persistent audience rail · generated per-audience artifacts · copy-as-Slack / copy-as-email |
| Audit (`/audit`) | JBTD-7 | Decisions log + Predictions tab · 21-day prediction-vs-actual review |

The Calendar is the most opinionated surface. The interaction model resolves the brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) onto a single drag: when a drop would overflow a sprint, the Drop Planner panel expands inline with per-item destination control. Each item currently in the target sprint gets a row with destination buttons (`Keep | Sprint 1 (Xp free) | Sprint 3 (Yp free) | Defer Q4`); headroom recomputes live as the PM toggles. An AI-suggested plan is pre-selected with a ✦ badge — the PM can override any row. A live trade-off summary updates per toggle (`Freeing 2p of 2p needed ✓ · RICE cost: −0.5 · All deadlines protected`). AI is **advisory, not deciding**.

---

## Layer 5 — Build

**Stack.** Next.js 16 (App Router · static export · Turbopack), TypeScript, Tailwind v4 (CSS-first config, theme via `@theme inline`), Framer Motion (drag + shared-layout transitions), cmdk (command palette), Radix UI (accessible primitives), Lucide React (1.5px stroke icons), Web Audio API (synthesised chimes, no audio assets shipped).

**State.** No backend. State persists in client-side localStorage across seven stores (decisions, framework overrides, triage actions, captures, calendar assignments, calendar lock state, theme preference). Cmd+K → Reset clears six — theme preference survives by design so a reviewer doesn't lose their dark-mode choice mid-demo.

**Engine.** The decision logic lives in `lib/sprint-conflict.ts`. `computeCommitImpact(initiative, strategy, targetSprint)` returns the resolved sprint-assignment map atomically. `computeStrategyOptions()` returns the three strategy options for the Drop Planner with rationale + score impact (`priority_weight × sprint_shift` summed per pushed item; deferred items count as a 5-sprint shift). Both functions are reused across Prioritize commit and Calendar drag — the engine is centralised, the surfaces are thin.

**Cross-surface coherence.** `lib/calendar-state.useCalendarState` emits a custom event so Calendar, Prioritize, and Stakeholders all refresh together. The Audit surface reads from the same stores; Predictions tab seeds a mock 21-day-old SAML prediction always-present so the loop is visible on a fresh demo. Stakeholder artifacts read the same committed initiatives — pick "For Sales" and the lines materialise with 50ms stagger, deal-by-deal mapped with sprint dates + ARR. Each artifact has `Copy as Slack` / `Copy as email`, clipboard-ready.

**Responsive.** Desktop is the primary surface (drag-and-drop is the primary input model). Below 768px, the Calendar shows an explicit *"Drag-and-drop is desktop-only. Use the swipe deck for mobile triage."* hint — surfacing the limitation cleanly is better than shipping broken touch interactions. The Now surface, the Stakeholders rail, the Audit log, and the prediction cards all remain functional on mobile / tablet.

**Touch limitation disclosure.** HTML5 drag-and-drop doesn't work on touch natively. Two paths considered: ship a parallel touch interaction (would have doubled the Calendar code and the design surface area) or surface the limitation honestly. The brief asks for the experience of a PM at a desk; the mobile cohort would use the read-only Now + Audit and pick up drag-heavy work on a laptop. The disclosure path was chosen.

---

## Demo state

The deployed build at [sift-pm.pages.dev](https://sift-pm.pages.dev/) is the canonical demo surface. An 8-minute reviewer flow takes the user from landing on Now → capturing an ask with `⌘N` → swiping through triage → placing items on the Calendar (including a deliberately-overflowing drop to surface the Drop Planner) → switching stakeholder audiences → opening the Audit Predictions tab.

The full flow + key states are walked through in the top-level [`README.md`](../README.md) (Demo flow section).

---

## Process lessons (validated, kept for future product work)

- **POV before pixels.** A locked POV-per-JBTD rubric is the tiebreaker when design choices get ambiguous. Without it, the team defaults to the loudest opinion or the safest precedent. With it, every design move has a defensible "why this, not that."
- **Two-step drop pattern over one-step auto-reflow.** Silent auto-reflow on overflow felt elegant in the spec but failed the POV-4 (Trade-offs in the moment) rubric — the PM never *saw* the cost. The Drop Planner's two-step pattern (pending → planner panel → commit) makes trade-offs the act of work, not a post-hoc surprise.
- **AI as advisor, not actor.** The Drop Planner shows the AI's suggestion with a ✦ badge on every row and lets the PM override row-by-row. Reviewers consistently read this as the strongest POV-4 alignment in the build, because it answers *"who moves and where they go"* with PM control rather than a strategy label.
- **Generated artifacts beat filtered views.** Same-data-different-filter audience views look efficient but read wrong — Sales reads like a roadmap with a Sales column, Exec reads like a roadmap with the table collapsed. Generated artifacts (each audience gets its own copy + format) read like the document the PM would have written for them. The materialize stagger reinforces it.
- **Surface consolidation pays.** Inbox folded into Now (`/inbox` kept as a transparent redirect for deep-link compatibility; `/quarter` kept as an alias for `/calendar` for the same reason) reduced top-nav from 5 → 4 items and "land → first triage card" from 2 clicks to 1. Anywhere a surface is just a container around content from another surface, fold.
- **Clustering visibility is load-bearing for AI-native framing.** Without a visible cluster chip on the front-door inbox, the "Opportunity Synthesis Engine" claim sits in `/architecture/` as a description, not a demonstration. Tap-to-expand on the front-door card shows each source's channel + verbatim quote + timestamp — the AI-native claim resolves into something the PM can verify.
- **Decision-lands choreography earns its motion budget.** Most micro-motion is decoration. The decision-lands beat on commit (card → calendar lane, ~720ms, with the two-tone chime) is the one moment where the PM has earned celebration. Cutting it back to 320ms or removing the chime lost the "felt moment" without saving any clarity.
- **localStorage is enough for the demo surface.** The brief explicitly assumes ingestion is solved upstream. Persisting state in seven scoped localStorage stores (each scoped by purpose) covers every reviewer flow without inviting backend complexity that wasn't in scope. Cmd+K → Reset clears the six demo-state stores; theme preference persists across resets.
- **Single-column everywhere.** Multi-column tables force multi-axis scanning and violate Zero Cognitive Load. Every surface is single-column or vertical (the Calendar's four sprint lanes are arranged vertically with horizontal capacity bars, not as a 4-column grid).
- **Touch disclosure beats touch parity.** Shipping a parallel touch interaction would have doubled the Calendar code surface and the design surface. Surfacing the limitation cleanly with a one-line hint is the right honesty move for a demo.
- **Light-context sound needs ~30% less gain.** Audio cues that work on dark surfaces feel intrusive on warm cream. Tuning gain down preserves the "felt moment" without breaking the calm.
