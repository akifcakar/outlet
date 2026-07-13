import { conditionLabel, gradeExplainer } from "@/lib/vocab";
import { formatPrice } from "@/lib/format";

// The signature component — 01: "the heart of the product", 04.2 fixed row
// order, always directly under the buy box. Never collapsed, never a tab.

export function TransparencyCard({
  condition,
  grade,
  whyDiscounted,
  originalPriceKurus,
  priceKurus,
  warrantyText,
  stock,
}: {
  condition: string;
  grade: string;
  whyDiscounted: string;
  originalPriceKurus: number;
  priceKurus: number;
  warrantyText: string;
  stock: number;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Durum", conditionLabel(condition)],
    [
      "Grade",
      <span key="g">
        <span className="font-semibold">Grade {grade}</span>
        <span className="block text-sm text-ink-secondary">{gradeExplainer(grade)}</span>
      </span>,
    ],
    ["Neden indirimli", whyDiscounted],
    ["Orijinal fiyat", <span key="o" className="price">{formatPrice(originalPriceKurus)}</span>],
    ["Atlas fiyatı", <span key="p" className="price font-semibold">{formatPrice(priceKurus)}</span>],
    ["Garanti", warrantyText],
    ["İade", "14 gün içinde koşulsuz iade"],
    ["Stok", `${stock} adet`],
  ];

  return (
    <section
      aria-label="Şeffaflık Kartı"
      className="rounded-lg border border-line bg-surface"
    >
      <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
        Şeffaflık Kartı
      </h2>
      <dl>
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className={`flex gap-4 px-4 py-2.5 ${i < rows.length - 1 ? "border-b border-line" : ""}`}
          >
            <dt className="w-32 shrink-0 text-sm text-ink-muted">{label}</dt>
            <dd className="flex-1 text-[15px] text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
