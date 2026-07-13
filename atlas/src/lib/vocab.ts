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

<<<<<<< HEAD
=======
// 10.3 dispute reasons — each with the plain-language promise the buyer
// reads before choosing (outcomes and shipping-cost rules per the SOP table).
export const DISPUTE_REASONS = {
  withdrawal_14day: {
    label: "Cayma hakkı (14 gün)",
    hint: "Sebep gerekmez, yasal hakkın. İade kargo ücreti ilan koşullarına göre.",
  },
  not_as_described: {
    label: "Ürün ilana uymuyor",
    hint: "Satın alma anındaki karta göre değerlendirilir. Haklıysan iade kargosu satıcıdan. Fotoğraf zorunlu.",
  },
  damaged_in_transit: {
    label: "Kargoda hasar gördü",
    hint: "Teslimden sonraki 48 saat içinde fotoğrafla (ambalaj dahil). Ücret iadesi kargo sürecini beklemez.",
  },
  not_delivered: {
    label: "Elime ulaşmadı",
    hint: "Kargo araştırması en fazla 5 iş günü; çözülmezse ücret iade edilir.",
  },
} as const;

export type DisputeReasonKey = keyof typeof DISPUTE_REASONS;

export function disputeReasonLabel(key: string): string {
  return DISPUTE_REASONS[key as DisputeReasonKey]?.label ?? key;
}

>>>>>>> 8505f8c (Initialize Atlas project and local setup)
export function conditionLabel(key: string): string {
  return CONDITIONS[key as ConditionKey] ?? key;
}

export function gradeExplainer(key: string): string {
  return GRADES[key as GradeKey] ?? "";
}
