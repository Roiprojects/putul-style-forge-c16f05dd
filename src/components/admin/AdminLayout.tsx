import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminSidebar from "./AdminSidebar";
import GlobalSearchBar from "./dashboard/GlobalSearchBar";
import { Loader2, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAdminAuth();
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [dark]);

  // Cleanup: when leaving admin, restore light mode for storefront
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/store-portal-access" replace />;
  }

  return (
    <div className="flex min-h-screen bg-accent/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <GlobalSearchBar />
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
