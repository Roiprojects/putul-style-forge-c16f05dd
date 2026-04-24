import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { Sparkles, Award, Crown, Gem } from "lucide-react";

const tierConfig = {
  Bronze:   { icon: Sparkles, color: "text-amber-700", next: 500,  label: "Silver" },
  Silver:   { icon: Award,    color: "text-slate-400", next: 2000, label: "Gold" },
  Gold:     { icon: Crown,    color: "text-yellow-500", next: 5000, label: "Platinum" },
  Platinum: { icon: Gem,      color: "text-purple-500", next: 0,   label: "Max tier" },
} as const;

const LoyaltyCard = () => {
  const { points, tier, loading } = useLoyaltyPoints();
  if (loading) return null;

  const cfg = tierConfig[tier];
  const Icon = cfg.icon;
  const remaining = cfg.next > 0 ? cfg.next - points : 0;
  const progress = cfg.next > 0 ? Math.min(100, (points / cfg.next) * 100) : 100;

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${cfg.color}`} />
          <span className="font-semibold">{tier} Member</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-serif">{points.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">points</div>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        {remaining > 0
          ? `${remaining.toLocaleString()} points to ${cfg.label}`
          : "You've reached the highest tier 🎉"}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Earn 1 point per ₹10 spent. Redeem for discounts on future orders.
      </p>
    </div>
  );
};

export default LoyaltyCard;
