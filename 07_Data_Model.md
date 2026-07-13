# 07_Data_Model.md

# Data Model & Domain

> Version: 1.0 — The domain truth behind 05/06. Implementation-agnostic (works for any relational DB; 08 picks the actual stack).
> Two state machines are the heart of this document: the **Order/Escrow chain** and the **Stock Hold**. If these are right, Atlas works; if they're wrong, no UI can save it.

## Conventions

- IDs: opaque, non-sequential public IDs (e.g. ULID) — listing counts and order volumes are business secrets.
- **Money: integer kuruş, never floats.** Currency stored per amount (`TRY` at launch; 04: multi-currency is config, not refactor).
- Timestamps: UTC, `created_at`/`updated_at` on everything.
- Soft-delete only for anything a buyer or regulator may need later (listings, orders, snapshots). Hard-delete only per KVKK erasure flows (11).
- Every state transition writes to `AuditLog` (02: audit logging for money, stock, account changes).

---

## 07.1 Actors

### User
One identity, roles attached. `id, email (unique), phone?, password_hash?, name, locale, marketing_consent, kvkk_consent_at, created_at, status (active|suspended|deleted)`.
Guest checkout (05.5) creates a User from email with `password_hash = null` — "claimable" account.

### Seller (Business)
`id, legal_name, display_name, vergi_no, mersis_no?, address, contact_user_id → User, status (applied|in_review|approved|declined|suspended), iban, billing_info, return_address, shipping_defaults (carrier, handling_days), commission_rate_bps, verified_at`.
- `commission_rate_bps` per seller (category default from config, overridable per deal — 10).
- A User may belong to one Seller in MVP (multi-user sellers post-MVP, 06.6).

### SellerScore
Computed, stored for display speed: `seller_id, shipping_speed_score, grade_accuracy_score, dispute_rate, overall, strike_count, computed_at`. Recomputed by job on relevant events (10 defines formulas).

---

## 07.2 Catalog

### Category
`id, parent_id?, slug, name, spec_schema (JSON: the 3–6 per-category spec fields, 06.3), suggested_discount_band` — two levels max (05.1).

### Brand
`id, slug, name, verified (bool)` — free-text brand entry goes to a review queue; the brand table stays curated.

### Listing
The central entity.

| Field | Notes |
|---|---|
| `id, seller_id, category_id, brand_id` | |
| `title, description, specs (JSON per category schema)` | |
| `condition` | enum: the 10 values from 01, exact vocabulary, stored as stable keys (`display_item`, `open_box`…) |
| `grade` | enum: `A | B | C` |
| `why_discounted` | text, mandatory |
| `original_price_kurus, price_kurus, currency` | savings always computed, never stored |
| `original_price_evidence` | URL or reference (10: verifiable original price) |
| `stock` | int, default 1. `stock ≥ 0` DB constraint |
| `handling_days, shipping_cost_kurus, carrier` | |
| `status` | see lifecycle below |
| `published_at, sold_out_at` | |

**Listing lifecycle:** `draft → submitted → live → sold_out → removed` (+ `rejected` from submitted, with reason; + `paused` from live).
- `sold_out` pages stay public (05.4). `removed` pages 410.
- Edits to `condition`, `grade`, or flaw photos on a live listing revert it to `submitted` (06.4); price/stock edits don't.

### ListingPhoto
`id, listing_id, position, url, width, height, is_flaw (bool), flaw_label?` — flaw photos are first-class (04.2 "Flaw 1 of 3"). Min 3 photos to submit; ≥1 flaw photo required if grade ∈ {B, C} (enforced at submit, not in DB).

---

## 07.3 The Stock Hold (state machine #1)

The 1-unit world's core mechanism (02, 05.5). Semantics:

- A `StockHold` is created when a buyer **starts checkout**: `id, listing_id, user_id, qty, expires_at (now + 10 min), status (active|converted|expired|released)`.
- **Invariant: for any listing, `stock_available = stock − SUM(active holds' qty) ≥ 0`.** Enforced atomically (single SQL statement or row lock — 08). This is the oversell guard; it must live in one place only.
- Cart does NOT create holds (05.1). Buy-now and checkout-start do.
- Expiry: a hold past `expires_at` is dead even if the sweeper job hasn't run — **every availability read checks `expires_at`**, the job is just cleanup.
- Payment success converts the hold → decrements `stock` → if `stock = 0`, listing → `sold_out` (same transaction).
- One active hold per user per listing; re-entering checkout refreshes it.

Events emitted: `hold.created / expired / converted` → live UI flips (05.4 "sells while viewing"), cart-line sold states (05.1).

---

## 07.4 Order & Escrow (state machine #2)

### Order
`id, buyer_id, seller_id, listing_id, qty, item_price_kurus, shipping_kurus, total_kurus, currency, commission_kurus, payment_provider_ref, delivery_address (JSON snapshot), status, timestamps per transition`.
One listing per order in MVP (multi-item cart checkout still creates one order per seller-listing; simplifies escrow, disputes, shipping).

### TransparencySnapshot
**The contract** (05.5): immutable copy at purchase — `order_id, condition, grade, why_discounted, original_price_kurus, price_kurus, warranty_text, return_policy_text, photo_urls (incl. flaw photos), created_at`. Never updated, never deleted while the order exists. Disputes are judged against this row (10).

### Order status chain

```
pending_payment → paid → shipped → delivered → completed
        ↓            ↓        ↓          ↓
     cancelled   cancelled    └── dispute_open ──→ resolved_refund | resolved_release | resolved_partial
                (pre-ship)
```

| State | Meaning / rules |
|---|---|
| `pending_payment` | Hold active, PSP session open. Payment failure keeps this state while hold lives (05.5). |
| `paid` | Money captured **into escrow** (PSP-held, 08/11 — Atlas never holds funds itself). Seller notified, SLA clock starts. |
| `shipped` | Seller entered tracking. Tracking ref stored. |
| `delivered` | Carrier webhook or buyer action. Starts the confirm window. |
| `completed` | Buyer confirmed OR auto-confirm after **7 days** from delivered (10; the "N days" of 05.6). Triggers escrow release → `Payout`. Grade-check answer (yes/no) recorded here → feeds `SellerScore.grade_accuracy`. |
| `dispute_open` | From delivered (or shipped, for lost packages). Freezes auto-confirm. Branches per 10's SOP. |
| `cancelled` | Buyer cancel before ship, or seller-fault cancel (counts against score). Full refund via PSP. |

**Invariants:** transitions only forward along edges above; every transition = one `AuditLog` row + one notification; money moves only on `paid` (capture), `completed` (release), `cancelled`/`resolved_refund` (refund) — nowhere else.

### Payout
`id, seller_id, order_id, amount_kurus (total − commission), status (pending|released|paid|failed), released_at, provider_ref`. Weekly batch per 10; commission invoice reference attached (11).

### Return / Dispute
`id, order_id, opened_by, reason (enum: not_as_described | damaged_in_transit | not_delivered | withdrawal_14day | other), buyer_statement, photos[], seller_response?, resolution (refund|release|partial), resolved_by (ops user), resolved_at`.
`withdrawal_14day` is the legal cayma path (11) — always accepted per law, different shipping-cost rules than `not_as_described` (10).

---

## 07.5 Engagement

### CartItem
`user_id, listing_id, added_at` — a shortlist row, no price/stock copy (always live-joined; the cart shows truth, 05.1).

### Follow
`user_id, listing_id` — powers "X people following" (real numbers only) and price/sold notifications.

### SavedSearch (Alert)
`id, user_id, query_text?, filters (JSON: category, condition[], grade[], price range, brand), channels (email|push), active, last_matched_at`.
Matching job: on every `listing.live` event, evaluate against active alerts → `Notification`. This event → alert path is the retention engine (05.6) and must be near-real-time ("the moment it's listed", 01).

### Notification
`id, user_id, type, payload (JSON), channels, sent_at, read_at` — one table for buyer and seller notifications (06.5 types included).

---

## 07.6 Trust & ops

### GradeCheck
`order_id, matched (bool), comment?, created_at` — the one-question prompt (05.6). Aggregates into `SellerScore.grade_accuracy` and the platform Grade Accuracy KPI (01).

### Strike
`id, seller_id, reason (enum per 10's penalty matrix), order_id?/listing_id?, issued_by, created_at, expires_at?` — three active strikes → suspension (01).

### AuditLog
`id, actor (user/seller/ops/system), action, entity_type, entity_id, before (JSON), after (JSON), created_at` — append-only. Money, stock, status, and account changes are non-negotiable writers (02).

### OpsUser
Internal roles: `curation, support, trust, admin` — curation review (06.3), dispute resolution (10), and concierge listing (06.2) act as OpsUser, always distinguishable from the seller in `AuditLog`.

---

## 07.7 Derived numbers (never stored as truth)

- Savings % = computed from the two prices, everywhere (one formatter, 04).
- `stock_available` = stock − active holds (07.3), computed atomically.
- Seller score components = recomputed from GradeChecks, shipping timestamps, disputes.
- KPI rollups (sell-through, recovery rate, grade accuracy — 01) = analytics jobs over orders/listings (12/13 define events).

## 07.8 KVKK notes on this model (details in 11)

- Personal data lives in `User`, `Order.delivery_address`, dispute texts. Erasure = anonymize User + address snapshots while preserving order/financial records for their legal retention periods.
- `TransparencySnapshot` contains no personal data by design — it survives erasure untouched.
