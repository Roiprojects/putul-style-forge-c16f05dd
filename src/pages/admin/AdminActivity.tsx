import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

interface Log {
  id: string;
  admin_user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const ENTITY_COLOR: Record<string, string> = {
  product: "bg-blue-50 text-blue-700",
  order: "bg-emerald-50 text-emerald-700",
  category: "bg-purple-50 text-purple-700",
  coupon: "bg-amber-50 text-amber-700",
  refund: "bg-red-50 text-red-700",
  cancellation: "bg-orange-50 text-orange-700",
  role: "bg-pink-50 text-pink-700",
  setting: "bg-slate-50 text-slate-700",
};

const AdminActivity = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [adminMap, setAdminMap] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      setLogs((data as any[]) || []);
      const ids = Array.from(new Set((data || []).map((l: any) => l.admin_user_id)));
      if (ids.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p.display_name || p.user_id.slice(0, 8); });
        setAdminMap(map);
      }
      setLoading(false);
    };
    load();
    const ch = supabase.channel("admin-activity").on("postgres_changes", { event: "*", schema: "public", table: "admin_activity_log" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.entity_type === filter);
  const entityTypes = Array.from(new Set(logs.map((l) => l.entity_type)));

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Activity size={20} /> Admin activity log</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit trail of every admin action.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm border border-border rounded-md px-3 py-1.5 bg-background">
          <option value="all">All entities</option>
          {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p> :
          filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No activity logged yet. Actions will appear here as admins make changes.</p> : (
          <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
            {filtered.map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-start gap-3 hover:bg-muted/30">
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${ENTITY_COLOR[l.entity_type] || "bg-muted text-muted-foreground"}`}>{l.entity_type}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{adminMap[l.admin_user_id] || "Admin"}</span>{" "}
                    <span className="text-muted-foreground">{l.action_type}</span>
                    {l.entity_id && <span className="text-muted-foreground font-mono text-xs ml-1">#{l.entity_id.slice(0, 8)}</span>}
                  </p>
                  {l.details && Object.keys(l.details).length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {Object.entries(l.details).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" • ")}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivity;
