# Caselet 2 — Proposition + MVP + Revenue + TAM (working draft)

> Working artifact for §2–§5 of the Caselet 2 submission. Lifts fragments from the live Plottwyst investor deck and rephrases them for the Momentum brief's growth-hacking framing.

---

## §2 — Proposition

**How Plottwyst solves the problems substantially better than existing products.**

The supply-side gap diagnosed in §1 — *content scaled, gameplay systems didn't* — has one structural fix and many wrong answers. The wrong answers are: hand-author more scripts (mystery dinners), ship more packs (JackBox), tune a sharper grid (Wordle descendants), or wrap a chatbot in a UI (AI Dungeon-class products). Each treats content as the bottleneck. The bottleneck is the **gameplay layer that turns content into a working, balanced, replayable session**.

Plottwyst is built around that layer. The substantially-better claim rests on three architectural choices that no incumbent has made:

1. **Generate + validate, not just generate.** Anyone can prompt a model to write a mystery. Plottwyst's Narrative Engine generates a case AND a separate validator proves it is solvable, fair, and free of broken clue chains *before any player sees it*. Broken games never reach players. This is the AI-native vs AI-bolted line — incumbents bolt AI onto a content pipeline; Plottwyst structures the system so validation is the contract, not a layer added later.

2. **One engine, two surfaces, infinite formats.** The same engine runs Murder Mystery and Heist today. Adding Escape Room or Spy Thriller is a template declaration, not a rewrite. Daily (solo) and Multiplayer (group) are surfaces over the same engine. Discord and Web are adapters over the same surfaces. Every new format and every new surface amortises across the same engine — the cost curve of the second template is a fraction of the first, and approaches zero by the fifth.

3. **Speed-of-thought generation.** A unique, validated case is live in under 60 seconds at sub-1¢ inference cost. The friend-group host doesn't pick from a content library; the system builds a fresh case for the group on the spot. The daily player gets a different narrative every morning, not a different Wordle layout. The corporate host runs the offsite without scripting it. This is what the personas in §1 cannot get from any incumbent.

The proposition is not "AI mystery game." It is **a system that turns narrative templates into infinite, validated, playable games — across surfaces, audiences, and formats — at speed-of-thought cost.**

---

## §3 — MVP

**What features the MVP ships and why.**

The MVP is already live and in the hands of real players. Discord + web, Daily + Multiplayer, two genres (Murder Mystery + Heist). 297 cases generated, 467 games played, 50% daily solve rate, 94% generation success, ~15s median generation time, ~$0.001 per case in NE cost. 30+ countries, 14 Discord servers, 1-in-4 return rate. Zero paid acquisition.

The MVP is scoped to the minimum that proves the engine claim end-to-end — *not* to the maximum surface area of the eventual platform.

**What's in MVP and why:**

| Capability | Why it's in MVP |
|---|---|
| **Narrative Engine** (generate + validate) | The non-negotiable claim. Without this the platform is "another AI chat game." Validation is the moat. |
| **Two genres** (Murder Mystery + Heist) | One genre proves nothing about the engine — it could be hand-tuned. Two genres prove the **capability pattern**: each new format is a template declaration, not a rewrite. The second template is what makes the platform claim real. |
| **Daily mode** (solo, ~10 min) | Wordle-shaped retention loop. Validates Persona B and the daily-ritual demand vector. |
| **Multiplayer mode** (group, ~30–45 min) | Validates Persona A and the social-host demand vector. Proves the same engine serves bounded-solo AND bounded-social variance. |
| **Two surfaces** (Discord + Web) | One surface proves nothing about the engine being surface-agnostic. Two surfaces prove the **adapter pattern** — engine is decoupled from distribution. |
| **Zero-install access** (no app store, no account required) | Distribution claim: Discord 231M MAU + PWA web. Speed-of-thought includes onboarding speed. |
| **Live image generation** (scene + evidence panels) | Multi-modal proof point — the engine is not text-only. Validates the wishlist for video (Veo) and richer modalities later. |

**What's deliberately NOT in MVP yet** (and the reason):

- **Interrogation mode** (interactive questioning of suspects) — depth layer; ships next. Holding it until the engine claim is independently proven keeps the MVP narrative clean.
- **Social Mode** (co-located group play, TV mode, voice) — different surface assumption (co-presence), built after daily/MP proves the solo+remote model.
- **Creator tools / B2B API** — depend on the engine being battle-tested at consumer scale first. Releasing API before the engine is hardened creates a long tail of partner-facing bugs nobody wants.
- **Voice surfaces** (Alexa, Live API, smart TVs) — adapter work, gated on Gemini Live maturity and India distribution (WhatsApp Daily Bot is the near-term surface bet for India).

The MVP is the smallest configuration that lets a reviewer disprove the platform thesis. It doesn't try to be the eventual product.

---

## §4 — Revenue

**How the product makes money.**

Three streams. Each unlocks when its trigger hits — not on a calendar.

**Stream 1 — Consumer Premium ($5/mo).** Free forever for daily, multiplayer, every mode. Pro tier gates *control* — custom genres, private rooms, host analytics, priority generation queue. Never gameplay. Unlocks at ~1K retained players, which is the point where the host persona starts asking for custom scenarios and the daily persona starts wanting deeper streak/profile features.

**Stream 2 — B2B API (pay-per-use).** $0.10 per case generation, $0.25 per session runtime. Pricing reflects the validator + dedup + capability layer — not raw inference. Target buyers: escape-room chains (16-city Mystery Rooms is the wedge in India), corporate team-building platforms, tabletop publishers, indie game studios. Unlocks at consumer traction — selling the engine without consumer-side proof would underprice the moat.

**Stream 3 — Creator Economy (15–20% platform fee).** Creators publish custom templates (their own genres, their own world); they earn per session played. Platform fee compounds with B2B runtime since each creator template can be licensed through the same API. Unlocks at platform scale — premature creator tools create supply nobody plays; consumer scale + B2B distribution is the demand to publish into.

**Why the streams compound rather than compete.** The engine collapses marginal content cost to inference (~$0.001 per case). Every stream pays the same engine cost but charges on a different surface — consumer subscription, B2B per-use, creator marketplace fee. The investment in validation, dedup, capability pattern amortises across all three streams. There is no "consumer business" and "B2B business" — there is one engine and three revenue surfaces, the same way one engine drives two product surfaces today.

**Near-term India wedge.** B2B India concierge ahead of full B2B API release: hand-served Mystery Rooms / corporate clients with the live engine, at price points that subsidise platform development. WhatsApp Daily Bot in parallel as the India daily surface (replaces Alexa MVP for the local market). Together these convert the engine from a product into a system used commercially before the API is public.

---

## §5 — TAM

**The market the product addresses.**

Three layers, $90B+ at the top:

| Layer | Size | What's in it | Why Plottwyst captures it |
|---|---|---|---|
| **Consumer Social Games** | $15B (SAM ~$2–3B) | Among Us (1B+ downloads), Werewolf, Mafia, JackBox, social-deduction titles | Genre is proven billion-dollar; no narrative-native AI player exists today |
| **B2B Content Generation** | $27B (escape rooms → $18B by 2028; corporate team-building) | $200/seat mystery dinners, escape-room franchises, corporate event vendors | $18B addressable market with no SaaS content layer; Plottwyst is the content layer |
| **Creator / Developer Platform** | $50B+ | Roblox paid $1.5B+ to creators in 2025 — narrative is the genre Roblox doesn't serve | Same flywheel, different genre: writers, designers, AI as creator inputs |

**TAM: $90B+ · SAM: ~$8B · SOM (Year 3): ~$150M** at 1.5–2% of SAM at realistic capture.

The TAM compounds across the two personas in §1 — Persona A (host) maps to Consumer Social + B2B Content, Persona B (daily player) maps to Consumer Social, and both expand into Creator/Developer Platform as the long arc. The personas are not parallel cohorts in a single market; they are the two entry points into a three-layer market that the same engine serves.

**Why the market is open now and not three years ago.** Three curves converged: AI crossed the fairness/validation threshold (structured-output + Gemini 2.5-class models reliably pass solvability checks; pre-2025 models did not), per-case generation cost dropped from >$1 (2023) to <1¢ (2026), and zero-install distribution surfaces matured (Discord 231M MAU + PWA web). None of the three alone is enough. The window for a narrative-native platform is open — briefly.

---

## Notes for Stage C synthesis

- Keep TL;DR callouts (CS1 Caselet 1 precedent) on §2 and §4 — the two sections where claim density is highest.
- §3 (MVP) table is the most defensible artefact for live interview cross-examination; preserve format.
- The "personas → markets" bridge at the end of §5 is load-bearing — without it, the two-persona §1 reads as a list rather than a thesis.
- Final doc should open with an executive TL;DR like CS1 (3–4 lines) framing the whole thing.
