# Product POV — JBTDs, Persona, Design Rubric

> The upstream document for the CS2 build. Every design move — design system, IA, surface, copy — traces back to a JBTD or a POV declared here. If it can't be, it didn't ship.

---

## 1. Thesis

**Planning should feel like a single calm flow, not a series of intensive decisions.**

The PM's quarterly-planning week is dominated by three failure modes that every existing tool inherits:

1. **The pile is invisible.** Real PM days start with un-triaged asks across Slack, email, calls, customer interviews, exec hallway questions. "Smart inboxes of pre-prioritized cards" skip the triage moment that *is* the work.
2. **There is no end-to-end loop.** Capture, triage, prioritize, sequence, communicate, and audit live in separate tools. The PM holds the loop together in their head.
3. **The surface is cold.** Competent dark-theme minimalism reads as a Bloomberg terminal. Planning should feel like Cron's calendar drag or Amie's gentle motion — calm but warm.

The seven JBTDs below are the loop. Each design move on each surface serves one of them.

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
3. **Eng lead** — "If we don't pay down the auth refactor, velocity craters in Q3."
4. **Exec sponsor (CPO)** — "Where's our AI story?"

Each speaks a different language and weights different evidence. Maya's job is not to pick a winner — it's to make a defensible plan and *get all four to nod*.

### What "wow" means for Maya

Not "look how minimal." It's:

> "I closed Q2 planning in 90 minutes, every stakeholder agreed without a second meeting, and when sales asked three weeks later why we deferred the partner-portal work, I pulled up the reasoning + predicted outcome in one click."

If a design move doesn't move her toward that sentence, it's decoration.

---

## 3. The seven Jobs To Be Done

Canonical form: **When [situation], I want to [motivation], so I can [outcome].**

Listed in the order they fire across the loop — these become the surfaces in §5.

### JBTD-1: Capture without context-switching
> **When** a new ask lands (Slack DM, email, customer call, PRD comment, exec hallway question), **I want to** drop it into one place in <5 seconds without leaving what I'm doing, **so I can** return to deep work without losing the request.

**Pain today:** PMs use 4-6 capture surfaces (Linear, Notion inbox, Slack saved-items, personal notes, email stars). Items get lost.

### JBTD-2: Triage a pile, fast
> **When** I sit down to review the inbox, **I want to** decide each item's fate (escalate / defer / promote to "needs deciding" / kill) in <30 seconds per item, **so I can** clear 30 items in 15 minutes instead of an afternoon.

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

The deployed build makes the full loop visible end-to-end: triage is the front-door act of work, prioritize and sequence are connected through the calendar puzzle, communicate is generated artifacts per audience, and audit closes the loop with prediction-vs-actual.

---

## 5. POV per JBTD — what we believe, what we reject

Each POV is a design rubric. When a designer/coder hesitates, they re-read these.

### POV-1 (Capture)
**Believe:** The capture surface is a one-keystroke modal (`Cmd+N`) that accepts free text and infers the rest (source, urgency, requester) — not a form. Inspired by Things 3's quick-entry and Linear's Cmd+K. The PM types "sales says SAML for Acme" and we infer.

**Reject:** Long forms with required fields. Pre-flight categorization. "Choose a project before you can capture."

### POV-2 (Triage)
**Believe:** Triage is a *deck of cards* surface, not a list. One card at a time, full screen, three large keyboard targets: `D` defer, `E` escalate, `P` promote. Spotify-DJ-style — fast, flow-state, the next card is queued and the previous fades out. The system *suggests* the action but never makes it for you.

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
**Believe:** Audience views are *generated artifacts*, not just toggled lenses on the same data. Pick "for Sales" → see a generated note ("Here's what's coming in Q2 that affects deals: SAML lands Sprint 2, partner-portal in Q3 not Q2 because…") with a "copy as Slack" / "copy as email" CTA. The format meets the audience where they are — sales gets deal-by-deal mapping, exec gets one paragraph + one chart.

**Reject:** Same data, different filters. "Here's the roadmap, tell me what you think." Demanding the audience translate PM-shaped output.

### POV-7 (Audit + learn)
**Believe:** Every decision logs reasoning + framework + predicted outcome. The Audit surface shows decisions chronologically *and* surfaces "predictions due for review" — "3 weeks ago you predicted SAML would unblock 3 deals; 2 are closed, 1 stalled. Update your priors?" This is the learning loop most planning tools half-promise but never close.

**Reject:** Audit-as-immutable-log. "Just a feed of what happened." No prediction-vs-actual loop.

---

## 6. The North Star principle

**Move planning from decision-by-decision suffering to a single calm flow.**

Operationalised: **median time from idea-surfaced → decision-logged.** Defined in `supporting_writeup.md`. The build serves the NSM directly — every JBTD shaves time off that median, every reduction in cognitive load reduces the chance Maya delays the decision because "I'll think about it later."

---

## 7. What "joyful planning" means here (the Amie test)

Borrowing from Amie's design philosophy — *"Connecting events to bigger goals"* — joyful planning here means:

- The North Star (Net New ARR) is **always visible** at the top, calmly. Every decision is implicitly framed as "does this move that number?"
- **Motion has meaning.** Decision-lands animation isn't decoration; it's confirmation that the decision moved into the plan. Triage cards fading away is closure.
- **The system speaks like a peer**, not a tool. "Three deals stalling. Want to triage SAML first?" not "Priority score: 87."
- **Restraint is the craft.** Amie: *"Products die from obesity much rather than from starvation."* Linear: *"When execution becomes the default, we devalue the why behind designs."* Both apply.

---

## 8. What is deliberately out of scope

The brief assumes ingestion is solved upstream. The build covers the post-ingestion slice (capture → triage → place → communicate → learn). Everything below is deliberately out:

- **No real backend.** Mocked data; triage decisions persist in localStorage.
- **No multi-user collaboration.** The persona is alone with the tool.
- **No ticketing-system integration.** Linear/Jira sync is a credible-future demo, not a built feature.
- **No editing/CRUD on initiatives.** The system is about deciding on inbound items, not authoring them.
- **No mobile primary input.** Desktop drag-and-drop is the primary interaction model; mobile renders are read-only and explicitly disclosed.

Anything outside the seven JBTDs is out of scope.

---

## 9. Locked design decisions

1. **Persona — Senior PM at Series-C B2B SaaS** (Maya). She *does* the planning work, doesn't review others'.
2. **Light theme default**, optional dark. Warm earth-toned palette aligned with 2026 minimalism's "rooted earth tones" shift.
3. **Audience renders as generated stakeholder artifacts**, not toggled filters on shared data. Each audience gets its own copy + format.
4. **SignalShifts surfaces inside Triage**, not as front-door noise. Surfaced as "N items shifted priority overnight; re-triage first?"
5. **NSM = median time idea-surfaced → decision-logged.** (A "% of items decided same day they're captured" leading indicator was considered but **not shipped** — Round 16.)
