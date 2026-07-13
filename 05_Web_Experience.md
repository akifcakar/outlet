# 05_Web_Experience.md

# Web Experience

> Version: 1.0 — Builds on 01_Vision, 02_Product_Principles, 04_Design_System.
> This document describes what the buyer (and entry-level seller) actually sees, screen by screen. Every component named here is defined in 04_Design_System.md; every rule traces back to 01/02.

The experience in one sentence:
**a calm, fast store where every product answers "what is it, what state is it in, why is it cheaper" before the buyer has to ask.**

Sections:
- 05.1 Global Layout (header, navigation, footer)
- 05.2 Homepage
- 05.3 Browse & Search
- 05.4 Product Detail
- 05.5 Checkout
- 05.6 User Dashboard
- 05.7 Seller Dashboard Entry
- 05.8 Error / Empty / Loading States

---

# 05.1 Global Layout

## Header

One header, two rows on desktop, one row + bottom sheet patterns on mobile. Sticky, `bg-page` with `border-default` bottom border. No promo banners above it — the header is never pushed down by marketing (02: no banner walls).

**Row 1 (always visible):**
- Logo (left) → home.
- Search bar (center, dominant — search is a primary entry point, not an icon afterthought). Placeholder rotates between honest examples: "Dyson V15", "espresso machine", "office chair".
- Right cluster: Alerts (bell), Account, Cart. Icons + labels on desktop, icons on mobile. Badge counts are real numbers.

**Row 2 (desktop):**
- Category links (max 7 + "All categories"). Text links, no mega-menu in MVP — a simple 2-level dropdown.
- Right end: one quiet differentiator link: "How Atlas works" — the trust pitch is one click away from everywhere.

**Mobile:** logo + search icon (expands to full-width input) + cart. Categories live behind a full-screen sheet (04.4). No hamburger soup: the sheet contains categories, "How Atlas works", account links — nothing else.

**Cart model note (1-unit world, 02 Scarcity UX):** the cart is a shortlist, not a reservation. Cart line items show live status — if an item sells while in someone's cart, the line flips to "Sold" state with a "Find similar" action. This is communicated in the cart UI itself ("Items are reserved only during checkout").

## Navigation principles

- Maximum depth: category → subcategory. No third level in MVP.
- Breadcrumbs on every browse and product page (SEO + orientation).
- The current section is always visibly marked.
- No "…" menus hiding primary actions.

## Footer

Calm, structured, complete — the footer is a trust document:

- Column 1: Categories.
- Column 2: Atlas — How it works, Grading explained (A/B/C page), Buyer protection, About.
- Column 3: For sellers — Sell on Atlas, Seller verification, Commission & pricing.
- Column 4: Support & legal — Help, Returns, Contact, Terms, Privacy, Imprint.
- Bottom row: payment method logos, country/language selector, © line.

The "Grading explained" page is linked from the footer AND from every Grade badge — it is the most important static page on the site.

---

# 05.2 Homepage

Purpose: not a catalog dump — a daily treasure-hunt entry point (01: Why Buyers Come Back Daily). The homepage answers two questions in order: "can I trust this place?" (first visit) and "what's new today?" (every visit after).

Section order (desktop and mobile identical in order):

## 1. Hero
- One calm statement, one supporting line, one CTA. No carousel, no rotating banners (04.3 forbids autoplay).
- Copy direction (03): "Premium products. Honest prices. Every discount explained."
- CTA: "Browse today's arrivals" → new arrivals feed.
- Visual: single high-quality product photograph, seasonal, swapped editorially — not a template collage.

## 2. Trust strip
Three items, one line each, icons from 04: "Verified businesses only" · "Every item graded A/B/C" · "Payment protected until delivery". Each links to its explainer. Quiet — `bg-subtle` band, not a badge parade.

## 3. Today on Atlas (the core section)
- New arrivals feed: product cards (04.2), newest first, editorially skimmed (curation, not raw firehose).
- Section header shows the real count: "43 new items today".
- 8 cards visible, "View all new arrivals" link. This section is why returning users come — it must load first and fast (LCP target lives here).

## 4. Categories
- Simple grid of category tiles: photo + name + live item count ("Lighting · 128 items"). Real counts, updated daily minimum.

## 5. Curated collections
- 2–3 editorial collections ("Showroom clear-out: Italian lighting", "Open-box espresso machines").
- Sponsored collections are allowed here and are **clearly labeled "Sponsored"** (01 revenue model, 02 no dark patterns).

## 6. Recently sold
- A strip of sold-state product cards (04.2 Sold overlay). Header: "Gone. Sold in the last 24 hours."
- Purpose: honest social proof + teaches the scarcity rule "when it's gone, it's gone" (01). Each card offers "Create an alert for items like this".

## 7. Seller invitation
- One quiet band: "Have display items or open-box stock? Sell on Atlas." → seller landing (05.7). One sentence, one CTA.

What the homepage does NOT have: countdown timers, "flash deals", pop-ups, newsletter interrupts, infinite personalized feeds. Logged-in users get exactly one personalized element in MVP: a "Your alerts" row above Today on Atlas *if and only if* one of their alerts has new matches.

---

# 05.3 Browse & Search

Purpose: get from "vague want" to "specific product" with honest tools. Browse (category) and Search (query) share one results template.

## Results template

- Header: category name or query, real result count.
- Product card grid (04.2): 4/3/2 columns per 04.4. Cards always show condition badge, Grade badge, price block, stock line.
- Sold items: excluded by default, included via a filter toggle ("Show sold items") — sold listings remain findable (02: liquidity proof, SEO) but never clutter live shopping.
- Load more: button-based "Show more" (not infinite scroll — footer must stay reachable, and URL updates per page for SEO/sharing). Every filter/sort state is URL-encoded: results pages are shareable and indexable.

## Filters (desktop sidebar / mobile full-screen sheet per 04.4)

Order reflects what outlet buyers actually decide by:
1. Category / subcategory
2. **Condition** (the 10 terms from 01, exact vocabulary)
3. **Grade** (A / B / C with one-line explanations inline)
4. Price range
5. Brand
6. Seller country / delivery-to

Rules: applied filters shown as removable chips above results; result counts per filter option are live; "Clear all" always visible; mobile sheet CTA shows the outcome: "Show 24 results" (04.4).

## Sort

Newest (default — the treasure hunt favors fresh), Price low→high, Price high→low, Biggest savings. No "recommended" sort in MVP — we don't have honest data for it yet, and a fake one violates transparency.

## Search behavior

- Instant suggestions after 2 characters: matching products (with thumbnail, grade, price), categories, brands. Keyboard navigable (04.5).
- Tolerant matching: typos, singular/plural, basic synonyms ("hoover" → "vacuum").
- Zero-results is a first-class moment (05.8): never a dead end.

## Search alerts (the signature browse feature)

On every results page: "🔔 Alert me for new matches". One click (login if needed), the current query+filters become a saved alert. Managed in the User Dashboard (05.6), delivered by notification/email the moment a matching item is listed (01: follow & alert). This feature converts scarcity from frustration into engagement — it gets first-class UI placement, not a buried link.

---

# 05.4 Product Detail

The most important page on Atlas. It must answer, in order, without scrolling on desktop: **what is it → what state is it in → why is it cheaper → what do I pay → am I protected.**

## Layout (04.4)

Desktop: gallery left (7/12), buy box right (5/12, sticky). Mobile: gallery → buy box → Transparency Card → everything else, with a sticky bottom buy bar (price + CTA).

## Gallery

- Real photos only (03). First photo: clean beauty shot, eager-loaded (LCP).
- **Flaw photos are part of the main gallery**, labeled "Flaw 1 of 3" on the image (04.2) — never a separate hidden tab.
- Zoom on click/pinch; arrow-key navigation (04.5); thumbnails below.

## Buy box (top to bottom)

1. Title (`h1`) + brand.
2. Condition badge + Grade badge, with the grade's one-line meaning ("Grade B — minor cosmetic marks, photographed").
3. Price block (04.1 rules): Atlas price large, original price muted strikethrough, savings in emerald.
4. Stock line: "1 unit" — plus honest interest if real: "6 people follow this item".
5. Primary CTA: "Buy now" → checkout (starts the stock hold). Secondary: "Add to cart" (shortlist semantics) + Follow (bell).
6. Delivery estimate to the buyer's country, shipping cost, seller location.

## Transparency Card

Directly under the buy box CTA block, always (04.2). Full fixed-order card: Condition · Grade · Why discounted · Original price · Atlas price · Warranty · Return policy · Stock. "Why discounted" in the seller's plain words, curated for honesty ("Floor model at our Berlin showroom for 3 months").

## Below the fold

- **Seller card:** name, Verified Business badge, country, member-since, performance score, link to their other listings. One tap from trust to proof (02).
- **Description:** structured specs first (table), free text second. Simple language (02 content rules).
- **Protection recap:** escrow, 14-day return, "not as described" guarantee — three lines with links.
- **Similar items:** 4–8 live listings, same category/similar price. This is also the safety net for the sold state.

## Sold state

Sold listings keep their URL and content (02): gallery dimmed, "Sold" banner where the CTA was, price preserved. Two actions replace Buy: "Alert me for similar items" and "Browse similar" — a sold page is an acquisition page.

## Technical notes

- `schema.org/Product` structured data with price, availability, condition — every listing page is a landing page (02: SEO is a product feature).
- If the item sells while the page is open, the buy box flips to Sold state live (aria-live announcement per 04.5) — the buyer never discovers it at checkout.

---

# 05.5 Checkout

Purpose: zero-surprise payment. Checkout is where trust is cashed in — nothing new is introduced here except payment; no upsells, no cross-sells, no "customers also bought", ever.

## The stock hold

- Starting checkout reserves the item for **10 minutes** (02: checkout start reserves, cart does not).
- Shown as calm text near the order summary: "Reserved for you — 8 minutes remaining." Amber text under 2 minutes, `aria-live` warning (04.5). Never a giant red countdown (that's honest information styled honestly, not urgency theater).
- If the hold expires: nothing entered is lost; the page offers "Reserve again" if still available, or the Sold flow if not.

## Flow — 3 steps, one screen each (02: seller flow rule applies to buyers too)

Guest checkout is allowed (account created implicitly from email; password optional later) — a first purchase must not require a registration ceremony.

**Step 1 — Delivery:** email (guests), address form (autocomplete attributes per 04.5), delivery country drives cost/estimate.

**Step 2 — Payment:** card via a Turkish payment/escrow provider (e.g. iyzico-class PSP — marketplace "pazaryeri" model with split payments and escrow support). **Installments (taksit) are table stakes in Turkish e-commerce** — installment options per card are shown here, in the same calm typography as everything else. Escrow explained exactly where money is entered: "Your payment is held and released to the seller after you confirm delivery." One quiet sentence — the single highest-leverage trust line on the site.

**Step 3 — Review & confirm:** full order summary including the **Transparency Card snapshot** (grade, condition, why-discounted — the buyer confirms what they saw, and this snapshot is stored immutably with the order: it's the contract). Distance-sales pre-information and withdrawal-right texts (Turkish consumer law) are presented here, readable, not buried. Confirm button states the amount: "Pay ₺7.499".

Progress indicator on all steps; back never loses data; the order summary (item, photo, grade, price, shipping, total) is visible on every step (sidebar on desktop, collapsible on mobile).

## Confirmation page

- Plain statement: "Order confirmed. [Seller] has been notified and ships within X days."
- What happens next, in 3 steps: shipped (tracking) → delivered → you confirm, payment released.
- One follow-up action for guests: "Save your details for next time" (optional account completion).
- No confetti. Calm confidence is the brand (03) — the celebration is the product arriving as described.

## Failure handling

Payment failure: inline explanation + retry without re-entering everything; the hold keeps running and its remaining time is shown. Repeated failure: suggest another method, never blame copy ("Something went wrong with this card" not "Your card was declined!").

---

# 05.6 User Dashboard

Purpose: post-purchase trust and repeat-visit fuel. Two jobs: "where is my stuff" and "tell me when my thing appears".

Layout: left nav (desktop) / top tabs (mobile). Sections:

## Orders

- List: photo, title, grade badge, price, status chip, date.
- Order detail — the key screen:
  - **Status timeline:** Confirmed → Shipped (tracking link) → Delivered → Completed. Current step highlighted; each step timestamped.
  - **"Confirm delivery" action** when delivered — this releases escrow (05.5). Auto-confirms after **7 days** (10.5) with clear prior notice (email + dashboard), so sellers aren't hostage to inactive buyers.
  - **Grade check prompt** at confirmation: one question — "Did the item match its grade?" Yes / No. Yes feeds the Grade Accuracy KPI (01); No routes into the return/dispute flow with zero friction. One question, not a survey.
  - **Transparency Card snapshot** as stored at purchase (the contract), plus invoice download.
- Return/dispute entry lives on the order, not in a help maze: "Problem with this order?" → structured flow (reason → photos → resolution options per 01 Buyer Protection).

## Alerts & follows (the retention engine)

- Saved searches: query + filter chips, toggle on/off, delete. Shows match count since last visit.
- Followed items: product cards with live state — price changes and Sold flips visible at a glance.
- Notification channel settings right here (email / push), per alert — not buried in account settings.

## Account

- Profile, addresses, payment methods (tokenized, via provider), password/security.
- Privacy: data export and account deletion are self-service (02: GDPR/KVKK from day one) — burying deletion is a dark pattern.

Empty states throughout follow 05.8: a user with no orders sees "Today on Atlas" cards, not a blank table.

---

# 05.7 Seller Dashboard Entry

Scope note: the full seller experience is its own document (06). This section covers what exists inside the buyer-facing web app: the seller landing, verification entry, and the minimal MVP dashboard.

## Seller landing ("Sell on Atlas")

Reached from footer + homepage band. Structure:
1. The pitch in seller language: **recovery, not reach** (01): "Recover up to X% of retail value on display and open-box stock — instead of Y% through liquidators."
2. How it works, 3 steps: Get verified → List in minutes (photo-first, from a phone) → Get paid (escrow released on delivery).
3. Channel-conflict reassurance (01): separate audience, legitimate context, controlled visibility.
4. Commission stated plainly on this page — sellers shouldn't need a sales call to learn the price (transparency applies to our own pricing too).
5. CTA: "Apply to sell".

## Verification flow

- Business-only gate stated upfront (01: no individual sellers).
- Application: company details, tax ID (vergi no) / MERSİS verification, contact person, product categories, expected volume. One screen per step (02), save-and-resume.
- Regulatory note: as a Turkish marketplace, Atlas operates as an intermediary service provider under e-commerce law (6563/ETBİS) — seller onboarding collects what compliance requires from day one, once, inside this flow.
- Status page: Application received → In review → Approved / Declined (with reason). Manual review in MVP — curation begins at the front door (02: quality is a moat).

## MVP seller dashboard

Four items only — the day-one loop:
- **Listings:** table with status (Draft / Live / Sold / Removed), views, followers per listing. "New listing" launches the mobile-first listing flow (04.2: one step per screen, photos first, grade selection with inline grading guide, mandatory "why discounted" field with good/bad examples).
- **Orders:** to-ship queue with buyer address + "mark shipped + tracking" action. Shipping SLA visible per order.
- **Payouts:** pending escrow vs. released, per order; payout schedule and method.
- **Performance:** the seller score (01: shipping speed, grade accuracy, dispute rate) shown to the seller *exactly as buyers see it* — no information asymmetry about your own reputation.

Everything else (bulk upload, analytics, integrations, subscriptions) is explicitly out of MVP scope and lives in document 06.

---

# 05.8 Error / Empty / Loading States

These states are designed, not defaulted (02). In a 1-unit marketplace, "not available" is a *routine* state, not an exception — it gets the same design care as success.

## Loading

- Skeletons mirror final layout exactly (04.2): card skeletons in grids, row skeletons in dashboards, gallery + buy-box skeleton on product detail. Zero layout shift (CLS budget).
- Skeletons appear only if loading exceeds ~150ms — no flash of skeleton on fast responses.
- Button-level loading per 04.2 (spinner in place, width locked).
- Full-page spinners are forbidden. Something real renders first (header, breadcrumbs) always.

## Empty states — each is one icon + one sentence + one action (04.2)

| Where | Message direction | Action |
|---|---|---|
| Zero search results | "Nothing matches right now — inventory changes daily." | **Create an alert for this search** (the flagship empty state — scarcity becomes engagement) |
| Empty category | Same pattern | Alert + browse sibling categories |
| Empty cart | "Your cart is empty." | "See today's arrivals" |
| No orders yet | "No orders yet." | Today on Atlas cards inline |
| No alerts yet | Explain the feature in one line — many users won't know it exists | "Create your first alert" |
| Seller: no listings | "List your first item — it takes 3 minutes." | "New listing" |

## Sold / unavailable moments (the marketplace-specific states)

- **Product page, already sold:** full Sold state per 05.4 — page survives, offers alert + similar.
- **Sells while viewing:** buy box flips live, `aria-live` announced (05.4). Calm copy: "This one's gone. It happens fast here." + alert CTA — the moment of loss is the moment users understand Atlas; the copy teaches, never gloats and never fakes ("only 1 left!!" theater stays banned).
- **Sells during checkout / hold expired and re-taken:** clear explanation, nothing blamed on the user, entered data preserved, similar items + alert offered (05.5).
- **Cart line sold:** line flips to Sold with "Find similar" (05.1).

## Errors

- **Form/field errors:** per 04.5 — inline, specific, linked via `aria-describedby`, focus to first invalid field. Message says how to fix, not just what's wrong.
- **404:** "This page doesn't exist." + search bar + Today on Atlas. Distinct from sold-product pages — a sold listing is NOT a 404 (SEO + honesty).
- **500 / unexpected:** apology in brand voice, one sentence, retry action, reference ID for support. Never a stack trace, never a blank screen.
- **Offline / network:** detected and stated ("You're offline — reconnecting"), auto-retry, unsent form data preserved.
- **Payment errors:** per 05.5 — retriable, hold-aware, never blame copy.
- **Maintenance:** static branded page, plain time estimate if known.

## Notification of state, globally

- Toasts (04.2) for transient confirmations; `aria-live` for anything that changes under the user (04.5).
- Every async action reaches one of three visible ends: success, failure with recovery, or timeout with retry. Silent failure is a release-blocking bug.

---

## Page inventory (MVP summary)

| # | Page | Section |
|---|---|---|
| 1 | Homepage | 05.2 |
| 2 | Category / browse results | 05.3 |
| 3 | Search results | 05.3 |
| 4 | Product detail (+ sold state) | 05.4 |
| 5 | Cart | 05.1 |
| 6 | Checkout ×3 steps + confirmation | 05.5 |
| 7 | User dashboard: orders, order detail, alerts, account | 05.6 |
| 8 | Seller landing + verification + minimal dashboard | 05.7 |
| 9 | Static trust pages: How Atlas works, Grading explained, Buyer protection | 05.1/05.2 |
| 10 | Auth: login / register / reset (kept minimal, guest checkout exists) | 05.5/05.6 |
| 11 | Error pages: 404, 500, offline, maintenance | 05.8 |

Anything not in this table is not in the web MVP.
