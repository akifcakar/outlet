import { db } from "./db";

// The two critical paths — 08_Technical_Architecture.md §08.3.
// Invariant (07.3): stock_available = stock − SUM(active, unexpired holds) ≥ 0.
//
// SQLite note: better-sqlite3 serializes writes (single-writer), so the
// check-then-create below is race-safe inside one transaction. The Postgres
// production version replaces it with 08.3's single INSERT..SELECT..RETURNING.
// Expiry is checked on every read (07.3): a hold past expiresAt is dead even
// if no sweeper has run.

export const HOLD_MINUTES = 10;

export class CheckoutError extends Error {
  constructor(public code: "taken" | "hold_expired" | "not_live") {
    super(code);
  }
}

/** Start-of-checkout reservation (05.5). Refreshes the caller's own hold. */
export async function holdStock(listingId: string, sessionId: string) {
  return db.$transaction(async (tx) => {
    // Refresh semantics (07.3): re-entering checkout replaces my active hold.
    await tx.stockHold.updateMany({
      where: { listingId, userId: sessionId, status: "active" },
      data: { status: "released" },
    });

    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { stock: true, status: true },
    });
    if (!listing || listing.status !== "live") throw new CheckoutError("not_live");

    const held = await tx.stockHold.aggregate({
      _sum: { qty: true },
      where: { listingId, status: "active", expiresAt: { gt: new Date() } },
    });
    if (listing.stock - (held._sum.qty ?? 0) < 1) throw new CheckoutError("taken");

    return tx.stockHold.create({
      data: {
        listingId,
        userId: sessionId,
        qty: 1,
        expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
      },
    });
  });
}

/** The caller's live hold on a listing, if any (expiry checked on read). */
export async function getActiveHold(listingId: string, sessionId: string) {
  return db.stockHold.findFirst({
    where: {
      listingId,
      userId: sessionId,
      status: "active",
      expiresAt: { gt: new Date() },
    },
  });
}

export type DeliveryDetails = {
  email: string;
  name: string;
  city: string;
  address: string;
};

/**
 * Payment success path (07.4): one transaction converts the hold, decrements
 * stock, flips sold_out, creates the Order and its immutable
 * TransparencySnapshot ("the contract"). Payment capture is SIMULATED until
 * the PSP integration lands — the order is marked paid with no money moved.
 */
export async function placeOrder(
  holdId: string,
  sessionId: string,
  delivery: DeliveryDetails,
) {
  return db.$transaction(async (tx) => {
    const hold = await tx.stockHold.findFirst({
      where: {
        id: holdId,
        userId: sessionId,
        status: "active",
        expiresAt: { gt: new Date() },
      },
      include: {
        listing: { include: { photos: { orderBy: { position: "asc" } } } },
      },
    });
    if (!hold) throw new CheckoutError("hold_expired");
    const l = hold.listing;
    if (l.status !== "live") throw new CheckoutError("not_live");

    // Oversell guard on the decrement itself, independent of the hold check.
    const dec = await tx.listing.updateMany({
      where: { id: l.id, stock: { gte: hold.qty } },
      data: { stock: { decrement: hold.qty } },
    });
    if (dec.count === 0) throw new CheckoutError("taken");

    const remaining = await tx.listing.findUniqueOrThrow({
      where: { id: l.id },
      select: { stock: true },
    });
    if (remaining.stock === 0) {
      await tx.listing.update({
        where: { id: l.id },
        data: { status: "sold_out", soldOutAt: new Date() },
      });
    }

    await tx.stockHold.update({
      where: { id: hold.id },
      data: { status: "converted" },
    });

    const buyer = await tx.user.upsert({
      where: { email: delivery.email },
      update: { name: delivery.name },
      create: { email: delivery.email, name: delivery.name },
    });

    const order = await tx.order.create({
      data: {
        buyerId: buyer.id,
        sellerId: l.sellerId,
        listingId: l.id,
        itemPriceKurus: l.priceKurus,
        shippingKurus: l.shippingKurus,
        totalKurus: l.priceKurus + l.shippingKurus,
        status: "paid", // simulated capture — PSP webhook drives this in prod
        deliveryAddress: JSON.stringify(delivery),
        guestSessionId: sessionId,
      },
    });

    await tx.transparencySnapshot.create({
      data: {
        orderId: order.id,
        condition: l.condition,
        grade: l.grade,
        whyDiscounted: l.whyDiscounted,
        originalPriceKurus: l.originalPriceKurus,
        priceKurus: l.priceKurus,
        warrantyText: l.warrantyText,
        photoUrls: JSON.stringify(l.photos.map((p) => p.url)),
      },
    });

    return order;
  });
}
