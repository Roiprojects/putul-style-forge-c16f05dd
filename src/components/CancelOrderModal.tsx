import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Wallet } from "lucide-react";

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

type Step = "reason" | "type" | "refund" | "replacement";

const CancelOrderModal = ({ open, onClose, orderId, userId, paymentMethod, items, onSubmitted }: Props) => {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [requestType, setRequestType] = useState<"refund" | "replacement" | "">("");

  // refund
  const [refundMethod, setRefundMethod] = useState<"original" | "bank" | "upi" | "">("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  // replacement
  const [rSize, setRSize] = useState("");
  const [rColor, setRColor] = useState("");
  const [rVariant, setRVariant] = useState("");
  const [rNote, setRNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const isCOD = (paymentMethod || "").toLowerCase().includes("cod");
  const isOnline = !isCOD; // anything else treated as online

  const reset = () => {
    setStep("reason");
    setReason(""); setReasonNote(""); setRequestType("");
    setRefundMethod(""); setBankName(""); setAccountHolder(""); setAccountNumber(""); setIfsc(""); setUpiId("");
    setRSize(""); setRColor(""); setRVariant(""); setRNote("");
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const validateRefund = () => {
    if (!refundMethod) return "Please select a refund method";
    if (refundMethod === "bank") {
      if (!accountHolder.trim() || !accountNumber.trim() || !ifsc.trim() || !bankName.trim())
        return "Please fill all bank details";
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim())) return "Invalid IFSC code";
      if (!/^\d{6,18}$/.test(accountNumber.trim())) return "Invalid account number";
    }
    if (refundMethod === "upi") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) return "Invalid UPI ID";
    }
    return null;
  };

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
        payload.ifsc = ifsc.toUpperCase();
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
            <Button
              className="w-full"
              disabled={!reason}
              onClick={() => setStep("type")}
            >
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
                  <Label className="text-xs">Account holder name</Label>
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Account number</Label>
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">IFSC code</Label>
                  <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Bank name</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1.5" />
                </div>
              </div>
            )}

            {refundMethod === "upi" && (
              <div>
                <Label className="text-xs">UPI ID</Label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" className="mt-1.5" />
              </div>
            )}

            <Button
              className="w-full"
              disabled={submitting}
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
