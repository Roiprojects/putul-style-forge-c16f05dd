import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ArrowLeft, MessageCircle, Package, CreditCard, Truck, RotateCcw, ShieldCheck, HelpCircle } from "lucide-react";

interface HelpChatboxProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  orderStatus?: string;
}

type View = "main" | "detail";

interface HelpTopic {
  id: string;
  icon: React.ElementType;
  title: string;
  questions: { q: string; a: string }[];
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: "order",
    icon: Package,
    title: "Order Issues",
    questions: [
      { q: "Where is my order?", a: "You can track your order from the Order Tracking section above. If your order shows 'Shipped', it's on the way. Delivery usually takes 5-7 business days depending on your location." },
      { q: "My order is delayed", a: "We apologize for the delay! Orders may sometimes take 1-2 extra days due to high demand or weather conditions. If it's been more than 10 days since shipping, please contact us at support@putulfashions.com." },
      { q: "I received the wrong item", a: "We're sorry about this! Please initiate a return from the 'Return or Exchange' option. Select 'Wrong product delivered' as the reason and we'll arrange a pickup and send the correct item." },
      { q: "Can I change my order?", a: "Orders can only be modified before they're shipped. If your order hasn't shipped yet, contact us immediately at support@putulfashions.com with your Order ID." },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "Payment & Refunds",
    questions: [
      { q: "When will I get my refund?", a: "Refunds are processed within 24-48 hours of return approval. It takes 5-7 business days for the amount to reflect in your bank account or 3-5 days for UPI/wallet refunds." },
      { q: "I was charged but order failed", a: "Don't worry! If the amount was deducted but order wasn't placed, the refund will be automatically initiated within 3-5 business days. If not, contact us with the transaction details." },
      { q: "Payment modes available", a: "We accept UPI, Debit/Credit Cards, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery (COD) for eligible orders." },
      { q: "Can I get a GST invoice?", a: "Yes! Download your invoice from the order detail page using the 'Invoice' button. For GST-specific invoices, email us at billing@putulfashions.com with your GSTIN." },
    ],
  },
  {
    id: "delivery",
    icon: Truck,
    title: "Delivery & Shipping",
    questions: [
      { q: "What are the delivery charges?", a: "Delivery is FREE on orders above ₹499. For orders below ₹499, a flat ₹49 shipping fee applies. Express delivery is available at an additional cost." },
      { q: "Do you deliver to my area?", a: "We deliver across India! Enter your pincode on the product page to check delivery availability and estimated delivery time for your location." },
      { q: "Can I change delivery address?", a: "Address can be changed before the order is shipped. Contact our support team with your Order ID and the new address." },
      { q: "What if I'm not home during delivery?", a: "Our delivery partner will attempt delivery up to 3 times. You can also reschedule delivery by contacting the courier partner using your tracking number." },
    ],
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Exchange",
    questions: [
      { q: "What is the return policy?", a: "We offer a 7-day easy return policy from the date of delivery. Items must be unused, unwashed, and with original tags attached. Sale items are eligible for exchange only." },
      { q: "How to initiate a return?", a: "Click on 'Return or Exchange' from your order page, select the items and reason, choose your refund mode, and submit. Our team will arrange pickup within 24-48 hours." },
      { q: "Can I exchange for a different size?", a: "Yes! When initiating a return, select 'Size doesn't fit' as the reason. You can mention the desired size in the comments and we'll ship the replacement after pickup." },
      { q: "Item not eligible for return?", a: "Certain items like innerwear, swimwear, and customized products cannot be returned. Check the product page for return eligibility before purchasing." },
    ],
  },
  {
    id: "account",
    icon: ShieldCheck,
    title: "Account & Privacy",
    questions: [
      { q: "How to update my profile?", a: "Go to your Profile page from the menu. You can update your name, phone number, and manage your saved addresses from there." },
      { q: "How to delete my account?", a: "To delete your account, email us at privacy@putulfashions.com from your registered email. Account deletion is processed within 7 working days." },
      { q: "Is my data safe?", a: "Absolutely! We use industry-standard encryption and never share your personal data with third parties. Read our full Privacy Policy for details." },
    ],
  },
  {
    id: "other",
    icon: HelpCircle,
    title: "Other Queries",
    questions: [
      { q: "How to apply a coupon?", a: "Add items to your cart, go to checkout, and enter your coupon code in the 'Apply Coupon' section. Valid coupons will be automatically applied to eligible items." },
      { q: "Do you have a loyalty program?", a: "We're working on an exciting loyalty program! Stay tuned for updates by subscribing to our newsletter." },
      { q: "How to contact customer support?", a: "Email: support@putulfashions.com\nPhone: +91-XXXXXXXXXX (Mon-Sat, 10 AM - 7 PM)\nYou can also reach us via the Contact page on our website." },
    ],
  },
];

const HelpChatbox = ({ open, onClose }: HelpChatboxProps) => {
  const [view, setView] = useState<View>("main");
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const openTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setExpandedQ(null);
    setView("detail");
  };

  const goBack = () => {
    setView("main");
    setSelectedTopic(null);
    setExpandedQ(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="bg-background w-full max-w-sm rounded-xl border border-border max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-foreground text-background p-4 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {view === "detail" && (
                    <button onClick={goBack} className="hover:opacity-70">
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <MessageCircle size={18} />
                  <span className="text-sm font-heading font-semibold">
                    {view === "main" ? "How can we help?" : selectedTopic?.title}
                  </span>
                </div>
                <button onClick={onClose} className="hover:opacity-70"><X size={16} /></button>
              </div>
              {view === "main" && (
                <p className="text-[10px] opacity-70 mt-1">Choose a topic below to find quick answers</p>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {view === "main" && (
                <div className="space-y-2">
                  {HELP_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => openTopic(topic)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-muted-foreground/30 hover:bg-accent/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium">{topic.title}</p>
                          <p className="text-[10px] text-muted-foreground">{topic.questions.length} questions</p>
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}

              {view === "detail" && selectedTopic && (
                <div className="space-y-2">
                  {selectedTopic.questions.map((item, i) => (
                    <div key={i} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-xs font-medium pr-2">{item.q}</span>
                        <ChevronRight
                          size={12}
                          className={`text-muted-foreground shrink-0 transition-transform ${expandedQ === i ? "rotate-90" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedQ === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-1 border-t border-border">
                              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border mt-4">
                    <p className="text-[10px] text-muted-foreground text-center">
                      Still need help?{" "}
                      <a href="/contact" className="text-secondary hover:underline font-medium">Contact us</a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpChatbox;
