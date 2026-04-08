import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductVariant } from "@/data/products";

interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  description: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  tags: string[] | null;
  fabric: string | null;
  is_active: boolean | null;
  category_id: string | null;
  admin_categories: { slug: string; name: string } | null;
}

const SIZE_ORDER: Record<string, number> = {
  xxs: 1, xs: 2, s: 3, m: 4, l: 5, xl: 6, xxl: 7, xxxl: 8,
  "2xl": 7, "3xl": 8, "4xl": 9, "5xl": 10,
  free: 99, "free size": 99,
};

const sortSizes = (sizes: string[]): string[] => {
  return [...sizes].sort((a, b) => {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();
    const aOrder = SIZE_ORDER[aLower];
    const bOrder = SIZE_ORDER[bLower];
    const aNum = parseFloat(aLower);
    const bNum = parseFloat(bLower);

    // Both are named sizes
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    // One named, one not
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    // Both numeric
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    // Fallback alphabetical
    return aLower.localeCompare(bLower);
  });
};

const CDN_BASE = "https://d1311wbk6unapo.cloudfront.net/NushopCatalogue";
const STORE_ID = "69870e125223b1da7d5437a8";

const resolveImageUrl = (path: string, w = 600): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CDN_BASE}/tr:f-webp,w-${w},fo-auto/${STORE_ID}/${path}`;
};

const mapToProduct = (p: DbProduct): Product => {
  const images = (p.images || []).map((img) => resolveImageUrl(img, 800));
  const tags = (p.tags || []).map((tag) =>
    tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
  );
  const discount = p.original_price
    ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
    : 0;

  let badge = "";
  if (tags.includes("combo")) badge = "COMBO";
  else if (discount > 0) badge = `${discount}% OFF`;

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    image: images[0] || "",
    hoverImage: images[1] || images[0] || "",
    images,
    category: p.admin_categories?.slug || "",
    rating: p.rating || 0,
    reviews: p.reviews_count || 0,
    sizes: sortSizes(p.sizes || []),
    colors: p.colors || [],
    description: p.description || "",
    fabric: p.fabric || "",
    trending: tags.includes("trending"),
    bestSeller: tags.includes("bestseller") || tags.includes("best-seller"),
    newArrival: tags.includes("new-arrival"),
    badge,
  };
};

/** Realtime hook that invalidates product & category queries on DB changes */
export const useRealtimeStorefront = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("storefront-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_products" }, () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_categories" }, () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        queryClient.invalidateQueries({ queryKey: ["featured-reviews"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, () => {
        queryClient.invalidateQueries({ queryKey: ["product"] });
        queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_products")
        .select("*, admin_categories(slug, name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as DbProduct[]).map(mapToProduct);
    },
    staleTime: 30 * 1000,
  });
};

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("admin_products")
        .select("*, admin_categories(slug, name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return mapToProduct(data as unknown as DbProduct);
    },
    enabled: !!id,
  });
};

export const useProductVariants = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async (): Promise<ProductVariant[]> => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      return (data ?? []).map((v: any) => ({
        id: v.id,
        color: v.color,
        colorCode: v.color_code || undefined,
        size: v.size,
        stock: v.stock,
        priceAdjustment: v.price_adjustment || 0,
        images: v.images || [],
      }));
    },
    enabled: !!productId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });
};

export const useFeaturedReviews = () => {
  return useQuery({
    queryKey: ["featured-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, author_name, comment, rating, created_at")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
};
