# Approach — CS1 (Growth Hacking)

> How both caselets in Brief 1 were approached, end-to-end. The methodology here is what produced the two PDFs at the top of this folder. The [`methodology_trace.md`](methodology_trace.md) is the longer process record; this is the one-read summary.

---

## 1. Reading the brief

Both caselets sit inside a single Growth Hacking brief with explicit rules:

- **Depth not breadth.** Pick a small number of ideas and go deep on UX, hooks, comms, and metrics.
- **Cannot pay for primacy.** Cash incentives, switching bonuses, and revenue-sharing growth-loops are out for Caselet 1. The mechanic has to be product, not money.
- **One quarter to ship.** Growth-hacks are by definition shippable inside a planning cycle — not strategic infrastructure, not new financial products.
- **Four evaluation criteria.** Creativity · depth · analytical reasoning · impact.

Three implications were locked before research began:

1. **Two ideas, not five.** A 5×5 macro framing with two named ideas hits depth-not-breadth; a longer list would dilute.
2. **Growth-hack discipline is a filter, not an aesthetic.** Every component of every idea has to pass the "ships inside a quarter, no new licensing surface, no credit risk, no regulatory approval" test.
3. **Evidence anchors beat assertion.** Each pain category needed a single strongest signal — a quote, a metric, a comparator — that survives interview cross-examination on its own.

---

## 2. Research method

### Caselet 1 — Revolut Primacy

A five-category source pull anchored to a **Reddit primary-source pass** (17 high-engagement threads across r/Revolut, r/UKPersonalFinance, r/eupersonalfinance; ~1,000 comments synthesised). The Reddit pass was the load-bearing differentiator — most growth-hacking analysis of Revolut leans on secondary commentary (Sifted, Tech.eu, Banking Dive). The primary-source pass surfaced the demote-funnel narrative and the AI-bot-loop asymmetry insight that secondary sources had missed.

| Category | Examples |
|---|---|
| Reddit (primary) | 17 threads · ~1,000 comments · "Revolut is great until it is not" meme-phrase pattern · top-voted comment dataset |
| Industry data | Sacra + Sifted deposit comparator · Monzo Annual Report FY25 · CityAM/MoneyWeek CASS data · Allegiant + UK Finance + Action Fraud |
| Revolut disclosures | 2024 Annual Report · UK Bank licence announcement March 2026 · Storonsky / Bloomberg April 2026 |
| Comparator forums | Trustpilot · MoneySavingExpert · Askaboutmoney · Bonkers.ie · Chyshkala 2026 |
| Competitive context | Monzo blog (Sept 2019 Salary Sorter; Jan 2020 partial-switch onramp) · 11FS N26 exit analysis · Be Clever With Your Cash |

A late-stage **Czech-Republic primary user signal** during ideation surfaced two structural friction axes that the UK-anchored research had missed (employer-side payroll restrictions; salary-gated bundled benefits at local banks). These were folded into the executive summary as an explicit geographic-scope statement rather than glossed over.

### Caselet 2 — Plottwyst pitch

The source domain was a **live product I built** (`play.plottwyst.app` on Discord + web, 297 cases generated and 467 games played at submission time). The "research" here was operational — the engine metrics in the pitch are derived from the deployed system, not projected. Persona work came from two distinct user cohorts observed in the actual usage data: friend-group + corporate hosts on the multiplayer surface, daily-puzzle players on the solo surface.

---

## 3. Synthesis framework

### The pain × vitamin asymmetry (Caselet 1)

The brief asks for macro pain categories *and* macro benefit categories. Most teardowns treat these as parallel lists. The synthesis move that defines the idea space is the **asymmetry between them**:

- **Two of five macro pains have no current vitamin counter** inside the live product (P1 perceived operational risk; parts of P4 + P5). They are pure-UX addressable.
- **Three macro pains are structural** (regulatory, capital, lending product gap). They require licence-track or balance-sheet moves; out of PLG scope.
- **One vitamin is structurally mistargeted** (V3 primacy-only economics). Components exist; the merchandising layer doesn't.

The unmet pain × untargeted vitamin matrix *is* the idea space. Caselet 1's two ideas each attack one of those gaps directly.

### Two personas, one engine (Caselet 2)

The brief asks for "Persona" singular + "list of Problems" plural. Plottwyst's product architecture is *one engine, two surfaces, two demand vectors* — so the synthesis layer is two persona blocks (Multiplayer Host + Daily Puzzle Player), each owning its own problem list, closed by a "why two personas, not one" bridge into the platform argument. The split mirrors the supply-side gap both personas trace back to: *content scaled, gameplay systems didn't.*

---

## 4. Decision framework

### Idea generation + scoring (Caselet 1)

Seventeen ideas generated broadly across three named idea zones (Trust counter-narrative · Primacy-as-ritual product surface · Primacy-only economics tier reframe). Each scored on a 4-axis rubric:

| Axis | Definition |
|---|---|
| **Impact** | Expected UK primacy %-point movement, calibrated to Stage-1 cohort sizing (C3+C4 = strategic target population) |
| **PLG-feasibility** | Shippable in 3–12 months without licensing, eng moonshot, or new financial product |
| **Differentiation** | Unique vs Monzo / Starling / Chase — *not* pay-for-primacy per brief constraint |
| **Defensibility** | Holds up under depth-not-breadth interview scrutiny |

Three ideas tied at 19/20: **Salary Guarantee**, **Confidence Period**, **Locked Insights**. Salary Guarantee was *absorbed into* Confidence Period rather than picked separately — bundling the strongest individual feature without triggering the "five features in one idea" trap. The final pair — Confidence Period + Locked Insights — was selected because it satisfied two non-redundancy tests:

1. **Different mechanism** — migration de-risk (push) vs only-on-primary value (pull).
2. **Different target cohort** — C3+C4 (considered + switched-but-reverted) vs C2+C3 (active non-primary users).

### Scope-discipline correction

A pre-submission self-critique flagged that Salary Guarantee — even as an absorbed sub-mechanism — was a *lending product* (credit-risk underwriting, FCA notification, advance-disbursement infrastructure). 6–9 months of build. Out of growth-hacking scope. It was stripped and replaced with three pure-UX reassurance mechanics (real-time clearance push, 24h pre-payday confidence reminder, public AML-clearance stats card on profile), branded **Live Clearance**. The intervention targets the *anxiety mechanism* (fear of held salary) rather than the actual event distribution (which is near-zero). Build window dropped to ~3 months. Combined Year-1 impact estimate held at **7–9pp UK primacy lift** because the visceral focus-group anchor weakened but the mechanism became honest.

### Brief-alignment audit (Caselet 2)

The brief sections were used as a checklist, not a frame. Each section was drafted, then audited against the brief's literal wording:

| Section | Brief wording | Submission check |
|---|---|---|
| §1 | Persona + Problems (plural) | Two persona blocks, each with own problem list, closed by bridge |
| §2 | "How does the product solve substantially better than existing products?" | Three architectural claims (generate-and-validate; model-agnostic engine; template-agnostic capabilities) each with a comparator |
| §3 | MVP definition + screenshots if helpful | Smallest configuration that lets a reviewer disprove the platform thesis · screenshot block of the live surface |
| §4 | Revenue model | Three streams that compound on the same engine — Consumer Premium · B2B API · Creator Economy |
| §5 | TAM / SAM / SOM | Three-layer market sizing tied to the platform thesis ($90B+ TAM · ~$8B SAM · ~$150M SOM Year-3) |

---

## 5. Deliverable design

### Format choices

Both caselets ship as **A4 print-ready PDFs** rather than slide decks. The brief asks for depth-not-breadth on UX, hooks, comms, and metrics — slide decks would have forced bullet-shaped truncation. The PDFs are generated from source markdown via a Python-Markdown + Chrome-headless pipeline (see [`build/`](build/)); the markdown source is the editable artifact, the PDF is the rendered deliverable.

### Section-level TL;DR callouts

For a 25+ page deliverable, a single executive summary at the doc level isn't enough — a senior reader scans and needs scan anchors at every section. Caselet 1 ships TL;DR callouts on §1, §2, §4, §5; Caselet 2 ships them on §1, §2, §4. The callout pattern is: accent border-left + caps label + declarative body + cost / payoff anchor (build window + Y1 impact + cohort size). A senior reader extracts the full thesis in ~90 seconds; the depth below stays available as proof, not required reading.

### Visual craft

Caselet 1's body carries **14 high-fidelity HTML phone mockups** in 2-up grids across all seven flows (Confidence Period 1–7 + post-activation; Locked Insights 1–4). Each phone is a real iOS-feel surface — slider, segment control, toggle, DD checklist, letter-card, ledger, year-in-review hero, sample banner — not an ASCII sketch. Inline-SVG icons using `currentColor` keep icons cohesive with surrounding card text colour. CSS-blurred numbers on Locked Insights cards communicate the locked-state loss concretely (real `filter: blur()` over real money fields, not `???` placeholders).

Caselet 2 reuses the same pipeline with cover + footer + title swapped, and ships as both a 13-page PDF and a **live applicant-aligned deck at [plottwyst.app/deck/momentum](https://plottwyst.app/deck/momentum)** (nine brief-aligned slides built as a filtered subset of the live Plottwyst investor deck via an `IS_MOMENTUM` conditional in the deck source).

---

## What this approach earns

- **Defensibility under interview scrutiny.** Every claim in the submissions traces back to a source in `research/` or to live operational data on `play.plottwyst.app`. No assertion is unanchored.
- **Honest scoping.** The Caselet 1 geographic-scope statement (UK-only growth-hack; CEE is a separate B2B initiative) and the growth-hacking scope correction (stripping Salary Guarantee) read as confidence, not evasion.
- **Brief-shaped, not template-shaped.** Both PDFs structure-match the brief's exact section ordering. A reviewer can read the brief and the submission side-by-side and tick each ask as covered.
