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
        <h1 className="font-heading text-3xl font-light">Product not found</h1>
        <Link to="/shop" className="text-secondary text-sm mt-4 inline-block tracking-wider uppercase">
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
    <div className="min-h-screen">
      {/* Fullscreen product hero */}
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Image gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative bg-accent"
        >
          <div className="sticky top-0 h-screen overflow-hidden cursor-zoom-in group">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {product.badge && (
              <span className="absolute top-8 left-8 bg-secondary text-secondary-foreground text-[9px] font-medium px-3 py-1.5 tracking-[0.2em] uppercase z-10">
                {product.badge}
              </span>
            )}
          </div>

          {/* Image thumbnails — bottom overlay */}
          {product.images.length > 1 && (
            <div className="absolute bottom-8 left-8 flex gap-2 z-10">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 overflow-hidden border transition-colors ${
                    selectedImage === i ? "border-secondary" : "border-transparent hover:border-background/50"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sticky product info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 md:py-32"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={9} />
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight size={9} />
            <span className="text-foreground">{product.category}</span>
          </div>

          <p className="text-secondary tracking-[0.4em] uppercase text-[9px] mb-4">Putul Fashions</p>
          <h1 className="font-heading text-3xl md:text-5xl font-light mb-6 tracking-tight leading-[1.1]">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground tracking-wider">
              {product.rating} · {product.reviews} reviews
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-10">
            <span className="font-heading text-3xl font-light">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary font-medium tracking-wider uppercase">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <div className="w-12 h-px bg-border mb-10" />

          {/* Product Story */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">The Story</p>
            <p className="text-sm text-muted-foreground leading-[2] font-light">{product.description}</p>
          </div>

          {/* Size */}
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-4">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[48px] h-12 px-4 border text-xs font-light transition-all duration-300 ${
                    selectedSize === s
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-2">
                Color: <span className="text-muted-foreground font-light">{product.colors[0]}</span>
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.2em] uppercase font-medium mb-4">Quantity</p>
            <div className="flex items-center border border-border w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-accent transition-colors">
                <Minus size={13} />
              </button>
              <span className="px-6 text-sm font-light">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-accent transition-colors">
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-12">
            <button
              onClick={handleAddToCart}
              className="btn-primary flex-1 flex items-center justify-center gap-3 py-4"
            >
              <ShoppingBag size={15} />
              Add to Cart
            </button>
            <button
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(wishlisted ? "Removed" : "Added to wishlist");
              }}
              className={`p-4 border transition-all duration-500 ${
                wishlisted
                  ? "border-secondary text-secondary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              <Heart size={17} className={wishlisted ? "fill-current" : ""} strokeWidth={1.5} />
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              { icon: Truck, label: "Free Shipping" },
              { icon: Shield, label: "Premium Quality" },
              { icon: RefreshCcw, label: "Easy Returns" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <f.icon size={16} className="mx-auto mb-2 text-secondary" strokeWidth={1.2} />
                <p className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>

          {/* Material */}
          <div className="border-t border-border pt-8 mt-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Material</p>
            <p className="text-sm text-muted-foreground font-light">{product.fabric}</p>
          </div>
        </motion.div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-24 md:py-36 bg-accent grain-overlay">
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16">
              <p className="section-subheading mb-3">You May Also Like</p>
              <h2 className="section-heading">
                Related <span className="italic">Products</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
