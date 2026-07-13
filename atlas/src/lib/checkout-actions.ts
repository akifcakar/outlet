"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { CheckoutError, holdStock, placeOrder } from "./checkout";
import { ensureSessionId } from "./session";

// Server actions — thin boundary over src/lib/checkout.ts. Validation with
// zod at the boundary (08.4); money/stock decisions never leave the server.

export async function startCheckout(slug: string): Promise<void> {
  const sid = await ensureSessionId();
  const listing = await db.listing.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!listing) redirect("/");

  try {
    await holdStock(listing.id, sid);
  } catch (e) {
    if (e instanceof CheckoutError) {
      // The odeme page renders the honest taken/sold state (05.8).
      redirect(`/odeme/${slug}?durum=${e.code}`);
    }
    throw e;
  }
  redirect(`/odeme/${slug}`);
}

const deliverySchema = z.object({
  holdId: z.string().min(1),
  slug: z.string().min(1),
  email: z.string().email("Geçerli bir e-posta gir."),
  name: z.string().trim().min(2, "Ad soyad gerekli."),
  city: z.string().trim().min(2, "Şehir gerekli."),
  address: z.string().trim().min(10, "Teslimat adresi gerekli."),
});

export async function submitOrder(formData: FormData): Promise<void> {
  const sid = await ensureSessionId();
  const parsed = deliverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const slug = String(formData.get("slug") ?? "");
    const msg = parsed.error.issues[0]?.message ?? "Form eksik.";
    redirect(`/odeme/${slug}?hata=${encodeURIComponent(msg)}`);
  }
  const { holdId, slug, ...delivery } = parsed.data;

  let orderId: string;
  try {
    const order = await placeOrder(holdId, sid, delivery);
    orderId = order.id;
  } catch (e) {
    if (e instanceof CheckoutError) redirect(`/odeme/${slug}?durum=${e.code}`);
    throw e;
  }
  redirect(`/siparis/${orderId}`);
}
