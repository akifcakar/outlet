# 11_Legal_Compliance_TR.md

# Legal & Compliance (Türkiye)

> Version: 1.0 — A requirements checklist for counsel, NOT legal advice. Every item here must be validated by a Turkish e-commerce/tech lawyer before public launch (09: compliance is scope). Items marked ⚖️ need drafted documents; items marked 🏛️ are registrations/filings.
> Standing principle: transparency applies to our own legal texts too (05.5) — readable Turkish, not buried walls of text.

---

## 11.1 Platform status & registrations

- **Aracı hizmet sağlayıcı (intermediary service provider)** under **6563 sayılı Elektronik Ticaret Kanunu**: Atlas hosts sellers, doesn't sell (except possible concierge nuance — ask counsel whether ops-managed listings, 06.2, change anything). Obligations: seller identity verification & recordkeeping, unlawful-content takedown process, transaction records.
- 🏛️ **ETBİS registration** before going live.
- ⚖️ Check current **e-ticaret aracı hizmet sağlayıcı thresholds** (2022 amendments introduced volume-based obligation tiers — license fees, ad caps, data portability). MVP volumes are far below the heavy tiers, but counsel confirms which baseline obligations apply from day one.
- 🏛️ Company formation, tax registration, trademark filing for the final name (03: naming note — clear trademark path is a naming criterion).

## 11.2 Payments & escrow (the licensing question)

**The rule that shapes the architecture (08):** Atlas must NOT hold customer funds itself — that's payment/e-money institution territory (6493 sayılı Kanun, TCMB licensing).

- The escrow model runs entirely inside a licensed PSP's **pazaryeri (marketplace) product** (iyzico-class): buyer pays PSP → PSP holds → PSP splits commission/seller share on release trigger from our state machine (07.4). ⚖️ PSP contract review: confirm their license covers held-funds marketplace flows and our release/refund triggers.
- Sellers onboard as **alt üye işyeri (sub-merchants)** with the PSP — their KYC requirements fold into our seller activation (06.2).
- Taksit display rules and any BDDK installment restrictions per category (electronics installment caps exist and change) — surface per-card installment tables from the PSP, don't hand-maintain (05.5).

## 11.3 Consumer law (6502 sayılı TKHK + Mesafeli Sözleşmeler Yönetmeliği)

- ⚖️ **Ön bilgilendirme formu** (pre-contractual information) shown before payment confirm — integrated in checkout step 3 (05.5), covering seller identity, product qualities, total price, delivery, withdrawal right.
- ⚖️ **Mesafeli satış sözleşmesi** per order, stored with the order (pairs with our TransparencySnapshot, 07.4 — legal contract + product-truth contract together).
- **Cayma hakkı (14-day withdrawal):** unconditional, from delivery (01/10.3 already aligned). Confirm with counsel the exceptions list relevant to us and how "outlet/açık kutu" status interacts — **condition disclosure does not waive cayma.** Cayma flow must be as easy as buying (also an EU-parallel requirement; 05.6's structured flow qualifies — counsel validates).
- **Ayıplı mal (defective goods):** here our model is legally interesting — disclosed defects (Grade B/C, flaw photos, Transparency Card) are NOT "ayıp" if properly disclosed **before** sale. ⚖️ Counsel drafts the disclosure language ensuring the Transparency Card + flaw photos constitute legally robust disclosure. This makes the Trust Engine (01) our legal shield too.
- **Warranty:** new goods carry statutory guarantee obligations (garanti belgesi rules per category); ⚖️ counsel maps our 10 conditions × categories to warranty duties — especially Refurbished (below) and Display/Open Box sold "as new-ish". The Transparency Card's warranty row (01) must state the legally correct term per listing.
- **Yenilenmiş ürün (refurbished) regulation:** Turkey regulates refurbished phones/tablets specifically (authorized refurbishment centers, certification). ⚖️ Either exclude refurbished phones/tablets at MVP (simplest — recommend this in 09 scope) or onboard only certified refurbishment centers for those categories.

## 11.4 KVKK (personal data)

- 🏛️ **VERBİS registration** if/when thresholds met — counsel tracks.
- ⚖️ **Aydınlatma metni** (privacy notice), **açık rıza** collection where needed (marketing consent separate from service consent — 07.1 already models both), **çerez politikası** + cookie consent implementation (no ad-tech soup, 08.1, keeps this light).
- Data inventory & retention schedule: personal data mapped in 07.8; financial/order records retained per tax law (10 years), personal fields anonymized on erasure requests (08.4 job). Self-service export/delete (05.6) satisfies data-subject rights.
- **Cross-border transfer:** EU hosting (08.1) means KVKK cross-border rules apply (explicit consent or Board-approved mechanisms — the rules were revised in 2024 toward standard contractual clauses). ⚖️ Counsel picks the mechanism; engineering keeps the data-location register current (08.4).
- Breach notification duties (10.8): KVKK Board notification within 72 hours where required + affected users.

## 11.5 Tax & invoicing

- **Commission invoices:** Atlas issues **e-arşiv/e-fatura** to sellers for commission per order/batch (10.5, 06.4 payouts screen).
- **Product invoices:** the SELLER invoices the buyer (we're intermediary) — the platform must make invoice delivery easy/enforced (order flow includes seller invoice upload or integration; add to 06.4 orders queue as a required step — ⚖️ counsel confirms enforcement obligation level).
- Withholding: check current **aracı hizmet sağlayıcı stopaj/withholding** rules on marketplace payouts (rules in this area have been changing; counsel + mali müşavir own this).
- BA/BS, KDV treatment of commission, and whether any category carries special consumption tax complications — mali müşavir scope.

## 11.6 Content & competition

- **Fake discount protection is law, not just principle:** Ticaret Bakanlığı price-advertising regulations require the crossed-out price to be a real prior price. Our verifiable-original-price rule (01/10.2/10.4) is thus a compliance requirement — keep evidence (07.2 `original_price_evidence`).
- Reklam Kurulu advertising rules apply to "indirim" claims sitewide (05.2 collections included). "Sponsored" labeling (05.2) also aligns with 6563 transparency duties.
- Counterfeit process (10.4): ⚖️ notice-and-takedown procedure documented; brand-owner complaint channel.

## 11.7 The document set (what counsel actually drafts)

| # | Document | Where it surfaces |
|---|---|---|
| 1 | Üyelik sözleşmesi + Kullanım koşulları (buyer ToS) | Registration, footer |
| 2 | Satıcı sözleşmesi (seller agreement: commission, strikes/penalties per 10.4, payout terms) | Seller activation (06.2) |
| 3 | Mesafeli satış sözleşmesi (template, per order) | Checkout step 3 |
| 4 | Ön bilgilendirme formu (template, per order) | Checkout step 3 |
| 5 | KVKK aydınlatma metni + açık rıza metinleri | Registration, checkout, footer |
| 6 | Çerez politikası | Footer + consent UI |
| 7 | İade & cayma politikası (plain-language version of legal rights — trust page AND legal doc) | Footer, product page protection recap (05.4) |
| 8 | Teslimat & kargo şartları | Footer, checkout |
| 9 | Takedown/counterfeit procedure | Footer (for rights holders) |

The seller agreement must mirror the penalty matrix (10.4) **exactly** — no penalty may be enforced that isn't contractual.

## 11.8 Open questions for counsel (tracked, answered before Phase 1 → 2 gate)

1. Concierge listing (06.2): does ops acting on seller's behalf affect intermediary status?
2. Refurbished phones/tablets: exclude vs. certified-centers-only? (Recommend exclude at MVP.)
3. Auto-confirm at 7 days (07.4): any consumer-law friction with escrow release timing?
4. Guest checkout account model (07.1) vs. üyelik sözleşmesi acceptance mechanics.
5. Seller invoice enforcement: platform obligation level for product invoices (11.5).
6. Cross-border transfer mechanism choice (11.4).
7. Current aracı hizmet sağlayıcı tier obligations at our projected Phase 2 volume (11.1).
