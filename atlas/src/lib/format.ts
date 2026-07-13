// The one price formatter — 04_Design_System.md: currency display is
// centralized so expansion currencies are a config, not a refactor.

const TRY = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Integer kuruş → "₺12.999" */
export function formatPrice(kurus: number): string {
  return TRY.format(Math.round(kurus / 100));
}

/** Savings percent, whole number: (12999, 7499) → 42 */
export function savingsPercent(originalKurus: number, priceKurus: number): number {
  return Math.round((1 - priceKurus / originalKurus) * 100);
}

/** "₺5.500 kazandın" amount */
export function savingsAmount(originalKurus: number, priceKurus: number): string {
  return formatPrice(originalKurus - priceKurus);
}
