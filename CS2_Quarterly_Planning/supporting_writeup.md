# Supporting Writeup

> Three deliverables: North Star metric · five events to instrument · PM interview question bank.
> Companion to the deployed product at `https://sift-pm.pages.dev/`.

---

## 1. North Star Metric

> **Median time from idea-surfaced → decision-logged.**

> **Two North Stars, at two levels.** The deployed app's hero labels a *North Star* of **Net New ARR ($600k of $2.4M)** — that is the *customer's* business goal: the strategic context the PM plans against (and the pace tension the demo runs on). This section defines **Sift's own product North Star** — the metric Sift optimizes against to know the tool is working. Its in-product leading indicator is the **"% of items decided the same day they land"** line shown directly beneath the hero on Now.

For a given PM, across all initiatives surfaced in their Now queue over a quarter: the median elapsed time between when an idea first appears (surfaced by the engine) and when the PM logs a decision on it (commit / defer / escalate / override).

### Why this metric

Most planning tools optimize for the wrong thing. The candidates I considered and rejected:

| Candidate | Why I rejected it |
|---|---|
| Plans shipped per quarter | Lagging, gameable, conflates throughput with quality. |
| User satisfaction (NPS / CSAT) | Soft, hard to act on, noisy at small N. |
| % roadmap items traceable to validated organizational signals | Quality indicator, but slow to measure and a *plan-quality* signal — not a *PM-throughput* signal. Better as a supporting metric. |
| Active users / DAU | Vanity metric. PMs may open the tool daily without making decisions. |
| Decisions logged per quarter | Closer, but a count metric inflates with chaos — the wrong thing to optimize for. |

The chosen metric — *median time from idea-surfaced to decision-logged* — survives every test:

- **It captures the founding framing.** The "speed of thought" thesis — compressing the elapsed time between *the system surfacing context* and *the PM acting on it* — collapses cleanly onto this metric.
- **It captures the product thesis.** The product POV reframes quarterly planning as a *context-synthesis and decision-orchestration* problem. If the synthesis is automated and the decision is fast, this metric goes down. If either is broken, it goes up.
- **It is leading, not lagging.** A drop in this metric shows the tool is doing its job *today* — independent of whether the resulting quarterly plan turns out to be "good." Plan quality is downstream and slower to measure; it's triangulated via the supporting metrics.
- **It is measurable from day one.** Both endpoints are timestamps the system already records. No external attribution, no panel surveys, no quarterly retros required.
- **It is independent of input volume.** A PM with 20 surfaced ideas and one with 200 should both see the metric improve as they get faster — median is robust to volume.
- **It pairs with the override-rate signal.** A PM who decides quickly *and* overrides AI 80% of the time is a warning sign — the AI is wrong. A PM who decides quickly *and* mostly accepts AI is the success state. The NSM and override rate together separate "fast and good" from "fast and noisy."

### Definition (operational)

- **Numerator events:** `decision_logged` timestamp.
- **Denominator events:** `idea_surfaced` timestamp (when the engine first places an item on the user's Now queue).
- **Aggregate:** median across all decisions made by a user in the last 30 days. Median, not mean — robust to outliers (the one item the PM left untouched for 3 weeks shouldn't dominate).
- **Comparison:** longitudinal per-user (is this PM getting faster?) plus a peer-cohort benchmark (how does this PM compare to others at similar org-size, similar role).

### Supporting metrics (the quality / safety net)

| Metric | What it reveals | Why it matters |
|---|---|---|
| AI recommendation acceptance rate | Is the synthesis trustworthy? | If acceptance is high but NSM is high, AI is fine but the surface is slow. If acceptance is low, AI itself is wrong. |
| Stakeholder alignment latency (hours from conflict-flagged to resolved) | Is the coordination loop compressing? | The 2025 SOPM finding: AI saves time, coordination eats it. This catches when Sift itself makes that worse. |
| Priority churn rate (re-sequences per quarter) | Is continuous synthesis creating chaos? | Continuous re-prioritization sounds great until stakeholders lose trust in the plan. Churn rate is the safety net. |
| Decision audit fidelity (% of decisions with logged rationale) | Is organizational memory accumulating? | If overrides happen without rationale, the system can't learn. |
| Quarterly plan diff drift (% of items unchanged Q-end vs Q-start) | Is reality diverging from the plan? | Early warning for plan invalidation — too high (90%) means the plan was over-fit; too low (20%) means the plan was fiction. |

The North Star and the supporting metrics together form a healthy instrumentation surface — leading + lagging + quality + adoption + safety.

> **Now visible in-product.** The deployed Audit log surfaces every PM action against what the system recommended and flags each *divergence* as a recalibration signal — so the AI-acceptance-rate and override-rate metrics above aren't aspirational. They have a working home: the gap between recommendation and action *is* the training signal.

---

## 2. Five Events to Instrument

Each event carries a rationale grounded in *the product decision it informs*. Any event that doesn't inform a decision is left out.

### Event 1: `decision_logged`

**Fires when** the PM commits, defers, escalates, or overrides on any initiative.

**Properties:**
- `initiative_id`
- `action` — `commit | defer | escalate | overridden`
- `ai_recommended_action` — `commit | defer | escalate`
- `was_override` — boolean (did the PM choose differently from AI)
- `time_to_decide_ms` — from `idea_surfaced` to this event
- `framework_used` — `RICE | ICE | Value/Effort | Strategic Bet | WSJF`
- `framework_was_overridden` — boolean (did PM change framework from AI default)
- `has_rationale` — boolean
- `rationale_text_length` — int (privacy: don't store text by default; length is a cheap proxy for "PM took time to explain")
- `initiative_theme`, `initiative_arr_exposure`, `initiative_signal_type`

**Why this event:** It powers the North Star (`time_to_decide_ms`) and the most important supporting metric (override rate). Slicing by theme/signal-type shows where the AI is consistently wrong. Slicing by `framework_was_overridden` shows whether AI's framework picker is trusted.

### Event 2: `signal_shift_surfaced`

**Fires when** the Dynamic Priority Engine (architecture Layer 3 — the assumed synthesis substrate, beyond the scope of this prototype) flags that re-prioritization is warranted and surfaces it to the PM.

**Properties:**
- `shift_count` — how many items moved
- `shift_directions` — `up[] | down[]`
- `shift_initiative_ids[]`
- `time_since_last_shift_event_hours`
- `was_dismissed` — boolean (did the PM expand it or just scroll past)
- `was_actioned` — did the PM open any of the flagged items within 5 minutes

**Why this event:** Sift's Dynamic Priority Engine claims to flag re-prioritization continuously. This event reveals whether the flags are *useful* (PMs act on them) or *noise* (PMs ignore them). If the `was_actioned` rate falls below 30%, the engine is generating noise and the threshold should tighten. The metric directly defends — or kills — the most ambitious capability claim.

### Event 3: `audience_render_viewed`

**Fires when** the PM toggles the Stakeholders view's audience selector (Sales / Exec / Customer / Eng).

**Properties:**
- `from_audience`, `to_audience`
- `dwell_time_ms` — how long they spent on the previous view before switching
- `triggered_by` — `manual_click | cmd_k_command | first_load`
- `quarter_decision_count` — how many decisions are in the plan being rendered

**Why this event:** The audience render is one of two surfaces that win the demo. This event reveals *which* audience renders PMs actually use. If the Sales view is opened once a quarter while the Exec view is opened weekly, copy quality goes into Exec and Sales stays a stub. If no one ever toggles, the capability is over-engineered and should be cut. A critical product decision.

### Event 4: `framework_overridden`

**Fires when** the PM picks a framework different from the AI's default (the "framework of the user's choice" requirement).

**Properties:**
- `initiative_id`
- `ai_recommended_framework`
- `pm_chose_framework`
- `initiative_theme`
- `was_decision_immediately_after` — boolean (did the PM commit/defer right after the framework switch, suggesting the AI's framework was actively unhelpful)

**Why this event:** Closes the loop on the "framework of the user's choice" requirement. Aggregated, it shows whether the AI's per-item framework picker matches PM intuition or fights it. If `Strategic Bet` is consistently overridden to `RICE` for compliance items, the framework heuristic needs adjustment. This is the *learning fuel* for the framework picker specifically.

### Event 5: `plan_shipped`

**Fires when** the PM clicks "Snap as Q2 plan" (Calendar) or copies a stakeholder artifact ("Copy as Slack" / "Copy as email" on the Stakeholders view) — the conversion event.

**Properties:**
- `audience` — `sales | exec | customer | eng` (artifact share); `null` for a calendar snap
- `action` — `ship | snap` (`ship` = stakeholder-artifact share)
- `decision_count` — how many decisions are in the plan
- `total_arr_exposure_usd`
- `time_from_first_decision_to_ship_ms`
- `decisions_overridden_count` — how many AI recommendations the PM overrode in this batch
- `quarter_completion_pct` — how far into the quarter when shipping

**Why this event:** This is the **conversion event** — did the daily decision loop close into a published plan, or did the PM decide-decide-decide and never ship? Without this, every other metric describes activity, not outcomes. `time_from_first_decision_to_ship_ms` divided by `decision_count` gives the *throughput* metric — decisions per unit of cycle time.

### What I deliberately didn't instrument (and why)

Five events is a deliberately tight budget. The discipline is in what's cut:

- ❌ `page_view` — too generic, says nothing about whether the tool *worked*. Rejected.
- ❌ `cmd_k_opened` — interesting but downstream. If `decision_logged.triggered_by_cmdk = true` matters, it becomes a property on Event 1, not a separate event.
- ❌ `evidence_chip_expanded` — micro-interaction, doesn't drive a product decision.
- ❌ `priority_stream_card_hovered` — same. Hover ≠ intent.
- ❌ `escalation_message_drafted` — covered by `decision_logged.action = "escalate"`.
- ❌ `feedback_submitted` — premature; there's no feedback surface yet.

A sixth event, with budget, would be `decision_outcome_observed` — fired quarterly when a committed decision's predicted outcome is compared to actuals. But it requires real outcome-data ingestion, which is out of scope here, so it's deferred.

---

## 3. PM Interview Question Bank

Goal: validate the product premise *before* broader build. Test whether the wedge actually resonates with the persona (mid-stage B2B SaaS PM, Series B-D, 5-15 PMs in the org).

Five sections, ~21 questions. Designed for a 45-minute conversation. Open-ended throughout — no leading questions. The questions are sequenced to build context before testing reactions.

### Section A — Their current workflow (10 minutes)

Establish how they actually plan today before testing the solution. *Don't lead.*

1. Walk me through your last quarterly planning cycle. Where did you start? What was the very first thing you did?
2. How long did the cycle take, end to end — when did it start, when did the plan ship to your team?
3. Which tools did you touch? In what order?
4. Roughly how many feature requests did you sift through? Where did they come from? *(Sales? Support? Customer interviews? Internal? Analytics?)*
5. How did you decide what to commit, defer, or escalate? Was the process explicit (a framework, a meeting), or mostly gut?

### Section B — Pain points (10 minutes)

Probe for the acute pain. *Listen for the exact words they use.*

6. What's the single most frustrating part of quarterly planning for you?
7. What part of the cycle do you spend the most time on? Why does it take so long?
8. What's a part of planning you wish someone else would just *do for you*?
9. What part of the plan always changes mid-quarter? Why does it change?
10. Tell me about a time you were wrong about a quarterly priority. What did you miss? What signal would have caught it earlier?

### Section C — Tools they use (8 minutes)

Concrete tool usage reveals the competitive landscape and the workarounds.

11. What's your current prioritization tool or setup?
12. What do you like about it? What keeps you using it?
13. What's missing? What do you do in spreadsheets or Notion that the tool doesn't support?
14. If you could change one thing about your current tool, what would it be?
15. Have you tried Productboard, Aha!, Airfocus, or Jira Product Discovery? What made you stay or leave?

### Section D — Reaction to the thesis (10 minutes)

Test the wedge here — without showing the product yet.

16. If a tool could give you back your thinking time — what would you actually spend it on? Be specific.
17. If an AI told you "you should commit this initiative in Sprint 1" — would you trust it? What would have to be true for you to trust it?
18. When you override an AI's recommendation, what do you wish the system would do with that information?
19. *(Stress test)* If the AI was right 80% of the time and wrong 20% — would you use it daily? At what accuracy do you give up on it?

### Section E — Reaction to specific features (7 minutes)

Show the demo, screen by screen, and note their reaction.

20. *(Show **Now** — the daily decision surface)* Imagine the tool surfaces 3 decisions for you each morning. What level of context would you need on each card to make the decision in seconds rather than minutes?
21. *(Show the Stakeholders audience render — Sales / Exec / Customer / Eng)* When you communicate a quarterly plan to those teams, do you write four different versions? How long does it take? Is what you see here close, or wrong?

### What to listen for (the validation rubric)

This isn't a survey — these conversations validate or kill the product thesis. After each interview, score on three dimensions:

| Dimension | Validating signal | Killing signal |
|---|---|---|
| **Pain is acute** | Specific stories about losing time, getting it wrong, fighting tools | Vague complaints, no specific examples |
| **Wedge resonates** | "Yes, that's exactly what I want" — unprompted, in their words | Polite interest, "could be useful," no urgency |
| **Tool reaction** | Wants to use it tomorrow, asks about pricing, opens it during the call | Polite "I'd try it," no urgency to follow up |

Five interviews with mid-stage B2B SaaS PMs is the minimum bar. If three or more validate across all three dimensions, the wedge holds. If fewer, the thesis gets re-framed and re-tested.

---

## Format note

This document presents the three deliverables — North Star metric, instrumentation plan, and interview guide — in full. The product POV (`product_pov.md`) carries the strategic thesis; this is the *operational* layer beneath it. Together with the working product and the source code, it completes the submission.
