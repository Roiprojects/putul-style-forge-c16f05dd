import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, X, LogOut, ArrowRight } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import type { User as SupaUser } from "@supabase/supabase-js";

const navLinks = [
  { label: "Shop", to: "/shop", desc: "Browse our collection" },
  { label: "Collections", to: "/shop?category=crocs", desc: "Curated selections" },
  { label: "About", to: "/about", desc: "Our story" },
  { label: "Contact", to: "/contact", desc: "Get in touch" },
];

const Navbar = () => {
  const { cartCount, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
    setMenuOpen(false);
    toast.success("Signed out");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled && !menuOpen;

  // Stagger animation for menu items
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -60, skewX: 4 },
    visible: { opacity: 1, x: 0, skewX: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, x: 60, transition: { duration: 0.3 } },
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-700 ${
          menuOpen
            ? "bg-transparent"
            : isTransparent
            ? "bg-transparent"
            : "bg-background/95 backdrop-blur-md border-b border-border"
        }`}
      >
        <div className="px-6 md:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Menu toggle — custom hamburger */}
            <button
              className="relative z-[80] w-8 h-8 flex flex-col items-start justify-center gap-[5px] group"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7, width: 24 } : { rotate: 0, y: 0, width: 24 }}
                className={`block h-[1.5px] origin-left transition-colors duration-300 ${
                  menuOpen || !isTransparent ? "bg-foreground" : "bg-background"
                }`}
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                className={`block h-[1.5px] w-4 transition-colors duration-300 ${
                  menuOpen || !isTransparent ? "bg-foreground" : "bg-background"
                }`}
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7, width: 24 } : { rotate: 0, y: 0, width: 16 }}
                className={`block h-[1.5px] origin-left transition-colors duration-300 ${
                  menuOpen || !isTransparent ? "bg-foreground" : "bg-background"
                }`}
              />
            </button>

            {/* Center logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 z-[80]">
              <h1
                className={`font-heading text-2xl md:text-3xl font-light tracking-[0.15em] transition-colors duration-500 ${
                  menuOpen || !isTransparent ? "text-foreground" : "text-background"
                }`}
              >
                PUTUL
              </h1>
            </Link>

            {/* Icons */}
            <div className="flex items-center gap-1 z-[80]">
              <Link
                to="/wishlist"
                className={`p-2.5 transition-colors relative ${menuOpen || !isTransparent ? "text-foreground hover:text-secondary" : "text-background/80 hover:text-background"}`}
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
                className={`p-2.5 transition-colors relative ${menuOpen || !isTransparent ? "text-foreground hover:text-secondary" : "text-background/80 hover:text-background"}`}
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
                    className={`p-2.5 transition-colors ${menuOpen || !isTransparent ? "text-foreground" : "text-background/80"}`}
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
                  className={`p-2.5 transition-colors hidden md:block ${menuOpen || !isTransparent ? "text-foreground hover:text-secondary" : "text-background/80 hover:text-background"}`}
                >
                  <User size={17} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at 40px 40px)" }}
            animate={{ clipPath: "circle(150% at 40px 40px)" }}
            exit={{ clipPath: "circle(0% at 40px 40px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[65] bg-background"
          >
            <div className="h-full flex flex-col md:flex-row">
              {/* Left — navigation links */}
              <div className="flex-1 flex flex-col justify-center px-12 md:px-24 py-20">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-2"
                >
                  {navLinks.map((link, i) => (
                    <motion.div key={link.to} variants={itemVariants}>
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-baseline gap-6 py-3 md:py-4"
                      >
                        <span className="text-[10px] text-muted-foreground tracking-wider font-body">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span
                            className={`font-heading text-4xl md:text-6xl lg:text-7xl font-light tracking-tight transition-colors duration-500 group-hover:text-secondary ${
                              location.pathname === link.to ? "text-secondary" : "text-foreground"
                            }`}
                          >
                            {link.label}
                          </span>
                          <span className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                            {link.desc}
                            <ArrowRight size={10} className="inline ml-2" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Auth link in menu */}
                  <motion.div variants={itemVariants} className="pt-8 border-t border-border mt-6">
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="text-sm tracking-[0.2em] uppercase font-light text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign Out — {displayName}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                        className="text-sm tracking-[0.2em] uppercase font-light text-foreground hover:text-secondary transition-colors"
                      >
                        Sign In
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Right — decorative info panel */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="hidden md:flex flex-col justify-end w-80 lg:w-96 bg-accent p-12 lg:p-16"
              >
                <div className="space-y-8">
                  <div>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Contact</p>
                    <p className="text-sm text-foreground font-light">support@putulfashions.com</p>
                    <p className="text-sm text-foreground font-light">+91 98765 43210</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Follow</p>
                    <p className="text-sm text-foreground font-light">Instagram</p>
                    <p className="text-sm text-foreground font-light">Facebook</p>
                  </div>
                  <div className="w-12 h-px bg-secondary" />
                  <p className="text-[10px] text-muted-foreground tracking-wider">
                    Premium men's footwear.<br />Crafted with care.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
