import type { Metadata } from "next";
import Link from "next/link";
import { getOpsActor } from "@/lib/ops-session";
import { enterOps, leaveOps } from "@/lib/ops-actions";

// 08.2 — ops panel lives in the same app at /ops. Dev gate here; the real
// thing is OpsUser roles + IP-allowlist + 2FA (swap lives in ops-session.ts).

export const metadata: Metadata = { title: "Atlas Ops" };

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const actor = await getOpsActor();

  if (!actor) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-16 md:px-6">
        <h1 className="text-2xl font-semibold text-ink">Atlas Ops</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Geliştirme modu: gerçek ops kimlik doğrulaması (OpsUser + 2FA, 08.2)
          gelene kadar tek tıkla gir. Her aksiyon denetim kaydına yazılır.
        </p>
        <form action={enterOps} className="mt-8">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-md bg-inverse px-6 text-sm font-semibold text-ink-inverse"
          >
            Ops olarak gir
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-6">
          <p className="font-semibold text-ink">Atlas Ops</p>
          <nav className="flex gap-4 text-sm">
            <Link href="/ops" className="text-ink-secondary hover:text-ink">Kürasyon</Link>
            <Link href="/ops/satici" className="text-ink-secondary hover:text-ink">Satıcılar</Link>
            <Link href="/ops/siparis" className="text-ink-secondary hover:text-ink">Siparişler</Link>
            <Link href="/ops/itiraz" className="text-ink-secondary hover:text-ink">İtirazlar</Link>
          </nav>
        </div>
        <form action={leaveOps}>
          <button type="submit" className="text-sm text-ink-muted hover:text-ink">
            Çıkış
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
