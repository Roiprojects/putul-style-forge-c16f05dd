import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Orders", icon: ClipboardList, to: "/orders" },
];

const browseLinks = [
  { label: "Shop All", to: "/shop" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Cart", to: "/cart" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const [browseOpen, setBrowseOpen] = useState(false);

  return (
    <>
      {/* Browse overlay */}
      <AnimatePresence>
        {browseOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[49] bg-foreground/40 backdrop-blur-sm md:hidden"
            onClick={() => setBrowseOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-16 left-0 right-0 bg-background rounded-t-2xl border-t border-border p-4 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4" />
              <nav className="flex flex-col gap-1">
                {browseLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setBrowseOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
        <nav className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setBrowseOpen(false)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setBrowseOpen(!browseOpen)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
              browseOpen ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Menu size={22} strokeWidth={browseOpen ? 2.2 : 1.5} />
            <span className="text-[10px] font-medium">Browse</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default MobileBottomNav;
