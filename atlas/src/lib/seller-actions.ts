"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { getCurrentSeller, setCurrentSeller } from "./seller-session";
import { CONDITIONS } from "./vocab";

// Seller-side actions — the listing wizard (06.3) + fulfillment (06.4).
// Every action re-checks ownership server-side (08.4: never trust the client).

async function requireSeller() {
  const seller = await getCurrentSeller();
  if (!seller) redirect("/satici");
  return seller;
}

async function requireOwnListing(listingId: string) {
  const seller = await requireSeller();
  const listing = await db.listing.findFirst({
    where: { id: listingId, sellerId: seller.id },
    include: { photos: { orderBy: { position: "asc" } } },
  });
  if (!listing) redirect("/satici");
  return { seller, listing };
}

/** Dev seller picker (see seller-session.ts). */
export async function selectSeller(sellerId: string): Promise<void> {
  const seller = await db.seller.findUnique({ where: { id: sellerId } });
  if (seller) await setCurrentSeller(seller.id);
  redirect("/satici");
}

/** Wizard entry: create a draft, resume-safe from the first step (06.3). */
export async function createDraft(): Promise<void> {
  const seller = await requireSeller();
  const firstCategory = await db.category.findFirstOrThrow();
  const firstBrand = await db.brand.findFirstOrThrow();
  const draft = await db.listing.create({
    data: {
      slug: `taslak-${crypto.randomUUID().slice(0, 8)}`,
      sellerId: seller.id,
      categoryId: firstCategory.id,
      brandId: firstBrand.id,
      title: "",
      description: "",
      condition: "",
      grade: "",
      whyDiscounted: "",
      originalPriceKurus: 0,
      priceKurus: 0,
      warrantyText: "",
      status: "draft",
    },
  });
  redirect(`/satici/ilan/${draft.id}?adim=1`);
}

// --- Photo handling (dev: local public/uploads; prod: CDN pipeline, 08) ---

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function uploadPhotos(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listingId"));
  const isFlaw = formData.get("isFlaw") === "1";
  const flawLabel = String(formData.get("flawLabel") ?? "").trim() || null;
  const { listing } = await requireOwnListing(listingId);

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const dir = path.join(process.cwd(), "public", "uploads", listing.id);
  await fs.mkdir(dir, { recursive: true });

  let position = listing.photos.length;
  for (const file of files) {
    const ext = PHOTO_TYPES[file.type];
    if (!ext || file.size > MAX_PHOTO_BYTES) continue; // validated, silently skipped ones surface via count
    const name = `${crypto.randomUUID()}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    await db.listingPhoto.create({
      data: {
        listingId: listing.id,
        position: position++,
        url: `/uploads/${listing.id}/${name}`,
        width: 800,
        height: 600,
        isFlaw,
        flawLabel: isFlaw ? flawLabel : null,
      },
    });
  }
  revalidatePath(`/satici/ilan/${listing.id}`);
  redirect(`/satici/ilan/${listing.id}?adim=${isFlaw ? 4 : 1}`);
}

export async function deletePhoto(photoId: string, listingId: string): Promise<void> {
  const { listing } = await requireOwnListing(listingId);
  const photo = listing.photos.find((p) => p.id === photoId);
  if (photo) {
    await db.listingPhoto.delete({ where: { id: photo.id } });
    await fs.rm(path.join(process.cwd(), "public", photo.url), { force: true });
  }
  redirect(`/satici/ilan/${listing.id}?adim=${photo?.isFlaw ? 4 : 1}`);
}

// --- Step saves (one action, per-step schema; draft auto-persists, 06.3) ---

const stepSchemas = {
  2: z.object({
    categoryId: z.string().min(1),
    brandId: z.string().min(1),
    title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı."),
    description: z.string().trim().min(20, "Açıklama en az 20 karakter olmalı."),
  }),
  3: z.object({
    condition: z.string().refine((c) => c in CONDITIONS, "Durum seç."),
  }),
  4: z.object({ grade: z.enum(["A", "B", "C"], "Grade seç.") }),
  5: z.object({
    whyDiscounted: z
      .string()
      .trim()
      .min(15, 'Gerçek bir sebep yaz — örn. "3 ay mağazamızda teşhirde kaldı."'),
  }),
  6: z
    .object({
      originalPrice: z.coerce.number().int().positive("Orijinal fiyat gerekli."),
      price: z.coerce.number().int().positive("Atlas fiyatı gerekli."),
      warrantyText: z.string().trim().min(3, "Garanti bilgisi gerekli."),
    })
    .refine((v) => v.price < v.originalPrice, {
      message: "Atlas fiyatı orijinal fiyatın altında olmalı — sahte indirim yok.",
    }),
  7: z.object({
    stock: z.coerce.number().int().min(1),
    handlingDays: z.coerce.number().int().min(1).max(7),
    shipping: z.coerce.number().int().min(0),
  }),
} as const;

export async function saveStep(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listingId"));
  const step = Number(formData.get("step"));
  const { listing } = await requireOwnListing(listingId);

  const schema = stepSchemas[step as keyof typeof stepSchemas];
  if (!schema) redirect(`/satici/ilan/${listing.id}?adim=1`);

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Eksik alan var.";
    redirect(`/satici/ilan/${listing.id}?adim=${step}&hata=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data as Record<string, unknown>;

  const data =
    step === 6
      ? {
          originalPriceKurus: (v.originalPrice as number) * 100,
          priceKurus: (v.price as number) * 100,
          warrantyText: v.warrantyText as string,
        }
      : step === 7
        ? {
            stock: v.stock as number,
            handlingDays: v.handlingDays as number,
            shippingKurus: (v.shipping as number) * 100,
          }
        : (v as object);

  await db.listing.update({ where: { id: listing.id }, data });
  redirect(`/satici/ilan/${listing.id}?adim=${Math.min(step + 1, 7)}`);
}

/** Publish gate — the marketplace rules enforced in one place (01/06.3). */
export async function publishListing(listingId: string): Promise<void> {
  const { listing } = await requireOwnListing(listingId);

  const problems: string[] = [];
  const normalPhotos = listing.photos.filter((p) => !p.isFlaw);
  const flawPhotos = listing.photos.filter((p) => p.isFlaw);
  if (normalPhotos.length < 3) problems.push("En az 3 ürün fotoğrafı gerekli.");
  if ((listing.grade === "B" || listing.grade === "C") && flawPhotos.length === 0)
    problems.push("Grade B/C için her kusurun yakın çekim fotoğrafı zorunlu.");
  if (!listing.title || !listing.condition || !listing.grade) problems.push("Adım 2–4 eksik.");
  if (listing.whyDiscounted.length < 15) problems.push("İndirim sebebi eksik (Adım 5).");
  if (listing.priceKurus <= 0 || listing.priceKurus >= listing.originalPriceKurus)
    problems.push("Fiyatlar eksik ya da geçersiz (Adım 6).");

  if (problems.length > 0) {
    redirect(
      `/satici/ilan/${listing.id}?adim=7&hata=${encodeURIComponent(problems.join(" "))}`,
    );
  }

  const slug = `${listing.title
    .toLowerCase()
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİiI]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60)}-${listing.id.slice(-6)}`;

  // Phase 1 puts a curation queue here (submitted → review → live, 10.2).
  // Dev goes straight to live.
  await db.listing.update({
    where: { id: listing.id },
    data: { status: "live", slug, publishedAt: new Date() },
  });
  revalidatePath("/");
  redirect(`/urun/${slug}`);
}

// --- Fulfillment (06.4 orders queue) ---

export async function markShipped(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId"));
  const trackingNo = String(formData.get("trackingNo") ?? "").trim();
  const seller = await requireSeller();

  if (trackingNo.length < 5) {
    redirect(`/satici?hata=${encodeURIComponent("Takip numarası gerekli.")}`);
  }
  // Ownership + state guard in the update itself.
  await db.order.updateMany({
    where: { id: orderId, sellerId: seller.id, status: "paid" },
    data: { status: "shipped", trackingNo, shippedAt: new Date() },
  });
  revalidatePath("/satici");
  redirect("/satici");
}
