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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative overflow-hidden bg-accent ${variant === "large" ? "aspect-[3/4]" : "aspect-square"}`}>
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isHovered ? "opacity-0 scale-110" : "opacity-100 scale-100"
            }`}
            loading="lazy"
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[10px] font-bold px-2.5 py-1 tracking-wider uppercase z-10">
              {product.badge}
            </span>
          )}

          {/* New arrival badge */}
          {product.newArrival && !product.badge && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2.5 py-1 tracking-wider uppercase z-10">
              NEW
            </span>
          )}

          {/* Action buttons - right side */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.85 }}
              className="p-2.5 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300 shadow-sm"
              aria-label="Wishlist"
            >
              <Heart
                size={15}
                className={`transition-colors duration-300 ${
                  wishlisted ? "fill-secondary text-secondary" : "text-foreground"
                }`}
              />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="p-2.5 bg-background/90 backdrop-blur-sm hover:bg-background transition-all duration-300 shadow-sm"
              aria-label="Quick view"
            >
              <Eye size={15} className="text-foreground" />
            </motion.button>
          </div>

          {/* Quick Add bar */}
          <motion.button
            onClick={handleQuickAdd}
            initial={false}
            animate={{
              y: isHovered ? 0 : "100%",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm text-background py-3.5 text-[11px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 z-10"
          >
            <ShoppingBag size={14} />
            Quick Add
          </motion.button>
        </div>

        {/* Product info */}
        <div className="mt-4 space-y-1.5">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-secondary transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[11px] font-semibold text-secondary">{discount}% off</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
