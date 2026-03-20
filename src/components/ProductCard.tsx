import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
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

const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(true);
    setAddedSize(null);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, size);
    setAddedSize(size);
    toast.success(`${product.name} (${size}) added to bag`);
    // Brief feedback then reset
    setTimeout(() => {
      setAddedSize(null);
    }, 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

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
        onMouseLeave={() => { setIsHovered(false); setShowSizes(false); setAddedSize(null); }}
      >
        <div className="relative overflow-hidden bg-accent rounded-lg aspect-[5/6]">
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
            <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded z-10">
              {product.badge}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full transition-all z-10 hover:bg-background ${
              isHovered || wishlisted ? "opacity-100" : "opacity-0"
            }`}
          >
            <Heart size={13} className={wishlisted ? "fill-secondary text-secondary" : "text-foreground"} />
          </button>

          {/* Bottom action */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <AnimatePresence mode="wait">
              {showSizes ? (
                <motion.div
                  key="sizes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-background border-t border-border px-3 py-2.5"
                >
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mb-2 text-center">
                    {addedSize ? "✓ Added — pick another?" : "Select size"}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={(e) => handleSizeSelect(e, size)}
                        className={`h-7 min-w-[32px] px-2.5 text-[10px] font-semibold border rounded-md transition-all active:scale-95 ${
                          addedSize === size
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={handleQuickAdd}
                    className="w-full bg-background border-t border-border text-foreground py-2.5 text-[11px] font-semibold tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-accent transition-colors active:scale-[0.98]"
                  >
                    <ShoppingBag size={13} />
                    Add to Bag
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Product info */}
        <div className="mt-2.5 space-y-0.5">
          <h3 className="text-[13px] font-medium text-foreground leading-snug line-clamp-1 group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-semibold text-green-600">({discount}% off)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-secondary text-secondary" />
            <span className="text-[10px] text-muted-foreground">{product.rating} · {product.reviews} reviews</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
