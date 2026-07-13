import { db } from "@/lib/db";
import { resolveDispute } from "@/lib/dispute-actions";
import { conditionLabel, disputeReasonLabel } from "@/lib/vocab";
import { formatDateTime, formatPrice } from "@/lib/format";
import { GradeBadge } from "@/components/ui/GradeBadge";

// 10.3 — dispute resolution. The evidence is laid side by side: the contract
// (TransparencySnapshot) vs the buyer's photos. Buyer-protection tilt on
// genuine ambiguity; every decision ships with a plain-language explanation.

export const dynamic = "force-dynamic";

export default async function OpsDisputes({ searchParams }: PageProps<"/ops/itiraz">) {
  const sp = await searchParams;
  const error = typeof sp.hata === "string" ? sp.hata : null;

  const [open, resolved] = await Promise.all([
    db.dispute.findMany({
      where: { status: "open" },
      orderBy: { openedAt: "asc" }, // oldest first — 7-day SLA
      include: {
        order: { include: { listing: true, seller: true, snapshot: true } },
      },
    }),
    db.dispute.findMany({
      where: { status: "resolved" },
      orderBy: { resolvedAt: "desc" },
      take: 5,
      include: { order: { include: { listing: true } } },
    }),
  ]);

  return (
    <div>
      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h1 className="mb-4 text-lg font-semibold text-ink">
          Açık itirazlar {open.length > 0 && <span className="text-ink-muted">({open.length})</span>}
        </h1>

        {open.length === 0 ? (
          <p className="rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Açık itiraz yok.
          </p>
        ) : (
          <ul className="space-y-6">
            {open.map((d) => {
              const snap = d.order.snapshot;
              const snapPhotos: string[] = snap ? JSON.parse(snap.photoUrls) : [];
              const buyerPhotos: string[] = JSON.parse(d.photoUrls);
              const isCayma = d.reason === "withdrawal_14day";
              return (
                <li key={d.id} className="rounded-lg border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{d.order.listing.title}</p>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {d.order.seller.displayName} · {formatPrice(d.order.totalKurus)} ·{" "}
                        <span className="font-semibold text-ink">{disputeReasonLabel(d.reason)}</span>
                      </p>
                    </div>
                    <p className="text-xs text-ink-muted">Açılış: {formatDateTime(d.openedAt)}</p>
                  </div>

                  {/* Contract vs evidence, side by side */}
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-line bg-subtle p-4">
                      <h2 className="text-xs font-semibold text-ink-muted">
                        SÖZLEŞME — satın alma anındaki kayıt
                      </h2>
                      {snap ? (
                        <>
                          <p className="mt-2 flex items-center gap-2 text-sm text-ink">
                            {conditionLabel(snap.condition)} <GradeBadge grade={snap.grade} />
                          </p>
                          <p className="mt-1 text-sm text-ink-secondary">{snap.whyDiscounted}</p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {snapPhotos.map((u) => (
                              <li key={u}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u} alt="Sözleşme fotoğrafı" width={72} height={54} className="rounded border border-line object-cover" />
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-red-600">Snapshot yok — P1, elle incele.</p>
                      )}
                    </div>
                    <div className="rounded-md border border-line bg-subtle p-4">
                      <h2 className="text-xs font-semibold text-ink-muted">ALICI — beyan ve kanıt</h2>
                      <p className="mt-2 text-sm text-ink-secondary">{d.buyerStatement}</p>
                      {buyerPhotos.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {buyerPhotos.map((u) => (
                            <li key={u}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={u} alt="Alıcı fotoğrafı" width={72} height={54} className="rounded border border-line object-cover" />
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-3 border-t border-line pt-2 text-sm text-ink-secondary">
                        <span className="text-xs font-semibold text-ink-muted">SATICI YANITI: </span>
                        {d.sellerResponse ?? <span className="text-ink-muted">henüz yok (48s penceresi)</span>}
                      </p>
                    </div>
                  </div>

                  {/* Decision (10.3 table) */}
                  <form action={resolveDispute} className="mt-5 space-y-3 border-t border-line pt-4">
                    <input type="hidden" name="disputeId" value={d.id} />
                    <div className="flex flex-wrap gap-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm text-ink has-checked:border-transparent has-checked:bg-inverse has-checked:text-ink-inverse">
                        <input type="radio" name="resolution" value="refund" required defaultChecked={isCayma} className="sr-only" />
                        Ücret iadesi
                      </label>
                      <label className={`flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm ${isCayma ? "cursor-not-allowed text-ink-muted" : "cursor-pointer text-ink has-checked:border-transparent has-checked:bg-inverse has-checked:text-ink-inverse"}`}>
                        <input type="radio" name="resolution" value="release" disabled={isCayma} className="sr-only" />
                        Karta uygun — satıcıya aktar
                      </label>
                      {!isCayma && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary">
                          <input type="checkbox" name="misgrade" value="1" />
                          Yanlış grade doğrulandı → strike (10.4)
                        </label>
                      )}
                    </div>
                    {isCayma && (
                      <p className="text-xs text-ink-muted">
                        Cayma hakkı yasa gereği her zaman kabul edilir — tek karar iade (11).
                      </p>
                    )}
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="min-w-64 flex-1">
                        <label htmlFor={`note-${d.id}`} className="mb-1 block text-xs font-semibold text-ink">
                          Karar açıklaması — alıcı ve satıcı bunu okur
                        </label>
                        <input
                          id={`note-${d.id}`}
                          name="note"
                          required
                          placeholder="Düz dille: neye baktık, neye karar verdik, neden."
                          className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
                        />
                      </div>
                      <button type="submit" className="h-10 rounded-md bg-inverse px-5 text-sm font-semibold text-ink-inverse">
                        Karara bağla
                      </button>
                    </div>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-sm font-semibold text-ink">Son kararlar</h2>
          <ul className="divide-y divide-[var(--border-default)] rounded-lg border border-line bg-surface text-sm">
            {resolved.map((d) => (
              <li key={d.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
                <span className="text-xs text-ink-muted">{d.resolvedAt && formatDateTime(d.resolvedAt)}</span>
                <span className="font-semibold text-ink">{d.order.listing.title}</span>
                <span className="text-ink-muted">{disputeReasonLabel(d.reason)}</span>
                <span className="text-ink-secondary">
                  → {d.resolution === "refund" ? "iade" : "satıcıya aktarıldı"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
