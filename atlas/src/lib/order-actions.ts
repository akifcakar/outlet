"use server";

import { redirect } from "next/navigation";
import { db } from "./db";
import { readSessionId } from "./session";

// 05.6 — "Teslim aldım, her şey yolunda": releases escrow (simulated) and
// records the one-question grade check that feeds the Grade Accuracy KPI
// (01/07.6). Carrier webhooks add the separate `delivered` stage later; in
// dev the buyer's confirm closes shipped → completed directly.

export async function confirmDelivery(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId"));
  const matched = formData.get("gradeMatched"); // "yes" | "no"
  const sid = await readSessionId();
  if (!sid || (matched !== "yes" && matched !== "no")) redirect(`/siparis/${orderId}`);

  await db.order.updateMany({
    where: { id: orderId, guestSessionId: sid, status: "shipped" },
    data: {
      status: "completed",
      completedAt: new Date(),
      gradeMatched: matched === "yes",
    },
  });
  // matched === "no" routes into the dispute flow when it exists (10.3);
  // for now the mismatch is recorded and visible to ops/seller score.
  redirect(`/siparis/${orderId}`);
}
