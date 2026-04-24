import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Repeat } from "lucide-react";

const CustomerInsights = () => {
  const [stats, setStats] = useState({ total: 0, repeat: 0, avgOrderValue: 0, ltv: 0 });

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("user_id, total")
        .eq("payment_status", "paid");

      if (!orders) return;

      const byUser: Record<string, { count: number; total: number }> = {};
      orders.forEach((o) => {
        if (!o.user_id) return;
        if (!byUser[o.user_id]) byUser[o.user_id] = { count: 0, total: 0 };
        byUser[o.user_id].count++;
        byUser[o.user_id].total += Number(o.total);
      });

      const users = Object.values(byUser);
      const total = users.length;
      const repeat = users.filter((u) => u.count > 1).length;
      const totalRev = users.reduce((s, u) => s + u.total, 0);
      const avgOrderValue = orders.length ? totalRev / orders.length : 0;
      const ltv = total ? totalRev / total : 0;

      setStats({
        total,
        repeat,
        avgOrderValue: Math.round(avgOrderValue),
        ltv: Math.round(ltv),
      });
    })();
  }, []);

  const items = [
    { label: "Total Customers", value: stats.total, icon: Users },
    { label: "Repeat Buyers", value: stats.repeat, icon: Repeat },
    { label: "Avg Order Value", value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: TrendingUp },
    { label: "Customer LTV", value: `₹${stats.ltv.toLocaleString()}`, icon: TrendingUp },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.label} className="bg-muted/40 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <it.icon className="h-4 w-4" />
                <span className="text-xs">{it.label}</span>
              </div>
              <p className="text-lg font-semibold">{it.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInsights;
