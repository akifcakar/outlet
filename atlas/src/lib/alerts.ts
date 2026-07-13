import { db } from "./db";

// 07.5 — the alert matcher. Runs on every listing.live event ("the moment
// it's listed", 01). MVP calls it inline from the curation approve action;
// the job-queue version (08) replaces the call site, not this function.
//
// Matching mirrors /ara's contains-match so an alert saved from a search
// finds exactly what the search would. All-null filters match nothing —
// an alert must say at least one thing.

export async function matchAlertsForListing(listingId: string): Promise<number> {
  const listing = await db.listing.findUnique({
    where: { id: listingId, status: "live" },
    include: { brand: true },
  });
  if (!listing) return 0;

  // Dev-scale scan (alerts per session are capped); Postgres swaps in a
  // filtered query. Deduped per alert+listing so re-approval can't re-notify.
  const alerts = await db.savedSearch.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ categoryId: null }, { categoryId: listing.categoryId }] },
        { OR: [{ maxPriceKurus: null }, { maxPriceKurus: { gte: listing.priceKurus } }] },
      ],
    },
  });

  const haystack = `${listing.title} ${listing.brand.name}`.toLocaleLowerCase("tr-TR");
  const matched = alerts.filter((a) => {
    if (!a.queryText && !a.categoryId && !a.maxPriceKurus) return false;
    if (!a.queryText) return true;
    return haystack.includes(a.queryText.toLocaleLowerCase("tr-TR"));
  });

  let created = 0;
  for (const a of matched) {
    const dup = await db.notification.findFirst({
      where: { savedSearchId: a.id, listingId: listing.id },
    });
    if (dup) continue;
    await db.notification.create({
      data: {
        sessionId: a.sessionId,
        type: "alert_match",
        listingId: listing.id,
        savedSearchId: a.id,
      },
    });
    await db.savedSearch.update({
      where: { id: a.id },
      data: { lastMatchedAt: new Date() },
    });
    created++;
  }
  return created;
}

/** Unread in-app notification count for the header badge (05.1: real numbers). */
export async function unreadCount(sessionId: string | null): Promise<number> {
  if (!sessionId) return 0;
  return db.notification.count({ where: { sessionId, readAt: null } });
}
