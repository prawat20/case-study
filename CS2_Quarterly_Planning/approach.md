# Approach — CS2 (Quarterly Planning & Prioritization)

> How the CS2 deliverable was approached, end-to-end. The methodology here is what produced the working tool at [case-study-iud.pages.dev](https://case-study-iud.pages.dev/). The [`methodology_trace.md`](methodology_trace.md) is the longer process record; this is the one-read summary.

---

## 1. Reading the brief

The brief asks for a working AI-native quarterly-planning tool that a PM would use to decide *what to ship next quarter and why*. Three constraints were locked before any work began:

- **Ingestion is solved upstream.** The brief explicitly assumes data ingestion is not the build. The deliverable covers the post-ingestion slice — capture → triage → place → communicate → learn. That's also where the PM's actual day lives.
- **Decision orchestration, not record keeping.** Most existing prioritization tools (Productboard, Aha!, Airfocus, Jira Product Discovery) are *systems of record* — they store the prioritised list after the PM has already done the thinking. The brief invites an AI-native tool to make the *thinking* faster, not the storing.
- **A PM should be able to use it on Day 1.** The tool has to demo end-to-end as a single calm flow; surfaces that don't connect to the loop don't ship.

Three early choices fell out:

1. **POV before pixels.** A persona + seven JBTDs + per-JBTD design rubric had to be locked before any surface design. Without it, the build defaults to feature laundry.
2. **One opinionated app, not a tour.** Five destination surfaces, each doing one job exceptionally, beat a feature-comparison tool that does fifteen things adequately.
3. **AI as advisor, not actor.** Black-box prioritisation ("AI says priority 73") is rejected up-front. The system suggests and shows its reasoning; the PM decides.

---

## 2. Research method

**First-principles workflow synthesis.** The PM's quarterly-planning cycle was decomposed into six stages (intake → cluster + dedup → enrich → score + rank → plan + sequence → communicate + iterate). Each stage was anchored to its dominant pain — multi-channel firehose, manual clustering, stale enrichment, single-framework-hammering, capacity-blind sequencing, four-audience translation tax — and to the gap in existing tools at that stage.

**Desk research across PM-community sources.** Reforge essays, Lenny's Newsletter, the 2025 State of Product Management report, Productboard / Aha! / Airfocus / JPD positioning + review patterns. The strongest evidence anchor: ~60% of PMs still use Notion + spreadsheets despite paid alternatives. The paid tools haven't earned the actual workflow — that's the wedge.

**Founder-framing alignment.** The build's framing ("speed of thought," "AI-native vs AI-bolted," "the system thinks every day, the org consumes a quarterly snapshot") borrows vocabulary that aligns with the firm's product-design philosophy without leaning on it as a crutch. The product POV stands independently; the vocabulary is the conversational layer.

---

## 3. Synthesis framework

### Persona — concrete enough to stress-test designs

The persona is **Maya, Senior PM at a Series-C B2B SaaS** ($14M ARR, 120 eng, 8 PMs, fictional company "Glide"). The synthesis move is concreteness:

- **Her week, honestly.** 6.2 hrs/day in meetings · ~70 min of usable "deep work" Monday morning · 3-day quarterly planning cycle dominated by *retroactive justification* of intuitive Week-1 decisions.
- **Her four stakeholders.** Sales lead ("Three enterprise deals blocked on SAML"), CS lead ("Tickets spiking on bulk-import bug"), Eng lead ("If we don't pay down auth refactor, velocity craters Q4"), Exec sponsor ("Where's our AI story?"). Each speaks a different language and weights different evidence.
- **What "wow" means for her.** *"I closed Q3 planning in 90 minutes, every stakeholder agreed without a second meeting, and when sales asked three weeks later why we deferred partner-portal work, I pulled up the reasoning + predicted outcome in one click."*

Every design move is checked against that sentence.

### Seven JBTDs in loop order

| # | Job | When → Want → So I can |
|---|---|---|
| 1 | Capture | When a new ask lands → drop it in one place in <5s → return to deep work |
| 2 | Triage | When I sit down to the inbox → decide each item's fate in <30s → clear 30 items in 15 minutes |
| 3 | Prioritize | When evaluating an item → apply the framework that fits its type → stop retrofitting one hammer to every nail |
| 4 | Resolve trade-offs | When committing A means deferring B → see the trade-off at decision time → decide consciously |
| 5 | Sequence | When N items are prioritised → drop them into a capacity-aware sprint timeline → confirm the plan is executable |
| 6 | Communicate | When the plan is set → generate a stakeholder-shaped view per audience → align four audiences without four meetings |
| 7 | Audit + learn | When challenged 3 weeks later → retrieve reasoning + predicted outcome in one click → make conversation about adjustment, not interrogation |

These map 1:1 to the five surfaces in the build (JBTD-1 and -2 share Now; JBTD-3 and -4 share Prioritize).

### POV-per-JBTD as design rubric

Each JBTD has a paired POV that declares both what the build believes *and* what it rejects. Example — POV-2 (Triage):

> **Believe:** Triage is a *deck of cards* surface, not a list. One card at a time, full screen, three large keyboard targets: `D` defer, `R` route, `P` promote. Spotify-DJ-style — fast, flow-state.
>
> **Reject:** Multi-row tables of un-triaged items (the cognitive cost of seeing the pile makes triage feel infinite). Bulk-action checkboxes (encourage rubber-stamping).

When a design choice gets ambiguous mid-build, the POV is the tiebreaker. This pattern is the load-bearing piece of CS2's synthesis framework — without it, the build defaults to the loudest opinion or the safest precedent.

---

## 4. Decision framework

### North Star metric — leading, not lagging

**Median time from idea-surfaced → decision-logged.** Each candidate metric was tested and rejected with reasons:

| Candidate | Rejection |
|---|---|
| Plans shipped per quarter | Lagging, gameable, conflates throughput with quality |
| NPS / CSAT | Soft, hard to act on, noisy at small N |
| % roadmap items traceable to validated org signals | Quality indicator but slow; better as supporting metric |
| Active users / DAU | Vanity — a PM can open the tool daily without making decisions |
| Decisions logged per quarter | A count metric inflates with chaos — not what we want to optimise |

Median time idea→decision survives every test: captures the founder's "speed of thought" framing, captures the product thesis (context-synthesis and decision-orchestration), is leading not lagging, is measurable from day one, is independent of input volume. **It pairs with the AI override rate as a safety net** — a PM who decides quickly *and* overrides AI 80% of the time is a warning sign (AI is wrong); a PM who decides quickly *and* mostly accepts AI is the success state.

### Five events, deliberately cut from a brainstorm of fifteen

| Event | Drives which product decision |
|---|---|
| `decision_logged` | NSM + AI override rate. Slicing by theme/signal tells us where AI is consistently wrong. |
| `signal_shift_surfaced` | Defends or kills the Dynamic Priority Engine claim. If `was_actioned` < 30%, the engine is noise. |
| `audience_render_viewed` | Tells us which stakeholder renders are used. If Exec is opened weekly and Sales once a quarter, we invest copy quality in Exec. |
| `framework_overridden` | Closes the loop on "framework of user's choice." Aggregated, tells us whether the AI's framework picker is matched to PM intuition or fighting it. |
| `plan_shipped` | The conversion event — did the daily decision loop close into a published plan? `time_from_first_decision_to_ship_ms / decision_count` = throughput metric. |

What was deliberately *not* instrumented: `page_view` (too generic), `cmd_k_opened` (downstream), `evidence_chip_expanded` (micro-interaction, doesn't drive a decision), `priority_stream_card_hovered` (hover ≠ intent), `escalation_message_drafted` (covered by `decision_logged.action`), `feedback_submitted` (no feedback surface yet). The discipline is in cutting.

### PM interview question bank as validation rubric

A 21-question, 5-section, 45-minute interview bank covering: current workflow, pain points, current tools, reaction to the thesis (without showing product), reaction to specific features (with demo). The validation rubric scores each interview on three dimensions:

| Dimension | Validating signal | Killing signal |
|---|---|---|
| Pain is acute | Specific stories about losing time, getting it wrong, fighting tools | Vague complaints, no specific examples |
| Wedge resonates | "Yes, that's exactly what I want" — unprompted, in their words | Polite interest, no urgency |
| Tool reaction | Wants to use it tomorrow, asks about pricing, opens it during the call | Polite "I'd try it," no follow-up energy |

If 3+ of 5 are validating across all three dimensions, the wedge holds. If fewer, re-frame and re-interview.

---

## 5. Build / deliver method

### POV-first, surface-last sequencing

The build sequence was: lock POV → lock design system → lock IA + surface map → build each surface against its JBTD + POV. Every design move had to trace back to one of the seven POVs or it was out. The Calendar's Drop Planner pattern is the most opinionated example — silent auto-reflow on overflow would have failed POV-4 (Trade-offs in the moment), so the two-step pattern (pending → planner panel → commit) was chosen specifically because it makes trade-offs the act of work, not a post-hoc surprise.

### Five surfaces, one loop

| Surface | JBTD | The opinionated move |
|---|---|---|
| Now (`/`) | 1, 2, aggregator | NSM hero in Fraunces 48px · inline triage rows · `⌘N` capture · `Start triage →` CTA. The home is the inbox. |
| Prioritize (`/prioritize/[id]`) | 3, 4 | Framework picker as first-class control · scorecard re-renders below · commit-confirm shows sprint impact |
| Calendar (`/calendar`) | 5 | Sprint-by-sprint drag-and-drop puzzle · Drop Planner on overflow with per-item destination control · animated reflow via `motion.div layoutId` |
| Stakeholders (`/stakeholders`) | 6 | Master/detail with persistent audience rail · *generated* per-audience artifacts (not filtered views) · copy-as-Slack / copy-as-email |
| Audit (`/audit`) | 7 | Decisions log + Predictions tab · 21-day prediction-vs-actual review with mock SAML prediction always seeded |

The brief's four evaluation criteria (creativity · depth · analytical reasoning · impact) resolve onto a **single interaction** in the build: drag a rail item onto an over-capacity sprint. The Drop Planner expands inline; each item gets per-destination row buttons; AI's suggestion is pre-selected with a ✦ badge but every row is overridable; live trade-off summary updates per toggle; commit is disabled until capacity matches. AI is advisory, not deciding.

### Stack discipline

Next.js 16 · TypeScript · Tailwind v4 · Framer Motion · cmdk · Radix UI · Lucide React · Web Audio API. **No backend.** State persists in seven scoped localStorage stores, each independently resettable by Cmd+K → Reset. The brief assumed ingestion is solved upstream — anything that asks the reviewer to imagine a backend would distract from the slice the build is testing.

### What the deliverable explicitly is not

- Not a Jira replacement, not a feature-request tracker, not a static roadmap tool.
- Not a multi-user collaboration system (Maya is alone with the tool by design).
- Not mobile-primary (drag-and-drop is the primary input model; mobile surfaces explicit "desktop primary" disclosure).
- Not a standalone AI chat panel (anti-pattern per the design rubric — AI is in-place advisor, not a separate persona to talk to).
- Not multi-column tables anywhere (forces multi-axis scanning, violates Zero Cognitive Load).

---

## What this approach earns

- **An opinionated tool.** Five surfaces, each doing one job exceptionally. The Drop Planner pattern is the kind of decision a senior PM would notice — it's not feature-laundry, it's a deliberate position on how AI and PM should share decision authority.
- **A demonstrable end-to-end loop.** An 8-minute reviewer flow covers capture → triage → place (including a deliberate over-capacity drop to surface the Drop Planner) → switch audiences → open Predictions. Every JBTD lights up exactly once.
- **A defendable POV.** Every design choice traces to a JBTD + POV in [`product_pov.md`](product_pov.md). If a reviewer asks "why this, not that," there's a documented rubric answer rather than a taste-based one.
