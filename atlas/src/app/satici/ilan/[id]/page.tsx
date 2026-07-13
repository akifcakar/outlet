import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentSeller } from "@/lib/seller-session";
import {
  deletePhoto,
  publishListing,
  saveStep,
  uploadPhotos,
} from "@/lib/seller-actions";
import { CONDITIONS, GRADES } from "@/lib/vocab";
import { formatPrice, savingsPercent } from "@/lib/format";
import { TransparencyCard } from "@/components/TransparencyCard";
import { GradeBadge } from "@/components/ui/GradeBadge";

// 06.3 — the listing wizard: photo-first, one step per screen, draft
// auto-saved on every step, the grading guide inside the flow, and a full
// buyer-eye preview before publish. Target: under 3 minutes on a phone.

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Yeni ilan" };

const STEP_TITLES = [
  "Fotoğraflar",
  "Ürün bilgisi",
  "Durum — ürüne ne oldu?",
  "Grade — şu an ne halde?",
  "Neden indirimli?",
  "Fiyat",
  "Önizle ve yayınla",
];

export default async function ListingWizard({
  params,
  searchParams,
}: PageProps<"/satici/ilan/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const seller = await getCurrentSeller();
  if (!seller) redirect("/satici");

  const listing = await db.listing.findFirst({
    where: { id, sellerId: seller.id },
    include: {
      photos: { orderBy: { position: "asc" } },
      brand: true,
      category: true,
    },
  });
  if (!listing) notFound();
  if (listing.status !== "draft") redirect(`/urun/${listing.slug}`);

  const step = Math.min(Math.max(Number(sp.adim) || 1, 1), 7);
  const error = typeof sp.hata === "string" ? sp.hata : null;
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  const normalPhotos = listing.photos.filter((p) => !p.isFlaw);
  const flawPhotos = listing.photos.filter((p) => p.isFlaw);
  const needsFlawPhotos = listing.grade === "B" || listing.grade === "C";

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 md:px-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-ink-muted">Adım {step}/7</p>
        <Link href="/satici" className="text-sm text-ink-secondary hover:text-ink">
          Kaydet ve çık
        </Link>
      </div>
      <h1 className="mt-1 text-2xl font-semibold text-ink">{STEP_TITLES[step - 1]}</h1>

      {/* progress bar */}
      <div aria-hidden className="mt-4 h-1 w-full rounded-full bg-subtle">
        <div
          className="h-1 rounded-full bg-inverse transition-all duration-300"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-md border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-transparent">
          {error}
        </p>
      )}

      <div className="mt-6">
        {step === 1 && (
          <section className="space-y-4">
            <p className="text-sm text-ink-secondary">
              Parlak ışık, sade arka plan, gerçek fotoğraf. En az 3 fotoğraf —
            ön, arka ve etiket/seri no önerilir.
            </p>
            <PhotoGrid photos={normalPhotos} listingId={listing.id} />
            <form action={uploadPhotos} className="space-y-3">
              <input type="hidden" name="listingId" value={listing.id} />
              <input
                type="file"
                name="photos"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-md file:border-0 file:bg-inverse file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ink-inverse"
              />
              <button type="submit" className="h-11 rounded-md border border-line-strong px-5 text-sm font-semibold text-ink">
                Fotoğrafları yükle
              </button>
            </form>
            <StepNav listingId={listing.id} step={step} nextDisabled={normalPhotos.length < 1} />
          </section>
        )}

        {step === 2 && (
          <form action={saveStep} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="step" value="2" />
            <SelectField label="Kategori" name="categoryId" defaultValue={listing.categoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            <SelectField label="Marka" name="brandId" defaultValue={listing.brandId}
              options={brands.map((b) => ({ value: b.id, label: b.name }))} />
            <TextField label="Başlık" name="title" defaultValue={listing.title} placeholder="Dyson V15 Detect Absolute" />
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-ink">Açıklama</label>
              <textarea id="description" name="description" rows={4} required defaultValue={listing.description}
                placeholder="Ürünün özellikleri, kutu içeriği, aksesuarlar..."
                className="w-full rounded-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted" />
            </div>
            <StepNav listingId={listing.id} step={step} submit />
          </form>
        )}

        {step === 3 && (
          <form action={saveStep} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="step" value="3" />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CONDITIONS).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-3 py-3 text-sm text-ink has-checked:border-transparent has-checked:bg-inverse has-checked:text-ink-inverse">
                  <input type="radio" name="condition" value={key} defaultChecked={listing.condition === key} required className="sr-only" />
                  {label}
                </label>
              ))}
            </div>
            <StepNav listingId={listing.id} step={step} submit />
          </form>
        )}

        {step === 4 && (
          <section className="space-y-5">
            <form action={saveStep} className="space-y-3">
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="step" value="4" />
              {(Object.entries(GRADES) as [string, string][]).map(([g, desc]) => (
                <label key={g} className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 has-checked:border-[var(--border-strong)] has-checked:shadow-[var(--shadow-card-hover)]">
                  <input type="radio" name="grade" value={g} defaultChecked={listing.grade === g} required className="mt-1" />
                  <span>
                    <span className="font-semibold text-ink">Grade {g}</span>
                    <span className="block text-sm text-ink-secondary">{desc}</span>
                  </span>
                </label>
              ))}
              <p className="text-xs text-ink-muted">
                Doğru Grade&apos;lenen ürün daha hızlı satılır ve geri gelmez.
                Yanlış Grade iade kargosu + skor kaybı demektir.
              </p>
              <StepNav listingId={listing.id} step={step} submit />
            </form>

            {needsFlawPhotos && (
              <div className="rounded-lg border border-line bg-subtle p-4">
                <h2 className="text-sm font-semibold text-ink">
                  Kusur fotoğrafları {flawPhotos.length > 0 && `(${flawPhotos.length})`}
                </h2>
                <p className="mt-1 text-xs text-ink-secondary">
                  Grade {listing.grade} seçtin: her kusuru yakın çekim fotoğrafla.
                  Alıcı, görebildiğine güvenir.
                </p>
                <PhotoGrid photos={flawPhotos} listingId={listing.id} />
                <form action={uploadPhotos} className="mt-3 space-y-2">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="isFlaw" value="1" />
                  <input name="flawLabel" placeholder='Kusur etiketi — örn. "Sol yanda ince çizik"' required
                    className="h-10 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted" />
                  <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" required
                    className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-md file:border-0 file:bg-inverse file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ink-inverse" />
                  <button type="submit" className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink">
                    Kusur fotoğrafı ekle
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {step === 5 && (
          <form action={saveStep} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="step" value="5" />
            <div className="rounded-md border border-line bg-subtle px-4 py-3 text-sm">
              <p className="text-ink-secondary">✗ &quot;Fırsat ürünü!&quot;</p>
              <p className="mt-1 font-semibold text-ink">✓ &quot;3 ay mağazamızda teşhirde kaldı.&quot;</p>
            </div>
            <div>
              <label htmlFor="whyDiscounted" className="mb-1.5 block text-sm font-semibold text-ink">
                Bu ürün neden indirimli?
              </label>
              <textarea id="whyDiscounted" name="whyDiscounted" rows={3} required defaultValue={listing.whyDiscounted}
                placeholder="Gerçek sebebi yaz — alıcı bunu ilanda görecek."
                className="w-full rounded-sm border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted" />
            </div>
            <StepNav listingId={listing.id} step={step} submit />
          </form>
        )}

        {step === 6 && (
          <form action={saveStep} className="space-y-4">
            <input type="hidden" name="listingId" value={listing.id} />
            <input type="hidden" name="step" value="6" />
            <TextField label="Orijinal fiyat (₺)" name="originalPrice" type="number"
              defaultValue={listing.originalPriceKurus > 0 ? String(listing.originalPriceKurus / 100) : ""} placeholder="12999" />
            <TextField label="Atlas fiyatı (₺)" name="price" type="number"
              defaultValue={listing.priceKurus > 0 ? String(listing.priceKurus / 100) : ""} placeholder="7499" />
            <TextField label="Garanti" name="warrantyText" defaultValue={listing.warrantyText} placeholder="12 ay ithalatçı garantisi" />
            <p className="text-xs text-ink-muted">
              Orijinal fiyat doğrulanabilir olmalı — sahte indirim ilan kaldırma sebebi.
            </p>
            <StepNav listingId={listing.id} step={step} submit />
          </form>
        )}

        {step === 7 && (
          <section className="space-y-6">
            <form action={saveStep} className="space-y-4">
              <input type="hidden" name="listingId" value={listing.id} />
              <input type="hidden" name="step" value="7" />
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Stok" name="stock" type="number" defaultValue={String(listing.stock)} />
                <TextField label="Hazırlık (gün)" name="handlingDays" type="number" defaultValue={String(listing.handlingDays)} />
                <TextField label="Kargo (₺)" name="shipping" type="number" defaultValue={String(listing.shippingKurus / 100)} />
              </div>
              <button type="submit" className="h-10 rounded-md border border-line-strong px-4 text-sm font-semibold text-ink">
                Kaydet
              </button>
            </form>

            {/* Buyer-eye preview: the seller approves their own Şeffaflık Kartı (06.3) */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-ink">
                Alıcının göreceği kart:
              </h2>
              {listing.priceKurus > 0 && listing.condition && listing.grade ? (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                    {listing.title || "(Başlık yok)"} <GradeBadge grade={listing.grade} />
                    <span className="price font-normal text-ink-secondary">
                      {formatPrice(listing.priceKurus)} (–%{savingsPercent(listing.originalPriceKurus, listing.priceKurus)})
                    </span>
                  </p>
                  <TransparencyCard
                    condition={listing.condition}
                    grade={listing.grade}
                    whyDiscounted={listing.whyDiscounted}
                    originalPriceKurus={listing.originalPriceKurus}
                    priceKurus={listing.priceKurus}
                    warrantyText={listing.warrantyText}
                    stock={listing.stock}
                  />
                </div>
              ) : (
                <p className="rounded-md border border-line bg-subtle px-4 py-3 text-sm text-ink-secondary">
                  Önizleme için önceki adımları tamamla.
                </p>
              )}
            </div>

            <form action={publishListing.bind(null, listing.id)}>
              <button
                type="submit"
                className="flex h-13 w-full items-center justify-center rounded-md bg-inverse px-6 text-[15px] font-semibold text-ink-inverse transition-transform duration-100 active:scale-[0.98]"
              >
                Yayınla
              </button>
            </form>
            <StepNav listingId={listing.id} step={step} />
          </section>
        )}
      </div>
    </div>
  );
}

// --- small local pieces ---

function StepNav({
  listingId,
  step,
  submit,
  nextDisabled,
}: {
  listingId: string;
  step: number;
  submit?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {step > 1 ? (
        <Link href={`/satici/ilan/${listingId}?adim=${step - 1}`} className="text-sm text-ink-secondary hover:text-ink">
          ← Geri
        </Link>
      ) : (
        <span />
      )}
      {step < 7 &&
        (submit ? (
          <button type="submit" className="inline-flex h-11 items-center rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse">
            Devam →
          </button>
        ) : nextDisabled ? (
          <span className="inline-flex h-11 cursor-not-allowed items-center rounded-md border border-line px-6 text-sm font-semibold text-ink-muted">
            Devam →
          </span>
        ) : (
          <Link href={`/satici/ilan/${listingId}?adim=${step + 1}`} className="inline-flex h-11 items-center rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse">
            Devam →
          </Link>
        ))}
    </div>
  );
}

function PhotoGrid({
  photos,
  listingId,
}: {
  photos: { id: string; url: string; flawLabel: string | null }[];
  listingId: string;
}) {
  if (photos.length === 0) return null;
  return (
    <ul className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        <li key={p.id} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt={p.flawLabel ?? "Ürün fotoğrafı"} width={200} height={150}
            className="aspect-[4/3] w-full rounded-md border border-line object-cover" />
          {p.flawLabel && (
            <span className="mt-0.5 block truncate text-[11px] text-ink-muted">{p.flawLabel}</span>
          )}
          <form action={deletePhoto.bind(null, p.id, listingId)} className="absolute right-1 top-1">
            <button type="submit" aria-label="Fotoğrafı sil"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-inverse text-xs text-ink-inverse">
              ×
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

function TextField({
  label, name, type = "text", defaultValue, placeholder,
}: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <input id={name} name={name} type={type} required defaultValue={defaultValue} placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="h-12 w-full rounded-sm border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted" />
    </div>
  );
}

function SelectField({
  label, name, defaultValue, options,
}: {
  label: string; name: string; defaultValue: string; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <select id={name} name={name} required defaultValue={defaultValue}
        className="h-12 w-full rounded-sm border border-line bg-surface px-3 text-[15px] text-ink">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
