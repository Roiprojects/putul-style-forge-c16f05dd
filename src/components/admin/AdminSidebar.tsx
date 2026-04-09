import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  LogOut,
  Users,
  Tag,
  Truck,
  CreditCard,
  Layout,
  Image,
  FileText,
  Star,
  BarChart2,
  Shield,
  Settings,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Homepage", icon: Layout, to: "/admin/homepage" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Categories", icon: FolderTree, to: "/admin/categories" },
  { label: "Orders", icon: ShoppingCart, to: "/admin/orders" },
  { label: "Customers", icon: Users, to: "/admin/customers" },
  { label: "Inventory", icon: BarChart3, to: "/admin/inventory" },
  { label: "Coupons", icon: Tag, to: "/admin/coupons" },
  
  { label: "CMS", icon: FileText, to: "/admin/cms" },
  { label: "Reviews", icon: Star, to: "/admin/reviews" },
  { label: "Analytics", icon: BarChart2, to: "/admin/analytics" },
  { label: "Shipping", icon: Truck, to: "/admin/shipping" },
  { label: "Payments", icon: CreditCard, to: "/admin/payments" },
  { label: "Refunds", icon: RotateCcw, to: "/admin/refunds" },
  { label: "Roles", icon: Shield, to: "/admin/roles" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
  { label: "AI Upload", icon: Sparkles, to: "/admin/ai-upload" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
            Putul Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70"
        >
          <ChevronLeft
            size={16}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <ChevronLeft size={14} />
          {!collapsed && <span>Back to Store</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={14} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
