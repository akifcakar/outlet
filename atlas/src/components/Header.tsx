import Link from "next/link";
import { db } from "@/lib/db";
<<<<<<< HEAD

// 05.1 — sticky, calm, no promo banners above it. Search is dominant.
export async function Header() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
=======
import { readSessionId } from "@/lib/session";
import { unreadCount } from "@/lib/alerts";

// 05.1 — sticky, calm, no promo banners above it. Search is dominant.
// Badge counts are real numbers (05.1) — no fake urgency.
export async function Header() {
  const [categories, unread] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    readSessionId().then(unreadCount),
  ]);
>>>>>>> 8505f8c (Initialize Atlas project and local setup)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight text-ink">
          atlas<span className="text-success-strong">.</span>
        </Link>
        <form action="/ara" className="min-w-0 flex-1" role="search">
          <input
            type="search"
            name="q"
            placeholder='Ara: "Dyson V15", "espresso makinesi"...'
            aria-label="Ürün ara"
            className="h-11 w-full rounded-md border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted"
          />
        </form>
        <nav aria-label="Hesap" className="hidden shrink-0 items-center gap-4 text-sm text-ink-secondary sm:flex">
<<<<<<< HEAD
          <span className="cursor-not-allowed" title="Faz 0'da bağlanacak">Alarmlar</span>
=======
          <Link href="/hesap" className="hover:text-ink">
            Alarmlar
            {unread > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-inverse px-1 text-xs font-semibold text-ink-inverse">
                {unread}
              </span>
            )}
          </Link>
          <Link href="/hesap" className="hover:text-ink">Hesabım</Link>
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
          <Link href="/satici" className="hover:text-ink">Satıcı Paneli</Link>
        </nav>
      </div>
      <nav
        aria-label="Kategoriler"
        className="mx-auto flex max-w-[1280px] items-center gap-5 overflow-x-auto px-4 pb-3 text-sm md:px-6"
      >
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/kategori/${c.slug}`}
            className="whitespace-nowrap text-ink-secondary transition-colors duration-100 hover:text-ink"
          >
            {c.name}
          </Link>
        ))}
<<<<<<< HEAD
        <Link href="/nasil-calisir" className="ml-auto whitespace-nowrap text-ink-muted hover:text-ink">
=======
        {/* Mobile: the account cluster lives here (top row hides it under sm) */}
        <Link href="/hesap" className="ml-auto whitespace-nowrap font-semibold text-ink-secondary hover:text-ink sm:hidden">
          Hesabım
          {unread > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-inverse px-1 text-xs font-semibold text-ink-inverse">
              {unread}
            </span>
          )}
        </Link>
        <Link href="/satici" className="whitespace-nowrap text-ink-secondary hover:text-ink sm:hidden">
          Satıcı
        </Link>
        <Link
          href="/nasil-calisir"
          className="whitespace-nowrap text-ink-muted hover:text-ink sm:ml-auto"
        >
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
          Atlas nasıl çalışır?
        </Link>
      </nav>
    </header>
  );
}
