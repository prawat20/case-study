# Brief 2 — Quarterly Planning & Prioritization

> An AI-native decision-orchestration workspace for product managers. Live as a working tool at [sift-pm.pages.dev](https://sift-pm.pages.dev/). Built in Claude Code as a hand-written Next.js app, deployed on Cloudflare Pages.

---

## What to read, in what order

| Order | Document / link | What it gives you |
|---|---|---|
| 1 | **[sift-pm.pages.dev](https://sift-pm.pages.dev/)** | The working tool. Best experienced on desktop (drag-and-drop is the primary input model). |
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

CS2 is a five-surface app demonstrating an opinionated end-to-end planning loop: **capture → triage → place → communicate → learn**. Now is a single-decision surface — one item in focus at a time, carrying the AI's recommended action and a "Why this" disclosure. Capture is a one-keystroke modal (`⌘N`). Triage is a Tinder-style swipe deck for bulk-clearing the queue. The Calendar is a sprint-by-sprint drag-and-drop puzzle that resolves the brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) onto a single interaction — the Drop Planner, which expands inline on over-capacity drops with per-item destination control — and anchors the quarter's North Star (Net New ARR) as a quiet line. Stakeholders ships generated per-audience artifacts (Sales gets deal-by-deal mapping, Exec gets one paragraph + 3 KPIs, Customer gets plain-language ship list, Engineering gets capacity table + dependency notes) with copy-as-Slack / copy-as-email actions. Audit closes the loop two ways — an **Activity** log that records every action against what the system recommended and flags each divergence as the recalibration signal, plus a 21-day prediction-vs-actual review. AI is **advisory, not deciding** throughout.

---

## Demo flow (8 minutes, end-to-end)

1. **Land on Now** — one decision in focus. The top untriaged item renders as a single card with its synthesis, evidence, signal · ARR · RICE, the **AI-recommended action** (✦ "AI's pick"), and a **"Why this ⌄"** disclosure for the full reasoning. A quiet date/week eyebrow sits up top (`Week 4 of 13`); text-links exit to the rest of the queue ("N more waiting") and the Calendar.

2. **Capture an ask with `⌘N`** — modal opens anywhere. Type *"Sales says SAML for Acme — 3 deals stalling"*. Auto-detected chips appear underneath (source: Sales · channel: Slack · signal: revenue). Soft pluck chime on save.

3. **The captured ask surfaces on Now** — it joins the queue of untriaged items shown one at a time. Decide it inline on the focus card, or click **Start triage** to open the full swipe deck for a bulk run.

4. **Triage flow** — Tinder-style swipe card. Card front carries everything: title, synthesis, evidence quote, signal chip + ARR + RICE score + effort, sage callout with the "If we ship —" predicted outcome, and the **AI-recommended action highlighted** (the matching Promote / Defer / Escalate pill takes the accent ✦ "AI's pick" treatment + an "✦ AI recommends" caption). Tap **Why this** (or hit Space) for full score breakdown, AI's reasoning, conflicts, trade-offs.
   - Drag right (or `→` / `P`) → **Promote**. Card tilts +12°, sage tint emerges, "PROMOTE" stamp fades in.
   - Drag left (or `←` / `D`) → **Defer**. Brick tint + "DEFER" stamp at −12°.
   - Click ↗ or press `E` → **Escalate**.
   - Velocity-aware threshold; fast flicks trigger earlier.
   - Done state: *"Inbox cleared."* with promote/escalate/defer tally and a sage CTA: **Place 3 in calendar →**

5. **Calendar = the puzzle** — placement IS the prioritization, no abstract Commit step. A quiet North Star line anchors the quarter goal ($600k of $2.4M Net New ARR · 6pp behind pace — the demo's deliberate tension).
   - **TO PLACE rail** (sage dashed) at top. Each item shows effort + RICE + AI-suggested-sprint chip.
   - **4 sprint lanes** with capacity bars (12 points each). **Sprint 1 is shipped** — dimmed, read-only, no drop target (the PM can't plan work into a sprint that already closed). Sprint 2 is in flight; Sprints 3 + 4 are planned.
   - **Drag a rail card into a sprint** = commit. If the sprint goes over capacity, the **Drop Planner** panel expands inline: each item currently in the target sprint gets a destination row (`Keep | Sprint 2 (Xp free) | Sprint 3 (Yp free) | Defer Q3`). AI's suggestion is pre-selected with a ✦ badge — every row overridable. Live trade-off summary updates per toggle.
   - **Drag any item to the DEFER tray** = pushed to next quarter.
   - **Snap as Q2 plan** only enables when the rail is empty AND no sprint is over capacity.

6. **Stakeholders** — generated audience artifacts, not filtered views. Master/detail with persistent audience rail (Sales, Exec, Customer, Eng). Pick *For Sales* → lines materialise one by one with 50ms stagger. Each artifact has **Copy as Slack** + **Copy as email**.

7. **Audit** — two tabs. **Activity** logs every action you took against what the system recommended ("You Promoted → ✦ AI recommended Defer"); divergences are highlighted as the recalibration signal, with a calibration summary and a Divergences-only filter. **Predictions** is the prediction-vs-actual loop — each committed decision logs what the AI predicted; once 21 days elapse, a "Due for review" pill appears. A mock 21-day-old SAML prediction is always seeded so the loop is visible on a fresh demo.

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
├── supporting_writeup.md              Brief's 3 written deliverables (NSM · events · interview bank) → renders to PDF
├── build/                             Markdown → A4 PDF pipeline (build_pdf_supporting.py)
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

## Rebuilding the supporting-writeup PDF

The PDF deliverable [`/CS2_Supporting_Writeup.pdf`](../CS2_Supporting_Writeup.pdf) renders from `supporting_writeup.md` via the same pipeline as the CS1 caselets:

```bash
cd build
python3 build_pdf_supporting.py    # writes supporting_writeup.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../../CS2_Supporting_Writeup.pdf" \
  "file://$(pwd)/supporting_writeup.html"
```

Dependencies: Python 3, `markdown` package (`pip install markdown`). Edit the markdown, rerun to keep the PDF in sync.

---

## Stack

Next.js 16 (App Router · static export · Turbopack) · TypeScript · Tailwind v4 · Framer Motion · cmdk · Radix UI · Lucide React · Web Audio API. **No backend.** State persists in client-side localStorage across seven scoped stores; ⌘K → Reset clears six (theme preference survives so a reviewer doesn't lose their dark-mode choice mid-demo).
