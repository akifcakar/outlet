// Fulfillment state-chain test: paid → shipped → completed with ownership
// guards, mirroring markShipped / confirmDelivery's guarded updateMany calls.
// Run: npx tsx scripts/test-fulfillment.ts

import { db } from "../src/lib/db";
import { holdStock, placeOrder } from "../src/lib/checkout";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main() {
  await db.stockHold.deleteMany({ where: { userId: { startsWith: "test-sid-" } } });

  const listing = await db.listing.findFirstOrThrow({
    where: { status: "live", stock: 1 },
    orderBy: { publishedAt: "asc" },
  });
  const sid = "test-sid-fulfil";
  const hold = await holdStock(listing.id, sid);
  const order = await placeOrder(hold.id, sid, {
    email: "fulfil@test.dev", name: "Fulfil Test", city: "İzmir", address: "Test mah. Akış sok. No:5",
  });
  console.log(`Order ${order.id} on "${listing.title}"\n`);

  // 1) Wrong seller cannot ship (ownership guard).
  const wrongSeller = await db.order.updateMany({
    where: { id: order.id, sellerId: "someone-else", status: "paid" },
    data: { status: "shipped" },
  });
  check("Wrong seller cannot mark shipped", wrongSeller.count === 0);

  // 2) Right seller ships with tracking.
  const shipped = await db.order.updateMany({
    where: { id: order.id, sellerId: listing.sellerId, status: "paid" },
    data: { status: "shipped", trackingNo: "TEST123456", shippedAt: new Date() },
  });
  check("Seller ships (paid → shipped)", shipped.count === 1);

  // 3) Shipping twice is a no-op (state guard).
  const reShip = await db.order.updateMany({
    where: { id: order.id, sellerId: listing.sellerId, status: "paid" },
    data: { status: "shipped" },
  });
  check("Cannot ship twice", reShip.count === 0);

  // 4) Wrong session cannot confirm delivery.
  const wrongSid = await db.order.updateMany({
    where: { id: order.id, guestSessionId: "not-the-buyer", status: "shipped" },
    data: { status: "completed" },
  });
  check("Wrong buyer cannot confirm", wrongSid.count === 0);

  // 5) Buyer confirms with grade check (shipped → completed).
  const confirmed = await db.order.updateMany({
    where: { id: order.id, guestSessionId: sid, status: "shipped" },
    data: { status: "completed", completedAt: new Date(), gradeMatched: true },
  });
  check("Buyer confirms (shipped → completed)", confirmed.count === 1);

  const final = await db.order.findUniqueOrThrow({ where: { id: order.id } });
  check("Final state completed + gradeMatched", final.status === "completed" && final.gradeMatched === true);
  check("Tracking preserved", final.trackingNo === "TEST123456");

  // Cleanup.
  await db.transparencySnapshot.deleteMany({ where: { orderId: order.id } });
  await db.order.delete({ where: { id: order.id } });
  await db.stockHold.deleteMany({ where: { userId: { startsWith: "test-sid-" } } });
  await db.user.deleteMany({ where: { email: { endsWith: "@test.dev" } } });
  await db.listing.update({
    where: { id: listing.id },
    data: { stock: 1, status: "live", soldOutAt: null },
  });
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
