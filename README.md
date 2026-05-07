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
├── README.md                    ← you are here
├── docs/                        Public work artifacts
│   ├── cs2_product_pov.md       Product point of view (locked)
│   ├── cs2_wireframes.md        Screen-by-screen build spec
│   ├── cs2_build_log.md         Running log — current state, deviations from spec
│   └── research_pm_pain_points.md   Validated PM pain research
└── quarterly-planning/          The Next.js app
    ├── app/                     Routes
    ├── components/              UI components
    ├── data/                    Mocked initiatives
    └── lib/                     Types, helpers, decision persistence
```

---

## The thesis

> Quarterly planning is not a roadmap-management problem. It is a **context-synthesis and decision-orchestration** problem. AI-native software should compress synthesis to zero so the PM gets their thinking time back.

Read [`docs/cs2_product_pov.md`](docs/cs2_product_pov.md) for the full POV.
Read [`docs/research_pm_pain_points.md`](docs/research_pm_pain_points.md) for validated PM pain research.
Read [`docs/cs2_wireframes.md`](docs/cs2_wireframes.md) for the build spec.
Read [`docs/cs2_build_log.md`](docs/cs2_build_log.md) for the current build state and demo flow.

---

## Demo flow (15 minutes, end-to-end)

1. **Land on the home page** — Strategic Banner shows the Q3 North Star (Net New ARR) with two progress bars: ARR achieved + Quarter elapsed. Click to expand for the 3 OKRs.
2. **Four decisions ordered by urgency** — each with its AI-recommended action label (Commit / Defer / Escalate) and OKR alignment chip.
3. **Click into Bulk CSV import** — full-screen Initiative Detail. Read the AI's narrated rationale at the top, scan the evidence chips (click to see source quotes), see the recommendation card lead with "Commit" + reason.
4. **Press `↵`** — two-tone Web Audio chime, recommendation card pulses, toast confirms, auto-navigates back. Card is gone from the stream.
5. **Open SOC2 audit log** — AI recommends "Escalate." Press `↵` and the panel opens with the definition of Escalate, AI-suggested stakeholders (exec, eng), and a pre-drafted message you can edit.
6. **Open Webhook Retries** — AI recommends "Defer to Q4." Press `C` (Commit) instead — inline override prompt: *"Choosing Commit instead of AI's Defer. Why?"* — type a reason, hit `↵`. Decision logged as override.
7. **Open the next item** — sparkle cue at top: *"Noting your last override: you flagged 'X' — applying that here."*
8. **Visit `/audit/`** — every decision logged with AI rec → your action → your reason → mocked system note.
9. **Visit `/quarter/`** — committed items as green dots, deferred as muted, your overrides labeled. Toggle the audience render: All / Exec / Eng / Sales / CS — same data, completely different framing per audience.
10. **Visit `/architecture/`** — six-layer system diagram with feedback-loop annotation.
11. **`Cmd+K` anywhere** — fuzzy command palette. Search initiatives, jump to audience renders, audit log, architecture. `Cmd+K → reset` clears the session.

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
