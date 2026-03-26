import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, MapPin, Check, LogIn } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";

type CheckoutStep = "cart" | "details" | "pay";

// Indian city → state + pincode mapping
const CITY_DATA: Record<string, { state: string; pincode: string }> = {
  "Mumbai": { state: "Maharashtra", pincode: "400001" },
  "Pune": { state: "Maharashtra", pincode: "411001" },
  "Nagpur": { state: "Maharashtra", pincode: "440001" },
  "Delhi": { state: "Delhi", pincode: "110001" },
  "New Delhi": { state: "Delhi", pincode: "110001" },
  "Bangalore": { state: "Karnataka", pincode: "560001" },
  "Bengaluru": { state: "Karnataka", pincode: "560001" },
  "Mysore": { state: "Karnataka", pincode: "570001" },
  "Chennai": { state: "Tamil Nadu", pincode: "600001" },
  "Coimbatore": { state: "Tamil Nadu", pincode: "641001" },
  "Madurai": { state: "Tamil Nadu", pincode: "625001" },
  "Hyderabad": { state: "Telangana", pincode: "500001" },
  "Kolkata": { state: "West Bengal", pincode: "700001" },
  "Ahmedabad": { state: "Gujarat", pincode: "380001" },
  "Surat": { state: "Gujarat", pincode: "395001" },
  "Jaipur": { state: "Rajasthan", pincode: "302001" },
  "Lucknow": { state: "Uttar Pradesh", pincode: "226001" },
  "Kanpur": { state: "Uttar Pradesh", pincode: "208001" },
  "Bhopal": { state: "Madhya Pradesh", pincode: "462001" },
  "Indore": { state: "Madhya Pradesh", pincode: "452001" },
  "Patna": { state: "Bihar", pincode: "800001" },
  "Kochi": { state: "Kerala", pincode: "682001" },
  "Thiruvananthapuram": { state: "Kerala", pincode: "695001" },
  "Chandigarh": { state: "Chandigarh", pincode: "160001" },
  "Guwahati": { state: "Assam", pincode: "781001" },
  "Bhubaneswar": { state: "Odisha", pincode: "751001" },
  "Visakhapatnam": { state: "Andhra Pradesh", pincode: "530001" },
  "Ranchi": { state: "Jharkhand", pincode: "834001" },
  "Dehradun": { state: "Uttarakhand", pincode: "248001" },
};

type AddressForm = {
  name: string;
  phone: string;
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [form, setForm] = useState<AddressForm>({
    name: "", phone: "", houseNo: "", street: "", landmark: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: string;
    discount_value: number;
    max_discount: number | null;
    min_order: number | null;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const fullAddress = useMemo(() => {
    const parts = [form.houseNo, form.street, form.landmark, form.city, form.state, form.pincode].filter(Boolean);
    return parts.join(", ");
  }, [form]);

  // Auto-fill state & pincode when city matches
  useEffect(() => {
    const match = Object.entries(CITY_DATA).find(
      ([city]) => city.toLowerCase() === form.city.trim().toLowerCase()
    );
    if (match) {
      setForm(prev => ({ ...prev, state: match[1].state, pincode: match[1].pincode }));
    }
  }, [form.city]);

  // City suggestions
  useEffect(() => {
    if (form.city.length < 2) { setCitySuggestions([]); return; }
    const q = form.city.toLowerCase();
    const matches = Object.keys(CITY_DATA).filter(c => c.toLowerCase().includes(q)).slice(0, 5);
    setCitySuggestions(matches);
  }, [form.city]);

  useEffect(() => {
    if (!showSavePopup) return;
    const timer = setTimeout(() => setShowSavePopup(false), 9000);
    return () => clearTimeout(timer);
  }, [showSavePopup]);

  const updateField = (field: keyof AddressForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = "Enter valid 10-digit number";
    if (!form.houseNo.trim()) e.houseNo = "House/flat no. is required";
    if (!form.street.trim()) e.street = "Street is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim()) e.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Enter valid 6-digit PIN";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressSubmit = () => {
    if (!validate()) return;
    setShowSavePopup(true);
  };

  const handleProceedToDetails = () => {
    if (!user) {
      setShowAuthModal(true);
      toast.error("Please sign in to continue checkout");
      return;
    }
    setStep("details");
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSavingAddress(true);
    const { error } = await supabase.from("saved_addresses").insert({
      user_id: user.id,
      name: form.name,
      phone: form.phone,
      house_no: form.houseNo,
      street: form.street,
      landmark: form.landmark || null,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    });
    setSavingAddress(false);
    if (error) {
      toast.error("Failed to save address");
    } else {
      setAddressSaved(true);
      toast.success("Address saved!");
    }
    setShowSavePopup(false);
    setStep("pay");
  };

  const handleSkipSave = () => {
    setShowSavePopup(false);
    setStep("pay");
  };

  // Coupon logic
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    setCouponLoading(false);
    if (error || !data) {
      setCouponError("Invalid or expired coupon code");
      return;
    }
    if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
      setCouponError("This coupon has expired");
      return;
    }
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      setCouponError("Coupon usage limit reached");
      return;
    }
    if (data.min_order && cartTotal < data.min_order) {
      setCouponError(`Minimum order ₹${data.min_order} required`);
      return;
    }
    setAppliedCoupon({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount: data.max_discount,
      min_order: data.min_order,
    });
    setCouponCode("");
    toast.success(`Coupon "${data.code}" applied!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let disc = 0;
    if (appliedCoupon.discount_type === "percentage") {
      disc = (cartTotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount) disc = Math.min(disc, appliedCoupon.max_discount);
    } else {
      disc = appliedCoupon.discount_value;
    }
    return Math.min(disc, cartTotal);
  }, [appliedCoupon, cartTotal]);

  const finalTotal = cartTotal - couponDiscount;

  const handleProceedToPay = () => {
    toast.success("Redirecting to payment...");
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">
          {step === "cart" && "Shopping Cart"}
          {step === "details" && "Delivery Details"}
          {step === "pay" && "Confirm & Pay"}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === "cart" && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {cart.map((item, i) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 p-4 border border-border"
                    >
                      <Link to={`/product/${item.product.id}`} className="w-24 h-32 flex-shrink-0 bg-accent overflow-hidden">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.product.id}`} className="font-medium text-sm hover:text-secondary transition-colors">{item.product.name}</Link>
                          <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-2"><Minus size={12} /></button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-2"><Plus size={12} /></button>
                          </div>
                          <span className="font-semibold text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id, item.size)} className="text-muted-foreground hover:text-destructive self-start">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <div className="border border-border p-6 md:p-8 space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-xs font-bold">1</div>
                      <p className="text-sm font-semibold uppercase tracking-wider">Your Information</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <Input
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                        placeholder="Enter your full name"
                        className="border-border"
                        maxLength={100}
                      />
                      {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</label>
                      <Input
                        value={form.phone}
                        onChange={(e) => { setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }); setErrors({ ...errors, phone: "" }); }}
                        placeholder="10-digit mobile number"
                        className="border-border"
                        maxLength={10}
                        type="tel"
                      />
                      {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-xs font-bold">2</div>
                        <p className="text-sm font-semibold uppercase tracking-wider">Delivery Address</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">House / Flat No.</label>
                          <Input value={form.houseNo} onChange={(e) => updateField("houseNo", e.target.value)} placeholder="e.g. 12-A" className="border-border" maxLength={50} />
                          {errors.houseNo && <p className="text-[11px] text-destructive mt-1">{errors.houseNo}</p>}
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Street / Area</label>
                          <Input value={form.street} onChange={(e) => updateField("street", e.target.value)} placeholder="Street name, area" className="border-border" maxLength={100} />
                          {errors.street && <p className="text-[11px] text-destructive mt-1">{errors.street}</p>}
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Landmark <span className="text-muted-foreground/50 normal-case">(optional)</span></label>
                        <Input value={form.landmark} onChange={(e) => updateField("landmark", e.target.value)} placeholder="Near temple, mall, etc." className="border-border" maxLength={100} />
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="relative">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">City</label>
                          <Input
                            value={form.city}
                            onChange={(e) => { updateField("city", e.target.value); setShowCitySuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                            onFocus={() => form.city.length >= 2 && setShowCitySuggestions(true)}
                            placeholder="Your city"
                            className="border-border"
                            maxLength={50}
                          />
                          {errors.city && <p className="text-[11px] text-destructive mt-1">{errors.city}</p>}
                          {/* City suggestions dropdown */}
                          {showCitySuggestions && citySuggestions.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg max-h-40 overflow-auto">
                              {citySuggestions.map(city => (
                                <button
                                  key={city}
                                  type="button"
                                  onMouseDown={(e) => { e.preventDefault(); updateField("city", city); setShowCitySuggestions(false); }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors"
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">State</label>
                          <Input value={form.state} onChange={(e) => updateField("state", e.target.value)} placeholder="State" className="border-border bg-accent/50" maxLength={50} />
                          {errors.state && <p className="text-[11px] text-destructive mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">PIN Code</label>
                          <Input value={form.pincode} onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit" className="border-border bg-accent/50" maxLength={6} />
                          {errors.pincode && <p className="text-[11px] text-destructive mt-1">{errors.pincode}</p>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleAddressSubmit}
                      className="btn-primary w-full py-3.5 text-center mt-4 text-sm font-semibold tracking-wide"
                    >
                      Continue
                    </button>

                    <button
                      onClick={() => setStep("cart")}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                    >
                      ← Back to cart
                    </button>
                  </div>

                  {/* Save Address Popup */}
                  <AnimatePresence>
                    {showSavePopup && (
                      <>
                        {/* Blur overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
                          onClick={handleSkipSave}
                        />
                        {/* Popup */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72"
                        >
                          <div className="bg-secondary text-secondary-foreground rounded-xl shadow-2xl overflow-hidden">
                            {/* Timer bar */}
                            <motion.div
                              initial={{ scaleX: 1 }}
                              animate={{ scaleX: 0 }}
                              transition={{ duration: 9, ease: "linear" }}
                              className="h-1 bg-background/30 origin-left"
                            />
                            <div className="flex flex-col items-center text-center p-6 gap-3">
                              <div className="w-12 h-12 rounded-xl bg-background/15 flex items-center justify-center">
                                <MapPin size={20} />
                              </div>
                              <p className="text-sm font-bold font-heading">Save Address?</p>
                              <p className="text-[11px] leading-relaxed opacity-80">
                                Quick checkout next time
                              </p>
                              <div className="flex gap-2 w-full mt-1">
                                <button
                                  onClick={handleSaveAddress}
                                  className="flex-1 bg-foreground text-background py-2.5 rounded-lg text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity active:scale-[0.97]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleSkipSave}
                                  className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-background/20 hover:bg-background/10 transition-colors active:scale-[0.97]"
                                >
                                  Skip
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {step === "pay" && (
                <motion.div
                  key="pay"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="border border-border p-6 md:p-8"
                >
                  {/* Delivery info summary */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Delivering to</p>
                    <div className="bg-accent p-4 space-y-1.5">
                      <p className="text-sm font-semibold">{form.name}</p>
                      <p className="text-xs text-muted-foreground">{form.phone}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{fullAddress}</p>
                      {addressSaved && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                          <Check size={10} /> Address saved
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setStep("details")}
                      className="text-[11px] text-secondary hover:underline mt-2"
                    >
                      Change details
                    </button>
                  </div>

                  {/* Order items mini-list */}
                  <div className="mb-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Order Items ({cart.length})</p>
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-accent overflow-hidden shrink-0">
                            <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.product.name}</p>
                            <p className="text-[10px] text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                          </div>
                          <span className="text-xs font-semibold tabular-nums">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToPay}
                    className="btn-primary w-full py-4 text-center text-sm font-semibold tracking-widest uppercase"
                  >
                    Proceed to Pay — ₹{finalTotal.toLocaleString()}
                  </button>

                  <button
                    onClick={() => setStep("cart")}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
                  >
                    ← Back to cart
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order Summary (always visible) */}
          <div className="bg-accent p-6 h-fit sticky top-24">
            <h3 className="font-heading text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-secondary">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {step === "cart" && (
              <>
                <button onClick={handleProceedToDetails} className="btn-primary w-full mt-6 text-center">
                  Proceed to Checkout
                </button>
                <button onClick={clearCart} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-destructive transition-colors">
                  Clear Cart
                </button>
              </>
            )}

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {["Cart", "Details", "Pay"].map((label, i) => {
                const stepMap: CheckoutStep[] = ["cart", "details", "pay"];
                const isActive = stepMap.indexOf(step) >= i;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? "bg-foreground" : "bg-border"}`} />
                    <span className={`text-[10px] tracking-wide ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                    {i < 2 && <div className={`w-6 h-px ${isActive ? "bg-foreground" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default CartPage;
