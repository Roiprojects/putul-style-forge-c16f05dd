import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronRight, Truck, Shield, RefreshCcw, Zap, Banknote } from "lucide-react";
import { useProduct, useProducts, useProductVariants } from "@/hooks/useProducts";
import { useStore } from "@/contexts/StoreContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import ProductCarousel from "@/components/ProductCarousel";
import { toast } from "sonner";
import type { ProductVariant } from "@/data/products";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { data: variants = [] } = useProductVariants(id);
  const { addToCart, toggleWishlist, isInWishlist, cart, updateQuantity, removeFromCart } = useStore();
  const { formatPrice, isINR } = useCurrency();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const hasVariants = variants.length > 0;

  // Unique colors from variants
  const variantColors = useMemo(() => {
    if (!hasVariants) return [];
    const colorMap = new Map<string, { color: string; colorCode?: string }>();
    variants.forEach(v => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, { color: v.color, colorCode: v.colorCode });
      }
    });
    return Array.from(colorMap.values());
  }, [variants, hasVariants]);

  // Available sizes for selected color
  const availableSizesForColor = useMemo(() => {
    if (!hasVariants) return product?.sizes || [];
    if (!selectedColor) return [...new Set(variants.map(v => v.size))];
    return variants.filter(v => v.color === selectedColor).map(v => v.size);
  }, [hasVariants, selectedColor, variants, product]);

  // Available colors for selected size
  const availableColorsForSize = useMemo(() => {
    if (!hasVariants) return product?.colors || [];
    if (!selectedSize) return variantColors.map(c => c.color);
    return variants.filter(v => v.size === selectedSize).map(v => v.color);
  }, [hasVariants, selectedSize, variants, product, variantColors]);

  // Get stock for a specific combination
  const getVariantStock = useCallback((color: string, size: string) => {
    const v = variants.find(v => v.color === color && v.size === size);
    return v?.stock ?? 0;
  }, [variants]);

  // Is a color available (has any stock)?
  const isColorAvailable = useCallback((color: string) => {
    if (!hasVariants) return true;
    if (selectedSize) return getVariantStock(color, selectedSize) > 0;
    return variants.some(v => v.color === color && v.stock > 0);
  }, [hasVariants, selectedSize, variants, getVariantStock]);

  // Is a size available?
  const isSizeAvailable = useCallback((size: string) => {
    if (!hasVariants) return true;
    if (selectedColor) return getVariantStock(selectedColor, size) > 0;
    return variants.some(v => v.size === size && v.stock > 0);
  }, [hasVariants, selectedColor, variants, getVariantStock]);

  // Selected variant
  const selectedVariant = useMemo(() => {
    if (!hasVariants || !selectedColor || !selectedSize) return null;
    return variants.find(v => v.color === selectedColor && v.size === selectedSize) || null;
  }, [hasVariants, selectedColor, selectedSize, variants]);

  // Images to display based on selected color
  const displayImages = useMemo(() => {
    if (hasVariants && selectedColor) {
      const colorVariant = variants.find(v => v.color === selectedColor && v.images.length > 0);
      if (colorVariant && colorVariant.images.length > 0) return colorVariant.images;
    }
    return product?.images || [];
  }, [hasVariants, selectedColor, variants, product]);

  // Effective price with adjustment
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant) return product.price + selectedVariant.priceAdjustment;
    return product.price;
  }, [product, selectedVariant]);

  const isOutOfStock = hasVariants && selectedColor && selectedSize && selectedVariant?.stock === 0;

  const imageCount = displayImages.length;
  const advanceImage = useCallback(() => {
    setSelectedImage(prev => (prev + 1) % imageCount);
  }, [imageCount]);

  useEffect(() => {
    if (imageCount <= 1) return;
    const timer = setInterval(advanceImage, 5000);
    return () => clearInterval(timer);
  }, [imageCount, advanceImage]);

  // Restore from URL params & reset on product change
  useEffect(() => {
    const urlColor = searchParams.get("color") || "";
    const urlSize = searchParams.get("size") || "";
    setSelectedColor(urlColor);
    setSelectedSize(urlSize);
    setQuantity(1);
    setSelectedImage(0);
  }, [id]);

  // Sync selection to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedColor) params.set("color", selectedColor);
    else params.delete("color");
    if (selectedSize) params.set("size", selectedSize);
    else params.delete("size");
    setSearchParams(params, { replace: true });
  }, [selectedColor, selectedSize]);

  // Reset image index when images change
  useEffect(() => {
    setSelectedImage(0);
  }, [displayImages]);

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
  const cartItem = cart.find(i => i.product.id === product.id && i.size === selectedSize && i.color === (selectedColor || undefined));
  const cartQty = cartItem?.quantity || 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - effectivePrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (hasVariants && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (isOutOfStock) {
      toast.error("This combination is out of stock");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor || undefined);
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (hasVariants && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (isOutOfStock) {
      toast.error("This combination is out of stock");
      return;
    }
    // Add to cart if not already there
    if (cartQty === 0) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, selectedSize, selectedColor || undefined);
      }
    }
    navigate("/cart");
  };

  const colorsToShow = hasVariants ? variantColors : product.colors.map(c => ({ color: c, colorCode: undefined }));
  const sizesToShow = hasVariants ? [...new Set(variants.map(v => v.size))] : product.sizes;

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
                {displayImages.map((img, i) => (
                  <div key={`${img}-${i}`} className="min-w-full h-full flex items-center justify-center bg-accent">
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
            {displayImages.length > 1 && (
              <div className="flex gap-2">
                {displayImages.map((img, i) => (
                  <button
                    key={`thumb-${i}`}
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
              <span className="text-2xl font-bold text-foreground">{formatPrice(effectivePrice)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  {discount > 0 && <span className="text-sm font-semibold text-green-600">({discount}% off)</span>}
                </>
              )}
            </div>
            {!isINR && (
              <p className="text-xs text-muted-foreground mb-6">≈ ₹{effectivePrice.toLocaleString()} INR</p>
            )}
            {isINR && <div className="mb-6" />}

            <hr className="mb-6" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Color Selection */}
            {colorsToShow.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorsToShow.map((c) => {
                    const available = isColorAvailable(c.color);
                    const isSelected = selectedColor === c.color;
                    return (
                      <button
                        key={c.color}
                        onClick={() => {
                          if (!available) return;
                          setSelectedColor(prev => prev === c.color ? "" : c.color);
                        }}
                        disabled={!available}
                        title={available ? c.color : `${c.color} — Out of stock`}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-secondary ring-2 ring-secondary/30"
                            : available
                              ? "border-border hover:border-foreground"
                              : "border-border opacity-30 cursor-not-allowed"
                        }`}
                      >
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: c.colorCode || "#888" }}
                        />
                        {!available && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-[110%] h-[1px] bg-muted-foreground rotate-45 absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {sizesToShow.map((s) => {
                  const available = isSizeAvailable(s);
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        if (!available) return;
                        setSelectedSize(prev => prev === s ? "" : s);
                      }}
                      disabled={!available}
                      title={available ? s : `${s} — Out of stock`}
                      className={`min-w-[44px] h-11 px-4 border rounded text-sm transition-all ${
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : available
                            ? "border-border text-foreground hover:border-foreground"
                            : "border-border text-muted-foreground/40 line-through cursor-not-allowed"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {isOutOfStock && (
                <p className="text-xs text-destructive mt-2 font-medium">This combination is out of stock</p>
              )}
            </div>

            <div className="flex gap-3 mb-3">
              {cartQty > 0 ? (
                <div className="flex-1 flex items-center justify-center border border-foreground rounded overflow-hidden">
                  <button
                    onClick={() => updateQuantity(product.id, selectedSize, cartQty - 1, selectedColor || undefined)}
                    className="px-4 py-3.5 hover:bg-accent transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 text-sm font-semibold tabular-nums">{cartQty}</span>
                  <button
                    onClick={() => updateQuantity(product.id, selectedSize, cartQty + 1, selectedColor || undefined)}
                    className="px-4 py-3.5 hover:bg-accent transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3.5 mb-8 bg-secondary text-secondary-foreground font-semibold text-sm tracking-wide rounded transition-all hover:bg-secondary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={16} />
              Buy Now
            </button>

            <div className="grid grid-cols-4 gap-4 border-t border-border pt-6">
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
