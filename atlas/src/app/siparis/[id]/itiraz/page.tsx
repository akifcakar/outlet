import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { readSessionId } from "@/lib/session";
import { openDispute } from "@/lib/dispute-actions";
import { DISPUTE_REASONS } from "@/lib/vocab";
import { GradeBadge } from "@/components/ui/GradeBadge";

// 10.3 — the structured dispute entry. Lives on the order, not in a help
// maze (05.6). One screen: reason (with its promise), statement, photos.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Siparişte sorun bildir" };

export default async function DisputePage({
  params,
  searchParams,
}: PageProps<"/siparis/[id]/itiraz">) {
  const { id } = await params;
  const sp = await searchParams;
  const preselect = typeof sp.sebep === "string" ? sp.sebep : null;
  const error = typeof sp.hata === "string" ? sp.hata : null;

  const sid = await readSessionId();
  const order = await db.order.findUnique({
    where: { id },
    include: { listing: true, snapshot: true, dispute: true },
  });
  if (!order || !sid || order.guestSessionId !== sid) notFound();
  if (order.dispute || order.status !== "shipped") {
    // Already disputed or not in a disputable state — the order page explains.
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 md:px-6">
        <h1 className="text-2xl font-semibold text-ink">Bu sipariş için itiraz açılamıyor.</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          {order.dispute
            ? "Bu siparişte zaten açık ya da sonuçlanmış bir itiraz var."
            : "İtiraz, kargoya verilmiş ve henüz tamamlanmamış siparişler için açılabilir."}
        </p>
        <Link href={`/siparis/${order.id}`} className="mt-6 inline-block text-sm font-semibold text-ink underline underline-offset-2">
          ← Siparişe dön
        </Link>
      </div>
    );
  }

  const snap = order.snapshot!;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 md:px-6">
      <Link href={`/siparis/${order.id}`} className="text-sm text-ink-secondary hover:text-ink">
        ← Siparişe dön
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Siparişte sorun bildir</h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
        {order.listing.title} <GradeBadge grade={snap.grade} />
      </p>
      <p className="mt-3 rounded-md border border-line bg-subtle px-4 py-3 text-sm text-ink-secondary">
        İtirazın, satın aldığın andaki ilan kaydına (Şeffaflık Kartı) göre
        değerlendirilir. Satıcının 48 saat yanıt hakkı var; kararı Atlas verir
        ve gerekçesiyle açıklar. Ödemen karar verilene kadar güvende kalır.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      <form action={openDispute} className="mt-6 space-y-5">
        <input type="hidden" name="orderId" value={order.id} />

        <fieldset>
          <legend className="text-sm font-semibold text-ink">Sorun ne?</legend>
          <div className="mt-2 space-y-2">
            {Object.entries(DISPUTE_REASONS).map(([key, r]) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 has-checked:border-[var(--border-strong)] has-checked:shadow-[var(--shadow-card-hover)]"
              >
                <input
                  type="radio"
                  name="reason"
                  value={key}
                  required
                  defaultChecked={preselect === key}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold text-ink">{r.label}</span>
                  <span className="block text-sm text-ink-secondary">{r.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="statement" className="mb-1.5 block text-sm font-semibold text-ink">
            Ne oldu? (cayma için zorunlu değil)
          </label>
          <textarea
            id="statement"
            name="statement"
            rows={4}
            placeholder="Örn. ilanda Grade B yazıyordu ama ön yüzde fotoğraflarda olmayan derin bir çizik var."
            className="w-full rounded-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted"
          />
        </div>

        <div>
          <label htmlFor="photos" className="mb-1.5 block text-sm font-semibold text-ink">
            Fotoğraflar
          </label>
          <p className="mb-2 text-xs text-ink-muted">
            &quot;Ürün ilana uymuyor&quot; için zorunlu; kargo hasarında ambalajı da çek.
          </p>
          <input
            id="photos"
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-md file:border-0 file:bg-inverse file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ink-inverse"
          />
        </div>

        <button
          type="submit"
          className="flex h-13 w-full items-center justify-center rounded-md bg-inverse px-6 text-[15px] font-semibold text-ink-inverse transition-transform duration-100 active:scale-[0.98]"
        >
          İtirazı aç
        </button>
        <p className="text-center text-xs text-ink-muted">
          Hedef: açılıştan itibaren en geç 7 günde kesin karar (10.3).
        </p>
      </form>
    </div>
  );
}
