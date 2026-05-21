# Case Study — Growth Hacking · Caselet 2
## Plottwyst — The Narrative Game Platform

> Submission deliverable. Structure follows the brief verbatim: (1) Persona + Problem · (2) Proposition · (3) MVP · (4) Revenue · (5) TAM. One product idea, end-to-end pitch.

---

## Executive summary

*One-page distillation. The body that follows is the working-out — read it if you want to stress-test the personas, the engine claim, or the market sizing.*

**Thesis.** Narrative games stall because **content scaled but gameplay systems didn't**. Among Us crashed 95% from peak ("same maps, same game"). JackBox sells packs that exhaust in 5 plays. $200/seat mystery dinners ship the same script every night. Wordle has not meaningfully changed since 2021. Each incumbent treats *content* as the bottleneck. The bottleneck is the **layer that turns content into a working, balanced, replayable session**.

**The product.** Plottwyst is a system, not a game — one engine that generates and *validates* a fresh narrative case in under 60 seconds at sub-1¢ inference cost, then runs it as a playable game across two surfaces (Discord + Web) and two modes (Daily solo + Multiplayer group). Two genres ship today (Murder Mystery + Heist) on the same engine; each new genre is a template declaration, not a rewrite.

**Two personas the same engine serves.** *Multiplayer Host* (friend-group + corporate event organizer) needs **bounded social variance** — a new shared session per gathering, group-sized, 30–60 min, memorable outcome. *Daily Puzzle Player* (Wordle-shaped) needs **bounded solo variance** — a new individual experience per day, 5–10 min, shareable badge. One supply-side gap, two demand vectors, one engine.

**Live today, zero paid acquisition.** 297 cases generated · 467 games played · 50% daily solve rate · 94% generation success · ~15s median generation time · 30+ countries · 14 Discord servers · 1-in-4 return rate. The MVP is the smallest configuration that lets a reviewer disprove the platform thesis.

**Three revenue streams that compound on the same engine.** Consumer Premium ($5/mo, gate control never gameplay) · B2B API (pay-per-use; escape rooms, corporate, tabletop, indie studios) · Creator Economy (15–20% fee on third-party templates). The engine collapses marginal content cost to inference; every stream pays the same cost and charges on a different surface.

**Market.** $90B+ TAM · ~$8B SAM (social-deduction + B2B team-building + AI game infra) · ~$150M SOM at Year-3 capture. No incumbent owns the full stack (gen + validation + game loop + multi-surface + creator + API). The window is open — briefly.

---

## Section 1 — Persona + Problem

> Brief asks "Persona" singular + "list of Problems" plural. Plottwyst's platform thesis is *one engine, two surfaces, two demand vectors* — so this section is one persona block with two flavours, each owning its own problem list. The split mirrors the product architecture, not a marketing convenience.

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> Two personas: the **Multiplayer Host** (friend-group + corporate event organizer) and the **Daily Puzzle Player** (Wordle-shaped). Different session shapes; same underlying tension — content scaled, gameplay systems didn't. Both unmet needs trace to a single supply-side gap that no incumbent solves.

</div>

### Persona A — The Multiplayer Host

**Who they are.** The person in the group who organizes the session. Two flavours of one archetype:

- **Friend-group host** — the recurring Saturday-night Zoom planner, the bachelorette organizer, the cousin who runs family game night. Owns the calendar invite. Picks the game. Feels the social cost when it falls flat.
- **Corporate event host** — manager, People Ops lead, EA tasked with the offsite or virtual team-building session. Has a budget line and a "did the team enjoy it?" survey to answer for. Same person at a different scale.

Both share one job-to-be-done: *give a group of 4–12 people a memorable shared session that isn't a repeat of the last one.*

**The Problems.**

1. **Game fatigue is fast.** Werewolf, Mafia, Among Us, One Night Ultimate all collapse after 2–3 sessions with the same group. Once everyone has seen the bluffs, the surprise dies. Among Us DAU dropped 95% from peak for exactly this reason — same maps, same game.
2. **"More content" is the only fix offered.** JackBox sells new packs every year; after five plays of Trivia Murder Party the answers repeat. The content-pipeline model can't outrun a motivated friend group.
3. **Premium experiences don't scale.** $200/seat murder-mystery dinners ship the same hand-authored script every night. Escape rooms work once per group per year. Both are physical-only — remote/hybrid teams get nothing.
4. **Setup tax kills spontaneity.** Board games need physical kit + 20 minutes of rules + a moderator who's read the manual. The host pays in prep time; the group pays in dead time before the fun starts.
5. **No personalisation.** Off-the-shelf games don't bend to the specific group — the new-hire welcome, the bachelorette, the bereaved family wanting something lighter than Cards Against Humanity. The host picks generic or builds custom (which nobody has time to do).
6. **Corporate hosts carry an extra burden: outcomes.** Budget approvals demand engagement, retention, or culture impact — and existing options are either too gimmicky to justify or too undifferentiated to defend in a review.

### Persona B — The Daily Puzzle Player

**Who they are.** The Wordle-shaped player. ~5 minutes a day, often coffee-adjacent. Ritual matters as much as the puzzle. Shares results with one or two group chats. Tracks a streak even when no one's watching. No learning curve tolerated. The puzzle is finishable in one sitting or it doesn't exist.

This persona owns commute, lunch-break, and "between meetings" minutes — slots Wordle proved are monetisable for the NYT at $1B/year combined puzzle revenue.

**The Problems.**

1. **Genre fatigue under the surface.** Wordle, Connections, Strands, Mini Crossword, Spelling Bee — all letter/grid puzzles with the same underlying constraint. After 200 Wordles a player has optimized the starter word and variance drops. The genre exhausted its design space three years in.
2. **No narrative payoff.** The daily ritual gives five minutes of *"I solved something"* — but no story, no character, no consequence. Just letters. The dopamine plateau is real and well-documented on the Connections subreddit.
3. **Spoiler-hostile sharing.** Wordle's colored-square share solved this for *outcome* sharing — but you cannot share *what happened* without spoiling tomorrow's puzzle for someone in a different timezone. Narrative content has the same problem at 10×.
4. **Streak addiction without depth.** The streak counter is the only retention mechanic; the game underneath has not meaningfully changed since 2021. Players know it. Replay value is pure ritual, not surprise.
5. **Single-mode trap.** The morning daily ritual is a walled garden. It does not extend into evening play, group play, or any longer-form experience for the same player when they want more. Players who want depth switch products entirely — and most don't bother.

### Why two personas, not one

Multiplayer Host needs **bounded social variance** — a new shared experience per session, group-sized, 30–60 minutes, with a memorable outcome. Daily Player needs **bounded solo variance** — a new individual experience per day, 5–10 minutes, with a shareable badge.

Both unmet needs trace to one supply-side gap: **content scaled, gameplay systems didn't.** Hand-authored games (mystery dinners, JackBox packs, escape rooms) and grid puzzles (Wordle and descendants) both hit a content ceiling that no amount of writing or design-grind has solved. The personas don't sit in different markets; they are the two entry points into the same three-layer market the engine serves (detailed in §5).

This is why Plottwyst is structured as one engine and two surfaces, not one product. The rest of the pitch falls out of that choice.

---

## Section 2 — Proposition

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> Three architectural choices no incumbent has made: **generate + validate** (AI-native vs AI-bolted — broken games never reach players), **one engine / two surfaces / infinite formats** (capability pattern — new genres are template declarations, not rewrites), **speed-of-thought generation** (<60s, <1¢ inference). Together they convert content from the bottleneck into the cheap part.

</div>

The supply-side gap diagnosed in §1 has one structural fix and many wrong answers. The wrong answers are: hand-author more scripts (mystery dinners), ship more packs (JackBox), tune a sharper grid (Wordle descendants), or wrap a chatbot in a UI (AI Dungeon-class products). Each treats content as the bottleneck. The bottleneck is the **gameplay layer that turns content into a working, balanced, replayable session.**

Plottwyst is built around that layer. Three architectural choices make the substantially-better claim hold:

**1. Generate AND validate, not just generate.** Anyone can prompt a model to write a mystery. Plottwyst's Narrative Engine generates a case *and* a separate validator proves it is solvable, fair, and free of broken clue chains **before any player sees it**. Broken games never reach players. This is the AI-native vs AI-bolted line — incumbents bolt AI onto a content pipeline; Plottwyst structures the system so validation is the contract, not a layer added later. Today this hits **94% generation success rate** in production with the engine recovering from failures via retry rather than serving broken cases.

**2. One engine, two surfaces, infinite formats.** The same engine runs Murder Mystery and Heist today. Adding Escape Room or Spy Thriller is a template declaration, not a rewrite. Daily (solo) and Multiplayer (group) are surfaces over the same engine. Discord and Web are adapters over the same surfaces. Every new format and every new surface amortises against the same engine — the cost curve of the second template is a fraction of the first, and approaches zero by the fifth. This is the capability pattern, and it is the structural reason Plottwyst is a platform rather than a game.

**3. Speed-of-thought generation.** A unique, validated case is live in under 60 seconds at sub-1¢ inference cost. The friend-group host doesn't pick from a content library; the system builds a fresh case for the group on the spot. The daily player gets a new narrative every morning, not a different Wordle layout. The corporate host runs the offsite without scripting it. None of the personas in §1 can get this from any incumbent today.

The proposition is not "AI mystery game." It is **a system that turns narrative templates into infinite, validated, playable games — across surfaces, audiences, and formats — at speed-of-thought cost.**

---

## Section 3 — MVP

The MVP is already live, in the hands of real players, with zero paid acquisition. Discord + Web, Daily + Multiplayer, two genres (Murder Mystery + Heist). 297 cases generated · 467 games played · 50% daily solve rate · 94% generation success · ~15s median generation time · ~$0.001 NE cost per case · 30+ countries · 14 Discord servers · 1-in-4 return rate.

The MVP is scoped to the minimum that proves the engine claim end-to-end — **not** to the maximum surface area of the eventual platform.

### What's in MVP and why

| Capability | Why it ships in MVP |
|---|---|
| **Narrative Engine** (generate + validate) | The non-negotiable claim. Without this, the product is "another AI chat game." Validation is the moat. |
| **Two genres** (Murder Mystery + Heist) | One genre proves nothing about the engine — it could be hand-tuned. Two genres prove the **capability pattern**: each new format is a template declaration, not a rewrite. The second template is what makes the platform claim real. |
| **Daily mode** (solo, ~10 min) | Wordle-shaped retention loop. Validates Persona B and the daily-ritual demand vector. |
| **Multiplayer mode** (group, ~30–45 min) | Validates Persona A and the social-host demand vector. Proves one engine serves bounded-solo *and* bounded-social variance. |
| **Two surfaces** (Discord + Web) | One surface proves nothing about engine being surface-agnostic. Two prove the **adapter pattern** — engine decoupled from distribution. |
| **Zero-install access** (no app store, no account required) | Distribution claim: Discord 231M MAU + PWA web. Speed-of-thought includes onboarding speed. |
| **Live image generation** (scene + evidence panels) | Multi-modal proof point — the engine is not text-only. Validates the roadmap into video (Veo) and richer modalities. |

### What's deliberately NOT in MVP

- **Interrogation mode** — depth layer; ships next. Held back so the engine claim is proven independently of the depth layer.
- **Social Mode** (co-located group play with TV mode + built-in voice) — different surface assumption (co-presence); built after daily/MP proves the solo+remote model.
- **Creator tools / B2B API** — depend on the engine being battle-tested at consumer scale first. Releasing API before the engine is hardened creates a long tail of partner-facing bugs nobody wants.
- **Voice surfaces** (Alexa, Live API, smart TVs) — adapter work, gated on Gemini Live maturity and India distribution. WhatsApp Daily Bot is the near-term surface bet for India.

The MVP is the smallest configuration that lets a reviewer disprove the platform thesis. It doesn't try to be the eventual product.

---

## Section 4 — Revenue

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> Three streams, one engine. **Consumer Premium** ($5/mo, gate control never gameplay) · **B2B API** (pay-per-use; $0.10/case + $0.25/session) · **Creator Economy** (15–20% fee on third-party templates). The engine collapses marginal content cost to inference (~$0.001/case); every stream pays the same cost and charges on a different surface. Streams compound rather than compete. India wedge in parallel: B2B concierge (Mystery Rooms 16-city chain) + WhatsApp Daily Bot.

</div>

### Stream 1 — Consumer Premium · $5/mo

Free forever for daily, multiplayer, every mode. Pro tier gates **control** — custom genres, private rooms, host analytics, priority generation queue. **Never gameplay.** Unlocks at ~1K retained players, the point where the host persona starts asking for custom scenarios and the daily persona starts wanting deeper streak and profile features.

### Stream 2 — B2B API · pay-per-use

$0.10 per case generation, $0.25 per session runtime. Pricing reflects the validator + dedup + capability layer — not raw inference. Target buyers: escape-room chains (16-city Mystery Rooms is the wedge in India), corporate team-building platforms, tabletop publishers, indie game studios. Unlocks at consumer traction — selling the engine without consumer-side proof would underprice the moat.

### Stream 3 — Creator Economy · 15–20% platform fee

Creators publish custom templates — their own genres, their own worlds — and earn per session played. Platform fee compounds with B2B runtime since each creator template can be licensed through the same API. Unlocks at platform scale — premature creator tools create supply nobody plays; consumer scale plus B2B distribution is the demand to publish into.

### Why the streams compound rather than compete

The engine collapses marginal content cost to inference (~$0.001 per case). Every stream pays the same engine cost but charges on a different surface — consumer subscription, B2B per-use, creator marketplace fee. The investment in validation, dedup, and capability pattern amortises across all three. There is no "consumer business" and "B2B business" — there is **one engine and three revenue surfaces**, the same way one engine drives two product surfaces today.

### Near-term India wedge

B2B India concierge ahead of full B2B API release: hand-served Mystery Rooms / corporate clients with the live engine, at price points that subsidise platform development. WhatsApp Daily Bot in parallel as the India daily surface (replacing the Alexa MVP for the local market — WhatsApp is where India actually plays). Together these convert the engine from a product into a system used commercially before the API is public.

---

## Section 5 — TAM

Three layers, $90B+ at the top.

| Layer | Size | What's in it | Why Plottwyst captures it |
|---|---|---|---|
| **Consumer Social Games** | $15B (SAM ~$2–3B) | Among Us (1B+ downloads), Werewolf / Mafia / social-deduction, JackBox | Genre is proven billion-dollar; no narrative-native AI player exists today |
| **B2B Content Generation** | $27B (escape rooms → $18B by 2028; corporate team-building) | $200/seat mystery dinners, escape-room franchises, corporate event vendors | $18B addressable market with no SaaS content layer — Plottwyst *is* the content layer |
| **Creator / Developer Platform** | $50B+ | Roblox paid creators $1.5B+ in 2025 — narrative is the genre Roblox doesn't serve | Same flywheel, different genre: writers + designers + AI as creator inputs |

**TAM: $90B+ · SAM: ~$8B · SOM (Year 3): ~$150M** at 1.5–2% of SAM at realistic capture.

The TAM compounds across the two personas in §1. Persona A (Host) maps to Consumer Social + B2B Content; Persona B (Daily Player) maps to Consumer Social; both expand into Creator/Developer Platform as the long arc. The personas are not parallel cohorts in a single market — they are the two entry points into a three-layer market the same engine serves.

### Why the market is open now and not three years ago

Three curves converged in 2025-2026 and none alone is enough:

1. **AI crossed the fairness/validation threshold.** Structured-output + Gemini 2.5-class models reliably pass solvability checks. Pre-2025 models produced plausible cases that broke under constraint checks — the engine claim was not viable.
2. **Generation cost collapsed from >$1 per case (2023) to <1¢ (2026).** Infinite unique content became commercially viable for the first time.
3. **Distribution surfaces matured.** Discord (231M MAU) + PWA web make zero-install social gaming native. No download, no account, no app-store tax. Not possible at scale three years ago.

The window for a narrative-native game platform is open — briefly. Incumbents will need to rebuild for each surface; Plottwyst already runs on two with the same engine, and the third (WhatsApp / voice / TV) is adapter work, not architecture work.

---

<div class="data-vintage" markdown="1">

**Data vintage.** Production metrics (297 cases · 467 games · 50% solve · 94% generation success · ~15s median generation · ~$0.001 NE cost · 30+ countries · 14 Discord servers · 1-in-4 return) refreshed **2026-05-11** from generation_log and Cloudflare zone analytics. TAM components anchored to the most recent published figures: Among Us downloads (1B+, Innersloth), Roblox creator payouts ($1.5B+ in 2025, public reporting), escape-room market projection ($18B by 2028, IBISWorld / industry trade). All claims about live behavior are derived from the deployed product, not projected.

</div>
