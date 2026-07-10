---
id: V3-B4-DESIGN-GENERAL-en
title: ver3 Design Document (General Audience) — A Guide for Everyone
date: 2026-07-10
status: reviewed
audience: general
phase: B4
language: en
canonical: "ver3-設計書-一般人用-v1.md"
depends_on:
  - docs/planning/ver3/ver3-最終要件定義書-v1.md
  - docs/planning/ver3/ver3-ユーザー裁定-2026-07-10-第2回.md
  - docs/planning/ver3/b2/README.md
  - docs/planning/ver3/b2/research-gmo-aozora-api-v1.md
  - docs/planning/ver3/b3/ver3-開発計画-v1.md
---

> Machine-generated English derivative. The Japanese version is canonical (§8.3 of the final requirements).

# Hercules Laboratory (ver3) — A Guide for Everyone

> **Who is this document for?** People who are not technical. People who raise beetles, their families, anyone visiting here for the first time. Whenever a difficult word appears, we explain it on the spot.

## Introduction — An Honest Notice

**Everything described in this document is still a "blueprint."** If we compare it to a house, we are at the stage of "floor plans for a house we are about to build." Throughout this document, we clearly separate the parts that already work today (the current site) from the parts we are going to build. We will not lie by writing "it already works." That honesty is one of the promises this system is built on.

---

## 1. What Is This?

**A system that turns observations of the Hercules beetle (Dynastes hercules — the largest beetle in the world) into "research data," starting from a single photo.**

Normally, beetle growth records get written in notebooks or phone memos and eventually get lost. With this system:

1. **Observe** — Record a larva's weight, size, temperature, and so on, together with photos
2. **It becomes research** — As records accumulate, they become the raw material for discoveries such as "at which temperature do they grow largest?"
3. **Buy and sell** — You can trade the individuals you raised, together with their full growth records. Because the records never disappear, lying about bloodlines becomes hard — and unprofitable
4. **It becomes culture** — Everyone's records, tricks, and discussions pile up and help the people who come after

All of this runs on top of a **"record notebook with no eraser."** Once something is written, it cannot be erased. If you make a mistake, you do not erase it — you add a new page saying "corrected." That is why the records can be trusted.

> **What is a record notebook with no eraser?** In the computer world this is called "append-only." In this system, the record storage (Cloudflare R2, a warehouse on the internet) is machine-enforced to follow the rule "you can only add." Concretely, the key (token) used to access the warehouse is issued without any "delete permission" in the first place, so records cannot be deleted even from the everyday admin console.

The system is not only for beetles. You can choose from 5 kinds of subjects — living things, tools, digital things, environment (temperature etc.), and things you define yourself — and record them all the same way.

---

## 2. The 5 Promises We Hold Dear

This system has 5 promises that act like a "constitution": they do not change even when features change.

| # | Promise | In plain words |
|---|---------|----------------|
| ① | Run for 10 years on a system that costs almost nothing | We do not rely on expensive servers or monthly fees. We build it so that one person's pocket money can keep paying for 10 years. Lasting a long time matters most |
| ② | Everyone can fix it | The blueprints and the programs are all public. Just like publishing a cooking recipe that anyone can adapt their own way. People who improve it get their gratitude recorded as a "contribution" |
| ③ | Records are never erased | This is the "record notebook with no eraser" above. Mistakes are part of history too. Corrections are made by adding, not erasing |
| ④ | Humans decide the important things | Anything irreversible, anything involving money, anything published externally, and the final confirmation of "what species is this beetle?" are never decided by AI or programs on their own — a human always decides |
| ⑤ | Only things that pass inspection are shipped | Everything we build must pass a check by a separate "inspector" before it ships. We never ship on "it probably works" |

These 5 promises are the foundation of every page in this document. If anything in this document ever conflicts with the 5 promises, the promises win.

---

## 3. What Will You Be Able to Do?

The build order is fixed. **We do not build everything at once.** We completely finish "the first things you can do" before moving on.

### 3-1. The first things you can do (Wave 1 — to be built)

The very first goal is this: **"Observation works on screen and gets written into the notebook that never erases."**

- **Recording an observation** — 3 screens: choose the subject → enter numbers and photos → confirm and register
- **Registering photos** — Photos you take are stored, linked to the observation
- **Reviewing records** — A detailed page for each individual
- **Parent-child links** — Register the father and mother individuals and trace the bloodline
- **QR codes** — Stick a QR label on the rearing case; scan it with your phone and that individual's records open instantly
- **Login** — A method where you don't need to remember a password. Just click a link that arrives by email, once

After that, in order within Wave 1: free-form measurement templates, search for similar individuals, the market (buying and selling), karma (the record of trust), automatic matching of bank transfers, the forum (the commons of knowledge), and more.

### 3-2. The next things (Wave 2 — after Wave 1 is done)

- A pipeline that makes research videos from observation data
- A stronger wiki (encyclopedia) that gathers everyone's knowledge
- A dashboard that records and looks back on the "eras" of the civilization

**None of these have even been started.** We begin only after Wave 1 passes inspection.

### 3-3. Things under experiment (Experimental track — opt-in only, normally invisible)

- **A broadcasting character built from your own records** — An experiment in creating a character that speaks in videos etc., based on what you wrote and recorded. Only people who want it flip the switch (off by default). The character is strictly a "performer": it can never touch money or important decisions. How it is presented to the world is, in the end, decided by a human
- **Cultural cycle prediction** — An experiment in using AI to predict "trends repeat." However, the long records prediction requires do not exist yet, so it will not run in earnest until records accumulate
- **Designing the scarcity of the medal** — Detailed rule-making to keep the platinum coin explained in Chapter 4 a "medal that never over-multiplies"

---

## 4. How the Money Works

### 4-1. The fee is 8% — cheaper than Yahoo! Auctions

When a trade completes on the market, **8%** of the sale is paid by the seller as a "system maintenance fee."

- We declare in the constitution that this will **always stay cheaper** than the major domestic auction sites (Yahoo! Auctions' final-value fee is 8.8–10%)
- If you pay within 30 days, the same amount converts into your "capital contribution" (a record of having supported this system). It is not a fee that is simply taken from you
- The operator never holds your money. Seller and buyer deal directly; the operator only provides the record-keeping and the trust system

### 4-2. Karma = a balance of trust

**Karma is a "balance of trust."** Unlike game points, **there is no way to increase it**.

- It starts at 0. Causing problems — lying, attacking others, deliberately not shipping — decreases it
- The only way to recover is "time." In months where you cause no problems and keep observing (registering biological data), it slowly comes back
- Likes and money move karma by exactly zero. **It cannot be bought and cannot be inflated** — and that is precisely why it counts as trust

### 4-3. The platinum coin = a medal that cannot be bought

**The platinum coin is not a currency — it is the civilization's medal (honor).** Just as Olympic gold medals are not sold in shops.

- **It cannot be bought with money.** It cannot be given away or sold either
- You receive one only **when you fill a "hole" in the civilization** — you solved something everyone was struggling with, you did good research. It is issued only then
- **Inflation (the value dropping because too many are issued) will absolutely never happen.** To guarantee that, **at the moment a coin is used (consumed)**, a portion of what was used (one tenth) goes to the people who built the foundation first, and **the remainder disappears without ever circulating**. Coins you hold but have not used never shrink on their own. Because the remainder disappears, the coin stays heavy forever
- It is completely separate from karma. Holding many medals never raises your trust (karma)
- We will never run scarcity-hype marketing like "only a few left!"

> **An honest caveat:** Detailed numbers such as "how many may be issued per month" and "what percentage disappears" are **not yet decided**, because the source materials disagree with each other. The design team will draft a recommendation, and the final decision will be made by a human (the operator). Until it is decided, we will not write "it is decided."

---

## 5. How Bank Transfers Work

Fees and other payments are made by bank transfer. The problem here is: "**who sent this transfer?**" A bank statement only shows a name and an amount.

### 5-1. Your personal transfer code "U-XXXX"

When you register, you are issued your own short code (for example `U-7K2M` — alphanumerics starting with U). When you make a transfer, you put this code in front of the sender name.

- The code is computed from your ID and **never changes**. Remember it once and you can use it for every payment
- The system automatically reads the deposit statement from the bank (GMO Aozora Net Bank), finds the code, and automatically matches "whose payment, for what"
- Even if you transfer late at night, the system checks the statement periodically, so it will be processed if you wait

### 5-2. Verify first in the practice bank "sunabar" (sandbox)

GMO Aozora Net Bank offers **a practice environment that uses no real money (named "sunabar," meaning sandbox)**.

- First, in the sandbox, we test "fake deposit → automatic matching → recording" over and over
- Only after every test passes do we connect to the real account for the first time
- **Installing the real key (the production connection key), and the first confirmation that a real deposit was processed correctly, are always done by a human.** We never leave this to AI or programs (Promise ④)

### 5-3. Money records also go in the "notebook with no eraser"

Deposits, fees, and coin records are all written to an append-only ledger. They cannot be rewritten later, so "he said, she said" disputes cannot happen. If you overpay, the excess is recorded in the same ledger as a "credit usable next time." Conversely, if you transfer less than the amount due, what you paid is still properly recorded, and the shortfall remains in the ledger as "outstanding" (transferring the difference later is fine).

---

## 6. The Relationship with AI — AI Works at Night, You Decide in the Morning

AI does a lot of work in this system, but **you are the protagonist**.

### 6-1. Night-shift operation and the morning review

- While you sleep, the AI does the prep work (organizing materials, tallying, drafting)
- When you wake up, the results are stacked as a **"pile awaiting confirmation" (morning review stack)**. All you do is choose **OK or NG, one item at a time**. In cooking terms: the AI preps the dishes, but you are the one who tastes them and decides whether to serve
- The AI's night work has **safety devices**: a hard cap on money spent per night and on time, always set in advance — and if no results are produced, it stops automatically. "The AI ran wild and the morning brings a huge bill" is prevented by the system itself

### 6-2. We will not automate everything

"One click and everything is done for you" is **forbidden**. Even if AI can handle 90%, **the ambiguous 10% is always decided by a human**. For example:

- The final confirmation of "what species is this larva?" — the AI only offers candidates. You decide
- Anything that moves money or publishes externally — it never proceeds without human confirmation

### 6-3. A board where you can see the AI at work

If you cannot see what the AI is doing right now, it is unsettling. So the AI's work will be visible on a **3-column board — "Waiting / In progress / Done"** (like a factory progress chart). You can peek into any job you are curious about, and any irreversible operation such as deletion always shows an "Are you sure?" confirmation. **This too is still being designed.**

---

## 7. How Your Data Is Handled

### 7-1. Consent-based — you choose

- Providing data is **something you choose with checkboxes**. You can decide item by item: "this may be used," "this may not"
- The AI never goes off to fetch your information while you are away. It only performs actions you have permitted

### 7-2. Personal information is never held in the first place

- **The system does not store your home address.** For shipping we recommend anonymous delivery or post-office pickup; the system holds only an ID and a username
- Personal information (called PII) is masked (covered) from the start by design, so it never gets into the records

### 7-3. Reconciling the "notebook that cannot be erased" with "please delete this"

The "records are never erased" promise (③) and the wish "please stop using this information" are reconciled with a **do-not-use flag**.

> **The do-not-use flag = a bookmark placed in a book that says "do not read this page."** The page (the record) itself is never torn out, but a record with the flag raised no longer appears on screen, never shows up in search, and is never used again in any way. If an official order arrives from a government office or similar, we respond immediately using this same method.

### 7-4. What is personal stays personal

Your values, your judgment habits, and your behavior records are **yours alone** and are never mixed with other users'. The only thing shared with everyone is the non-identifying wisdom, such as "patterns of tricks that worked."

---

## 8. Questions and Answers (FAQ)

**Q1. Does it cost money to use?**
There is no design that charges for participating, recording, or browsing. Money is involved in exactly 3 situations: ① 8% when a trade completes on the market (paid by the seller), ② 3% when using this system's mark (trademark) commercially, ③ 10% when a fork (an improved derivative) generates revenue. If you just record and browse normally, none of these apply. Running the system itself cheaply (Promise ①) is the foundation, so we will never move toward "adding charges to make money."

**Q2. I registered something by mistake. Can I delete it?**
No (Promise ③). Instead, you can add a "correction record." The screen shows the latest correct content, and the past mistake remains in the history. It is like correcting a test answer not by erasing it, but by drawing a double strike-through and writing the correct answer beside it.

**Q3. Can I buy platinum coins with money, or give them to a friend?**
No. Because they are medals (Chapter 4). If they could be bought, they would be nothing more than points.

**Q4. Could the AI decide something on its own?**
No. Confirming a species, money, publishing, and irreversible operations always require human confirmation (Promise ④). What the AI does stops at "offering candidates" and "doing the prep work."

**Q5. Can I use it right now?**
The ver3 described in this document is **not usable yet — it is at the blueprint stage**. The previous version's site (it-hercules.uk) is running, but most of what this document describes is yet to be built. The build order is as in Chapter 3.

**Q6. What happens if I forget to attach the code when transferring?**
Automatic matching fails, so processing is put on hold. The record itself (the deposit statement) remains without being erased, so it can be matched later. If you get stuck, contact us. Your transfer will never be treated as if it "never happened."

**Q7. Are there measures against fraud and cheaters?**
Rather than "driving bad people out," the design makes **honest trading the more profitable choice**. The history of every trade stays in the notebook that never erases and cannot be rewritten afterward to cover things up, so lying is hard and pays off less and less over time. Karma (trust) cannot be bought, so trust lost to fraud cannot be bought back with money. We build it so that trading honestly 3 times pays better than cheating once.

**Q8. What if I want to quit?**
You can quit anytime. Data you designate as "do not use anymore" gets the do-not-use flag and is never used again (Chapter 7). Note that public records (such as trade history — the parts that affect other people's trust) remain as history, by the nature of the notebook that never erases.

---

## Appendix: The Sources Behind This Document (for those who want to know)

Each chapter of this document is based on the following official documents. The numbers (V3-…) are requirement management IDs.

| Chapter | Main sources |
|---------|--------------|
| 1. What is this? | Final requirements Ch. 1 (Philosophy A "Observation Civilization"), V3-OBS-43 (observation = center), V3-OBS-01 (5 domains), V3-FND-01 (append-only), §5.3 ADR-V3-LAYER-01 (Truth/projection layer separation) |
| 2. The 5 promises | Final requirements §1.2 (5 invariant clauses) |
| 3. What you can do | V3-OBS-22 (first minimal set), §1.3 3-tier scope (Wave 1: 339 / Wave 2: 216 / Experimental: 21), Ch. 4 experimental track (V3-VID-10 on hold, V3-OTH-19, V3-AIP-42, V3-WIK-33), b3 development plan §2–3 |
| 4. Money | V3-MKT-10/11 (8%, Yahoo! Auctions comparison), V3-MKT-36 (three-tier economy 3%/8%/10%), V3-MKT-01 (non-escrow), V3-KRM-01/06 (two-layer karma, balance of trust), V3-MKT-38/V3-KRM-33 (medal philosophy, numbers awaiting human ruling), user ruling round 2 §4 |
| 5. Bank transfers | V3-MKT-12 (U-XXXX code), CL-11 (frozen derivation formula), b2 GMO research report (sunabar, deposit statement inquiry, human gate), V3-MKT-15 (production behind a human gate) |
| 6. Relationship with AI | V3-AIP-96 (night-shift operation, morning review), V3-AIP-78/31 (one-click full automation forbidden, the ambiguous 10% goes to humans), V3-OBS-03 (species identification confirmed by humans), visualization reference notes (design cues such as the 3-column kanban) |
| 7. Data handling | V3-AUT-43 (consent checkboxes), R-6 (withdrawal of unattended fetching), V3-MKT-20 (no address retention), V3-SEC-07 (PII masking first), V3-GOV-09 (do-not-use flag), V3-KRM-23 (personal data never shared) |

*This document is a Phase B4 deliverable (the general-audience one of the 3 design documents). The canonical design document is the AI-oriented one; this document restates its content for general readers. If the contents conflict, the AI-oriented design document and the final requirements take precedence.*
