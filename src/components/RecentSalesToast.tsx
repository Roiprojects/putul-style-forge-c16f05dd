import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const NAMES = ["Aarav", "Vivaan", "Rohan", "Priya", "Ananya", "Karan", "Neha", "Ishaan", "Kabir", "Meera", "Arjun", "Riya"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow"];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const RecentSalesToast = () => {
  const { data: products = [] } = useProducts();
  const shownRef = useRef(0);

  useEffect(() => {
    if (!products.length) return;

    let timeout: number;
    const showOne = () => {
      if (shownRef.current >= 5) return;
      const product = pick(products);
      const name = pick(NAMES);
      const city = pick(CITIES);
      const mins = Math.floor(Math.random() * 30) + 1;

      toast(
        <div className="flex items-center gap-3">
          <img src={product.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
          <div className="text-xs">
            <div className="font-semibold">{name} from {city}</div>
            <div className="text-muted-foreground">just bought {product.name.slice(0, 28)}{product.name.length > 28 ? "…" : ""}</div>
            <div className="text-muted-foreground/70 mt-0.5">{mins} min ago</div>
          </div>
        </div>,
        { duration: 5000, position: "bottom-left" }
      );
      shownRef.current += 1;

      // Schedule next
      timeout = window.setTimeout(showOne, 25000 + Math.random() * 15000);
    };

    timeout = window.setTimeout(showOne, 12000);
    return () => window.clearTimeout(timeout);
  }, [products]);

  return null;
};

export default RecentSalesToast;
