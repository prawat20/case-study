# Brief 1 — Growth Hacking

> Two caselets in one brief. Caselet 1 is a Revolut Primacy growth-hack proposal. Caselet 2 is a Plottwyst product pitch. Both ship as A4 print-ready PDFs.

---

## What to read, in what order

| Order | Document | What it gives you |
|---|---|---|
| 1 | **[`approach.md`](approach.md)** | How both caselets were approached — reading the brief, research method, synthesis framework, decision framework, deliverable design. One read covers the full methodology. |
| 2 | **[`/CS1_Caselet1_Revolut_Primacy.pdf`](../CS1_Caselet1_Revolut_Primacy.pdf)** | Caselet 1 deliverable — 31-page print-ready PDF with full UX flows, hooks, comms, and metrics for two growth-hacking ideas. |
| 3 | **[`/CS1_Caselet2_Plottwyst.pdf`](../CS1_Caselet2_Plottwyst.pdf)** | Caselet 2 deliverable — 13-page print-ready PDF aligned 1:1 to the brief sections. |
| 4 | [`methodology_trace.md`](methodology_trace.md) | The longer process record. Read this if you want the stage-by-stage trace, source bibliography, and validated process lessons. |
| 5 | [`research/`](research/) | The working artifacts that fed the submissions — research, synthesis, ideation. Read these to stress-test specific claims. |
| 6 | [`build/`](build/) | The Python-Markdown + Chrome-headless pipeline that turns source markdown into the PDFs. Editable; reproducible. |

---

## The submissions in one paragraph each

**Caselet 1 — Revolut Primacy.** A push-pull pair sized for a conservative 7–9pp UK primacy lift in Year 1. **Confidence Period** (3-salary-cycle Open-Banking parallel-run + auto-mirror + Live Clearance reassurance layer) attacks P1 (perceived operational risk) and P4 (switching friction). **Locked Insights** (visible-but-locked salary-aware intelligence on existing Revolut Analytics) attacks P5 (primacy-hostile surface) and the V2 vitamin mistarget. Both ideas ship inside a quarter — UX-only, no new financial product, no licensing surface (growth-hacking discipline maintained). Built via a 4-stage research-first process with Reddit primary sources (17 threads, ~1,000 comments synthesised) and a Czech-Republic user signal that surfaced two CEE structural pain axes folded into §1 with explicit geographic scoping.

**Caselet 2 — Plottwyst pitch.** Brief-aligned five-section pitch (Persona + Problem · Proposition · MVP · Revenue · TAM) for the narrative-game platform I built (`play.plottwyst.app`, live on Discord + web today). §1 splits into two personas — Multiplayer Host and Daily Puzzle Player — each with its own problem list, closed by a "why two personas, not one" bridge into the platform thesis. The engine and traction claims (297 cases generated, 467 games played, 94% generation success rate, 30+ countries, 14 Discord servers, 1-in-4 return rate) are derived from the deployed system, not projected.

---

## File map

```
CS1_Growth_Hacking/
├── README.md                          ← you are here
├── approach.md                        Methodology summary for both caselets
├── methodology_trace.md               Longer process record · stage-by-stage trace
├── caselet1_revolut_primacy.md        Caselet 1 submission source (renders to PDF)
├── caselet2_plottwyst.md              Caselet 2 submission source (renders to PDF)
├── build/
│   ├── build_pdf_caselet1.py          Markdown → styled HTML → A4 PDF
│   ├── build_pdf_caselet2.py          Same pipeline · cover + footer + title swapped
│   ├── caselet1_revolut_primacy.html  Intermediate render
│   └── caselet2_plottwyst.html        Intermediate render
└── research/
    ├── revolut_pain_research.md       Stage 1 — desk + Reddit primary research
    ├── revolut_painkiller_vitamin.md  Stage 2 — 5×5 macro pain/vitamin · asymmetry matrix
    ├── revolut_ideation.md            Stage 3 — 17 ideas · 4-axis scoring · push-pull pair
    ├── caselet2_personas.md           Caselet 2 — persona synthesis
    └── caselet2_proposition_mvp.md    Caselet 2 — proposition/MVP/revenue/TAM working draft
```

---

## Rebuilding the PDFs

```bash
cd CS1_Growth_Hacking/build
python3 build_pdf_caselet1.py    # writes caselet1_revolut_primacy.html
python3 build_pdf_caselet2.py    # writes caselet2_plottwyst.html
```

Then Chrome headless prints to PDF:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../../CS1_Caselet1_Revolut_Primacy.pdf" \
  "file://$(pwd)/caselet1_revolut_primacy.html"
```

Dependencies: Python 3, `markdown` package (`pip install markdown`). Cover, fonts (Source Serif Pro / Inter / JetBrains Mono via Google Fonts), and section-level TL;DR callouts are baked into the build script's CSS.
