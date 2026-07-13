import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
<<<<<<< HEAD

// 05.3 shared results template + 05.8 flagship empty state:
// zero results is never a dead end — it offers the alert (stubbed in Phase 0).
export function ResultsGrid({
  items,
  emptyQuery,
}: {
  items: ProductCardData[];
  emptyQuery?: string;
=======
import { createAlert } from "@/lib/alert-actions";

// 05.3 shared results template + 05.8 flagship empty state:
// zero results is never a dead end — it offers the alert (scarcity becomes
// engagement). Pass `alert` to arm the form with the current query/filters.

export type AlertPreset = { q?: string; categoryId?: string; back: string };

export function ResultsGrid({
  items,
  emptyQuery,
  alert,
}: {
  items: ProductCardData[];
  emptyQuery?: string;
  alert?: AlertPreset;
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
        <p className="text-lg font-semibold text-ink">
          Şu an eşleşen ürün yok.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
          Stok her gün değişiyor{emptyQuery ? ` — "${emptyQuery}" için` : ""}.
<<<<<<< HEAD
          Alarm özelliği Faz 0&apos;da bağlanıyor; şimdilik bugün gelenlere göz at.
        </p>
        <Link
          href="/#bugun"
          className="mt-6 inline-flex h-11 items-center rounded-md border border-line-strong px-5 text-sm font-semibold text-ink"
        >
          Bugün gelenlere bak
        </Link>
=======
          Alarm kur: eşleşen ilan yayına girdiği an haber verelim.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {alert && (
            <form action={createAlert}>
              {alert.q && <input type="hidden" name="q" value={alert.q} />}
              {alert.categoryId && <input type="hidden" name="categoryId" value={alert.categoryId} />}
              <input type="hidden" name="donus" value={alert.back} />
              <button
                type="submit"
                className="inline-flex h-11 items-center rounded-md bg-inverse px-5 text-sm font-semibold text-ink-inverse"
              >
                🔔 Bu arama için alarm kur
              </button>
            </form>
          )}
          <Link
            href="/#bugun"
            className="inline-flex h-11 items-center rounded-md border border-line-strong px-5 text-sm font-semibold text-ink"
          >
            Bugün gelenlere bak
          </Link>
        </div>
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {items.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}
