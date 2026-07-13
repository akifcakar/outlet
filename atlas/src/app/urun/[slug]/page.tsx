import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { TransparencyCard } from "@/components/TransparencyCard";
import { ProductCard, VerifiedCheck } from "@/components/ProductCard";
<<<<<<< HEAD
import { conditionLabel, gradeExplainer } from "@/lib/vocab";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout-actions";
=======
import { Gallery } from "@/components/Gallery";
import { conditionLabel, gradeExplainer } from "@/lib/vocab";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/checkout-actions";
import { createAlert } from "@/lib/alert-actions";
>>>>>>> 8505f8c (Initialize Atlas project and local setup)

// 05.4 — answers in order: what is it → what state → why cheaper → what do
// I pay → am I protected. Flaw photos live in the main gallery, labeled.
// Sold listings keep their URL and become acquisition pages.

export const dynamic = "force-dynamic";

async function getListing(slug: string) {
  return db.listing.findUnique({
    where: { slug },
    include: {
      seller: true,
      brand: true,
      category: true,
      photos: { orderBy: { position: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/urun/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l) return {};
  return {
    title: `${l.title} — ${conditionLabel(l.condition)}, Grade ${l.grade}`,
    description: `${l.whyDiscounted} ${formatPrice(l.priceKurus)} (orijinal ${formatPrice(l.originalPriceKurus)}).`,
  };
}

export default async function ProductPage({ params }: PageProps<"/urun/[slug]">) {
  const { slug } = await params;
  const l = await getListing(slug);
<<<<<<< HEAD
  if (!l || l.status === "removed" || l.status === "draft") notFound();
=======
  // Public states only — anything pre-curation or pulled stays invisible.
  if (!l || (l.status !== "live" && l.status !== "sold_out")) notFound();
>>>>>>> 8505f8c (Initialize Atlas project and local setup)

  const sold = l.status === "sold_out";
  const similar = await db.listing.findMany({
    where: { status: "live", categoryId: l.categoryId, id: { not: l.id } },
    take: 4,
    orderBy: { publishedAt: "desc" },
    include: { seller: true, photos: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <nav aria-label="breadcrumb" className="mb-6 text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">Atlas</Link>
        {" / "}
        <Link href={`/kategori/${l.category.slug}`} className="hover:text-ink">
          {l.category.name}
        </Link>
        {" / "}
        <span className="text-ink-secondary">{l.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
<<<<<<< HEAD
        {/* Gallery — flaw photos in the main gallery, labeled (05.4) */}
        <section aria-label="Ürün fotoğrafları" className="lg:col-span-7">
          <div className="space-y-4">
            {l.photos.map((p, i) => (
              <figure
                key={p.id}
                className={`overflow-hidden rounded-lg border bg-subtle ${sold && i === 0 ? "opacity-60" : ""} ${p.isFlaw ? "border-line-strong" : "border-line"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={
                    p.isFlaw
                      ? `Kusur yakın çekim: ${p.flawLabel ?? ""}`
                      : `${l.title} — fotoğraf ${i + 1}`
                  }
                  width={p.width}
                  height={p.height}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-full"
                />
                {p.isFlaw && (
                  <figcaption className="border-t border-line px-4 py-2 text-sm text-ink-secondary">
                    <span className="font-semibold text-ink">Kusur fotoğrafı:</span>{" "}
                    {p.flawLabel}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
=======
        {/* Gallery — swipeable, flaw photos in the main flow, labeled (05.4) */}
        <section aria-label="Ürün fotoğrafları" className="lg:col-span-7">
          <Gallery
            photos={l.photos.map((p) => ({
              id: p.id,
              url: p.url,
              width: p.width,
              height: p.height,
              isFlaw: p.isFlaw,
              flawLabel: p.flawLabel,
            }))}
            title={l.title}
            dimFirst={sold}
          />
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
        </section>

        {/* Buy box — sticky on desktop (05.4) */}
        <section className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-32">
            <div>
              <p className="text-sm text-ink-muted">{l.brand.name}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {l.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ConditionBadge condition={l.condition} />
              <GradeBadge grade={l.grade} />
              <span className="text-sm text-ink-secondary">
                {gradeExplainer(l.grade)}
              </span>
            </div>

            <PriceBlock
              originalKurus={l.originalPriceKurus}
              priceKurus={l.priceKurus}
              size="lg"
            />

            {sold ? (
              <div className="rounded-lg border border-line bg-subtle p-5">
                <p className="font-semibold text-ink">Satıldı.</p>
                <p className="mt-1 text-sm text-ink-secondary">
<<<<<<< HEAD
                  Burada işler hızlı olur. Benzeri gelince ilk sen öğren —
                  alarm özelliği Faz 0&apos;da bağlanıyor.
                </p>
=======
                  Burada işler hızlı olur. Benzeri gelince ilk sen öğren.
                </p>
                {/* Sold page is an acquisition page (05.4): brand+category alert */}
                <form action={createAlert} className="mt-4">
                  <input type="hidden" name="q" value={l.brand.name} />
                  <input type="hidden" name="categoryId" value={l.categoryId} />
                  <input type="hidden" name="donus" value={`/urun/${l.slug}`} />
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center rounded-md bg-inverse px-5 text-sm font-semibold text-ink-inverse"
                  >
                    🔔 Benzeri gelince haber ver
                  </button>
                </form>
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink-muted">{l.stock} adet — giden gitti</p>
                {/* Buy-now starts the 10-minute stock hold (05.5, 07.3) */}
                <form action={startCheckout.bind(null, l.slug)}>
                  <button
                    type="submit"
                    className="flex h-13 w-full items-center justify-center rounded-md bg-inverse px-6 text-[15px] font-semibold text-ink-inverse transition-transform duration-100 active:scale-[0.98]"
                  >
                    Satın al — {formatPrice(l.priceKurus)}
                  </button>
                </form>
                <p className="text-center text-xs text-ink-muted">
                  Ödemen, ürünü teslim alıp onaylayana kadar güvende tutulur.
                </p>
              </div>
            )}

            <TransparencyCard
              condition={l.condition}
              grade={l.grade}
              whyDiscounted={l.whyDiscounted}
              originalPriceKurus={l.originalPriceKurus}
              priceKurus={l.priceKurus}
              warrantyText={l.warrantyText}
              stock={l.stock}
            />

            {/* Seller card (05.4) */}
            <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
              <div>
                <p className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                  <VerifiedCheck /> {l.seller.displayName}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Doğrulanmış İşletme · {l.seller.city}
                </p>
              </div>
            </div>

            {/* Protection recap (05.4) */}
            <ul className="space-y-1.5 text-sm text-ink-secondary">
              <li>· Ödeme teslimatı onaylayana kadar güvende</li>
              <li>· 14 gün koşulsuz iade hakkı</li>
              <li>· &quot;Anlatıldığı gibi değilse&quot; iade kargo bizden</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Description */}
      <section className="mt-12 max-w-3xl">
        <h2 className="mb-3 text-xl font-semibold text-ink">Açıklama</h2>
        <p className="text-[15px] leading-relaxed text-ink-secondary">
          {l.description}
        </p>
      </section>

      {/* Similar items — also the sold state's safety net (05.4) */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-semibold text-ink">Benzer ürünler</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {similar.map((s) => (
              <ProductCard
                key={s.id}
                p={{
                  slug: s.slug,
                  title: s.title,
                  condition: s.condition,
                  grade: s.grade,
                  originalPriceKurus: s.originalPriceKurus,
                  priceKurus: s.priceKurus,
                  stock: s.stock,
                  status: s.status,
                  photoUrl: s.photos[0]?.url ?? "",
                  sellerName: s.seller.displayName,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
