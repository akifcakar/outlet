# 10_Trust_Operations_Playbook.md

# Trust Operations Playbook

> Version: 1.0 — The human side of the Trust Engine (01). Software promises it; this document is who delivers it, with what criteria, in what time.
> Written to be executed by the founder in Phase 1 and by a small trust/ops team from Phase 2 (09). Every rule here is versioned — changes are dated, and sellers are notified of rule changes in advance.

---

## 10.1 Seller vetting (the front door)

Curation begins at admission (02: quality is a moat). Review checklist for every application (06.2):

**Hard requirements (any failure → decline with reason):**
- Valid vergi no / MERSİS, active company, name match with applicant.
- Real physical business evidence: store/showroom/warehouse (web presence, Google Maps, or photo verification call).
- Category fit with launch categories (09).
- No open fraud/enforcement red flags on basic search.

**Judgment factors (score, don't gate):** brand quality of their inventory, photo quality in their existing channels, expected volume, responsiveness during application.

SLA: decision within **3 business days**. Declines state the reason and whether reapplication is possible. Phase 1: founder decides; Phase 2+: trust ops decides, founder reviews declines weekly (calibration).

## 10.2 Listing curation

**What curation checks (06.3 lifecycle):** photos real and sufficient (flaws photographed for B/C) · condition and grade plausible against photos · "why discounted" is an actual answer · original price plausible/evidenced · title/category/brand correct · no forbidden content (counterfeits — automatic seller termination, 10.4).

SLA: **same business day** for submissions before 16:00. A rejected listing carries a specific fix ("Grade B seçilmiş ama çizik fotoğrafı yok — kusuru fotoğraflayın"), one-tap resubmit (06.3).

**Graduation:** sellers with ≥10 approved listings, 0 grade strikes, grade accuracy ≥95% → instant publish + weekly spot-check of 20% of their new listings (09.4 flag). Any grade strike → back to full review for 30 days.

**Grade audits:** ops re-grades a random sample monthly from delivered-order grade checks + photos. Phase 2+: occasional mystery purchases in high-value categories — the budget for this is a trust investment, not a cost.

## 10.3 Dispute resolution SOP (07.4 branches)

Principles: judged against the **TransparencySnapshot** (the contract) · structured flow only, no negotiation threads · buyer-protection tilt on genuine ambiguity (01: trust is the product), but documented seller protections against abuse.

| Reason | Process | Resolution & who pays shipping |
|---|---|---|
| **Cayma (14-day withdrawal)** | Always accepted per law (11). No justification required. | Full refund on return receipt. Return shipping per published policy (legal minimums apply). |
| **Not as described** | Buyer photos vs. snapshot, seller has 48h to respond. Ops decides in 2 business days. | If misgraded: full refund, **seller pays both ways** + grade strike. If item matches snapshot: treated as cayma (buyer keeps return right, pays return shipping). |
| **Damaged in transit** | Photos + packaging evidence within 48h of delivery. | Refund to buyer regardless (buyer is never hostage to a carrier claim); Atlas/seller recover from carrier insurance per shipping terms. |
| **Not delivered** | Tracking says delivered vs. not: carrier investigation, 5 business days max. | Unresolved → refund buyer, pursue carrier. |

Timelines: buyer can open a dispute until auto-confirm (**7 days after delivery**, 07.4); dispute freezes the clock; target full resolution ≤ 7 days from opening. Every resolution message explains the decision in plain language — dispute outcomes are trust moments, not form letters.

**Buyer abuse guard:** buyers with anomalous dispute rates get flagged; "not as described" claims require photos; serial abusers lose buyer protection tilt and, eventually, the account. Sellers can see dispute outcomes affecting their score and appeal once per dispute to a second ops reviewer.

## 10.4 Penalty matrix (feeds Strike, 07.6)

| Violation | Consequence |
|---|---|
| Misgraded item (confirmed via dispute/audit) | Strike + costs per 10.3 + back to full curation 30 days |
| Shipping SLA miss (no tracking by handling_days + 2) | Warning; 3 warnings in 90 days = strike |
| Seller-fault cancellation (item not actually available) | Strike — inventory truth is core (02) |
| Inflated original price (fake discount) | Strike + listing removed (01: no fake discounts) |
| Attempted off-platform deal | Strike + final warning |
| Counterfeit product | **Immediate termination + legal escalation.** No strikes, no appeals ladder. |

**3 active strikes → suspension** (01). Strikes expire after 12 months. Standing always visible to the seller (06.4). Suspension appeal: one written appeal, reviewed by someone who didn't issue the strikes.

## 10.5 Money operations

- **Commission:** default **12%** of item price (not shipping) at launch, single rate across launch categories — simple beats optimized until data exists (09). Concierge-onboarded Phase 1 sellers: 8% founding-seller rate for 6 months (13 recruiting lever). Stated publicly on the seller landing (05.7); changes announced 30 days ahead.
- **Escrow release:** buyer confirm or auto-confirm at 7 days post-delivery (07.4).
- **Payouts:** weekly batch (every Wednesday), released escrow minus commission; e-arşiv commission invoice attached per order (11). Payout failures (IBAN issues) alert ops same-day.
- **Refunds:** only through the PSP, only via the order state machine (08.3). Nobody refunds "manually". Every money movement reconciles: weekly PSP-statement-vs-orders reconciliation is a standing ops task; any mismatch is a P1 incident.

## 10.6 Shipping & carriers

- MVP: seller ships with their own carrier account (contracted carriers list: Yurtiçi/Aras/MNG/Sürat-class), mandatory tracking number, insurance required above ₺10.000 item value.
- Packaging guidance page for sellers (transit damage is the #1 avoidable dispute); bulky/furniture shipping joins in Phase 2 with negotiated carrier deals (09.4).
- Atlas-negotiated carrier rates as a seller benefit: Phase 2 target — cheaper shipping is both seller value and fewer disputes (better carriers).

## 10.7 Support

- Channels: in-product help + email at launch; phone/WhatsApp business line from Phase 2 (Turkish buyers expect a callable human for high-value orders — this is a trust feature, budget it).
- SLAs: first response ≤ 24h (business days), order-blocking issues ≤ 4h. Support acts through the same ops panel, same audit log (07.6) — support cannot "quickly fix" money or stock outside the state machine.
- Weekly review: top 5 contact reasons → product backlog. Support volume per order is a Phase 2 gate metric (09.4).

## 10.8 Incidents

P1 (money wrong, oversell, data breach, site down): immediate; founder paged; post-incident write-up within 48h. Data breach → KVKK notification duties within legal deadlines (11 — 72h to KVKK board where required). An oversold 1-unit item is P1 and the buyer who loses gets a proactive apology + a meaningful gesture (curated alternative + shipping covered) — how Atlas fails is part of the brand (03).
