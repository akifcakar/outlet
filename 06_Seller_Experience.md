# 06_Seller_Experience.md

# Seller Experience

> Version: 1.0 — Completes the seller side promised in 05.7. Rules trace to 01 (channel conflict, recovery framing), 02 (mobile-first listing), 04 (components).
> The one-line goal: **a store employee lists a display item from a phone in under 3 minutes, and the business owner sees exactly how much value was recovered.**

A marketplace is supply first (01: Focus & Rollout). The seller experience is therefore not an admin panel bolted on — it is half the product.

---

## 06.1 Who the seller is

Two personas drive every design decision:

**The floor person** ("Mağaza çalışanı") — uses a phone, on the shop floor, between customers. Lists items, answers "has it shipped" questions. Needs: speed, camera-first, zero training.

**The owner / ops manager** — uses desktop weekly. Decides whether Atlas is worth it. Needs: recovery numbers, payout clarity, no surprises.

Everything in the seller UI is built for the floor person; everything in reporting is written for the owner.

---

## 06.2 Onboarding & verification (detail of 05.7)

1. **Apply** — company details, vergi no / MERSİS, contact, categories, expected volume. One step per screen, save-and-resume.
2. **Review** — manual in MVP (10: vetting criteria). Status page + email at every transition: Received → In review → Approved / Declined (always with reason).
3. **Activate** — on approval, a guided first-run: payout details (IBAN, billing info for commission invoices), shipping defaults (carrier, handling time), return address. A seller cannot publish a listing until these three exist — no half-configured sellers discovering problems at first sale.
4. **First listing nudge** — activation ends on the "New listing" button, not a dashboard tour.

Concierge path (01: founder-led onboarding): ops can create and manage listings *on behalf of* a seller account. Same data model, different actor — this is how the first 50 sellers are onboarded (13) and it must be a first-class capability, not a hack.

---

## 06.3 The listing flow (the core of this document)

Mobile-first, one step per screen (02), auto-saved draft at every field, resumable from any device. Target: **under 3 minutes, under 10 decisions.**

### Step 1 — Photos (first, always)
- Opens directly into camera/gallery. Minimum 3 photos; guidance overlay suggests angles (front, back, label/serial).
- Photo tips inline, one line each (03 photography rules: bright, neutral background, real).
- Photos upload in background while the seller continues — never a "wait for upload" wall.

### Step 2 — What is it?
- Category (2 taps max), brand (searchable), title (pre-suggested from brand + category, editable), key specs (category-specific short form: 3–6 fields).

### Step 3 — Condition (the story)
- The 10 conditions from 01, as cards with one-line plain-Turkish explanations, not a dropdown.
- Selecting Returned Product / Refurbished may trigger category-specific compliance fields (11: e.g. refurbished electronics rules).

### Step 4 — Grade (the state) + flaw photos
- A / B / C as three cards, each with the definition AND two example photos ("this scratch = B, this dent = C") — **the grading guide lives inside the flow**, not in a help center.
- Selecting B or C immediately requires flaw photos: "Photograph every flaw. Buyers trust what they can see." Each flaw photo gets a one-line label ("sol yanda çizik").
- Honest-grading nudge, stated once, plainly: "Items graded accurately sell faster and never come back. Misgraded items are returned at your cost and count against your score." (10: penalty matrix.)

### Step 5 — Why discounted (mandatory, free text)
- One field, with a good/bad example right above it:
  - ✗ "Fırsat ürünü!"
  - ✓ "3 ay mağazamızda teşhirde kaldı."
- Minimum length enforced softly; curation review (10) rejects non-answers.

### Step 6 — Price
- Original price (verifiable — link or catalog reference where possible) and Atlas price.
- **Pricing guidance** (the data moat, 01): once data exists, show "Similar Grade B items in this category sold in X days at Y–Z% off." In MVP, show a static per-category suggested discount band. Guidance, never enforcement — fixed price is the seller's.
- Computed savings shown as the buyer will see it.

### Step 7 — Logistics & publish
- Stock (default 1), handling time, shipping method/cost (from seller defaults, editable per listing), return address confirmation.
- Full **preview exactly as the buyer sees it** — product card + detail page with Transparency Card. The seller approves their own Transparency Card before publishing.
- Publish → curation state (see lifecycle below).

### Listing lifecycle
`Draft → Submitted → (curation review, 10) → Live → Sold / Removed`
- MVP: review before first-ever listing goes live per seller; established sellers (score threshold) publish instantly with post-hoc spot checks. Curation effort concentrates where risk is.
- Rejections always carry a reason + one-tap "fix and resubmit".

---

## 06.4 Seller dashboard (full spec, expands 05.7)

Desktop layout: left nav. Mobile: bottom tabs. Sections:

### Overview (the owner's screen)
- This month: items sold, gross sales, **recovery rate** ("Sattığınız ürünlerde perakende değerin ort. %58'ini geri kazandınız"), pending payouts.
- Action queue on top: to-ship orders, listings needing fixes, disputes needing response. The dashboard leads with what needs doing, not with charts.

### Listings
- Table/cards: photo, title, grade, price, status, views, followers, days live.
- Filters by status; search. Actions: edit (price/stock/photos — condition & grade edits re-trigger review), pause, remove.
- "Stale listing" signal: live 30+ days → gentle suggestion with data ("Similar items priced 10% lower sold within a week").

### Orders
- To-ship queue is the default view. Each order: buyer address, packing note, **"Mark shipped + tracking number"** as the single primary action. Shipping SLA countdown shown per order (handling time commitment).
- **Product invoice step:** the seller uploads (or confirms sending) the buyer's invoice as part of shipping — the seller invoices the buyer, Atlas only invoices commission (11.5). The ship action nudges but doesn't block; missing invoices surface as a fix-it task.
- Post-ship: delivery status mirrors the buyer's timeline (05.6). Sellers see exactly what buyers see — one truth.

### Payouts
- Per order: held in escrow → released (buyer confirmed / auto-confirm, 10) → paid out.
- Payout schedule stated plainly; commission shown per line with the invoice (11). No seller should ever need support to answer "where is my money" — this screen is the answer.

### Performance
- The seller score and its three components (01): shipping speed, **grade accuracy** (from buyer grade-check answers, 05.6), dispute rate. Shown exactly as buyers see it, with per-component history and concrete improvement hints.
- Strike status visible (10): nothing about a seller's standing is ever hidden from the seller.

---

## 06.5 Seller communications

- Event notifications (push/email, seller-configurable): item sold (the golden moment — instant), shipping reminder at SLA half-time, payout released, dispute opened, listing approved/rejected, weekly digest (owner-oriented: sold, recovered %, stale listings).
- No marketing noise into seller channels. Every notification is actionable or money.
- Buyer–seller direct messaging: **not in MVP.** Pre-sale questions are curation's job (listings must answer everything); post-sale issues go through the structured order flow (05.6). Messaging opens a support burden and a trust hole (off-platform deals) — revisit post-MVP with guardrails.

---

## 06.6 Post-MVP seller roadmap (explicitly out of v1)

- Bulk listing (CSV / photo-batch), multi-store & role-based accounts (owner vs floor staff), API / e-commerce platform integrations (Ticimax/İdeasoft/Shopify-class), sponsored placement self-serve, premium subscription tools (01 revenue model), pricing analytics deep-dive.
- Ordered by one criterion: what unlocks more supply with the least trust risk.
