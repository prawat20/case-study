# Case Study

> Product case study for a Director of Product application.
> Built in Claude Code. Deployed to Cloudflare Pages.

## What's here

This repo contains both the product thinking and the working build for a quarterly planning and prioritization tool — designed as an **AI-native decision orchestration workspace** for product managers.

```
docs/
  cs2_product_pov.md          The product point of view (locked)
  cs2_wireframes.md           Screen-by-screen build spec
  research_pm_pain_points.md  Validated PM pain research

quarterly-planning/           The buildable Next.js app
```

## The thesis

> Quarterly planning is not a roadmap-management problem. It is a **context-synthesis and decision-orchestration** problem. AI-native software should compress synthesis to zero so the PM gets their thinking time back.

Read [`docs/cs2_product_pov.md`](docs/cs2_product_pov.md) for the full POV. Read [`docs/cs2_wireframes.md`](docs/cs2_wireframes.md) for the build spec. Read [`docs/research_pm_pain_points.md`](docs/research_pm_pain_points.md) for the validated pain research.

## Running locally

```bash
cd quarterly-planning
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Cloudflare Pages, static export. Build command: `cd quarterly-planning && npm install && npm run build`. Output: `quarterly-planning/out`.

## Stack

- Next.js 14 (App Router, static export)
- TypeScript
- Tailwind CSS
- Framer Motion (motion choreography)
- cmdk (command palette)
- Radix UI primitives (accessible dialogs, dropdowns)
- Lucide React (icons)

No backend. State lives in client-side React state + JSON fixtures. The brief explicitly assumes ingestion is solved upstream.
