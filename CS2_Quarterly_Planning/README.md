# Brief 2 — Quarterly Planning & Prioritization

> An AI-native decision-orchestration workspace for product managers. Live as a working tool at [case-study-iud.pages.dev](https://case-study-iud.pages.dev/). Built in Claude Code as a hand-written Next.js app, deployed on Cloudflare Pages.

---

## What to read, in what order

| Order | Document / link | What it gives you |
|---|---|---|
| 1 | **[case-study-iud.pages.dev](https://case-study-iud.pages.dev/)** | The working tool. Best experienced on desktop (drag-and-drop is the primary input model). |
| 2 | **[`approach.md`](approach.md)** | How CS2 was approached — reading the brief, research method, synthesis framework (JBTDs + POVs), decision framework (NSM + events + interview bank), build/deliver method. One read covers the full methodology. |
| 3 | **[`supporting_writeup.md`](supporting_writeup.md)** | The brief's three written deliverables — North Star metric, five events to instrument, PM interview question bank. |
| 4 | [`product_pov.md`](product_pov.md) | Persona (Maya), seven JBTDs, POV-per-JBTD design rubric, North Star principle. Upstream of every design move in the build. |
| 5 | [`design_system.md`](design_system.md) | The visual, motion, and sonic vocabulary the build runs on — palette, typography, spacing, motion, sound, accessibility. |
| 6 | [`ia_and_surfaces.md`](ia_and_surfaces.md) | The five-surface map and per-surface design intent. The Calendar Drop Planner pattern is documented here. |
| 7 | [`methodology_trace.md`](methodology_trace.md) | The longer process record — POV-first sequencing, engine choices, validated process lessons. |
| 8 | [`research/pm_pain_points.md`](research/pm_pain_points.md) | The pain-points synthesis upstream of the product POV. Six-stage workflow synthesis, framework biases, tool-landscape gap. |
| 9 | [`/quarterly-planning/`](../quarterly-planning/) | The Next.js source code. |

---

## The deliverable in one paragraph

CS2 is a five-surface app demonstrating an opinionated end-to-end planning loop: **capture → triage → place → communicate → learn**. The Now home aggregates the loop with an NSM hero and inline triage rows. Capture is a one-keystroke modal (`⌘N`). Triage is a Tinder-style swipe deck. The Calendar is a sprint-by-sprint drag-and-drop puzzle that resolves the brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) onto a single interaction — the Drop Planner, which expands inline on over-capacity drops with per-item destination control. Stakeholders ships generated per-audience artifacts (Sales gets deal-by-deal mapping, Exec gets one paragraph + 3 KPIs, Customer gets plain-language ship list, Engineering gets capacity table + dependency notes) with copy-as-Slack / copy-as-email actions. Audit closes the loop with a 21-day prediction-vs-actual review. AI is **advisory, not deciding** throughout.

---

## Demo flow (8 minutes, end-to-end)

1. **Land on Now** — North Star ($1.5M of $2.4M Net New ARR) in 48px Fraunces serif. Dual-marker progress bar shows ARR achieved against time elapsed. Three "do today" cards stacked: Triage CTA · Sprint peek · Predictions due.

2. **Capture an ask with `⌘N`** — modal opens anywhere. Type *"Sales says SAML for Acme — 3 deals stalling"*. Auto-detected chips appear underneath (source: Sales · channel: Slack · signal: revenue). Soft pluck chime on save.

3. **Open Inbox (inline on Now)** — captured ask shows under "Just landed" with a `NEW` chip alongside pre-loaded asks. Click **Start triage**.

4. **Triage flow** — Tinder-style swipe card. Card front carries everything: title, synthesis, evidence quote, signal chip + ARR + RICE score + effort, sage callout with the "If we ship —" predicted outcome. Tap **Why this** (or hit Space) for full score breakdown, AI's reasoning, conflicts, trade-offs.
   - Drag right (or `→` / `P`) → **Promote**. Card tilts +12°, sage tint emerges, "PROMOTE" stamp fades in.
   - Drag left (or `←` / `D`) → **Defer**. Brick tint + "DEFER" stamp at −12°.
   - Click ↗ or press `R` → **Route**.
   - Velocity-aware threshold; fast flicks trigger earlier.
   - Done state: *"Inbox cleared."* with promote/route/defer tally and a sage CTA: **Place 3 in calendar →**

5. **Calendar = the puzzle** — placement IS the prioritization, no abstract Commit step.
   - **TO PLACE rail** (sage dashed) at top. Each item shows effort + RICE + AI-suggested-sprint chip.
   - **4 sprint lanes** with capacity bars (12 points each).
   - **Drag a rail card into a sprint** = commit. If the sprint goes over capacity, the **Drop Planner** panel expands inline: each item currently in the target sprint gets a destination row (`Keep | Sprint 1 (Xp free) | Sprint 3 (Yp free) | Defer Q4`). AI's suggestion is pre-selected with a ✦ badge — every row overridable. Live trade-off summary updates per toggle.
   - **Drag any item to the DEFER tray** = pushed to next quarter.
   - **Snap as Q3 plan** only enables when the rail is empty AND no sprint is over capacity.

6. **Stakeholders** — generated audience artifacts, not filtered views. Master/detail with persistent audience rail (Sales, Exec, Customer, Eng). Pick *For Sales* → lines materialise one by one with 50ms stagger. Each artifact has **Copy as Slack** + **Copy as email**.

7. **Audit → Predictions tab** — the prediction-vs-actual loop. Each committed decision logs what the AI predicted; once 21 days elapse, a "Due for review" pill appears. A mock 21-day-old SAML prediction is always seeded so the loop is visible on a fresh demo.

8. **⌘K** for power nav — capture, run triage, jump to any surface, generate a stakeholder artifact, switch theme, reset demo.

---

## File map

```
CS2_Quarterly_Planning/
├── README.md                          ← you are here
├── approach.md                        Methodology summary
├── methodology_trace.md               Longer process record
├── product_pov.md                     Persona · 7 JBTDs · POV per JBTD · NSM principle
├── design_system.md                   Palette · type · spacing · motion · sound
├── ia_and_surfaces.md                 Five-surface map · route table · Drop Planner spec
├── supporting_writeup.md              Brief's 3 written deliverables (NSM · events · interview bank)
└── research/
    └── pm_pain_points.md              Six-stage workflow synthesis · tool-landscape gap
```

The Next.js source code lives one level up at [`/quarterly-planning/`](../quarterly-planning/).

---

## Running locally

```bash
cd ../quarterly-planning
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Stack

Next.js 16 (App Router · static export · Turbopack) · TypeScript · Tailwind v4 · Framer Motion · cmdk · Radix UI · Lucide React · Web Audio API. **No backend.** State persists in client-side localStorage across seven scoped stores; ⌘K → Reset clears six (theme preference survives so a reviewer doesn't lose their dark-mode choice mid-demo).
