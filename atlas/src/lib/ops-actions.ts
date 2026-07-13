"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { enterOpsSession, getOpsActor, leaveOpsSession } from "./ops-session";
import { matchAlertsForListing } from "./alerts";

// Ops actions — curation queue (10.2) + seller vetting (10.1).
// Every decision writes AuditLog (07.6): who, what, on which entity, why.
// Rejections REQUIRE a specific fix — "no" without "how to fix" is banned.

async function requireOps(): Promise<string> {
  const actor = await getOpsActor();
  if (!actor) redirect("/ops");
  return actor;
}

function audit(actor: string, action: string, entityType: string, entityId: string, detail?: string) {
  return db.auditLog.create({
    data: { actor, action, entityType, entityId, detail: detail ?? null },
  });
}

/** Dev ops login (see ops-session.ts — real OpsUser auth replaces this). */
export async function enterOps(): Promise<void> {
  await enterOpsSession();
  redirect("/ops");
}

export async function leaveOps(): Promise<void> {
  await leaveOpsSession();
  redirect("/");
}

// --- Listing curation (10.2) ---

export async function approveListing(listingId: string): Promise<void> {
  const actor = await requireOps();
  // State guard in the update itself: only a submitted listing can go live.
  const { count } = await db.listing.updateMany({
    where: { id: listingId, status: "submitted" },
    data: { status: "live", publishedAt: new Date(), curationNote: null },
  });
  if (count === 1) {
    await audit(actor, "listing.approve", "Listing", listingId, "submitted → live");
    // 07.5: the listing.live event feeds the alert matcher near-real-time.
    // Inline at MVP; the job queue (08) takes over this call site later.
    await matchAlertsForListing(listingId);
    revalidatePath("/");
  }
  revalidatePath("/ops");
  redirect("/ops");
}

export async function rejectListing(formData: FormData): Promise<void> {
  const actor = await requireOps();
  const listingId = String(formData.get("listingId"));
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 10) {
    redirect(`/ops?hata=${encodeURIComponent("Ret sebebi spesifik bir düzeltme içermeli — satıcı bununla düzeltecek.")}`);
  }
  const { count } = await db.listing.updateMany({
    where: { id: listingId, status: "submitted" },
    data: { status: "rejected", curationNote: note },
  });
  if (count === 1) {
    await audit(actor, "listing.reject", "Listing", listingId, note);
  }
  revalidatePath("/ops");
  redirect("/ops");
}

// --- Seller vetting (10.1) ---

export async function approveSeller(sellerId: string): Promise<void> {
  const actor = await requireOps();
  const { count } = await db.seller.updateMany({
    where: { id: sellerId, status: { in: ["applied", "in_review"] } },
    data: { status: "approved", verifiedAt: new Date() },
  });
  if (count === 1) await audit(actor, "seller.approve", "Seller", sellerId);
  revalidatePath("/ops/satici");
  redirect("/ops/satici");
}

export async function declineSeller(formData: FormData): Promise<void> {
  const actor = await requireOps();
  const sellerId = String(formData.get("sellerId"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 10) {
    redirect(`/ops/satici?hata=${encodeURIComponent("Ret sebebi zorunlu — başvurana neden ve yeniden başvuru hakkı bildirilir (10.1).")}`);
  }
  const { count } = await db.seller.updateMany({
    where: { id: sellerId, status: { in: ["applied", "in_review"] } },
    data: { status: "declined" },
  });
  if (count === 1) await audit(actor, "seller.decline", "Seller", sellerId, reason);
  revalidatePath("/ops/satici");
  redirect("/ops/satici");
}

export async function suspendSeller(formData: FormData): Promise<void> {
  const actor = await requireOps();
  const sellerId = String(formData.get("sellerId"));
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 10) {
    redirect(`/ops/satici?hata=${encodeURIComponent("Askıya alma sebebi zorunlu — satıcıya bildirilir ve itiraz hakkı vardır (10.4).")}`);
  }
  const { count } = await db.seller.updateMany({
    where: { id: sellerId, status: "approved" },
    data: { status: "suspended" },
  });
  if (count === 1) {
    // A suspended seller cannot keep selling — live listings go dark (10.4).
    const pulled = await db.listing.updateMany({
      where: { sellerId, status: "live" },
      data: { status: "removed" },
    });
    await audit(actor, "seller.suspend", "Seller", sellerId, `${reason} (${pulled.count} canlı ilan kaldırıldı)`);
    revalidatePath("/");
  }
  revalidatePath("/ops/satici");
  redirect("/ops/satici");
}

export async function reinstateSeller(sellerId: string): Promise<void> {
  const actor = await requireOps();
  const { count } = await db.seller.updateMany({
    where: { id: sellerId, status: "suspended" },
    data: { status: "approved" },
  });
  // Listings pulled at suspension stay removed — the seller relists,
  // and relisting passes through curation again (10.2).
  if (count === 1) await audit(actor, "seller.reinstate", "Seller", sellerId);
  revalidatePath("/ops/satici");
  redirect("/ops/satici");
}
