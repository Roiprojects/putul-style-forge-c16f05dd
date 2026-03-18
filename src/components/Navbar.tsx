import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Menu, X, LogOut } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import type { User as SupaUser } from "@supabase/supabase-js";

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/shop?category=crocs" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const { cartCount, wishlist } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    toast.success("Signed out");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isTransparent
            ? "bg-transparent"
            : "bg-background/95 backdrop-blur-md border-b border-border"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left nav links */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500 hover:text-secondary ${
                    location.pathname === link.to
                      ? "text-secondary"
                      : isTransparent ? "text-background/80" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? (
                <X size={20} className={isTransparent ? "text-background" : "text-foreground"} />
              ) : (
                <Menu size={20} className={isTransparent ? "text-background" : "text-foreground"} />
              )}
            </button>

            {/* Center logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <h1
                className={`font-heading text-2xl md:text-3xl font-light tracking-[0.15em] transition-colors duration-500 ${
                  isTransparent ? "text-background" : "text-foreground"
                }`}
              >
                PUTUL
              </h1>
            </Link>

            {/* Right nav links */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[10px] tracking-[0.3em] uppercase font-medium transition-colors duration-500 hover:text-secondary ${
                    location.pathname === link.to
                      ? "text-secondary"
                      : isTransparent ? "text-background/80" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <Link
                to="/wishlist"
                className={`p-2.5 transition-colors relative ${isTransparent ? "text-background/80 hover:text-background" : "text-foreground hover:text-secondary"}`}
              >
                <Heart size={17} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-0.5 w-3.5 h-3.5 bg-secondary text-secondary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className={`p-2.5 transition-colors relative ${isTransparent ? "text-background/80 hover:text-background" : "text-foreground hover:text-secondary"}`}
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 w-3.5 h-3.5 bg-secondary text-secondary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`p-2.5 transition-colors ${isTransparent ? "text-background/80" : "text-foreground hover:text-secondary"}`}
                  >
                    <div className="w-6 h-6 border border-current rounded-full flex items-center justify-center text-[9px] font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-lg"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-medium truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className={`p-2.5 transition-colors hidden md:block ${isTransparent ? "text-background/80 hover:text-background" : "text-foreground hover:text-secondary"}`}
                >
                  <User size={17} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="flex flex-col py-6 px-8 gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm tracking-[0.2em] uppercase font-light py-1 ${
                      location.pathname === link.to ? "text-secondary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="text-sm tracking-[0.2em] uppercase font-light py-1 text-muted-foreground text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                    className="text-sm tracking-[0.2em] uppercase font-light py-1 text-foreground text-left"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
