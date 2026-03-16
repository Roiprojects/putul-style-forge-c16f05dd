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

  const aspectClass = variant === "large" ? "aspect-[3/4]" : "aspect-[5/6]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative overflow-hidden bg-accent ${aspectClass}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
            }`}
            loading="lazy"
          />
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            }`}
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[8px] font-bold px-2 py-1 tracking-[0.1em] uppercase z-10">
              {product.badge}
            </span>
          )}
          {product.newArrival && !product.badge && (
            <span className="absolute top-2 left-2 bg-foreground text-background text-[8px] font-bold px-2 py-1 tracking-[0.1em] uppercase z-10">
              NEW
            </span>
          )}

          {/* Wishlist */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-all duration-300 z-10"
            aria-label="Wishlist"
          >
            <Heart
              size={12}
              className={`transition-colors duration-300 ${
                wishlisted ? "fill-secondary text-secondary" : "text-foreground"
              }`}
            />
          </motion.button>

          {/* Quick Add on hover */}
          <motion.button
            onClick={handleQuickAdd}
            initial={false}
            animate={{ y: isHovered ? 0 : "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm text-background py-2.5 text-[9px] tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 z-10"
          >
            <ShoppingBag size={11} />
            Add to Bag
          </motion.button>
        </div>

        {/* Product info — compact Myntra-style */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <h3 className="text-[11px] font-semibold text-foreground truncate tracking-wide uppercase">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-semibold text-secondary">{discount}% off</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-foreground">{product.rating}</span>
            <Star size={9} className="fill-secondary text-secondary" />
            <span className="text-[9px] text-muted-foreground">| {product.reviews}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
