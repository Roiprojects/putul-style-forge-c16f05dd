import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Menu, X, Search, LogOut } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import type { User as SupaUser } from "@supabase/supabase-js";
import logo from "@/assets/putul-logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Crocs", to: "/shop?category=crocs" },
  { label: "Sports Shoes", to: "/shop?category=sports-shoes" },
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
    toast.success("Signed out successfully");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const isHome = location.pathname === "/";

  return (
    <>
      <nav
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled || !isHome
            ? "bg-background/90 border-b border-border shadow-sm"
            : "bg-foreground/30 border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X size={22} className={scrolled || !isHome ? "text-foreground" : "text-background"} />
              ) : (
                <Menu size={22} className={scrolled || !isHome ? "text-foreground" : "text-background"} />
              )}
            </button>

            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="PUTUL"
                className="h-10 md:h-14 w-auto object-contain drop-shadow-sm brightness-0"
              />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 hover:text-secondary ${
                    location.pathname === link.to
                      ? "text-secondary"
                      : scrolled || !isHome
                      ? "text-foreground"
                      : "text-background/90"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className={`p-2 transition-colors ${
                  scrolled || !isHome ? "text-foreground hover:text-secondary" : "text-background hover:text-secondary"
                }`}
                aria-label="Search"
              >
                <Search size={19} />
              </Link>
              <Link
                to="/wishlist"
                className={`p-2 transition-colors relative ${
                  scrolled || !isHome ? "text-foreground hover:text-secondary" : "text-background hover:text-secondary"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={19} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className={`p-2 transition-colors relative ${
                  scrolled || !isHome ? "text-foreground hover:text-secondary" : "text-background hover:text-secondary"
                }`}
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2 p-2 transition-colors ${
                      scrolled || !isHome ? "text-foreground hover:text-secondary" : "text-background hover:text-secondary"
                    }`}
                  >
                    <div className="w-7 h-7 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-bold">
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
                  className={`p-2 transition-colors hidden md:block ${
                    scrolled || !isHome ? "text-foreground hover:text-secondary" : "text-background hover:text-secondary"
                  }`}
                  aria-label="Account"
                >
                  <User size={19} />
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="flex flex-col py-4 px-6 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm tracking-widest uppercase font-medium py-2 ${
                      location.pathname === link.to ? "text-secondary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="text-sm tracking-widest uppercase font-medium py-2 text-muted-foreground text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                    className="text-sm tracking-widest uppercase font-medium py-2 text-foreground text-left"
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
