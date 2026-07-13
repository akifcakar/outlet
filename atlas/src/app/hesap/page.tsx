import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { readSessionId } from "@/lib/session";
import {
  createAlert,
  deleteAlert,
  deleteMyData,
  markAllRead,
  toggleAlert,
} from "@/lib/alert-actions";
import { formatDateTime, formatPrice } from "@/lib/format";
import { GradeBadge } from "@/components/ui/GradeBadge";

// 05.6 — the user dashboard. Two jobs: "where is my stuff" (orders) and
// "tell me when my thing appears" (alerts — the retention engine).
// Guest-session scoped until real accounts land (07.1).

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Hesabım" };

const ORDER_STATUS_TR: Record<string, string> = {
  pending_payment: "Ödeme bekliyor",
  paid: "Sipariş alındı",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  dispute_open: "İtiraz inceleniyor",
  refunded: "İade edildi",
  completed: "Tamamlandı",
};

export default async function AccountPage({ searchParams }: PageProps<"/hesap">) {
  const sp = await searchParams;
  const error = typeof sp.hata === "string" ? sp.hata : null;
  const alertCreated = sp.alarm === "kuruldu";
  const sid = await readSessionId();

  const [orders, alerts, notifications, categories] = sid
    ? await Promise.all([
        db.order.findMany({
          where: { guestSessionId: sid },
          orderBy: { createdAt: "desc" },
          include: {
            listing: { include: { photos: { orderBy: { position: "asc" }, take: 1 } } },
            snapshot: true,
          },
        }),
        db.savedSearch.findMany({
          where: { sessionId: sid },
          orderBy: { createdAt: "desc" },
          include: { category: true, _count: { select: { notifications: true } } },
        }),
        db.notification.findMany({
          where: { sessionId: sid },
          orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
          take: 20,
          include: { listing: { include: { photos: { orderBy: { position: "asc" }, take: 1 } } } },
        }),
        db.category.findMany({ orderBy: { name: "asc" } }),
      ])
    : [[], [], [], await db.category.findMany({ orderBy: { name: "asc" } })];

  const unread = notifications.filter((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Hesabım</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Misafir oturumu — gerçek hesaplar geldiğinde siparişlerin ve alarmların
        hesabına taşınır.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}
      {alertCreated && (
        <p className="mt-4 rounded-md border border-line bg-subtle px-4 py-3 text-sm text-ink-secondary">
          Alarm kuruldu 🔔 — eşleşen bir ürün yayına alındığı an burada görürsün.
        </p>
      )}

      {/* Alerts & matches — the retention engine (05.6) */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">
            Alarmların {alerts.length > 0 && <span className="text-ink-muted">({alerts.length})</span>}
          </h2>
          {unread.length > 0 && (
            <form action={markAllRead}>
              <button type="submit" className="text-sm text-ink-secondary underline underline-offset-2 hover:text-ink">
                Tümünü okundu say
              </button>
            </form>
          )}
        </div>

        {notifications.length > 0 && (
          <ul className="mt-4 space-y-2">
            {notifications.map((n) =>
              n.listing ? (
                <li key={n.id}>
                  <Link
                    href={`/urun/${n.listing.slug}`}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] ${
                      n.readAt ? "border-line bg-surface" : "border-line-strong bg-subtle"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={n.listing.photos[0]?.url ?? ""}
                      alt=""
                      width={56}
                      height={42}
                      className="rounded-md bg-subtle"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {!n.readAt && <span aria-hidden>● </span>}
                        {n.listing.title}
                      </span>
                      <span className="text-xs text-ink-muted">
                        Alarmınla eşleşti · {formatDateTime(n.createdAt)}
                        {n.listing.status !== "live" && " · satıldı"}
                      </span>
                    </span>
                    <span className="price text-sm text-ink-secondary">
                      {formatPrice(n.listing.priceKurus)}
                    </span>
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}

        {alerts.length === 0 ? (
          <p className="mt-4 rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Aradığın ürün şu an yoksa alarm kur — eşleşen ilan yayına girdiği an
            haber veririz. Envanter her gün değişir.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border-default)] rounded-lg border border-line bg-surface">
            {alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className={`text-sm font-semibold ${a.active ? "text-ink" : "text-ink-muted line-through"}`}>
                    {[
                      a.queryText && `"${a.queryText}"`,
                      a.category?.name,
                      a.maxPriceKurus && `≤ ${formatPrice(a.maxPriceKurus)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {a._count.notifications} eşleşme
                    {a.lastMatchedAt && ` · son: ${formatDateTime(a.lastMatchedAt)}`}
                    {!a.active && " · kapalı"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <form action={toggleAlert.bind(null, a.id)}>
                    <button type="submit" className="text-ink-secondary underline underline-offset-2 hover:text-ink">
                      {a.active ? "Durdur" : "Aç"}
                    </button>
                  </form>
                  <form action={deleteAlert.bind(null, a.id)}>
                    <button type="submit" className="text-ink-muted hover:text-ink">
                      Sil
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Manual alert builder */}
        <form action={createAlert} className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-surface p-4">
          <div className="min-w-40 flex-1">
            <label htmlFor="alert-q" className="mb-1 block text-xs font-semibold text-ink">Arama</label>
            <input id="alert-q" name="q" placeholder='örn. "espresso"' className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted" />
          </div>
          <div>
            <label htmlFor="alert-cat" className="mb-1 block text-xs font-semibold text-ink">Kategori</label>
            <select id="alert-cat" name="categoryId" className="h-10 rounded-sm border border-line bg-surface px-2 text-sm text-ink">
              <option value="">Hepsi</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label htmlFor="alert-max" className="mb-1 block text-xs font-semibold text-ink">En çok (₺)</label>
            <input id="alert-max" name="maxPrice" type="number" min={1} placeholder="15000" className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted" />
          </div>
          <button type="submit" className="h-10 rounded-md bg-inverse px-4 text-sm font-semibold text-ink-inverse">
            🔔 Alarm kur
          </button>
        </form>
      </section>

      {/* Orders (05.6: photo, title, grade, price, status chip, date) */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-ink">
          Siparişlerin {orders.length > 0 && <span className="text-ink-muted">({orders.length})</span>}
        </h2>
        {orders.length === 0 ? (
          <p className="mt-4 rounded-lg border border-line bg-subtle px-5 py-6 text-sm text-ink-secondary">
            Henüz siparişin yok. <Link href="/" className="font-semibold text-ink underline underline-offset-2">Bugün Atlas&apos;ta</Link> ne var, bak.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/siparis/${o.id}`}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.listing.photos[0]?.url ?? ""} alt="" width={56} height={42} className="rounded-md bg-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
                      {o.listing.title} {o.snapshot && <GradeBadge grade={o.snapshot.grade} />}
                    </span>
                    <span className="text-xs text-ink-muted">{formatDateTime(o.createdAt)}</span>
                  </span>
                  <span className="rounded-full border border-line bg-subtle px-2 py-0.5 text-xs text-ink-secondary">
                    {ORDER_STATUS_TR[o.status] ?? o.status}
                  </span>
                  <span className="price text-sm text-ink-secondary">{formatPrice(o.totalKurus)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* KVKK self-service (02: burying deletion is a dark pattern) */}
      <section className="mt-12 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold text-ink">Verilerin</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          KVKK hakların: bu oturuma bağlı tüm verini indirebilir ya da
          sildirebilirsin. Silme kişisel verini kaldırır; yasal saklama
          yükümlülüğündeki finansal kayıtlar anonimleştirilerek tutulur.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/hesap/veri"
            className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-sm font-semibold text-ink"
          >
            Verimi indir (JSON)
          </a>
          <form action={deleteMyData}>
            <button
              type="submit"
              className="h-10 rounded-md border border-red-600/40 px-4 text-sm font-semibold text-red-600"
            >
              Verimi sil
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
