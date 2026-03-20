import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Plus, Minus, X } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import type { Product } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "grid";
}

type CartEntry = { size: string; qty: number };

const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalItems = cartEntries.reduce((sum, e) => sum + e.qty, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    const existing = cartEntries.find(c => c.size === size);
    if (existing) {
      setCartEntries(cartEntries.map(c => c.size === size ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCartEntries([...cartEntries, { size, qty: 1 }]);
    }
    addToCart(product, size);
    toast.success(`${product.name} (${size}) added`);
  };

  const handleIncrement = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCartEntries(cartEntries.map(c => c.size === size ? { ...c, qty: c.qty + 1 } : c));
    addToCart(product, size);
  };

  const handleDecrement = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    const entry = cartEntries.find(c => c.size === size);
    if (!entry) return;
    if (entry.qty <= 1) {
      setCartEntries(cartEntries.filter(c => c.size !== size));
    } else {
      setCartEntries(cartEntries.map(c => c.size === size ? { ...c, qty: c.qty - 1 } : c));
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartEntries([]);
    setShowSizes(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const hasItems = cartEntries.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); if (!hasItems) setShowSizes(false); }}
      >
        <div className="relative overflow-hidden bg-accent rounded-lg aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            loading="lazy"
          />
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            loading="lazy"
          />

          {product.badge && (
            <span className="absolute top-2.5 left-2.5 bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded z-10">
              {product.badge}
            </span>
          )}

          {/* Item count badge */}
          {hasItems && (
            <span className="absolute top-2.5 left-2.5 bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center z-20">
              {totalItems}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all z-10 hover:bg-background ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Heart size={14} className={wishlisted ? "fill-secondary text-secondary" : "text-foreground"} />
          </button>

          {/* Bottom action area */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              isHovered || hasItems ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <AnimatePresence mode="wait">
              {(showSizes || hasItems) ? (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-foreground/95 backdrop-blur-sm rounded-t-xl p-2.5"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-background/50 text-[9px] uppercase tracking-widest font-medium">
                      {hasItems ? `${totalItems} in bag` : "Select size"}
                    </p>
                    {hasItems && (
                      <button onClick={handleClearAll} className="text-background/40 hover:text-background transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Size buttons with inline qty */}
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map(size => {
                      const entry = cartEntries.find(c => c.size === size);
                      return entry ? (
                        <div
                          key={size}
                          className="flex items-center bg-secondary rounded overflow-hidden"
                        >
                          <button
                            onClick={(e) => handleDecrement(e, size)}
                            className="w-6 h-7 flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors active:scale-95"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[10px] font-bold text-secondary-foreground tabular-nums px-0.5 min-w-[24px] text-center">
                            {size} ×{entry.qty}
                          </span>
                          <button
                            onClick={(e) => handleIncrement(e, size)}
                            className="w-6 h-7 flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors active:scale-95"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          key={size}
                          onClick={(e) => handleSizeSelect(e, size)}
                          className="h-7 min-w-[34px] px-2 text-[10px] font-semibold text-background border border-background/15 rounded hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all active:scale-95"
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="p-3"
                >
                  <button
                    onClick={handleQuickAdd}
                    className="w-full bg-foreground text-background py-2.5 text-[11px] font-semibold tracking-wide uppercase rounded-lg flex items-center justify-center gap-2 hover:bg-secondary hover:text-secondary-foreground transition-colors active:scale-[0.97]"
                  >
                    <ShoppingBag size={13} />
                    Add to Cart
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[11px] font-semibold text-green-600">({discount}% off)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-secondary text-secondary" />
            <span className="text-[11px] text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
