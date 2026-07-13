// Critical-path exercise (08.6: checkout + hold race are tested hardest).
// Run: npx tsx scripts/test-checkout.ts
// Scenario: two buyers, one item — exactly one may win. Then full purchase,
// snapshot verification, and sold_out flip.

import { db } from "../src/lib/db";
import { CheckoutError, getActiveHold, holdStock, placeOrder } from "../src/lib/checkout";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function main() {
  // Pre-cleanup: a previously crashed run may have left test holds behind.
  await db.stockHold.deleteMany({ where: { userId: { startsWith: "test-sid-" } } });

  const listing = await db.listing.findFirst({
    where: { status: "live", stock: 1 },
    orderBy: { publishedAt: "asc" },
  });
  if (!listing) throw new Error("No live listing to test with — run db:seed.");
  console.log(`Test listing: ${listing.title} (stock ${listing.stock})\n`);

  const alice = "test-sid-alice";
  const bob = "test-sid-bob";

  // 1) Alice holds the single unit.
  const holdA = await holdStock(listing.id, alice);
  check("Alice acquires hold", !!holdA.id);

  // 2) Bob tries — must be rejected (07.3 invariant).
  let bobRejected = false;
  try {
    await holdStock(listing.id, bob);
  } catch (e) {
    bobRejected = e instanceof CheckoutError && e.code === "taken";
  }
  check("Bob is rejected while Alice holds", bobRejected);

  // 3) Alice re-enters checkout — hold refreshes, still exactly one active hold.
  const holdA2 = await holdStock(listing.id, alice);
  const activeCount = await db.stockHold.count({
    where: { listingId: listing.id, status: "active", expiresAt: { gt: new Date() } },
  });
  check("Refresh keeps exactly one active hold", activeCount === 1, `active=${activeCount}`);

  // 4) Expired holds free the item on read (07.3: expiry checked every read).
  await db.stockHold.update({
    where: { id: holdA2.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  const gone = await getActiveHold(listing.id, alice);
  check("Expired hold is dead on read", gone === null);
  const holdB = await holdStock(listing.id, bob);
  check("Bob can hold after Alice's hold expires", !!holdB.id);

  // 5) Paying with an expired hold must fail.
  let expiredPayRejected = false;
  try {
    await placeOrder(holdA2.id, alice, {
      email: "alice@test.dev", name: "Alice Test", city: "İstanbul", address: "Test mah. Deneme sok. No:1 D:2",
    });
  } catch (e) {
    expiredPayRejected = e instanceof CheckoutError && e.code === "hold_expired";
  }
  check("Expired hold cannot pay", expiredPayRejected);

  // 6) Bob completes the purchase.
  const order = await placeOrder(holdB.id, bob, {
    email: "bob@test.dev", name: "Bob Test", city: "Ankara", address: "Deneme cad. Örnek apt. No:3 D:4",
  });
  check("Order created", !!order.id);
  check("Order status is paid", order.status === "paid");
  check(
    "Total = item + shipping",
    order.totalKurus === listing.priceKurus + listing.shippingKurus,
  );

  const after = await db.listing.findUniqueOrThrow({ where: { id: listing.id } });
  check("Stock decremented to 0", after.stock === 0, `stock=${after.stock}`);
  check("Listing flipped to sold_out", after.status === "sold_out");

  const snap = await db.transparencySnapshot.findUnique({ where: { orderId: order.id } });
  check("TransparencySnapshot stored", !!snap);
  check(
    "Snapshot matches listing at purchase",
    snap?.grade === listing.grade &&
      snap?.condition === listing.condition &&
      snap?.priceKurus === listing.priceKurus &&
      snap?.whyDiscounted === listing.whyDiscounted,
  );

  // 7) A third buyer can no longer hold a sold item.
  let soldRejected = false;
  try {
    await holdStock(listing.id, "test-sid-carol");
  } catch (e) {
    soldRejected = e instanceof CheckoutError && e.code === "not_live";
  }
  check("Sold item cannot be held", soldRejected);

  // Cleanup: restore the listing, remove test artifacts.
  await db.transparencySnapshot.deleteMany({ where: { orderId: order.id } });
  await db.order.delete({ where: { id: order.id } });
  await db.stockHold.deleteMany({ where: { userId: { startsWith: "test-sid-" } } });
  await db.user.deleteMany({ where: { email: { endsWith: "@test.dev" } } });
  await db.listing.update({
    where: { id: listing.id },
    data: { stock: 1, status: "live", soldOutAt: null },
  });
  console.log("\nCleanup done (listing restored to live).");

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
