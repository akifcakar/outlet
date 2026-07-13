import Link from "next/link";

// 05.8 — 404 is designed: search + a way back. Distinct from sold pages,
// which keep their URL and never 404.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 text-center md:px-6">
      <h1 className="text-3xl font-semibold text-ink">Bu sayfa yok.</h1>
      <p className="mt-3 text-ink-secondary">
        Aradığın ürün satıldıysa sayfası hâlâ durur — bu adres hiç var olmamış.
      </p>
      <form action="/ara" className="mx-auto mt-8 max-w-md" role="search">
        <input
          type="search"
          name="q"
          placeholder="Ürün ara..."
          aria-label="Ürün ara"
          className="h-11 w-full rounded-md border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink-muted"
        />
      </form>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-md border border-line-strong px-5 text-sm font-semibold text-ink"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
