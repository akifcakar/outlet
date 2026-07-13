"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./db";
import { clearSessionId, ensureSessionId, readSessionId } from "./session";

// Alert CRUD (05.6) + KVKK self-service (02: export and deletion are
// self-service from day one). Everything is keyed to the guest session;
// real accounts inherit these rows at claim time (07.1).

const MAX_ALERTS_PER_SESSION = 20; // hoarding guard (08.4 rate-limit spirit)

const createSchema = z
  .object({
    q: z.string().trim().max(80).optional(),
    categoryId: z.string().optional(),
    maxPrice: z.coerce.number().int().positive().optional(),
    donus: z.string().optional(), // return path
  })
  .refine((v) => (v.q && v.q.length >= 2) || v.categoryId || v.maxPrice, {
    message: "Alarm en az bir şey söylemeli: arama, kategori ya da fiyat üstü.",
  });

export async function createAlert(formData: FormData): Promise<void> {
  const sid = await ensureSessionId();
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string" && v !== ""),
  );
  const back = typeof raw.donus === "string" && raw.donus.startsWith("/") ? raw.donus : "/hesap";

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Alarm kurulamadı.";
    redirect(`${back}${back.includes("?") ? "&" : "?"}hata=${encodeURIComponent(msg)}`);
  }
  const v = parsed.data;

  const count = await db.savedSearch.count({ where: { sessionId: sid } });
  if (count >= MAX_ALERTS_PER_SESSION) {
    redirect(`/hesap?hata=${encodeURIComponent("Alarm sınırına ulaştın — birini silip tekrar dene.")}`);
  }

  // Same alert twice is a no-op, not a duplicate row.
  const existing = await db.savedSearch.findFirst({
    where: {
      sessionId: sid,
      queryText: v.q ?? null,
      categoryId: v.categoryId ?? null,
      maxPriceKurus: v.maxPrice ? v.maxPrice * 100 : null,
    },
  });
  if (!existing) {
    await db.savedSearch.create({
      data: {
        sessionId: sid,
        queryText: v.q ?? null,
        categoryId: v.categoryId ?? null,
        maxPriceKurus: v.maxPrice ? v.maxPrice * 100 : null,
      },
    });
  } else if (!existing.active) {
    await db.savedSearch.update({ where: { id: existing.id }, data: { active: true } });
  }
  revalidatePath("/hesap");
  redirect(`/hesap?alarm=kuruldu`);
}

async function requireOwnAlert(alertId: string) {
  const sid = await readSessionId();
  if (!sid) redirect("/hesap");
  const alert = await db.savedSearch.findFirst({ where: { id: alertId, sessionId: sid } });
  if (!alert) redirect("/hesap");
  return alert;
}

export async function toggleAlert(alertId: string): Promise<void> {
  const alert = await requireOwnAlert(alertId);
  await db.savedSearch.update({
    where: { id: alert.id },
    data: { active: !alert.active },
  });
  revalidatePath("/hesap");
  redirect("/hesap");
}

export async function deleteAlert(alertId: string): Promise<void> {
  const alert = await requireOwnAlert(alertId);
  await db.notification.deleteMany({ where: { savedSearchId: alert.id } });
  await db.savedSearch.delete({ where: { id: alert.id } });
  revalidatePath("/hesap");
  redirect("/hesap");
}

export async function markAllRead(): Promise<void> {
  const sid = await readSessionId();
  if (sid) {
    await db.notification.updateMany({
      where: { sessionId: sid, readAt: null },
      data: { readAt: new Date() },
    });
  }
  revalidatePath("/hesap");
  redirect("/hesap");
}

/**
 * KVKK erasure (07.8 / 11): personal data goes, financial records stay.
 * Orders are anonymized (address snapshot cleared, buyer detached from the
 * session), alerts and notifications are deleted, the session cookie dies.
 */
export async function deleteMyData(): Promise<void> {
  const sid = await readSessionId();
  if (sid) {
    const orders = await db.order.findMany({ where: { guestSessionId: sid } });
    for (const o of orders) {
      await db.order.update({
        where: { id: o.id },
        data: { deliveryAddress: JSON.stringify({ erased: true }), guestSessionId: null },
      });
      // Anonymize the buyer row unless other sessions' orders still use it.
      const others = await db.order.count({
        where: { buyerId: o.buyerId, guestSessionId: { not: null } },
      });
      if (others === 0) {
        await db.user.update({
          where: { id: o.buyerId },
          data: { email: `silindi-${o.buyerId}@anon.atlas`, name: null },
        });
      }
    }
    await db.notification.deleteMany({ where: { sessionId: sid } });
    await db.savedSearch.deleteMany({ where: { sessionId: sid } });
    await db.stockHold.updateMany({
      where: { userId: sid, status: "active" },
      data: { status: "released" },
    });
    await db.auditLog.create({
      data: { actor: "system:kvkk", action: "session.erase", entityType: "Session", entityId: sid },
    });
    await clearSessionId();
  }
  redirect("/?veri=silindi");
}
