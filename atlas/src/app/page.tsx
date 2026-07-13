import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard, VerifiedCheck } from "@/components/ProductCard";
import { toCardData } from "@/lib/cards";

// 05.2 — section order: hero, trust strip, Today on Atlas, categories,
// recently sold, seller invitation. No carousels, no countdowns, no pop-ups.

export const dynamic = "force-dynamic";

async function getListings(status: string, take: number) {
  return db.listing.findMany({
    where: { status },
    orderBy: status === "live" ? { publishedAt: "desc" } : { soldOutAt: "desc" },
    take,
    include: {
      seller: true,
      photos: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export default async function Home() {
  const [fresh, sold, categories] = await Promise.all([
    getListings("live", 8),
    getListings("sold_out", 4),
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { listings: { where: { status: "live" } } } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6">
      {/* Hero — one statement, one CTA (05.2) */}
      <section className="py-16 text-center md:py-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Her indirimin bir sebebi var.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-secondary">
          Teşhir, açık kutu ve fazla stok ürünler — doğrulanmış işletmelerden,
          nedeni açıklanmış fiyatlarla.
        </p>
        <Link
          href="#bugun"
          className="mt-8 inline-flex h-11 items-center rounded-md bg-inverse px-6 text-[15px] font-semibold text-ink-inverse transition-transform duration-100 active:scale-[0.98]"
        >
          Bugün gelenlere bak
        </Link>
      </section>

      {/* Trust strip (05.2) */}
      <section aria-label="Güven ilkeleri" className="rounded-lg bg-subtle">
        <ul className="grid gap-3 px-6 py-5 text-sm text-ink-secondary sm:grid-cols-3">
          <li className="flex items-center justify-center gap-2">
            <VerifiedCheck /> Yalnızca doğrulanmış işletmeler
          </li>
          <li className="flex items-center justify-center gap-2">
            <VerifiedCheck /> Her ürün Grade&apos;li: A, B, C
          </li>
          <li className="flex items-center justify-center gap-2">
            <VerifiedCheck /> Ödemen teslimata kadar güvende
          </li>
        </ul>
      </section>

      {/* Today on Atlas (05.2 core section) */}
      <section id="bugun" className="scroll-mt-24 py-12 md:py-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-ink md:text-[28px]">
            Bugün Atlas&apos;ta
          </h2>
          <p className="text-sm text-ink-muted">{fresh.length} canlı ilan</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {fresh.map((l) => (
            <ProductCard key={l.id} p={toCardData(l)} />
          ))}
        </div>
      </section>

      {/* Categories (05.2) — real counts */}
      <section className="py-8">
        <h2 className="mb-6 text-2xl font-semibold text-ink">Kategoriler</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="rounded-lg border border-line bg-surface p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
            >
              <h3 className="font-semibold text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {c._count.listings} ürün
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently sold — honest social proof (05.2) */}
      {sold.length > 0 && (
        <section className="py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-ink">Gitti.</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Son satılanlar — burada işler hızlı olur.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {sold.map((l) => (
              <ProductCard key={l.id} p={toCardData(l)} />
            ))}
          </div>
        </section>
      )}

      {/* Seller invitation — one quiet band (05.2) */}
      <section className="my-12 rounded-lg border border-line bg-surface px-6 py-8 text-center">
        <p className="text-lg text-ink">
          Teşhir veya açık kutu stoğun mu var?{" "}
          <span className="font-semibold">Atlas&apos;ta sat.</span>
        </p>
        <p className="mt-2 text-sm text-ink-secondary">
          Komisyon %12 — sadece satınca. İlanı 3 dakikada telefondan aç.
        </p>
      </section>
    </div>
  );
}
