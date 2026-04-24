import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Eye, X, Printer, RotateCcw, Truck, Download, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveCatalogImage } from "@/lib/catalogImage";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const returnStatuses = ["requested", "approved", "refunded", "rejected"];

type TabType = "orders" | "returns";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [tab, setTab] = useState<TabType>("orders");
  const [shiprocketLoading, setShiprocketLoading] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data ?? []);
    setLoading(false);
  };

  const fetchReturns = async () => {
    const { data } = await supabase.from("returns").select("*").order("created_at", { ascending: false });
    // Enrich with order info
    const enriched = await Promise.all(
      (data ?? []).map(async (r) => {
        const { data: order } = await supabase.from("orders").select("customer_name, customer_email, total").eq("id", r.order_id).single();
        return { ...r, order };
      })
    );
    setReturns(enriched);
  };

  useEffect(() => {
    fetchOrders();
    fetchReturns();

    // Realtime subscription for instant sync
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
        fetchReturns();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    if (status === "cancelled") {
      const { data, error } = await supabase.functions.invoke("shiprocket-cancel-order", {
        body: { order_id: orderId },
      });
      if (error || data?.success === false) {
        toast.error("Cancel failed: " + (error?.message || data?.error || "Unknown"));
        return;
      }
      toast.success("Order cancelled & synced to Shiprocket");
      fetchOrders();
      return;
    }
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success(`Order ${status}`); fetchOrders(); }
  };

  const updateReturnStatus = async (returnId: string, status: string) => {
    const { error } = await supabase.from("returns").update({ status }).eq("id", returnId);
    if (error) toast.error(error.message);
    else { toast.success(`Return ${status}`); fetchReturns(); }
  };

  const viewOrder = async (order: any) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    setOrderItems(data ?? []);
  };

  const updateTracking = async (orderId: string, tracking: string) => {
    const { error } = await supabase.from("orders").update({ tracking_number: tracking }).eq("id", orderId);
    if (error) toast.error(error.message);
    else toast.success("Tracking updated");
  };

  const handleCreateShipment = async (orderId: string) => {
    setShiprocketLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shiprocket-create-order", {
        body: { order_id: orderId },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Shipment created! AWB: " + (data?.awb_code || "Pending"));
        fetchOrders();
        if (selectedOrder?.id === orderId) viewOrder({ ...selectedOrder });
      }
    } catch (e: any) {
      toast.error("Failed to create shipment: " + (e.message || "Unknown error"));
    }
    setShiprocketLoading(false);
  };

  const handleDownloadLabel = async (type: "label" | "invoice", shipmentId?: string | null, orderId?: string | null) => {
    try {
      const body: any = { type };
      if (type === "invoice") body.order_id = orderId;
      else body.shipment_id = shipmentId;
      const { data, error } = await supabase.functions.invoke("shiprocket-labels", { body });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error(type === "invoice" ? "Invoice not available yet" : "Label not available yet");
      }
    } catch (e: any) {
      toast.error("Failed to fetch " + type + (e?.message ? ": " + e.message : ""));
    }
  };

  const printInvoice = (order: any, items: any[]) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Invoice ${order.id.slice(0, 8)}</title>
      <style>body{font-family:system-ui;padding:40px;max-width:600px;margin:auto}
      h1{font-size:20px}table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{text-align:left;padding:8px;border-bottom:1px solid #eee;font-size:13px}
      .total{font-size:16px;font-weight:bold;text-align:right;margin-top:20px}
      .meta{font-size:12px;color:#666;margin:4px 0}</style></head><body>
      <h1>Putul Fashions — Invoice</h1>
      <p class="meta">Order: ${order.id}</p>
      <p class="meta">Date: ${new Date(order.created_at).toLocaleDateString()}</p>
      <p class="meta">Customer: ${order.customer_name} (${order.customer_email})</p>
      ${order.shipping_address ? `<p class="meta">Ship to: ${order.shipping_address}</p>` : ""}
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>
      ${items.map((i) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>₹${Number(i.total_price).toLocaleString()}</td></tr>`).join("")}
      </tbody></table>
      <p class="total">Total: ₹${Number(order.total).toLocaleString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch = o.customer_name?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q) || o.id.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage orders & returns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-accent/50 p-1 rounded-lg w-fit">
        {(["orders", "returns"] as TabType[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "orders" ? "Orders" : `Returns (${returns.length})`}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex gap-1">
              {["all", ...statusOptions].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 text-[11px] font-medium rounded-lg transition-colors ${statusFilter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent"}`}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
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
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No orders found</td></tr>
                  ) : (
                    filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}...</td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium">₹{Number(order.total).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${
                              order.status === "delivered" ? "bg-green-50 text-green-700" : order.status === "cancelled" ? "bg-red-50 text-red-700" : order.status === "shipped" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                            {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => viewOrder(order)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Eye size={14} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Returns Tab */
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Return ID</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reason</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Refund</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {returns.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">No return requests</td></tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{r.id.slice(0, 8)}...</td>
                      <td className="px-5 py-3 text-sm">{r.order?.customer_name ?? "—"}</td>
                      <td className="px-5 py-3 text-sm max-w-[200px] truncate">{r.reason}</td>
                      <td className="px-5 py-3 text-sm font-medium">₹{Number(r.refund_amount).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <select value={r.status} onChange={(e) => updateReturnStatus(r.id, e.target.value)}
                          className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${
                            r.status === "refunded" ? "bg-green-50 text-green-700" : r.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          {returnStatuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-background w-full max-w-lg rounded-xl border border-border p-6 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Order Details</h2>
                <div className="flex items-center gap-2">
                   {selectedOrder.payment_status === "paid" ? (
                     <button onClick={() => printInvoice(selectedOrder, orderItems)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Print Invoice">
                       <Printer size={16} />
                     </button>
                   ) : (
                     <span className="p-2 rounded-lg text-muted-foreground opacity-40 cursor-not-allowed" title="Invoice available after payment">
                       <Printer size={16} />
                     </span>
                   )}
                  <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[11px] text-muted-foreground">Customer</p><p className="font-medium">{selectedOrder.customer_name}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Email</p><p>{selectedOrder.customer_email}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Phone</p><p>{selectedOrder.customer_phone || "—"}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Payment</p><p>{selectedOrder.payment_method?.includes("was COD") ? <><span className="text-green-600 font-medium">Paid Online</span> <span className="text-[10px] text-muted-foreground">(originally COD)</span></> : (selectedOrder.payment_method || "—")} ({selectedOrder.payment_status})</p></div>
                </div>
                {selectedOrder.shipping_address && (
                  <div><p className="text-[11px] text-muted-foreground">Shipping Address</p><p>{selectedOrder.shipping_address}</p></div>
                )}
                {/* Tracking */}
                <div>
                  <label className="text-[11px] text-muted-foreground">Tracking Number</label>
                  <input
                    defaultValue={selectedOrder.tracking_number || ""}
                    onBlur={(e) => updateTracking(selectedOrder.id, e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Enter tracking number"
                  />
                </div>
                <hr className="border-border" />
                <h3 className="font-semibold">Items</h3>
                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground">No items</p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item._image ? (
                            <img src={resolveCatalogImage(item._image, 80)} alt="" className="w-10 h-10 rounded object-cover bg-accent flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-accent flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.product_name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium flex-shrink-0">₹{Number(item.total_price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total).toLocaleString()}</span>
                </div>

                {/* Shiprocket Shipping Section */}
                <hr className="border-border" />
                <h3 className="font-semibold flex items-center gap-2"><Truck size={16} /> Shipping</h3>
                
                {selectedOrder.shiprocket_order_id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Shiprocket Order</p>
                        <p className="font-mono">{selectedOrder.shiprocket_order_id}</p>
                      </div>
                      {selectedOrder.awb_code && (
                        <div>
                          <p className="text-muted-foreground">AWB</p>
                          <p className="font-mono">{selectedOrder.awb_code}</p>
                        </div>
                      )}
                      {selectedOrder.courier_name && (
                        <div>
                          <p className="text-muted-foreground">Courier</p>
                          <p>{selectedOrder.courier_name}</p>
                        </div>
                      )}
                    </div>
                    {selectedOrder.shiprocket_shipment_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadLabel("label", selectedOrder.shiprocket_shipment_id, selectedOrder.shiprocket_order_id)}
                          className="flex items-center gap-1 text-[11px] px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors"
                        >
                          <Download size={12} /> Label
                        </button>
                        <button
                          onClick={() => handleDownloadLabel("invoice", selectedOrder.shiprocket_shipment_id, selectedOrder.shiprocket_order_id)}
                          className="flex items-center gap-1 text-[11px] px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors"
                        >
                          <Download size={12} /> Invoice
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreateShipment(selectedOrder.id)}
                    disabled={shiprocketLoading}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
                  >
                    <Package size={14} />
                    {shiprocketLoading ? "Creating..." : "Create Shipment"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
