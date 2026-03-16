import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const sizes = ["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
];

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = [...products];
    if (selectedCategory !== "all") items = items.filter(p => p.category === selectedCategory);
    if (selectedSize) items = items.filter(p => p.sizes.includes(selectedSize));
    items = items.filter(p => p.price <= maxPrice);
    switch (sortBy) {
      case "price-asc": items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "rating": items.sort((a, b) => b.rating - a.rating); break;
    }
    return items;
  }, [selectedCategory, selectedSize, maxPrice, sortBy]);

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-2">Explore</p>
          <h1 className="font-heading text-3xl md:text-5xl font-semibold">Our Collection</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-secondary transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
          <p className="text-sm text-muted-foreground">{filtered.length} Products</p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm bg-transparent border border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: showFilters ? 240 : 0, opacity: showFilters ? 1 : 0 }}
            className="hidden md:block overflow-hidden flex-shrink-0"
          >
            <div className="w-60 space-y-8">
              {/* Category */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`block text-sm transition-colors ${selectedCategory === "all" ? "text-secondary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`block text-sm transition-colors ${selectedCategory === c.slug ? "text-secondary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                      className={`w-10 h-10 text-xs border transition-colors ${
                        selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-semibold mb-3">Max Price</h3>
                <input
                  type="range"
                  min={500}
                  max={7000}
                  step={100}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-secondary"
                />
                <p className="text-sm text-muted-foreground mt-1">Up to ₹{maxPrice.toLocaleString()}</p>
              </div>

              {/* Clear */}
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedSize(""); setMaxPrice(7000); }}
                className="flex items-center gap-1 text-xs tracking-widest uppercase text-muted-foreground hover:text-destructive transition-colors"
              >
                <X size={12} /> Clear Filters
              </button>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
