# Atlas (çalışma adı) — Premium Outlet Pazaryeri

> Her indirimin bir sebebi var.

Teşhir, açık kutu ve fazla stok ürünlerin küratörlü pazaryeri. Yalnızca
doğrulanmış işletmeler satar; her ürün durum + Grade (A/B/C) bilgisiyle ve
"neden indirimli" açıklamasıyla listelenir. Lansman pazarı: Türkiye.

## Depo yapısı

| Yol | İçerik |
|---|---|
| `01_Vision.md` … `13_Go_To_Market.md` | Kuruluş doküman seti: vizyon, ürün anayasası, marka, tasarım sistemi, web/satıcı deneyimi, veri modeli, mimari, yol haritası, operasyon, hukuk, içerik, GTM |
| `atlas/` | Uygulama — Next.js 16 + TypeScript strict + Tailwind v4 + Prisma 7 (dev: SQLite, prod hedefi: PostgreSQL) |

## Çalıştırma

```bash
cd atlas
npm install
copy .env.example .env   # (macOS/Linux: cp)
npx prisma migrate dev   # şemayı kurar
npm run db:seed          # örnek Türkçe envanter + placeholder görseller
npm run dev
```

## Testler

```bash
npx tsx scripts/test-checkout.ts     # stok rezervi + çift satın alma yarışı + snapshot
npx tsx scripts/test-fulfillment.ts  # paid → shipped → completed zinciri + sahiplik korumaları
<<<<<<< HEAD
=======
npx tsx scripts/test-curation.ts     # submitted → live | rejected → resubmit + askıya alma
npx tsx scripts/test-alerts.ts       # alarm eşleştirici: listing.live → bildirim, dedup, filtreler
npx tsx scripts/test-disputes.ts     # itiraz zinciri: dispute_open → iade/aktarım + strike + oto-askı
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
```

## Durum (Faz 0)

Çalışan: katalog (ana sayfa/kategori/arama), ürün detayı (Şeffaflık Kartı,
kusur galerisi), 10 dakikalık stok rezervli checkout, sipariş zaman çizelgesi,
<<<<<<< HEAD
satıcı paneli + 7 adımlı ilan sihirbazı, kargo/teslim onayı + grade check.

Henüz yok / simüle: gerçek ödeme (iyzico pazaryeri entegrasyonu bekliyor —
şu an simülasyon modu), gerçek alıcı/satıcı auth (dev seçici), alarm sistemi,
kürasyon kuyruğu. Ayrıntı: `09_MVP_Scope_Roadmap.md`.
=======
satıcı paneli + 7 adımlı ilan sihirbazı, kargo/teslim onayı + grade check,
ops paneli (`/ops`): kürasyon kuyruğu (submitted → live | rejected + spesifik
düzeltme notu + yeniden gönderim), satıcı onay/askıya alma, sipariş görünümü,
denetim kaydı (AuditLog), kullanıcı paneli (`/hesap`): siparişler, alarmlar
(kayıtlı arama → yayına giren ilanla anında eşleşme + bildirim + header
rozeti), KVKK self-servis (veri indir/sil), itiraz akışı (10.3): grade check
"Hayır" → yapılandırılmış itiraz (sebep + fotoğraf kanıt) → satıcı 48s yanıtı
→ ops kararı (sözleşme vs kanıt yan yana) → iade/aktarım + yanlış grade'de
strike, 3 strike'ta otomatik askı.

Henüz yok / simüle: gerçek ödeme (iyzico pazaryeri entegrasyonu bekliyor —
şu an simülasyon modu), gerçek alıcı/satıcı/ops auth (dev seçici), e-posta
bildirimi (şimdilik yalnız uygulama içi), oto-onay job'ı (7 gün).
Ayrıntı: `09_MVP_Scope_Roadmap.md`.
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
