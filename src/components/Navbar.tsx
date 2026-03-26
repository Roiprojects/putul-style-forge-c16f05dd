import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import SearchDropdown from "@/components/SearchDropdown";
import type { User as SupaUser } from "@supabase/supabase-js";
import putulLogo from "@/assets/putul-logo.png";

const navLinks = [
  { label: "Crocs", to: "/shop?category=crocs" },
  { label: "Sports Shoes", to: "/shop?category=sports-shoes" },
  { label: "Slides & Slippers", to: "/shop?category=slides-slippers" },
  { label: "Loafer Sandals", to: "/shop?category=loafer-sandals" },
  { label: "New Arrivals", to: "/shop" },
];

const Navbar = () => {
  const { cartCount, wishlist } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
    setMobileOpen(false);
    toast.success("Signed out");
  };

  const displayName = user?.user_metadata?.phone || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* Top bar */}
      <div className="bg-foreground text-background h-8 flex items-center justify-center relative z-50">
        <p className="text-[10px] md:text-[11px] tracking-wide font-light">
          Free Shipping Sitewide on Every Order — <span className="text-secondary font-medium">Don't Miss Out!!</span>
        </p>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-40 bg-background transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="container mx-auto px-4 md:px-8">
          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0">
              <img src={putulLogo} alt="Putul Fashions" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-[12px] font-medium tracking-wide uppercase transition-colors hover:text-secondary ${
                    location.pathname + location.search === link.to ? "text-secondary" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-[320px] mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search for products, brands and more"
                  className="w-full h-9 pl-10 pr-4 text-[12px] bg-accent/60 border border-border rounded-md focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/70 transition-colors"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <AnimatePresence>
                  {showSearchDropdown && searchQuery.trim() && (
                    <SearchDropdown query={searchQuery} onSelect={() => { setSearchQuery(""); setShowSearchDropdown(false); }} />
                  )}
                </AnimatePresence>
              </div>
            </form>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : setAuthOpen(true)}
                  className="p-2.5 text-foreground hover:text-secondary transition-colors"
                  aria-label={user ? "Account menu" : "Sign in"}
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                {user && (
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 top-full mt-2 w-44 bg-background border border-border shadow-lg rounded-md z-50">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs font-medium truncate text-foreground">{displayName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.user_metadata?.phone || user.email}</p>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
                          <LogOut size={13} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <Link to="/wishlist" className="p-2.5 text-foreground hover:text-secondary transition-colors relative">
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2.5 text-foreground hover:text-secondary transition-colors relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex lg:hidden items-center justify-between h-14">
            <div className="flex items-center gap-0">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 text-foreground hover:text-secondary transition-colors"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" className="p-2 text-foreground hover:text-secondary transition-colors relative">
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0 w-4 h-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Centered logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={putulLogo} alt="Putul Fashions" className="h-10 w-auto" />
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-0">
              <div className="relative">
                <button
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : setAuthOpen(true)}
                  className="p-2 text-foreground hover:text-secondary transition-colors"
                  aria-label={user ? "Account menu" : "Sign in"}
                >
                  <User size={20} strokeWidth={1.5} />
                </button>
                {user && (
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute right-0 top-full mt-2 w-44 bg-background border border-border shadow-lg rounded-md z-50">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs font-medium truncate text-foreground">{displayName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.user_metadata?.phone || user.email}</p>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
                          <LogOut size={13} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <Link to="/cart" className="p-2 text-foreground hover:text-secondary transition-colors relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0 w-4 h-4 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button className="p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar (expandable) */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }}
                className="lg:hidden overflow-hidden pb-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="w-full h-9 pl-9 pr-4 text-xs bg-accent/60 border border-border rounded-md focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/70 transition-colors"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[calc(2rem+3.5rem)] left-0 right-0 z-30 bg-background border-b border-border overflow-hidden shadow-lg"
          >
            <div className="py-4 px-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium tracking-wide uppercase text-foreground hover:text-secondary border-b border-border/50 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="block w-full text-left py-3 text-sm font-medium tracking-wide uppercase text-secondary"
                >
                  Sign In
                </button>
              )}
              {user && (
                <button onClick={handleLogout} className="block w-full text-left py-3 text-sm font-medium tracking-wide text-muted-foreground">
                  Sign Out — {displayName}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
