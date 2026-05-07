# Quarterly Planning — Product POV

> Case Study 2 — Director of Product / Momentum
> Working title: TBD (avoiding "Pulse" — too close to Momentum's own product family)
> Status: locked POV 2026-05-07; informs the build, the supporting writeup, and the build prompt for the vibe-coding tool.

---

## TL;DR

Quarterly planning is not a roadmap-management problem. It is a **context-synthesis and decision-orchestration** problem.

This product is an AI-native decision orchestration workspace for product organizations. It continuously synthesizes organizational context, surfaces a calm stream of decisions the PM needs to make, and lets the PM decide in seconds rather than synthesize for days. The quarterly plan is the artifact, not the cadence — the system thinks every day, the org consumes a quarterly snapshot.

This is not a Jira replacement. It is not a feature-request tracker. It is not a static roadmap tool. It is the **antithesis** of every existing prioritization tool — none of which actually think.

---

## The reframe

The mistake every existing tool makes:

> *"PMs need better prioritization."*

The actual problem:

> *PMs spend more time **synthesizing chaos** than **making decisions**. Context is fragmented across 6+ systems, prioritization rationale lives in tribal memory, alignment is asynchronous and noisy, priorities decay continuously, planning is a heavy quarterly ritual, and frameworks are static while businesses are dynamic.*

The reframe — and the product thesis:

> **Quarterly planning is a context-synthesis and decision-orchestration problem. AI-native software should compress synthesis to zero so the PM gets their thinking time back.**

This directly answers the validated pain in the 2025 SOPM: **49% of IC PMs cite strategy-vs-delivery as a 5-alarm fire**. And the deeper irony: AI is reclaiming time, but coordination is eating it back. Our product attacks coordination-as-the-new-bottleneck, not just rote work.

---

## Who we're building for

**Persona: the mid-stage B2B SaaS PM.**

- Series B-D company, 50-200 engineers, 5-15 PMs
- Owns a product area with 2-4 squads
- Currently uses **Notion + Linear + spreadsheets + 3 tabs in Productboard they barely log into**
- Reports to a VP Product or CPO who wants strategic differentiation, not delivery throughput
- 30-50% of their week is coordination — alignment meetings, status updates, intake triage, Slack threads
- They know the work isn't strategic; they don't have time to fix it

This persona is the largest TAM, the cleanest fit, and the place where existing-tool frustration is most acute (68% of mid-sized SaaS teams shop for Productboard alternatives once they pass 100 users).

We are explicitly not optimizing for: solo PMs, enterprise multi-portfolio shops, agency PMs, internal-tools PMs.

---

## What it is / What it isn't

**What it IS**
- A continuous decision orchestration workspace
- An AI-native synthesis layer for organizational signals
- A calm, opinionated surface where decisions arrive ready-to-make
- The place a PM lives during the workweek

**What it ISN'T**
- A Jira replacement
- A project management tool
- A feature request tracker
- A static roadmap product
- A prettier prioritization spreadsheet
- A chatbot bolted onto Notion
- A dashboard

The negative space matters. Most evaluators will see what we *say it isn't* before what *we say it is.*

---

## The hero loop (3-screen walk-through)

This is what the PM does between 9am Monday and 9:15am Monday. Fifteen minutes, end-to-end.

**Screen 1 — Priority Stream (the home).** A vertical, calm, single-column feed. Three to five decisions surface today, each as a single-line synthesis: *what it is, why now, who needs it most.* AI-generated, sourced from underlying evidence. The PM scans top-to-bottom — never left-to-right. If nothing is wrong, the PM stays in flow. If something needs attention, one click opens it.

**Screen 2 — Initiative Detail (the decision surface).** Full-screen, single context. The decision in front of the PM, with everything they need to decide, pre-assembled by AI: customer evidence, $ARR exposure, support ticket count, strategic alignment, eng effort estimate, suggested sequence, conflicts with other items, draft rationale. The PM either accepts the suggested decision (one keystroke) or overrides with a reason (two keystrokes — type a sentence, hit enter). The decision is logged with rationale. Sub-100ms haptic feedback on commit.

**Screen 3 — Quarterly Simulation (the synthesis surface).** When the PM is ready to look at the whole quarter — usually weekly, not quarterly — they open the Simulation view. It shows the current quarterly plan as a single-column timeline, not a multi-column matrix. Drag to resequence. AI shows live impact on conflicting items. Toggle "Render for: Exec | Eng | Sales | CS" and the same plan re-frames itself for the audience — copy, framing, level of detail all shift. The PM ships any of those views in one click.

That's the loop. No dashboards. No multi-column tables. No tabs. No chat panels.

---

## The six capabilities (and how they fit together)

The product is layered. Five capabilities work together; one closes the loop.

```
┌─────────────────────────────────────────────────────────┐
│  6.  Decision Audit Log (closes the learning loop)      │
├─────────────────────────────────────────────────────────┤
│  5.  Roadmap Drafting + Audience-Tuned Render           │
│  4.  Stakeholder Alignment Copilot                      │
│  3.  Dynamic Priority Engine (continuous, gated)        │
│  2.  Opportunity Synthesis Engine (cluster + summarize) │
├─────────────────────────────────────────────────────────┤
│  1.  Context Graph (organizational memory)              │
└─────────────────────────────────────────────────────────┘
            ▲ ingestion (Slack/Jira/CRM/calls/analytics)
```

1. **Context Graph** — continuous ingestion across Slack, Jira, CRM, support tickets, customer calls, analytics. Builds an organizational memory layer. *(Out of scope for the build per brief; in scope for the architecture story.)*

2. **Opportunity Synthesis Engine** — semantic clustering of duplicate requests, summarization of customer pain, theme extraction. *Replaces hours of manual tagging and dedup that PMs currently do in spreadsheets.*

3. **Dynamic Priority Engine** — continuous re-scoring as context shifts (new customer churn, new exec priority, new analytics signal). **Critical: synthesis is continuous, publication is gated.** The engine flags when significant re-prioritization is warranted; the PM reviews and approves. We don't ship priority chaos with extra steps.

4. **Stakeholder Alignment Copilot** — surfaces conflicts between stakeholder priorities, drafts alignment summaries, predicts escalation risk. *Compresses the coordination loop that ate the time AI was supposed to save.*

5. **Roadmap Drafting + Audience-Tuned Render** — proposes draft quarterly plans, simulates sequence tradeoffs, then renders the same plan in four audience modes (Exec, Eng, Sales, CS). *Replaces the part-time job of maintaining four roadmaps.*

6. **Decision Audit Log** — every decision logged with the AI's rationale + the human's override + the predicted outcome. Quarterly retrospective auto-surfaces predicted-vs-actual. *The Dynamic Priority Engine learns from this.*

The chat-as-surface anti-pattern is explicitly avoided. AI is **ambient** — pre-filling, suggesting, flagging — not a panel you go visit. A `Cmd+K` command bar is the only "AI surface" and follows familiar Linear/Superhuman mental models.

---

## The unique-design moment

Bhavin's third DfD principle: for high-frequency features, **purpose-built design** that departs from convention. Examples called out: iPod wheel, Tinder swipe.

The highest-frequency PM action is **deciding on a single item**. Conventional UI: a dense matrix of items × scoring fields × stakeholder columns × priority rankings. Cognitive load: high. Time per decision: minutes.

Our purpose-built surface: **the Initiative Detail screen.**

- Full-screen, single decision, nothing else visible
- AI-narrated rationale at the top — three sentences, plain language
- Evidence chips below — customer quotes, $ARR exposure, support volume, strategic theme — all pre-attached, all clickable for source
- One keystroke to **commit** (the AI's recommendation), two keystrokes to **override** (type reason, enter), one keystroke to **defer**, one to **escalate** for stakeholder input
- Sub-100ms haptic + sound feedback on commit
- Subtle micro-animation: the decision card slides into the quarterly timeline in the background, visible at the corner of the screen — the PM sees their decision land

Time per decision: 5-10 seconds. This is the iPod-wheel-for-prioritization moment, and it is what wins the demo.

This is also where the product feels **different** from anything in the category. Productboard, Aha!, Airfocus, JPD, Linear: every one of them lives in matrix view. We don't.

---

## Three locked design principles

These are non-negotiable, drawn directly from Bhavin's DfD rubric.

### 1. Zero Cognitive Load via single-context flow

- **One page, one context** — no dashboards, no split views, no multi-column matrices
- **Smart defaults everywhere** — AI pre-fills every score, rationale, and sequencing suggestion; PM overrides with intent, never fills blank canvases
- **Sub-100ms feedback** on every commit
- **Reduce analytical choices** — the PM sees a recommendation and decides yes/no/different, not a spreadsheet of fields to fill

### 2. Engage the senses on accomplishment

- Haptic feedback on decision commit
- Sound on quarterly snap (when a plan crystallizes)
- Micro-animations for decision-lands-in-timeline
- Calm stream that gently reveals new items, not notification chaos

### 3. Purpose-built design at the highest-frequency action

- The Initiative Detail decision surface is the iPod-wheel moment
- Anti-spreadsheet, anti-matrix, anti-dropdown
- Familiar mental models (card surfaces, command bar) keep it from feeling alien

---

## How this maps to validated pain

| Pain (research) | How we attack it |
|---|---|
| Intake firehose (6+ channels) | Context Graph (architecturally; out of build scope) |
| Cluster + dedup hours | Opportunity Synthesis Engine — bulls-eye for AI |
| Context decay / enrichment chase | Auto-attached evidence chips on every Initiative Detail |
| Scoring is theater, not decision | Decision rationale logged + traceability — surfaces the *why* |
| Re-prioritization is steady state | Dynamic Priority Engine (continuous synthesis, gated publication) |
| 49% strategy-vs-delivery 5-alarm fire | The whole thesis — PM decides, AI synthesizes |
| AI saves time, coordination eats it | Stakeholder Alignment Copilot — compresses the new bottleneck |
| Multi-audience comm overhead | Audience-Tuned Render in Simulation View |
| Outcome loop missing | Decision Audit Log — predicted-vs-actual surfaced quarterly |
| Eng estimate fiction | Out of scope — capacity-truth is a different product |
| Framework lock-in | Dynamic Priority Engine supports framework switching per item type |

Eleven validated pains. Ten directly addressed; one explicitly out of scope. No painted-on solutions to imaginary pains.

---

## North Star + supporting metrics

**North Star: median time from idea-surfaced → decision-logged.**

This metric directly captures Bhavin's "speed of thought" framing AND the decision-orchestration thesis. It is leading, not lagging — a tool that reduces this number is doing its job, today, regardless of whether the resulting plan is "good." Plan quality is downstream and slower to measure; throughput compression is the proximate cause.

**Supporting metrics:**

| Metric | What it tells us |
|---|---|
| % roadmap items traceable to validated organizational signals | Plan quality (the lagging counterpart) |
| Stakeholder alignment latency (hours from conflict-flagged to resolved) | Coordination loop compression |
| AI recommendation acceptance rate | Whether the synthesis is trustworthy |
| Priority churn rate (re-sequences per quarter) | Whether continuous synthesis is creating chaos or stability |
| Decision audit fidelity (% of decisions with logged rationale) | Whether the system is accumulating organizational memory |
| Quarterly plan diff drift (% of items unchanged Q-end vs Q-start) | Reality-vs-plan divergence — early warning for plan invalidation |

The North Star and the supporting metrics together form a healthy instrumentation surface — leading + lagging + quality + adoption + safety.

---

## In scope / out of scope for the build

**In scope (the slice the PM lives in daily, post-intake):**
- Priority Stream (hero screen 1)
- Initiative Detail / Triage (hero screen 2 — the unique-design moment)
- Quarterly Simulation View with Audience-Tuned Render (hero screen 3)
- Architecture diagram (one static asset showing the layered system)
- Cmd+K command bar
- Decision Audit Log compactly accessible from Initiative Detail

**Out of scope (deferred, with reasoning):**
- Ingestion pipeline — brief explicitly says skip
- Export — brief explicitly says skip
- Standalone AI chat surface — anti-pattern (bolted-on AI), violates our thesis
- Alignment View as a standalone screen — folded into Priority Stream as a filter
- Outcome attribution / analytics integration for "did it work" — Decision Audit Log captures predictions; full attribution is the next layer
- Capacity-truth / eng estimate fidelity — different product

Quality of three hero screens beats half-done five. Bhavin's rubric values flow simplicity and product POV more than feature completeness.

---

## The single-line summary (for the cover of the writeup)

> *A calm, AI-native decision orchestration workspace for product managers — where the synthesis happens automatically and the PM gets their thinking time back. The quarterly plan is the artifact; continuous decision-making is the cadence.*

That's the product, in one line, in Bhavin's vocabulary.
