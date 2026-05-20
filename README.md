# Case Study Submission · Pravesh Rawat

> Two product case studies for the Director of Product role at Momentum. Three deliverables across two briefs: a Growth Hacking submission (two caselets, both as print-ready PDFs) and a Quarterly Planning submission (a working AI-native tool with a written supporting writeup).

---

## Submission at a glance

| Brief | Deliverable | Format | Open |
|---|---|---|---|
| Brief 1 · Growth Hacking | **Caselet 1 — Revolut Primacy** | 31-page A4 PDF | [`/CS1_Caselet1_Revolut_Primacy.pdf`](CS1_Caselet1_Revolut_Primacy.pdf) |
| Brief 1 · Growth Hacking | **Caselet 2 — Plottwyst pitch** | 13-page A4 PDF | [`/CS1_Caselet2_Plottwyst.pdf`](CS1_Caselet2_Plottwyst.pdf) |
| Brief 2 · Quarterly Planning | **Working tool** | Next.js app (Cloudflare Pages) | [sift-pm.pages.dev](https://sift-pm.pages.dev/) |
| Brief 2 · Quarterly Planning | **Supporting writeup** (NSM · 5 events · interview bank) | Markdown | [`CS2_Quarterly_Planning/supporting_writeup.md`](CS2_Quarterly_Planning/supporting_writeup.md) |

---

## How to navigate this repo

This repo is organised as two case-study folders, each self-contained. The submission deliverables sit at the top level; the supporting work lives inside each brief's folder.

### If you want to read the submissions only

Open the three deliverables in the table above. The PDFs and the live tool are the submission.

### If you want to understand the methodology

Each brief has an `approach.md` — a one-read summary of how the deliverable was produced (reading the brief, research method, synthesis framework, decision framework, deliverable design).

| Brief | Approach document |
|---|---|
| Brief 1 — Growth Hacking | [`CS1_Growth_Hacking/approach.md`](CS1_Growth_Hacking/approach.md) |
| Brief 2 — Quarterly Planning | [`CS2_Quarterly_Planning/approach.md`](CS2_Quarterly_Planning/approach.md) |

### If you want to stress-test specific claims

Each brief's folder has its own README that lists every supporting artifact and the order to read them in.

| Brief | Folder README |
|---|---|
| Brief 1 — Growth Hacking | [`CS1_Growth_Hacking/README.md`](CS1_Growth_Hacking/README.md) |
| Brief 2 — Quarterly Planning | [`CS2_Quarterly_Planning/README.md`](CS2_Quarterly_Planning/README.md) |

Both READMEs include a file map and the rebuild / run-locally commands.

---

## Folder structure

```
Case Study/
├── README.md                              ← you are here · top-level navigation
│
├── CS1_Caselet1_Revolut_Primacy.pdf       Brief 1, Caselet 1 — final deliverable
├── CS1_Caselet2_Plottwyst.pdf             Brief 1, Caselet 2 — final deliverable
│
├── CS1_Growth_Hacking/                    Brief 1 working tree
│   ├── README.md                          What's in this folder, in what order
│   ├── approach.md                        Methodology summary (both caselets)
│   ├── methodology_trace.md               Longer process record
│   ├── caselet1_revolut_primacy.md        Caselet 1 source (renders to PDF)
│   ├── caselet2_plottwyst.md              Caselet 2 source (renders to PDF)
│   ├── build/                             Markdown → A4 PDF pipeline + intermediates
│   └── research/                          Stage-by-stage research, synthesis, ideation
│
├── CS2_Quarterly_Planning/                Brief 2 working tree
│   ├── README.md                          What's in this folder, in what order
│   ├── approach.md                        Methodology summary
│   ├── methodology_trace.md               Longer process record
│   ├── product_pov.md                     Persona · 7 JBTDs · POV per JBTD
│   ├── design_system.md                   Palette · type · spacing · motion · sound
│   ├── ia_and_surfaces.md                 Surface map · routes · Drop Planner spec
│   ├── supporting_writeup.md              Brief's 3 written deliverables
│   └── research/                          PM pain-points research
│
└── quarterly-planning/                    The Next.js source code for the CS2 tool
    ├── app/                               Routes (Now · Calendar · Stakeholders · Audit · Architecture · Prioritize)
    ├── components/                        UI components (incl. Drop Planner, Cluster Chip)
    ├── data/                              Mocked initiatives + types
    └── lib/                               State stores · framework scoring · sprint-conflict engine
```

---

## What each submission delivers, in one paragraph

**Caselet 1 — Revolut Primacy.** A push-pull pair of growth-hacking ideas, sized for a conservative **7–9pp UK primacy lift in Year 1**. *Confidence Period* (3-salary-cycle Open-Banking parallel-run + auto-mirror + Live Clearance reassurance layer) attacks the perceived-operational-risk + switching-friction pains. *Locked Insights* (visible-but-locked salary-aware intelligence built on existing Revolut Analytics) attacks the primacy-hostile-surface pain and the salary-aware-vitamin mistarget. Both ideas ship inside a quarter — UX-only, no new financial product, no licensing surface. Built via a 4-stage research-first process with Reddit primary sources (17 threads, ~1,000 comments) and an explicit UK-only geographic scope (CEE structural barriers documented as out-of-growth-hacking-scope).

**Caselet 2 — Plottwyst pitch.** A brief-aligned five-section pitch for the narrative-game platform I built (`play.plottwyst.app`, live on Discord + web today). §1 splits into two personas — Multiplayer Host and Daily Puzzle Player — each with its own problem list. Engine and traction claims (297 cases generated, 467 games played, 94% generation success, 30+ countries, 14 Discord servers, 1-in-4 return rate) are derived from the deployed system, not projected.

**Brief 2 — Quarterly Planning.** A working AI-native decision-orchestration workspace for PMs. Five surfaces, one loop: capture → triage → place → communicate → learn. The Calendar's **Drop Planner** pattern resolves the brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) onto a single interaction — drop on an over-capacity sprint, the planner expands inline with per-item destination control, AI suggests but the PM decides. **AI is advisory, not deciding** throughout. Live at [sift-pm.pages.dev](https://sift-pm.pages.dev/); supporting writeup ships the North Star metric, five instrumented events, and a 21-question PM interview validation bank.

---

## Stack (CS2)

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · cmdk · Radix UI · Lucide React · Web Audio API. Static export to Cloudflare Pages. No backend; state persists in client-side localStorage. See [`CS2_Quarterly_Planning/README.md`](CS2_Quarterly_Planning/README.md) for the full demo flow and run-locally commands.

---

## Contact

Pravesh Rawat · `pravesh.rawat89@gmail.com` · 
