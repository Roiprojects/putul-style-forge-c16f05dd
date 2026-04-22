import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

interface Stuck {
  id: string;
  customer_name: string;
  total: number;
  reason: string;
  created_at: string;
}

const StuckOrdersAlert = () => {
  const [items, setItems] = useState<Stuck[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const now = Date.now();
    const h24 = new Date(now - 24 * 3600 * 1000).toISOString();
    const h48 = new Date(now - 48 * 3600 * 1000).toISOString();
    const h2 = new Date(now - 2 * 3600 * 1000).toISOString();

    const [pending24, shipped48, pay2] = await Promise.all([
      supabase.from("orders").select("id, customer_name, total, created_at").eq("status", "pending").lt("created_at", h24).limit(20),
      supabase.from("orders").select("id, customer_name, total, created_at, awb_code").eq("status", "shipped").is("awb_code", null).lt("created_at", h48).limit(20),
      supabase.from("orders").select("id, customer_name, total, created_at").eq("payment_status", "pending").neq("payment_method", "cod").lt("created_at", h2).limit(20),
    ]);

    const merged: Stuck[] = [];
    (pending24.data || []).forEach((o: any) => merged.push({ ...o, reason: "Pending >24h" }));
    (shipped48.data || []).forEach((o: any) => merged.push({ ...o, reason: "Shipped — no AWB >48h" }));
    (pay2.data || []).forEach((o: any) => merged.push({ ...o, reason: "Payment pending >2h" }));
    merged.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    setItems(merged);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("dash-stuck").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <div className="bg-red-50/40 border border-red-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold flex items-center gap-2 text-red-800 mb-3">
        <AlertTriangle size={14} /> Stuck orders ({items.length})
      </h2>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {items.slice(0, 8).map((o) => (
          <Link key={`${o.id}-${o.reason}`} to="/admin/orders" className="flex items-center justify-between text-xs p-2 rounded hover:bg-red-100/50 transition-colors">
            <div>
              <span className="font-medium text-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-muted-foreground ml-2">{o.customer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-700 font-medium">{o.reason}</span>
              <span className="text-muted-foreground">₹{Number(o.total).toLocaleString("en-IN")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StuckOrdersAlert;
