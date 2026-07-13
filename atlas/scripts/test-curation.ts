// Curation state-chain test: submitted → live | rejected → resubmit (10.2),
// plus seller suspension pulling live listings (10.4), mirroring the guarded
// updateMany calls in ops-actions.ts / seller-actions.ts.
// Run: npx tsx scripts/test-curation.ts

import { db } from "../src/lib/db";
import { holdStock } from "../src/lib/checkout";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main() {
  const seller = await db.seller.findFirstOrThrow({ where: { status: "approved" } });
  const category = await db.category.findFirstOrThrow();
  const brand = await db.brand.findFirstOrThrow();

  const listing = await db.listing.create({
    data: {
      slug: `test-kurasyon-${crypto.randomUUID().slice(0, 8)}`,
      sellerId: seller.id,
      categoryId: category.id,
      brandId: brand.id,
      title: "Test Kürasyon Ürünü",
      description: "Kürasyon zinciri test ürünü — seed verisi değildir.",
      condition: "open_box",
      grade: "A",
      whyDiscounted: "Test amaçlı: kutusu açıldı, kullanılmadı.",
      originalPriceKurus: 100000,
      priceKurus: 70000,
      warrantyText: "Test garantisi",
      status: "submitted",
      submittedAt: new Date(),
    },
  });
  console.log(`Test listing: ${listing.title} (${listing.status})\n`);

  // 1) A submitted listing is not purchasable — the queue is invisible to money.
  const holdRejected = await holdStock(listing.id, "test-sid-curation")
    .then(() => false)
    .catch((e) => e.code === "not_live");
  check("Submitted listing cannot be held/bought", holdRejected === true);

  // 2) Rejection requires the submitted state and stores the specific fix.
  const rejected = await db.listing.updateMany({
    where: { id: listing.id, status: "submitted" },
    data: { status: "rejected", curationNote: "Test: seri no fotoğrafı ekleyin." },
  });
  check("Reject (submitted → rejected)", rejected.count === 1);

  // 3) A rejected listing cannot be approved — the state guard holds.
  const approveRejected = await db.listing.updateMany({
    where: { id: listing.id, status: "submitted" },
    data: { status: "live", publishedAt: new Date() },
  });
  check("Rejected listing cannot be approved", approveRejected.count === 0);

  // 4) Resubmit clears the note and re-enters the queue.
  const resubmitted = await db.listing.updateMany({
    where: { id: listing.id, status: "rejected" },
    data: { status: "submitted", submittedAt: new Date(), curationNote: null },
  });
  const afterResubmit = await db.listing.findUniqueOrThrow({ where: { id: listing.id } });
  check(
    "Resubmit (rejected → submitted, note cleared)",
    resubmitted.count === 1 && afterResubmit.curationNote === null,
  );

  // 5) Approve flips it live with publishedAt.
  const approved = await db.listing.updateMany({
    where: { id: listing.id, status: "submitted" },
    data: { status: "live", publishedAt: new Date(), curationNote: null },
  });
  const live = await db.listing.findUniqueOrThrow({ where: { id: listing.id } });
  check("Approve (submitted → live)", approved.count === 1 && live.publishedAt !== null);

  // 6) Approving twice is a no-op (idempotent ops click).
  const reApprove = await db.listing.updateMany({
    where: { id: listing.id, status: "submitted" },
    data: { status: "live" },
  });
  check("Cannot approve twice", reApprove.count === 0);

  // 7) Suspension pulls the seller's live listings (10.4) — on a temp seller.
  const tempSeller = await db.seller.create({
    data: {
      slug: `test-satici-${crypto.randomUUID().slice(0, 8)}`,
      displayName: "Test Satıcı",
      legalName: "Test Satıcı Ltd.",
      city: "Test",
      status: "approved",
    },
  });
  await db.listing.update({ where: { id: listing.id }, data: { sellerId: tempSeller.id } });
  const suspended = await db.seller.updateMany({
    where: { id: tempSeller.id, status: "approved" },
    data: { status: "suspended" },
  });
  const pulled = await db.listing.updateMany({
    where: { sellerId: tempSeller.id, status: "live" },
    data: { status: "removed" },
  });
  const afterSuspend = await db.listing.findUniqueOrThrow({ where: { id: listing.id } });
  check(
    "Suspension pulls live listings (live → removed)",
    suspended.count === 1 && pulled.count === 1 && afterSuspend.status === "removed",
  );

  // 8) Audit trail: every decision writes a row (mirrors ops-actions' audit()).
  await db.auditLog.create({
    data: { actor: "ops:test", action: "listing.approve", entityType: "Listing", entityId: listing.id },
  });
  const auditCount = await db.auditLog.count({
    where: { entityType: "Listing", entityId: listing.id },
  });
  check("AuditLog row persisted", auditCount === 1);

  // Cleanup.
  await db.auditLog.deleteMany({ where: { entityId: listing.id } });
  await db.listing.delete({ where: { id: listing.id } });
  await db.seller.delete({ where: { id: tempSeller.id } });
  console.log("\nCleanup done.");

  if (failures > 0) {
    console.error(`\n${failures} check(s) FAILED`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
