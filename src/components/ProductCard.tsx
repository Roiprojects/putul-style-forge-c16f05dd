import { Link } from "react-router-dom";
import { Heart, Star, ArrowRight, Check, GitCompareArrows } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCompare } from "@/contexts/CompareContext";
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
  const { formatPrice, isINR } = useCurrency();
  const { toggle: toggleCompare, isCompared } = useCompare();
  const wishlisted = isInWishlist(product.id);
  const compared = isCompared(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState<"idle" | "sizes" | "added">("idle");
  const [addedSize, setAddedSize] = useState<string | null>(null);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhase("sizes");
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, size);
    setAddedSize(size);
    setPhase("added");
    toast.success(`Added ${size}`);
    setTimeout(() => {
      setPhase("sizes");
      setAddedSize(null);
    }, 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setPhase("idle"); setAddedSize(null); }}
      >
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-accent rounded-2xl">
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.06]"
            loading="lazy"
          />
          {/* Hover image — crossfade */}
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />

          {/* Gradient scrim for bottom text legibility */}
          <div
            className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Badge — top left, sharp */}
          {product.badge && (
            <span className="absolute top-0 left-0 bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-1 z-10">
              {product.badge}
            </span>
          )}
          {discount > 0 && !product.badge && (
            <span className="absolute top-0 left-0 bg-foreground text-background text-[9px] font-bold uppercase tracking-wider px-2 py-1 z-10">
              -{discount}%
            </span>
          )}

          {/* Low stock urgency badge */}
          {typeof product.stock === "number" && product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5) && (
            <span className="absolute bottom-2 left-2 z-10 bg-destructive/90 text-destructive-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded backdrop-blur-sm">
              Only {product.stock} left
            </span>
          )}

          {/* Wishlist — top right, always visible */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-300 hover:bg-background active:scale-95"
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              className={`transition-all duration-300 ${
                wishlisted
                  ? "fill-secondary text-secondary scale-110"
                  : "text-foreground/70 hover:scale-110"
              }`}
            />
          </button>

          {/* Compare — below wishlist */}
          <button
            onClick={handleCompare}
            aria-label="Compare"
            className={`absolute top-12 right-2.5 z-10 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-300 active:scale-95 ${
              compared ? "bg-foreground text-background" : "bg-background/80 hover:bg-background text-foreground/70"
            }`}
          >
            <GitCompareArrows size={13} strokeWidth={1.75} />
          </button>

          {/* Bottom action bar — over the gradient */}
          <div className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-400 ease-out ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}>
            <AnimatePresence mode="wait">
              {phase === "added" ? (
                <motion.div
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-2 px-4 py-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                  >
                    <Check size={11} className="text-foreground" strokeWidth={3} />
                  </motion.div>
                  <span className="text-white text-[11px] font-medium tracking-wide">
                    {addedSize} added · tap for more
                  </span>
                </motion.div>
              ) : phase === "sizes" ? (
                <motion.div
                  key="sizes"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 pb-3 pt-1"
                >
                  <p className="text-white/50 text-[8px] uppercase tracking-[0.2em] font-medium mb-2 text-center">
                    Pick your size
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {product.sizes.map((size, i) => (
                      <motion.button
                        key={size}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => handleSizeSelect(e, size)}
                        className="h-8 min-w-[36px] px-2 text-[10px] font-semibold text-white/90 border border-white/25 backdrop-blur-sm hover:bg-white hover:text-foreground transition-all duration-200 active:scale-95"
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleQuickAdd}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white text-[11px] font-medium tracking-widest uppercase transition-all active:scale-[0.98]"
                >
                  <span>Add to Bag</span>
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info — tight, editorial */}
        <div className="mt-2 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[12px] font-medium text-foreground leading-tight line-clamp-1 group-hover:text-secondary transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              <Star size={9} className="fill-secondary text-secondary" />
              <span className="text-[9px] text-muted-foreground tabular-nums">{product.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px] font-bold text-foreground tabular-nums">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through tabular-nums">{formatPrice(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="text-[9px] font-bold text-green-600 tracking-wide">({discount}% OFF)</span>
            )}
          </div>
          {!isINR && (
            <p className="text-[8px] text-muted-foreground mt-0.5">≈ ₹{product.price.toLocaleString()} INR</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
