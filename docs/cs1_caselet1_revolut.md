# Case Study — Growth Hacking · Caselet 1
## Revolut Primacy

> Submission deliverable. Caselet structure follows the brief verbatim: (1) macro pain categories · (2) macro benefit categories · (3) two growth-hacking ideas · (4) detailed UX + hooks + comms + metrics per idea.

---

## Executive summary

*One-page distillation. The body that follows is the working-out — read it if you want to stress-test the reasoning, the screens, or the metrics.*

**Thesis.** Revolut's primacy gap is not an acquisition problem — 52M global / 13M UK users and Trustpilot 4.5/5 prove the love is there. It's a *salary-mandate* problem: average UK consumer deposit is **£575/mo at Revolut vs £811 at Monzo and £2,944 at Starling**, and the 2024 Annual Report dodges the absolute primacy number, disclosing only 59% YoY growth. The wedge: users have rationally settled into a **two-bank cohabitation** — Revolut for spending + FX + crypto, high-street for the salary. Primacy will only move when the cohabitation deal is broken.

**The asymmetry in the pain space.** Of the five macro pains, **two have no current vitamin counter** in the live product — P1 *perceived operational risk* (the AML-hold-on-payday fear; Reddit's highest-engagement primacy thread is *"Can't access my salary. I am suing."*, 1,006 upvotes) and P5 *primacy-hostile product surface* (Home is optimised for cross-sell, salary-aware components like Pockets and Payday exist but aren't merchandised). The other three pains are either structural (bank licence, branch, lock-in products) or partly mistargeted. **That asymmetry IS the strategic idea space.**

**The two ideas — a push-pull pair, neither pays for primacy:**

|  | **Idea 1 · Confidence Period** | **Idea 2 · Locked Insights** |
|---|---|---|
| **Type** | Push — migration de-risk | Pull — only-on-primary value |
| **Mechanic** | 3-salary-cycle parallel-run via Open Banking + auto-mirror % back to the old bank + **Salary Guarantee** (any AML hold > 60 min → instant interest-free advance up to the salary amount) | Visible-but-locked Insights surface — real cards with blurred numbers + a one-time sample peek with example data; primary unlocks subscription audit, cashflow forecast, DD payday optimisation, anomaly detection |
| **Attacks pain** | P1 + P4 | P5 + V2 mistarget |
| **Build** | 6 – 9 months | 4 – 6 months |
| **Y1 impact** | 5pp UK primacy lift (≈500k incremental primary users) | 2–3pp standalone · 5pp paired with Idea 1 |

**Combined Year-1 impact: 8 – 10pp net UK primacy lift.** The two compound — Locked Insights' sample peek is the conversion CTA into Confidence Period setup; Confidence Period users watch Insights populate with real numbers as cycles complete. Differentiation on Idea 2 is *structural* (Monzo, Starling, and Chase cannot match it without the same full-income visibility), not skin-deep. Failure modes are explicitly named (>20% cycle-1 reversal; <5% insight action rate). Detail at the screen, hook, comms, and metric level follows in the body.

---

## The wedge insight

Revolut today has roughly **52M global active users and 13M in the UK**, yet *"primary users grew 59% YoY"* is the strongest disclosure the 2024 Annual Report makes — the absolute number is omitted. Public deposit data tells the missing story: **average UK consumer deposit ≈ £575/mo at Revolut · £811 at Monzo · £2,944 at Starling** (Sacra / Sifted). The gap isn't acquisition (Trustpilot 4.5/5 over 200,000 reviews; the love is there). The gap is **the salary mandate** — the binary monthly act of routing payroll into the account.

The dominant primary-source pattern across 17 high-engagement Reddit threads + Trustpilot + MSE + Askaboutmoney is unanimous:

> *"Revolut is great for transfers but can't be trusted for banking."*
> — r/Revolut, thread title verbatim (95 upvotes)

> *"Yes [there's reason to consider alternatives]. Revolut isn't a bank. It doesn't have a banking licence. It doesn't have FSCS protection."*
> — r/UKPersonalFinance, top reply (255 upvotes) on the "Monzo vs Revolut vs Starling" thread

> *"I see Revolut as a travel / back up card. I would never send my salary to a bank without a branch I could walk into and speak to a manager."*
> — r/Revolut comment, 54 upvotes

The point isn't that users don't love Revolut. The point is that **two banks is the rational user equilibrium** — Revolut for spending + FX + crypto, high-street for the salary mandate — and the equilibrium is cheap to maintain. Primacy will only move when Revolut breaks the cohabitation deal: either by removing the *fear* that anchors it (operational risk at the salary-deposit moment) or by creating *pull* that only primacy unlocks.

This caselet attacks both — one push idea, one pull idea, sized to compound.

<div class="data-vintage" markdown="1">

**Data vintage.** Revolut headline figures (52M / 13M UK; 59% YoY primary growth) are from the **2024 Annual Report** — the most recent published; the 2025 annual is not expected before Q3 2026. All market-context data points — PRA mobilisation lift, UK Bank launch, Joint Savings AER, switching-incentive comparator, cash-deposit discontinuation, Storonsky / Bloomberg positioning — are anchored to **May 2026**. The Sacra / Sifted deposit comparator and the Trustpilot review count are as last published (typical 6 – 12 month lag). Monzo Salary Sorter and partial-switch onramp references (Sept 2019 / Jan 2020) are deliberately historical — their age is part of the argument.

</div>

---

## Section 1 — Macro pain categories

> Why a Revolut user does *not* exhibit primacy behaviour today. Five macro categories. Each anchored to the strongest single signal.

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> Five pains. Three are structural — bank licence, branch presence, lock-in products — and outside product's reach. Two are not: **P1 perceived operational risk** and **P5 primacy-hostile product surface**. Neither has a counter in the live product today. That's the surface this case attacks.

</div>

### P1. **Perceived operational risk** — the salary-deposit fear

Users don't fear Revolut going bankrupt. They fear that a routine AML/fraud trigger freezes their account *on the day rent is due*, with no human escalation, only AI-bot loops with copy-paste replies. The risk is **narrative-amplified** — reading other users' freeze stories alone is enough to start rationing balances (the "demote funnel").

- Reddit's highest-engagement primacy thread is *"Can't access my salary. I am suing."* (1,006 upvotes). A bigger-than-usual salary cycle including commission tripped a review; the user was locked out for days.
- The single meme phrase recurring across r/Revolut: *"Revolut is great until it is not."*
- **£756 APP-scam losses per £1M of transactions vs Barclays £67** (Allegiant.co.uk citing UK Finance + Action Fraud). Volume is real.
- Direct evidence of *narrative-driven* primacy abandonment: *"This is scary. I was about to entrust them with being my primary source for depositing my income. Won't be doing that after reading all these posts."*

**Severity:** Highest single deterrent. No current vitamin counter inside Revolut's live product surface.

### P2. **Structural trust deficit** — institutional credibility gap

No branch to walk into. No phone number to call. Historical e-money-not-bank framing, and most existing UK customers still hold e-money accounts as of May 2026 — migration to the new bank entity rolls in batches over months. Lender ecosystem treats Revolut statements as auxiliary, not primary.

- *"My golden rule is to never use banks with no physical branches as my primary bank."* — r/Revolut (t10 c31).
- MoneySavingExpert mortgage-broker thread: Revolut treated as "spending bank account" in mortgage packaging, not the primary statement source.

**Severity:** Structural. Solving requires the bank-licence rollout, lender partnerships, branch presence — none of which are PLG-shaped. Assumed in this case as table-stakes-coming.

### P3. **Missing primacy lock-in products**

Incumbents make primacy sticky via overdraft + credit card + mortgage — *attached* to the salary-deposit account. Revolut UK has none in market as of May 2026 (PRA only lifted mobilisation restrictions in March 2026; track record is zero). Even successfully-converted primacy users keep a high-street second account for local tax-wrappers (Livret A, LDD, PEA, ISA) — i.e. **even success-case primacy is partial**.

- *"I'm French, so I still have another traditional bank for my Livret A, LDD, and PEA, but my day-to-day banking is fully on Revolut."* — r/Revolut, the 2-year-Ultra-primary user (t01).
- *Cash deposits discontinued 13 February 2026* — primacy *regression* mid-flight.

**Severity:** Structural. Assumed table-stakes-coming. Not a PLG wedge.

### P4. **Switching friction & incentive gap**

The mechanical chore of moving the salary mandate + DDs + payees, combined with an economic disincentive: high street pays £150-£750 to switch in (HSBC Premier £750, NatWest Premier £250); Revolut pays a £20 referral. **Existing primacy users get nothing** — the 12-month-Metal promo targets only new conversions.

- *"I moved my salary to Revolut and didnt get shit."* — r/Revolut (t17 c26) re: 12-months-free Metal promo.
- *Monzo blog, January 2020:* *"Switch to Monzo without closing your old account."* — Monzo's partial-switch onramp. Revolut has no equivalent prominent path.
- *Revolut is **not** on the May 2026 "best switching offers" list* (Be Clever With Your Cash).

**Severity:** Moderate. Pure PLG surface — no licensing dependency.

### P5. **Primacy-hostile product surface**

Revolut's home is optimised for *cross-sell* (crypto · stocks · commodities · hotels · lifestyle · eSIM · gold), not for the primary-account daily ritual: balance + recent transactions + bill-pay + reassurance. Salary-aware features (Pockets, Payday, instant transfers, real-time categorisation) *exist* but aren't merchandised as the primacy hook. The same multi-product density that wins acquisition fights primacy.

- *"The app feels cluttered with crypto, stocks, hotel bookings, and dozens of other features"* vs Monzo's simplicity. — Chyshkala 2026.
- *Monzo's Salary Sorter + Bills Pots (Sept 2019)* is *the* explicit primary-account product surface in the UK challenger set. Revolut has parity components but no equivalent merchandising.

**Severity:** Moderate-high. Pure PLG surface — components already built.

---

## Section 2 — Macro benefit categories

> What would make a user consider switching. Five macro categories.

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> Five vitamins. **V2 salary-aware intelligence** is the most under-leveraged — Pockets, Payday, real-time categorisation are all shipped, none merchandised into a primacy moment. **V3 primacy-only economics** is mistargeted at perks rather than salary value. The first finding sets up Idea 2; the second is why neither idea pays for primacy.

</div>

### V1. **Cross-border life completeness**

Multi-currency wallets, mid-rate FX, IBANs in 30+ countries, joint accounts + joint savings for international couples. For the cross-border-earner cohort, Revolut is the *only* sane primary because the high street can't do this without 3% FX margin per transaction.

- *"I earn money in CZK but spend most of that in AED. The fees for international transfers and the exchange rates are a life saver."* — r/Revolut, 4-year-primary user (t01 c29).
- *Revolut Joint Savings launch coverage, Oct 2025:* "Revolut's most-requested feature by existing customers."

**Reach.** ≤15-20% of UK base. Forcing function for cross-border earners; doesn't bite for the domestic-only majority.

### V2. **Salary-aware intelligence** *(latent — components exist, not merchandised)*

Features that *can only function with full-income visibility*. Salary-Sorter-style automatic distribution into spending + bills + savings, payday-aligned cashflow nudges, proactive subscription audit, debt-cycle smoothing. Pockets and Payday already ship; the product hasn't assembled them into a primacy-conversion surface.

**Status.** Most under-leveraged vitamin in the current product. Revolut HAS the components — it has not connected them into something only the salary-mandate user gets.

### V3. **Primacy-only economics**

Asymmetric reward layer: the more your salary mandate is here, the more you earn. Higher savings APR, free Metal/Ultra months, FX-spend bonuses, cashback rate boosts, fee waivers.

- *Joint Savings 4.5% AER* (May 2026) vs Chase 3% / Monzo Instant 3.6% — competitive but not headline-grabbing.
- *Architecture exists* (tier system) — re-pointing it at primacy is a comms/policy move, not an eng project.

### V4. **Wallet-share gravity**

Stocks · ETFs · crypto · commodities · lifestyle cashback · eSIM · lounge access — all on the same balance. For the engaged 30-45 cohort, switching out is high-friction because it means rebuilding investing accounts, not just bank accounts. Revolut's interchange (63% of revenue) depends on this engagement loop.

**Limit.** Wallet-share creates *engagement* primacy (logging in daily) but doesn't always translate to *salary-deposit* primacy.

### V5. **App polish + UX reliability**

Best-in-class app, instant transfers, real-time spend notifications, frictionless P2P (Revolut handles), virtual cards on demand, fraud freeze in 1 tap. Trustpilot 4.5/5 across 200k+ reviews.

**Limit.** Generic. Every challenger has it. A hygiene factor that doesn't move primacy on its own.

---

### Pain × Benefit asymmetry — the idea space

Two pains have **no current vitamin counter** in the live product surface (P1 perceived operational risk; parts of P4 + P5 mistargeted/unmerchandised). The other three pains are structural and out of PLG scope. **That asymmetry IS the strategic idea space.** The two ideas below are designed to occupy it.

---

## Section 3 — The two growth-hacking ideas

> Both ideas attack the C3 + C4 cohorts — the strategic target population where acquisition cost is already sunk and primacy conversion is marginal-cost.
>
> They are deliberately a **push-pull pair**: one removes the friction of converting, the other creates the pull-reason for wanting to. Neither is a feature bundle; each is one focused mechanic. Neither pays for primacy directly.

<div class="glossary" markdown="1">

**Cohort glossary.** &nbsp; **C1** = users already primary on Revolut (the protect-and-extend cohort). &nbsp; **C2** = aware, actively considering primacy. &nbsp; **C3** = considered primacy but didn't switch (rejected at the decision moment). &nbsp; **C4** = switched primacy and reverted (the "demote funnel"). &nbsp; C3 + C4 carry the highest leverage because acquisition cost is already sunk — they're users Revolut already has, just not on the load-bearing salary mandate.

</div>

| | Idea 1 | Idea 2 |
|---|---|---|
| **Name** | Confidence Period | Locked Insights |
| **Type** | Push — migration de-risk | Pull — only-on-primary value |
| **Attacks pain** | P1 (operational risk) + P4 (switching friction) | P5 (hostile surface) + V2 mistarget |
| **Cohort focus** | C3 + C4 | C2 + C3 |
| **Wedge mechanic** | Open-Banking parallel-run + Salary Guarantee during the trust period | Visible-but-locked intelligence surface; data envy as conversion driver |
| **Brief constraint** | Not paying for primacy — Revolut absorbs operational risk via Open-Banking + advance mechanism | Not paying for primacy — value comes from intelligence only Revolut can produce |
| **PLG feasibility** | 6-9 months: Open-Banking integration + advance product + cycle-state machine | 4-6 months: insight catalog + locked/unlocked surface state + populated rules |
| **Estimated impact** | 5pp UK primacy lift Y1 (5% of C3 ≈ 500k users converted) | 2-3pp standalone; 5pp paired with #1 |

---

## Section 4 — Idea 1: **Confidence Period**

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> The push idea — migration de-risk. Three salary cycles run in parallel via Open Banking, with a percentage auto-mirrored back to the old bank. A **Salary Guarantee** turns the AML-freeze fear into a covered event: any hold over 60 minutes triggers an instant interest-free advance up to the salary amount. Closes P1 and P4. **6-9 months to build · ~5pp UK primacy lift Year 1 (~500k incremental primary users).**

</div>

### What it is

A 3-salary-cycle parallel-run that lets a user move their salary mandate to Revolut **without committing to single-bank primacy**. The system uses Open Banking to read the user's existing primary bank, automatically auto-mirror a percentage of each Revolut-received salary back to the old account, and bundles a **Salary Guarantee** — if Revolut ever holds the deposit for AML review beyond 60 minutes, the user receives an interest-free advance up to their salary amount, instantly.

After 3 successful cycles the auto-mirror fades. The user has *lived* primacy without the fear, and the second-bank cohabitation has been quietly dissolved instead of confronted.

### Why this attacks the deepest pain

Confidence Period directly addresses the highest-leverage uncovered pain in Stage 2's matrix:

- **P1 (Perceived operational risk):** the Salary Guarantee mechanism converts the AML-hold from an existential threat ("can't pay rent") to a manageable inconvenience ("held but advanced"). It doesn't promise no holds — that's not credible — it promises *no consequences*.
- **P4 (Switching friction):** the parallel-run formally acknowledges the two-bank cohabitation deal users have rationally settled into, and uses it as a bridge rather than a competitor. *Revolut becomes primary while you keep the old bank running.*
- **P11 (Demote funnel):** each successful cycle is *lived evidence* that primacy works. The user accumulates trust, not just commitments.

### a) Step-by-step UX flow

**Pre-flow context.** The flow can be entered from any of the 8 awareness hooks listed in section (b). For exposition we trace the canonical entry: an Open Banking-detected user who hit the "Confidence Period available" home banner.

#### Screens 1 & 2 — Entry → Open Banking connect

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Confidence Period</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">Make Revolut<br/>your primary —<br/>with a net.</div>
    <div class="sb-sub">Move your salary here. We'll keep your old bank as backup for 3 cycles.</div>
    <div class="card">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/></svg></span></div>
      <div class="card-title">Salary Guarantee</div>
      <div class="card-body">If we ever hold your deposit, we advance you instantly — interest-free.</div>
    </div>
    <div class="card">
      <div class="card-row"><span class="card-icon">↔︎</span></div>
      <div class="card-title">Auto-Mirror</div>
      <div class="card-body">A percentage of each salary flows back to your old bank automatically.</div>
    </div>
    <div class="card">
      <div class="card-row"><span class="card-icon">⏪</span></div>
      <div class="card-title">Easy reverse</div>
      <div class="card-body">Change your mind any time. One-tap return to your old bank.</div>
    </div>
    <div class="cta-primary">Start setup</div>
    <div class="cta-secondary">How it works</div>
  </div>
</div></div>
<div class="caption">Screen 1 — entry. Three trust mechanisms framed as a net, not a pitch. Reverse offered as openly as forward.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Connect your bank</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">Connect the<br/>bank your salary<br/>lands in.</div>
    <div class="sb-sub">We use Open Banking to detect your employer, salary, and direct debits.</div>
    <div class="provider-grid">
      <div class="provider">Barclays</div>
      <div class="provider">Lloyds</div>
      <div class="provider">HSBC</div>
      <div class="provider">NatWest</div>
      <div class="provider">Santander</div>
      <div class="provider">Nationwide</div>
      <div class="provider">First Direct</div>
      <div class="provider">Chase</div>
      <div class="provider">Halifax</div>
    </div>
    <div class="sb-section-label">Privacy</div>
    <div class="card-body" style="font-size: 5.6pt; color: #5d5d6b;">Read-only access. We can see, not move. Used only for salary detection and direct-debit mapping. You can revoke any time.</div>
    <div class="cta-secondary" style="margin-top: 1.5mm;">Search 40+ more banks</div>
  </div>
</div></div>
<div class="caption">Screen 2 — provider grid. Detection-led onboarding replaces every form field with a single confirmation.</div>
</div>
</div>

Why detection-first: Open Banking gives Revolut everything it needs — employer pattern, salary amount, recurring DDs — without asking the user to type any of it. Every form field is replaced with a verification = lower drop-off.

#### Screens 3 & 4 — Confirm salary pattern → HR payroll-change letter

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Step 2 of 6</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">We found this.<br/>Right?</div>
    <div class="sb-sub">Detected from 5 cleared cycles on your Lloyds account.</div>
    <div class="card live">
      <div class="kv-row"><span class="kv-key">Employer</span><span class="kv-val">KPMG LLP</span></div>
      <div class="kv-row"><span class="kv-key">Amount</span><span class="kv-val">£3,247 <span class="kv-meta">avg of last 3</span></span></div>
      <div class="kv-row"><span class="kv-key">Payday</span><span class="kv-val">28th of the month</span></div>
      <div class="kv-row"><span class="kv-key">Cycles seen</span><span class="kv-val">5 confirmed <span class="success-pill">verified</span></span></div>
    </div>
    <div class="sb-section-label">Anything irregular?</div>
    <div class="check-row"><span class="check"></span><span class="check-label">Variable bonuses / commissions</span></div>
    <div class="check-row"><span class="check"></span><span class="check-label">Multi-source income</span></div>
    <div class="check-row"><span class="check"></span><span class="check-label">Recently changed employer</span></div>
    <div class="cta-primary">Yes, that's right</div>
    <div class="cta-secondary">Edit details</div>
  </div>
</div></div>
<div class="caption">Screen 3 — confirm, don't fill. Irregular-income checkboxes pre-flag edge cases for AML so the first cycle won't trip on bonus variance.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Tell your payroll</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">We've drafted<br/>the letter.</div>
    <div class="sb-sub">Pre-filled for your HR team. Edit anything before sending.</div>
    <div class="letter-card">
      <div class="letter-to">To: KPMG Payroll</div>
      <div class="letter-body">Effective from <b>28 June 2026</b>, please direct all future salary payments to:</div>
      <div class="letter-fields">
        <div><span class="letter-key">Sort code</span><span class="letter-val">04-00-04</span></div>
        <div><span class="letter-key">Account no</span><span class="letter-val">•••• 7298</span></div>
        <div><span class="letter-key">Name on a/c</span><span class="letter-val">A. Patel</span></div>
      </div>
    </div>
    <div class="action-row"><span class="action-icon">✉︎</span><span class="action-label">Send via Gmail / Outlook</span></div>
    <div class="action-row"><span class="action-icon">⤓</span><span class="action-label">Email the PDF to me</span></div>
    <div class="action-row"><span class="action-icon">⎙</span><span class="action-label">Print</span></div>
    <div class="action-row alt"><span class="action-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></span><span class="action-label">Pay.UK direct switch <span class="action-meta">eligible employers</span></span></div>
  </div>
</div></div>
<div class="caption">Screen 4 — the HR letter is the comms artifact. Stakeholder comms extend beyond the user; nobody else automates this.</div>
</div>
</div>

#### Screens 5 & 6 — Mirror + cycle setup → Direct debit migration

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Confidence Period</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">How much<br/>safety net?</div>
    <div class="sb-section-label">Mirror to Lloyds each cycle</div>
    <div class="slider">
      <div class="track"><div class="fill" style="width: 60%;"></div><div class="knob" style="left: 60%;"></div></div>
      <div class="labels"><span>0%</span><span class="value">30% <span class="rec">recommended</span></span><span>50%</span></div>
    </div>
    <div class="sb-section-label">For how many cycles?</div>
    <div class="seg-control">
      <div class="seg active">3</div>
      <div class="seg">4</div>
      <div class="seg">5</div>
    </div>
    <div class="toggle-row">
      <div>
        <div class="label">Salary Guarantee</div>
        <div class="sub">If we hold your deposit &gt;60 min, we advance you instantly — interest-free.</div>
      </div>
      <div class="toggle"></div>
    </div>
    <div class="disclosure">Auto-ends after 3 cycles. Extend, change, or stop any time.</div>
    <div class="cta-primary">Continue</div>
  </div>
</div></div>
<div class="caption">Screen 5 — the load-bearing screen. 30% mirror covers rent + essentials at most incomes; 3 cycles is the minimum loop to prove trust without dragging the period out.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Recurring payments</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">Choose what<br/>moves, when.</div>
    <div class="sb-sub">Detected from your Lloyds direct debits.</div>
    <div class="sb-section-label">Move now · Cycle 1</div>
    <div class="dd-row"><span class="dd-check on">✓</span><span class="dd-name">Spotify</span><span class="dd-amt">£10.99</span></div>
    <div class="dd-row"><span class="dd-check on">✓</span><span class="dd-name">Netflix</span><span class="dd-amt">£15.99</span></div>
    <div class="dd-row"><span class="dd-check"></span><span class="dd-name">Gym</span><span class="dd-amt">£42.00</span></div>
    <div class="sb-section-label">Cycle 2</div>
    <div class="dd-row"><span class="dd-check"></span><span class="dd-name">Mobile (EE)</span><span class="dd-amt">£28.00</span></div>
    <div class="dd-row"><span class="dd-check"></span><span class="dd-name">Energy (Octopus)</span><span class="dd-amt">~£120</span></div>
    <div class="sb-section-label">Cycle 3 · recommended for rent</div>
    <div class="dd-row"><span class="dd-check"></span><span class="dd-name">Rent</span><span class="dd-amt">£1,400</span></div>
    <div class="sb-section-label">Stay on Lloyds</div>
    <div class="dd-row locked"><span class="dd-check on lock">🔒</span><span class="dd-name">ISA contributions</span><span class="dd-amt">£200</span></div>
    <div class="dd-row locked"><span class="dd-check on lock">🔒</span><span class="dd-name">Mortgage</span><span class="dd-amt">£890</span></div>
  </div>
</div></div>
<div class="caption">Screen 6 — granular cycle pacing. Low-stakes subs move first, rent last, and lender-tied accounts stay put (the P3 partial-primacy reality).</div>
</div>
</div>

#### Screen 7 & post-activation — Confirm → cycle-1 payday lands

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Ready to activate</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">All set.<br/>Confirm to start.</div>
    <div class="summary-card">
      <div class="sum-row"><span class="sum-key">Salary destination</span><span class="sum-val">Revolut</span></div>
      <div class="sum-row"><span class="sum-key">Mirror to Lloyds</span><span class="sum-val">30% per cycle</span></div>
      <div class="sum-row"><span class="sum-key">Cycles</span><span class="sum-val">3</span></div>
      <div class="sum-row"><span class="sum-key">Salary Guarantee</span><span class="sum-val"><span class="success-pill">on</span></span></div>
      <div class="sum-row"><span class="sum-key">First payday</span><span class="sum-val">28 June 2026</span></div>
      <div class="sum-row"><span class="sum-key">DDs moving cycle 1</span><span class="sum-val">2 of 6</span></div>
    </div>
    <div class="disclosure">Reversible any time from Settings → Confidence Period.</div>
    <div class="cta-primary">Activate Confidence Period</div>
    <div class="cta-secondary">Go back</div>
  </div>
</div></div>
<div class="caption">Screen 7 — single CTA recap. Reverse path mentioned in copy, not buried in a menu.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Home</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="balance-block">
      <div class="balance-label">Current balance</div>
      <div class="balance-amt">£3,547.21</div>
    </div>
    <div class="toast success">
      <div class="toast-title">Salary landed · £3,247</div>
      £974 auto-mirrored to Lloyds · cleared in 0s ✓
    </div>
    <div class="home-card">
      <div class="kicker">Confidence Period · cycle 1 of 3</div>
      <div class="head">Cycle 1: clear.<br/>2 to go.</div>
      <div class="body">Next payday 28 July. We'll send a heads-up on rent DD options at +7 days.</div>
    </div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V14M12 20V10M18 20V4"/></svg></span><span class="success-pill">on track</span></div>
      <div class="card-title">Bills are running clean</div>
      <div class="card-body">No holds, no AML triggers, all 2 cycle-1 DDs cleared.</div>
      <div class="card-cta">See cashflow forecast →</div>
    </div>
  </div>
</div></div>
<div class="caption">Cycle 1 payday — push toast within 60s, then a home card framing progress (1 of 3). Loops back to Locked Insights as the data populates.</div>
</div>
</div>

#### If AML hold occurs — the Salary Guarantee path

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Salary Guarantee</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="toast warn">
      <div class="toast-title">We need to verify a transaction</div>
      Until we clear, here's an instant advance — interest-free.
    </div>
    <div class="balance-block guarantee">
      <div class="balance-label">Advance issued</div>
      <div class="balance-amt">£3,247.00</div>
      <div class="balance-sub">Clears automatically when your salary releases.</div>
    </div>
    <div class="card warn">
      <div class="card-row"><span class="card-icon">⚠︎</span><span class="warn-pill">hold</span></div>
      <div class="card-title">Estimated clearance · 2-4 hours</div>
      <div class="card-body">Hold reason: bonus variance exceeded usual £3,000 pattern. KPMG payroll verified.</div>
      <div class="card-cta">Talk to a human now →</div>
    </div>
    <div class="sb-section-label">Advance ledger</div>
    <div class="ledger-row"><span class="ledger-time">09:41</span><span class="ledger-label">Advance issued</span><span class="ledger-amt">+£3,247</span></div>
    <div class="ledger-row"><span class="ledger-time">est. 13:00</span><span class="ledger-label">Salary released</span><span class="ledger-amt muted">+£3,247</span></div>
    <div class="ledger-row"><span class="ledger-time">est. 13:00</span><span class="ledger-label">Advance settled</span><span class="ledger-amt muted">−£3,247</span></div>
  </div>
</div></div>
<div class="caption">The load-bearing moment. The user's worst-case — <em>"I can't pay rent"</em> — never materialises. Priority human-line replaces the AI-bolted support that's currently the #1 primacy blocker.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Cycle 3 complete</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="celebration">
      <div class="celebration-burst">✦</div>
      <div class="sb-h1">Welcome to<br/>Revolut Primary.</div>
      <div class="sb-sub">3 cycles cleared. Your salary's been here for 92 days.</div>
    </div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg></span><span class="success-pill">unlocked</span></div>
      <div class="card-title">Savings APR · +0.5pp</div>
      <div class="card-body">Permanent uplift on your default savings vault. Effective immediately.</div>
    </div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"/></svg></span></div>
      <div class="card-title">Salary Guarantee · stays on</div>
      <div class="card-body">As long as your salary lands here.</div>
    </div>
    <div class="sb-section-label">What about auto-mirror?</div>
    <div class="cta-secondary alt">Keep it on indefinitely</div>
    <div class="cta-secondary alt">Pause it</div>
    <div class="cta-secondary alt">Let it stop</div>
  </div>
</div></div>
<div class="caption">Cycle 3 close. Celebration is quantified (savings APR, Guarantee continuity), not vague. Three buttons for auto-mirror — no default forced.</div>
</div>
</div>

**Cycle 2 — payday lands.**
Same shape. Locked Insights (Idea 2) start populating with real data this week — pull-synergy kicks in.

**Cycle 3 — confidence period closes.**

Day -7 (one week before): Push — *"Cycle 3 finishes [date]. You've completed primacy."*

Day 0: In-app celebration moment — *"Welcome to Revolut Primary."*
- Reward unlock: savings APR +0.5pp permanent; existing Metal users get +12 months; *"Salary Guarantee remains active for as long as your salary is here."*
- Auto-mirror winds down: *"Your auto-mirror is fading. Keep it on indefinitely? Pause it? Let it stop?"* — three buttons, no defaults forced.

#### Reverse flow (if the user changes their mind)

Cmd-K equivalent / Settings → *"Reverse Confidence Period"* → one-screen CASS-equivalent flow back to the old bank. No friction. No retention pitch. One question survey on the way out: *"Why are you reversing? It helps us build better."*

### b) Contextual hooks to create awareness

| # | Hook | Surface | Trigger |
|---|---|---|---|
| 1 | "Confidence Period available" home banner | Home top-card | Open Banking detects regular external salary deposit landing at another bank, OR user is in C2/C3 cohort signal cluster |
| 2 | Salary-widget upsell | Home Insights tile | Locked-Insights cards stack tap → CTA back into Confidence Period setup |
| 3 | Post-tier-upgrade banner | Account / Plans | After Metal/Ultra signup: *"You're upgraded. Want to make us primary too? Try our 3-cycle confidence period."* |
| 4 | Windfall-detected banner | Activity feed | 2nd large external deposit detected — natural psychology moment for primacy decision |
| 5 | Onboarding (new user, last step) | Sign-up flow | After account creation: *"Want to receive your salary here? We've built a safety net for that."* |
| 6 | High-engagement-but-no-salary email | Email | Triggered after 90 days of high in-app engagement without salary deposit detected |
| 7 | Referral copy (existing primary users) | Sharing modal | *"I started a Confidence Period and 3 cycles in I'm primary"* — primary-user testimonial-driven referral |
| 8 | App store + paid acquisition landing page | External | Featured prominently as the marquee onboarding experience |

### c) Notifications & communications lifecycle

**User comms.** Detailed in the cycle UX above. Cadence summary: setup confirmation email, per-cycle landing push + cycle-summary card, mid-cycle health check email, AML hold push (within 60s), cycle-close push + celebration, reverse-flow comms if invoked.

**Employer / HR comms.** The HR payroll-change letter is the artifact. Format options: emailable PDF (auto-fills To: from Open Banking employer signal), Gmail/Outlook direct send, printable, or Pay.UK direct switch when eligible. Future iteration: B2B partnership track with major UK payroll providers (Sage, ADP, Workday) for one-click switch from inside Revolut.

**Stakeholder comms (internal to Revolut).**

| Stakeholder | What they see | Why |
|---|---|---|
| **Fraud / AML team** | Confidence Period users flagged in the case management system; pre-cleared payroll signal in the user record | AML rules can run permissively on verified-employer salary deposits, dramatically lowering hold rate during the trust period |
| **Customer support** | "Confidence Period in progress" badge on user profile; priority queue for users currently in a Guarantee event | Prevents AI-loop responses to users in active Guarantee state — the support team picks up these tickets first |
| **Product analytics** | Real-time funnel: activation → cycle 1 → cycle 2 → cycle 3 → flip; reversal cohort tracking | Each cycle is a distinct conversion event; reversal at cycle 1 vs cycle 3 has different root causes |
| **Treasury** | Mirror cost float report (Revolut effectively co-funds the old-bank balance during parallel run); Salary Guarantee advance ledger | Both are quantifiable capital costs — need to be modeled and bounded |

**External-stakeholder comms.**

| Stakeholder | What they see | Why |
|---|---|---|
| **Old bank** | Nothing automated. The CASS mechanism is invoked only if user picks the formal CASS path for DD migration | Revolut deliberately doesn't compete head-on; the cohabitation is a feature |
| **Major UK payroll providers** | Future B2B integration target. Discussions around direct payroll-mandate API | Eliminates the HR-letter friction entirely for users at integrated employers |
| **PRA / FCA** | Regulatory disclosure that the Salary Guarantee mechanism is a contingent-credit product; bounded exposure (max 1 salary per user, 7-day expected clearance) | Pre-cleared with regulator at design stage rather than after launch |

### d) Metrics — adoption + usage

| Tier | Metric | Why it matters |
|---|---|---|
| **North Star** | UK primacy % | The single goal |
| **Primary leading** | Confidence Period activation rate (% of eligible users who start) | Conversion of intent to action |
| | Cycle completion rate: cycle 1 / cycle 2 / cycle 3 (funnel) | Where users drop — cycle 1 dropout signals different root cause than cycle 3 dropout |
| | Time-to-flip from activation | Migration speed |
| | Reversal rate by cycle | Reverse signal — high reversal at cycle 1 means we mis-detected eligibility; at cycle 3 means our value prop is weak |
| **Salary Guarantee** | Hold-rate during Confidence Period (target: <1% — pre-clearance works) | The Guarantee should fire rarely; if it fires often, pre-clearance is broken |
| | Guarantee invocation rate (frequency × £ dispensed) | Capital exposure |
| | Post-Guarantee retention (do users stay after their Guarantee was invoked?) | The most expensive single signal — proves the Guarantee converts a "freeze incident" from churn-event into trust-event |
| **Secondary leading** | Mirror-% distribution chosen by users | If most pick 50%, our default is wrong; if most pick 0%, the feature was never the bottleneck |
| | Existing-user activation rate (users who already had salary here pre-launch) | Closes the t17 gap — existing primacy users finally getting visible reward |
| | DD migration pacing (cycle 1 / cycle 2 / cycle 3 breakdown) | Risk pacing — rent in cycle 3 vs cycle 1 |
| **Lagging** | Net primacy uplift (Y1, Y2) | The bet |
| | Demote-funnel reversal rate (% of users moving DDs back to old bank within 6 months) | The hidden churn signal |
| | NPS for users 3 months post-flip | Did primacy stick? Are they happier? |
| **Internal health** | Mirror float cost (basis points) | Bounded capital cost |
| | Guarantee advance-vs-collect ratio | Repayment latency |
| | AML false-positive rate on Confidence Period users (vs. control) | Validates the pre-clearance hypothesis |

**Success threshold for Year 1:** 5pp net UK primacy uplift attributed to Confidence Period (≈500k incremental primary users at 10M UK base). Failure threshold: <1pp net, and/or >20% cycle-1 reversal rate — both indicate the mental model is wrong.

### e) Risks & open questions

<div class="risks" markdown="1">

- **Salary Guarantee abuse** — a user invokes the Guarantee, withdraws the advance, then de-primacies before the held salary clears. *Hedge:* the advance is contingent-credit with a 30-day clawback right tied to the salary deposit; max one invocation per 90 days; pre-clearance via verified-employer signal pushes hold rate below 1%, so abuse-eligible events are rare by design.
- **Mirror float capital cost** — Revolut effectively co-funds the old-bank balance during the parallel run. *Hedge:* the 30% default keeps capital exposure bounded; treasury models mirror float at <50bps of monthly active-salary throughput, recoverable as primacy compounds.
- **Open Banking coverage gaps** — not every UK bank exposes the granular salary-and-DD signal Confidence Period needs. *Hedge:* MVP supports the top-10 UK banks (covers ~85% of consumer salary mandates); manual self-declared fallback for the remainder.
- **AML pre-clearance assumption** — the model depends on Confidence Period users seeing a lower hold rate than control. *Open question:* if pre-clearance only lowers hold rate by ~30% (not the ~70% modelled), the Guarantee fires more often and the unit economics compress. Mitigated by a shadow-mode pilot before public launch.

</div>

---

## Section 5 — Idea 2: **Locked Insights**

<div class="tldr" markdown="1">

<span class="tldr-label">TL;DR</span> The pull idea — only-on-primary value. Insights sits in the bottom nav for every user. Non-primary sees real cards with blurred numbers and a one-time sample peek; primary unlocks subscription audits, cashflow forecasts, DD optimisation, anomaly detection. Structural moat: only Revolut's full-income visibility produces these insights — Monzo, Starling, Chase can't match it. Closes P5 and activates V2. **4-6 months to build · 2-3pp standalone Year 1 · 5pp paired with Idea 1.**

</div>

### What it is

A salary-aware intelligence surface that **only functions with the user's full income visible**. Non-primary users see the *shapes* of insights — real cards in the Insights tab with blurred numbers — with a single CTA to unlock by making Revolut primary. Primary users see fully populated cards updating in real time: subscription audits, payday-cashflow nudges, DD-payday optimisation, projected-shortfall auto-vault-pull, bill anomalies.

The conversion driver is **data envy**. The user sees what they're missing *in their own currency, on their own data*.

### Why this attacks the deepest under-served vitamin

- **V2 (Salary-aware intelligence)** is the most under-leveraged existing vitamin in the live product. Pockets · Payday · instant transfers · real-time categorisation — Revolut has every component already shipped. The product hasn't *assembled* them into a primacy-conversion surface.
- **P5 (Primacy-hostile surface)** — Locked Insights is the antidote. The Home tab today is optimised for cross-sell; Locked Insights gives it a daily-ritual reason to open that depends *specifically* on primacy.
- **Structural defensibility.** Insights are derived from cross-product signal across the full income stream — exactly the kind of correlation only Revolut's all-in-one balance can do. Monzo can't match this; Starling can't; Chase can't. Differentiation is structural, not skin-deep.

### a) Step-by-step UX flow

#### Screens 1 & 2 — Locked state → Sample peek

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Insights</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">Things we<br/>could tell you</div>
    <div class="sb-sub">…if we could see your full income.</div>
    <div class="card locked">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg></span><span class="card-lock">🔒</span></div>
      <div class="card-title"><span class="amount-pill">£<span class="blur">42</span></span> / month</div>
      <div class="card-body">on <span class="blur">3</span> subscriptions you haven't used in 90 days</div>
      <div class="card-cta">Unlock with full income →</div>
    </div>
    <div class="card locked">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg></span><span class="card-lock">🔒</span></div>
      <div class="card-title">Day <span class="blur">25</span> · you'll be £<span class="blur">180</span> short</div>
      <div class="card-body">Auto-vault-pull recommended before payday</div>
      <div class="card-cta">Unlock with full income →</div>
    </div>
    <div class="card locked">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg></span><span class="card-lock">🔒</span></div>
      <div class="card-title">Move <span class="blur">1</span> DD to payday +<span class="blur">2</span></div>
      <div class="card-body">Save £<span class="blur">36</span>/yr in overdraft risk</div>
      <div class="card-cta">Unlock with full income →</div>
    </div>
    <div class="cta-primary">Unlock all · Make Revolut primary</div>
    <div class="cta-secondary">Try a sample · no commitment</div>
  </div>
</div></div>
<div class="caption">Screen 1 — locked state. Real cards with CSS-blurred numbers, so the absence is concrete (3-digit money field, a date, a count) rather than abstract.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Sample insight</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sample-banner">This is an example. Real cards would use your actual transactions.</div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg></span><span class="success-pill">sample</span></div>
      <div class="card-title">£37 / month on 3 unused subs</div>
      <div class="sub-list">
        <div class="sub-row"><span class="sub-name">Apple Arcade</span><span class="sub-meta">last used 142d ago</span></div>
        <div class="sub-row"><span class="sub-name">LinkedIn Premium</span><span class="sub-meta">last used 87d ago</span></div>
        <div class="sub-row"><span class="sub-name">NYT Cooking</span><span class="sub-meta">last used 121d ago</span></div>
      </div>
      <div class="card-cta-row">
        <span class="mini-cta">Cancel all</span>
        <span class="mini-cta alt">Review individually</span>
      </div>
    </div>
    <div class="sb-sub" style="margin-top: 2mm;">We can give you cards like this — for your numbers.</div>
    <div class="cta-primary">I want this for my data</div>
    <div class="cta-secondary">Maybe later</div>
  </div>
</div></div>
<div class="caption">Screen 2 — sample peek. The abstract becomes concrete. <em>"I want this for my data"</em> flows straight into Confidence Period setup — the push and pull synergise here.</div>
</div>
</div>

Notes on craft:

- **Blurred, not replaced.** Numbers use a real CSS blur, not `???` placeholders — so the absence is concrete in the user's own currency.
- **"Full income" not "salary."** The unlock CTA emphasises *seeing your money* — never "upgrade." Locked-state copy avoids paywall mental models.
- **Sample-peek = load-bearing conversion lever.** Users not ready to commit get the *shape* of the unlocked state with fictional data. The CTA on Screen 2 is the cleanest known handoff into the push idea.

#### Screens 3 & 4 — Live state → Catalogue / Year-in-Review

<div class="screens-grid">
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Insights</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="sb-h1">What your<br/>income tells us</div>
    <div class="sb-sub">3 new this week · £463 saved this year</div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg></span><span class="success-pill">new</span></div>
      <div class="card-title">£42.97/mo on 3 unused subs</div>
      <div class="card-body">Apple Arcade · LinkedIn Premium · NYT Cooking — none used in 90+ days.</div>
      <div class="card-cta-row">
        <span class="mini-cta">Cancel all</span>
        <span class="mini-cta alt">Review each</span>
      </div>
    </div>
    <div class="card warn">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg></span><span class="warn-pill">forecast</span></div>
      <div class="card-title">Day 25 · £180 short</div>
      <div class="card-body">Auto-pull from your Savings Vault before payday?</div>
      <div class="card-cta-row">
        <span class="mini-cta">Yes</span>
        <span class="mini-cta alt">Schedule</span>
        <span class="mini-cta alt">Adjust</span>
      </div>
    </div>
    <div class="card live">
      <div class="card-row"><span class="card-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg></span></div>
      <div class="card-title">Move gym DD to payday +2</div>
      <div class="card-body">Currently lands 27th — 1 day before payday. Caused 3 overdraft-risk days last year.</div>
      <div class="card-cta-row">
        <span class="mini-cta">Move it</span>
        <span class="mini-cta alt">Why</span>
        <span class="mini-cta alt">Dismiss</span>
      </div>
    </div>
  </div>
</div></div>
<div class="caption">Screen 3 — live state. Same card shape as locked, now populated with real numbers + 1-tap actions per insight. Cards cadence: subs monthly, cashflow daily, DD quarterly, anomalies one-off.</div>
</div>
<div class="screen-cell">
<div class="phone"><div class="phone-inner">
  <div class="status-bar"><span>9:41</span><span class="right"><span>5G</span><span class="battery"></span></span></div>
  <div class="nav-bar"><span class="back">‹</span><span class="title">Year in Review · 2026</span><span class="more">⋯</span></div>
  <div class="screen-body">
    <div class="yir-hero">
      <div class="yir-label">We saved you</div>
      <div class="yir-amt">£463</div>
      <div class="yir-sub">across 23 insights you acted on this year.</div>
    </div>
    <div class="sb-section-label">Where it came from</div>
    <div class="yir-row"><span class="yir-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg></span><span class="yir-name">Subscription audit</span><span class="yir-amt-sm">£217</span></div>
    <div class="yir-row"><span class="yir-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg></span><span class="yir-name">Cashflow forecast</span><span class="yir-amt-sm">£94</span></div>
    <div class="yir-row"><span class="yir-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg></span><span class="yir-name">DD payday optimisation</span><span class="yir-amt-sm">£72</span></div>
    <div class="yir-row"><span class="yir-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></span><span class="yir-name">Bill anomalies</span><span class="yir-amt-sm">£48</span></div>
    <div class="yir-row"><span class="yir-icon"><svg class="ico" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg></span><span class="yir-name">Salary-aware investing</span><span class="yir-amt-sm">£32</span></div>
    <div class="sb-section-label">Manage your insight types</div>
    <div class="cta-secondary alt">Tune cadence · mute · turn off</div>
  </div>
</div></div>
<div class="caption">Screen 4 — annual Year-in-Review. Reframes Insights from feature → quantified outcome. The tier-renewal hook + the retention asset live here.</div>
</div>
</div>

### b) Contextual hooks to create awareness

| # | Hook | Surface | Trigger |
|---|---|---|---|
| 1 | Insights tab persistent | Always present in bottom nav, locked-state by default | Every session, regardless of primacy state |
| 2 | Post-spend "we could have told you" | Transaction confirmation screen | After any debit-card spend > £20 — *"🔒 You spent £42 at Tesco. We might've told you you'd hit your weekly budget — unlock to see"* |
| 3 | End-of-month digest | Email | First Friday of each month — *"What we saw this month — unlock to see"* with 1 blurred sample card |
| 4 | Pockets / cashflow page | Locked preview card embedded | When user opens Pockets → top card is locked Insight preview |
| 5 | Onboarding tour | New user flow | Step 4 of 6 onboarding: *"Here's where you'd see what your income tells us"* |
| 6 | Post-Metal/Ultra upgrade | Plans page | *"Your tier is upgraded. Insights only work when your salary lands here. Connect your full income to fully unlock."* |
| 7 | Referral copy | Sharing modal | Pre-filled message: *"I just unlocked Revolut Insights — it caught £37/mo of dead subs"* — primary-user testimonial |
| 8 | Sample peek | One-time per user | Surfaces 24h after first session if user is non-primary |
| 9 | Confidence Period synergy | Mid-Confidence-Period | First insights populate in real time as the user goes through cycles — pull-feature reinforces push-feature |

### c) Notifications & communications lifecycle

**User comms.**

| Event | Channel | Cadence |
|---|---|---|
| New insight detected | In-app notification | Real-time |
| Weekly insight digest | Push or email (user preference) | Weekly |
| Monthly "we saved you" summary | Email | First of each month |
| Annual Year-in-Review | Email + in-app modal | January |
| Locked card sample peek | Push | One-time, 24h post-signup |
| End-of-month locked digest | Email | Non-primary users only |

**Stakeholder comms (internal).**

| Stakeholder | What they see | Why |
|---|---|---|
| **Data / insights team** | Insight-detection catalogue: which signal fires which insight; per-insight precision/recall | Quality of the insight engine is the product |
| **Product team** | Insight performance dashboard: impressions → taps → actions taken | An insight that drives 0 action is dead weight and should be retired |
| **Compliance / GDPR** | Insight pipeline review: any new insight involving third-party data (e.g. subscription cancellation through merchant) needs sign-off | Subscription audit touches data-sharing assumptions |
| **Support team** | When user contacts support, recent insights visible in the case context | Lets human support reference relevant primacy-friction-points |

**External stakeholder comms.**

Generally not surface-facing externally — Insights is an internal correlation product, not a B2B integration. The exception: the subscription-cancellation action depends on merchant SDKs / direct cancel APIs where possible. Some merchants need to be partnered with for clean cancel; otherwise the action falls back to "guide me through cancel" (deeplink).

### d) Metrics — adoption + usage

| Tier | Metric | Why it matters |
|---|---|---|
| **North Star** | Locked-Insights-attributed Primacy conversions (locked-tap → setup → flip) | The KPI |
| **Primary leading** | Locked insight impressions per user per session | Surface visibility |
| | Locked card tap-rate | The first qualifying behavior |
| | Tap-rate by insight type | Which insight categories drive conversion? |
| | Sample peek engagement rate | Sample is the highest-intent intermediate signal |
| | Sample → Confidence Period start rate | The handoff conversion |
| **Post-unlock** | Insight unlock rate (% of new primary users with insights live within 7 days) | Speed-to-value |
| | Insight action-take rate (per category) | Quality of insight catalogue — an insight that drives 0 action is dead weight |
| | Per-insight £ value delivered (saved / earned) | Quantifies "we saved you £X" |
| | Insight dismiss rate | Tunes which insights are noise |
| **Synergy** | Confidence Period users who also act on Locked Insights cycle 1 | Push-pull compounding signal — co-activation is the strongest leading indicator |
| **Lagging** | Insight-driven primacy retention (do users who act on insights churn less?) | The unique-defensibility check |
| | Referral mentions of "Insights" in shared content | Verbatim signal of breakthrough |

**Success threshold Year 1:** 2-3pp standalone primacy lift; 5pp paired with Confidence Period (compounding via the sample-peek → activation path).

### e) De-primacy flow (what happens if the salary leaves)

If the salary signal disappears for two consecutive cycles (or drops below 50% of historical norm), Insights gracefully degrades: real cards lock again, but the **Year-in-Review snapshot is preserved as a sealed historical record** the user can keep returning to. A one-question survey fires once on de-primacy ("What changed?") to differentiate temporary gaps (between jobs, parental leave, sabbatical) from active churn — temporary gaps suppress the locked re-prompt for 90 days, churn signals route to retention. Crucially, the preserved Year-in-Review is the hook back: *"You saved £463 last year with Insights. Route your salary here again to keep them live."* The history *is* the retention asset.

### f) Risks & open questions

<div class="risks" markdown="1">

- **Insight precision drift** — a single false-positive on a "wasted subscription" damages trust faster than a missed insight builds it. *Hedge:* precision-first catalogue policy — only ship an insight type after shadow-mode precision >90% across a representative cohort; per-insight user mute; quarterly audit retires any insight with action-rate <5%.
- **Sample-peek "burn"** — the one-time fictional sample loses impact if shown to the wrong cohort or at the wrong session. *Hedge:* gate the sample peek behind 7+ in-app sessions to ensure the user already values the surface; generate sample numbers fresh per user (not templated) so it reads as plausible rather than canned.
- **"Locked" framing as friction** — some users may read blurred numbers as paywall and bounce. *Hedge:* sample peek IS the free-tier value moment, so the "locked" copy emphasises *"we just can't see your full income yet"* — never "upgrade." Locked-state copy is A/B tested in the first 90 days for bounce vs activation.
- **Compliance perimeter** — subscription audit + cancel-from-Revolut depends on merchant APIs and data-sharing assumptions. *Open question:* which merchants partner; which fall back to deeplink-guided cancel? *Hedge:* MVP scope = top-20 UK consumer subscriptions (~70% of category volume); deeplink fallback for the rest.

</div>

---

## Section 6 — Why these two ideas, together

A short closing on why this is the pair, viewed across the dimensions that matter for a primacy bet of this size:

**Originality of mechanic.** Two ideas that **neither pay for primacy nor copy Monzo's playbook**. Confidence Period acknowledges the two-bank cohabitation deal that every Reddit thread reveals as the rational user equilibrium, and uses it as a bridge rather than a competitor. Locked Insights reframes primacy from a sacrifice ("give us your salary") to a key ("see what your salary tells us"). Both mechanics are unique implementations rather than feature combinations.

**Depth of implementation.** Each idea is *one mechanic*, not 5 features bundled. Confidence Period = parallel-run + Salary Guarantee + cycle state machine. Locked Insights = locked surface + insight engine + sample peek. Both are defended end-to-end at the screen, hook, comms, and metric level — see sections 4 and 5.

**Strength of reasoning.** The trail is auditable: primary research surfaced 11 pains, clustered into 5 macro categories with 2 uncovered by any current vitamin; the ideation pool was scored on four axes and the two picks emerged with full pair-defensibility (push-pull, complementary cohorts, no redundant mechanism). Runner-ups are explicitly named and explicitly rejected.

**Sized impact.** Conservative model: Confidence Period at 5pp UK primacy lift Year 1 (5% conversion of C3 cohort ≈ 500k users); Locked Insights at 2-3pp standalone, 5pp paired via the sample-peek funnel. Together: **8-10pp net UK primacy lift Year 1** — a meaningful step on a sub-20% global baseline. Failure modes are explicitly named (cycle 1 reversal > 20%; insight action-rate < 5%).

The two ideas are designed to be **defensible end-to-end**, not just plausible at first read. Every load-bearing claim is anchored: every quote is sourced, every number is cited, every cohort sizing is built up from primary research.

---

## Appendix — Evidence sources

Full Stage 1 research at `cs1_revolut_research.md` (v2, 275 lines). Full Stage 2 synthesis at `cs1_revolut_painkiller_vitamin.md`. Full Stage 3 ideation + scoring at `cs1_revolut_ideation.md`.

Primary signals lifted in this submission:
- Revolut Annual Report 2024 — "primary users grew 59% YoY" (absolute undisclosed)
- Sacra / Sifted — deposit comparator (£575 / £811 / £2,944)
- Allegiant.co.uk citing UK Finance + Action Fraud — fraud volume comparator
- Reddit r/Revolut + r/UKPersonalFinance — 17 threads, 1,000+ comments synthesised (see appendix bibliography in `cs1_revolut_research.md`)
- Monzo blog (Sept 2019, Jan 2020) — Salary Sorter + partial-switch onramp
- Be Clever With Your Cash (May 2026) — incentive comparator
- Storonsky / Bloomberg (April 2026) — strategic positioning
- Revolut UK Bank launch announcement (11 March 2026) — regulatory state
