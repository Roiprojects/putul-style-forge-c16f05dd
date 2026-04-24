import { useMemo } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProducts } from "@/hooks/useProducts";
import ProductCarousel from "./ProductCarousel";

interface RecentlyViewedProps {
  excludeId?: string;
  title?: string;
}

const RecentlyViewed = ({ excludeId, title = "Recently Viewed" }: RecentlyViewedProps) => {
  const { recentlyViewedIds } = useRecentlyViewed();
  const { data: allProducts = [] } = useProducts();

  const products = useMemo(() => {
    const idSet = new Set(recentlyViewedIds);
    const filtered = allProducts.filter((p) => idSet.has(p.id) && p.id !== excludeId);
    // preserve recency order
    return recentlyViewedIds
      .map((id) => filtered.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [recentlyViewedIds, allProducts, excludeId]);

  if (products.length < 2) return null;

  return <ProductCarousel title={title} subtitle="Pick up where you left off" products={products} viewAllLink="/shop" />;
};

export default RecentlyViewed;
