# 13_Go_To_Market.md

# Go-To-Market (Türkiye)

> Version: 1.0 — Executes 01's rollout strategy and feeds 09's phase gates. Budget philosophy: **supply-first, founder-led, near-zero paid spend until Phase 2** — great inventory markets itself (01); money spent on buyers before supply exists is money spent on empty shelves.

---

## 13.1 The market thesis, sharpened for Turkey

- Turkish retail sits on exactly our inventory: AVM stores rotating teşhir stock seasonally, white-goods/electronics bayis with açık kutu and iade units, premium furniture showrooms replacing floor sets.
- Today it drains through the channels 01 lists — Instagram DM "fiyat için yazın" sellers, WhatsApp esnaf groups, mağaza köşesindeki "teşhir ürünü" etiketi. All trust-broken, all invisible to search.
- Buyer side: the Turkish deal-hunting reflex is strong and price sensitivity is high, but so is fraud fear on unknown sites — which is why the escrow line (12.3) and Doğrulanmış İşletme are the actual acquisition message, not the discounts.

## 13.2 Seller acquisition (the only thing that matters first)

### Target profile for the first 50 (Phase 1, 09.3)
İstanbul-based · premium/mid-premium brands in launch categories (küçük ev aletleri & elektronik, ev & mutfak) · has a physical store/showroom · already liquidates informally (Instagram outlet post atanlar = proven intent) · owner reachable directly.

### The playbook, in order of efficiency
1. **Warm network first:** every founder/team retail contact, esnaf networks, one warm intro beats ten cold visits.
2. **Instagram outlet hunters:** search "[marka] teşhir", "açık kutu", "outlet" — sellers already posting this ARE the market doing our job badly. Pitch: "Bunu WhatsApp'ta değil, doğrulanmış vitrine koy — komisyon sadece satınca."
3. **Store walking:** AVM & cadde mağazaları with visible teşhir corners. Ask for the owner, not the cashier.
4. **Bayi/distribütör kanalı:** one white-goods distributor's iade/açık kutu depot = dozens of sellers' worth of supply. Phase 1'de bir tane bulmak yeterli.
5. Sektör dernekleri/fuarlar: Phase 2 scale channel, not Phase 1.

### The pitch (from 01/05.7, in seller language)
"Teşhir ve açık kutu ürünlerinden perakende değerin %X'ini geri kazan — spotçuya %Y'ye vermek yerine. Komisyon %12, kurucu satıcılara 6 ay %8 (10.5). Satmazsa bir şey ödemezsin. İlanı biz açarız (concierge, 06.2), 3 dakikada telefondan kendin de açarsın."
Channel-conflict answer ready (01): ayrı kitle, kürasyonlu bağlam, markanı WhatsApp yangın satışından daha iyi korur.

### Founding seller package
%8 komisyon 6 ay · concierge listing (fotoğraf + grade + ilan bizden) · "Kurucu Satıcı" rozeti · doğrudan kurucu hattı. Karşılığında: ≥5 gerçek ilan, dürüst grade, SLA'lara uyum — the package is a trade, and the expectations are stated at signup (10 rules apply from listing one).

## 13.3 Buyer acquisition

### Phase 1 (closed beta): no paid spend.
Waitlist page from day 0 ("Türkiye'nin şeffaf outlet pazaryeri — her indirimin bir sebebi var"), sellers' own audiences (each recruited Instagram-outlet seller brings followers — supply IS distribution here), founder network, 1–2 deal-community seedings (yes, DonanımHaber/ekşi/deal Telegram groups — arrive with genuinely good inventory or don't arrive).

### Phase 2 (public): layered, measured, still calm.
1. **SEO as the primary engine (12.5):** condition-term explainers + long-lived product/sold pages compound; this channel matches the brand (search intent = honest demand, no urgency theater needed).
2. **The unboxing proof loop:** the brand moment is "tam söyledikleri gibi çıktı" (03). Micro-influencer seeding: gift Grade B items, ask for honest kutu açılımı including the flaw — the flaw being shown and matching the listing IS the ad. No scripted hype; contracts require disclosure (Reklam Kurulu, 11.6).
3. **Google Shopping/Performance Max on high-intent queries** ("[model] teşhir", "[model] açık kutu"): bounded budget, ROAS-gated weekly.
4. **Alert-first CRM (05.6/12.4):** the retention engine is also the acquisition closer — landing traffic that doesn't buy gets one ask: "alarm kur". An alert set is a future sale; measure alert-to-purchase as a core funnel.
5. PR angle for launch week: sustainability + enflasyon-era smart buying ("israfı azaltan pazaryeri") — earned media fits the mission (01) and costs nothing but effort.

**Never, in any phase (03/12.3):** fake-scarcity ads, "son 3 saat" campaigns, influencer hype without disclosure, discount-shouting creatives. GTM obeys the brand constitution — acquisition that poisons trust is negative CAC.

## 13.4 Launch sequencing (ties to 09)

1. **T-8w:** waitlist live + seller outreach starts (target: 50 committed before code freeze).
2. **T-4w:** concierge listing sprints — beta opens with ≥300 live, curated listings across both categories (empty-shelf rule, 01).
3. **T-0 (closed beta):** waitlist admitted in batches (feedback per batch), sellers' audiences invited.
4. **Phase 1 → 2 gate passes (09.3):** public open + PR week + channels 1–3 on.
5. **Post-launch weekly rhythm:** supply review (new sellers, stale listings, 06.4) → funnel review (13.6) → top-5 support reasons (10.7) → one improvement shipped. The GTM meeting and the product meeting are the same meeting at this stage.

## 13.5 Positioning & message house (from 01/03, Turkish)

**Roof:** "Her indirimin bir sebebi var." (The one-line brand: transparency as the category-defining claim.)
**Pillars:** 1) Doğrulanmış işletmeler — "kimden aldığını bil" · 2) Grade sistemi — "ne aldığını bil" · 3) Güvenli ödeme — "paran teslimata kadar güvende".
Every campaign, landing page, and PR pitch hangs off one of these three. A message that fits none of them doesn't run.

## 13.6 Measurement (the event taxonomy — feeds 09's gates and 01's north stars)

Server-side events (08.1), one naming scheme `object.action`:

**Funnel:** `listing.viewed → listing.followed / alert.created → checkout.started (hold) → order.paid → order.delivered → order.completed + grade_check.answered`
**Supply:** `seller.applied/approved/activated`, `listing.submitted/approved/live/sold_out`, time-to-list, time-to-first-sale per seller.
**KPI definitions (frozen, 09.6):** Sell-through = listings sold ≤30 days of going live ÷ listings live ≥30 days · Recovery rate = Σprice ÷ Σoriginal_price on completed orders · Grade accuracy = grade_check yes ÷ answered · Alert-to-purchase = orders attributable to alert notifications ÷ alerts fired.
**Weekly dashboard (one page):** the three north stars + funnel conversion + supply pipeline + support-per-order. If a number isn't on this page, it doesn't drive decisions.

Attribution kept honest and simple: UTM + first/last touch in our own events (no ad-tech stack, 08.1); KVKK-clean (11.4).

---

*This is the last document of the founding set (01–13). The set is circular by design: GTM promises only what 05/06 deliver, 10 enforces what 01 claims, and 12 says it all in the language buyers actually read.*
