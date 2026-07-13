import { db } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";

// 08.2 — ops order view: the escrow chain at a glance. Read-only for now;
// dispute actions (10.3) land with the dispute model. Ops never edits an
// order outside the state machine — there are deliberately no buttons here.

export const dynamic = "force-dynamic";

const STATUS_TR: Record<string, string> = {
  pending_payment: "Ödeme bekliyor",
  paid: "Ödendi — kargo bekliyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  dispute_open: "İtiraz açık",
  refunded: "İade edildi",
  completed: "Tamamlandı",
};

export default async function OpsOrders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { listing: true, seller: true, snapshot: true },
  });

  return (
    <section className="mt-8">
      <h1 className="mb-4 text-lg font-semibold text-ink">
        Siparişler <span className="text-ink-muted">({orders.length})</span>
      </h1>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
          Henüz sipariş yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-muted">
                <th className="px-4 py-3 font-semibold">Tarih</th>
                <th className="px-4 py-3 font-semibold">Ürün</th>
                <th className="px-4 py-3 font-semibold">Satıcı</th>
                <th className="px-4 py-3 font-semibold">Tutar</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Takip / Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-muted">
                    {formatDateTime(o.createdAt)}
                  </td>
                  <td className="max-w-64 truncate px-4 py-3 font-semibold text-ink" title={o.listing.title}>
                    {o.listing.title}
                    {o.snapshot && (
                      <span className="block text-xs font-normal text-ink-muted">
                        Grade {o.snapshot.grade} sözleşmesi kayıtlı
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{o.seller.displayName}</td>
                  <td className="price whitespace-nowrap px-4 py-3 text-ink">{formatPrice(o.totalKurus)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full border border-line bg-subtle px-2 py-0.5 text-xs text-ink-secondary">
                      {STATUS_TR[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {o.trackingNo && <span className="price block">{o.trackingNo}</span>}
                    {o.gradeMatched === true && <span className="block">Grade check: ✓ uygun</span>}
                    {o.gradeMatched === false && (
                      <span className="block font-semibold text-red-600">Grade check: ✗ uyumsuz</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-muted">
        Sipariş durumu yalnızca durum makinesi üzerinden değişir (08.3) — burada
        kasıtlı olarak düzenleme yok. İtiraz akışı (10.3) dispute modeliyle gelecek.
      </p>
    </section>
  );
}
