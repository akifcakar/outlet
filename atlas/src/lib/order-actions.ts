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

<<<<<<< HEAD
=======
  // "No" never releases escrow — it routes into the dispute flow with zero
  // friction (05.6/10.3). The mismatch is recorded either way (grade KPI).
  if (matched === "no") {
    await db.order.updateMany({
      where: { id: orderId, guestSessionId: sid, status: "shipped" },
      data: { gradeMatched: false },
    });
    redirect(`/siparis/${orderId}/itiraz?sebep=not_as_described`);
  }

>>>>>>> 8505f8c (Initialize Atlas project and local setup)
  await db.order.updateMany({
    where: { id: orderId, guestSessionId: sid, status: "shipped" },
    data: {
      status: "completed",
      completedAt: new Date(),
<<<<<<< HEAD
      gradeMatched: matched === "yes",
    },
  });
  // matched === "no" routes into the dispute flow when it exists (10.3);
  // for now the mismatch is recorded and visible to ops/seller score.
=======
      gradeMatched: true,
    },
  });
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
  redirect(`/siparis/${orderId}`);
}
