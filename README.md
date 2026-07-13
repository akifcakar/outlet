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
```

## Durum (Faz 0)

Çalışan: katalog (ana sayfa/kategori/arama), ürün detayı (Şeffaflık Kartı,
kusur galerisi), 10 dakikalık stok rezervli checkout, sipariş zaman çizelgesi,
satıcı paneli + 7 adımlı ilan sihirbazı, kargo/teslim onayı + grade check.

Henüz yok / simüle: gerçek ödeme (iyzico pazaryeri entegrasyonu bekliyor —
şu an simülasyon modu), gerçek alıcı/satıcı auth (dev seçici), alarm sistemi,
kürasyon kuyruğu. Ayrıntı: `09_MVP_Scope_Roadmap.md`.
