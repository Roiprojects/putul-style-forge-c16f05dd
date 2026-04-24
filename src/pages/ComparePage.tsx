import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";

const ComparePage = () => {
  const { items, remove, clear } = useCompare();
  const { addToCart } = useStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif mb-3">No products to compare</h1>
        <p className="text-muted-foreground mb-6">
          Add products from the shop to compare them side by side.
        </p>
        <Link to="/shop">
          <Button>Browse Shop</Button>
        </Link>
      </div>
    );
  }

  const rows = [
    { label: "Price", value: (p: any) => `₹${p.price.toLocaleString()}` },
    { label: "Original Price", value: (p: any) => p.originalPrice ? `₹${p.originalPrice.toLocaleString()}` : "-" },
    { label: "Rating", value: (p: any) => `${p.rating ?? 0} ★` },
    { label: "Reviews", value: (p: any) => p.reviewCount ?? 0 },
    { label: "Colors", value: (p: any) => p.colors?.length ? p.colors.join(", ") : "-" },
    { label: "Sizes", value: (p: any) => p.sizes?.length ? p.sizes.join(", ") : "-" },
    { label: "Fabric", value: (p: any) => p.fabric || "-" },
    { label: "Stock", value: (p: any) => p.stock ?? "-" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-serif">Compare Products</h1>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-muted-foreground p-3 w-32"></th>
              {items.map((p) => (
                <th key={p.id} className="p-3 min-w-[200px]">
                  <div className="relative bg-muted rounded-2xl overflow-hidden">
                    <button
                      onClick={() => remove(p.id)}
                      className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur p-1 rounded-full hover:bg-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Link to={`/product/${p.id}`}>
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-full aspect-square object-cover"
                      />
                    </Link>
                  </div>
                  <Link to={`/product/${p.id}`}>
                    <p className="font-medium text-sm mt-3 text-left line-clamp-2 hover:underline">
                      {p.name}
                    </p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="text-xs font-medium text-muted-foreground p-3">{row.label}</td>
                {items.map((p) => (
                  <td key={p.id} className="text-sm p-3">{row.value(p)}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-3"></td>
              {items.map((p) => (
                <td key={p.id} className="p-3">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      addToCart(p, p.sizes?.[0] || "M", p.colors?.[0] || "Default");
                      toast.success(`${p.name} added to cart`);
                    }}
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
