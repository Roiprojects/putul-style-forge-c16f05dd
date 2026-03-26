import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { data: products = [] } = useProducts();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl mb-2">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-6">Save items you love by clicking the heart icon.</p>
        <Link to="/shop" className="btn-primary inline-block">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistProducts.map(product => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden bg-accent aspect-[3/4]">
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
                    className="flex-1 bg-primary text-primary-foreground py-2 text-xs tracking-widest uppercase flex items-center justify-center gap-1"
                  >
                    <ShoppingBag size={12} /> Add to Cart
                  </button>
                  <button
                    onClick={() => { toggleWishlist(product.id); toast.success("Removed from wishlist"); }}
                    className="p-2 border border-border text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Heart size={14} className="fill-current" />
                  </button>
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
