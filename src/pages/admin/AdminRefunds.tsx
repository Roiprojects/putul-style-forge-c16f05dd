import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RotateCcw, Search } from "lucide-react";

const refundStatuses = ["requested", "approved", "refunded", "rejected"];

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRefunds = async () => {
    const { data } = await supabase.from("returns").select("*").order("created_at", { ascending: false });
    const enriched = await Promise.all(
      (data ?? []).map(async (r) => {
        const { data: order } = await supabase
          .from("orders")
          .select("customer_name, customer_email, customer_phone, total, payment_method, payment_status, status")
          .eq("id", r.order_id)
          .single();
        return { ...r, order };
      })
    );
    setRefunds(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchRefunds();

    const channel = supabase
      .channel('admin-refunds-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
        fetchRefunds();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchRefunds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateRefundStatus = async (returnId: string, status: string) => {
    const { error } = await supabase.from("returns").update({ status }).eq("id", returnId);
    if (error) toast.error(error.message);
    else toast.success(`Refund ${status}`);
  };

  const updateRefundAmount = async (returnId: string, amount: number) => {
    const { error } = await supabase.from("returns").update({ refund_amount: amount }).eq("id", returnId);
    if (error) toast.error(error.message);
    else toast.success("Refund amount updated");
  };

  const updateAdminNotes = async (returnId: string, notes: string) => {
    const { error } = await supabase.from("returns").update({ admin_notes: notes }).eq("id", returnId);
    if (error) toast.error(error.message);
    else toast.success("Notes saved");
  };

  const filtered = refunds.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.order?.customer_name?.toLowerCase().includes(q) ||
      r.order?.customer_email?.toLowerCase().includes(q) ||
      r.id.includes(search) ||
      r.order_id.includes(search);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: refunds.length,
    requested: refunds.filter((r) => r.status === "requested").length,
    approved: refunds.filter((r) => r.status === "approved").length,
    refunded: refunds.filter((r) => r.status === "refunded").length,
    rejected: refunds.filter((r) => r.status === "rejected").length,
    totalAmount: refunds.filter((r) => r.status === "refunded").reduce((s, r) => s + Number(r.refund_amount || 0), 0),
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <RotateCcw size={22} /> Refunds
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage refund requests in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Requests", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.requested, color: "text-amber-600" },
          { label: "Approved", value: stats.approved, color: "text-blue-600" },
          { label: "Refunded", value: stats.refunded, color: "text-green-600" },
          { label: "Total Refunded", value: `₹${stats.totalAmount.toLocaleString()}`, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-background border border-border rounded-xl p-4">
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search refunds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {["all", ...refundStatuses].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-[11px] font-medium rounded-lg transition-colors ${
                statusFilter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No refund requests</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{r.id.slice(0, 8)}...</td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">{r.order?.customer_name ?? "—"}</p>
                      <p className="text-[11px] text-muted-foreground">{r.order?.customer_email ?? ""}</p>
                    </td>
                    <td className="px-5 py-3 text-sm max-w-[180px] truncate">{r.reason}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        defaultValue={r.refund_amount || 0}
                        onBlur={(e) => updateRefundAmount(r.id, Number(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => updateRefundStatus(r.id, e.target.value)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${
                          r.status === "refunded"
                            ? "bg-green-50 text-green-700"
                            : r.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : r.status === "approved"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {refundStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        defaultValue={r.admin_notes || ""}
                        onBlur={(e) => updateAdminNotes(r.id, e.target.value)}
                        placeholder="Add note..."
                        className="w-32 px-2 py-1 text-[11px] border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;
