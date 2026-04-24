import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TopProduct {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

const TopProducts = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, total_price, orders!inner(created_at, status)")
        .gte("orders.created_at", thirtyDaysAgo)
        .neq("orders.status", "cancelled");

      const map = new Map<string, TopProduct>();
      (data || []).forEach((item: any) => {
        const key = item.product_id || item.product_name;
        const existing = map.get(key);
        if (existing) {
          existing.total_qty += item.quantity;
          existing.total_revenue += Number(item.total_price);
        } else {
          map.set(key, {
            product_id: key,
            product_name: item.product_name,
            total_qty: item.quantity,
            total_revenue: Number(item.total_price),
          });
        }
      });

      const sorted = Array.from(map.values())
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 5);
      setProducts(sorted);
      setLoading(false);
    };
    fetchTop();
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Top Sellers (30 days)</h2>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales yet in this period.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={p.product_id} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.total_qty} sold · ₹{p.total_revenue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TopProducts;
