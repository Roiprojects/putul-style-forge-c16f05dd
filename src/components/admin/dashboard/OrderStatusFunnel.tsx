import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STAGES = [
  { key: "pending", label: "Pending", color: "bg-slate-400" },
  { key: "confirmed", label: "Confirmed", color: "bg-blue-400" },
  { key: "shipped", label: "Shipped", color: "bg-amber-400" },
  { key: "delivered", label: "Delivered", color: "bg-emerald-500" },
  { key: "cancelled", label: "Cancelled", color: "bg-red-400" },
];

const OrderStatusFunnel = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from("orders").select("status").gte("created_at", since);
    const c: Record<string, number> = {};
    (data || []).forEach((o: any) => {
      const k = (o.status || "pending").toLowerCase();
      c[k] = (c[k] || 0) + 1;
    });
    setCounts(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("dash-funnel").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const max = Math.max(1, ...STAGES.map((s) => counts[s.key] || 0));

  return (
    <div className="bg-background rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold mb-4">Order pipeline (30 days)</h2>
      <div className="space-y-2.5">
        {STAGES.map((s) => {
          const v = counts[s.key] || 0;
          const pct = (v / max) * 100;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">{s.label}</span>
              <div className="flex-1 h-6 bg-muted/50 rounded overflow-hidden">
                <div className={`h-full ${s.color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium w-10 text-right">{loading ? "…" : v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusFunnel;
