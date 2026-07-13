import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentSeller } from "@/lib/seller-session";
import { createDraft, markShipped, selectSeller } from "@/lib/seller-actions";
import { conditionLabel } from "@/lib/vocab";
import { formatPrice, savingsPercent } from "@/lib/format";
import { GradeBadge } from "@/components/ui/GradeBadge";

// 06.4 MVP dashboard: action queue first (to-ship), then listings, payouts
// view and performance land with the money/score passes. The dashboard leads
// with what needs doing, not with charts.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Satıcı Paneli" };

export default async function SellerDashboard({ searchParams }: PageProps<"/satici">) {
  const sp = await searchParams;
  const error = typeof sp.hata === "string" ? sp.hata : null;
  const seller = await getCurrentSeller();

  if (!seller) {
    const sellers = await db.seller.findMany({ where: { status: "approved" } });
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 md:px-6">
        <h1 className="text-2xl font-semibold text-ink">Satıcı Paneli</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Geliştirme modu: gerçek satıcı doğrulaması (vergi no / MERSİS, 06.2)
          gelene kadar tohum satıcılardan biriyle gir.
        </p>
        <div className="mt-8 space-y-3">
          {sellers.map((s) => (
            <form key={s.id} action={selectSeller.bind(null, s.id)}>
              <button
                type="submit"
                className="w-full rounded-lg border border-line bg-surface px-5 py-4 text-left transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="font-semibold text-ink">{s.displayName}</span>
                <span className="block text-sm text-ink-muted">
                  {s.legalName} · {s.city}
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>
    );
  }

  const [toShip, listings] = await Promise.all([
    db.order.findMany({
      where: { sellerId: seller.id, status: "paid" },
      orderBy: { createdAt: "asc" },
      include: { listing: true },
    }),
    db.listing.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
  ]);

  const STATUS_TR: Record<string, string> = {
    draft: "Taslak",
    live: "Yayında",
    sold_out: "Satıldı",
    removed: "Kaldırıldı",
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{seller.displayName}</h1>
          <p className="text-sm text-ink-muted">Doğrulanmış İşletme · {seller.city}</p>
        </div>
        <form action={createDraft}>
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-md bg-inverse px-5 text-sm font-semibold text-ink-inverse"
          >
            + Yeni ilan
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      {/* Action queue first (06.4): to-ship */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Kargolanacaklar {toShip.length > 0 && <span className="text-ink-muted">({toShip.length})</span>}
        </h2>
        {toShip.length === 0 ? (
          <p className="rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Bekleyen kargo yok.
          </p>
        ) : (
          <ul className="space-y-3">
            {toShip.map((o) => {
              const addr = JSON.parse(o.deliveryAddress) as { name: string; city: string; address: string };
              return (
                <li key={o.id} className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{o.listing.title}</p>
                      <p className="price text-sm text-ink-secondary">{formatPrice(o.totalKurus)}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {addr.name} · {addr.city} — {addr.address}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Kargo taahhüdü: {o.listing.handlingDays} iş günü
                      </p>
                    </div>
                    <form action={markShipped} className="flex items-end gap-2">
                      <input type="hidden" name="orderId" value={o.id} />
                      <div>
                        <label htmlFor={`t-${o.id}`} className="mb-1 block text-xs font-semibold text-ink">
                          Takip no
                        </label>
                        <input
                          id={`t-${o.id}`}
                          name="trackingNo"
                          required
                          placeholder="YK123456789"
                          className="h-10 w-44 rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-10 rounded-md bg-inverse px-4 text-sm font-semibold text-ink-inverse"
                      >
                        Kargoya verildi
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Listings */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-ink">İlanlar</h2>
        {listings.length === 0 ? (
          <div className="rounded-lg border border-line bg-subtle px-5 py-10 text-center">
            <p className="font-semibold text-ink">İlk ilanını aç — 3 dakika sürer.</p>
            <form action={createDraft} className="mt-4">
              <button type="submit" className="inline-flex h-11 items-center rounded-md bg-inverse px-5 text-sm font-semibold text-ink-inverse">
                + Yeni ilan
              </button>
            </form>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-default)] rounded-lg border border-line bg-surface">
            {listings.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {l.title || "(Başlıksız taslak)"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-secondary">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${l.status === "live" ? "bg-subtle text-ink" : "text-ink-muted"} border border-line`}>
                      {STATUS_TR[l.status] ?? l.status}
                    </span>
                    {l.condition && conditionLabel(l.condition)}
                    {l.grade && <GradeBadge grade={l.grade} />}
                    {l.priceKurus > 0 && (
                      <span className="price">
                        {formatPrice(l.priceKurus)} (–%{savingsPercent(l.originalPriceKurus, l.priceKurus)})
                      </span>
                    )}
                  </p>
                </div>
                {l.status === "draft" ? (
                  <Link href={`/satici/ilan/${l.id}?adim=1`} className="text-sm font-semibold text-ink underline underline-offset-2">
                    Devam et
                  </Link>
                ) : (
                  <Link href={`/urun/${l.slug}`} className="text-sm text-ink-secondary hover:text-ink">
                    İlana git →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
