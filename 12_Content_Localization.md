# 12_Content_Localization.md

# Content & Localization

> Version: 1.0 — The specs are English; the product speaks Turkish. This document is the bridge: terminology decisions, the Turkish voice, and the microcopy library for every trust-critical moment (03's tone rules, applied in Turkish).
> Rule: UI strings live in one localization layer from day one (TR-only at launch, but keyed — 08.7 multi-locale trigger). No hardcoded strings in components.

---

## 12.1 Language & voice decisions

- **UI language:** Turkish only at launch. English joins with the first expansion market (09).
- **Hitap: "sen".** Modern, warm, direct — consistent with the calm-confident personality (03) and with how premium digital brands address Turkish users. "Siz" appears only in legal documents (11.7). Once chosen, never mixed: a page that says "sepetin" cannot say "siparişiniz".
- Voice rules from 03, Turkish edition: short sentences · no exclamation marks in selling copy · numbers convince, tone stays calm · flaws stated plainly and first.

## 12.2 Terminology (the locked vocabulary)

One vocabulary everywhere (02/03): UI, filters, e-mails, invoices, support macros — these exact strings.

### The Grade decision
**"Grade" stays English: Grade A / Grade B / Grade C.**
Rationale: it's the brand asset we want people to repeat (01: "Atlas Grade B" as a term; 03: first-class badge). It's short, letter-based, already natural in Turkish tech/watch/collectible communities ("A kalite" carries counterfeit connotations in Turkish — avoided deliberately). Every first appearance per page carries the Turkish explainer (04.2).

- Grade A — "Kusursuz. Yeniden ayırt edilemez."
- Grade B — "Yakından bakınca fark edilen küçük kozmetik izler. Tümü fotoğraflı."
- Grade C — "Belirgin kozmetik iz veya onarılmış hasar. Tamamen çalışır. Tümü fotoğraflı."

### Condition terms (01's ten, locked Turkish)

| Key (07.2) | Turkish UI term |
|---|---|
| factory_new | Sıfır Ürün |
| open_box | Açık Kutu |
| display_item | Teşhir Ürünü |
| excess_inventory | Fazla Stok |
| returned_product | İade Ürün |
| demo_unit | Demo Ürün |
| trade_show_item | Fuar Ürünü |
| refurbished | Yenilenmiş |
| cosmetic_damage | Kozmetik Kusurlu |
| packaging_damage | Ambalajı Hasarlı |

### Core platform terms
Transparency Card → **"Şeffaflık Kartı"** (translated — unlike Grade, this must be instantly meaningful) · Verified Business → **"Doğrulanmış İşletme"** · alert → **"alarm"** ("fiyat alarmı" is established Turkish e-commerce language) · follow → **"takip et"** · escrow line term → "güvenli ödeme" as the label, mechanics always spelled out (12.3) — "escrow" never appears in UI.

## 12.3 The trust-critical microcopy library

The exact Turkish for the moments that carry the brand (each maps to its spec):

| Moment (spec) | Turkish copy |
|---|---|
| Escrow line at payment (05.5) | "Ödemen, ürünü teslim alıp onaylayana kadar güvende tutulur. Satıcıya ancak sen onayladıktan sonra aktarılır." |
| Stock hold (05.5) | "Bu ürün senin için ayrıldı — 8 dakika." / expiry: "Süre doldu. Ürün hâlâ müsaitse yeniden ayırabilirsin." |
| Sold moment, live (05.8) | "Bu ürün az önce satıldı. Burada işler hızlı oluyor. Benzeri gelince haber verelim mi?" |
| Sold page (05.4) | "Satıldı. Benzer ürünler için alarm kur — yenisi gelince ilk sen öğren." |
| Grade check prompt (05.6) | "Ürün, ilandaki Grade'ine uygun çıktı mı?" — Evet / Hayır |
| Why-discounted good example (06.3) | ✓ "3 ay mağazamızda teşhirde kaldı." ✗ "Fırsat ürünü!" |
| Empty search (05.8) | "Şu an eşleşen ürün yok — stok her gün değişiyor. Bu arama için alarm kur, gelince haber verelim." |
| Delivery confirm CTA (05.6) | "Teslim aldım, her şey yolunda" |
| Flaw honesty pattern (03) | "[Süre/olay] + [kusurun yeri ve niteliği] + fotoğraf referansı": "Sol yan panelde ince bir çizik var — 4. fotoğrafta." |
| Trust strip (05.2) | "Yalnızca doğrulanmış işletmeler" · "Her ürün Grade'li: A, B, C" · "Ödemen teslimata kadar güvende" |
| Savings (04.1) | "–%42" / "₺5.500 kazandın" — asla "ŞOK İNDİRİM" |

Banned list (03's lexicon, Turkish): "kaçırma", "son şans", "acele et", "şok fiyat", "inanılmaz fırsat", "stoklarla sınırlıdır" (as pressure), any "!!!". The only urgency permitted is a true number.

## 12.4 Transactional messages (the email/push set)

Every state transition (07.4/06.5) has a message; all follow: **subject = the fact, first line = what it means, one CTA.** No marketing inside transactional messages, ever.

Buyer set: sipariş onayı · kargoya verildi (takip linki) · teslim edildi → onay hatırlatması ("7 gün içinde onaylamazsan otomatik onaylanır" — plain, 07.4) · alarm eşleşmesi ("Alarmına uyan ürün geldi: [ürün], Grade B, ₺7.499") · takip ettiğin ürün satıldı/fiyatı düştü · iade/itiraz durum güncellemeleri.
Seller set (06.5): satış! (anlık) · kargo SLA hatırlatması · ödeme yapıldı (dekont + komisyon faturası) · ilan onaylandı/düzeltme gerekli (nedeniyle) · haftalık özet (recovery rate diliyle: "Bu hafta perakende değerin %61'ini geri kazandın").

## 12.5 SEO content (02: SEO is a product feature)

- URL structure: `/kategori/alt-kategori`, `/urun/[marka]-[model]-[grade]-[id]`, Turkish slugs, ASCII-transliterated (ç→c, ş→s...), stable forever (sold pages live on, 05.4).
- Title pattern: "[Marka] [Model] — [Condition Türkçe], Grade [X] | [Site]". Meta description pattern includes the why-discounted essence and savings.
- The static trust pages (05.1) are also the SEO content backbone: "Teşhir ürünü nedir?", "Açık kutu ürün alınır mı?", "Grade sistemi nasıl çalışır?" — each condition term gets an explainer page targeting exactly the questions Turkish buyers already Google. This is the honest version of content marketing: our glossary IS our funnel (13).
- Structured data per 05.4; `hreflang` infrastructure deferred to expansion (08.7).

## 12.6 Process

- Strings reviewed against this document before merge — terminology drift is a bug (02: one consistent vocabulary). New trust-critical moments get their copy written here first, then implemented.
- Legal texts (11.7) get plain-language Turkish summaries at their point of use (05.5 checkout) — counsel approves that the summary doesn't distort the legal text.
