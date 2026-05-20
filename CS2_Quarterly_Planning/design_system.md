# Design System

> The visual, motion, and sonic vocabulary that the CS2 build runs on. Sits downstream of `product_pov.md` and upstream of every surface in `ia_and_surfaces.md`. Three principles override every choice below: **Zero Cognitive Load** (DfD-1), **Restraint** (Amie: *"products die from obesity"*), **Calm flow over output** (Linear: *"when execution becomes the default, we devalue the why"*).

---

## 1. The palette — warm light, single accent, restrained

**Warm paper-feel cream as page, pure white as elevated surface, sage as the only accent.** The choice traces directly to two research signals — 2026 minimalism's shift to "rooted earth tones" and Amie's joyful-but-not-loud language. Most PM tools default to cold dark on cold black; the inversion is deliberate.

### Why sage as the accent

Considered: Linear violet (`#5E6AD2`) — too associated with Linear, unoriginal. Soft amber/caramel — competes with status warning. Lavender — already a 2026 cliché. Deep ink-blue — too austere, kills joy. **Sage green (`#5A8F6F`)** — calm, distinctive among PM tools (most use blue/violet/teal), reads as *growth* and *momentum* in equal measure. One accent, used sparingly. When something is sage, it matters.

### Tokens

```css
/* Surfaces */
--page:           #F8F5EE;  /* warm cream, paper-feel */
--surface:        #FFFFFF;  /* pure white — cards float on cream */
--surface-sunken: #F2EFE7;  /* sub-surface (inbox stack background) */
--surface-hover:  #FBFAF5;  /* hover tint, almost imperceptible */

/* Ink — never pure black; ink is warm graphite */
--ink-1: #1A1815;   /* primary text, headings, numbers */
--ink-2: #58524A;   /* secondary text, body of cards */
--ink-3: #8C857A;   /* tertiary, captions, metadata */
--ink-4: #B8B0A2;   /* quaternary, placeholders, disabled */

/* Borders — subtle warm tint, never grey-cool */
--border-subtle: #ECE7DD;
--border-strong: #D9D2C5;

/* Accent — sage */
--accent:        #5A8F6F;
--accent-hover:  #4F7F62;
--accent-soft:   rgba(90, 143, 111, 0.10);  /* hover wash */
--accent-tint:   rgba(90, 143, 111, 0.04);  /* card-edge wash for active */

/* Status — warm-tinted, never neon */
--success:       #4A8159;   /* warmer, less screaming than #22c55e */
--warning:       #B5772A;   /* soft amber */
--danger:        #B04A47;   /* muted brick, not fire-red */
--success-soft:  rgba(74, 129, 89, 0.10);
--warning-soft:  rgba(181, 119, 42, 0.10);
--danger-soft:   rgba(176, 74, 71, 0.10);

/* Shadows — light theme leans on shadow more than dark; tune carefully */
--shadow-sm:     0 1px 2px rgba(26, 24, 21, 0.04);
--shadow-md:     0 2px 8px rgba(26, 24, 21, 0.06), 0 1px 2px rgba(26, 24, 21, 0.04);
--shadow-lg:     0 12px 32px rgba(26, 24, 21, 0.08), 0 4px 12px rgba(26, 24, 21, 0.05);
--shadow-focus:  0 0 0 3px rgba(90, 143, 111, 0.18);
```

### Dark theme (parallel set, not primary)

Earth-toned dark — warm graphite page, near-black elevated, same sage accent shifted slightly brighter. Optional via `prefers-color-scheme` + manual toggle. Not the default. Not the "vibe."

```css
[data-theme="dark"] {
  --page:           #16140F;
  --surface:        #1F1C16;
  --surface-sunken: #100E0A;
  --ink-1:          #F4F0E8;
  --ink-2:          #B8B0A2;
  --ink-3:          #8A8377;
  --accent:         #7AAE8B;  /* slight lift for contrast */
  --border-subtle:  #2A2620;
  --border-strong:  #3A332A;
}
```

### Color usage rules

1. **Sage is rare.** It marks: the active item, the primary CTA, a confirmed decision. Never decorative.
2. **Status colors live in soft-tints by default, full saturation only on alarm.** A sprint over capacity gets `--warning-soft`; a sprint *blocking ship* gets full `--warning`.
3. **No gradient backgrounds.** No glass/blur except in the command palette overlay.
4. **Chip color comes from semantic meaning** — revenue (sage tint), customer (warm amber tint), strategic (warm grey). Not from category randomization.

---

## 2. Typography — Inter for UI, serif for moments

A **display serif for personality moments** — page titles, the North Star number — runs alongside Inter for everything else. Inspired by Reflect, Cron, and Things 3. Warmth without compromising restraint.

### Families

```css
--font-sans:    "Inter", system-ui, -apple-system, sans-serif;
--font-serif:   "Fraunces", "Tiempos Headline", Georgia, serif;
--font-mono:    "JetBrains Mono", ui-monospace, "SF Mono", monospace;
```

**Inter** — UI text, body, controls. ~95% of the app.
**Fraunces** — display serif, only for "moments": page hero, NSM number, decision-lands celebration text. Used max 2-3 times per surface.
**JetBrains Mono** — timestamps, scores, IDs, numerics in tables.

### Scale — light-theme-tuned (light backgrounds compress hierarchy, so we need stronger steps)

| Role            | Size  | Line-height | Tracking | Weight | Family    |
|-----------------|-------|-------------|----------|--------|-----------|
| Display-NSM     | 40px  | 1.05        | -0.025em | 600    | serif     |
| Display-page    | 28px  | 1.15        | -0.018em | 500    | serif     |
| Heading-1       | 18px  | 1.35        | -0.01em  | 600    | sans      |
| Heading-2       | 15px  | 1.4         | -0.005em | 600    | sans      |
| Body-default    | 14px  | 1.55        | 0        | 400    | sans      |
| Body-emphasis   | 14px  | 1.55        | 0        | 500    | sans      |
| Caption         | 12.5px| 1.45        | 0        | 400    | sans      |
| Eyebrow         | 11px  | 1.3         | 0.08em   | 600    | sans (UC) |
| Numeric-default | 14px  | 1.4         | 0        | 500    | mono      |
| Numeric-display | 24px  | 1.1         | -0.01em  | 500    | mono      |

### Type rules

1. **Body at 14px.** Light backgrounds need more body weight than dark; 13px reads anemic on cream.
2. **Line-height 1.55 on body.** Cream calls for breathing room.
3. **Eyebrow labels are uppercase + 0.08em tracked** — used to label sections without competing with content (`OVERNIGHT SHIFTS`, `THIS SPRINT`).
4. **Numerics always mono** — in tables, in scorecards, in audit logs. Stops alignment jitter.
5. **Serif is a treat, not a style choice.** If a page has more than 3 serif elements, we've overused it.

---

## 3. Spacing rhythm — 4px base, generous

A 4px base scale, used wide rather than tight. Card-to-card vertical rhythm sits at 32px, section breaks at 48px — light backgrounds amplify density, so the rhythm errs generous.

```
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;   ← default card internal padding
--space-6:  32px;   ← card-to-card vertical gap on Inbox
--space-7:  48px;   ← surface section break
--space-8:  64px;   ← page-level sections
--space-9:  96px;   ← hero rests
```

Rules:
- **Card padding: 24px minimum.** No more 16px crammed cards.
- **Vertical rhythm: 32px between distinct items**, 48px between sections.
- **Max content width: 720px on standard surfaces, 880px on calendar** (multi-sprint visibility needs more).
- **Single column always** (DfD: no multi-column scanning). Side panels are not columns; they're contextual overlays.

---

## 4. Motion — meaning, not decoration

Borrowing the 2026 trend term **"resonant stark"** — minimalism with just enough motion to keep it human. Three durations, two easings, used disciplined.

### Tokens

```
--duration-instant:  100ms;   /* hover, tap feedback */
--duration-fast:     180ms;   /* default — buttons, chips, micro-state */
--duration-slow:     320ms;   /* layout shifts, panel entry */
--duration-celebrate: 720ms;  /* decision-lands, snap-as-plan */

--ease-out:        cubic-bezier(0.16, 1, 0.3, 1);     /* Linear-grade decel */
--ease-in:         cubic-bezier(0.4, 0, 0.84, 0.4);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot for celebration only */
```

### Motion language — what gets animation, what doesn't

| Moment | Motion |
|---|---|
| Hover on card | 100ms bg + border tint, no scale |
| Click commit | 720ms decision-lands choreography (card → calendar lane) |
| Triage card decision (D/R/P) | Card slides 120px in direction + fades, next card rises from below (240ms total) |
| Calendar drag-resequence | Real-time drag, ghost ripple shows downstream impact (180ms eased) |
| Snap-as-plan | Whole calendar pulses sage once, soft chime |
| Stakeholder artifact generated | Skeleton → text fade-in row by row, 80ms stagger |
| Page entry | Content settles from y+8px to y+0 in 320ms, ease-out — no sliding sheets, no fades-from-side |
| Anything else | No animation |

### What we explicitly avoid

- Bouncy springs except for *celebration* moments (commit, snap-plan).
- Parallax. Glassmorphism overlays beyond the cmd palette. Page-transitions that move whole layout.
- Loading spinners — replaced by skeleton states (Linear-grade craft).

---

## 5. Sound — Web Audio chimes, cream-context tuning

Five synthesised chimes, gain tuned ~30% softer than a typical dark-context UI — cream backgrounds need quieter sound.

| Event | Sound | Rationale |
|---|---|---|
| Capture (new ask saved) | Single soft pluck, A5, 120ms | Confirms entry, doesn't punctuate |
| Triage decision (D/R/P) | Three pitches by action — D=G4, R=B4, P=D5 | Audible decision colour |
| Commit | Two-tone D5+A5, fuller envelope, soft attack | Decision-lands beat |
| Snap-as-plan | Three-note C5+E5+G5, slight rev sweep | Full celebration |
| Override prompt fires | No sound | Speech-bubble appearance only — sound here would feel like correction |

Default ON. Browser tab-mute is the silence path; an in-app toggle is deferred — the chime set is conservative enough that the build doesn't yet earn one.

---

## 6. Iconography — Lucide, single weight

- Library: **Lucide** (already installed). 1.5px stroke. No emoji.
- Size scale: 14 / 16 / 20 / 24px. Default 16.
- Icons are functional, never decorative. Each icon answers "what does clicking here do?"
- **Status icons follow the warm palette** — `CheckCircle2` in `--success`, `AlertTriangle` in `--warning`, etc.

---

## 7. Components — what's in the kit

Locked component primitives (every surface composes these, no one-offs):

| Component | Purpose | Used on |
|---|---|---|
| `Card` | Base surface block, `--surface` bg, `--shadow-sm`, 24px padding | Everywhere |
| `EvidenceChip` | Semantic chip (revenue / deals / support / deadline / strategic) | Inbox, Prioritize |
| `FrameworkChip` | Active framework + score breakdown popover | Prioritize |
| `ActionRow` | 3-button bar (Commit / Defer / Escalate) with `↵` highlight on AI rec | Prioritize |
| `OverridePrompt` | Inline reason capture when user diverges from AI rec | Prioritize |
| `SprintLane` | Calendar sprint container, capacity bar, drop target | Sequence |
| `InitiativeChip` | Mini-card representing an initiative in calendar context | Sequence |
| `StakeholderArtifact` | Generated note for one audience, copy-to-Slack/Email/etc. | Communicate |
| `ActivityCard` | Action row: you did X → AI recommended Y · divergence flagged + "feeds recalibration" note | Audit |
| `Banner` | Strategic context (NSM + pace) | Top of Now |
| `CommandPalette` | `Cmd+K` global nav + actions (cmdk-based) | Global |

---

## 8. Three "wow" moments — designed in

These are the moments where Maya catches herself smiling. Documented, intentional, designed.

### Wow 1: Triage flow state

She starts triage. One card at a time, each ~280px tall, centered. She presses `P` `D` `R` `P` `P` `D` and the cards fade-slide in their decision direction. Counter at top counts down: `28 → 3`. When done, a soft chime + the page settles into "Inbox cleared today." She's done in 4 minutes what used to be 40.

### Wow 2: Calendar drag with ripple

She drags the SAML feature from Sprint 3 to Sprint 1. As she drags, a translucent ghost shows the ripple — Sprint 3's capacity bar drops, Sprint 1's bar fills, two downstream items get a sage outline ("these will push to Sprint 4"). She drops; soft confirm. Three things rearranged in 2 seconds with full visibility.

### Wow 3: Stakeholder artifact, mid-conversation

She's on a call with the sales lead. Cmd+K, "for sales," enter. The artifact materializes — line by line, 80ms stagger — three deals named, two timelines confirmed, one explicit deferral with reasoning. Click "copy as Slack." Paste. Sales lead reads silently and nods. The call ends 8 minutes early.

---

## 9. Accessibility — table stakes, not an afterthought

- WCAG AA contrast minimum on all text (`--ink-1` on `--page` = 14.8:1, comfortable above the 7:1 AAA bar).
- Every action has a keyboard shortcut. Triage is keyboard-first; mouse is fallback.
- `prefers-reduced-motion` halves all durations and removes celebration choreography.
- Focus rings use `--shadow-focus` (sage at 0.18 alpha) — visible on cream and white.
- Color is never the only signifier. Capacity-overflow is amber **and** has a `↑` indicator.

---

## 10. Implementation notes for the build

- Tailwind v4 already in place; tokens go into `globals.css` as CSS custom props (current pattern).
- Replace existing palette wholesale; no transition theme.
- Add `Fraunces` and `JetBrains Mono` via `next/font/google`. Keep `Inter` (already installed).
- Add `data-theme` attribute on `<html>` for dark-mode toggle. Default `light`.
- Motion: keep `framer-motion` (installed). Define a shared `motion.config.ts` exposing durations + easings as constants — no per-component magic numbers.

---

## 11. What the system explicitly avoids

- Cold dark page tones — palette is warm light by default.
- Linear-violet or other ubiquitous PM-tool accents — sage is the deliberate-distinct choice.
- Tight 13px body / 1.4 line-height — body sits at 14px / 1.55 because cream needs breathing room.
- 16px crammed card padding — minimum is 24px.
- Mono-only typographic feel — serif punctuates hero moments for warmth.
- Decorative gradients, glassmorphism beyond the cmd palette, parallax — all out.
