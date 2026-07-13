import Link from "next/link";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { PriceBlock } from "@/components/ui/PriceBlock";
import { formatPrice } from "@/lib/format";

// 04.2 Product Card — identical anatomy everywhere: image, badges on image,
// title, seller, price block, stock line. Whole card is one link; sold items
// stay visible (02: liquidity proof). No quick-buy: the detail page (with the
// Şeffaflık Kartı) is a mandatory stop.

export type ProductCardData = {
  slug: string;
  title: string;
  condition: string;
  grade: string;
  originalPriceKurus: number;
  priceKurus: number;
  stock: number;
  status: string;
  photoUrl: string;
  sellerName: string;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const sold = p.status === "sold_out";
  return (
    <Link
      href={`/urun/${p.slug}`}
      aria-label={`${p.title}, Grade ${p.grade}, ${formatPrice(p.priceKurus)}${sold ? ", satıldı" : ""}`}
      className="group block overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-subtle">
        {/* dev placeholder SVGs; production uses the CDN image pipeline (08) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.photoUrl}
          alt={p.title}
          width={800}
          height={600}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${sold ? "opacity-60" : ""}`}
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <ConditionBadge condition={p.condition} />
          <GradeBadge grade={p.grade} />
        </div>
        {sold && (
          <span className="absolute right-2 top-2 rounded-full bg-inverse px-3 py-1 text-xs font-semibold text-ink-inverse">
            Satıldı
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink">
          {p.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-ink-secondary">
          <VerifiedCheck />
          {p.sellerName}
        </p>
        <PriceBlock originalKurus={p.originalPriceKurus} priceKurus={p.priceKurus} />
        <p className="text-xs text-ink-muted">
          {sold ? "Giden gitti" : `${p.stock} adet`}
        </p>
      </div>
    </Link>
  );
}

export function VerifiedCheck() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-success-strong"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
