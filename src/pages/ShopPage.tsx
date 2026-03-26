import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";

const sizes = ["6", "7", "8", "9", "10"];
const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Discount", value: "discount" },
];

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { data: dbCategories = [] } = useCategories();

  // Sync category from URL
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
  }, [searchParams]);

  const categories = dbCategories.map(c => ({
    name: c.name,
    slug: c.slug,
    image: c.image_url || "",
    productCount: 0,
  }));

  const filtered = useMemo(() => {
    let items = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== "all") items = items.filter((p) => p.category === selectedCategory);
    if (selectedSize) items = items.filter((p) => p.sizes.includes(selectedSize));
    items = items.filter((p) => p.price <= maxPrice);
    switch (sortBy) {
      case "price-asc": items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "rating": items.sort((a, b) => b.rating - a.rating); break;
      case "discount": items.sort((a, b) => {
        const dA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const dB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return dB - dA;
      }); break;
      default: items.sort((a, b) => b.reviews - a.reviews); break;
    }
    return items;
  }, [products, selectedCategory, selectedSize, maxPrice, sortBy, searchQuery]);

  const hasActiveFilters = selectedCategory !== "all" || selectedSize || maxPrice < 3000;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category tabs */}
      <div className="border-b border-border bg-background sticky top-14 lg:top-16 z-30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-xs font-medium tracking-wide uppercase rounded-full whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-2 text-xs font-medium tracking-wide uppercase rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === c.slug
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-secondary transition-colors border border-border rounded-full px-4 py-2"
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
            </button>
            <span className="text-xs text-muted-foreground">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium bg-background border border-border rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-secondary appearance-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] bg-accent rounded-full text-foreground">
                {categories.find((c) => c.slug === selectedCategory)?.name}
                <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedCategory("all")} />
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] bg-accent rounded-full text-foreground">
                Size: {selectedSize}
                <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedSize("")} />
              </span>
            )}
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedSize(""); setMaxPrice(3000); }}
              className="text-[11px] text-secondary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block overflow-hidden flex-shrink-0"
              >
                <div className="w-[240px] space-y-6 border-r border-border pr-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                          className={`w-10 h-10 text-xs border rounded transition-all ${
                            selectedSize === s
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Max Price</h3>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-secondary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Up to ₹{maxPrice.toLocaleString()}</p>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
