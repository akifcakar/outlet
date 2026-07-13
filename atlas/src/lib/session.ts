import { cookies } from "next/headers";

// Guest session (07.1: guest checkout, claimable accounts later).
// Cookie writes are only legal in Server Actions / Route Handlers —
// ensureSessionId is called from actions, readSessionId from pages.

const COOKIE = "atlas_sid";

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function ensureSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return existing;
  const sid = crypto.randomUUID();
  jar.set(COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return sid;
}
