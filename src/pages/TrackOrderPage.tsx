import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Search, Truck, CheckCircle2, Clock, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const trackSchema = z.object({
  orderId: z.string().trim().min(4, "Order ID is required").max(100),
  contact: z.string().trim().min(3, "Email or phone is required").max(255),
});

interface TrackedOrder {
  id: string;
  status: string;
  payment_status: string | null;
  created_at: string;
  total: number;
  customer_name: string;
  shipping_address: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  awb_code: string | null;
  courier_name: string | null;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const getStatusIndex = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("deliver")) return 3;
  if (s.includes("ship") || s.includes("transit") || s.includes("out for")) return 2;
  if (s.includes("confirm") || s.includes("processing") || s.includes("packed")) return 1;
  return 0;
};

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = trackSchema.safeParse({ orderId, contact });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    setOrder(null);
    setSearched(true);

    try {
      const isEmail = contact.includes("@");
      let query = supabase
        .from("orders")
        .select("id, status, payment_status, created_at, total, customer_name, shipping_address, tracking_number, tracking_url, awb_code, courier_name, customer_email, customer_phone")
        .limit(1);

      // Try matching by ID prefix (order IDs are uuids — users typically paste full id)
      query = query.eq("id", orderId.trim());

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        toast.error("No order found. Please check your Order ID and contact details.");
        return;
      }

      const found = data[0];
      const matches = isEmail
        ? found.customer_email?.toLowerCase() === contact.toLowerCase().trim()
        : (found.customer_phone || "").replace(/\D/g, "").endsWith(contact.replace(/\D/g, "").slice(-10));

      if (!matches) {
        toast.error("Order found but contact details don't match.");
        return;
      }

      setOrder(found as TrackedOrder);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-foreground">Track Order</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-2">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">Enter your order details below to see real-time status</p>
        </motion.div>

        <form
          onSubmit={handleTrack}
          className="bg-accent/40 border border-border rounded-2xl p-5 md:p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 4f9b1e2c-..."
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
                Email or Phone
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@email.com or 9876543210"
                className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                maxLength={255}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-[0.1em] hover:bg-foreground/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search size={14} />
                Track Order
              </>
            )}
          </button>
        </form>

        {searched && !loading && !order && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <Package size={36} className="mx-auto mb-3 opacity-40" />
            <p>No order found. Please double-check your Order ID and contact info.</p>
          </div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order ID</p>
                <p className="font-mono text-sm font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Placed on</p>
                <p className="text-sm">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-border" />
                <div
                  className="absolute top-5 left-0 h-[2px] bg-secondary transition-all duration-500"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const reached = i <= currentStep;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center" style={{ flex: 1 }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          reached ? "bg-secondary text-secondary-foreground border-secondary" : "bg-background text-muted-foreground border-border"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <p className={`text-[10px] md:text-xs mt-2 text-center font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 text-sm border-t border-border pt-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment</p>
                <p className="font-medium capitalize">{order.payment_status || "Pending"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                <p className="font-medium">₹{Number(order.total).toLocaleString("en-IN")}</p>
              </div>
              {order.courier_name && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Courier</p>
                  <p className="font-medium">{order.courier_name}</p>
                </div>
              )}
              {order.awb_code && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">AWB / Tracking #</p>
                  <p className="font-mono text-sm">{order.awb_code}</p>
                </div>
              )}
              {order.shipping_address && (
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Shipping to</p>
                  <p className="text-sm">{order.shipping_address}</p>
                </div>
              )}
            </div>

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                <Truck size={14} />
                View live tracking on courier site
              </a>
            )}

            <div className="mt-6 pt-5 border-t border-border flex flex-wrap gap-2 text-xs">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                Need help? <Link to="/contact" className="text-secondary hover:underline font-medium">Contact us</Link>
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
