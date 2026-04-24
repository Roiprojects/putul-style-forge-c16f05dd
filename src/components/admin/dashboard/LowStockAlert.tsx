import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number | null;
  images: string[] | null;
}

const LowStockAlert = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      const { data } = await supabase
        .from("admin_products")
        .select("id, name, stock, low_stock_threshold, images")
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(50);

      const filtered = (data || []).filter(
        (p) => p.stock <= (p.low_stock_threshold ?? 10)
      );
      setProducts(filtered.slice(0, 8));
      setLoading(false);
    };
    fetchLowStock();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="font-semibold text-foreground">Low Stock Alert</h2>
          <Badge variant="destructive">{products.length}</Badge>
        </div>
        <Link
          to="/admin/inventory"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/admin/products`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-muted-foreground m-auto mt-2.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                Threshold: {p.low_stock_threshold ?? 10}
              </p>
            </div>
            <Badge
              variant={p.stock === 0 ? "destructive" : "secondary"}
              className="flex-shrink-0"
            >
              {p.stock === 0 ? "Out" : `${p.stock} left`}
            </Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default LowStockAlert;
