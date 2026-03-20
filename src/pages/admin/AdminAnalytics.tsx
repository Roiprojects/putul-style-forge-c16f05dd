import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrder: 0 });
  const [salesByMonth, setSalesByMonth] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Orders data
      const { data: orders } = await supabase.from("orders").select("total, created_at, status");
      const { data: profiles } = await supabase.from("profiles").select("id");
      const { data: orderItems } = await supabase.from("order_items").select("product_name, total_price");

      if (orders) {
        const delivered = orders.filter(o => o.status !== "cancelled");
        const totalRevenue = delivered.reduce((sum, o) => sum + Number(o.total), 0);
        const totalOrders = delivered.length;
        setStats({
          totalRevenue,
          totalOrders,
          totalCustomers: profiles?.length || 0,
          avgOrder: totalOrders ? totalRevenue / totalOrders : 0,
        });

        // Group by month
        const monthMap: Record<string, { revenue: number; orders: number }> = {};
        delivered.forEach(o => {
          const m = new Date(o.created_at).toLocaleDateString("en", { year: "numeric", month: "short" });
          if (!monthMap[m]) monthMap[m] = { revenue: 0, orders: 0 };
          monthMap[m].revenue += Number(o.total);
          monthMap[m].orders += 1;
        });
        setSalesByMonth(Object.entries(monthMap).map(([month, d]) => ({ month, ...d })).slice(-12));
      }

      // Top products
      if (orderItems) {
        const productMap: Record<string, number> = {};
        orderItems.forEach(i => {
          productMap[i.product_name] = (productMap[i.product_name] || 0) + Number(i.total_price);
        });
        setTopProducts(
          Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, revenue]) => ({ name, revenue }))
        );
      }

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-blue-600" },
    { label: "Customers", value: stats.totalCustomers.toString(), icon: Users, color: "text-purple-600" },
    { label: "Avg Order", value: `₹${stats.avgOrder.toFixed(0)}`, icon: TrendingUp, color: "text-orange-600" },
  ];

  if (loading) return <div className="p-6 text-muted-foreground">Loading analytics...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon size={20} className={s.color} />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">Revenue by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Orders by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Products by Revenue</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No order data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="h-2 bg-muted rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">₹{p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
