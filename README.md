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
│   ├── cs2_product_pov.md          Product point of view (locked)
│   ├── cs2_supporting_writeup.md   The 3 brief deliverables: NSM + 5 events + interview Qs
│   ├── cs2_wireframes.md           Screen-by-screen build spec (historical)
│   ├── cs2_build_log.md            Running log — current state, iteration history
│   └── research_pm_pain_points.md  Validated PM pain research
└── quarterly-planning/             The Next.js app
    ├── app/                     Routes
    ├── components/              UI components
    ├── data/                    Mocked initiatives
    └── lib/                     Types, helpers, decision persistence
```

---

## The thesis

> Quarterly planning is not a roadmap-management problem. It is a **context-synthesis and decision-orchestration** problem. AI-native software should compress synthesis to zero so the PM gets their thinking time back.

Read [`docs/cs2_product_pov.md`](docs/cs2_product_pov.md) for the full POV.
Read [`docs/cs2_supporting_writeup.md`](docs/cs2_supporting_writeup.md) for the brief's 3 deliverables (North Star, 5 events, interview questions).
Read [`docs/research_pm_pain_points.md`](docs/research_pm_pain_points.md) for validated PM pain research.
Read [`docs/cs2_wireframes.md`](docs/cs2_wireframes.md) for the original build spec.
Read [`docs/cs2_build_log.md`](docs/cs2_build_log.md) for the current build state and demo flow.

---

## Demo flow (15 minutes, end-to-end)

1. **Land on the home page** — Strategic Banner: Q3 North Star (Net New ARR) with two progress bars (ARR achieved + Quarter elapsed) and a pace-gap label. Below it, the **SignalShifts banner**: *"engine noticed 2 priority signals overnight"* — click to expand the per-item shift detail.
2. **Four decisions ordered by urgency** — each with its AI-recommended action label (Commit / Defer / Escalate) and OKR alignment chip.
3. **Click into Bulk CSV import** — full-screen Initiative Detail. Read the AI's narrated rationale at the top. Scan evidence chips (click for source quotes). The recommendation card leads with "Commit", followed by reasoning, OKR contribution, **framework chip** ("RICE — hover for AI's rationale"), and **predicted outcome** inline. Audit log link top-right.
4. **Press `↵`** — two-tone chime, recommendation card pulses, **mini card flies to top-right corner with fade-out**, toast confirms, auto-navigates back. Card is gone from the stream.
5. **Open SOC2 audit log** — AI recommends "Escalate" (Strategic Bet framework). Press `↵` — escalate panel opens with the definition of Escalate, AI-suggested stakeholders (exec, eng), and a pre-drafted message you can edit.
6. **Open Webhook Retries** — AI recommends "Defer to Q4" (Value/Effort framework). Press `C` instead — inline override prompt: *"Choosing Commit instead of AI's Defer. Why?"* — type a reason, hit `↵`.
7. **Open the next item** — sparkle cue at top: *"Noting your last override: you flagged 'X' — applying that here."*
8. **Visit `/audit/`** — every decision shows AI rec → your action → reason → **predicted outcome** → mocked system note.
9. **Visit `/quarter/`** — committed items as green dots, deferred as muted, overrides labelled. Toggle audience: All / Exec / Eng / Sales / CS — same data, completely different framing.
10. **Drag an item** between sprints in the All view — drop target lights up, AI ripple toast on drop: *"Moved X. Pushes 1 dependent item by 2 weeks. Confirm or revert?"*
11. **Click "Ship to [Audience]"** — three-note resolving chord, markdown copied to clipboard, confirmation toast. Or **"Snap as Q3 plan"** on All view to lock the plan.
12. **Visit `/architecture/`** — six-layer system diagram with feedback-loop annotation.
13. **`Cmd+K` anywhere** — fuzzy command palette. Search initiatives, jump to audience renders, audit log, architecture. `Cmd+K → reset` clears the session.

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
- **Tailwind CSS v4** (CSS-first config)
- **Framer Motion** for motion choreography
- **cmdk** for the command palette
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Web Audio API** for synthesized commit/defer chimes (no audio assets shipped)

No backend. State persists in client-side `localStorage`. The brief explicitly assumes ingestion is solved upstream — this build covers the post-ingestion slice (organize → score → plan → communicate).

---

## What's deliberately not here

- No real auth, no real data ingestion, no real backend
- No mobile responsive (desktop-only by design)
- No standalone AI chat panel (anti-pattern per the product POV)
- No exports (skipped per the brief)
- No multi-column tables anywhere — all layouts are single-column or vertical (per the design rubric)
