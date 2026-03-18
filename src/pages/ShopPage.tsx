import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
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

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
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
    <div className="min-h-screen">
      {/* Cinematic header */}
      <div className="bg-foreground text-background py-28 md:py-36 grain-overlay">
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-4">Putul Fashions</p>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light tracking-tight">
              Our Collection
            </h1>
            <p className="text-background/30 mt-6 text-sm max-w-md mx-auto font-light leading-[2]">
              Premium quality footwear at unbeatable prices
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category pills — minimal */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-6 overflow-x-auto py-5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap transition-colors pb-1 border-b ${
                selectedCategory === "all"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`text-[10px] tracking-[0.2em] uppercase font-medium whitespace-nowrap transition-colors pb-1 border-b ${
                  selectedCategory === c.slug
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-10 md:py-14">
        {/* Toolbar — minimal */}
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-border">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && <span className="w-1 h-1 rounded-full bg-secondary" />}
            </button>
            <span className="text-[10px] text-muted-foreground tracking-wider">{filtered.length} Products</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[10px] tracking-wider uppercase bg-transparent border-0 text-muted-foreground focus:outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-12">
          {/* Filters sidebar — sleek */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:block overflow-hidden flex-shrink-0"
              >
                <div className="w-[220px] space-y-10">
                  {/* Size */}
                  <div>
                    <h3 className="text-[10px] tracking-[0.2em] uppercase font-medium mb-5 text-muted-foreground">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                          className={`w-10 h-10 text-[10px] border transition-colors ${
                            selectedSize === s
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <h3 className="text-[10px] tracking-[0.2em] uppercase font-medium mb-5 text-muted-foreground">Color</h3>
                    <div className="space-y-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`block text-xs transition-colors font-light ${
                            selectedColors.includes(color)
                              ? "text-secondary"
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
                    <h3 className="text-[10px] tracking-[0.2em] uppercase font-medium mb-5 text-muted-foreground">Max Price</h3>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-secondary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">Up to ₹{maxPrice.toLocaleString()}</p>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSize("");
                        setSelectedColors([]);
                        setMaxPrice(3000);
                      }}
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={11} /> Clear All
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products — masonry-inspired irregular grid */}
          <div className="flex-1">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] border border-border tracking-wider uppercase text-muted-foreground">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <X size={10} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedCategory("all")} />
                  </span>
                )}
                {selectedColors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] border border-border tracking-wider uppercase text-muted-foreground">
                    {c}
                    <X size={10} className="cursor-pointer hover:text-destructive" onClick={() => toggleColor(c)} />
                  </span>
                ))}
                {selectedSize && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] border border-border tracking-wider uppercase text-muted-foreground">
                    Size: {selectedSize}
                    <X size={10} className="cursor-pointer hover:text-destructive" onClick={() => setSelectedSize("")} />
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-muted-foreground font-light">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
