import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, MapPin, CreditCard, Tag, Package } from "lucide-react";

interface Section {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const Card = ({ title, icon: Icon, children }: Section) => (
  <div className="bg-background rounded-xl border border-border p-5">
    <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Icon size={14} /> {title}</h3>
    {children}
  </div>
);

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "#f59e0b", "#10b981", "#ef4444"];

const AdminInsights = () => {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [ltvStats, setLtvStats] = useState<{ total: number; repeat: number; avgOrders: number; avgLTV: number }>({ total: 0, repeat: 0, avgOrders: 0, avgLTV: 0 });
  const [paymentSplit, setPaymentSplit] = useState<{ name: string; value: number }[]>([]);
  const [codRTO, setCodRTO] = useState<number>(0);
  const [geo, setGeo] = useState<{ state: string; orders: number }[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [orderItems, orders, productsList, codStats, couponData] = await Promise.all([
        supabase.from("order_items").select("product_id, product_name, quantity, total_price, created_at").gte("created_at", sevenDaysAgo),
        supabase.from("orders").select("id, user_id, total, payment_method, status, shipping_address, coupon_code, created_at").neq("status", "cancelled"),
        supabase.from("admin_products").select("id, name, category_id, admin_categories(name)"),
        supabase.from("orders").select("status, payment_method").ilike("payment_method", "%cod%"),
        supabase.from("coupons").select("code, used_count, discount_type, discount_value"),
      ]);

      // Top products this week
      const productAgg: Record<string, { name: string; revenue: number; units: number }> = {};
      (orderItems.data || []).forEach((i: any) => {
        const k = i.product_id || i.product_name;
        if (!productAgg[k]) productAgg[k] = { name: i.product_name, revenue: 0, units: 0 };
        productAgg[k].revenue += Number(i.total_price || 0);
        productAgg[k].units += Number(i.quantity || 0);
      });
      setTopProducts(Object.values(productAgg).sort((a, b) => b.revenue - a.revenue).slice(0, 8));

      // Top categories
      const productMap: Record<string, string> = {};
      (productsList.data || []).forEach((p: any) => { productMap[p.id] = p.admin_categories?.name || "Uncategorized"; });
      const catAgg: Record<string, number> = {};
      (orderItems.data || []).forEach((i: any) => {
        const cat = productMap[i.product_id] || "Uncategorized";
        catAgg[cat] = (catAgg[cat] || 0) + Number(i.total_price || 0);
      });
      setTopCategories(Object.entries(catAgg).map(([name, revenue]) => ({ name, revenue: Math.round(revenue) })).sort((a, b) => b.revenue - a.revenue).slice(0, 6));

      // Customer LTV / repeat
      const userOrders: Record<string, { count: number; total: number }> = {};
      (orders.data || []).forEach((o: any) => {
        if (!o.user_id) return;
        if (!userOrders[o.user_id]) userOrders[o.user_id] = { count: 0, total: 0 };
        userOrders[o.user_id].count++;
        userOrders[o.user_id].total += Number(o.total || 0);
      });
      const customers = Object.values(userOrders);
      const repeat = customers.filter((c) => c.count > 1).length;
      const totalRev = customers.reduce((s, c) => s + c.total, 0);
      const totalOrd = customers.reduce((s, c) => s + c.count, 0);
      setLtvStats({
        total: customers.length,
        repeat,
        avgOrders: customers.length ? totalOrd / customers.length : 0,
        avgLTV: customers.length ? totalRev / customers.length : 0,
      });

      // Payment split (COD vs Online)
      let cod = 0, online = 0;
      (orders.data || []).forEach((o: any) => {
        if ((o.payment_method || "").toLowerCase().includes("cod")) cod++; else online++;
      });
      setPaymentSplit([{ name: "Online", value: online }, { name: "COD", value: cod }]);

      // COD RTO rate (cancelled or returned COD orders / total COD)
      const codAll = codStats.data || [];
      const codFailed = codAll.filter((o: any) => ["cancelled", "returned", "rto"].includes((o.status || "").toLowerCase())).length;
      setCodRTO(codAll.length ? (codFailed / codAll.length) * 100 : 0);

      // Geography
      const states: Record<string, number> = {};
      (orders.data || []).forEach((o: any) => {
        const addr = (o.shipping_address || "").toLowerCase();
        // crude state extraction — last comma-separated chunk before pincode often has state
        const m = addr.match(/,\s*([a-z\s]+?)(?:\s*-?\s*\d{6})?$/i);
        const state = m ? m[1].trim() : "Unknown";
        const key = state.length > 30 ? "Unknown" : state.replace(/\b\w/g, (c) => c.toUpperCase());
        states[key] = (states[key] || 0) + 1;
      });
      setGeo(Object.entries(states).map(([state, orders]) => ({ state, orders })).sort((a, b) => b.orders - a.orders).slice(0, 8));

      // Coupon performance
      const couponRevenue: Record<string, number> = {};
      const couponOrderCount: Record<string, number> = {};
      (orders.data || []).forEach((o: any) => {
        if (o.coupon_code) {
          couponRevenue[o.coupon_code] = (couponRevenue[o.coupon_code] || 0) + Number(o.total || 0);
          couponOrderCount[o.coupon_code] = (couponOrderCount[o.coupon_code] || 0) + 1;
        }
      });
      setCoupons((couponData.data || []).map((c: any) => ({
        code: c.code,
        uses: c.used_count || 0,
        revenue: couponRevenue[c.code] || 0,
        orders: couponOrderCount[c.code] || 0,
        aov: couponOrderCount[c.code] ? (couponRevenue[c.code] / couponOrderCount[c.code]) : 0,
      })).sort((a: any, b: any) => b.revenue - a.revenue));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading insights…</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Business insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Trends, customer value, and channel performance.</p>
      </div>

      {/* Customer LTV strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-[11px] text-muted-foreground">Total customers</p>
          <p className="text-xl font-semibold mt-1">{ltvStats.total}</p>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-[11px] text-muted-foreground">Repeat buyers</p>
          <p className="text-xl font-semibold mt-1">{ltvStats.repeat} <span className="text-xs text-muted-foreground">({ltvStats.total ? ((ltvStats.repeat / ltvStats.total) * 100).toFixed(0) : 0}%)</span></p>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-[11px] text-muted-foreground">Avg orders / customer</p>
          <p className="text-xl font-semibold mt-1">{ltvStats.avgOrders.toFixed(1)}</p>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-[11px] text-muted-foreground">Avg lifetime value</p>
          <p className="text-xl font-semibold mt-1">₹{Math.round(ltvStats.avgLTV).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Top products this week" icon={TrendingUp}>
          {topProducts.length === 0 ? <p className="text-xs text-muted-foreground">No sales this week yet.</p> : (
            <div className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">{p.units} units</span>
                  <span className="font-medium ml-3 w-24 text-right">₹{p.revenue.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Top categories (by revenue)" icon={Package}>
          {topCategories.length === 0 ? <p className="text-xs text-muted-foreground">No data.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCategories} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`} contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Payment split + COD RTO rate" icon={CreditCard}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={paymentSplit} dataKey="value" nameKey="name" outerRadius={60} label={(e: any) => `${e.name} ${((e.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {paymentSplit.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground">COD RTO / cancellation rate</p>
              <p className={`text-2xl font-semibold mt-1 ${codRTO > 30 ? "text-red-600" : codRTO > 15 ? "text-amber-600" : "text-emerald-600"}`}>
                {codRTO.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {codRTO > 30 ? "⚠ High — review COD policy" : codRTO > 15 ? "Moderate — monitor" : "Healthy"}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Top customer states" icon={MapPin}>
          {geo.length === 0 ? <p className="text-xs text-muted-foreground">No data.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={geo}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Coupon performance" icon={Tag}>
          {coupons.length === 0 ? <p className="text-xs text-muted-foreground">No coupons created.</p> : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-muted-foreground"><th className="px-2 py-1.5">Code</th><th className="px-2 py-1.5">Uses</th><th className="px-2 py-1.5">Orders</th><th className="px-2 py-1.5">Revenue</th><th className="px-2 py-1.5">AOV</th></tr></thead>
                <tbody>
                  {coupons.slice(0, 10).map((c) => (
                    <tr key={c.code} className="border-t border-border">
                      <td className="px-2 py-1.5 font-mono">{c.code}</td>
                      <td className="px-2 py-1.5">{c.uses}</td>
                      <td className="px-2 py-1.5">{c.orders}</td>
                      <td className="px-2 py-1.5">₹{Math.round(c.revenue).toLocaleString("en-IN")}</td>
                      <td className="px-2 py-1.5">₹{Math.round(c.aov).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[10px] text-muted-foreground mt-2 px-2">Note: revenue tracked from new orders going forward.</p>
            </div>
          )}
        </Card>

        <Card title="Customer summary" icon={Users}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Repeat purchase rate</span><span className="font-medium">{ltvStats.total ? ((ltvStats.repeat / ltvStats.total) * 100).toFixed(1) : 0}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">First-time buyers</span><span className="font-medium">{ltvStats.total - ltvStats.repeat}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Avg revenue / customer</span><span className="font-medium">₹{Math.round(ltvStats.avgLTV).toLocaleString("en-IN")}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminInsights;
