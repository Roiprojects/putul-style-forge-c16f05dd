import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order ${status}`);
      fetchOrders();
    }
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setOrderItems(data ?? []);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {["all", ...statusOptions].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-[11px] font-medium rounded-lg transition-colors ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
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
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No orders found</td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">₹{Number(order.total).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${
                          order.status === "delivered"
                            ? "bg-green-50 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => viewOrder(order)}
                        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background w-full max-w-lg rounded-xl border border-border p-6 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Email</p>
                    <p>{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Phone</p>
                    <p>{selectedOrder.customer_phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Payment</p>
                    <p>{selectedOrder.payment_method || "—"} ({selectedOrder.payment_status})</p>
                  </div>
                </div>
                {selectedOrder.shipping_address && (
                  <div>
                    <p className="text-[11px] text-muted-foreground">Shipping Address</p>
                    <p>{selectedOrder.shipping_address}</p>
                  </div>
                )}
                <hr className="border-border" />
                <h3 className="font-semibold">Items</h3>
                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground">No items</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">₹{Number(item.total_price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
