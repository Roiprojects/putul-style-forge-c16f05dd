import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Heart, ShoppingBag, Share2, Check } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

const encodeIds = (ids: string[]) => btoa(ids.join(",")).replace(/=+$/, "");
const decodeIds = (token: string): string[] => {
  try {
    return atob(token).split(",").filter(Boolean);
  } catch {
    return [];
  }
};

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { data: products = [] } = useProducts();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const sharedToken = searchParams.get("shared");
  const sharedIds = useMemo(() => (sharedToken ? decodeIds(sharedToken) : []), [sharedToken]);
  const isSharedView = sharedIds.length > 0;

  const displayIds = isSharedView ? sharedIds : wishlist;
  const wishlistProducts = products.filter(p => displayIds.includes(p.id));

  const handleShare = async () => {
    const token = encodeIds(wishlist);
    const url = `${window.location.origin}/wishlist?shared=${token}`;
    const shareData = {
      title: "My PUTUL Wishlist",
      text: "Check out my wishlist on PUTUL",
      url,
    };
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Wishlist link copied!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl mb-2">
          {isSharedView ? "Shared Wishlist Empty" : "Your Wishlist is Empty"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isSharedView
            ? "These items are no longer available."
            : "Save items you love by clicking the heart icon."}
        </p>
        <Link to="/shop" className="btn-primary inline-block">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold">
              {isSharedView ? "Shared Wishlist" : "My Wishlist"}
            </h1>
            {isSharedView && (
              <p className="text-sm text-muted-foreground mt-1">
                Someone shared this wishlist with you
              </p>
            )}
          </div>
          {!isSharedView && wishlist.length > 0 && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs tracking-widest uppercase rounded-full hover:opacity-90 transition"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copied" : "Share Wishlist"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map(product => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-accent aspect-[3/4] rounded-2xl">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              </Link>
              <div className="mt-3 space-y-1">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-sm font-semibold">₹{product.price.toLocaleString()}</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      addToCart(product, product.sizes[1] || product.sizes[0]);
                      toast.success("Added to cart");
                    }}
                    className="flex-1 bg-primary text-primary-foreground py-2 text-xs tracking-widest uppercase flex items-center justify-center gap-1 rounded-full"
                  >
                    <ShoppingBag size={12} /> Add to Cart
                  </button>
                  {!isSharedView && (
                    <button
                      onClick={() => { toggleWishlist(product.id); toast.success("Removed from wishlist"); }}
                      className="p-2 border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-full"
                    >
                      <Heart size={14} className="fill-current" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
