#!/usr/bin/env python3
"""Build a polished print-ready HTML for CS1 Caselet 1, ready for Chrome headless → PDF."""

import re
import sys
from pathlib import Path

import markdown

DOC_ROOT = Path(__file__).parent
SRC = DOC_ROOT / "cs1_caselet1_revolut.md"
OUT_HTML = DOC_ROOT / "cs1_caselet1_revolut.html"

raw = SRC.read_text(encoding="utf-8")

# Strip the H1 + H2 title block from the markdown body (we'll render a custom cover instead).
# The cover is hand-crafted; remove the first lines so the rendered body starts at "The wedge insight".
lines = raw.split("\n")
cut_idx = 0
for i, line in enumerate(lines):
    if line.strip() == "---" and i > 2:
        cut_idx = i + 1
        break
body_md = "\n".join(lines[cut_idx:]).lstrip("\n")

# Fix: Python-markdown requires a blank line before a list block. Inject one wherever
# a `- ` line follows a non-empty, non-list line. Preserves all content.
def _ensure_blank_before_lists(text: str) -> str:
    out = []
    prev_was_blank_or_list = True
    for line in text.split("\n"):
        is_list = bool(re.match(r"^[ ]{0,3}[-*] ", line))
        if is_list and not prev_was_blank_or_list:
            out.append("")
        out.append(line)
        prev_was_blank_or_list = (line.strip() == "") or is_list
    return "\n".join(out)

body_md = _ensure_blank_before_lists(body_md)

# Render markdown with the extensions we need.
md = markdown.Markdown(
    extensions=[
        "tables",
        "fenced_code",
        "attr_list",
        "def_list",
        "sane_lists",
        "md_in_html",
        "smarty",
    ],
    extension_configs={"smarty": {"smart_dashes": True, "smart_quotes": True, "smart_ellipses": True}},
)
html_body = md.convert(body_md)

# Add a class on every H2 so we can page-break before each major section.
html_body = re.sub(r"<h2>", '<h2 class="section">', html_body)

# Promote the "Why this attacks ..." / "What it is" mini-headers under each idea to a subtle style.
# Already H3 / H4 via markdown — keep as-is.

# Wrap each <pre><code>...</code></pre> in a figure-style block (already styled by CSS).

# Add bookmark IDs to a few section titles for navigation (browser/PDF outline).
def slugify(text: str) -> str:
    s = re.sub(r"<[^>]+>", "", text).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

def add_ids(match: re.Match) -> str:
    tag, attrs, inner = match.group(1), match.group(2), match.group(3)
    sid = slugify(inner)
    if "id=" in attrs:
        return match.group(0)
    return f'<{tag}{attrs} id="{sid}">{inner}</{tag}>'

html_body = re.sub(r"<(h[1-3])([^>]*)>(.*?)</\1>", add_ids, html_body, flags=re.S)

CSS = r"""
@page {
  size: A4;
  margin: 22mm 18mm 22mm 18mm;
  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    color: #8a8a8a;
  }
  @bottom-left {
    content: "Pravesh Rawat  ·  CS1  ·  Caselet 1  ·  Revolut Primacy";
    font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
    font-size: 8.5pt;
    color: #8a8a8a;
  }
}
@page :first {
  margin: 0;
  @bottom-center { content: none; }
  @bottom-left { content: none; }
}

:root {
  --ink: #181818;
  --muted: #5a5a5a;
  --soft: #8a8a8a;
  --rule: #d8d2c7;
  --bg-soft: #f7f4ee;
  --bg-code: #f4efe6;
  --accent: #142a4f;
  --accent-2: #6b2d2d;
}

html, body { background: white; color: var(--ink); }
body {
  font-family: "Source Serif Pro", "Source Serif 4", "Charter", Georgia, "Times New Roman", serif;
  font-size: 10.5pt;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  margin: 0;
}

/* ---------- Cover ---------- */
.cover {
  page-break-after: always;
  height: 297mm;
  width: 210mm;
  margin: 0;
  padding: 32mm 22mm;
  box-sizing: border-box;
  position: relative;
  background:
    linear-gradient(180deg, #fafaf7 0%, #f1ece2 100%);
  display: flex;
  flex-direction: column;
}
.cover .eyebrow {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 9.5pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent-2);
  margin-bottom: 24mm;
}
.cover h1 {
  font-family: "Source Serif Pro", "Source Serif 4", "Charter", Georgia, serif;
  font-weight: 600;
  font-size: 42pt;
  line-height: 1.08;
  color: var(--ink);
  margin: 0 0 4mm 0;
}
.cover h1 em {
  font-style: italic;
  color: var(--accent);
  font-weight: 500;
}
.cover .subtitle {
  font-family: "Source Serif Pro", "Charter", Georgia, serif;
  font-style: italic;
  font-size: 14pt;
  color: var(--muted);
  max-width: 130mm;
  margin: 0 0 18mm 0;
  line-height: 1.4;
}
.cover .rule {
  width: 40mm;
  border-top: 1.5px solid var(--accent-2);
  margin: 0 0 10mm 0;
}
.cover .meta {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 10pt;
  color: var(--muted);
  line-height: 1.7;
}
.cover .meta b { color: var(--ink); font-weight: 600; }

.cover .footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: "Inter", sans-serif;
  font-size: 9pt;
  color: var(--soft);
  letter-spacing: 0.04em;
}
.cover .footer .tag {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

/* ---------- Body typography ---------- */
main {
  max-width: 170mm;
  margin: 0 auto;
  padding: 0;
}
h1, h2, h3, h4 {
  font-family: "Source Serif Pro", "Source Serif 4", "Charter", Georgia, serif;
  color: var(--ink);
  page-break-after: avoid;
}
h2.section {
  font-size: 22pt;
  font-weight: 600;
  letter-spacing: -0.005em;
  border-top: 1px solid var(--rule);
  padding-top: 8mm;
  margin-top: 10mm;
  margin-bottom: 5mm;
  page-break-before: always;
}
h2.section:first-of-type {
  page-break-before: auto;
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}
h3 {
  font-size: 14pt;
  font-weight: 600;
  margin-top: 8mm;
  margin-bottom: 2mm;
  color: var(--accent);
}
h4 {
  font-size: 11.5pt;
  font-weight: 600;
  margin-top: 5mm;
  margin-bottom: 1.5mm;
  color: var(--ink);
}
p { margin: 0 0 3.5mm 0; orphans: 3; widows: 3; }

strong { color: var(--ink); font-weight: 700; }
em { color: #2a2a2a; }

a { color: var(--accent); text-decoration: none; border-bottom: 0.5px solid rgba(20,42,79,0.3); }

ul, ol { margin: 0 0 4mm 0; padding-left: 6mm; }
li { margin-bottom: 1.5mm; }
li > p { margin: 0; }

blockquote {
  margin: 4mm 0 4mm 0;
  padding: 2mm 5mm;
  border-left: 2px solid var(--accent-2);
  color: var(--muted);
  font-style: italic;
  font-size: 10.5pt;
  background: linear-gradient(90deg, rgba(107,45,45,0.04), transparent 90%);
}
blockquote p { margin-bottom: 2mm; }
blockquote p:last-child { margin-bottom: 0; }

hr { border: none; border-top: 1px solid var(--rule); margin: 8mm 0; }

/* ---------- Code blocks (ASCII mockups) ---------- */
pre {
  background: var(--bg-code);
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 4mm 5mm;
  font-family: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", monospace;
  font-size: 8.5pt;
  line-height: 1.45;
  color: #2a2a2a;
  page-break-inside: avoid;
  white-space: pre;
  overflow: visible;
  margin: 4mm 0;
}
pre code { font: inherit; }
code {
  font-family: "JetBrains Mono", "SF Mono", "Menlo", monospace;
  font-size: 9.5pt;
  background: rgba(107,45,45,0.06);
  padding: 0.5pt 3pt;
  border-radius: 2px;
  color: var(--accent-2);
}
pre code { background: none; padding: 0; color: inherit; font-size: inherit; }

/* ---------- Tables ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 4mm 0 5mm 0;
  font-size: 9.5pt;
  page-break-inside: avoid;
}
thead th {
  background: var(--bg-soft);
  color: var(--ink);
  font-family: "Inter", sans-serif;
  font-weight: 600;
  text-align: left;
  padding: 2.5mm 3mm;
  border-bottom: 1px solid var(--rule);
  font-size: 9pt;
  letter-spacing: 0.01em;
}
tbody td {
  padding: 2.5mm 3mm;
  border-bottom: 0.5px solid #e8e3d8;
  vertical-align: top;
}
tbody tr:last-child td { border-bottom: none; }
tbody td:first-child { font-weight: 600; color: var(--ink); }
table strong { font-weight: 700; }

/* ---------- Misc ---------- */
.intro-quote {
  font-style: italic;
  color: var(--muted);
  border-left: none;
  font-size: 11pt;
  margin: 0 0 8mm 0;
  padding: 0;
}

/* Pair-table (the comparison) — slightly stronger emphasis */
table:has(th:nth-child(3):last-child) tbody td:nth-child(2),
table:has(th:nth-child(3):last-child) tbody td:nth-child(3) {
  font-weight: normal;
}

/* Footnote-style appendix */
h2#appendix-evidence-sources + p { font-size: 10pt; color: var(--muted); }

/* ---------- Executive summary panel ---------- */
/* The Executive Summary section gets a subtle accent rule + tighter typography
   so it visually reads as a self-contained briefing card. */
h2#executive-summary {
  color: var(--accent);
}
h2#executive-summary + p em,
h2#executive-summary + p {
  font-size: 10pt;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 6mm;
}
h2#executive-summary ~ p strong:first-child,
h2#executive-summary ~ p > strong:first-of-type {
  color: var(--accent);
}
h2#executive-summary ~ table {
  font-size: 9pt;
  margin: 3mm 0 4mm 0;
}
h2#executive-summary ~ table th,
h2#executive-summary ~ table td {
  padding: 1.8mm 2.5mm;
  line-height: 1.4;
}
h2#executive-summary ~ table th { background: #efeae0; }
h2#executive-summary ~ table td:first-child { background: #f7f4ee; }

/* Tighten paragraph spacing within the exec summary so it fits one page */
h2#executive-summary ~ p {
  margin-bottom: 3mm;
}

/* ---------- Data-vintage callout ---------- */
.data-vintage {
  background: #f7f4ee;
  border-left: 2px solid var(--accent);
  padding: 3mm 5mm;
  margin: 6mm 0 2mm 0;
  font-size: 9pt;
  line-height: 1.5;
  color: var(--muted);
}
.data-vintage p { margin: 0; }
.data-vintage strong { color: var(--ink); }

/* ---------- Cohort glossary callout ---------- */
.glossary {
  background: #f4efe6;
  border-left: 2px solid var(--accent-2);
  padding: 3mm 5mm;
  margin: 4mm 0 5mm 0;
  font-size: 9.5pt;
  line-height: 1.55;
  color: var(--ink);
}
.glossary p { margin: 0; }
.glossary strong { color: var(--accent-2); }

/* ---------- High-fidelity mobile screen mockups ---------- */
.screens-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6mm 8mm;
  margin: 5mm 0 6mm 0;
  page-break-inside: avoid;
}
.screen-cell { page-break-inside: avoid; }
.screen-cell .caption {
  text-align: center;
  font-size: 9pt;
  color: var(--muted);
  font-style: italic;
  margin: 2.5mm 4mm 0 4mm;
  line-height: 1.35;
  font-family: "Source Serif Pro", serif;
}

.phone {
  width: 64mm;
  background: linear-gradient(160deg, #1a1a1f 0%, #0c0c10 100%);
  border-radius: 7mm;
  padding: 1mm;
  box-shadow: 0 0.8mm 2.6mm rgba(0,0,0,0.18), 0 0 0 0.2mm rgba(0,0,0,0.4);
  margin: 0 auto;
}
.phone-inner {
  background: #ffffff;
  border-radius: 6mm;
  overflow: hidden;
  aspect-ratio: 360 / 760;
  display: flex;
  flex-direction: column;
  font-family: "Inter", "Helvetica Neue", sans-serif;
  color: #0a0c12;
  position: relative;
}
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.2mm 4.5mm 0.5mm 4.5mm;
  font-size: 5.5pt;
  font-weight: 600;
  color: #0a0c12;
}
.status-bar .right { display: flex; gap: 1.4mm; align-items: center; }
.status-bar .battery {
  display: inline-block; width: 4mm; height: 1.8mm;
  border: 0.3mm solid #0a0c12; border-radius: 0.4mm;
  position: relative;
}
.status-bar .battery::after {
  content: ""; position: absolute;
  top: 0.2mm; left: 0.2mm; bottom: 0.2mm; width: 86%;
  background: #0a0c12; border-radius: 0.2mm;
}
.nav-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2mm 4.5mm 2mm 4.5mm;
}
.nav-bar .back { font-size: 9pt; color: #0a0c12; line-height: 1; }
.nav-bar .title { font-weight: 700; font-size: 7pt; letter-spacing: -0.01em; }
.nav-bar .more { font-size: 9pt; color: #5d5d6b; line-height: 1; }

.screen-body {
  flex: 1; padding: 0 4.5mm 4mm 4.5mm;
  font-size: 6pt; line-height: 1.45;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.sb-h1 { font-size: 11pt; font-weight: 700; letter-spacing: -0.015em; margin: 1mm 0 1.5mm 0; line-height: 1.15; }
.sb-h2 { font-size: 8.5pt; font-weight: 600; margin: 0 0 1.5mm 0; line-height: 1.2; }
.sb-sub { font-size: 6pt; color: #5d5d6b; margin: 0 0 3mm 0; line-height: 1.4; }
.sb-section-label {
  font-size: 5pt; letter-spacing: 0.08em; text-transform: uppercase;
  color: #87878f; font-weight: 600; margin: 2mm 0 1.2mm 0;
}

.card {
  background: #fbfbfd; border: 0.25mm solid #e8e8ee;
  border-radius: 2mm; padding: 2.5mm 2.8mm;
  margin-bottom: 2mm;
  position: relative;
}
.card.locked { background: #faf7ef; border-color: #ece5d2; }
.card.live { background: #f4fbf6; border-color: #c8e8d4; }
.card.warn { background: #fff8ea; border-color: #f0d99a; }
.card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 2mm; }
.card-icon { font-size: 9pt; line-height: 1; }
.card-lock { color: #b59647; font-size: 6.5pt; line-height: 1; }
.card-title { font-weight: 700; font-size: 7.5pt; letter-spacing: -0.01em; line-height: 1.2; margin-bottom: 0.6mm; }
.card-body { font-size: 6pt; color: #3a3a44; line-height: 1.35; }
.card-cta { margin-top: 1.5mm; font-size: 5.5pt; color: #0066ff; font-weight: 600; }

.blur {
  filter: blur(1.6px);
  -webkit-filter: blur(1.6px);
  display: inline-block;
  color: #0a0c12;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cta-primary {
  background: #0a0c12; color: #fff;
  text-align: center; padding: 2.4mm;
  border-radius: 1.8mm;
  font-weight: 600; font-size: 7pt;
  margin-top: auto;
}
.cta-secondary {
  text-align: center; padding: 1.8mm;
  font-size: 6.5pt; color: #5d5d6b;
  margin-top: 1mm;
}

.amount-pill {
  display: inline-block;
  font-weight: 800; font-size: 8pt;
  letter-spacing: -0.01em;
}
.success-pill {
  display: inline-block; background: #e7f7ec; color: #0a7a3e;
  padding: 0.6mm 1.5mm; border-radius: 1mm;
  font-size: 5pt; font-weight: 600; letter-spacing: 0.02em;
  text-transform: uppercase;
}
.warn-pill {
  display: inline-block; background: #fff0d4; color: #a05f00;
  padding: 0.6mm 1.5mm; border-radius: 1mm;
  font-size: 5pt; font-weight: 600; letter-spacing: 0.02em;
  text-transform: uppercase;
}

.toast {
  background: #0a0c12; color: #fff;
  border-radius: 2mm; padding: 2.5mm 3mm;
  font-size: 6pt; line-height: 1.4;
  margin: 1.5mm 0;
}
.toast .toast-title { font-weight: 700; font-size: 6.8pt; margin-bottom: 0.5mm; }
.toast.success { background: #0a7a3e; }
.toast.warn { background: #a05f00; }

.slider {
  margin: 1.5mm 0 3mm 0;
}
.slider .track {
  height: 0.8mm; background: #ececf0; border-radius: 0.4mm;
  position: relative;
}
.slider .fill {
  position: absolute; top: 0; bottom: 0; left: 0;
  background: #0a0c12; border-radius: 0.4mm;
}
.slider .knob {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 2.8mm; height: 2.8mm; border-radius: 50%;
  background: #fff; border: 0.6mm solid #0a0c12;
  box-shadow: 0 0.2mm 0.6mm rgba(0,0,0,0.15);
}
.slider .labels {
  display: flex; justify-content: space-between;
  margin-top: 1mm; font-size: 5pt; color: #87878f;
}

.toggle-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.8mm 0; border-top: 0.2mm solid #ececf0;
}
.toggle-row:first-child { border-top: none; }
.toggle-row .label { font-size: 6.5pt; font-weight: 600; }
.toggle-row .sub { font-size: 5.5pt; color: #87878f; }
.toggle {
  width: 5.5mm; height: 3mm; border-radius: 1.5mm;
  background: #0a0c12; position: relative;
}
.toggle::after {
  content: ""; position: absolute; top: 0.4mm; right: 0.4mm;
  width: 2.2mm; height: 2.2mm; border-radius: 50%; background: #fff;
}
.toggle.off { background: #d8d8de; }
.toggle.off::after { right: auto; left: 0.4mm; }

/* Banner / inbox-style hook surface for the entry mock */
.home-card {
  background: linear-gradient(135deg, #0a0c12 0%, #1d2238 100%);
  color: #fff; border-radius: 2.5mm;
  padding: 3mm 3.2mm; margin-bottom: 2mm;
}
.home-card .kicker {
  font-size: 5pt; letter-spacing: 0.1em; text-transform: uppercase;
  color: #b8c4e6; font-weight: 600; margin-bottom: 1mm;
}
.home-card .head { font-size: 8.5pt; font-weight: 700; line-height: 1.2; margin-bottom: 1.2mm; }
.home-card .body { font-size: 5.8pt; color: #cdd5ed; line-height: 1.4; margin-bottom: 2mm; }
.home-card .pill-cta {
  display: inline-block; background: #fff; color: #0a0c12;
  padding: 1.2mm 2.5mm; border-radius: 5mm;
  font-size: 5.5pt; font-weight: 700;
}

/* ---------- Inline SVG icons (replace emojis 2026-05-12) ---------- */
.ico {
  display: inline-block;
  width: 1em; height: 1em;
  vertical-align: -0.18em;
  color: inherit;
  stroke: currentColor;
  fill: none;
}
.card-icon .ico { width: 1em; height: 1em; }
.yir-icon .ico { color: #0a0c12; }
.action-icon .ico { color: #b88a3a; }

/* ---------- New screen classes (2026-05-12 — CP screens 1-7, LI screens 2-4) ---------- */
.provider-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 1.4mm; margin: 1.5mm 0 2mm 0;
}
.provider {
  background: #fbfbfd; border: 0.25mm solid #e8e8ee;
  border-radius: 1.5mm; padding: 1.8mm 1.5mm;
  font-size: 5.4pt; font-weight: 600;
  text-align: center; color: #0a0c12; line-height: 1.1;
}

.kv-row {
  display: flex; justify-content: space-between;
  padding: 1mm 0; font-size: 6pt;
  border-top: 0.2mm solid #ece5d2;
}
.kv-row:first-child { border-top: none; }
.kv-key { color: #5d5d6b; font-weight: 500; }
.kv-val { font-weight: 700; color: #0a0c12; display: flex; gap: 1.2mm; align-items: center; }
.kv-meta { font-weight: 400; color: #87878f; font-size: 5.2pt; font-style: italic; }

.check-row {
  display: flex; align-items: center; gap: 1.5mm;
  padding: 1.2mm 0; font-size: 6pt;
  border-top: 0.2mm solid #ececf0;
}
.check-row:first-of-type { border-top: none; }
.check {
  width: 2.4mm; height: 2.4mm; border: 0.3mm solid #87878f;
  border-radius: 0.5mm; display: inline-block; flex-shrink: 0;
}
.check-label { color: #3a3a44; }

.letter-card {
  background: #f7f4ee; border: 0.25mm solid #ece5d2;
  border-radius: 1.5mm; padding: 2.2mm 2.5mm;
  font-size: 5.6pt; line-height: 1.4;
  margin: 1mm 0 2mm 0;
}
.letter-to { font-weight: 700; margin-bottom: 1mm; color: #0a0c12; font-size: 5.8pt; }
.letter-body { color: #3a3a44; margin-bottom: 1.5mm; }
.letter-fields > div {
  display: flex; justify-content: space-between;
  padding: 0.4mm 0;
}
.letter-key { color: #87878f; font-size: 5.2pt; }
.letter-val {
  font-weight: 700; color: #0a0c12;
  font-family: "JetBrains Mono", "SF Mono", "Menlo", monospace;
  font-size: 5.4pt; letter-spacing: -0.01em;
}

.action-row {
  display: flex; align-items: center; gap: 2mm;
  padding: 1.8mm 0;
  border-top: 0.2mm solid #ececf0;
  font-size: 6.2pt;
}
.action-row:first-of-type { border-top: none; }
.action-row.alt { background: #f7f4ee; border-radius: 1.5mm; padding-left: 2mm; padding-right: 2mm; margin-top: 1mm; border-top: none; }
.action-icon { font-size: 7.5pt; width: 4mm; color: #0a0c12; }
.action-label { font-weight: 600; color: #0a0c12; flex: 1; font-size: 6pt; }
.action-row.alt .action-icon { color: #b88a3a; }
.action-meta { color: #87878f; font-weight: 400; font-size: 5.2pt; margin-left: 0.8mm; font-style: italic; }

.seg-control {
  display: flex; margin: 0 0 3mm 0;
  border: 0.3mm solid #d8d8de; border-radius: 1.5mm;
  overflow: hidden;
}
.seg {
  flex: 1; text-align: center;
  padding: 1.8mm 0; font-size: 7pt; font-weight: 600;
  color: #87878f; background: #fff;
  border-right: 0.2mm solid #ececf0;
}
.seg:last-child { border-right: none; }
.seg.active { background: #0a0c12; color: #fff; }

.slider .labels .value { font-weight: 700; color: #0a0c12; font-size: 5.5pt; }
.slider .labels .rec { font-weight: 400; color: #87878f; font-style: italic; font-size: 5pt; margin-left: 0.5mm; }

.disclosure {
  font-size: 5.2pt; color: #87878f; font-style: italic;
  text-align: center; margin: 1.5mm 0 1.2mm 0;
  padding: 1.2mm 0 0 0; border-top: 0.2mm solid #ececf0;
  line-height: 1.4;
}

.dd-row {
  display: flex; align-items: center; gap: 1.8mm;
  padding: 1.2mm 0; font-size: 6pt;
  border-bottom: 0.2mm solid #ececf0;
}
.dd-row:last-of-type { border-bottom: none; }
.dd-check {
  width: 2.6mm; height: 2.6mm; border: 0.3mm solid #87878f;
  border-radius: 0.5mm; display: inline-flex;
  align-items: center; justify-content: center;
  font-size: 4.8pt; color: transparent; flex-shrink: 0;
}
.dd-check.on { background: #0a0c12; color: #fff; border-color: #0a0c12; font-weight: 800; }
.dd-check.lock {
  background: transparent; color: #b88a3a; border-color: transparent;
  font-size: 6pt; line-height: 1;
}
.dd-name { flex: 1; color: #0a0c12; font-weight: 500; font-size: 6pt; }
.dd-amt {
  color: #3a3a44; font-weight: 700; font-size: 5.6pt;
  font-family: "JetBrains Mono", "SF Mono", "Menlo", monospace;
}
.dd-row.locked .dd-name { color: #87878f; font-weight: 400; }
.dd-row.locked .dd-amt { color: #87878f; font-weight: 500; }

.summary-card {
  background: #fbfbfd; border: 0.25mm solid #e8e8ee;
  border-radius: 2mm; padding: 2.5mm 2.8mm;
  margin: 1mm 0 2mm 0;
}
.sum-row {
  display: flex; justify-content: space-between;
  padding: 1.3mm 0; font-size: 6pt;
  border-top: 0.2mm solid #ececf0;
  align-items: center;
}
.sum-row:first-child { border-top: none; }
.sum-key { color: #5d5d6b; }
.sum-val { font-weight: 700; color: #0a0c12; }

.cta-secondary.alt {
  text-align: center; padding: 1.6mm 2.5mm;
  background: #fbfbfd; border: 0.25mm solid #e8e8ee;
  border-radius: 1.8mm; color: #0a0c12; font-weight: 600;
  margin-top: 1.2mm; font-size: 6.2pt;
}

.balance-block {
  text-align: center; margin: 1mm 0 1.5mm 0;
  padding: 1.5mm 0;
}
.balance-block.guarantee { padding: 1mm 0 1.5mm 0; }
.balance-label {
  font-size: 5pt; color: #87878f; letter-spacing: 0.08em;
  text-transform: uppercase; font-weight: 600;
}
.balance-amt {
  font-size: 13pt; font-weight: 800;
  letter-spacing: -0.025em; color: #0a0c12;
  margin-top: 0.4mm; line-height: 1.1;
}
.balance-sub {
  font-size: 5.2pt; color: #5d5d6b; margin-top: 0.8mm;
  padding: 0 3mm; line-height: 1.4;
}

.ledger-row {
  display: flex; align-items: center; gap: 1.8mm;
  padding: 0.9mm 0; font-size: 5.4pt;
  border-top: 0.2mm solid #ececf0;
}
.ledger-row:first-of-type { border-top: none; }
.ledger-time {
  color: #87878f; width: 14mm;
  font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 5pt;
}
.ledger-label { flex: 1; color: #0a0c12; font-weight: 500; }
.ledger-amt {
  font-weight: 700; color: #0a0c12;
  font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 5.4pt;
}
.ledger-amt.muted { color: #87878f; font-weight: 500; }

.celebration {
  text-align: center; padding: 2.5mm 0 1.5mm 0;
  margin-bottom: 1.5mm;
}
.celebration-burst {
  font-size: 16pt; color: #b88a3a;
  margin-bottom: 1.2mm; line-height: 1;
}
.celebration .sb-h1 { margin: 0 0 1.5mm 0; }

.sample-banner {
  background: #fff8ea; border: 0.25mm solid #f0d99a;
  border-radius: 1.5mm; padding: 1.6mm 2mm;
  font-size: 5.4pt; color: #6b4f1a;
  text-align: center; line-height: 1.35;
  margin: 1mm 0 2mm 0;
}

.sub-list { margin: 1.4mm 0 1mm 0; }
.sub-row {
  display: flex; justify-content: space-between;
  padding: 0.7mm 0; font-size: 5.4pt;
  border-top: 0.2mm solid #ececf0;
}
.sub-row:first-child { border-top: none; }
.sub-name { color: #0a0c12; font-weight: 500; }
.sub-meta { color: #87878f; font-style: italic; font-size: 5pt; }

.card-cta-row {
  display: flex; gap: 1.2mm; margin-top: 1.5mm;
  flex-wrap: wrap;
}
.mini-cta {
  background: #0a0c12; color: #fff;
  padding: 1.1mm 2.2mm; border-radius: 1.2mm;
  font-size: 5.2pt; font-weight: 700; letter-spacing: 0.01em;
}
.mini-cta.alt {
  background: transparent; color: #0a4ad8;
  border: 0.25mm solid #cfd8ec;
}

.yir-hero {
  text-align: center;
  padding: 2.8mm 0 2mm 0;
  background: linear-gradient(160deg, #0a0c12 0%, #1d2238 100%);
  color: #fff; border-radius: 2mm;
  margin-bottom: 2mm;
}
.yir-label {
  font-size: 5pt; color: #b8c4e6;
  letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
}
.yir-amt {
  font-size: 18pt; font-weight: 800;
  letter-spacing: -0.025em; margin: 0.4mm 0; line-height: 1.05;
}
.yir-sub { font-size: 5.6pt; color: #cdd5ed; padding: 0 4mm; line-height: 1.35; }

.yir-row {
  display: flex; align-items: center; gap: 1.8mm;
  padding: 1.1mm 0; font-size: 6pt;
  border-top: 0.2mm solid #ececf0;
}
.yir-row:first-of-type { border-top: none; }
.yir-icon { font-size: 7pt; width: 4mm; line-height: 1; }
.yir-name { flex: 1; color: #0a0c12; font-weight: 500; }
.yir-amt-sm {
  font-weight: 700; color: #0a0c12; font-size: 6pt;
  font-family: "JetBrains Mono", "SF Mono", monospace;
}

/* ---------- Risks / open-questions callout ---------- */
.risks {
  background: #f7f4ee;
  border-left: 2px solid #b88a3a;
  padding: 4mm 5mm 4mm 5mm;
  margin: 4mm 0 4mm 0;
  font-size: 9.5pt;
  line-height: 1.5;
  page-break-inside: avoid;
}
.risks ul { margin: 0; padding-left: 5mm; }
.risks li { margin-bottom: 2mm; }
.risks li:last-child { margin-bottom: 0; }
.risks strong { color: var(--ink); }
.risks em { color: #6b4f1a; }

/* Avoid orphan headings */
h2, h3, h4 { break-after: avoid-page; }
pre, table, blockquote { break-inside: avoid-page; }

/* Tighter spacing for the macro-category H3s under section 1 + 2 */
h3 { break-after: avoid-page; }

/* Make the first paragraph after the cover (wedge-insight intro) feel like a lede */
main > h3:first-of-type {
  font-size: 16pt;
  color: var(--accent);
  margin-top: 0;
}
"""

COVER = """
<section class="cover">
  <div class="eyebrow">Case Study · Growth Hacking · Caselet 1</div>
  <h1>Revolut <em>Primacy</em></h1>
  <p class="subtitle">Why Revolut users don't make it primary — and two growth-hacking
  ideas, sized to compound, that move the dial without paying for the salary.</p>
  <div class="rule"></div>
  <div class="meta">
    <div><b>Author</b> &nbsp; Pravesh Rawat</div>
    <div><b>Date</b> &nbsp; May 2026</div>
    <div><b>Length</b> &nbsp; Caselet 1 of 2 · standalone deliverable</div>
  </div>
  <div class="footer">
    <span class="tag">Submission deliverable</span>
    <span>Push &nbsp;·&nbsp; Pull</span>
  </div>
</section>
"""

HTML = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>CS1 · Caselet 1 · Revolut Primacy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
{COVER}
<main>
{html_body}
</main>
</body>
</html>
"""

OUT_HTML.write_text(HTML, encoding="utf-8")
print(f"Wrote {OUT_HTML} ({len(HTML):,} bytes)")
