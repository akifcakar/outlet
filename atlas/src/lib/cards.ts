import type { ProductCardData } from "@/components/ProductCard";

// One mapper for every results grid (02: no duplicated logic).
type ListingForCard = {
  slug: string;
  title: string;
  condition: string;
  grade: string;
  originalPriceKurus: number;
  priceKurus: number;
  stock: number;
  status: string;
  photos: { url: string }[];
  seller: { displayName: string };
};

export function toCardData(l: ListingForCard): ProductCardData {
  return {
    slug: l.slug,
    title: l.title,
    condition: l.condition,
    grade: l.grade,
    originalPriceKurus: l.originalPriceKurus,
    priceKurus: l.priceKurus,
    stock: l.stock,
    status: l.status,
    photoUrl: l.photos[0]?.url ?? "",
    sellerName: l.seller.displayName,
  };
}
