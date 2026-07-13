import { formatPrice, savingsAmount, savingsPercent } from "@/lib/format";

// 04.1 price rules: Atlas price is the anchor, original muted strikethrough,
// savings calm emerald. Red never appears near a price.
export function PriceBlock({
  originalKurus,
  priceKurus,
  size = "md",
}: {
  originalKurus: number;
  priceKurus: number;
  size?: "md" | "lg";
}) {
  const pct = savingsPercent(originalKurus, priceKurus);
  return (
    <div
      className="price"
      aria-label={`Atlas fiyatı ${formatPrice(priceKurus)}. Orijinal fiyat ${formatPrice(originalKurus)}. ${savingsAmount(originalKurus, priceKurus)} kazandın.`}
    >
      <span
        className={
          size === "lg"
            ? "text-[28px] font-semibold leading-[34px] text-ink"
            : "text-lg font-semibold leading-6 text-ink"
        }
      >
        {formatPrice(priceKurus)}
      </span>
      <span aria-hidden className="ml-2 text-sm text-ink-muted line-through">
        {formatPrice(originalKurus)}
      </span>
      <span aria-hidden className="ml-2 text-sm font-medium text-success">
        –%{pct}
      </span>
    </div>
  );
}
