import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toCardData } from "@/lib/cards";
import { ResultsGrid } from "@/components/ResultsGrid";

// 05.3 — search shares the results template. SQLite dev: contains-match on
// title/brand; production swaps in Postgres FTS → Meilisearch (08.7).

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Arama" };

export default async function SearchPage({ searchParams }: PageProps<"/ara">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim();

  const listings = q
    ? await db.listing.findMany({
        where: {
          status: "live",
          OR: [
            { title: { contains: q } },
            { brand: { name: { contains: q } } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        include: { seller: true, photos: { orderBy: { position: "asc" }, take: 1 } },
      })
    : [];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <h1 className="text-2xl font-semibold text-ink md:text-3xl">
        {q ? `"${q}" için sonuçlar` : "Arama"}
      </h1>
      <p className="mb-8 mt-1 text-sm text-ink-muted">
        {q ? `${listings.length} sonuç` : "Aramak için yukarıdaki kutuyu kullan."}
      </p>
      {q && <ResultsGrid items={listings.map(toCardData)} emptyQuery={q} />}
    </div>
  );
}
