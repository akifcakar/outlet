// Dispute state-chain test (10.3/07.4): shipped → dispute_open →
// resolved refund|release, cayma rule, misgrade strike, 3-strike auto-suspend.
// Mirrors the guarded updates in dispute-actions.ts.
// Run: npx tsx scripts/test-disputes.ts

import { db } from "../src/lib/db";
import { holdStock, placeOrder } from "../src/lib/checkout";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function makeShippedOrder(sellerId: string, listingSuffix: string, sid: string) {
  const category = await db.category.findFirstOrThrow();
  const brand = await db.brand.findFirstOrThrow();
  const listing = await db.listing.create({
    data: {
      slug: `test-itiraz-${listingSuffix}-${crypto.randomUUID().slice(0, 6)}`,
      sellerId,
      categoryId: category.id,
      brandId: brand.id,
      title: `Test İtiraz Ürünü ${listingSuffix}`,
      description: "İtiraz zinciri test ürünü.",
      condition: "open_box",
      grade: "B",
      whyDiscounted: "Test: teşhirde kaldı.",
      originalPriceKurus: 100000,
      priceKurus: 70000,
      warrantyText: "Test garantisi",
      status: "live",
      publishedAt: new Date(),
    },
  });
  const hold = await holdStock(listing.id, sid);
  const order = await placeOrder(hold.id, sid, {
    email: "itiraz@test.dev", name: "İtiraz Test", city: "Ankara", address: "Test cad. No:1",
  });
  await db.order.update({
    where: { id: order.id },
    data: { status: "shipped", trackingNo: "TESTTRACK", shippedAt: new Date() },
  });
  return { listing, order };
}

async function main() {
  const seller = await db.seller.create({
    data: {
      slug: `test-itiraz-satici-${crypto.randomUUID().slice(0, 6)}`,
      displayName: "Test İtiraz Satıcısı",
      legalName: "Test İtiraz Ltd.",
      city: "Test",
      status: "approved",
    },
  });
  const sid = "test-sid-dispute";

  // 1) Open: shipped → dispute_open (state guard) + Dispute row.
  const a = await makeShippedOrder(seller.id, "A", sid);
  const flip = await db.order.updateMany({
    where: { id: a.order.id, status: "shipped" },
    data: { status: "dispute_open" },
  });
  const disputeA = await db.dispute.create({
    data: { orderId: a.order.id, reason: "not_as_described", buyerStatement: "İlanda olmayan derin çizik var.", photoUrls: '["/x.jpg"]' },
  });
  check("Open (shipped → dispute_open)", flip.count === 1);

  // 2) A disputed order cannot be buyer-confirmed (freeze, 07.4).
  const confirmTry = await db.order.updateMany({
    where: { id: a.order.id, guestSessionId: sid, status: "shipped" },
    data: { status: "completed" },
  });
  check("Disputed order cannot complete via confirm", confirmTry.count === 0);

  // 3) One dispute per order (unique orderId).
  const second = await db.dispute
    .create({ data: { orderId: a.order.id, reason: "not_delivered", buyerStatement: "x" } })
    .then(() => true)
    .catch(() => false);
  check("Second dispute on same order rejected", second === false);

  // 4) Resolve refund + misgrade strike → order refunded, strike written.
  await db.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeA.id },
      data: { status: "resolved", resolution: "refund", resolutionNote: "Test kararı.", resolvedAt: new Date() },
    });
    await tx.order.update({ where: { id: a.order.id }, data: { status: "refunded" } });
  });
  await db.strike.create({
    data: { sellerId: seller.id, reason: "misgraded_item", orderId: a.order.id, expiresAt: new Date(Date.now() + 365 * 864e5) },
  });
  const afterA = await db.order.findUniqueOrThrow({ where: { id: a.order.id } });
  check("Refund resolution → order refunded", afterA.status === "refunded");

  // 5) Release path: dispute → resolved release → order completed.
  const b = await makeShippedOrder(seller.id, "B", sid);
  await db.order.update({ where: { id: b.order.id }, data: { status: "dispute_open" } });
  const disputeB = await db.dispute.create({
    data: { orderId: b.order.id, reason: "not_as_described", buyerStatement: "Rengi beğenmedim aslında.", photoUrls: '["/y.jpg"]' },
  });
  await db.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeB.id },
      data: { status: "resolved", resolution: "release", resolutionNote: "Karta uygun.", resolvedAt: new Date() },
    });
    await tx.order.update({
      where: { id: b.order.id },
      data: { status: "completed", completedAt: new Date() },
    });
  });
  const afterB = await db.order.findUniqueOrThrow({ where: { id: b.order.id } });
  check("Release resolution → order completed", afterB.status === "completed");

  // 6) 3 active strikes → auto-suspend mirrors resolveDispute's tail.
  await db.strike.create({
    data: { sellerId: seller.id, reason: "misgraded_item", expiresAt: new Date(Date.now() + 365 * 864e5) },
  });
  await db.strike.create({
    data: { sellerId: seller.id, reason: "misgraded_item", expiresAt: new Date(Date.now() + 365 * 864e5) },
  });
  const active = await db.strike.count({
    where: { sellerId: seller.id, expiresAt: { gt: new Date() } },
  });
  check("3 active strikes counted", active === 3, `active=${active}`);
  if (active >= 3) {
    await db.seller.updateMany({
      where: { id: seller.id, status: "approved" },
      data: { status: "suspended" },
    });
  }
  const sellerAfter = await db.seller.findUniqueOrThrow({ where: { id: seller.id } });
  check("Auto-suspend at 3 strikes", sellerAfter.status === "suspended");

  // 7) Expired strikes don't count (10.4: strikes expire after 12 months).
  await db.strike.updateMany({
    where: { sellerId: seller.id },
    data: { expiresAt: new Date(Date.now() - 864e5) },
  });
  const activeAfterExpiry = await db.strike.count({
    where: { sellerId: seller.id, expiresAt: { gt: new Date() } },
  });
  check("Expired strikes not counted", activeAfterExpiry === 0);

  // Cleanup — children first (holds reference the listing).
  for (const x of [a, b]) {
    await db.dispute.deleteMany({ where: { orderId: x.order.id } });
    await db.transparencySnapshot.deleteMany({ where: { orderId: x.order.id } });
    await db.order.delete({ where: { id: x.order.id } });
    await db.stockHold.deleteMany({ where: { listingId: x.listing.id } });
    await db.listing.delete({ where: { id: x.listing.id } });
  }
  await db.strike.deleteMany({ where: { sellerId: seller.id } });
  await db.user.deleteMany({ where: { email: "itiraz@test.dev" } });
  await db.seller.delete({ where: { id: seller.id } });
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
