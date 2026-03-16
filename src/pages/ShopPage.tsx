import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const sizes = ["6", "7", "8", "9", "10"];
const colorOptions = ["Black", "White", "Grey", "Brown", "Tan", "Navy", "Sky Blue", "Mehandi Green", "Mouse Grey"];
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
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let items = [...products];
    if (selectedCategory !== "all") items = items.filter((p) => p.category === selectedCategory);
    if (selectedSize) items = items.filter((p) => p.sizes.includes(selectedSize));
    if (selectedColors.length > 0)
      items = items.filter((p) => p.colors.some((c) => selectedColors.some((sc) => c.toLowerCase().includes(sc.toLowerCase()))));
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
  }, [selectedCategory, selectedSize, selectedColors, maxPrice, sortBy]);

  const hasActiveFilters = selectedCategory !== "all" || selectedSize || selectedColors.length > 0 || maxPrice < 3000;

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      {/* Header */}
      <div className="bg-foreground text-background py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">Putul Fashions</p>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold">Our Collection</h1>
          <p className="text-background/50 mt-4 text-sm max-w-md mx-auto">
            Premium quality footwear at unbeatable prices. Save minimum 50% on every purchase.
          </p>
        </div>
      </div>

      {/* Category pills */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2 text-[11px] tracking-[0.15em] uppercase font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              All Products
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-5 py-2 text-[11px] tracking-[0.15em] uppercase font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === c.slug
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-medium hover:text-secondary transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-secondary" />}
            </button>
            <span className="text-xs text-muted-foreground">{filtered.length} Products</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 ${gridCols === 3 ? "text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 ${gridCols === 4 ? "text-foreground" : "text-muted-foreground"}`}
              >
                <Grid3X3 size={16} />
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-transparent border border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:block overflow-hidden flex-shrink-0"
              >
                <div className="w-60 space-y-8">
                  {/* Size */}
                  <div>
                    <h3 className="text-[11px] tracking-[0.15em] uppercase font-semibold mb-4">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                          className={`w-11 h-11 text-xs border transition-colors ${
                            selectedSize === s
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <h3 className="text-[11px] tracking-[0.15em] uppercase font-semibold mb-4">Color</h3>
                    <div className="space-y-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => toggleFilter(selectedColors, color, setSelectedColors)}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            selectedColors.includes(color)
                              ? "text-secondary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="text-[11px] tracking-[0.15em] uppercase font-semibold mb-4">Max Price</h3>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-secondary"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Up to ₹{maxPrice.toLocaleString()}</p>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSize("");
                        setSelectedColors([]);
                        setMaxPrice(3000);
                      }}
                      className="flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={12} /> Clear All
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products */}
          <div className="flex-1">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] border border-border bg-accent tracking-wide uppercase">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedCategory("all")} />
                  </span>
                )}
                {selectedColors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-3 py-1 text-[11px] border border-border bg-accent tracking-wide uppercase">
                    {c}
                    <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => toggleFilter(selectedColors, c, setSelectedColors)} />
                  </span>
                ))}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] border border-border bg-accent tracking-wide uppercase">
                    Size: {selectedSize}
                    <X size={12} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedSize("")} />
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-4 lg:grid-cols-5"} gap-3 md:gap-4`}>
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
