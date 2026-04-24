import { CheckCircle2, Package, Truck, Home, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  updatedAt?: string;
}

const STAGES = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const OrderTimeline = ({ status, createdAt, updatedAt }: OrderTimelineProps) => {
  const lower = status.toLowerCase();

  if (lower === "cancelled") {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex items-center gap-3">
        <XCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Order Cancelled</p>
          <p className="text-xs text-muted-foreground">
            {updatedAt ? new Date(updatedAt).toLocaleString() : ""}
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = Math.max(
    STAGES.findIndex((s) => s.key === lower),
    0
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold mb-6">Order Status</h3>
      <div className="flex items-start justify-between relative">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border -z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
          />
        </div>
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground",
                  active && "ring-4 ring-primary/20 scale-110"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-[10px] md:text-xs text-center font-medium",
                  done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
              {idx === 0 && (
                <span className="text-[9px] text-muted-foreground">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
