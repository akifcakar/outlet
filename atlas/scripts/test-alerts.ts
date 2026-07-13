// Alert matcher test (07.5): listing.live event → Notification for matching
// active alerts only, deduped, with lastMatchedAt updated.
// Run: npx tsx scripts/test-alerts.ts

import { db } from "../src/lib/db";
import { matchAlertsForListing } from "../src/lib/alerts";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const SID = (n: number) => `test-alert-sid-${n}`;

async function main() {
  const seller = await db.seller.findFirstOrThrow({ where: { status: "approved" } });
  const category = await db.category.findFirstOrThrow();
  const otherCategory = await db.category.findFirstOrThrow({
    where: { id: { not: category.id } },
  });
  const brand = await db.brand.findFirstOrThrow();

  const listing = await db.listing.create({
    data: {
      slug: `test-alarm-${crypto.randomUUID().slice(0, 8)}`,
      sellerId: seller.id,
      categoryId: category.id,
      brandId: brand.id,
      title: "Test Espresso Makinesi Deluxe",
      description: "Alarm eşleştirme testi ürünü.",
      condition: "open_box",
      grade: "A",
      whyDiscounted: "Test: kutusu açıldı, kullanılmadı.",
      originalPriceKurus: 2000000, // ₺20.000
      priceKurus: 1500000, // ₺15.000
      warrantyText: "Test garantisi",
      status: "live",
      publishedAt: new Date(),
    },
  });

  // Alerts: 1 query match, 2 category match, 3 price match, 4 query no-match,
  // 5 price too low, 6 wrong category, 7 matching but inactive.
  const mk = (n: number, data: Partial<Parameters<typeof db.savedSearch.create>[0]["data"]>) =>
    db.savedSearch.create({ data: { sessionId: SID(n), ...data } });
  await mk(1, { queryText: "espresso" });
  await mk(2, { categoryId: category.id });
  await mk(3, { maxPriceKurus: 1600000 });
  await mk(4, { queryText: "buzdolabı" });
  await mk(5, { maxPriceKurus: 1000000 });
  await mk(6, { queryText: "espresso", categoryId: otherCategory.id });
  await mk(7, { queryText: "espresso", active: false });

  const created = await matchAlertsForListing(listing.id);
  check("Matcher notified exactly the 3 matching alerts", created === 3, `created=${created}`);

  const hit = async (n: number) =>
    db.notification.count({ where: { sessionId: SID(n), listingId: listing.id } });
  check("Query alert matched (Turkish-lowercased contains)", (await hit(1)) === 1);
  check("Category alert matched", (await hit(2)) === 1);
  check("Max-price alert matched", (await hit(3)) === 1);
  check("Non-matching query got nothing", (await hit(4)) === 0);
  check("Too-low max price got nothing", (await hit(5)) === 0);
  check("Wrong category got nothing", (await hit(6)) === 0);
  check("Inactive alert got nothing", (await hit(7)) === 0);

  const a1 = await db.savedSearch.findFirstOrThrow({ where: { sessionId: SID(1) } });
  check("lastMatchedAt stamped", a1.lastMatchedAt !== null);

  const again = await matchAlertsForListing(listing.id);
  check("Re-run is deduped (no double notification)", again === 0, `created=${again}`);

  const nonLive = await db.listing.update({ where: { id: listing.id }, data: { status: "removed" } });
  const removed = await matchAlertsForListing(nonLive.id);
  check("Non-live listing matches nothing", removed === 0);

  // Cleanup.
  await db.notification.deleteMany({ where: { sessionId: { startsWith: "test-alert-sid-" } } });
  await db.savedSearch.deleteMany({ where: { sessionId: { startsWith: "test-alert-sid-" } } });
  await db.listing.delete({ where: { id: listing.id } });
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
