import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toCardData } from "@/lib/cards";
<<<<<<< HEAD
=======
import { createAlert } from "@/lib/alert-actions";
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
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
<<<<<<< HEAD
      <h1 className="text-2xl font-semibold text-ink md:text-3xl">
        {q ? `"${q}" için sonuçlar` : "Arama"}
      </h1>
      <p className="mb-8 mt-1 text-sm text-ink-muted">
        {q ? `${listings.length} sonuç` : "Aramak için yukarıdaki kutuyu kullan."}
      </p>
      {q && <ResultsGrid items={listings.map(toCardData)} emptyQuery={q} />}
=======
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink md:text-3xl">
            {q ? `"${q}" için sonuçlar` : "Arama"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {q ? `${listings.length} sonuç` : "Aramak için yukarıdaki kutuyu kullan."}
          </p>
        </div>
        {/* 05.3 — the signature browse feature: every results page offers an
            alert; the zero-result page is its flagship home (05.8). */}
        {q && (
          <form action={createAlert}>
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="donus" value={`/ara?q=${encodeURIComponent(q)}`} />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-sm font-semibold text-ink"
            >
              🔔 Yeni eşleşmelerde haber ver
            </button>
          </form>
        )}
      </div>
      <div className="mt-8">
        {q && (
          <ResultsGrid
            items={listings.map(toCardData)}
            emptyQuery={q}
            alert={{ q, back: `/ara?q=${encodeURIComponent(q)}` }}
          />
        )}
      </div>
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
    </div>
  );
}
