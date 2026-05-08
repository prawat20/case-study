# CS2 v2 — JBTD, Persona, and POV

**Status:** draft for review (2026-05-08). This document is upstream of every other artifact in the v2 rebuild — design system, IA, surface design, copy. If a design move can't be traced back to a JBTD or POV here, it doesn't ship.

---

## 1. Why we're rebuilding

The current build (commit `2f7c594`) is POV-complete against the original brief, but the front-door experience reads as a "smart inbox of pre-prioritized cards" — which is the wrong shape. Three honest problems:

1. **Skips triage entirely.** Items appear pre-ranked. A real PM's day starts with a pile of un-triaged asks across Slack/email/calls — not a clean stack of priority-1-through-N.
2. **No end-to-end loop.** There's no surface where you watch a request flow from "just landed" → "scheduled in Sprint 3 of Q3" → "communicated to sales." Each surface is a feature; together they're not a journey.
3. **Calm-but-cold.** The current craft is competent dark-theme minimalism. It is not *fun*. Planning should feel like Cron's calendar drag or Amie's gentle motion, not a Bloomberg terminal.

The v2 thesis: **planning should feel like a single calm flow, not a series of intensive decisions.** Every JBTD below is one stop on that flow.

---

## 2. The persona — Maya, Senior PM at a Series-C B2B SaaS

Not a generic "product manager." Concrete to the point that we can stress-test designs against her actual week.

**Maya, 32. Senior PM at Glide (fictional Series-C, ~120 eng, 8 PMs, $14M ARR).** Owns one squad of 4 engineers + 1 designer. Reports to a Director of Product who reports to the CPO.

### Her week, honestly

- **Mon AM** — 3hr of "deep work" blocked on calendar; in practice, gets ~70 minutes of it after Slack DMs and one fire-drill from sales.
- **Mon-Fri** — averages 6.2 hours of meetings/day. The rest is fragmented across reviewing PRDs, writing follow-ups, answering Slack, watching customer calls in Gong, and 30+ small asks landing across channels.
- **Quarter planning week** — 3 painful days. She exports tickets to a spreadsheet, scores them on a RICE template her director shared in 2024, runs three trade-off conversations (eng lead, sales lead, exec sponsor), drafts a one-pager in Notion, and presents to leadership. Most of the suffering is *retroactive justification* — she made decisions intuitively in week 1, then spent weeks 2-3 building the framework story for why they're right.

### Her stakeholders (the four faces of every prioritization argument)

1. **Sales lead** — "Three enterprise deals are blocked on SAML."
2. **CS lead** — "Tickets are spiking on the bulk-import bug."
3. **Eng lead** — "If we don't pay down the auth refactor, velocity craters in Q4."
4. **Exec sponsor (CPO)** — "Where's our AI story?"

Each speaks a different language and weights different evidence. Maya's job is not to pick a winner — it's to make a defensible plan and *get all four to nod*.

### What "wow" means for Maya

Not "look how minimal." It's:

> "I closed Q3 planning in 90 minutes, every stakeholder agreed without a second meeting, and when sales asked three weeks later why we deferred the partner-portal work, I pulled up the reasoning + predicted outcome in one click."

If a design move doesn't move her toward that sentence, it's decoration.

---

## 3. The seven Jobs To Be Done

Canonical form: **When [situation], I want to [motivation], so I can [outcome].**

Listed in the order they fire across the loop — these become the surfaces in §5.

### JBTD-1: Capture without context-switching
> **When** a new ask lands (Slack DM, email, customer call, PRD comment, exec hallway question), **I want to** drop it into one place in <5 seconds without leaving what I'm doing, **so I can** return to deep work without losing the request.

**Pain today:** PMs use 4-6 capture surfaces (Linear, Notion inbox, Slack saved-items, personal notes, email stars). Items get lost.

### JBTD-2: Triage a pile, fast
> **When** I sit down to review the inbox, **I want to** decide each item's fate (route / defer / promote to "needs deciding" / kill) in <30 seconds per item, **so I can** clear 30 items in 15 minutes instead of an afternoon.

**Pain today:** Triage is invisible work. PMs do it in their head while context-switching, so it never feels done.

### JBTD-3: Prioritize against the *right* framework
> **When** I'm evaluating a candidate item, **I want to** apply the framework that fits its *type* (RICE for shippable features, ICE for experiments, Strategic Bet for big swings, Value-Effort for quick wins, WSJF for dependency-heavy work), **so I can** stop retrofitting a single hammer to every nail.

**Pain today:** PMs default to one framework org-wide. Fits ~60% of items badly. Or worse: no explicit framework, just gut.

### JBTD-4: Resolve trade-offs honestly, in the moment
> **When** committing item A means deferring item B (capacity or dependency), **I want to** see that trade-off explicitly *at the point of decision*, **so I can** decide consciously rather than discover the cost in standup three weeks later.

**Pain today:** Trade-offs surface as surprise costs. "Wait, we can't ship X if we ship Y?" — usually too late.

### JBTD-5: Sequence into a sprint-by-sprint plan
> **When** I've prioritized N items, **I want to** drop them into a calendar-style sprint timeline that respects capacity and dependencies, **so I can** confirm the plan is *executable*, not just aspirational.

**Pain today:** Roadmap docs are flat lists. They don't show "Sprint 3 is over capacity" until eng raises it. PMs end up rebuilding capacity math in spreadsheets.

### JBTD-6: Communicate to each stakeholder in their language
> **When** the plan is set, **I want to** generate a stakeholder-shaped view (sales-flavored, exec-flavored, customer-flavored, eng-flavored) in <2 minutes each, **so I can** align four audiences without four separate meetings.

**Pain today:** PMs write the same plan four times in four formats. Or they write it once in PM-flavor and let stakeholders pattern-match (sales misreads, exec misreads worse).

### JBTD-7: Defend and learn from decisions later
> **When** someone challenges a deprioritization 3 weeks later, **I want to** retrieve the reasoning + predicted outcome + trade-offs in one click, **so I can** make the conversation about adjustment, not interrogation — and learn whether my prediction was right.

**Pain today:** "Why did we deprioritize X?" → PM scrambles through Slack, Notion, and memory. Decision context evaporates.

---

## 4. The end-to-end loop

```
   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────────┐   ┌────────┐
   │ CAPTURE │ → │ TRIAGE  │ → │PRIORITIZE│ → │  SEQUENCE    │ → │COMMUNI-│ ↘
   │ (JBTD-1)│   │(JBTD-2) │   │(JBTD-3,4)│   │  (JBTD-5)    │   │CATE(6) │  ╲
   └─────────┘   └─────────┘   └──────────┘   └──────────────┘   └────────┘   ╲
                                                                                ↓
                                                              ┌─────────────────┐
                                                              │ AUDIT + LEARN   │
                                                              │    (JBTD-7)     │
                                                              └────────┬────────┘
                                                                       │
                                                              feeds back to  ↺
                                                              future TRIAGE & PRIORITIZE
                                                              (system learns weights)
```

The current build collapses CAPTURE + TRIAGE into "Priority Stream" (which is actually post-triage), has PRIORITIZE + SEQUENCE separately but disconnected, and has COMMUNICATE bolted on as audience-toggle. The v2 build makes the loop visible.

---

## 5. POV per JBTD — what we believe, what we reject

Each POV is a design rubric. When a designer/coder hesitates, they re-read these.

### POV-1 (Capture)
**Believe:** The capture surface is a one-keystroke modal (`Cmd+N`) that accepts free text and infers the rest (source, urgency, requester) — not a form. Inspired by Things 3's quick-entry and Linear's Cmd+K. The PM types "sales says SAML for Acme" and we infer.

**Reject:** Long forms with required fields. Pre-flight categorization. "Choose a project before you can capture."

### POV-2 (Triage)
**Believe:** Triage is a *deck of cards* surface, not a list. One card at a time, full screen, three large keyboard targets: `D` defer, `R` route, `P` promote. Spotify-DJ-style — fast, flow-state, the next card is queued and the previous fades out. The system *suggests* the action but never makes it for you.

**Reject:** Multi-row tables of un-triaged items (the cognitive cost of seeing the pile is what makes triage feel infinite). Bulk-action checkboxes (encourage rubber-stamping).

### POV-3 (Prioritize — the framework moment)
**Believe:** Framework is an active choice the PM makes per-item, with the system as advisor. The Initiative Detail surface shows: the chosen framework, the score breakdown laid out as a *mini scorecard* (not a hidden chip), and a one-line rationale. PM can switch frameworks live and watch the score change. Inspired by spreadsheet-grade transparency, presented with Linear-grade restraint.

**Reject:** Black-box "AI says priority 73." Single-framework org defaults that pretend every item is comparable. Hiding the framework as a decoration.

### POV-4 (Trade-offs in the moment)
**Believe:** When the PM commits an item, the system shows — in the same modal — what gets pushed and by how many sprints. Like a flight-booking site showing seat-change implications before you confirm. The trade-off is *part of the decision*, not a post-hoc surprise.

**Reject:** Trade-offs as a separate page. Trade-offs as "see related items." Trade-offs as a notification after the fact.

### POV-5 (Sequence — the calendar)
**Believe:** This is the missing surface today. Sprint-by-sprint vertical calendar, like Cron's day view but for sprints. Each item is a card in a sprint lane. Drag to resequence; a translucent ghost shows where capacity overflows. Dependencies render as light connecting lines. **Planning here should feel like Cron — that's the bar.**

**Reject:** Gantt charts (too dense, too IT-PM, anti-DfD). Quarter-grids that don't show capacity. "Roadmap as Notion table."

### POV-6 (Communicate — stakeholder views)
**Believe:** Audience views are *generated artifacts*, not just toggled lenses on the same data. Pick "for Sales" → see a generated note ("Here's what's coming in Q3 that affects deals: SAML lands Sprint 2, partner-portal in Q4 not Q3 because…") with a "copy as Slack" / "copy as email" CTA. The format meets the audience where they are — sales gets deal-by-deal mapping, exec gets one paragraph + one chart.

**Reject:** Same data, different filters. "Here's the roadmap, tell me what you think." Demanding the audience translate PM-shaped output.

### POV-7 (Audit + learn)
**Believe:** Every decision logs reasoning + framework + predicted outcome. The Audit surface shows decisions chronologically *and* surfaces "predictions due for review" — "3 weeks ago you predicted SAML would unblock 3 deals; 2 are closed, 1 stalled. Update your priors?" This closes the learning loop the current build half-promised.

**Reject:** Audit-as-immutable-log. "Just a feed of what happened." No prediction-vs-actual loop.

---

## 6. The North Star principle

**Move planning from decision-by-decision suffering to a single calm flow.**

Operationalized: **median time from idea-surfaced → decision-logged.** Already locked in `cs2_supporting_writeup.md`. This v2 build serves that NSM directly — every JBTD shaves time off that median, every reduction in cognitive load reduces the chance Maya delays the decision because "I'll think about it later."

---

## 7. What "joyful planning" means here (the Amie test)

Borrowing from Amie's design philosophy — *"Connecting events to bigger goals"* — joyful planning here means:

- The North Star (Net New ARR) is **always visible** at the top, calmly. Every decision is implicitly framed as "does this move that number?"
- **Motion has meaning.** Decision-lands animation isn't decoration; it's confirmation that the decision moved into the plan. Triage cards fading away is closure.
- **The system speaks like a peer**, not a tool. "Three deals stalling. Want to triage SAML first?" not "Priority score: 87."
- **Restraint is the craft.** Amie: *"Products die from obesity much rather than from starvation."* Linear: *"When execution becomes the default, we devalue the why behind designs."* Both apply.

---

## 8. What we're explicitly *not* doing in v2

To keep scope honest:

- **No real backend.** Still mocked data. Capture is fake; triage decisions live in localStorage.
- **No multi-user collaboration.** Maya is alone with the tool.
- **No ticketing-system integration.** Linear/Jira sync is a credible-future demo, not a built feature.
- **No editing/CRUD on initiatives.** Maya doesn't author items in v2; the system is about deciding on them.
- **No mobile.** Desktop-only. PM workstation is the use context.

Anything outside the seven JBTDs is out of scope until v3.

---

## 9. Decisions locked (2026-05-08 review)

1. **Persona = Senior PM at Series-C B2B SaaS** (Maya). She *does* the planning work, doesn't review others'. ✅
2. **Light theme is the default**, with optional dark. Warm earth-toned palette per 2026 minimalism trend. The current cold-dark vibe is replaced. ✅
3. **Audience renders are replaced with generated stakeholder artifacts** (POV-6) — bigger rebuild, right per JBTD. ✅
4. **SignalShifts banner moves into Triage flow** — surfaces as "3 items shifted priority overnight; re-triage first?" rather than front-door noise. ✅
5. **NSM stays at median time idea→decision.** Leading indicator added for demo purposes: "% of items decided same day they're captured." ✅

---

**Next step:** §3 design system v2 (palette + typographic scale + motion), then §4 IA + surface map, then build surface-by-surface starting with Inbox (Capture + Triage).
