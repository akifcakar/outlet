// Dev seed — realistic Turkish outlet inventory per 01/12.
// Also generates local SVG placeholder photos into public/products/
// (real photography is the product, 03 — placeholders are dev-only).

import fs from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(__dirname, "..", "dev.db")}`,
});
const db = new PrismaClient({ adapter });

const PRODUCTS_DIR = path.join(__dirname, "..", "public", "products");

function svg(text: string, sub: string, tone: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="${tone}"/>
<rect x="200" y="140" width="400" height="280" rx="16" fill="#d4d4d4"/>
<text x="400" y="480" text-anchor="middle" font-family="system-ui" font-size="30" fill="#525252">${text}</text>
<text x="400" y="520" text-anchor="middle" font-family="system-ui" font-size="20" fill="#a3a3a3">${sub}</text>
</svg>`;
}

function writePhoto(file: string, title: string, sub: string, tone = "#f5f5f5"): string {
<<<<<<< HEAD
=======
  // A real (generated) hero image wins over the SVG placeholder when present —
  // keeps re-seeds from downgrading listings back to placeholders.
  const real = file.replace(/\.svg$/, ".png");
  if (fs.existsSync(path.join(PRODUCTS_DIR, real))) return `/products/${real}`;
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
  fs.writeFileSync(path.join(PRODUCTS_DIR, file), svg(title, sub, tone), "utf8");
  return `/products/${file}`;
}

type SeedListing = {
  slug: string;
  title: string;
  brand: string;
  category: string;
  condition: string;
  grade: "A" | "B" | "C";
  why: string;
  original: number; // ₺ (converted to kuruş below)
  price: number;
  warranty: string;
  description: string;
  seller: number;
  flaws?: string[];
  sold?: boolean;
<<<<<<< HEAD
=======
  submitted?: boolean; // sits in the curation queue (10.2) instead of live
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
};

const listings: SeedListing[] = [
  { slug: "dyson-v15-detect", title: "Dyson V15 Detect Absolute", brand: "Dyson", category: "kucuk-ev-aletleri", condition: "display_item", grade: "B", why: "3 ay mağazamızda teşhirde kaldı.", original: 34999, price: 22999, warranty: "12 ay ithalatçı garantisi", description: "Lazer toz algılamalı kablosuz süpürge. Tüm başlıkları ve şarj istasyonu kutusunda, eksiksiz.", seller: 0, flaws: ["Gövdede ince bir çizik — 4. fotoğrafta"] },
  { slug: "smeg-ecf01-espresso", title: "Smeg ECF01 Espresso Makinesi", brand: "Smeg", category: "ev-mutfak", condition: "open_box", grade: "A", why: "Müşteri siparişi iptal edildi, kutusu açıldı ama hiç kullanılmadı.", original: 18499, price: 13999, warranty: "24 ay distribütör garantisi", description: "50'ler tarzı retro espresso makinesi, krem rengi. Fabrika filmleri üzerinde.", seller: 1 },
  { slug: "philips-airfryer-xxl", title: "Philips Airfryer XXL HD9870", brand: "Philips", category: "kucuk-ev-aletleri", condition: "returned_product", grade: "B", why: "14 gün içinde iade edildi, tek kullanımlık deneme yapılmış.", original: 12999, price: 8499, warranty: "24 ay Philips Türkiye garantisi", description: "7.3 L kapasiteli, çift katlı pişirme. Tüm aksesuarları tam.", seller: 0, flaws: ["Hazne iç yüzeyinde hafif kullanım izi — 5. fotoğrafta"] },
  { slug: "kitchenaid-artisan-mikser", title: "KitchenAid Artisan 4.8L Stand Mikser", brand: "KitchenAid", category: "ev-mutfak", condition: "display_item", grade: "B", why: "Showroom vitrininde 2 ay sergilendi.", original: 24999, price: 17499, warranty: "24 ay distribütör garantisi", description: "İmparatorluk kırmızısı, döküm gövde. Çırpıcı, yoğurucu ve karıştırıcı aparatları kutusunda.", seller: 1, flaws: ["Kaide kenarında minik parlama izi — 4. fotoğrafta"] },
  { slug: "sonos-era-300", title: "Sonos Era 300 Akıllı Hoparlör", brand: "Sonos", category: "elektronik", condition: "demo_unit", grade: "B", why: "Mağaza demo ünitesiydi, dinleme köşesinde kullanıldı.", original: 21999, price: 14999, warranty: "12 ay satıcı garantisi", description: "Dolby Atmos destekli, uzamsal ses. Kablosu ve kutusuyla.", seller: 2, flaws: ["Alt kauçuk tabanda iz — 4. fotoğrafta"] },
  { slug: "bosch-mum5-mutfak-robotu", title: "Bosch MUM5 Mutfak Robotu", brand: "Bosch", category: "kucuk-ev-aletleri", condition: "packaging_damage", grade: "A", why: "Depoda kutusu ezildi, ürün hiç açılmadı.", original: 9999, price: 7499, warranty: "24 ay Bosch Türkiye garantisi", description: "1000W, paslanmaz çelik kase. Ürün sıfır, yalnızca dış karton hasarlı.", seller: 0 },
  { slug: "delonghi-magnifica-evo", title: "De'Longhi Magnifica Evo Tam Otomatik", brand: "De'Longhi", category: "ev-mutfak", condition: "excess_inventory", grade: "A", why: "Sezon sonu fazla stok. Sıfır, kutusunda.", original: 29999, price: 21999, warranty: "24 ay distribütör garantisi", description: "Tam otomatik kahve makinesi, entegre öğütücü. Sıfır ürün, fazla stok nedeniyle indirimli.", seller: 1 },
  { slug: "dyson-supersonic-fon", title: "Dyson Supersonic Saç Kurutma", brand: "Dyson", category: "kucuk-ev-aletleri", condition: "trade_show_item", grade: "C", why: "İki fuarda tanıtım ünitesi olarak kullanıldı.", original: 19999, price: 10999, warranty: "6 ay satıcı garantisi", description: "Tüm başlıkları mevcut. Fuar kullanımından kaynaklı belirgin kozmetik izler — hepsi fotoğraflı.", seller: 2, flaws: ["Sap kısmında belirgin çizikler — 4. fotoğrafta", "Motor gövdesinde küçük çentik — 5. fotoğrafta"] },
  { slug: "samsung-frame-55", title: 'Samsung The Frame 55" QLED', brand: "Samsung", category: "elektronik", condition: "display_item", grade: "B", why: "Mağaza duvarında 4 ay sergilendi.", original: 54999, price: 36999, warranty: "12 ay satıcı garantisi", description: "Sanat modu, One Connect kutusu ve orijinal çerçevesiyle. Panel kusursuz.", seller: 2, flaws: ["Çerçeve alt kenarında ince iz — 5. fotoğrafta"] },
  { slug: "tefal-optigrill-elite", title: "Tefal OptiGrill Elite XL", brand: "Tefal", category: "kucuk-ev-aletleri", condition: "open_box", grade: "A", why: "Kutusu açıldı, ürün denenmedi. Teşhir yedeğiydi.", original: 8999, price: 6499, warranty: "24 ay Tefal garantisi", description: "12 otomatik program, XL ızgara yüzeyi. Fiili kullanım yok.", seller: 0 },
  { slug: "miele-complete-c3", title: "Miele Complete C3 Toz Torbalı Süpürge", brand: "Miele", category: "kucuk-ev-aletleri", condition: "returned_product", grade: "A", why: "Renk değişikliği için iade edildi, hiç kullanılmadı.", original: 15999, price: 11999, warranty: "24 ay Miele Türkiye garantisi", description: "Obsidyen siyah. İade nedeni renk tercihi; bant kontrolünden geçti, kullanılmamış.", seller: 1, sold: true },
  { slug: "lg-tone-free-t90", title: "LG Tone Free T90 Kulaklık", brand: "LG", category: "elektronik", condition: "factory_new", grade: "A", why: "Kampanya fazlası sıfır stok.", original: 5999, price: 3999, warranty: "24 ay LG Türkiye garantisi", description: "Dolby Atmos, UV temizlemeli kılıf. Sıfır, bandrollü kutusunda.", seller: 2, sold: true },
<<<<<<< HEAD
=======
  { slug: "braun-multiquick-9", title: "Braun MultiQuick 9 El Blenderi", brand: "Braun", category: "kucuk-ev-aletleri", condition: "open_box", grade: "A", why: "Vitrin yenileme sırasında kutusu açıldı, kullanılmadı.", original: 6499, price: 4799, warranty: "24 ay distribütör garantisi", description: "ActiveBlade teknolojisi, tüm aksesuar seti kutusunda.", seller: 0, submitted: true },
  { slug: "sage-barista-express", title: "Sage Barista Express Espresso Makinesi", brand: "Sage", category: "ev-mutfak", condition: "display_item", grade: "B", why: "Showroom tezgahında 6 hafta sergilendi.", original: 32999, price: 23999, warranty: "12 ay satıcı garantisi", description: "Entegre öğütücülü yarı otomatik espresso makinesi. Tüm aparatları tam.", seller: 1, flaws: ["Damlama tepsisinde hafif çizik — 4. fotoğrafta"], submitted: true },
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
];

async function main() {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

  // idempotent re-seed
<<<<<<< HEAD
=======
  await db.auditLog.deleteMany();
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
  await db.transparencySnapshot.deleteMany();
  await db.order.deleteMany();
  await db.stockHold.deleteMany();
  await db.listingPhoto.deleteMany();
  await db.listing.deleteMany();
  await db.brand.deleteMany();
  await db.category.deleteMany();
  await db.seller.deleteMany();
  await db.user.deleteMany();

  const categories = [
    { slug: "kucuk-ev-aletleri", name: "Küçük Ev Aletleri" },
    { slug: "elektronik", name: "Elektronik" },
    { slug: "ev-mutfak", name: "Ev & Mutfak" },
  ];
  for (const c of categories) await db.category.create({ data: c });

  const sellers = [
    { slug: "moda-elektronik", displayName: "Moda Elektronik", legalName: "Moda Elektronik Tic. Ltd. Şti.", city: "İstanbul" },
    { slug: "nis-home-showroom", displayName: "Niş Home Showroom", legalName: "Niş Ev Gereçleri A.Ş.", city: "İstanbul" },
    { slug: "atlas-avm-outlet", displayName: "Kadıköy Teknoloji Mağazası", legalName: "KTM Elektronik San. Tic. Ltd. Şti.", city: "İstanbul" },
  ];
  const sellerRows = [];
  for (const s of sellers) {
    sellerRows.push(
      await db.seller.create({ data: { ...s, verifiedAt: new Date() } }),
    );
  }

<<<<<<< HEAD
=======
  // A pending application so the ops vetting queue (10.1) has content.
  await db.seller.create({
    data: {
      slug: "bogazici-ev-gerecleri",
      displayName: "Boğaziçi Ev Gereçleri",
      legalName: "Boğaziçi Ev Gereçleri Paz. Ltd. Şti.",
      city: "İstanbul",
      status: "applied",
    },
  });

>>>>>>> 8505f8c (Initialize Atlas project and local setup)
  const brandSlugs = new Map<string, string>();
  for (const l of listings) {
    const slug = l.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!brandSlugs.has(l.brand)) {
      const b = await db.brand.create({ data: { slug, name: l.brand } });
      brandSlugs.set(l.brand, b.id);
    }
  }

  const catRows = await db.category.findMany();
  const catId = (slug: string) => catRows.find((c) => c.slug === slug)!.id;

  let dayOffset = 0;
  for (const l of listings) {
    const photos = [
      { file: `${l.slug}-1.svg`, sub: "Ana görsel", tone: "#f5f5f5", isFlaw: false, label: null as string | null },
      { file: `${l.slug}-2.svg`, sub: "Yan açı", tone: "#fafafa", isFlaw: false, label: null },
      { file: `${l.slug}-3.svg`, sub: "Detay", tone: "#f0f0f0", isFlaw: false, label: null },
      ...(l.flaws ?? []).map((f, i) => ({
        file: `${l.slug}-kusur-${i + 1}.svg`,
        sub: `Kusur ${i + 1}/${l.flaws!.length}`,
        tone: "#ededed",
        isFlaw: true,
        label: f as string | null,
      })),
    ];

    await db.listing.create({
      data: {
        slug: l.slug,
        title: l.title,
        description: l.description,
        condition: l.condition,
        grade: l.grade,
        whyDiscounted: l.why,
        originalPriceKurus: l.original * 100,
        priceKurus: l.price * 100,
        warrantyText: l.warranty,
        stock: l.sold ? 0 : 1,
<<<<<<< HEAD
        status: l.sold ? "sold_out" : "live",
        publishedAt: new Date(Date.now() - dayOffset * 36e5 * 7),
=======
        status: l.sold ? "sold_out" : l.submitted ? "submitted" : "live",
        publishedAt: l.submitted ? null : new Date(Date.now() - dayOffset * 36e5 * 7),
        submittedAt: l.submitted ? new Date() : null,
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
        soldOutAt: l.sold ? new Date() : null,
        sellerId: sellerRows[l.seller].id,
        categoryId: catId(l.category),
        brandId: brandSlugs.get(l.brand)!,
        photos: {
<<<<<<< HEAD
          create: photos.map((p, i) => ({
            position: i,
            url: writePhoto(p.file, l.title, p.sub, p.tone),
            width: 800,
            height: 600,
            isFlaw: p.isFlaw,
            flawLabel: p.label,
          })),
=======
          create: photos.map((p, i) => {
            const url = writePhoto(p.file, l.title, p.sub, p.tone);
            const real = url.endsWith(".png");
            return {
              position: i,
              url,
              width: real ? 1200 : 800,
              height: real ? 896 : 600,
              isFlaw: p.isFlaw,
              flawLabel: p.label,
            };
          }),
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
        },
      },
    });
    dayOffset++;
  }

  const live = await db.listing.count({ where: { status: "live" } });
  const sold = await db.listing.count({ where: { status: "sold_out" } });
<<<<<<< HEAD
  console.log(`Seed OK — ${live} live, ${sold} sold listings, ${sellerRows.length} sellers.`);
=======
  const queued = await db.listing.count({ where: { status: "submitted" } });
  console.log(
    `Seed OK — ${live} live, ${sold} sold, ${queued} in curation queue, ${sellerRows.length}+1 sellers (1 applied).`,
  );
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
