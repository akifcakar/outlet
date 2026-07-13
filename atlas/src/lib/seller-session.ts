import { cookies } from "next/headers";
import { db } from "./db";

// Dev-only seller identity: a cookie pointing at a seeded seller.
// Real seller auth + verification flow (06.2) replaces this in Phase 0's
// auth pass — every consumer goes through getCurrentSeller, so the swap is
// one file.

const COOKIE = "atlas_seller";

export async function getCurrentSeller() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return db.seller.findUnique({ where: { id, status: "approved" } });
}

export async function setCurrentSeller(id: string) {
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}
