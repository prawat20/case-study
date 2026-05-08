# Case Study

> Product case study for a Director of Product application.
> An AI-native decision orchestration workspace for product managers.
> Built in Claude Code. Deployed on Cloudflare Pages.

**Live demo:** https://case-study-iud.pages.dev/
**Source:** this repo

---

## What's here

```
Case Study/
├── README.md                       ← you are here
├── docs/                           Public work artifacts
│   ├── cs2_jbtd_and_pov.md         v2 — Persona, 7 JBTDs, POV per JBTD
│   ├── cs2_design_system_v2.md     v2 — Palette, type, motion, sound
│   ├── cs2_ia_and_surfaces.md      v2 — Surface map + design intent
│   ├── cs2_product_pov.md          v1 product POV (historical)
│   ├── cs2_supporting_writeup.md   Brief deliverables — NSM + 5 events + interview bank
│   ├── cs2_wireframes.md           v1 build spec (historical)
│   ├── cs2_build_log.md            Running log — current state, iteration history
│   └── research_pm_pain_points.md  Validated PM pain research
└── quarterly-planning/             The Next.js app
    ├── app/                        Routes (Now / Inbox / Triage / Calendar / Stakeholders / Audit / Architecture / Prioritize)
    ├── components/                 UI components
    ├── data/                       Mocked initiatives + types
    └── lib/                        State stores, helpers, framework scoring, sprint-conflict math
```

---

## The thesis

> Quarterly planning is not a roadmap-management problem. It is a **context-synthesis and decision-orchestration** problem. AI-native software should compress synthesis to zero so the PM gets their thinking time back.

Read [`docs/cs2_jbtd_and_pov.md`](docs/cs2_jbtd_and_pov.md) for the persona + 7 JBTDs + POV per JBTD.
Read [`docs/cs2_design_system_v2.md`](docs/cs2_design_system_v2.md) for the visual + motion + sonic vocabulary.
Read [`docs/cs2_ia_and_surfaces.md`](docs/cs2_ia_and_surfaces.md) for the surface map.
Read [`docs/cs2_supporting_writeup.md`](docs/cs2_supporting_writeup.md) for the brief's 3 deliverables (North Star, 5 events, interview questions).
Read [`docs/cs2_build_log.md`](docs/cs2_build_log.md) for the iteration history.

---

## Demo flow (8 minutes, end-to-end)

1. **Land on Now** — North Star ($1.5M of $2.4M Net New ARR) in 48px Fraunces serif. Dual-marker progress bar shows ARR achieved against time elapsed at a glance. Three "do today" cards stacked vertically: Triage CTA · Sprint peek · Predictions due.

2. **Capture an ask with `⌘N`** — modal opens anywhere. Type *"Sales says SAML for Acme — 3 deals stalling"*. Auto-detected chips appear underneath (source: Sales · channel: Slack · signal: revenue). Soft pluck chime on save.

3. **Open Inbox** — your captured ask shows under "Just landed" with a `NEW` chip alongside pre-loaded asks (synthesized arrival metadata: time-since · source · channel). Click **Start triage**.

4. **Triage flow** — Tinder-style swipe card. The card front carries everything needed to decide fast: title, synthesis, evidence quote, signal chip + ARR + RICE score + effort, and a sage callout with the "If we ship —" predicted outcome. Tap **Why this** (or hit Space) to expand inline detail: full score breakdown, AI's reasoning, conflicts, trade-offs.
   - Drag right (or `→` / `P`) → **Promote**. Card tilts +12°, sage tint emerges, "PROMOTE" stamp fades in.
   - Drag left (or `←` / `D`) → **Defer**. Brick tint + "DEFER" stamp at -12°.
   - Click ↗ button or press `R` → **Route** (rare; "someone else owns this").
   - Velocity-aware threshold: a fast flick triggers earlier than a slow drag.
   - Done state: *"Inbox cleared."* with promote/route/defer tally and a sage CTA: **Place 3 in calendar →**

5. **Calendar = the puzzle** — placement IS the prioritization, no abstract Commit step.
   - **TO PLACE rail** at top (sage dashed) shows items waiting, each with effort points + RICE score + AI's suggested-sprint chip.
   - **4 sprint lanes** with capacity bars (12 points each). Existing items render soft-placed (dashed border) until committed; committed items get a solid border + sage check.
   - **Drag a rail card into a sprint** = commit. If the sprint goes over capacity, lower-priority items auto-reflow to the next available sprint with a quiet toast announcing the chain.
   - **Drag any item to the DEFER tray** below = pushed to next quarter. Drag back into a sprint to bring it in.
   - The AI-suggested sprint outlines softly while you're dragging ("AI suggests" pill).
   - **Snap as Q3 plan** only enables when the rail is empty AND no sprint is over capacity. Forces you to actually finish the puzzle.

6. **Stakeholders** — generated audience artifacts, not filtered views. Pick "For Sales" → lines materialize one by one with 50ms stagger. Sales gets deal-by-deal mapping with sprint dates + ARR; Exec gets one paragraph + 3 KPIs + risk flag; Customer gets plain-language ship list grouped by sprint window; Engineering gets capacity table + dependency notes. Click **Copy as Slack** or **Copy as email** — clipboard-ready.

7. **Audit → Predictions tab** — the prediction-vs-actual loop. Each committed decision logs what the AI predicted; once 21 days elapse, a "Due for review" pill appears with a free-text capture for "what was wrong" — the system recalibrates from your reasons. A mock 21-day-old SAML prediction is always seeded so the loop is visible on a fresh demo.

8. **Cmd+K** for power nav — capture, run triage, jump to any surface, generate a stakeholder artifact directly, switch theme, reset demo.

---

## How the v2 design system shows up

- **Light theme default** with optional dark via header toggle. Warm cream `#F8F5EE` page, white elevated cards, sage `#5A8F6F` as the only accent (deliberately rare — marks active item, primary CTA, confirmed decision).
- **Three font families** — Inter for 95% of UI, Fraunces serif for hero moments (NSM number, page titles, decision-lands celebration), JetBrains Mono for numerics and timestamps.
- **Resonant stark motion** — durations of 100ms / 180ms / 320ms / 720ms; ease-out for entry, ease-in for exit, spring overshoot only for celebration moments (commit chime, snap-as-plan).
- **Sound** — three Web Audio chimes tuned ~30% softer than v1 for the cream context. Capture pluck (A5), triage tones by action (G4/B4/D5), commit two-tone (D5+A5), snap three-note resolving chord. User-mutable.

Full system documented in [`docs/cs2_design_system_v2.md`](docs/cs2_design_system_v2.md).

---

## Running locally

```bash
cd quarterly-planning
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Deployment

Cloudflare Pages, static export.

```bash
cd quarterly-planning
npm run build
npx wrangler pages deploy out --project-name=case-study --branch=main --commit-dirty=true
```

Build output: `quarterly-planning/out`.

---

## Stack

- **Next.js 16** (App Router, static export, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (CSS-first config, theme via `@theme inline`)
- **Framer Motion** for motion + drag (Tinder swipe + calendar drag)
- **cmdk** for the command palette
- **Radix UI** primitives for accessible components
- **Lucide React** for icons (single 1.5px stroke weight)
- **Web Audio API** for synthesized chimes (no audio assets shipped)

No backend. State persists in client-side `localStorage` (7 stores, all reset by Cmd+K → Reset). The brief explicitly assumes ingestion is solved upstream — this build covers the post-ingestion slice (capture → triage → place → communicate → learn).

---

## What's deliberately not here

- No real auth, no real data ingestion, no real backend
- No mobile responsive (desktop-only by design — drag-and-drop primary input)
- No standalone AI chat panel (anti-pattern per the design rubric)
- No exports (skipped per the brief)
- No multi-column tables anywhere — all layouts single-column or vertical (per the rubric)
- No abstract "Commit" button on Calendar — placement IS the commit (per JBTD-4)
