import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Package, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Order {
  id: string;
  invoice_number: string | null;
  status: string;
  total: number;
  created_at: string;
}

const OrdersPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchOrders(session.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchOrders = async (userId: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, invoice_number, status, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const statusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ClipboardList size={48} className="text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-heading font-semibold text-foreground mb-2">Sign in to view orders</h1>
        <p className="text-sm text-muted-foreground">Please sign in to see your order history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <Package size={48} className="text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-heading font-semibold text-foreground mb-2">No Orders Yet</h1>
        <p className="text-sm text-muted-foreground mb-6">You haven't placed any orders yet.</p>
        <Link to="/shop" className="px-6 py-3 bg-foreground text-background text-sm font-medium tracking-wide uppercase hover:bg-foreground/90 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-heading font-semibold text-foreground mb-6">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-accent/30 transition-colors block">
            <div>
              <p className="text-sm font-medium text-foreground">
                {order.invoice_number || `#${order.id.slice(0, 8)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">₹{order.total.toLocaleString("en-IN")}</p>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
