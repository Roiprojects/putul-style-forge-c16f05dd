import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronRight, Truck, Shield, RefreshCcw } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProductCarousel from "@/components/ProductCarousel";
import { toast } from "sonner";

const ProductPage = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist, cart, updateQuantity, removeFromCart } = useStore();
  const { formatPrice, isINR } = useCurrency();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const imageCount = product?.images?.length || 0;
  const advanceImage = useCallback(() => {
    setSelectedImage(prev => (prev + 1) % imageCount);
  }, [imageCount]);

  useEffect(() => {
    if (imageCount <= 1) return;
    const timer = setInterval(advanceImage, 5000);
    return () => clearInterval(timer);
  }, [imageCount, advanceImage]);

  // Reset state when product changes
  useEffect(() => {
    setSelectedSize("");
    setQuantity(1);
    setSelectedImage(0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 text-center min-h-screen flex items-center justify-center">
        <div>
          <h1 className="font-heading text-3xl font-semibold mb-4">Product not found</h1>
          <Link to="/shop" className="text-sm text-secondary hover:underline">← Back to shop</Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  const cartItem = cart.find(i => i.product.id === product.id && i.size === selectedSize);
  const cartQty = cartItem?.quantity || 0;
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-foreground capitalize">{product.category.replace("-", " ")}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="relative overflow-hidden rounded-lg bg-accent aspect-square mb-3">
              <div
                className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${selectedImage * 100}%)` }}
              >
                {product.images.map((img, i) => (
                  <div key={i} className="min-w-full h-full flex items-center justify-center bg-accent">
                    <img src={img} alt={product.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                  </div>
                ))}
              </div>
              {product.badge && (
                <span className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-[11px] font-semibold px-3 py-1 rounded z-10">
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
                    className={`w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-md border-2 transition-all ${
                      selectedImage === i ? "border-secondary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-3 tracking-wide">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm font-semibold text-green-600">({discount}% off)</span>
                </>
              )}
            </div>
            {!isINR && (
              <p className="text-xs text-muted-foreground mb-6">≈ ₹{product.price.toLocaleString()} INR</p>
            )}
            {isINR && <div className="mb-6" />}

            <hr className="mb-6" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[44px] h-11 px-4 border rounded text-sm transition-all ${
                      selectedSize === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-1">Color: <span className="font-normal text-muted-foreground">{product.colors[0]}</span></p>
              </div>
            )}


            <div className="flex gap-3 mb-8">
              {cartQty > 0 ? (
                <div className="flex-1 flex items-center justify-center border border-foreground rounded overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product.id, selectedSize, cartQty - 1)}
                    className="px-4 py-3.5 hover:bg-accent transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 text-sm font-semibold tabular-nums">{cartQty}</span>
                  <button
                    onClick={() => updateQuantity(product.id, selectedSize, cartQty + 1)}
                    className="px-4 py-3.5 hover:bg-accent transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5">
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => { toggleWishlist(product.id); toast.success(wishlisted ? "Removed" : "Added to wishlist"); }}
                className={`px-4 border rounded transition-all ${
                  wishlisted ? "border-secondary text-secondary" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <Heart size={18} className={wishlisted ? "fill-current" : ""} strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "Premium Quality" },
                { icon: RefreshCcw, label: "Easy Returns" },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <f.icon size={18} className="mx-auto mb-1.5 text-secondary" strokeWidth={1.3} />
                  <p className="text-[10px] tracking-wide uppercase text-muted-foreground">{f.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-5 mt-5">
              <p className="text-sm font-semibold mb-1">Material</p>
              <p className="text-sm text-muted-foreground">{product.fabric}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {related.length > 0 && (
        <ProductCarousel title="You May Also Like" subtitle="Similar products" products={related} viewAllLink="/shop" />
      )}
    </div>
  );
};

export default ProductPage;
