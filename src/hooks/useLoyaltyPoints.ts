import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Local-first loyalty: 1 point per ₹10 spent on delivered orders
export const useLoyaltyPoints = () => {
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState<"Bronze" | "Silver" | "Gold" | "Platinum">("Bronze");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPoints(0);
        setTier("Bronze");
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("total, status")
        .eq("user_id", session.user.id)
        .in("status", ["delivered", "completed", "shipped"]);

      const totalSpent = (data || []).reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      const pts = Math.floor(totalSpent / 10);
      setPoints(pts);
      setTier(
        pts >= 5000 ? "Platinum" :
        pts >= 2000 ? "Gold" :
        pts >= 500 ? "Silver" : "Bronze"
      );
      setLoading(false);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  return { points, tier, loading };
};
