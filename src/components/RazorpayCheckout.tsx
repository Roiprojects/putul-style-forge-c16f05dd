import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RazorpayCheckoutProps {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout = ({ amount, customerName, customerEmail, customerPhone, onSuccess, onClose }: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndOpen = async () => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      try {
        // Create order via edge function
        const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
          body: { amount, currency: "INR" },
        });

        if (error || !data?.order_id) {
          toast.error("Failed to initiate payment. Please try again.");
          onClose();
          return;
        }

        setLoading(false);

        const options = {
          key: data.key_id,
          amount: Math.round(amount * 100),
          currency: "INR",
          name: "Putul Style Forge",
          description: "Order Payment",
          order_id: data.order_id,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#072654",
          },
          handler: (response: any) => {
            if (response.razorpay_payment_id) {
              onSuccess(response.razorpay_payment_id);
            }
          },
          modal: {
            ondismiss: () => {
              onClose();
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          toast.error("Payment failed: " + (response.error?.description || "Unknown error"));
          onClose();
        });
        rzp.open();
      } catch (err: any) {
        console.error("Razorpay error:", err);
        toast.error("Payment initialization failed");
        onClose();
      }
    };

    loadAndOpen();
  }, []);

  if (!loading) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Initializing Payment...</p>
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="opacity-60" />
          <p className="text-[10px] opacity-60">Secure Payment</p>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default RazorpayCheckout;
