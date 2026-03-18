import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large" | "minimal" | "editorial";
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

  if (variant === "editorial") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="flex-shrink-0 w-[80vw] md:w-[42vw] lg:w-[32vw]"
      >
        <Link
          to={`/product/${product.id}`}
          className="group block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden aspect-[3/4]">
            <motion.img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              loading="lazy"
            />
            <img
              src={product.hoverImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-0"}`} />

            {/* Badge */}
            {product.badge && (
              <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-[8px] font-medium px-2.5 py-1 tracking-[0.15em] uppercase z-10">
                {product.badge}
              </span>
            )}

            {/* Wishlist */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.85 }}
              className={`absolute top-4 right-4 p-2.5 backdrop-blur-sm transition-all z-10 ${
                isHovered ? "bg-background/90" : "bg-background/60"
              }`}
            >
              <Heart size={13} className={wishlisted ? "fill-secondary text-secondary" : "text-foreground"} />
            </motion.button>

            {/* Quick add — slides up */}
            <motion.div
              initial={false}
              animate={{ y: isHovered ? 0 : "100%", opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute bottom-0 left-0 right-0 p-6 z-10"
            >
              <button
                onClick={handleQuickAdd}
                className="w-full bg-background/95 backdrop-blur-sm text-foreground py-3 text-[9px] tracking-[0.25em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-500"
              >
                <ShoppingBag size={11} />
                Add to Bag
              </button>
            </motion.div>
          </div>

          {/* Info */}
          <div className="mt-5 space-y-1.5">
            <h3 className="font-heading text-lg md:text-xl font-light text-foreground tracking-wide leading-tight">
              {product.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="text-[10px] font-medium text-secondary">{discount}% off</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  const aspectClass = variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative overflow-hidden bg-accent ${aspectClass}`}>
          <motion.img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.8 }}
            loading="lazy"
          />
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[8px] font-medium px-2.5 py-1 tracking-[0.15em] uppercase z-10">
              {product.badge}
            </span>
          )}

          {/* Wishlist */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            className={`absolute top-3 right-3 p-2 backdrop-blur-sm transition-all duration-300 z-10 ${
              isHovered ? "bg-background/90 opacity-100" : "bg-background/60 opacity-0"
            }`}
          >
            <Heart size={12} className={wishlisted ? "fill-secondary text-secondary" : "text-foreground"} />
          </motion.button>

          {/* Quick Add */}
          <motion.button
            onClick={handleQuickAdd}
            initial={false}
            animate={{ y: isHovered ? 0 : "100%", opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm text-background py-3 text-[9px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 z-10"
          >
            <ShoppingBag size={11} />
            Add to Bag
          </motion.button>
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="font-heading text-sm font-normal text-foreground tracking-wide leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-[10px] font-medium text-secondary">{discount}% off</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={9} className="fill-secondary text-secondary" />
            <span className="text-[10px] text-muted-foreground">{product.rating} · {product.reviews} reviews</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
