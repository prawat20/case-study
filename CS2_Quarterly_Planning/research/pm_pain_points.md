# PM Planning & Prioritization — Pain Points

> Research artifact backing the CS2 product POV. Six-stage workflow synthesis (intake → cluster → enrich → score → sequence → communicate) anchored to existing-tool gaps and validated PM pains. Feeds the persona + seven JBTDs in `product_pov.md`.

---

## TL;DR — the wedge

The problem is **not** that PMs lack frameworks (there are 10+ well-known ones) or tools (Productboard, Aha!, Airfocus, JPD, Linear, ProductPlan, ad nauseam). The problem is that **every existing tool is a system of record** — it stores the prioritized list after the PM has already done the thinking.

**The thinking is what's painful, slow, and political.** AI-native tools should make the *thinking* faster: auto-cluster intake, auto-fetch enrichment, suggest framework choices, surface tradeoffs as the PM scores, generate a *draft plan to edit* rather than a blank canvas to fill, and keep context coherent through mid-quarter pivots.

The fact that ~60% of PMs still use Notion + spreadsheets despite paid alternatives is the strongest evidence that paid tools haven't earned the actual workflow.

---

## The actual workflow has 6 stages

PMs don't experience prioritization as one task. Each quarterly cycle runs through:

| # | Stage | What's happening |
|---|---|---|
| 1 | **Intake** | Collect feature requests, bugs, ideas from N sources |
| 2 | **Cluster + dedup** | Same need expressed differently across sources collapses into one |
| 3 | **Enrich** | Attach customer data ($ARR, support volume, request count), effort estimates, strategic alignment |
| 4 | **Score + rank** | Apply a prioritization framework |
| 5 | **Plan + sequence** | Capacity match, dependencies, milestones, the Q-by-Q plan |
| 6 | **Communicate + iterate** | Multi-audience views, then mid-cycle re-prioritization as reality lands |

Most existing tools over-serve one stage and bridge the others with spreadsheet exports.

---

## Pain points by stage

### Stage 1 — Intake (the firehose)
- Requests arrive across **6+ channels**: Salesforce notes (sales), Zendesk/Intercom tickets (support, CS), customer interview notes (research), Slack DMs (exec), Linear/Jira (eng), Amplitude/Mixpanel signals (analytics), competitive intel (random).
- **Each system has a different schema and identity model.** A "request from Acme Corp" in Salesforce is one entity; the same ask in Zendesk is another; in customer interview notes, a third.
- The PM spends real hours just **collecting** before any thinking happens.

### Stage 2 — Cluster + dedup
- The same need shows up worded differently: "we need bulk import" might appear as "CSV upload", "API endpoint", "data migration tool" across three channels.
- Manual clustering is brutal and error-prone. A miss here means double-counting demand or under-counting it.
- This is **the highest-leverage place for AI** — semantic clustering is exactly what LLM embeddings do well, and it's almost universally absent from existing tools.

### Stage 3 — Enrich (where context goes to die)
- A feature request without context is noise. PMs need to attach: who asked (named accounts), how many asked, $ARR represented, support ticket volume, NPS impact, strategic alignment, dependencies, eng effort estimate.
- Most of this lives **outside the prioritization tool** — in CRM, ticketing, eng estimation tools, OKR docs.
- By the time the PM has gathered everything, **the data is stale**. Next quarter's enrichment pass starts from scratch.
- **Productboard's entire positioning** is around "linking customer feedback to features" — which validates this is the most painful sub-step.

### Stage 4 — Score + rank
- **No team uses a single framework consistently.** Most teams informally mix:
  - RICE for medium-effort features
  - Value/Effort 2x2 for quick triage
  - Kano for new product / category bets
  - Gut for the small stuff
- Tools that **hardcode one framework** lose users. Tools that allow free-form scoring with framework templates do better but still feel like spreadsheets.
- **Frameworks themselves have biases** (see "Frameworks" section below).
- The bigger truth: **scoring is theater for stakeholder alignment**, not the actual decision mechanism. The PM has usually already formed an opinion; the framework is the rationalization.

### Stage 5 — Plan + sequence (where reality breaks the model)
- Eng estimates are notoriously off — often 2–3× actual delivery.
- Capacity is split across new features, bugs, tech debt, security/compliance, infra. The "% on net new features" number is often 40–60% in mature products, much less in early ones — and PMs build plans assuming 80%.
- Dependencies and sequencing get hand-drawn in Miro/Whimsical because none of the tools handle them well.
- **Quarterly plans crumble in week 3** when reality (CEO pivot, customer churn, critical bug) lands.

### Stage 6 — Communicate + iterate
- **Same plan, four audiences:**
  - Exec — one-pager, themes + bets, no detail
  - Eng — issue-level breakdown, dependencies, sprints
  - Sales — customer-facing roadmap (date-gated, careful wording)
  - CS — timing of fixes for known support pain points
- Maintaining all four is a part-time job in itself.
- **Mid-cycle re-prioritization is where most tools fall apart.** The plan is treated as a finished artifact, not a living decision log. PMs lose the thread of *why* something was deprioritized.
- **Outcome loop is missing entirely.** Did the things we shipped move the metrics? Should we have prioritized differently? Almost no tool closes this loop back into the next quarter's planning.

---

## Framework landscape (what each framework is good for, and where it breaks)

| Framework | Origin | Strength | Bias / failure mode |
|---|---|---|---|
| **RICE** (Reach × Impact × Confidence ÷ Effort) | Sean McBride / Intercom 2017 | Forces estimation, defensible | High-confidence small wins beat low-confidence big bets — kills strategic moonshots |
| **ICE** (Impact × Confidence × Ease) | Sean Ellis | Faster than RICE, fewer inputs | Same bias as RICE, less audit-able |
| **MoSCoW** (Must / Should / Could / Won't) | DSDM agile | Stakeholder buy-in, simple | Weak on quant; everyone wants Must |
| **WSJF** (Cost of Delay ÷ Job Size) | SAFe | Strong for SAFe shops with cost-of-delay culture | Heavy ceremony; assumes you can estimate CoD |
| **Kano model** | Noriaki Kano 1980s | Voice of customer, distinguishes basic / performance / delight | Weak on roadmap rank ordering |
| **Value vs Effort 2×2** | Eisenhower-derived | Universal starter; works for early-stage triage | No nuance once you have >20 items |
| **Now / Next / Later** | ProductPlan default | Time-horizon based, communicates well | Hides tradeoffs; no scoring rigor |
| **Opportunity Solution Tree** | Teresa Torres ("Continuous Discovery Habits") | Problem-first thinking; strong for discovery | Heavy; not a quarterly planning tool per se |
| **LNO** (Leverage / Neutral / Overhead) | Shreyas Doshi | Personal productivity framing; what to focus on | Individual-PM scope, not team |
| **Story Mapping** | Jeff Patton | UX-centric, great for new feature design | Weak on cross-feature prioritization |

**Key insight: framework choice depends on the *type of decision* being made**, not the team's preference. Tools that let PMs **switch framework per item type** (or even per item) match how decisions actually happen.

---

## Tool landscape — what each gets right and wrong

| Tool | Strength | Where PMs complain |
|---|---|---|
| **Productboard** | Best-in-class for intake → customer feedback linking → framework | Heavy. Pricey ($20-50/user/mo). Onboarding friction. PMs love it for 6 months, then default to spreadsheet for "real" decisions |
| **Aha!** | Comprehensive enterprise suite — strategy, roadmap, ideas | Slow. PMs joke about "doing Aha! work". Heavy admin overhead |
| **Airfocus** | Multi-framework, lighter, mid-market | Less customer feedback integration; smaller ecosystem |
| **ProductPlan** | Roadmapping focused, beautiful timelines | Light on intake/prioritization workflow itself |
| **Jira Product Discovery (JPD)** | Cheap, integrated with Jira issues | Light on framework rigor, feels bolted onto Jira |
| **Linear** | Beautiful, fast issue tracking with project priorities | Not really a planning tool — execution layer |
| **Notion + spreadsheets** | What ~60% of PMs actually use | No structure, no integration, no AI, but **it's flexible enough** to model the actual workflow |

**The damning fact:** Notion + spreadsheets dominate despite the paid alternatives. The paid tools haven't earned the workflow.

---

## What none of them do well (yet)

1. **Semantic clustering of intake** — LLM-easy, almost universally absent. Same request in 5 channels = 1 cluster, not 5 line items.
2. **Auto-enrichment** — pull customer/$/effort data from CRM/ticketing without the PM going to chase it.
3. **Framework-as-judgment, not framework-as-form** — tool surfaces tradeoffs *as the PM scores*, doesn't just collect numbers and total them.
4. **Draft-the-plan-first** — generate a candidate quarterly plan from the prioritized + capacity-matched list; let the PM edit. Most tools force PM to compose from scratch.
5. **Living decision log** — when the plan changes mid-quarter, capture the *why* in a structured way that informs next quarter's planning. Almost no tool does this.
6. **Outcome loop** — closed-loop feedback from "shipped" → "metrics moved" → "should we have prioritized differently". The blackest hole in PM tooling.

---

## Implications for our product POV (CS2)

- The thesis is **"AI-native system of decision, not system of record"** — collapses cleanly onto the *system of momentum, not system of record* framing.
- **Don't try to win on intake**. Brief assumes intake is solved. Win on stages 2–5.
- The single most defensible wedge: **AI does the grunt work** (cluster, enrich, suggest scores, draft the plan), **PM does the judgment** (override, sequence, communicate).
- The North Star should reflect *time-to-decision*, not artifacts produced.
- Mid-cycle re-prioritization deserves first-class UI — not a "edit roadmap" afterthought.

---

## Sources & data points (2025-2026, validated)

### ProductPlan / Pragmatic 2025 State of Product Management

- **49% of IC PMs** cite "overemphasis on delivery vs. strategy and differentiation" as a major issue or 5-alarm fire.
- **40% of respondents** cite "poor prioritization and decision-making discipline" as major impact or 5-alarm fire.
- Direct quote (paraphrased from report): *"Prioritization often turns into negotiation, shaped by executive mandates, internal pressure, and the loudest voice in the room."* This is the politics-not-math observation, validated.
- **Key irony** — AI is reclaiming PM time, but the reclaimed time is being absorbed by **coordination and alignment**, not market learning or decision clarity. The bottleneck moved but didn't disappear — the new bottleneck is still anti-momentum.
- Top three issues facing PMs: **firefighting, lack of resources, prioritization** — listed together.

### Lenny Rachitsky (Lenny's Newsletter)

- **DRICE** (Detailed RICE) — modern prioritization framework by Darius Contractor & Alexey Komissarouk; Lenny featured it as a step-up from vanilla RICE for growth teams.
- **W Framework** — Lenny + Nels Gilbreth's quarterly planning system. Diagnosis: *"The root cause of nearly all bad planning processes is a basic lack of understanding of roles — who is responsible for what and when."*
- Lenny's prioritization framework is run **every planning cycle** by growth teams — implying re-prioritization is the steady state, not a one-off.

### Tool friction (Productboard / Aha!)

- **68% of mid-sized SaaS teams explore Productboard alternatives** once they scale past 100 active users — driven by per-user pricing ($20/maker, hitting $70k+ annually), clunky UX, and **missing native AI for feedback triage**. (Source: Right Feature blog, "7 Best Productboard Alternatives in 2026.")
- Direct user complaint about Productboard: *"Teams waste hours manually tagging posts, merging duplicates, and fighting spam, while Productboard's roadmap views lag behind auto-updating modern tools."* (Validates the intake/dedup pain in Stages 1-2.)
- Aha! has a **steep learning curve** — non-intuitive onboarding is a recurring complaint.
- The fact that the top-ranked search result for Productboard alternatives in 2026 is titled *"Cheaper Pricing + AI Features"* tells us where the market is moving.

### AI-native PM tooling — competitive scan (2025-2026)

- **Reforge launched an AI-native product suite** (Q1 2025-2026), including **Reforge Build** for AI-prototyping. Reforge themselves shipped 5 AI products in 9 months with 25 people — they are walking the talk.
- The Reforge thesis: AI-native product teams will *think, work, and build* differently from AI-augmented teams. Tools should be **rebuilt around AI**, not bolted on.
- The space is moving fast — 2026 will see a wave of AI-native planning/prioritization launches. **Differentiation will not be "we have AI"** — every tool will. Differentiation will be **product POV** (what work the AI actually does) and **flow simplicity**.

### Sources

- ProductPlan / Pragmatic 2025 State of Product Management Report — `productplan.com/2025-state-of-product-management-report/`
- Pragmatic Institute 2025 State of PM & Marketing — `pragmaticinstitute.com/resources/state-of-product-management-marketing/`
- Lenny's Newsletter — "Prioritizing" + "The Secret to a Great Planning Process" + "Introducing DRICE" — `lennysnewsletter.com`
- Right Feature blog — "7 Best Productboard Alternatives in 2026" — `rightfeature.com/blog/productboard-alternatives/`
- Reforge — "AI Native Product Teams" + "How AI Changes Product Management" — `reforge.com/blog`
- Forrester — "The State Of Product Management, 2025" — `forrester.com/report/the-state-of-product-management-2025/`

---

## Updated implications for the POV

The 2025 SOPM data tightens the wedge significantly:

1. **49% strategy-vs-delivery + 40% prioritization-discipline as 5-alarm-fire issues** = ~half the PM workforce is acutely aware they're not doing their best thinking. Our tool's promise should be *"give the PM their thinking time back"* — not "store your prioritized list better."
2. **The "AI saves time, coordination eats it" irony** is the strongest validation of the system-of-momentum thesis. The moat is not "we have AI" — every tool will. The moat is **AI that compresses the coordination/alignment loop**, not AI that just does the rote work faster.
3. **Politics-not-math** is officially validated by industry data, not just punditry. Tools that pretend prioritization is math (RICE alone) will lose to tools that **surface tradeoffs + document the why** (so the PM can defend the decision).
4. **Re-prioritization is the steady state** (Lenny's "every planning cycle"). First-class UI for mid-cycle re-planning is not a feature — it's the core loop.
5. The market is **explicitly moving toward AI-native** (Reforge suite, Productboard alternative trends). Bolt-on AI is no longer table stakes; it's a liability.
