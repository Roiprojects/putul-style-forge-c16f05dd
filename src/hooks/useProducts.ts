import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";

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

const mapToProduct = (p: DbProduct): Product => {
  const images = p.images || [];
  const tags = p.tags || [];
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
    sizes: p.sizes || [],
    colors: p.colors || [],
    description: p.description || "",
    fabric: p.fabric || "",
    trending: tags.includes("trending"),
    bestSeller: tags.includes("best-seller"),
    newArrival: tags.includes("new-arrival"),
    badge,
  };
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
  });
};
