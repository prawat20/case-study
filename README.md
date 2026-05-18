# Case Study

> Two product case studies for a Director of Product application.
> **CS1** (Growth Hacking) is a written submission — Caselet 1 Revolut Primacy + Caselet 2 Plottwyst pitch.
> **CS2** (Quarterly Planning) is an AI-native decision orchestration workspace for product managers, built in Claude Code and deployed on Cloudflare Pages.

**CS2 live demo:** https://case-study-iud.pages.dev/
**CS1 Caselet 2 live deck:** https://plottwyst.app/deck/momentum
**Source:** this repo

---

## What's here

```
Case Study/
├── README.md                              ← you are here
├── CS1_Caselet1_Revolut_Primacy.pdf       Caselet 1 submission (28-page print-ready)
├── CS1_Caselet2_Plottwyst.pdf             Caselet 2 submission (13-page print-ready)
├── docs/                                  Public work artifacts
│   │
│   │   ── CS1 (Growth Hacking) ──
│   ├── cs1_revolut_research.md            Caselet 1 · Stage 1 — desk research with Reddit primary source
│   ├── cs1_revolut_painkiller_vitamin.md  Caselet 1 · Stage 2 — 5×5 macro synthesis + PLG actionability filter
│   ├── cs1_revolut_ideation.md            Caselet 1 · Stage 3 — 17 ideas, 4-axis scoring, narrowed to 2
│   ├── cs1_caselet1_revolut.md            Caselet 1 · Stage 4 — Revolut Primacy submission (source)
│   ├── cs1_caselet2_stage_a_personas.md   Caselet 2 · Stage A — two personas + problem distillation
│   ├── cs1_caselet2_stage_b_proposition_mvp.md  Caselet 2 · Stage B — proposition + MVP + revenue + TAM drafts
│   ├── cs1_caselet2_plottwyst.md          Caselet 2 · Plottwyst pitch submission (source)
│   ├── cs1_build_log.md                   Running log — what was built and why
│   ├── _build_pdf.py                      Markdown → polished HTML → A4 PDF (Caselet 1)
│   ├── _build_pdf_caselet2.py             Markdown → polished HTML → A4 PDF (Caselet 2)
│   │
│   │   ── CS2 (Quarterly Planning) ──
│   ├── cs2_jbtd_and_pov.md                v2 — Persona, 7 JBTDs, POV per JBTD
│   ├── cs2_design_system_v2.md            v2 — Palette, type, motion, sound
│   ├── cs2_ia_and_surfaces.md             v2 — Surface map + design intent
│   ├── cs2_product_pov.md                 v1 product POV (historical)
│   ├── cs2_supporting_writeup.md          Brief deliverables — NSM + 5 events + interview bank
│   ├── cs2_wireframes.md                  v1 build spec (historical)
│   ├── cs2_build_log.md                   Running log — current state, iteration history
│   └── research_pm_pain_points.md         CS2 — Validated PM pain research
│
└── quarterly-planning/                    The Next.js app (CS2)
    ├── app/                               Routes (Now / Inbox / Triage / Calendar / Stakeholders / Audit / Architecture / Prioritize)
    ├── components/                        UI components (incl. Drop Planner, Cluster Chip)
    ├── data/                              Mocked initiatives + types
    └── lib/                               State stores, helpers, framework scoring, sprint-conflict math
```

---

## CS1 status (2026-05-19)

- **Caselet 1 (Revolut Primacy) — shipped as a 31-page print-ready PDF (v2).** Source at [`docs/cs1_caselet1_revolut.md`](docs/cs1_caselet1_revolut.md), structured verbatim per brief. Built via 4-stage research-first discipline: research → macro synthesis → ideation+scoring → submission. Markdown→PDF pipeline at [`docs/_build_pdf.py`](docs/_build_pdf.py), 14 high-fidelity HTML phone mockups, inline-SVG icon set, section-level TL;DR callouts. Rendered deliverable: [`CS1_Caselet1_Revolut_Primacy.pdf`](CS1_Caselet1_Revolut_Primacy.pdf).
- Two ideas picked: **Confidence Period** (Open-Banking parallel-run + auto-mirror + **Live Clearance** reassurance layer — push, migration de-risk; ~3-month build, UX-only, no licensing surface) and **Locked Insights** (data-envy-driven salary-aware intelligence on existing Revolut Analytics — pull, only-on-primary value; ~2-3-month build). Push-pull pair targeting C3+C4 cohorts. Both ideas ship inside a quarter — growth-hacking discipline maintained.
- Conservative impact model: **7-9pp UK primacy lift Year 1.** UK-anchored — geographic scope explicit (CEE/EU markets carry structural barriers PLG alone can't solve; employer-side payroll restrictions + salary-gated bundles at local banks; documented in §1 P3 + P4).
- **v2 changes vs v1** (2026-05-19): stripped Salary Guarantee from Idea 1 (was a lending product — out of growth-hacking scope) and replaced with three UX-only reassurance mechanics (real-time "Salary cleared in N min" push, 24h pre-payday confidence reminder, public historical AML-clearance stats card on profile); expanded P3 + P4 with CEE structural barriers triggered by a Czech-Republic primary-source signal during ideation; revised Idea 2 build estimate downward (existing Revolut Analytics already provides the data backbone); added explicit geographic-scope statement. Full v2 rationale in [`docs/cs1_build_log.md`](docs/cs1_build_log.md).
- **Caselet 2 (Plottwyst pitch) — shipped as a 13-page PDF (2026-05-18).** Source at [`docs/cs1_caselet2_plottwyst.md`](docs/cs1_caselet2_plottwyst.md). Brief sections 1:1: Persona+Problem · Proposition · MVP · Revenue · TAM. §1 splits into two personas — **Multiplayer Host** (friend-group + corporate event organisers) and **Daily Puzzle Player** (Wordle-shaped) — each with their own problem list, closed by a "why two personas, not one" bridge into the platform thesis. TL;DR callouts on §1/§2/§4 per Caselet 1 convention. Build script ([`docs/_build_pdf_caselet2.py`](docs/_build_pdf_caselet2.py)) reuses the Caselet 1 pipeline with cover + footer + title swapped. Rendered deliverable: [`CS1_Caselet2_Plottwyst.pdf`](CS1_Caselet2_Plottwyst.pdf).
- **Caselet 2 also ships as a live applicant-aligned slug deck at [plottwyst.app/deck/momentum](https://plottwyst.app/deck/momentum)** — 9 brief-aligned slides (Cover → Persona+Problem → Proposition → MVP → Engine → TAM → Live Today → Revenue → Appendix), built as a filtered subset of the Plottwyst investor deck via an `IS_MOMENTUM` conditional in the deck source. Same engine claim, applicant-framing footer.

---

## CS2 status (2026-05-12 — v3.3 deployed)

CS2 v3 is live at `case-study-iud.pages.dev`. Three flow moves applied on top of the v2 redesign:

- **Surface consolidation.** Now + Inbox merged into a single home surface. Top nav reduced from 5 → 4 items. Inbox rows render inline under the NSM hero with `Start triage →` CTA + visible keyboard hints. `/inbox/` kept as a transparent redirect.
- **Calendar = puzzle.** Drag-to-full-sprint now reveals a live capacity preview + 3-strategy AI trade-off panel (Minimise score loss · Minimise deadline risk · Defer to next quarter) before commit. Each strategy is a drop target with its own rationale + score impact. Reflowed items animate between sprints via Framer Motion `layoutId` shared transitions.
- **Stakeholders master/detail.** Hub replaced with a master/detail layout — persistent left rail (4 audience cards) + right pane with materialize stagger re-firing on every audience switch. URL syncs via `?audience=` query. Legacy `/stakeholders/[audience]/` deep-links redirect to the unified URL.

See [`docs/cs2_build_log.md`](docs/cs2_build_log.md) `Round 9` for the full implementation log + click-count delta. Source-of-truth IA at [`docs/cs2_ia_and_surfaces.md`](docs/cs2_ia_and_surfaces.md) (v3 delta preamble at top).

**Repo state (2026-05-18).** All four CS deliverables now public on GitHub: **CS2** (`954468b`) · **CS1 Caselet 1** (`76cf8ff` + `42f685b` box-shadow fix + `357203f` TL;DR callouts) · **CS1 Caselet 2** (`f3e7ea5` — submission markdown + 13-page PDF + build script). The live applicant-aligned slug deck at `plottwyst.app/deck/momentum` is hosted on a separate repo (`plottwyst-website`) not included here. `_private/` (interview briefs) stays gitignored.

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
