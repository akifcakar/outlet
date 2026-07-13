import { cookies } from "next/headers";

// Dev-only ops identity: a cookie flag. The real thing (08.2) is OpsUser
// roles + IP-allowlist + 2FA — every consumer goes through getOpsActor,
// so the swap is one file, same trick as seller-session.ts.

const COOKIE = "atlas_ops";

/** Returns the acting ops identity for AuditLog.actor, or null. */
export async function getOpsActor(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "1" ? "ops:dev" : null;
}

export async function enterOpsSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // ops shift, not a month
    path: "/",
  });
}

export async function leaveOpsSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
