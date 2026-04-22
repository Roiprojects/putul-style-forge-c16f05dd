import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, PackageX, MapPin, CreditCard, Star } from "lucide-react";

const Card = ({ title, icon: Icon, count, children, tone = "default" }: any) => (
  <div className={`bg-background rounded-xl border p-5 ${tone === "danger" ? "border-red-200 bg-red-50/30" : tone === "warn" ? "border-amber-200 bg-amber-50/30" : "border-border"}`}>
    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
      <Icon size={14} /> {title}
      {typeof count === "number" && <span className="text-xs font-normal text-muted-foreground">({count})</span>}
    </h3>
    {children}
  </div>
);

const AdminAlerts = () => {
  const [oversold, setOversold] = useState<any[]>([]);
  const [outActive, setOutActive] = useState<any[]>([]);
  const [lowVariants, setLowVariants] = useState<any[]>([]);
  const [rtoPincodes, setRtoPincodes] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [negativeReviews, setNegativeReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [outAct, variants, allOrders, failed, negRev] = await Promise.all([
        supabase.from("admin_products").select("id, name, stock, is_active").eq("is_active", true).eq("stock", 0),
        supabase.from("product_variants").select("id, color, size, stock, product_id, admin_products(name)").lte("stock", 3),
        supabase.from("orders").select("status, shipping_address, payment_method").ilike("payment_method", "%cod%"),
        supabase.from("orders").select("id, customer_name, total, created_at, payment_status").eq("payment_status", "failed").order("created_at", { ascending: false }).limit(20),
        supabase.from("reviews").select("id, author_name, rating, comment, created_at, product_id").lte("rating", 2).eq("status", "pending").order("created_at", { ascending: false }).limit(20),
      ]);

      setOutActive(outAct.data || []);
      setLowVariants(variants.data || []);
      setFailedPayments(failed.data || []);
      setNegativeReviews(negRev.data || []);

      // RTO by pincode (extract 6-digit pincode from address)
      const pinStats: Record<string, { total: number; failed: number }> = {};
      (allOrders.data || []).forEach((o: any) => {
        const m = (o.shipping_address || "").match(/\b(\d{6})\b/);
        if (!m) return;
        const pin = m[1];
        if (!pinStats[pin]) pinStats[pin] = { total: 0, failed: 0 };
        pinStats[pin].total++;
        if (["cancelled", "returned", "rto"].includes((o.status || "").toLowerCase())) pinStats[pin].failed++;
      });
      const risky = Object.entries(pinStats)
        .filter(([_, s]) => s.total >= 3 && s.failed / s.total > 0.3)
        .map(([pincode, s]) => ({ pincode, total: s.total, failed: s.failed, rate: (s.failed / s.total) * 100 }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 10);
      setRtoPincodes(risky);

      // Oversold = active with stock=0 but pending orders
      const { data: pendingOrderItems } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, orders!inner(status)")
        .in("orders.status", ["pending", "confirmed"]);
      const pendingByProduct: Record<string, number> = {};
      (pendingOrderItems || []).forEach((i: any) => {
        if (!i.product_id) return;
        pendingByProduct[i.product_id] = (pendingByProduct[i.product_id] || 0) + Number(i.quantity || 0);
      });
      const oversoldList = (outAct.data || []).filter((p: any) => pendingByProduct[p.id] > 0).map((p: any) => ({ ...p, pending: pendingByProduct[p.id] }));
      setOversold(oversoldList);

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading alerts…</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Smart alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Issues that need attention before they cost you money or trust.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Oversold — out of stock with pending orders" icon={AlertTriangle} count={oversold.length} tone="danger">
          {oversold.length === 0 ? <p className="text-xs text-muted-foreground">None — you're not overselling 🎉</p> : (
            <div className="space-y-2">
              {oversold.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <Link to={`/admin/products/${p.id}`} className="hover:underline">{p.name}</Link>
                  <span className="text-red-700 font-medium text-xs">{p.pending} pending order(s)</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Out of stock but still active" icon={PackageX} count={outActive.length} tone="warn">
          {outActive.length === 0 ? <p className="text-xs text-muted-foreground">All active products have stock.</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {outActive.slice(0, 15).map((p: any) => (
                <Link key={p.id} to={`/admin/products/${p.id}`} className="block text-sm hover:underline">{p.name}</Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Low-stock variants (≤3)" icon={PackageX} count={lowVariants.length}>
          {lowVariants.length === 0 ? <p className="text-xs text-muted-foreground">All variants are well-stocked.</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {lowVariants.slice(0, 15).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span>{v.admin_products?.name || "—"} — {v.size}/{v.color}</span>
                  <span className={`text-xs font-medium ${v.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{v.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="High-risk pincodes (COD RTO >30%)" icon={MapPin} count={rtoPincodes.length} tone={rtoPincodes.length > 0 ? "warn" : "default"}>
          {rtoPincodes.length === 0 ? <p className="text-xs text-muted-foreground">No high-risk pincodes detected yet.</p> : (
            <div className="space-y-1.5">
              {rtoPincodes.map((p) => (
                <div key={p.pincode} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{p.pincode}</span>
                  <span className="text-xs text-muted-foreground">{p.failed}/{p.total} failed</span>
                  <span className="text-xs font-semibold text-red-700">{p.rate.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Failed payments needing recovery" icon={CreditCard} count={failedPayments.length}>
          {failedPayments.length === 0 ? <p className="text-xs text-muted-foreground">No failed payments.</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {failedPayments.map((o: any) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between text-sm hover:bg-muted/40 px-2 py-1 rounded">
                  <span>#{o.id.slice(0, 8).toUpperCase()} — {o.customer_name}</span>
                  <span className="text-xs">₹{Number(o.total).toLocaleString("en-IN")}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Negative reviews awaiting response" icon={Star} count={negativeReviews.length} tone={negativeReviews.length > 0 ? "warn" : "default"}>
          {negativeReviews.length === 0 ? <p className="text-xs text-muted-foreground">No pending negative reviews.</p> : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {negativeReviews.map((r: any) => (
                <Link key={r.id} to="/admin/reviews" className="block hover:bg-muted/40 p-2 rounded">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">{r.author_name}</span>
                    <span className="text-amber-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.comment || "No comment"}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminAlerts;
