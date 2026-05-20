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
| Prioritize (`/initiative/[id]`) | JBTD-3, JBTD-4 | Framework picker (5 chips) as first-class control · scorecard re-renders below · commit-confirm with sprint impact |
| Calendar (`/calendar`) | JBTD-5 | Sprint-by-sprint drag-and-drop puzzle · Drop Planner on overflow · animated reflow |
| Stakeholders (`/stakeholders`) | JBTD-6 | Master/detail · persistent audience rail · generated per-audience artifacts · copy-as-Slack / copy-as-email |
| Audit (`/audit`) | JBTD-7 | Activity log (every action vs AI recommendation, divergences flagged) + Predictions tab · 21-day prediction-vs-actual review |

The Calendar is the most opinionated surface. The interaction model resolves the brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) onto a single drag: when a drop would overflow a sprint, the Drop Planner panel expands inline with per-item destination control. Each item currently in the target sprint gets a row with destination buttons (`Keep | Sprint 1 (Xp free) | Sprint 3 (Yp free) | Defer Q3`); headroom recomputes live as the PM toggles. An AI-suggested plan is pre-selected with a ✦ badge — the PM can override any row. A live trade-off summary updates per toggle (`Freeing 2p of 2p needed ✓ · RICE cost: −0.5 · All deadlines protected`). AI is **advisory, not deciding**.

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

---

## Round 12 — Reviewer-discoverability + temporal consistency (2026-05-20)

Pre-submission polish pass. Surfaces the build had been quietly hiding the most important affordances from a first-time reviewer; the calendar carried a silent temporal lie. Triggered by a single walkthrough where the user noted four issues in one breath.

**Product wordmark.** The header read *"Glide"* — same name as Maya's fictional employer (`product_pov.md`). A reviewer who reads the docs and then opens the app can't tell whether Glide is the product or her company. Renamed to **Sift**. Diamond logo + sage accent unchanged. URL also moved from `case-study-iud.pages.dev` to `sift-pm.pages.dev` (the bare `sift.pages.dev` was taken on Cloudflare's namespace).

**Reset moved out of Cmd+K.** Previously buried as a *System → Reset demo* command in the palette. A reviewer who doesn't know about Cmd+K can dig themselves into a stuck state with no exit. Now a small `↻ Reset` button in the header right cluster with a two-step confirm (Reset / Cancel) so accidental clicks don't wipe the demo. Clears six of seven localStorage stores; theme preference deliberately survives so a reviewer doesn't lose dark-mode mid-walkthrough.

**Architecture moved into primary nav.** The original IA stance held Architecture as Cmd+K-only ("not part of the daily loop"). That's correct for daily users but wrong for case-study reviewers — Architecture is the load-bearing **capability map**, and a reviewer who can't find it loses the entire system-design picture. Top nav now: `Now · Calendar · Stakeholders · Audit · Architecture` (5 items). Stakeholders also stayed in nav for the same reviewer-discoverability reason.

**Sort / Decide funnel framing.** The build's two action vocabularies (Triage → `Promote / Defer / Route` ; Initiative Detail → `Commit / Defer / Escalate`) read as drift, not as deliberate funnel. First iteration added a cross-referencing eyebrow on each surface ("Sort · the triage step; deeper Decide happens on the initiative page"). User feedback: the cross-reference broke because Promote can land in Calendar directly without ever touching Initiative Detail — Decide actually happens in **two places** (Calendar drop = commit, OR Initiative Detail = the deep view). Final design dropped the cross-reference text and added a two-path caption on the *Ready to place* section on Now: *"Drop one into a Calendar sprint — that's the commit. Open an item for the full Decide view (framework picker, conflicts, predicted outcome)."* Promoted-row "Place →" link also relabeled to "Decide →" so the link's actual destination (`/initiative/[id]/`) reads correctly.

**Onboarding — modal → side panel.** First iteration was a center modal that auto-fired on first visit. User feedback: too intrusive, clipped at the top viewport on shorter screens. Rebuilt as a 400px right-side slide-in panel (`components/OnboardingModal.tsx`). No backdrop blur, no auto-fire — only opens when the `?` icon in the header is clicked. Page stays interactive while the panel is open. Esc / dim-strip click / close button all dismiss.

**Shipped sprints are read-only.** The Calendar had been showing all four Q3 sprints as drop targets even though `lib/sprint-data.ts` already marked Sprint 1 as `"shipped"`. A PM can't drop work into a sprint that has closed — showing the lane as a valid target was a UX lie. Fixed at three layers:
- `sprintDragOver` + `dropOnSprint` early-return when `status === "shipped"`.
- Lane wrapper renders dimmed (opacity 0.62), dashed muted border, `aria-disabled`, no hover affordance. Items inside have `draggable={false}` with tooltip "Shipped — read-only".
- AI-suggests pill and incoming-reflow target skip shipped sprints — would have been visually impossible to act on.

Underneath this lived a deeper inconsistency: the NSM said `weeks_elapsed=9 of 13` (late-Q3) but only one sprint was marked shipped — the week count and the sprint-status model disagreed. Resolved by refreshing the temporal anchor to `weeks_elapsed=4` and `current_value=$600k` (Sprint 1 freshly shipped, Sprint 2 in flight, Sprints 3 + 4 planned). Same 6pp "behind pace" NSM tension is preserved (25% achieved vs 31% elapsed). Bulk CSV + SAML AI recs shifted from "Q3 Sprint 1" → "Q3 Sprint 2" so the AI-suggests pill points at a sprint the PM can actually drop into.

**Submission package now PDF-only.** Independent decision earlier in the session: the live deck link (`plottwyst.app/deck/momentum`) was removed from the case-study submission package (PDF + repo + supporting writeup). Reviewer doesn't need to chase a second URL; the deliverable is the PDF. Pre-send checklist updated. (The deck remains live for direct sharing if someone asks.)

**Process lessons added Round 12:**
- **Reviewer-discoverability ≠ daily-user discoverability.** The same UI serves two audiences with different goals — a case-study reviewer needs to find the capability map fast; a daily PM needs Now + Calendar to be uncluttered. When the audiences conflict, decide which one shipped *this build* is optimised for. CS2 shipped for the reviewer first.
- **Cross-referencing eyebrows are a smell when the referenced surface has multiple paths.** The first Sort/Decide eyebrow promised "deeper Decide on the initiative page" — but Promote actually had two downstream paths. Eyebrow cross-references only work when the next-step is singular. When it's plural, surface both paths or none.
- **Center modals at full viewport height clip on short screens.** Side panels are safer for "reference content" — they sit beside the page, the page stays usable, no clip risk. Use modals only for *blocking* interactions (capture, confirm-and-commit). Reserve them for moments where the user genuinely can't proceed without responding.
- **Surface-level data must agree with global temporal anchors.** Sprint status, NSM week count, AI recommendation sequence, and decision-log dates all reference the same imaginary clock. Moving one without checking the others produces a quiet internal lie that a sharp reviewer will catch (the user caught this one with a single sentence). Pattern: when shifting a temporal anchor, grep for `weeks_elapsed`, all `Sprint N` references, all hard-coded percentages, all hard-coded dates.
- **First-visit auto-fire onboarding is more aggressive than it looks.** A modal that opens before the user has done anything reads as a permission demand, not a help offer. Discoverable affordances (a `?` icon) outperform auto-fire UX for case-study contexts where reviewers want to explore first.

Files touched Round 12 (10 files): `components/Header.tsx`, `components/OnboardingModal.tsx` (new, then rebuilt), `components/CalendarPlan.tsx`, `components/InitiativeDetail.tsx`, `app/page.tsx`, `app/inbox/triage/page.tsx`, `app/layout.tsx`, `data/initiatives.json`, `lib/strategic.ts`, `lib/stakeholder-artifacts.ts`. Commits `928a869` (initial UX additions) → `920a661` (onboarding rebuild + funnel simplification) → `357a73e` (shipped-sprint lock + temporal anchor refresh).

---

## Round 13 — Onboarding fix · AI-reco visibility · audit-as-feedback-loop (2026-05-20)

Shipped + deployed to `sift-pm.pages.dev` (deploy `0b7dc8d4`). Four changes; new shared module `lib/ai-reco.ts` (AI↔triage↔decision action maps + divergence helpers); additive `realized_action?` field on the `Decision` model.

**Onboarding `?` showed no content — a CSS containing-block trap.** The Round-12 side panel rendered as a clipped sliver. Root cause: `<OnboardingModal />` was mounted *inside* `<header>`, which has `backdrop-blur`. A `backdrop-filter` (also `filter` / `transform` / `perspective` / `will-change`) ancestor becomes the containing block for `position: fixed` descendants — so the panel's `fixed inset-0` / `h-full` resolved against the 56px header box, not the viewport, and the content scrolled out of view. Fix: mount the panel at the body-level overlay host (`CommandProvider`, alongside the working Command/Capture modals), keep the `?` trigger in the header via a window event. The working modals were the tell — they sat in the body-level provider; the broken one sat in the blurred header.

**AI-recommended action surfaced on the triage card.** The Now triage card showed the predicted outcome but not the AI's recommended *action* — the three pills (Promote / Defer / Route) carried equal weight. The recommended pill now takes the accent ✦ "AI's pick" treatment (the app's established language, already used by the framework chips + Drop Planner) with an "✦ AI recommends {action}" caption. Map: AI `commit → Promote`, `defer → Defer`, `escalate → Route`. The Calendar (rail "AI: Sprint N" + "AI suggests" lane on drag) and the deep Decide view already highlighted the recommendation, so the gap was only the front-door triage card.

**Audit rebuilt as the AI-vs-PM feedback loop.** Was: a "Decisions" list + Predictions tab, with triage merely *counted*. Now the **Activity** tab logs every PM action (triage **and** decisions), each annotated "You {X} → ✦ AI recommended {Y}"; divergences are highlighted (accent border + "↻ Diverged — feeds recalibration" + rationale), matches show "✓ Matched the system." A calibration summary (logged · followed AI · diverged → "N signals queued for recalibration") + a Divergences-only filter. Plumbed `realized_action` onto decisions so an "overridden" decision's actual choice is known without parsing rationale strings. This makes the override-rate / AI-acceptance metrics from `supporting_writeup.md` §1 visible in-product, and is the strongest "AI-native, not AI-bolted" proof in the build — the gap between recommendation and action *is* the training signal.

**Architecture page rebuilt as layers.** The six-layer stack was a flat list of numbered cards. Now grouped into three labeled bands (System learns L6 · You operate L5–4, accent-tinted · System synthesizes L3–1, foundation grounded) with a continuous stack spine through the layer numbers and the **6→3 recalibration loop drawn explicitly** ("overrides flow back to the priority engine") — which visually echoes the new Activity-tab divergence work.

**Process lessons added Round 13:**
- **`backdrop-filter` / `transform` / `filter` on an ancestor re-roots `position: fixed` to that element, not the viewport.** A fixed overlay that renders clipped or tiny is almost always mounted inside a blurred or transformed container. Mount global overlays at the body level.
- **AI-vs-PM divergence is the case study's strongest AI-native proof.** Surfacing every action against the recommendation, and treating the gap as the signal that recalibrates the engine, makes the learning loop tangible rather than asserted. The audit stops being a record and becomes the feedback instrument.
- **Don't add funnel steps to fix a visibility/instrumentation problem.** The flow felt unclear → the fix was surfacing the recommendation (triage) + instrumenting divergence (audit), not a new prioritise stage. (The "keep current flow" call was made explicitly with the user.)

Files touched Round 13: `lib/ai-reco.ts` (new), `lib/decisions.ts` (+`realized_action`), `app/page.tsx` (triage card + ActionPill), `components/InitiativeDetail.tsx` (set `realized_action`), `components/AuditLog.tsx` (Activity stream + divergence), `app/architecture/page.tsx` (layered rebuild), `components/Header.tsx` + `components/CommandProvider.tsx` (onboarding mount move).

---

## Round 14 — Temporal anchor off-by-one · triage "Route" → "Escalate" (2026-05-20)

Two consistency fixes caught in a pre-send read.

**Quarter anchor was a quarter too far ahead.** The tool labelled the current quarter **Q3 2026** and the defer target **Q4** — but it's May 2026, which is **Q2** (Apr–Jun), and the sprint dates were already May–June. So a reviewer opening it in May would hit an immediate "it's May, why are we in Q3 and deferring to Q4?" Relabelled one quarter back everywhere: current `Q3 → Q2`, defer `Q4 → Q3`. To keep the SOC2 narrative tight, the audit-log item's hard deadline moved `October → July` — its rationale claims "Sprint 3 leaves ~4 weeks buffer before the audit," and Sprint 3 ends Jun 20, so a July audit is what makes that sentence true. Round 12 had made the *internal* anchors agree (week count vs sprint status) but never checked the quarter label against the actual present — **lesson: sanity-check temporal anchors against the real calendar, not only against each other.** ~79 references across 9 code/data files + the spec docs; `parseSequenceToSprint` keys on `Sprint N` not the quarter prefix, so the data relabel was parse-safe.

**Triage's third action renamed `Route` → `Escalate`.** Across the three layers the third action was already "escalate" *everywhere except the triage label*: the AI recommends in `{commit, defer, escalate}`, the Decide view's third action is **Escalate** ("needs stakeholder input before commit"), but triage said **Route** ("someone else owns this"). That made the Round-13 ✦ pill read "AI recommends **Route**" for items the model actually wanted *escalated for input* (e.g. the SOC2 audit-log item) — a real mismatch, and the exact vocab "drift" the Round-12 funnel-framing note had flagged. Route was the outlier, so it was unified, not patched: the `TriageAction` enum value, verb, hotkey (`R → E`), and intent copy ("someone else owns this" → "needs input before committing") all moved to Escalate. `TRIAGE_TO_AI`/`AI_TO_TRIAGE` collapse to identity for escalate. The alternative (adding a destination picker to Route) was rejected — it would have deepened the divergence rather than closing it. **Lesson: when the same concept carries different labels across layers, the odd one out is usually the bug — unify it rather than build around it.**

Verified: `tsc` clean, `npm run build` 23/23 pages. Files touched: `lib/strategic.ts`, `lib/sprint-data.ts`, `data/initiatives.json`, `components/CalendarPlan.tsx`, `components/DropPlanner.tsx`, `components/AuditLog.tsx`, `lib/sprint-conflict.ts`, `app/stakeholders/page.tsx`, `lib/stakeholder-artifacts.ts` (quarter relabel); `lib/triage.ts`, `lib/sound.ts`, `lib/ai-reco.ts`, `app/page.tsx`, `app/inbox/triage/page.tsx`, `components/CalendarPlan.tsx`, `components/AuditLog.tsx`, `components/OnboardingModal.tsx` (Route → Escalate); + the spec docs.
