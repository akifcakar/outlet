import Link from "next/link";

// 05.1 — the footer is a trust document.
export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-subtle">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Atlas</h2>
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li><Link href="/nasil-calisir" className="hover:text-ink">Nasıl çalışır?</Link></li>
            <li><Link href="/grade-sistemi" className="hover:text-ink">Grade sistemi</Link></li>
            <li>Alıcı koruması</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Satıcılar için</h2>
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>Atlas&apos;ta sat</li>
            <li>Satıcı doğrulama</li>
            <li>Komisyon: %12 — sadece satınca</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Destek</h2>
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>Yardım</li>
            <li>İade &amp; cayma hakkı</li>
            <li>İletişim</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">Yasal</h2>
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>Kullanım koşulları</li>
            <li>KVKK aydınlatma metni</li>
            <li>Çerez politikası</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1280px] px-4 py-4 text-xs text-ink-muted md:px-6">
          © 2026 Atlas (çalışma adı) — Her indirimin bir sebebi var.
        </p>
      </div>
    </footer>
  );
}
