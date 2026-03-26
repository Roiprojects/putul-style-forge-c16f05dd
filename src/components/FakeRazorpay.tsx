import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Building2, Wallet, ChevronRight, Shield } from "lucide-react";

interface FakeRazorpayProps {
  amount: number;
  customerName: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

const FakeRazorpay = ({ amount, customerName, customerPhone, onSuccess, onClose }: FakeRazorpayProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      const fakePaymentId = "pay_" + Math.random().toString(36).substring(2, 15);
      onSuccess(fakePaymentId);
    }, 2500);
  };

  const methods = [
    { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
    { id: "card", label: "Card", icon: CreditCard, desc: "Visa, Mastercard, Rupay" },
    { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All Indian Banks" },
    { id: "wallet", label: "Wallet", icon: Wallet, desc: "Paytm, Mobikwik" },
  ];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Razorpay Header */}
          <div className="bg-[#072654] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[11px] opacity-70">Putul Style Forge</p>
                <p className="text-lg font-bold">₹{amount.toLocaleString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Customer Info */}
          <div className="px-5 py-3 bg-[#f4f7fa] border-b text-[11px] text-gray-600 flex gap-4">
            <span>{customerName}</span>
            <span>{customerPhone}</span>
          </div>

          {processing ? (
            <div className="p-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-3 border-[#072654] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-700">Processing payment...</p>
              <p className="text-[11px] text-gray-400">Please do not close this window</p>
            </div>
          ) : (
            <div className="p-5">
              {/* Payment Methods */}
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Method</p>
              <div className="space-y-2 mb-5">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                      selectedMethod === m.id
                        ? "border-[#072654] bg-[#072654]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <m.icon size={18} className={selectedMethod === m.id ? "text-[#072654]" : "text-gray-400"} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{m.label}</p>
                      <p className="text-[10px] text-gray-400">{m.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                ))}
              </div>

              {/* Method-specific fields */}
              <AnimatePresence mode="wait">
                {selectedMethod === "upi" && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#072654]"
                    />
                  </motion.div>
                )}

                {selectedMethod === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 mb-4"
                  >
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="Card Number"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#072654]"
                    />
                    <div className="flex gap-2">
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                        placeholder="MM/YY"
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#072654]"
                      />
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="CVV"
                        className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#072654]"
                      />
                    </div>
                  </motion.div>
                )}

                {selectedMethod === "netbanking" && (
                  <motion.div
                    key="nb"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#072654]">
                      <option>Select Bank</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={!selectedMethod}
                className={`w-full py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  selectedMethod
                    ? "bg-[#072654] text-white hover:bg-[#0a3470]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Pay ₹{amount.toLocaleString()}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield size={10} className="text-gray-300" />
                <p className="text-[9px] text-gray-400">Secured by Razorpay (Test Mode)</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FakeRazorpay;
