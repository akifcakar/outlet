import { db } from "@/lib/db";
import {
  approveSeller,
  declineSeller,
  reinstateSeller,
  suspendSeller,
} from "@/lib/ops-actions";
import { formatDateTime } from "@/lib/format";

// 10.1 — seller vetting. Applications decided within 3 business days; every
// decline states the reason (it goes to the applicant and the audit log).
// Suspension pulls the seller's live listings (10.4).

export const dynamic = "force-dynamic";

const STATUS_TR: Record<string, string> = {
  applied: "Başvurdu",
  in_review: "İncelemede",
  approved: "Onaylı",
  declined: "Reddedildi",
  suspended: "Askıda",
};

export default async function OpsSellers({ searchParams }: PageProps<"/ops/satici">) {
  const sp = await searchParams;
  const error = typeof sp.hata === "string" ? sp.hata : null;

  const sellers = await db.seller.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          listings: { where: { status: "live" } },
          orders: true,
        },
      },
    },
  });

  const pending = sellers.filter((s) => s.status === "applied" || s.status === "in_review");
  const active = sellers.filter((s) => s.status === "approved");
  const rest = sellers.filter((s) => s.status === "declined" || s.status === "suspended");

  return (
    <div>
      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h1 className="mb-4 text-lg font-semibold text-ink">
          Bekleyen başvurular {pending.length > 0 && <span className="text-ink-muted">({pending.length})</span>}
        </h1>
        {pending.length === 0 ? (
          <p className="rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Bekleyen başvuru yok.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((s) => (
              <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
                <SellerHead seller={s} />
                <p className="mt-2 text-xs text-ink-muted">
                  Kontrol (10.1): vergi no/MERSİS geçerli · fiziksel işletme kanıtı ·
                  kategori uyumu · temel aramada kırmızı bayrak yok. SLA: 3 iş günü.
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                  <form action={approveSeller.bind(null, s.id)}>
                    <button type="submit" className="h-11 rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse">
                      Onayla
                    </button>
                  </form>
                  <form action={declineSeller} className="flex flex-1 flex-wrap items-end gap-2">
                    <input type="hidden" name="sellerId" value={s.id} />
                    <div className="min-w-64 flex-1">
                      <label htmlFor={`decline-${s.id}`} className="mb-1 block text-xs font-semibold text-ink">
                        Ret sebebi
                      </label>
                      <input
                        id={`decline-${s.id}`}
                        name="reason"
                        required
                        placeholder='örn. "Vergi kaydı doğrulanamadı — belgeyle yeniden başvurabilirsiniz."'
                        className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
                      />
                    </div>
                    <button type="submit" className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink">
                      Reddet
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Aktif satıcılar <span className="text-ink-muted">({active.length})</span>
        </h2>
        <ul className="space-y-4">
          {active.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
              <SellerHead seller={s} />
              <form action={suspendSeller} className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
                <input type="hidden" name="sellerId" value={s.id} />
                <div className="min-w-64 flex-1">
                  <label htmlFor={`suspend-${s.id}`} className="mb-1 block text-xs font-semibold text-ink">
                    Askıya alma sebebi (canlı ilanları kaldırılır)
                  </label>
                  <input
                    id={`suspend-${s.id}`}
                    name="reason"
                    required
                    placeholder="örn. 3 aktif strike — 10.4 ceza matrisi."
                    className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
                  />
                </div>
                <button type="submit" className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink">
                  Askıya al
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {rest.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-ink">Askıda / reddedilmiş</h2>
          <ul className="space-y-4">
            {rest.map((s) => (
              <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
                <SellerHead seller={s} />
                {s.status === "suspended" && (
                  <form action={reinstateSeller.bind(null, s.id)} className="mt-4 border-t border-line pt-4">
                    <button type="submit" className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink">
                      Askıyı kaldır
                    </button>
                    <p className="mt-2 text-xs text-ink-muted">
                      Kaldırılan ilanlar geri gelmez — satıcı yeniden ilan verir, ilanlar kürasyondan geçer.
                    </p>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SellerHead({
  seller,
}: {
  seller: {
    displayName: string;
    legalName: string;
    city: string;
    status: string;
    createdAt: Date;
    _count: { listings: number; orders: number };
  };
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 font-semibold text-ink">
          {seller.displayName}
          <span className="rounded-full border border-line bg-subtle px-2 py-0.5 text-xs font-normal text-ink-secondary">
            {STATUS_TR[seller.status] ?? seller.status}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {seller.legalName} · {seller.city}
        </p>
      </div>
      <p className="text-xs text-ink-muted">
        {seller._count.listings} canlı ilan · {seller._count.orders} sipariş · başvuru {formatDateTime(seller.createdAt)}
      </p>
    </div>
  );
}
