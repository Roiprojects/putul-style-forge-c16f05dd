import { useEffect, useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";

const REMINDER_DELAY_MS = 60 * 1000; // 1 min after leaving cart
const KEY = "abandoned-cart-reminder";

const AbandonedCartReminder = () => {
  const { cart } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (cart.length === 0) return;
    const lastShown = sessionStorage.getItem(KEY);
    if (lastShown) return;

    const timer = setTimeout(() => {
      if (window.location.pathname !== "/cart" && cart.length > 0) {
        setShow(true);
        sessionStorage.setItem(KEY, "1");
      }
    }, REMINDER_DELAY_MS);

    return () => clearTimeout(timer);
  }, [cart.length]);

  if (!show || cart.length === 0) return null;

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Don't forget your items!</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {itemCount} item{itemCount > 1 ? "s" : ""} · ₹{total.toLocaleString()} waiting in your cart.
          </p>
          <Link to="/cart" onClick={() => setShow(false)}>
            <Button size="sm" className="mt-3 w-full">
              Complete Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AbandonedCartReminder;
