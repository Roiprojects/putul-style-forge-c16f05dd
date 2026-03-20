import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden bg-accent rounded-lg aspect-square">
          {/* Main image */}
          <img
            src={product.image}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
            loading="lazy"
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-2.5 left-2.5 bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded z-10">
              {product.badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all z-10 hover:bg-background ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Heart size={14} className={wishlisted ? "fill-secondary text-secondary" : "text-foreground"} />
          </button>

          {/* Quick Add */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-400 ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <button
              onClick={handleQuickAdd}
              className="w-full bg-foreground text-background py-2.5 text-[11px] font-semibold tracking-wide uppercase rounded flex items-center justify-center gap-2 hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <ShoppingBag size={13} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product info */}
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
