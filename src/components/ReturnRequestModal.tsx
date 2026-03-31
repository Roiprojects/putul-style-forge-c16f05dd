import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Check, Package, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface ReturnRequestModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  items: OrderItem[];
  productImages: Record<string, string>;
  orderSubtotal: number;
  orderDiscount: number;
  orderTotal: number;
}

const RETURN_REASONS = [
  "Product is defective/damaged",
  "Wrong product delivered",
  "Product doesn't match description",
  "Size doesn't fit",
  "Quality not as expected",
  "Received incomplete order",
  "Better price available elsewhere",
  "Changed my mind",
  "Other",
];

const REFUND_MODES = [
  { key: "original", label: "Refund to original payment method", desc: "3–7 business days", icon: CreditCard },
  { key: "store_credit", label: "Store credit (instant)", desc: "Get refund instantly as store credit", icon: Package },
];

type Step = "items" | "reason" | "refund" | "review";

const ReturnRequestModal = ({ open, onClose, orderId, items, productImages, orderSubtotal, orderDiscount, orderTotal }: ReturnRequestModalProps) => {
  const [step, setStep] = useState<Step>("items");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMode, setRefundMode] = useState("original");
  const [additionalComment, setAdditionalComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectedItemsTotal = items
    .filter((i) => selectedItems.includes(i.id))
    .reduce((sum, i) => sum + i.total_price, 0);

  // Calculate proportional refund: if a discount was applied to the order,
  // the refund should be proportional to what the user actually paid
  const discountRatio = orderSubtotal > 0 ? (orderSubtotal - orderDiscount) / orderSubtotal : 1;
  const refundAmount = Math.round(selectedItemsTotal * discountRatio * 100) / 100;

  const finalReason = reason === "Other" ? otherReason : reason;

  const handleSubmit = async () => {
    setSubmitting(true);
    const reasonText = `${finalReason}${additionalComment ? ` — ${additionalComment}` : ""}. Items: ${items.filter(i => selectedItems.includes(i.id)).map(i => i.product_name).join(", ")}. Refund mode: ${refundMode}`;
    
    const { error } = await supabase.from("returns").insert({
      order_id: orderId,
      reason: reasonText,
      refund_amount: refundAmount,
    });

    if (error) {
      toast.error("Failed to submit return request");
    } else {
      toast.success("Return request submitted! We'll review it within 24-48 hours.");
      onClose();
    }
    setSubmitting(false);
  };

  const canProceed = () => {
    if (step === "items") return selectedItems.length > 0;
    if (step === "reason") return reason && (reason !== "Other" || otherReason.trim());
    if (step === "refund") return !!refundMode;
    return true;
  };

  const nextStep = () => {
    if (step === "items") setStep("reason");
    else if (step === "reason") setStep("refund");
    else if (step === "refund") setStep("review");
  };

  const prevStep = () => {
    if (step === "reason") setStep("items");
    else if (step === "refund") setStep("reason");
    else if (step === "review") setStep("refund");
  };

  const stepIndex = ["items", "reason", "refund", "review"].indexOf(step);

  const reset = () => {
    setStep("items");
    setSelectedItems([]);
    setReason("");
    setOtherReason("");
    setRefundMode("original");
    setAdditionalComment("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => { reset(); onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background w-full max-w-md rounded-xl border border-border max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h2 className="text-sm font-heading font-semibold">Return / Refund Request</h2>
              <button onClick={() => { reset(); onClose(); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Step Progress */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex items-center gap-1">
                {["Select Items", "Reason", "Refund Mode", "Review"].map((label, i) => (
                  <div key={label} className="flex-1">
                    <div className={`h-1 rounded-full ${i <= stepIndex ? "bg-secondary" : "bg-accent"}`} />
                    <p className={`text-[9px] mt-1 ${i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {step === "items" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Select items you want to return:</p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex gap-3 p-3 rounded-lg border transition-colors text-left ${
                        selectedItems.includes(item.id) ? "border-secondary bg-secondary/5" : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="w-12 h-14 bg-accent rounded-md overflow-hidden shrink-0">
                        <img
                          src={item.product_id ? productImages[item.product_id] || "/placeholder.svg" : "/placeholder.svg"}
                          alt="" className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.product_name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size}`} {item.color && `• ${item.color}`} • Qty: {item.quantity}
                        </p>
                        <p className="text-xs font-semibold mt-1">₹{item.total_price.toLocaleString("en-IN")}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        selectedItems.includes(item.id) ? "border-secondary bg-secondary" : "border-muted-foreground/30"
                      }`}>
                        {selectedItems.includes(item.id) && <Check size={10} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "reason" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Why are you returning?</p>
                  {RETURN_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                        reason === r ? "border-secondary bg-secondary/5 font-medium" : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                  {reason === "Other" && (
                    <textarea
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      className="w-full mt-2 p-3 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      rows={3}
                      placeholder="Please describe the issue..."
                    />
                  )}
                  <div className="pt-2">
                    <label className="text-[10px] text-muted-foreground">Additional comments (optional)</label>
                    <textarea
                      value={additionalComment}
                      onChange={(e) => setAdditionalComment(e.target.value)}
                      className="w-full mt-1 p-3 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      rows={2}
                      placeholder="Any additional details..."
                    />
                  </div>
                </div>
              )}

              {step === "refund" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-2">How would you like your refund?</p>
                  {REFUND_MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => setRefundMode(mode.key)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${
                          refundMode === mode.key ? "border-secondary bg-secondary/5" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <Icon size={16} className={refundMode === mode.key ? "text-secondary" : "text-muted-foreground"} />
                        <div>
                          <p className="text-xs font-medium">{mode.label}</p>
                          <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                    <p className="text-[10px] text-muted-foreground">Estimated refund amount</p>
                    <p className="text-lg font-heading font-semibold">₹{refundAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              )}

              {step === "review" && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      Once submitted, our team will review your request within 24-48 hours. You'll receive an email with pickup details.
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Items to return</p>
                    {items.filter(i => selectedItems.includes(i.id)).map(item => (
                      <p key={item.id} className="text-xs font-medium">{item.product_name} — ₹{item.total_price.toLocaleString("en-IN")}</p>
                    ))}
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Reason</p>
                    <p className="text-xs">{finalReason}</p>
                    {additionalComment && <p className="text-[10px] text-muted-foreground mt-0.5">{additionalComment}</p>}
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Refund mode</p>
                    <p className="text-xs">{REFUND_MODES.find(m => m.key === refundMode)?.label}</p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Refund amount</span>
                      <span className="text-sm font-semibold">₹{refundAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex gap-3 shrink-0">
              {stepIndex > 0 && (
                <button onClick={prevStep} className="px-4 py-2.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">
                  Back
                </button>
              )}
              {step !== "review" ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Continue <ChevronRight size={12} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-xs font-medium bg-destructive text-white rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Return Request"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReturnRequestModal;
