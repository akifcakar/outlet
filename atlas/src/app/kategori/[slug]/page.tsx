import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toCardData } from "@/lib/cards";
import { ResultsGrid } from "@/components/ResultsGrid";
import { CONDITIONS, GRADES } from "@/lib/vocab";

// 05.3 — browse template. Filter order mirrors how outlet buyers decide:
// condition → grade → (price/brand later). Every filter state is in the URL.

export const dynamic = "force-dynamic";

const SORTS = {
  yeni: { label: "En yeni", orderBy: { publishedAt: "desc" as const } },
  "fiyat-artan": { label: "Fiyat (artan)", orderBy: { priceKurus: "asc" as const } },
  "fiyat-azalan": { label: "Fiyat (azalan)", orderBy: { priceKurus: "desc" as const } },
};

export async function generateMetadata({
  params,
}: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  return cat ? { title: `${cat.name} — teşhir ve açık kutu fırsatları` } : {};
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/kategori/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) notFound();

  const condition = typeof sp.durum === "string" ? sp.durum : undefined;
  const grade = typeof sp.grade === "string" ? sp.grade : undefined;
  const sortKey = (typeof sp.sirala === "string" && sp.sirala in SORTS
    ? sp.sirala
    : "yeni") as keyof typeof SORTS;

  const listings = await db.listing.findMany({
    where: {
      status: "live",
      categoryId: cat.id,
      ...(condition ? { condition } : {}),
      ...(grade ? { grade } : {}),
    },
    orderBy: SORTS[sortKey].orderBy,
    include: { seller: true, photos: { orderBy: { position: "asc" }, take: 1 } },
  });

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const state = { durum: condition, grade, sirala: sortKey === "yeni" ? undefined : sortKey, ...patch };
    for (const [k, v] of Object.entries(state)) if (v) q.set(k, v);
    const s = q.toString();
    return `/kategori/${slug}${s ? `?${s}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <nav aria-label="breadcrumb" className="mb-4 text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">Atlas</Link>
        {" / "}
        <span className="text-ink-secondary">{cat.name}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-semibold text-ink md:text-3xl">{cat.name}</h1>
        <p className="text-sm text-ink-muted">{listings.length} sonuç</p>
      </div>

      {/* Filters as URL-encoded chips (05.3) */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted">Durum:</span>
          <FilterChip href={href({ durum: undefined })} active={!condition} label="Tümü" />
          {Object.entries(CONDITIONS).map(([key, label]) => (
            <FilterChip
              key={key}
              href={href({ durum: key })}
              active={condition === key}
              label={label}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted">Grade:</span>
          <FilterChip href={href({ grade: undefined })} active={!grade} label="Tümü" />
          {Object.keys(GRADES).map((g) => (
            <FilterChip key={g} href={href({ grade: g })} active={grade === g} label={`Grade ${g}`} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-muted">Sırala:</span>
          {Object.entries(SORTS).map(([key, s]) => (
            <FilterChip
              key={key}
              href={href({ sirala: key === "yeni" ? undefined : key })}
              active={sortKey === key}
              label={s.label}
            />
          ))}
        </div>
      </div>

      <ResultsGrid items={listings.map(toCardData)} />
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors duration-100 ${
        active
          ? "border-transparent bg-inverse font-semibold text-ink-inverse"
          : "border-line text-ink-secondary hover:border-line-strong hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
