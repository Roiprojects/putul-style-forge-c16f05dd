import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, 
  FileText, Download, Phone, Mail, ShoppingBag, Star, ChevronRight, MessageCircle, RotateCcw
} from "lucide-react";
import ReturnRequestModal from "@/components/ReturnRequestModal";
import HelpChatbox from "@/components/HelpChatbox";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number | null;
  shipping_cost: number | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  tracking_number: string | null;
  invoice_number: string | null;
  notes: string | null;
}

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  color: string | null;
}

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const [orderRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("id", id!).single(),
      supabase.from("order_items").select("*").eq("order_id", id!),
    ]);

    if (orderRes.error || !orderRes.data) {
      toast.error("Order not found");
      navigate("/orders");
      return;
    }

    setOrder(orderRes.data as OrderDetail);
    setItems((itemsRes.data || []) as OrderItem[]);

    // Fetch product images
    const productIds = (itemsRes.data || []).map((i: any) => i.product_id).filter(Boolean);
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("admin_products")
        .select("id, images")
        .in("id", productIds);
      if (products) {
        const imgMap: Record<string, string> = {};
        products.forEach((p: any) => {
          if (p.images?.[0]) imgMap[p.id] = p.images[0];
        });
        setProductImages(imgMap);
      }
    }

    setLoading(false);
  };

  const getStatusIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "delivered") return 4;
    if (s === "out_for_delivery") return 3;
    if (s === "shipped") return 2;
    if (s === "processing") return 1;
    if (s === "confirmed") return 0;
    return -1;
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    // Generate a simple text invoice
    const invoiceLines = [
      `INVOICE`,
      `${"─".repeat(40)}`,
      `Order ID: ${order.id.slice(0, 8).toUpperCase()}`,
      `Date: ${new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      `Invoice: ${order.invoice_number || "N/A"}`,
      ``,
      `Customer: ${order.customer_name}`,
      `Phone: ${order.customer_phone || "N/A"}`,
      `Address: ${order.shipping_address || "N/A"}`,
      ``,
      `${"─".repeat(40)}`,
      `ITEMS`,
      `${"─".repeat(40)}`,
      ...items.map(i => `${i.product_name} (${i.size || "-"}) x${i.quantity}  ₹${i.total_price.toLocaleString("en-IN")}`),
      ``,
      `${"─".repeat(40)}`,
      `Subtotal: ₹${order.subtotal.toLocaleString("en-IN")}`,
      order.discount ? `Discount: -₹${order.discount.toLocaleString("en-IN")}` : "",
      `Shipping: ${order.shipping_cost ? `₹${order.shipping_cost}` : "Free"}`,
      `${"─".repeat(40)}`,
      `TOTAL: ₹${order.total.toLocaleString("en-IN")}`,
      ``,
      `Payment: ${order.payment_method || "N/A"} (${order.payment_status || "N/A"})`,
      ``,
      `Thank you for shopping with Putul Style Forge!`,
    ].filter(Boolean).join("\n");

    const blob = new Blob([invoiceLines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id.slice(0, 8).toUpperCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusIndex(order.status);
  const isCancelled = order.status.toLowerCase() === "cancelled";
  const orderDate = new Date(order.created_at);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-heading font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-xs text-muted-foreground">
              Placed on {orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 text-xs font-medium border border-border rounded-lg px-3 py-2 hover:bg-accent transition-colors"
          >
            <Download size={14} /> Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl p-5 md:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">Order Tracking</p>
              
              {isCancelled ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Package size={16} className="text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-destructive">Order Cancelled</p>
                    <p className="text-xs text-muted-foreground">This order has been cancelled</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Line */}
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-8 ${i < currentStep ? "bg-green-500" : "bg-border"}`} />
                        )}
                        {/* Dot */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted ? "bg-green-100" : "bg-accent"
                        }`}>
                          <StepIcon size={14} className={isCompleted ? "text-green-600" : "text-muted-foreground"} />
                        </div>
                        {/* Text */}
                        <div className="pb-8">
                          <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {order.updated_at
                                ? new Date(order.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                : ""}
                            </p>
                          )}
                          {i === 4 && !isCompleted && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Expected by {estimatedDelivery.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {order.tracking_number && (
                <div className="mt-2 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Tracking Number</p>
                  <p className="text-sm font-mono font-medium mt-0.5">{order.tracking_number}</p>
                </div>
              )}
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-border rounded-xl p-5 md:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Items ({items.length})
              </p>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      to={item.product_id ? `/product/${item.product_id}` : "#"}
                      className="w-16 h-20 bg-accent rounded-lg overflow-hidden shrink-0"
                    >
                      <img
                        src={item.product_id ? productImages[item.product_id] || "/placeholder.svg" : "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={item.product_id ? `/product/${item.product_id}` : "#"}
                        className="text-sm font-medium hover:text-secondary transition-colors line-clamp-2"
                      >
                        {item.product_name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-semibold">₹{item.total_price.toLocaleString("en-IN")}</span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-muted-foreground">
                            (₹{item.unit_price.toLocaleString("en-IN")} × {item.quantity})
                          </span>
                        )}
                      </div>
                    </div>
                    {item.product_id && order.status.toLowerCase() === "delivered" && (
                      <Link
                        to={`/product/${item.product_id}`}
                        className="self-center flex items-center gap-1 text-[10px] text-secondary hover:underline shrink-0"
                      >
                        <Star size={10} /> Rate
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {order.status.toLowerCase() === "delivered" && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 text-xs font-medium text-secondary hover:underline"
                  >
                    <ShoppingBag size={13} /> Buy Again
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="border border-border rounded-xl p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Delivery Address</p>
              <p className="text-sm font-medium">{order.customer_name}</p>
              {order.shipping_address && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{order.shipping_address}</p>
              )}
              <div className="flex flex-col gap-1.5 mt-3">
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone size={11} /> {order.customer_phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail size={11} /> {order.customer_email.includes("@phone.") ? "—" : order.customer_email}
                </div>
              </div>
            </motion.div>

            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-border rounded-xl p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{(order.discount!).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_cost ? `₹${order.shipping_cost}` : "Free"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <CreditCard size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {order.payment_method || "—"} · <span className={order.payment_status === "paid" ? "text-green-600 font-medium" : "text-amber-600"}>{order.payment_status || "pending"}</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="border border-border rounded-xl p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Need Help?</p>
              <div className="space-y-2">
                <Link to="/contact" className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5">
                  <span>Contact Support</span>
                  <ChevronRight size={12} />
                </Link>
                {order.status.toLowerCase() === "delivered" && (
                  <button className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 w-full">
                    <span>Return or Exchange</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
