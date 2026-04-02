import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Package, MapPin, Heart, LogOut, ChevronRight, 
  Edit2, Trash2, ShoppingBag, Clock, CheckCircle, Truck, X, Mail, Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { User as SupaUser } from "@supabase/supabase-js";

type Tab = "overview" | "orders" | "addresses" | "wishlist";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method: string | null;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  house_no: string;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface Profile {
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useStore();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchAll(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchAll = async (userId: string) => {
    const [profileRes, ordersRes, addressRes] = await Promise.all([
      supabase.from("profiles").select("display_name, phone, avatar_url").eq("user_id", userId).single(),
      supabase.from("orders").select("id, status, total, created_at, payment_method").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("saved_addresses").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (addressRes.data) setAddresses(addressRes.data);
    setLoading(false);
  };

  // Fetch wishlist products
  useEffect(() => {
    if (wishlist.length === 0) { setWishlistProducts([]); return; }
    supabase
      .from("admin_products")
      .select("id, name, price, original_price, images")
      .in("id", wishlist)
      .then(({ data }) => {
        if (data) setWishlistProducts(data);
      });
  }, [wishlist]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName.trim() })
      .eq("user_id", user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: newName.trim() } : prev);
      setEditingName(false);
      toast.success("Name updated!");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id);
    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success("Address deleted");
    }
  };

  const statusIcon = (s: string) => {
    switch (s.toLowerCase()) {
      case "delivered": return <CheckCircle size={14} className="text-green-600" />;
      case "shipped": return <Truck size={14} className="text-blue-600" />;
      case "confirmed": return <Clock size={14} className="text-amber-600" />;
      default: return <Package size={14} className="text-muted-foreground" />;
    }
  };

  const statusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "delivered": return "text-green-600";
      case "shipped": return "text-blue-600";
      case "cancelled": return "text-destructive";
      default: return "text-amber-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-24">
        <User size={48} className="text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-heading font-semibold mb-2">Sign in to view your profile</h1>
        <p className="text-sm text-muted-foreground">Please sign in to access your account.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <User size={16} /> },
    { id: "orders", label: "Orders", icon: <Package size={16} />, count: orders.length },
    { id: "addresses", label: "Addresses", icon: <MapPin size={16} />, count: addresses.length },
    { id: "wishlist", label: "Wishlist", icon: <Heart size={16} />, count: wishlist.length },
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center border border-border">
              <span className="text-xl font-heading font-bold text-foreground">
                {(profile?.display_name || user.email || "U")[0].toUpperCase()}
              </span>
            </div>
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 text-sm w-48"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="text-xs font-medium text-secondary hover:underline">Save</button>
                  <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-heading font-semibold">{profile?.display_name || "User"}</h1>
                  <button onClick={() => { setNewName(profile?.display_name || ""); setEditingName(true); }}>
                    <Edit2 size={13} className="text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{profile?.phone || user.user_metadata?.phone || user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2 border border-border rounded-lg"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-accent text-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quick Stats */}
                <div className="border border-border rounded-xl p-5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Account</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{profile?.display_name || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{profile?.phone || user.user_metadata?.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-xs">{user.email?.includes("@phone.") ? "—" : user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent Orders</p>
                    {orders.length > 0 && (
                      <button onClick={() => setActiveTab("orders")} className="text-[10px] text-secondary hover:underline">View all</button>
                    )}
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No orders yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {orders.slice(0, 3).map((o) => (
                        <div key={o.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {statusIcon(o.status)}
                            <div>
                              <p className="text-xs font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold">₹{o.total.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Addresses */}
                <div className="border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Addresses</p>
                    {addresses.length > 0 && (
                      <button onClick={() => setActiveTab("addresses")} className="text-[10px] text-secondary hover:underline">View all</button>
                    )}
                  </div>
                  {addresses.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No saved addresses</p>
                  ) : (
                    <div className="space-y-2">
                      {addresses.slice(0, 2).map((a) => (
                        <div key={a.id} className="bg-accent/50 rounded-lg p-3">
                          <p className="text-xs font-medium">{a.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {a.house_no}, {a.street}, {a.city} — {a.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div>
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No orders yet</p>
                    <Link to="/shop" className="btn-primary px-6 py-2.5 text-xs">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link key={order.id} to={`/orders/${order.id}`} className="border border-border rounded-xl p-4 md:p-5 flex items-center justify-between hover:bg-accent/30 transition-colors block">
                        <div className="flex items-center gap-3">
                          {statusIcon(order.status)}
                          <div>
                            <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {order.payment_method && ` · ${order.payment_method}`}
                            </p>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider mt-1 inline-block ${statusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums">₹{order.total.toLocaleString("en-IN")}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "addresses" && (
              <div>
                {addresses.length === 0 ? (
                  <div className="text-center py-16">
                    <MapPin size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No saved addresses</p>
                    <Link to="/cart" className="btn-primary px-6 py-2.5 text-xs">Add while checking out</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-border rounded-xl p-4 md:p-5 relative group">
                        {addr.is_default && (
                          <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <p className="text-sm font-semibold">{addr.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {addr.house_no}, {addr.street}
                          {addr.landmark ? `, ${addr.landmark}` : ""}
                          <br />
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === "wishlist" && (
              <div>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty</p>
                    <Link to="/shop" className="btn-primary px-6 py-2.5 text-xs">Explore Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {wishlistProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-[3/4] bg-accent overflow-hidden relative">
                          <img
                            src={p.images?.[0] || "/placeholder.svg"}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold">₹{p.price.toLocaleString("en-IN")}</span>
                            {p.original_price && (
                              <span className="text-[10px] text-muted-foreground line-through">₹{p.original_price.toLocaleString("en-IN")}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
