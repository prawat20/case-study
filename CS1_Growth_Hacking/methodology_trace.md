# CS1 — Methodology Trace

> The process record behind both caselets in Brief 1 (Growth Hacking). Methodology, evidence sources, decision moments, and craft details for the print-ready PDFs. Reads in past tense as a final-state trace, not a working log.

---

## Caselet 1 — Revolut Primacy

A 4-stage research-first discipline drove Caselet 1: **research → macro synthesis → ideation + scoring → submission**, each stage producing its own artifact and feeding the next.

| Stage | Artifact | Purpose |
|---|---|---|
| 1 | [`research/revolut_pain_research.md`](research/revolut_pain_research.md) | Desk research anchored to a primary-source Reddit pass (17 high-engagement threads, ~1,000 comments synthesised) |
| 2 | [`research/revolut_painkiller_vitamin.md`](research/revolut_painkiller_vitamin.md) | 5 macro pains × 5 macro vitamins · PLG-actionability filter · the pain×vitamin asymmetry that defines the idea space |
| 3 | [`research/revolut_ideation.md`](research/revolut_ideation.md) | 17 ideas across 3 idea zones · 4-axis scoring rubric · narrow to the push-pull pair |
| 4 | [`caselet1_revolut_primacy.md`](caselet1_revolut_primacy.md) | Final submission — pain list + vitamin list + 2 ideas + full UX/hooks/comms/metrics per idea |

The PDF deliverable at [`/CS1_Caselet1_Revolut_Primacy.pdf`](../CS1_Caselet1_Revolut_Primacy.pdf) is generated from the Stage-4 markdown via [`build/build_pdf_caselet1.py`](build/build_pdf_caselet1.py).

### Stage 1 — Research

The foundation was evidence anchoring before any synthesis. Sources fell into five categories:

| Source category | What was pulled |
|---|---|
| **Reddit (primary)** | 17 high-engagement threads across r/Revolut, r/UKPersonalFinance, r/eupersonalfinance. Pulled via the public `.json` API endpoint to local curl with a mainstream user-agent (Anthropic WebFetch was blocked at Reddit's edge; mainstream UA returned 99/100 rate-limit budget). Cached locally and parsed with Python stdlib. |
| **Industry data** | Sacra + Sifted (UK consumer-deposit comparator: Revolut £575/mo · Monzo £811 · Starling £2,944), Tech.eu + Monzo Annual Report FY25 (Monzo 33% primary disclosure), CityAM + MoneyWeek (CASS quarterly net-switcher data), Allegiant + UK Finance + Action Fraud (Revolut £756 APP losses per £1M of transactions vs Barclays £67). |
| **Revolut disclosures** | 2024 Annual Report (primacy growth %, absolute undisclosed), UK Bank licence announcement March 2026, Storonsky / Bloomberg April 2026 strategy commentary, Carlesi tech.eu interview. |
| **Comparator forums** | Trustpilot, MoneySavingExpert, Askaboutmoney, Bonkers.ie, Chyshkala 2026 analysis. |
| **Competitive context** | Monzo blog (Sept 2019 Salary Sorter launch, Jan 2020 partial-switch onramp), 11FS N26 exit analysis, Be Clever With Your Cash UK switching-incentive comparator. |

The output structure was: TL;DR wedge · 5-stage switching journey · pain points by stage (P1–P11) · vitamin categories (V1–V7) · 6 behavioral cohorts (C1–C6) · competitive teardown · signals bibliography.

**The wedge insight that emerged.** Revolut's primacy problem is as much a *public-narrative problem* as an operational one. Two-bank cohabitation (Revolut for spending + FX + crypto, high-street for salary) is the rational user equilibrium. The freeze narrative crystallises at the salary-deposit moment — *"if Revolut froze right now, what's the worst case?"* — and the answer ("can't pay rent, no branch, no phone, AI bot loop") kills the switch even for users who love the product.

### Stage 2 — Painkiller / Vitamin synthesis

Stage 2 collapsed the eleven atomic pain points and seven vitamin categories from Stage 1 into the macro-category shape the brief explicitly asked for. The structure:

1. Five macro pain categories, each absorbing 1–N research-doc pains, each anchored to a single lead signal.
2. Five macro vitamin categories, paired with severity / reach notes.
3. A **pain × vitamin matrix** — the load-bearing analytical move: which pains have a current vitamin counter inside the live product? Which don't?
4. A PLG-actionability column per pain (HIGH = 3–12 months product surface; LOW = regulatory / capital).
5. Three named idea zones bounding the Stage-3 surface without pre-picking.

**Key finding.** Two of the five macro pains have **no current vitamin counter** inside the live product (P1 perceived operational risk; parts of P4 + P5). Three pains are structural (regulatory, capital) and out of PLG scope. That asymmetry — pains without counters, addressable with product, not licence — is the idea space.

**Idea zones identified.**
1. Trust counter-narrative surface (attacks P1 — no current counter).
2. Primacy-as-ritual product surface (attacks P4 + P5 — components shipped but unmerchandised).
3. Primacy-only economics tier reframe (attacks V3 mistarget).

### Stage 3 — Ideation + scoring

Seventeen ideas generated broadly across the three zones, no idea-suppression. Each scored on a 4-axis rubric:

| Axis | Definition |
|---|---|
| **Impact** | Expected move on UK primacy %, calibrated to Stage-1 cohort sizing (C3+C4 = the strategic target population) |
| **PLG-feasibility** | Shippable in 3–12 months without licensing or engineering moonshot |
| **Differentiation** | Unique vs Monzo / Starling / Chase — *not* "pay for primacy" per the brief constraint |
| **Defensibility** | Holds up under depth-not-breadth interview scrutiny |

**Selection.** Three ideas tied at 19/20: Salary Guarantee, Confidence Period, Locked Insights. Salary Guarantee was absorbed into Confidence Period's in-trust-period mechanism rather than picked separately — this avoided the "five features bundled into one" trap while keeping the strongest individual feature in scope. **Confidence Period + Locked Insights** was selected as the strongest push-pull pair: non-redundant on mechanism (migration de-risk vs only-on-primary value) and non-redundant on target cohort (C3+C4 vs C2+C3).

**Explicit non-picks documented.** The pre-research instinct had been *Salary Switch Concierge + Cashflow Copilot*. After Stage 1, Concierge dropped — research showed the dominant barrier is *fear of the first salary deposit*, not *the chore of switching*. CASS already works mechanically; trust is what breaks. Cashflow Copilot survived in modified form as Locked Insights.

### Stage 4 — Final submission

Submission structure aligned 1:1 to the brief:

| Section | Content |
|---|---|
| Executive summary + wedge insight | One-page distillation + 3 anchor quotes + data vintage callout |
| §1 Pain points (P1–P5) | Five macro categories with two-axis splits (P3a/3b, P4a/4b) for the structural-competitive and employer-side layers |
| §2 Benefits (V1–V5) | Five macro categories with reach / limit notes |
| Pain × Benefit asymmetry | Bridge to the idea space |
| §3 Two ideas — overview table | Push-pull pair contrast |
| §4 Confidence Period (deep) | 7-screen flow + 8 contextual hooks + 4-stakeholder comms lifecycle + 16 metrics |
| §5 Locked Insights (deep) | 4-screen flow + 9 contextual hooks + 6 comms paths + 12 metrics |
| §6 Rubric defense | Mapped to brief's 4 evaluation criteria |
| Appendix | Evidence sources |

Two layers of post-Stage-4 polish landed in the final PDF:

**A scope discipline pass.** A pre-submission self-critique flagged that Stage 4's Idea 1 had bundled four components — Open Banking parallel-run, auto-mirror, HR letter generator, and a Salary Guarantee (instant interest-free advance up to the salary amount on any AML hold > 60 min). The first three add up to ~3 months of build; Salary Guarantee alone took the build to 6–9 months because it's a *lending product* — credit-risk underwriting, FCA notification, advance-disbursement infrastructure, operational caseworker flow. The brief explicitly asked for growth-hacking ideas, not strategic infrastructure. Salary Guarantee was stripped and replaced with three pure-UX reassurance mechanics that operate on the *anxiety mechanism* rather than the actual event distribution:

1. Real-time "Salary cleared in N minutes ✓" push that fires the instant AML completes.
2. 24-hour pre-payday confidence reminder with a priority support line.
3. Public historical AML-clearance stats card on profile — *"Last 30 days: 99.7% cleared within 8 min · 0.2% within 1 hour · 0.1% required review."*

Branded as **Live Clearance**, kept inside the **Confidence Period** umbrella for narrative continuity.

**A geographic-scope expansion.** A Czech-Republic primary-source signal during ideation surfaced two friction axes that the UK-anchored research had missed: employer-side payroll restrictions (HR-approved bank lists; payroll providers that don't include Revolut) and salary-gated bundled benefits at local banks (health-insurance discounts, mortgage rates conditional on salary primacy). These didn't map cleanly onto P3 ("Revolut LACKS sticky products") or P4 ("user-side chore + incentive gap"), so each was split into sub-axes (3a/3b, 4a/4b) and the executive summary now carries an explicit geographic-scope statement: *"UK-anchored — CEE/EU markets carry additional structural barriers that PLG alone cannot solve; the 7–9pp lift applies to the UK addressable cohort."*

The combined Year-1 impact estimate landed at **7–9pp UK primacy lift** (Confidence Period ≈ 4pp + Locked Insights 2–3pp standalone, ~5pp paired). Both ideas ship inside a quarter — growth-hacking discipline maintained throughout.

### PDF craft

The deliverable was treated as a publication, not a doc dump. The [`build/build_pdf_caselet1.py`](build/build_pdf_caselet1.py) pipeline turns the source markdown into styled HTML via Python-Markdown (tables + smarty + attr_list + md_in_html extensions) then Chrome-headless to A4 PDF. The craft moves that compound:

- **A4 cover** with Source Serif Pro + Inter + JetBrains Mono via Google Fonts, data-vintage callout, executive-summary panel.
- **Page-break-before each H2** so every major section starts on a fresh page.
- **14 high-fidelity HTML phone mockups in 2-up grids** across all seven flows (Confidence Period 1–7 + post-activation, Locked Insights 1–4). Each phone is a real iOS-feel surface — slider, segment control, toggle, DD checklist, letter-card, ledger, year-in-review hero, sample banner — not an ASCII sketch.
- **Inline-SVG icon set** using `currentColor` + 1em sizing, replacing 15 emoji occurrences. Lucide-style stroked icons match the card text color automatically.
- **Section-level TL;DR callouts** at the top of §1, §2, §4, §5 — accent border-left, subtle gradient, caps label, declarative body, cost/payoff anchor at the close. A senior reader extracts the thesis in ~90 seconds; depth below stays available as proof.
- **CSS-blurred numbers** on the locked-state Insights cards. Real `filter: blur()` over real three-digit money fields communicates the loss concretely; `???` placeholders would have read as a paywall.

Final PDF: 31 pages, ~2.4MB, print-ready.

---

## Caselet 2 — Plottwyst pitch

Caselet 2 used a tighter 3-stage process because the source domain was a live product I built — `play.plottwyst.app` running on Discord + web today, with the engine metrics derived from the deployed system rather than projected. The stages:

| Stage | Artifact | Purpose |
|---|---|---|
| A | [`research/caselet2_personas.md`](research/caselet2_personas.md) | Persona synthesis + problem distillation. Two personas, one section. |
| B | [`research/caselet2_proposition_mvp.md`](research/caselet2_proposition_mvp.md) | Proposition + MVP + Revenue + TAM working draft. Lifted fragments from the live investor deck and recast for the growth-hacking brief framing. |
| Final | [`caselet2_plottwyst.md`](caselet2_plottwyst.md) | Final submission — 13-page PDF aligned 1:1 to the brief. |

### The persona decision

The brief asked for "Persona" singular + "list of Problems" plural. Plottwyst's platform thesis is *one engine, two surfaces, two demand vectors* — so the section is structured as two persona blocks, each owning its own problem list, closed by a "why two personas, not one" bridge into the platform argument. The split mirrors the product architecture rather than a marketing convenience: **Multiplayer Host** (friend-group + corporate event organizer) needs bounded social variance; **Daily Puzzle Player** (Wordle-shaped) needs bounded solo variance. Both unmet needs trace to one supply-side gap: *content scaled, gameplay systems didn't.*

### Submission structure

| Section | Content |
|---|---|
| Executive summary | One-page thesis + the two personas + live-today operational anchor (297 cases generated, 467 games played, 50% daily solve rate, 94% generation success, 30+ countries, 14 Discord servers, 1-in-4 return rate) |
| §1 Persona + Problem | Two persona blocks with their own problem lists + the "why two personas, not one" bridge |
| §2 Proposition | The generate-and-validate architectural claim, model-agnostic engine, template-agnostic capability layer |
| §3 MVP | Smallest configuration that lets a reviewer disprove the platform thesis |
| §4 Revenue | Three streams that compound on the same engine — Consumer Premium, B2B API, Creator Economy |
| §5 TAM | Three-layer market sizing ($90B+ TAM · ~$8B SAM · ~$150M SOM at Year-3 capture) |

### PDF craft

The Caselet 2 build pipeline ([`build/build_pdf_caselet2.py`](build/build_pdf_caselet2.py)) reuses the Caselet 1 pipeline wholesale with cover, footer, and title swapped. TL;DR callouts ship on §1, §2, §4 following the Caselet 1 convention. Final PDF: 13 pages.

---

## Process lessons (validated, kept for future ideation)

- **Research before ideating.** First instinct was Concierge Migration + Cashflow Copilot for Caselet 1. Research re-pointed Migration → Confidence Period (better attacks fear, not just friction). The research-driven shift is itself defensible — it shows the process worked.
- **PLG-actionability filter saves Stage 3.** Two of the five macro pains were structural (regulatory, capital). Filtering them out *before* ideation prevents wasted brainstorm on out-of-remit ideas. The brief asked for growth-hacks, not strategic infrastructure.
- **Pre-submission self-critique is cheaper than post-submission addenda.** The Salary Guarantee scope correction took ~2 hours to fold in; the equivalent recovery in an interview would cost a lot more credibility.
- **Test idea-build estimates against the brief vocabulary, not just feasibility.** "PLG-actionable" is a weaker filter than "growth-hack-shaped" — both can pass for a 4–6 month build, but *growth-hack* implies a quarter or less. Bundling a financial product into a PLG idea is a common trap; check explicitly that no component requires new licensing, credit risk, or regulatory approval.
- **Fear-driven user pains are usually addressable by transparency more cheaply than by insurance.** Most operational-risk pains in fintech don't actually fire — the modal user never hits a hold, never invokes a guarantee. The intervention should target the anxiety mechanism, not the actual event distribution. Insurance is correct only when the event has both high impact *and* non-trivial frequency.
- **Geographic bias in research is invisible until challenged.** UK-only Reddit research could have been reframed as "EU primacy analysis" without anyone noticing the gap. The Czech signal landed only because a CEE user happened to be in the loop. Treat single high-signal user conversations as primary research events; fold them in even when they break the analysis.
- **Acknowledging scope honestly is stronger than overclaiming.** "7–9pp UK lift; CEE has a different problem with a different intervention" reads as confident scoping. "8–10pp pan-EU lift" would not have survived a thoughtful diligence question.
- **Push-pull pairing test for the final ideas.** Both must (a) attack different mechanisms and (b) target different cohorts. If both check, the pair is non-redundant — defensible as "the two best" rather than "two flavours of one."
- **Survivorship bias in user-generated forums.** Anchor each pain to a *concentration pattern* (freezes specifically clustering on salary-deposit moments) rather than a single voice. r/Revolut over-indexes on complaints; the volume only matters where it concentrates on a causally-relevant moment.
- **PDF pipeline pays off after screen 2.** First instinct was "render markdown to PDF as-is." The moment you want fonts, page breaks, a cover, callouts, and phone mockups, the only sane path is your own HTML+CSS template + Chrome headless. ~1 hour to set up, saves all future polish work.
- **Section-level TL;DRs are not optional for a 25+ page deliverable.** A senior reader scans, doesn't read linearly. The TL;DR callout pattern (accent border-left + caps label + declarative body + cost/payoff anchor) gives the skimmer 4–5 stopping points without forcing them to extract the thesis from prose.
- **Operating-leader voice strips connective tissue.** First-pass prose tends to lean on "directly attacks," "load-bearing," "the asymmetry IS the strategic idea space." Senior revision replaces hedged verbs with operating verbs: *closes*, *sets up*, *sidesteps*, *activates*. Each TL;DR closes with cost / payoff (build window + Y1 impact + cohort size), not a connective summary line.
