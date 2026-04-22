import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, IndianRupee, Truck, AlertOctagon, PackageX } from "lucide-react";

interface Snap {
  ordersToday: number;
  revenueToday: number;
  pendingShipments: number;
  urgentCancellations: number;
  lowStock: number;
}

const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const TodaySnapshot = () => {
  const [s, setS] = useState<Snap>({ ordersToday: 0, revenueToday: 0, pendingShipments: 0, urgentCancellations: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const today = startOfTodayISO();
    const [ordersToday, pending, cancels, lowStock] = await Promise.all([
      supabase.from("orders").select("total", { count: "exact" }).gte("created_at", today),
      supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["confirmed", "processing", "pending"]),
      supabase.from("cancellation_requests").select("id", { count: "exact", head: true }).eq("status", "pending").neq("request_type", "direct_cancel"),
      supabase.from("admin_products").select("id", { count: "exact", head: true }).lt("stock", 10),
    ]);
    const revenueToday = (ordersToday.data || []).reduce((sum, o: any) => sum + Number(o.total || 0), 0);
    setS({
      ordersToday: ordersToday.count ?? 0,
      revenueToday,
      pendingShipments: pending.count ?? 0,
      urgentCancellations: cancels.count ?? 0,
      lowStock: lowStock.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("dash-snapshot")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "cancellation_requests" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_products" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const cards = [
    { label: "Orders today", value: s.ordersToday, icon: ShoppingCart, color: "bg-blue-50 text-blue-700", to: "/admin/orders" },
    { label: "Revenue today", value: `₹${s.revenueToday.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-700", to: "/admin/orders" },
    { label: "Pending shipments", value: s.pendingShipments, icon: Truck, color: "bg-amber-50 text-amber-700", to: "/admin/orders" },
    { label: "Urgent cancellations", value: s.urgentCancellations, icon: AlertOctagon, color: "bg-red-50 text-red-700", to: "/admin/cancellations", urgent: s.urgentCancellations > 0 },
    { label: "Low stock", value: s.lowStock, icon: PackageX, color: "bg-orange-50 text-orange-700", to: "/admin/inventory" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className={`relative bg-background rounded-xl border p-4 hover:shadow-sm transition-all ${c.urgent ? "border-red-300" : "border-border"}`}
        >
          {c.urgent && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <div className={`inline-flex p-2 rounded-lg mb-3 ${c.color}`}>
            <c.icon size={16} />
          </div>
          <p className="text-xl font-semibold text-foreground">{loading ? "—" : c.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{c.label}</p>
        </Link>
      ))}
    </div>
  );
};

export default TodaySnapshot;
