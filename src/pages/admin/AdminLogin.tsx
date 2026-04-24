import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useWebOTP } from "@/hooks/useWebOTP";

type Step = "phone" | "otp";

const AdminLogin = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const fullPhone = `+91${phone}`;

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { phone: fullPhone, is_admin: true },
    });

    setLoading(false);

    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed to send OTP");
      return;
    }

    toast.success("OTP sent!");
    setStep("otp");
    setCountdown(30);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleVerifyOTP = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("verify-otp", {
      body: { phone: fullPhone, otp_code: otpValue, is_admin: true },
    });

    if (error || data?.error) {
      setLoading(false);
      toast.error(data?.error || error?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }

    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      const sessionUserId = data.session.user?.id;
      if (sessionUserId) {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const { data: adminRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", sessionUserId)
            .eq("role", "admin")
            .maybeSingle();

          if (adminRole) break;
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }

    setLoading(false);
    toast.success("Welcome, Admin!");
    navigate("/admin", { replace: true });
  }, [fullPhone, navigate]);

  // WebOTP API: Android Chrome auto-reads SMS containing "@domain #123456"
  useWebOTP(step === "otp", useCallback((code: string) => {
    const digits = code.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      handleVerifyOTP(digits);
    }
  }, [handleVerifyOTP]));

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 px-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-6 py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} className="text-primary-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-semibold">Admin Panel</h1>
            <p className="text-primary-foreground/60 text-xs mt-1">Putul Fashions</p>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "phone" && (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-5"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Enter your admin mobile number to sign in.
                  </p>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center px-3 border border-border rounded-lg bg-muted text-sm font-medium">
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
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Phone size={16} />
                        Send OTP
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-sm font-semibold">+91 {phone}</span>
                      <button
                        onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                        className="text-secondary text-xs hover:underline flex items-center gap-0.5"
                      >
                        <ArrowLeft size={12} /> Change
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={loading}
                        className="w-11 h-12 text-center text-lg font-semibold border-2 border-border rounded-lg bg-background focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all disabled:opacity-50"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Resend OTP in <span className="font-semibold text-foreground">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={() => handleSendOTP()}
                        disabled={loading}
                        className="text-xs text-secondary hover:underline font-medium disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
