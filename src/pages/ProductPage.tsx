import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronRight, Truck, Shield, RefreshCcw } from "lucide-react";
import { products } from "@/data/products";
import { useStore } from "@/contexts/StoreContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="font-heading text-2xl">Product not found</h1>
        <Link to="/shop" className="text-secondary underline mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tracking-wider uppercase">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-square overflow-hidden bg-accent mb-4 group cursor-zoom-in relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-150"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-[10px] font-bold px-3 py-1.5 tracking-wider uppercase">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? "border-secondary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="text-[11px] tracking-[0.3em] uppercase text-secondary mb-2">Putul Fashions</p>
            <h1 className="font-heading text-2xl md:text-4xl font-semibold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl font-semibold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm bg-secondary/10 text-secondary font-semibold px-2 py-0.5">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Size */}
            <div className="mb-6">
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[52px] h-12 px-4 border text-sm font-medium transition-all duration-200 ${
                      selectedSize === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-3">
                  Color: {product.colors[0]}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-accent transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-6 text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-accent transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-4"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(wishlisted ? "Removed" : "Added to wishlist");
                }}
                className={`p-4 border transition-all duration-300 ${
                  wishlisted
                    ? "border-secondary text-secondary bg-secondary/5"
                    : "border-border hover:border-secondary hover:text-secondary"
                }`}
              >
                <Heart size={18} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 mb-8">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "Premium Quality" },
                { icon: RefreshCcw, label: "Easy Returns" },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <f.icon size={18} className="mx-auto mb-1.5 text-secondary" strokeWidth={1.5} />
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground">{f.label}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="space-y-4 border-t border-border pt-6">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2">Material</p>
                <p className="text-sm text-muted-foreground">{product.fabric}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">You May Also Like</p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
