import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large" | "minimal";
}

const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[1] || product.sizes[0]);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const aspectClass = variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.07, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative overflow-hidden bg-accent ${aspectClass}`}>
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1s] ease-out ${
              isHovered ? "opacity-0 scale-[1.08]" : "opacity-100 scale-100"
            }`}
            loading="lazy"
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1s] ease-out ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
            }`}
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-[9px] font-bold px-3 py-1.5 tracking-[0.15em] uppercase z-10">
              {product.badge}
            </span>
          )}

          {product.newArrival && !product.badge && (
            <span className="absolute top-4 left-4 bg-foreground text-background text-[9px] font-bold px-3 py-1.5 tracking-[0.15em] uppercase z-10">
              NEW
            </span>
          )}

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10">
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.85 }}
              className="p-3 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300"
              aria-label="Wishlist"
            >
              <Heart
                size={14}
                className={`transition-colors duration-300 ${
                  wishlisted ? "fill-secondary text-secondary" : "text-foreground"
                }`}
              />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300"
              aria-label="Quick view"
            >
              <Eye size={14} className="text-foreground" />
            </motion.button>
          </div>

          {/* Quick Add */}
          <motion.button
            onClick={handleQuickAdd}
            initial={false}
            animate={{ y: isHovered ? 0 : "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 bg-foreground/95 backdrop-blur-sm text-background py-4 text-[10px] tracking-[0.25em] uppercase font-semibold flex items-center justify-center gap-2.5 z-10"
          >
            <ShoppingBag size={13} />
            Quick Add
          </motion.button>
        </div>

        {/* Product info — more whitespace */}
        <div className="mt-5 space-y-2">
          <h3 className="text-[13px] font-medium text-foreground truncate group-hover:text-secondary transition-colors duration-300 tracking-wide">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1.5">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="text-[15px] font-semibold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-bold text-secondary tracking-wide">{discount}% OFF</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
