import { db } from "@/lib/db";
import { approveListing, rejectListing } from "@/lib/ops-actions";
import { formatDateTime, formatPrice, savingsPercent } from "@/lib/format";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { ConditionBadge } from "@/components/ui/ConditionBadge";

// 10.2 — the curation queue. Oldest first: the SLA is same business day for
// submissions before 16:00. A rejection must carry the specific fix; the
// checklist is on-screen because curation is a judgment call with criteria,
// not a vibe check.

export const dynamic = "force-dynamic";

const CHECKLIST = [
  "Fotoğraflar gerçek ve yeterli mi? (B/C için her kusur fotoğraflı)",
  "Durum + Grade fotoğraflarla tutarlı mı?",
  "“Neden indirimli” gerçek bir cevap mı?",
  "Orijinal fiyat makul/doğrulanabilir mi?",
  "Başlık / kategori / marka doğru mu?",
  "Yasaklı içerik yok mu? (Taklit ürün = satıcı ihracı, 10.4)",
];

export default async function CurationQueue({ searchParams }: PageProps<"/ops">) {
  const sp = await searchParams;
  const error = typeof sp.hata === "string" ? sp.hata : null;

  const [queue, liveCount, pendingSellers, recentAudit] = await Promise.all([
    db.listing.findMany({
      where: { status: "submitted" },
      orderBy: { submittedAt: "asc" },
      include: {
        seller: true,
        brand: true,
        category: true,
        photos: { orderBy: { position: "asc" } },
      },
    }),
    db.listing.count({ where: { status: "live" } }),
    db.seller.count({ where: { status: { in: ["applied", "in_review"] } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Stat label="Kuyrukta" value={queue.length} />
        <Stat label="Yayında" value={liveCount} />
        <Stat label="Bekleyen satıcı başvurusu" value={pendingSellers} />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      <details className="mt-6 rounded-lg border border-line bg-subtle px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold text-ink">
          Kürasyon kontrol listesi (10.2)
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-secondary">
          {CHECKLIST.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>

      <section className="mt-8">
        <h1 className="mb-4 text-lg font-semibold text-ink">
          Kürasyon kuyruğu {queue.length > 0 && <span className="text-ink-muted">({queue.length})</span>}
        </h1>

        {queue.length === 0 ? (
          <p className="rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Kuyruk boş — bekleyen ilan yok.
          </p>
        ) : (
          <ul className="space-y-6">
            {queue.map((l) => {
              const flaws = l.photos.filter((p) => p.isFlaw);
              return (
                <li key={l.id} className="rounded-lg border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                        {l.title} <ConditionBadge condition={l.condition} /> <GradeBadge grade={l.grade} />
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {l.seller.displayName} · {l.seller.city} · {l.category.name} / {l.brand.name}
                      </p>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Gönderim: {l.submittedAt ? formatDateTime(l.submittedAt) : "—"}
                    </p>
                  </div>

                  {/* photos — flaws labeled, they are the grade evidence */}
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {l.photos.map((p) => (
                      <li key={p.id} className="w-28">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.url}
                          alt={p.flawLabel ?? l.title}
                          width={112}
                          height={84}
                          className={`aspect-[4/3] w-full rounded-md border object-cover ${p.isFlaw ? "border-line-strong" : "border-line"}`}
                        />
                        {p.isFlaw && (
                          <span className="mt-0.5 block truncate text-[11px] text-ink-muted" title={p.flawLabel ?? ""}>
                            ⚠ {p.flawLabel}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {(l.grade === "B" || l.grade === "C") && flaws.length === 0 && (
                    <p className="mt-2 text-sm font-semibold text-red-600">
                      Grade {l.grade} ama kusur fotoğrafı yok — kontrol et.
                    </p>
                  )}

                  <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    <Field label="Neden indirimli" value={l.whyDiscounted} />
                    <Field label="Açıklama" value={l.description} />
                    <Field
                      label="Fiyat"
                      value={`${formatPrice(l.priceKurus)} (orijinal ${formatPrice(l.originalPriceKurus)}, –%${savingsPercent(l.originalPriceKurus, l.priceKurus)})`}
                    />
                    <Field label="Garanti" value={l.warrantyText} />
                    <Field label="Stok / hazırlık" value={`${l.stock} adet · ${l.handlingDays} iş günü · kargo ${formatPrice(l.shippingKurus)}`} />
                  </dl>

                  <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                    <form action={approveListing.bind(null, l.id)}>
                      <button
                        type="submit"
                        className="h-11 rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse"
                      >
                        Onayla — yayına al
                      </button>
                    </form>
                    <form action={rejectListing} className="flex flex-1 flex-wrap items-end gap-2">
                      <input type="hidden" name="listingId" value={l.id} />
                      <div className="min-w-64 flex-1">
                        <label htmlFor={`note-${l.id}`} className="mb-1 block text-xs font-semibold text-ink">
                          Ret sebebi — spesifik düzeltme yaz
                        </label>
                        <input
                          id={`note-${l.id}`}
                          name="note"
                          required
                          placeholder='örn. "Grade B seçilmiş ama çizik fotoğrafı yok — kusuru fotoğraflayın."'
                          className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink"
                      >
                        Reddet
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* audit trail — every decision leaves a trace (07.6) */}
      <section className="mt-12">
        <h2 className="mb-3 text-sm font-semibold text-ink">Son işlemler</h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-ink-muted">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-default)] rounded-lg border border-line bg-surface text-sm">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
                <span className="text-xs text-ink-muted">{formatDateTime(a.createdAt)}</span>
                <span className="font-semibold text-ink">{a.action}</span>
                <span className="text-ink-muted">{a.actor}</span>
                {a.detail && <span className="text-ink-secondary">— {a.detail}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <p className="rounded-lg border border-line bg-surface px-4 py-3">
      <span className="price block text-xl font-semibold text-ink">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </p>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink-secondary">{value}</dd>
    </div>
  );
}
