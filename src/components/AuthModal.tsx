import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "phone" | "otp";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const reset = useCallback(() => {
    setStep("phone");
    setPhone("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(false);
    setCountdown(0);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const fullPhone = `+91${phone}`;

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { phone: fullPhone },
    });

    setLoading(false);

    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed to send OTP");
      return;
    }

    toast.success("OTP sent to your mobile number!");
    setStep("otp");
    setCountdown(30);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleVerifyOTP = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("verify-otp", {
      body: { phone: fullPhone, otp_code: otpValue },
    });

    if (error || data?.error) {
      setLoading(false);
      toast.error(data?.error || error?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }

    // Set session from returned tokens
    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    setLoading(false);
    toast.success(data?.is_new_user ? "Welcome to Putul Fashions!" : "Welcome back!");
    handleClose();
  }, [fullPhone]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit on last digit
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      handleVerifyOTP(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      handleVerifyOTP(pasted);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-background w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-secondary text-[10px] tracking-[0.3em] uppercase">
                  Putul Fashions
                </p>
                <h2 className="font-heading text-xl font-semibold mt-1">
                  {step === "phone" ? "Sign In" : "Verify OTP"}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === "phone" && (
                  <motion.form
                    key="phone-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSendOTP}
                    className="space-y-5"
                  >
                    <p className="text-sm text-muted-foreground">
                      Enter your mobile number to receive a verification code.
                    </p>
                    <div>
                      <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center px-3 border border-border rounded-lg bg-muted text-sm font-medium text-foreground">
                          +91
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="flex-1 border border-border bg-background rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          placeholder="Enter 10-digit number"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.length !== 10}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2 rounded-lg disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Phone size={16} />
                          Send OTP
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </motion.form>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-foreground">
                          +91 {phone}
                        </span>
                        <button
                          onClick={() => {
                            setStep("phone");
                            setOtp(["", "", "", "", "", ""]);
                          }}
                          className="text-secondary text-xs hover:underline flex items-center gap-0.5"
                        >
                          <ArrowLeft size={12} />
                          Change
                        </button>
                      </div>
                    </div>

                    {/* OTP Input Boxes */}
                    <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          disabled={loading}
                          className="w-11 h-12 text-center text-lg font-semibold border-2 border-border rounded-lg bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all disabled:opacity-50"
                        />
                      ))}
                    </div>

                    {/* Countdown / Resend */}
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Resend OTP in{" "}
                          <span className="font-semibold text-foreground">{countdown}s</span>
                        </p>
                      ) : (
                        <button
                          onClick={handleResend}
                          disabled={loading}
                          className="text-xs text-secondary hover:underline font-medium disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {loading && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        Verifying...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
