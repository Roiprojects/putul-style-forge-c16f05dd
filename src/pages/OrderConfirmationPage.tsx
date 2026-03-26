import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from "lucide-react";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state as {
    orderId: string;
    paymentId: string;
    amount: number;
    items: { name: string; size: string; quantity: number; price: number }[];
    address: string;
    customerName: string;
  } | null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">No order details found.</p>
        <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={32} className="text-green-600" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold mb-1">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground">Thank you for your purchase</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-border rounded-xl overflow-hidden mb-6"
        >
          {/* Order ID */}
          <div className="px-5 py-4 bg-accent/50 border-b border-border flex justify-between items-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Order ID</p>
              <p className="text-sm font-mono font-semibold">{order.orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payment ID</p>
              <p className="text-xs font-mono text-muted-foreground">{order.paymentId}</p>
            </div>
          </div>

          {/* Items */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
            </div>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.name} <span className="text-muted-foreground text-xs">(Size: {item.size} × {item.quantity})</span></span>
                  <span className="font-medium tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivering to</p>
            </div>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{order.address}</p>
          </div>

          {/* Total */}
          <div className="px-5 py-4 flex justify-between items-center bg-accent/30">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Paid</span>
            </div>
            <span className="text-lg font-bold">₹{order.amount.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Link
            to="/orders"
            className="btn-primary w-full py-3.5 text-center text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
          >
            View My Orders <ArrowRight size={14} />
          </Link>
          <Link
            to="/shop"
            className="w-full py-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
