// The locked vocabulary — 12_Content_Localization.md §12.2.
// These exact strings appear everywhere: badges, filters, emails, invoices.

export const CONDITIONS = {
  factory_new: "Sıfır Ürün",
  open_box: "Açık Kutu",
  display_item: "Teşhir Ürünü",
  excess_inventory: "Fazla Stok",
  returned_product: "İade Ürün",
  demo_unit: "Demo Ürün",
  trade_show_item: "Fuar Ürünü",
  refurbished: "Yenilenmiş",
  cosmetic_damage: "Kozmetik Kusurlu",
  packaging_damage: "Ambalajı Hasarlı",
} as const;

export type ConditionKey = keyof typeof CONDITIONS;

export const GRADES = {
  A: "Kusursuz. Yeniden ayırt edilemez.",
  B: "Yakından bakınca fark edilen küçük kozmetik izler. Tümü fotoğraflı.",
  C: "Belirgin kozmetik iz veya onarılmış hasar. Tamamen çalışır. Tümü fotoğraflı.",
} as const;

export type GradeKey = keyof typeof GRADES;

export function conditionLabel(key: string): string {
  return CONDITIONS[key as ConditionKey] ?? key;
}

export function gradeExplainer(key: string): string {
  return GRADES[key as GradeKey] ?? "";
}
