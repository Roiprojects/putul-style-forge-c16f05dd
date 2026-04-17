import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Wallet, ChevronsUpDown, Check } from "lucide-react";
import { getBanksForCountry } from "@/data/banks";
import { cn } from "@/lib/utils";

interface OrderItemLite {
  id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  userId: string;
  paymentMethod: string | null;
  paymentStatus?: string | null;
  orderStatus?: string | null;
  items: OrderItemLite[];
  onSubmitted: () => void;
}

const REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price",
  "Delivery is taking too long",
  "Wrong item / size selected",
  "Other",
];

// Map common state names → ISO country code (Indian states default to IN)
const INDIAN_STATES = new Set([
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa","gujarat","haryana",
  "himachal pradesh","jharkhand","karnataka","kerala","madhya pradesh","maharashtra","manipur",
  "meghalaya","mizoram","nagaland","odisha","punjab","rajasthan","sikkim","tamil nadu","telangana",
  "tripura","uttar pradesh","uttarakhand","west bengal","delhi","jammu and kashmir","ladakh",
  "puducherry","chandigarh","andaman and nicobar islands","dadra and nagar haveli","lakshadweep",
]);

type Step = "reason" | "type" | "refund" | "replacement";

const CancelOrderModal = ({ open, onClose, orderId, userId, paymentMethod, paymentStatus, orderStatus, items, onSubmitted }: Props) => {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [requestType, setRequestType] = useState<"refund" | "replacement" | "direct_cancel" | "">("");

  // refund
  const [refundMethod, setRefundMethod] = useState<"original" | "bank" | "upi" | "">("");
  const [bankName, setBankName] = useState("");
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumberConfirm, setAccountNumberConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  // replacement
  const [rSize, setRSize] = useState("");
  const [rColor, setRColor] = useState("");
  const [rVariant, setRVariant] = useState("");
  const [rNote, setRNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState<string>("IN");

  const isCOD = (paymentMethod || "").toLowerCase().includes("cod");
  const isOnline = !isCOD;
  const isIndia = country === "IN";

  // Direct-cancel eligibility: COD, not delivered, not paid → no money has changed hands, just cancel.
  const status = (orderStatus || "").toLowerCase();
  const payStatus = (paymentStatus || "").toLowerCase();
  const isDeliveredOrShipped = ["delivered", "shipped", "out_for_delivery"].includes(status);
  const isPaid = ["paid", "completed", "success"].includes(payStatus);
  const directCancelEligible = isCOD && !isDeliveredOrShipped && !isPaid;

  // Detect country from saved address → fallback IP
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: addrs } = await supabase
          .from("saved_addresses")
          .select("state")
          .eq("user_id", userId)
          .order("is_default", { ascending: false })
          .limit(1);
        if (!cancelled && addrs && addrs[0]?.state) {
          if (INDIAN_STATES.has(addrs[0].state.trim().toLowerCase())) {
            setCountry("IN");
            return;
          }
        }
        // IP fallback
        const res = await fetch("https://ipapi.co/json/");
        const j = await res.json();
        if (!cancelled && j?.country_code) setCountry(j.country_code);
      } catch {
        // keep default IN
      }
    })();
    return () => { cancelled = true; };
  }, [open, userId]);

  const banks = useMemo(() => getBanksForCountry(country), [country]);

  const reset = () => {
    setStep("reason");
    setReason(""); setReasonNote(""); setRequestType("");
    setRefundMethod(""); setBankName(""); setAccountHolder("");
    setAccountNumber(""); setAccountNumberConfirm(""); setIfsc(""); setUpiId("");
    setRSize(""); setRColor(""); setRVariant(""); setRNote("");
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const accountsMatch = accountNumber.length > 0 && accountNumber === accountNumberConfirm;

  const validateRefund = () => {
    if (!refundMethod) return "Please select a refund method";
    if (refundMethod === "bank") {
      if (!bankName.trim()) return "Please select your bank";
      if (!accountHolder.trim() || !accountNumber.trim() || !accountNumberConfirm.trim())
        return "Please fill all bank details";
      if (accountNumber !== accountNumberConfirm) return "Account numbers do not match";
      if (!/^\d{6,18}$/.test(accountNumber.trim())) return "Invalid account number";
      if (isIndia) {
        if (!ifsc.trim()) return "Please enter IFSC code";
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim())) return "Invalid IFSC code";
      }
    }
    if (refundMethod === "upi") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) return "Invalid UPI ID";
    }
    return null;
  };

  const refundFormReady = refundMethod === "original"
    || refundMethod === "upi"
    || (refundMethod === "bank" && !!bankName && !!accountHolder.trim() && accountsMatch && (!isIndia || !!ifsc.trim()));

  const submit = async () => {
    setSubmitting(true);
    const payload: any = {
      order_id: orderId,
      user_id: userId,
      reason,
      reason_note: reasonNote || null,
      request_type: requestType,
      payment_method: paymentMethod,
      status: "pending",
    };
    if (requestType === "refund") {
      payload.refund_method = refundMethod;
      if (refundMethod === "bank") {
        payload.bank_name = bankName;
        payload.account_holder = accountHolder;
        payload.account_number = accountNumber;
        payload.ifsc = ifsc ? ifsc.toUpperCase() : null;
      }
      if (refundMethod === "upi") {
        payload.upi_id = upiId;
      }
    } else {
      payload.replacement_size = rSize || null;
      payload.replacement_color = rColor || null;
      payload.replacement_variant = rVariant || null;
      payload.replacement_note = rNote || null;
    }

    const { error } = await supabase.from("cancellation_requests").insert(payload);
    if (error) {
      toast.error(error.message || "Failed to submit cancellation");
      setSubmitting(false);
      return;
    }

    await supabase.from("orders").update({ status: "cancellation_requested" }).eq("id", orderId);

    toast.success("Cancellation request submitted");
    setSubmitting(false);
    reset();
    onSubmitted();
    onClose();
  };

  const sizes = Array.from(new Set(items.map((i) => i.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(items.map((i) => i.color).filter(Boolean))) as string[];
  const variants = Array.from(new Set(items.map((i) => i.product_name)));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {step !== "reason" && (
              <button onClick={() => setStep(step === "type" ? "reason" : "type")} className="p-1 hover:bg-accent rounded">
                <ArrowLeft size={14} />
              </button>
            )}
            {step === "reason" && "Cancel Order"}
            {step === "type" && "What would you like?"}
            {step === "refund" && "Refund Details"}
            {step === "replacement" && "Replacement Details"}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: Reason */}
        {step === "reason" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Reason for cancellation</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Additional notes (optional)</Label>
              <Textarea
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder="Tell us more..."
                rows={3}
                maxLength={500}
                className="mt-1.5"
              />
            </div>
            <Button className="w-full" disabled={!reason} onClick={() => setStep("type")}>
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2: Type */}
        {step === "type" && (
          <div className="space-y-3">
            <button
              onClick={() => { setRequestType("replacement"); setStep("replacement"); }}
              className="w-full flex items-start gap-3 p-4 border border-border rounded-lg hover:border-foreground transition-colors text-left"
            >
              <RotateCcw size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Request Replacement</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get the same product in a different size or color</p>
              </div>
            </button>
            <button
              onClick={() => { setRequestType("refund"); setStep("refund"); }}
              className="w-full flex items-start gap-3 p-4 border border-border rounded-lg hover:border-foreground transition-colors text-left"
            >
              <Wallet size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Request Refund</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get your money back</p>
              </div>
            </button>
          </div>
        )}

        {/* STEP 3a: Refund */}
        {step === "refund" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Refund to</Label>
              <RadioGroup value={refundMethod} onValueChange={(v) => setRefundMethod(v as any)} className="mt-2 space-y-2">
                {isOnline && (
                  <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                    <RadioGroupItem value="original" id="r-original" />
                    <Label htmlFor="r-original" className="text-xs font-normal cursor-pointer flex-1">Original payment method</Label>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="bank" id="r-bank" />
                  <Label htmlFor="r-bank" className="text-xs font-normal cursor-pointer flex-1">Bank account</Label>
                </div>
                <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                  <RadioGroupItem value="upi" id="r-upi" />
                  <Label htmlFor="r-upi" className="text-xs font-normal cursor-pointer flex-1">UPI ID</Label>
                </div>
              </RadioGroup>
            </div>

            {refundMethod === "bank" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Bank name <span className="text-destructive">*</span></Label>
                  <Popover open={bankPickerOpen} onOpenChange={setBankPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between mt-1.5 font-normal"
                      >
                        <span className={cn("truncate", !bankName && "text-muted-foreground")}>
                          {bankName || `Select your bank (${country})`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search bank..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2 space-y-2">
                              <p className="text-xs text-muted-foreground">No matches. Enter manually:</p>
                              <Input
                                placeholder="Type bank name"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="h-8"
                              />
                              <Button size="sm" className="w-full h-7" onClick={() => setBankPickerOpen(false)}>
                                Use this name
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {banks.map((b) => (
                              <CommandItem
                                key={b}
                                value={b}
                                onSelect={() => { setBankName(b); setBankPickerOpen(false); }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", bankName === b ? "opacity-100" : "opacity-0")} />
                                {b}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs">Account holder name <span className="text-destructive">*</span></Label>
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="mt-1.5" required />
                </div>
                <div>
                  <Label className="text-xs">Account number <span className="text-destructive">*</span></Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ""))}
                    className="mt-1.5"
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Re-enter account number <span className="text-destructive">*</span></Label>
                  <Input
                    value={accountNumberConfirm}
                    onChange={(e) => setAccountNumberConfirm(e.target.value.replace(/\s/g, ""))}
                    onPaste={(e) => e.preventDefault()}
                    className={cn("mt-1.5", accountNumberConfirm && !accountsMatch && "border-destructive focus-visible:ring-destructive")}
                    autoComplete="off"
                    required
                  />
                  {accountNumberConfirm && !accountsMatch && (
                    <p className="text-xs text-destructive mt-1">Account numbers do not match</p>
                  )}
                  {accountsMatch && (
                    <p className="text-xs text-primary mt-1">Account numbers match ✓</p>
                  )}
                </div>
                {isIndia && (
                  <div>
                    <Label className="text-xs">IFSC code <span className="text-destructive">*</span></Label>
                    <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="mt-1.5" required />
                  </div>
                )}
              </div>
            )}

            {refundMethod === "upi" && (
              <div>
                <Label className="text-xs">UPI ID <span className="text-destructive">*</span></Label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" className="mt-1.5" required />
              </div>
            )}

            <Button
              className="w-full"
              disabled={submitting || !refundFormReady}
              onClick={() => {
                const err = validateRefund();
                if (err) { toast.error(err); return; }
                submit();
              }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        )}

        {/* STEP 3b: Replacement */}
        {step === "replacement" && (
          <div className="space-y-4">
            {variants.length > 1 && (
              <div>
                <Label className="text-xs">Item to replace</Label>
                <Select value={rVariant} onValueChange={setRVariant}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <Label className="text-xs">Preferred size</Label>
                <Select value={rSize} onValueChange={setRSize}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {colors.length > 0 && (
              <div>
                <Label className="text-xs">Preferred color</Label>
                <Select value={rColor} onValueChange={setRColor}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select color" /></SelectTrigger>
                  <SelectContent>
                    {colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-xs">Note (optional)</Label>
              <Textarea
                value={rNote}
                onChange={(e) => setRNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Anything we should know..."
                className="mt-1.5"
              />
            </div>
            <Button className="w-full" disabled={submitting} onClick={submit}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderModal;
