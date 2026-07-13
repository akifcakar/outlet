import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveHold } from "@/lib/checkout";
import { startCheckout, submitOrder } from "@/lib/checkout-actions";
import { readSessionId } from "@/lib/session";
import { TransparencyCard } from "@/components/TransparencyCard";
import { HoldCountdown } from "@/components/HoldCountdown";
import { formatPrice } from "@/lib/format";

// 05.5 — zero-surprise payment. The order summary and the Şeffaflık Kartı are
// visible while paying; nothing new appears here except delivery + payment.
// No upsells, ever. Payment capture is SIMULATED until the PSP lands.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ödeme" };

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps<"/odeme/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const l = await db.listing.findUnique({
    where: { slug },
    include: { photos: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!l) notFound();

  const sid = await readSessionId();
  const hold = sid ? await getActiveHold(l.id, sid) : null;
  const formError = typeof sp.hata === "string" ? sp.hata : null;
  const stateCode = typeof sp.durum === "string" ? sp.durum : null;

  // Honest unavailable states (05.8): sold, taken by someone else, expired.
  if (l.status !== "live" || (!hold && (stateCode === "taken" || stateCode === "not_live"))) {
    return (
      <StateShell title={l.status !== "live" ? "Bu ürün satıldı." : "Şu an başkası için ayrılmış."}>
        <p className="text-sm text-ink-secondary">
          {l.status !== "live"
            ? "Burada işler hızlı olur. Benzer ürünlere göz at — yenisi gelince ilk sen öğren."
            : "Rezervasyon süresi dolarsa ürün yeniden müsait olur. Birkaç dakika içinde tekrar deneyebilirsin."}
        </p>
        <Link href={`/urun/${slug}`} className="mt-6 inline-flex h-11 items-center rounded-md border border-line-strong px-5 text-sm font-semibold text-ink">
          Ürüne geri dön
        </Link>
      </StateShell>
    );
  }

  if (!hold) {
    // No hold (expired, or direct URL visit): offer to reserve — data never lost (05.5).
    return (
      <StateShell title="Rezervasyonun yok ya da süresi doldu.">
        <p className="text-sm text-ink-secondary">
          Ödemeye geçmek için ürünü {`10 dakikalığına`} senin için ayıralım.
        </p>
        <form action={startCheckout.bind(null, slug)} className="mt-6">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse"
          >
            Ürünü ayır ve devam et
          </button>
        </form>
      </StateShell>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-ink">Ödeme</h1>
      <div className="mt-2">
        <HoldCountdown expiresAt={hold.expiresAt.toISOString()} />
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {/* Delivery form (step 1+3 merged for MVP: address + confirm) */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-ink">Teslimat</h2>
          {formError && (
            <p role="alert" className="mb-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
              {formError}
            </p>
          )}
          <form action={submitOrder} className="space-y-4">
            <input type="hidden" name="holdId" value={hold.id} />
            <input type="hidden" name="slug" value={slug} />
            <Field label="E-posta" name="email" type="email" autoComplete="email" placeholder="siparis@ornek.com" />
            <Field label="Ad soyad" name="name" autoComplete="name" placeholder="Ad Soyad" />
            <Field label="Şehir" name="city" autoComplete="address-level2" placeholder="İstanbul" />
            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-ink">
                Teslimat adresi
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                autoComplete="street-address"
                placeholder="Mahalle, sokak, no, daire..."
                className="w-full rounded-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted"
              />
            </div>

            <div className="rounded-md border border-line bg-subtle px-4 py-3 text-sm text-ink-secondary">
              <p className="font-semibold text-ink">Ödeme: simülasyon modu</p>
              <p className="mt-1">
                iyzico entegrasyonu bağlanana kadar kart adımı atlanır; sipariş
                &quot;ödendi&quot; olarak işaretlenir, para hareketi olmaz.
              </p>
            </div>

            <button
              type="submit"
              className="flex h-13 w-full items-center justify-center rounded-md bg-inverse px-6 text-[15px] font-semibold text-ink-inverse transition-transform duration-100 active:scale-[0.98]"
            >
              Öde — {formatPrice(l.priceKurus + l.shippingKurus)}
            </button>
            <p className="text-center text-xs text-ink-muted">
              Ödemen, ürünü teslim alıp onaylayana kadar güvende tutulur.
              Satıcıya ancak sen onayladıktan sonra aktarılır.
            </p>
          </form>
        </section>

        {/* Order summary + the contract (05.5 step 3) */}
        <section className="space-y-5">
          <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.photos[0]?.url ?? ""}
              alt={l.title}
              width={96}
              height={72}
              className="rounded-md bg-subtle"
            />
            <div>
              <p className="font-semibold text-ink">{l.title}</p>
              <p className="price mt-0.5 text-sm text-ink-secondary">
                {formatPrice(l.priceKurus)} + kargo {formatPrice(l.shippingKurus)}
              </p>
            </div>
          </div>
          <TransparencyCard
            condition={l.condition}
            grade={l.grade}
            whyDiscounted={l.whyDiscounted}
            originalPriceKurus={l.originalPriceKurus}
            priceKurus={l.priceKurus}
            warrantyText={l.warrantyText}
            stock={l.stock}
          />
          <p className="text-xs text-ink-muted">
            Onayladığın bu kart, siparişinle birlikte değişmez şekilde saklanır —
            kapına gelen ürün bu karta uymak zorundadır.
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-12 w-full rounded-sm border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted"
      />
    </div>
  );
}

function StateShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-24 text-center md:px-6">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <div className="mt-3">{children}</div>
    </div>
  );
}
