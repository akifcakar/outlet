import Link from "next/link";
import { db } from "@/lib/db";

// 05.1 — sticky, calm, no promo banners above it. Search is dominant.
export async function Header() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

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
          <span className="cursor-not-allowed" title="Faz 0'da bağlanacak">Alarmlar</span>
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
        <Link href="/nasil-calisir" className="ml-auto whitespace-nowrap text-ink-muted hover:text-ink">
          Atlas nasıl çalışır?
        </Link>
      </nav>
    </header>
  );
}
