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
<<<<<<< HEAD
=======

const DATE_TIME = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "13 Tem 14:05" — ops/queue timestamps */
export function formatDateTime(d: Date): string {
  return DATE_TIME.format(d);
}
>>>>>>> 8505f8c (Initialize Atlas project and local setup)
