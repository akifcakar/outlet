"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { readSessionId } from "./session";
import { getCurrentSeller } from "./seller-session";
import { getOpsActor } from "./ops-session";
import { DISPUTE_REASONS } from "./vocab";

// 10.3 — the dispute SOP. Judged against the TransparencySnapshot, structured
// flow only. Money rule (08.3): order status changes only here and only along
// 07.4's edges; every decision writes AuditLog.

const STRIKE_MONTHS = 12; // 10.4: strikes expire after 12 months
const STRIKES_TO_SUSPEND = 3;

function audit(actor: string, action: string, entityType: string, entityId: string, detail?: string) {
  return db.auditLog.create({
    data: { actor, action, entityType, entityId, detail: detail ?? null },
  });
}

// --- Buyer: open (until auto-confirm; MVP: while shipped) ---

const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function openDispute(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId"));
  const reason = String(formData.get("reason") ?? "");
  const statement = String(formData.get("statement") ?? "").trim();
  const sid = await readSessionId();
  if (!sid) redirect(`/siparis/${orderId}`);

  const back = (msg: string) =>
    redirect(`/siparis/${orderId}/itiraz?sebep=${encodeURIComponent(reason)}&hata=${encodeURIComponent(msg)}`);

  const order = await db.order.findFirst({
    where: { id: orderId, guestSessionId: sid, status: "shipped" },
    include: { dispute: true },
  });
  if (!order || order.dispute) redirect(`/siparis/${orderId}`);

  if (!(reason in DISPUTE_REASONS)) back("Bir sebep seç.");
  if (statement.length < 15 && reason !== "withdrawal_14day")
    back("Sorunu birkaç cümleyle anlat — kararı bu anlatım ve fotoğraflar belirler.");

  // Photo evidence (10.3: "not as described" claims require photos).
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (reason === "not_as_described" && files.length === 0)
    back("Bu sebep için fotoğraf zorunlu — sorunu gösteren en az 1 fotoğraf ekle.");

  const urls: string[] = [];
  if (files.length > 0) {
    const dir = path.join(process.cwd(), "public", "uploads", "itiraz", order.id);
    await fs.mkdir(dir, { recursive: true });
    for (const file of files) {
      const ext = PHOTO_TYPES[file.type];
      if (!ext || file.size > MAX_PHOTO_BYTES) continue;
      const name = `${crypto.randomUUID()}.${ext}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
      urls.push(`/uploads/itiraz/${order.id}/${name}`);
    }
  }

  // dispute_open freezes the confirm path (07.4) — state guard in the update.
  const flipped = await db.order.updateMany({
    where: { id: order.id, status: "shipped" },
    data: { status: "dispute_open" },
  });
  if (flipped.count === 1) {
    await db.dispute.create({
      data: {
        orderId: order.id,
        reason,
        buyerStatement: statement || "Cayma hakkı — sebep gerekmiyor.",
        photoUrls: JSON.stringify(urls),
      },
    });
    await audit(`buyer:${sid.slice(0, 8)}`, "dispute.open", "Order", order.id, reason);
  }
  revalidatePath(`/siparis/${order.id}`);
  redirect(`/siparis/${order.id}`);
}

// --- Seller: respond within 48h (10.3) ---

export async function respondDispute(formData: FormData): Promise<void> {
  const disputeId = String(formData.get("disputeId"));
  const response = String(formData.get("response") ?? "").trim();
  const seller = await getCurrentSeller();
  if (!seller) redirect("/satici");
  if (response.length < 10) {
    redirect(`/satici?hata=${encodeURIComponent("Yanıt en az bir cümle olmalı.")}`);
  }

  const dispute = await db.dispute.findFirst({
    where: { id: disputeId, status: "open", order: { sellerId: seller.id } },
  });
  if (dispute) {
    await db.dispute.update({
      where: { id: dispute.id },
      data: { sellerResponse: response, respondedAt: new Date() },
    });
    await audit(`seller:${seller.id}`, "dispute.respond", "Order", dispute.orderId);
  }
  revalidatePath("/satici");
  redirect("/satici");
}

// --- Ops: resolve (refund | release), misgrade strike, auto-suspend ---

export async function resolveDispute(formData: FormData): Promise<void> {
  const actor = await getOpsActor();
  if (!actor) redirect("/ops");

  const disputeId = String(formData.get("disputeId"));
  const resolution = String(formData.get("resolution") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const misgrade = formData.get("misgrade") === "1";

  if (resolution !== "refund" && resolution !== "release") {
    redirect(`/ops/itiraz?hata=${encodeURIComponent("Karar seç: iade ya da satıcıya aktarım.")}`);
  }
  if (note.length < 15) {
    redirect(`/ops/itiraz?hata=${encodeURIComponent("Karar açıklaması zorunlu — alıcı ve satıcı bunu okuyacak (10.3: kararlar güven anıdır).")}`);
  }

  const dispute = await db.dispute.findFirst({
    where: { id: disputeId, status: "open" },
    include: { order: true },
  });
  if (!dispute) redirect("/ops/itiraz");

  // 10.3: cayma is always accepted — release is not a legal option for it.
  if (dispute.reason === "withdrawal_14day" && resolution === "release") {
    redirect(`/ops/itiraz?hata=${encodeURIComponent("Cayma hakkı yasa gereği her zaman kabul edilir — iade dışında karar verilemez (11).")}`);
  }

  await db.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: dispute.id },
      data: { status: "resolved", resolution, resolutionNote: note, resolvedAt: new Date() },
    });
    // refund: money back (simulated until PSP) — refunded is terminal.
    // release: item matched the snapshot; escrow to seller = completed.
    await tx.order.update({
      where: { id: dispute.orderId },
      data:
        resolution === "refund"
          ? { status: "refunded" }
          : { status: "completed", completedAt: new Date() },
    });
  });
  await audit(actor, `dispute.${resolution}`, "Order", dispute.orderId, note);

  // 10.4: confirmed misgrade → strike; 3 active strikes → suspension.
  if (resolution === "refund" && misgrade) {
    const sellerId = dispute.order.sellerId;
    await db.strike.create({
      data: {
        sellerId,
        reason: "misgraded_item",
        orderId: dispute.orderId,
        detail: note,
        expiresAt: new Date(Date.now() + STRIKE_MONTHS * 30 * 864e5),
      },
    });
    await audit(actor, "seller.strike", "Seller", sellerId, `misgraded_item — sipariş ${dispute.orderId}`);

    const active = await db.strike.count({
      where: { sellerId, expiresAt: { gt: new Date() } },
    });
    if (active >= STRIKES_TO_SUSPEND) {
      const { count } = await db.seller.updateMany({
        where: { id: sellerId, status: "approved" },
        data: { status: "suspended" },
      });
      if (count === 1) {
        const pulled = await db.listing.updateMany({
          where: { sellerId, status: "live" },
          data: { status: "removed" },
        });
        await audit(actor, "seller.suspend", "Seller", sellerId, `${active} aktif strike — otomatik askı (10.4). ${pulled.count} canlı ilan kaldırıldı.`);
        revalidatePath("/");
      }
    }
  }

  revalidatePath("/ops/itiraz");
  redirect("/ops/itiraz");
}
