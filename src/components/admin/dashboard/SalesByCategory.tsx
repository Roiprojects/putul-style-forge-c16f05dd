import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

const SalesByCategory = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data: items } = await supabase
        .from("order_items")
        .select("total_price, product_id, admin_products(category_id, admin_categories(name))")
        .gte("created_at", since.toISOString());

      if (!items) return;

      const totals: Record<string, number> = {};
      items.forEach((it: any) => {
        const cat = it.admin_products?.admin_categories?.name || "Uncategorized";
        totals[cat] = (totals[cat] || 0) + Number(it.total_price);
      });

      setData(
        Object.entries(totals)
          .map(([name, value]) => ({ name, value: Math.round(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
      );
    })();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales by Category (30d)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesByCategory;
