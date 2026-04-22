import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

type Range = 7 | 30 | 90;

const RevenueChart = () => {
  const [range, setRange] = useState<Range>(7);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - range * 2 * 86400000).toISOString();
      const { data } = await supabase.from("orders").select("total, created_at").gte("created_at", since).neq("status", "cancelled");
      setOrders(data || []);
      setLoading(false);
    };
    load();
    const ch = supabase.channel("dash-revenue").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [range]);

  const { chartData, current, previous, delta } = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const buckets: Record<string, number> = {};
    const prevBuckets: Record<string, number> = {};

    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }

    let curTotal = 0, prevTotal = 0;
    orders.forEach((o: any) => {
      const ts = +new Date(o.created_at);
      const ageDays = (now - ts) / dayMs;
      const total = Number(o.total || 0);
      if (ageDays < range) {
        const key = new Date(ts).toISOString().slice(0, 10);
        if (key in buckets) buckets[key] += total;
        curTotal += total;
      } else if (ageDays < range * 2) {
        prevTotal += total;
      }
    });

    const data = Object.entries(buckets).map(([d, v]) => ({
      date: new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: Math.round(v),
    }));

    const delta = prevTotal === 0 ? (curTotal > 0 ? 100 : 0) : ((curTotal - prevTotal) / prevTotal) * 100;
    return { chartData: data, current: curTotal, previous: prevTotal, delta };
  }, [orders, range]);

  const up = delta >= 0;

  return (
    <div className="bg-background rounded-xl border border-border p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">Revenue</h2>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold">₹{current.toLocaleString("en-IN")}</p>
            <span className={`text-xs font-medium flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-600"}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">vs ₹{previous.toLocaleString("en-IN")} previous {range}d</p>
        </div>
        <div className="flex gap-1 bg-muted/50 p-0.5 rounded-md">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as Range)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${range === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <div className="h-48">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
