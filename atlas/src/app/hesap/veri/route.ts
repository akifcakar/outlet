import { db } from "@/lib/db";
import { readSessionId } from "@/lib/session";

// KVKK data export (07.8 / 11): everything tied to this guest session,
// as a downloadable JSON. Self-service, no support ticket.

export const dynamic = "force-dynamic";

export async function GET() {
  const sid = await readSessionId();
  if (!sid) {
    return Response.json({ error: "Oturum bulunamadı." }, { status: 404 });
  }

  const [orders, alerts, notifications] = await Promise.all([
    db.order.findMany({
      where: { guestSessionId: sid },
      include: { snapshot: true, listing: { select: { title: true, slug: true } } },
    }),
    db.savedSearch.findMany({
      where: { sessionId: sid },
      include: { category: { select: { name: true } } },
    }),
    db.notification.findMany({
      where: { sessionId: sid },
      include: { listing: { select: { title: true, slug: true } } },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    sessionId: sid,
    orders: orders.map((o) => ({
      id: o.id,
      listing: o.listing.title,
      totalKurus: o.totalKurus,
      status: o.status,
      deliveryAddress: JSON.parse(o.deliveryAddress),
      trackingNo: o.trackingNo,
      createdAt: o.createdAt,
      transparencySnapshot: o.snapshot,
    })),
    alerts: alerts.map((a) => ({
      queryText: a.queryText,
      category: a.category?.name ?? null,
      maxPriceKurus: a.maxPriceKurus,
      active: a.active,
      createdAt: a.createdAt,
    })),
    notifications: notifications.map((n) => ({
      type: n.type,
      listing: n.listing?.title ?? null,
      createdAt: n.createdAt,
      readAt: n.readAt,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="atlas-verilerim.json"',
    },
  });
}
