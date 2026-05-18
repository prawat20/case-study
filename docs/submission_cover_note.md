# Submission cover note — draft

> Email Pravesh sends to Bhavin / Momentum to submit the case studies. Plain prose; specific links in order. Substitutes the GitHub repo + build log for the missing "vibe coding tool project link" head-on, not silently.

---

## Subject line options

- **Case Study submission · Pravesh Rawat** *(lean — neutral and unambiguous)*
- Director of Product · Case Study submission · Pravesh Rawat
- Plottwyst + Quarterly Planning · Case Study submission

---

## Body

---

Hi [Bhavin / first name],

Case study submission for the Director of Product role at Momentum. Three deliverables across the two briefs, all public on GitHub:

**Brief 1 · Growth Hacking**

- **Caselet 1 — Revolut Primacy** · 28-page print-ready PDF · [`CS1_Caselet1_Revolut_Primacy.pdf`](https://github.com/prawat20/case-study/blob/main/CS1_Caselet1_Revolut_Primacy.pdf)
  Push-pull pair (Confidence Period + Locked Insights) sized for a conservative 8–10pp UK primacy lift in Year 1. Built via a 4-stage research-first process — research → macro synthesis → ideation+scoring → submission — with Reddit primary sources synthesised across 17 threads.
- **Caselet 2 — Plottwyst pitch** · 13-page print-ready PDF · [`CS1_Caselet2_Plottwyst.pdf`](https://github.com/prawat20/case-study/blob/main/CS1_Caselet2_Plottwyst.pdf)
  Brief-aligned five-section pitch (Persona+Problem · Proposition · MVP · Revenue · TAM). §1 splits into two personas — Multiplayer Host and Daily Puzzle Player — each with its own problem list. Also lives as an applicant-aligned live deck at **[plottwyst.app/deck/momentum](https://plottwyst.app/deck/momentum)** (9 slides, a filtered subset of the Plottwyst investor deck).
  Plottwyst itself is a live product I built — `play.plottwyst.app` runs on Discord + web today, with 297 unique cases generated and zero paid acquisition. The engine + traction claims in Caselet 2 are derived from the deployed system, not projected.

**Brief 2 · Quarterly Planning & Prioritization**

- **Working tool** · [case-study-iud.pages.dev](https://case-study-iud.pages.dev/) (CS2 v3.3 — desktop primary input is drag-and-drop)
- **Supporting writeup** (North Star metric · 5 events to instrument · PM interview question bank) · [`docs/cs2_supporting_writeup.md`](https://github.com/prawat20/case-study/blob/main/docs/cs2_supporting_writeup.md)
- **Iteration history** (every round, every decision, every lesson) · [`docs/cs2_build_log.md`](https://github.com/prawat20/case-study/blob/main/docs/cs2_build_log.md)
- **Source** · [`quarterly-planning/`](https://github.com/prawat20/case-study/tree/main/quarterly-planning) (Next.js · TypeScript · Tailwind · Framer Motion · static export to Cloudflare Pages)

A note on the brief's "vibe coding tool project link" ask: CS2 was built in Claude Code as a hand-written Next.js app rather than in Lovable/Vercel/Figma Make/Replit/Bolt/Emergent. The GitHub repo + the build log at `docs/cs2_build_log.md` are the equivalent process trace — and arguably a higher-fidelity record than any of those tools would have captured, because the log narrates the *why* at each round (POV gap closure, two-step Drop Planner pattern, AI-as-advisor vs AI-as-actor, etc.) alongside the *what*.

The product POV is in [`docs/cs2_jbtd_and_pov.md`](https://github.com/prawat20/case-study/blob/main/docs/cs2_jbtd_and_pov.md) — persona, seven JBTDs, and the operating thesis (quarterly planning is a context-synthesis and decision-orchestration problem, not a roadmap-management one).

Happy to walk through any of the artefacts or the thinking behind them whenever suits.

Best,
Pravesh
Founder, Plottwyst

---

## Cover-note design notes

- **Lede first.** "Case study submission for the Director of Product role" — no preamble, no self-introduction (the LinkedIn / application already covers that).
- **One link per artefact, ordered.** Reviewers shouldn't have to hunt. Three top-level deliverables, sub-bulleted under each brief.
- **Vibe-coding-tool gap handled head-on.** Single paragraph, no apology, anchored on the *build log* being higher-fidelity than any of the listed tools would have shown. This is the strongest framing because (a) it's true (build log narrates *why* at every round), (b) it acknowledges the missing artefact without grovelling, and (c) it gives the reviewer something concrete to read instead.
- **Plottwyst credibility anchored in product, not in claims.** "Plottwyst itself is a live product I built — 297 unique cases generated, zero paid acquisition" — operational anchor, not pitch language. Same pattern as the AIFF Round 2 reply.
- **Close is light.** No CTA push, no "looking forward to hearing from you" — just availability. Bhavin respects builders; the artefacts are the pitch.

---

## Pre-send checklist

- [ ] Personalise greeting (`Hi [Bhavin / first name]`)
- [ ] Verify all four GitHub URLs return 200 (PDFs render in-browser on GitHub)
- [ ] Verify `case-study-iud.pages.dev` is up
- [ ] Verify `plottwyst.app/deck/momentum` is up (refreshed in this session 2026-05-18)
- [ ] Plottwyst figures still accurate at send time (`docs/cs1_caselet2_plottwyst.md` data-vintage section says 2026-05-11 anchor — fine for May 2026 send)
- [ ] Subject line picked
- [ ] Sender signature has the right firm / role for the moment (Plottwyst founder is the durable anchor)
