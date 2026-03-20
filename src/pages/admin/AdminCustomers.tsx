import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Eye, X, ShieldOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  const fetchCustomers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }

    // Get order stats per user
    const { data: orders } = await supabase.from("orders").select("user_id, total");
    const statsMap: Record<string, { count: number; spent: number }> = {};
    (orders ?? []).forEach((o) => {
      if (!o.user_id) return;
      if (!statsMap[o.user_id]) statsMap[o.user_id] = { count: 0, spent: 0 };
      statsMap[o.user_id].count++;
      statsMap[o.user_id].spent += Number(o.total);
    });

    setCustomers(
      (profiles ?? []).map((p) => ({
        ...p,
        order_count: statsMap[p.user_id]?.count ?? 0,
        total_spent: statsMap[p.user_id]?.spent ?? 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const toggleBlock = async (profile: any) => {
    const newVal = !profile.is_blocked;
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: newVal })
      .eq("id", profile.id);
    if (error) toast.error(error.message);
    else { toast.success(newVal ? "Customer blocked" : "Customer unblocked"); fetchCustomers(); }
  };

  const viewCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", customer.user_id)
      .order("created_at", { ascending: false });
    setCustomerOrders(data ?? []);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.display_name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.user_id?.includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer accounts</p>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Orders</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No customers found</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">{c.display_name || "—"}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{c.user_id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-3 text-sm">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-sm font-medium">{c.order_count}</td>
                    <td className="px-5 py-3 text-sm font-medium">₹{c.total_spent.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${c.is_blocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {c.is_blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-1">
                      <button onClick={() => viewCustomer(c)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => toggleBlock(c)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title={c.is_blocked ? "Unblock" : "Block"}>
                        {c.is_blocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedCustomer(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-background w-full max-w-lg rounded-xl border border-border p-6 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Customer Details</h2>
                <button onClick={() => setSelectedCustomer(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[11px] text-muted-foreground">Name</p><p className="font-medium">{selectedCustomer.display_name || "—"}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Phone</p><p>{selectedCustomer.phone || "—"}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Orders</p><p className="font-medium">{selectedCustomer.order_count}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Total Spent</p><p className="font-medium">₹{selectedCustomer.total_spent.toLocaleString()}</p></div>
                </div>
                <hr className="border-border" />
                <h3 className="font-semibold">Order History</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((o) => (
                      <div key={o.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-mono text-xs">{o.id.slice(0, 8)}...</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{Number(o.total).toLocaleString()}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${o.status === "delivered" ? "bg-green-50 text-green-700" : o.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
