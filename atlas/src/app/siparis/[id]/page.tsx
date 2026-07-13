import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readSessionId } from "@/lib/session";
import { formatPrice } from "@/lib/format";
import { conditionLabel } from "@/lib/vocab";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { confirmDelivery } from "@/lib/order-actions";

// 05.5 confirmation + 05.6 order detail (merged for MVP).
// Calm confidence: no confetti — the celebration is the product arriving as
// described. Gated by the guest session until accounts exist.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Siparişin" };

const TIMELINE: { key: string; label: string }[] = [
  { key: "paid", label: "Sipariş alındı" },
  { key: "shipped", label: "Kargoya verildi" },
  { key: "delivered", label: "Teslim edildi" },
  { key: "completed", label: "Onaylandı — ödeme satıcıya aktarıldı" },
];

export default async function OrderPage({ params }: PageProps<"/siparis/[id]">) {
  const { id } = await params;
  const sid = await readSessionId();
  const order = await db.order.findUnique({
    where: { id },
    include: { listing: true, seller: true, snapshot: true },
  });
  if (!order || !sid || order.guestSessionId !== sid) notFound();

  const snap = order.snapshot!;
  const photos: string[] = JSON.parse(snap.photoUrls);
  const stageIndex = TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-ink md:text-3xl">
        Sipariş onaylandı.
      </h1>
      <p className="mt-2 text-ink-secondary">
        {order.seller.displayName} bilgilendirildi;{" "}
        {order.listing.handlingDays} iş günü içinde kargolar.
      </p>

      {/* What happens next / status timeline (05.6) */}
      <ol className="mt-8 space-y-0">
        {TIMELINE.map((t, i) => {
          const done = i <= stageIndex;
          return (
            <li key={t.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
                    done
                      ? "border-transparent bg-inverse text-ink-inverse"
                      : "border-line-strong text-ink-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {i < TIMELINE.length - 1 && (
                  <span aria-hidden className="my-1 h-6 w-px bg-[var(--border-default)]" />
                )}
              </div>
              <p className={`text-[15px] ${done ? "font-semibold text-ink" : "text-ink-muted"}`}>
                {t.label}
                {t.key === "shipped" && done && order.trackingNo && (
                  <span className="block text-xs font-normal text-ink-secondary">
                    Takip no: <span className="price">{order.trackingNo}</span>
                  </span>
                )}
                {t.key === "completed" && !done && (
                  <span className="block text-xs font-normal text-ink-muted">
                    Teslimattan sonra onaylarsın; 7 gün içinde onaylamazsan otomatik onaylanır.
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ol>

      {/* The stored contract (07.4 TransparencySnapshot) */}
      <section className="mt-10 rounded-lg border border-line bg-surface">
        <div className="flex items-center gap-4 border-b border-line p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0] ?? ""} alt={order.listing.title} width={96} height={72} className="rounded-md bg-subtle" />
          <div>
            <p className="font-semibold text-ink">{order.listing.title}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-secondary">
              {conditionLabel(snap.condition)} <GradeBadge grade={snap.grade} />
            </p>
          </div>
        </div>
        <dl className="space-y-2 p-4 text-sm">
          <Row label="Neden indirimliydi" value={snap.whyDiscounted} />
          <Row label="Garanti" value={snap.warrantyText} />
          <Row label="Ürün" value={formatPrice(order.itemPriceKurus)} price />
          <Row label="Kargo" value={formatPrice(order.shippingKurus)} price />
          <Row label="Toplam" value={formatPrice(order.totalKurus)} price strong />
        </dl>
        <p className="border-t border-line px-4 py-3 text-xs text-ink-muted">
          Bu kart, satın aldığın andaki ilanın değişmez kaydıdır. Kapına gelen
          ürün bu karta uymuyorsa iade kargosu bizden.
        </p>
      </section>

      {/* 05.6 — confirm delivery + the one-question grade check */}
      {order.status === "shipped" && (
        <section className="mt-8 rounded-lg border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Ürün eline ulaştı mı?</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Onayladığında ödeme satıcıya aktarılır.
          </p>
          <form action={confirmDelivery} className="mt-4 space-y-4">
            <input type="hidden" name="orderId" value={order.id} />
            <fieldset>
              <legend className="text-sm font-semibold text-ink">
                Ürün, ilandaki Grade&apos;ine uygun çıktı mı?
              </legend>
              <div className="mt-2 flex gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm text-ink has-checked:border-transparent has-checked:bg-inverse has-checked:text-ink-inverse">
                  <input type="radio" name="gradeMatched" value="yes" required className="sr-only" />
                  Evet
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm text-ink has-checked:border-transparent has-checked:bg-inverse has-checked:text-ink-inverse">
                  <input type="radio" name="gradeMatched" value="no" required className="sr-only" />
                  Hayır
                </label>
              </div>
            </fieldset>
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse"
            >
              Teslim aldım, onayla
            </button>
          </form>
        </section>
      )}

      {order.status === "completed" && order.gradeMatched === false && (
        <p className="mt-6 rounded-md border border-amber-600/40 bg-subtle px-4 py-3 text-sm text-ink-secondary">
          Grade uyumsuzluğu bildirdin — kaydedildi. Yapılandırılmış iade/itiraz
          akışı (10.3) bağlandığında buradan devam edeceksin.
        </p>
      )}

      <p className="mt-6 rounded-md border border-line bg-subtle px-4 py-3 text-sm text-ink-secondary">
        Ödeme simülasyon modunda alındı — PSP entegrasyonu bağlandığında bu
        adımda gerçek tahsilat ve escrow çalışacak.
      </p>

      <Link href="/" className="mt-8 inline-block text-sm text-ink-secondary hover:text-ink">
        ← Alışverişe devam et
      </Link>
    </div>
  );
}

function Row({
  label,
  value,
  price,
  strong,
}: {
  label: string;
  value: string;
  price?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`text-right ${price ? "price" : ""} ${strong ? "font-semibold text-ink" : "text-ink-secondary"}`}>
        {value}
      </dd>
    </div>
  );
}
