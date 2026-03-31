import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  recentOrders: any[];
  topProducts: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const [productsRes, ordersRes, lowStockRes, recentOrdersRes, topProductsRes] =
      await Promise.all([
        supabase.from("admin_products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total", { count: "exact" }),
        supabase
          .from("admin_products")
          .select("id", { count: "exact", head: true })
          .lt("stock", 10),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("admin_products")
          .select("*")
          .order("reviews_count", { ascending: false })
          .limit(5),
      ]);

    const totalRevenue =
      ordersRes.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) ?? 0;

    setStats({
      totalProducts: productsRes.count ?? 0,
      totalOrders: ordersRes.count ?? 0,
      totalRevenue,
      lowStockCount: lowStockRes.count ?? 0,
      recentOrders: recentOrdersRes.data ?? [],
      topProducts: topProductsRes.data ?? [],
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Realtime subscription for instant sync
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back to Putul Fashions admin
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus size={14} /> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ShoppingCart size={14} /> View Orders
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-background rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={18} />
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-background rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {order.customer_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{Number(order.total).toLocaleString()}</p>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        order.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : order.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-background rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={14} /> Top Products
            </h2>
            <Link
              to="/admin/products"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.topProducts.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No products yet. Add your first product!</p>
            ) : (
              stats.topProducts.map((product) => (
                <div
                  key={product.id}
                  className="px-5 py-3 flex items-center gap-3"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-accent"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <p className="text-sm font-medium">₹{Number(product.price).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-background rounded-xl border border-border lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" /> Low Stock Alerts
            </h2>
            <Link
              to="/admin/inventory"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Manage Inventory →
            </Link>
          </div>
          <LowStockList />
        </div>
      </div>
    </div>
  );
};

const LowStockList = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("admin_products")
      .select("id, name, stock, low_stock_threshold, images")
      .lt("stock", 10)
      .order("stock", { ascending: true })
      .limit(10)
      .then(({ data }) => setProducts(data ?? []));
  }, []);

  if (products.length === 0) {
    return <p className="p-5 text-sm text-muted-foreground">All products are well-stocked 🎉</p>;
  }

  return (
    <div className="divide-y divide-border">
      {products.map((p) => (
        <div key={p.id} className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {p.images?.[0] && (
              <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover bg-accent" />
            )}
            <span className="text-sm text-foreground">{p.name}</span>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              p.stock === 0
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
