import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Shield, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayPalCheckoutProps {
  /** Amount in the target currency (already converted from INR) */
  amount: number;
  /** ISO currency code (must be PayPal-supported) */
  currency: string;
  onSuccess: (captureId: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalCheckout = ({ amount, currency, onSuccess, onClose }: PayPalCheckoutProps) => {
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  // Step 1: create PayPal order on the server
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-paypal-order", {
          body: { amount, currency },
        });
        if (cancelled) return;
        if (error || !data?.order_id || !data?.client_id) {
          toast.error("Failed to initiate PayPal payment.");
          onClose();
          return;
        }
        setClientId(data.client_id);
        setOrderId(data.order_id);
      } catch (e) {
        console.error("PayPal init error:", e);
        toast.error("PayPal initialization failed");
        onClose();
      }
    })();
    return () => { cancelled = true; };
  }, [amount, currency]);

  // Step 2: load SDK + render buttons
  useEffect(() => {
    if (!clientId || !orderId) return;

    const loadSdk = () => new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-paypal-sdk]");
      if (existing && window.paypal) return resolve();
      // Remove any prior SDK with a different currency
      if (existing) existing.remove();
      const s = document.createElement("script");
      s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
      s.dataset.paypalSdk = "true";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("PayPal SDK failed to load"));
      document.body.appendChild(s);
    });

    (async () => {
      try {
        await loadSdk();
        if (renderedRef.current || !containerRef.current || !window.paypal) return;
        renderedRef.current = true;
        setLoading(false);

        window.paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
          createOrder: () => orderId,
          onApprove: async () => {
            try {
              const { data, error } = await supabase.functions.invoke("capture-paypal-order", {
                body: { order_id: orderId },
              });
              if (error || !data?.success) {
                toast.error("Payment capture failed.");
                onClose();
                return;
              }
              onSuccess(data.capture_id || orderId);
            } catch (e) {
              console.error(e);
              toast.error("Payment capture failed.");
              onClose();
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            toast.error("Payment failed. Please try again.");
            onClose();
          },
          onCancel: () => onClose(),
        }).render(containerRef.current);
      } catch (e) {
        console.error(e);
        toast.error("Could not load PayPal");
        onClose();
      }
    })();
  }, [clientId, orderId, currency]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="text-center mb-5">
          <h3 className="font-heading text-lg text-foreground">Pay with PayPal</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {currency} {amount.toFixed(2)}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Preparing secure checkout…</p>
          </div>
        ) : null}

        <div ref={containerRef} className={loading ? "hidden" : ""} />

        <div className="flex items-center justify-center gap-1.5 mt-5 pt-4 border-t border-border">
          <Shield size={11} className="text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Secured by PayPal</p>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default PayPalCheckout;
