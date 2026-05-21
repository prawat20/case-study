#!/usr/bin/env python3
"""Build a print-ready HTML for the CS2 Supporting Writeup, ready for Chrome headless -> PDF.

Mirrors the CS1 caselet pipeline (same fonts, A4 @page, cover, table/blockquote/code
styling) so the CS2 writeup PDF matches the Brief-1 deliverables. Caselet-specific
component CSS (phone mockups, exec-summary, etc.) is dropped — the writeup is pure prose.
"""

import re
from pathlib import Path

import markdown

BUILD_ROOT = Path(__file__).parent
CASE_ROOT = BUILD_ROOT.parent
SRC = CASE_ROOT / "supporting_writeup.md"
OUT_HTML = BUILD_ROOT / "supporting_writeup.html"

raw = SRC.read_text(encoding="utf-8")

# Strip the H1 + intro blockquote (everything up to and including the first --- after line 2);
# a custom cover is rendered instead. Body then starts at "## 1. North Star Metric".
lines = raw.split("\n")
cut_idx = 0
for i, line in enumerate(lines):
    if line.strip() == "---" and i > 2:
        cut_idx = i + 1
        break
body_md = "\n".join(lines[cut_idx:]).lstrip("\n")

# Python-markdown needs a blank line before a list block. Inject one wherever a `- `/`N.` line
# follows a non-empty, non-list line. Preserves all content.
def _ensure_blank_before_lists(text: str) -> str:
    out = []
    prev_was_blank_or_list = True
    for line in text.split("\n"):
        is_list = bool(re.match(r"^[ ]{0,3}([-*]|\d+\.) ", line))
        if is_list and not prev_was_blank_or_list:
            out.append("")
        out.append(line)
        prev_was_blank_or_list = (line.strip() == "") or is_list
    return "\n".join(out)

body_md = _ensure_blank_before_lists(body_md)

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

# Page-break before each major section (H2).
html_body = re.sub(r"<h2>", '<h2 class="section">', html_body)

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
    content: "Pravesh Rawat  ·  CS2  ·  Quarterly Planning  ·  Supporting Writeup";
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
  background: linear-gradient(180deg, #fafaf7 0%, #f1ece2 100%);
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
.cover h1 em { font-style: italic; color: var(--accent); font-weight: 500; }
.cover .subtitle {
  font-family: "Source Serif Pro", "Charter", Georgia, serif;
  font-style: italic;
  font-size: 14pt;
  color: var(--muted);
  max-width: 130mm;
  margin: 0 0 18mm 0;
  line-height: 1.4;
}
.cover .rule { width: 40mm; border-top: 1.5px solid var(--accent-2); margin: 0 0 10mm 0; }
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
.cover .footer .tag { text-transform: uppercase; letter-spacing: 0.18em; }

/* ---------- Body typography ---------- */
main { max-width: 170mm; margin: 0 auto; padding: 0; }
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
h3 { font-size: 14pt; font-weight: 600; margin-top: 8mm; margin-bottom: 2mm; color: var(--accent); }
h4 { font-size: 11.5pt; font-weight: 600; margin-top: 5mm; margin-bottom: 1.5mm; color: var(--ink); }
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
  page-break-inside: avoid;
}
blockquote p { margin-bottom: 2mm; }
blockquote p:last-child { margin-bottom: 0; }
blockquote strong { color: var(--accent-2); }

hr { border: none; border-top: 1px solid var(--rule); margin: 8mm 0; }

/* ---------- Code ---------- */
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
  margin: 4mm 0;
}
pre code { font: inherit; background: none; padding: 0; color: inherit; }
code {
  font-family: "JetBrains Mono", "SF Mono", "Menlo", monospace;
  font-size: 9.5pt;
  background: rgba(107,45,45,0.06);
  padding: 0.5pt 3pt;
  border-radius: 2px;
  color: var(--accent-2);
}

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
tbody td { padding: 2.5mm 3mm; border-bottom: 0.5px solid #e8e3d8; vertical-align: top; }
tbody tr:last-child td { border-bottom: none; }
tbody td:first-child { font-weight: 600; color: var(--ink); }
table strong { font-weight: 700; }
/* 3-column comparison tables: even weight on cols 2-3 */
table:has(th:nth-child(3):last-child) tbody td:nth-child(2),
table:has(th:nth-child(3):last-child) tbody td:nth-child(3) { font-weight: normal; }

/* ---------- Break control ---------- */
h2, h3, h4 { break-after: avoid-page; }
pre, table, blockquote { break-inside: avoid-page; }
"""

COVER = """
<section class="cover">
  <div class="eyebrow">Case Study · Brief 2 · Quarterly Planning</div>
  <h1>Supporting Writeup <em>— Sift</em></h1>
  <p class="subtitle">The operational layer behind the working tool: a product North Star
  metric, five events worth instrumenting, and a 21-question PM-interview validation bank.</p>
  <div class="rule"></div>
  <div class="meta">
    <div><b>Author</b> &nbsp; Pravesh Rawat</div>
    <div><b>Date</b> &nbsp; May 2026</div>
    <div><b>Companion to</b> &nbsp; the working tool at sift-pm.pages.dev</div>
  </div>
  <div class="footer">
    <span class="tag">Submission deliverable</span>
    <span>North Star &nbsp;·&nbsp; Five Events &nbsp;·&nbsp; Interview Bank</span>
  </div>
</section>
"""

HTML = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>CS2 · Quarterly Planning · Supporting Writeup</title>
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
