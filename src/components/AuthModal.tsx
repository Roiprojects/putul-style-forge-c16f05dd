import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type AuthView = "login" | "signup" | "forgot";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setShowPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    setView("login");
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      handleClose();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to verify.");
      handleClose();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email.");
      handleClose();
    }
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
            className="bg-background w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-secondary text-[10px] tracking-[0.3em] uppercase">Putul Fashions</p>
                <h2 className="font-heading text-xl font-semibold mt-1">
                  {view === "login" ? "Welcome Back" : view === "signup" ? "Create Account" : "Reset Password"}
                </h2>
              </div>
              <button onClick={handleClose} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Google Sign In - shown on login and signup */}
              {(view === "login" || view === "signup") && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      setLoading(false);
                      if (error) toast.error(error.message);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 border border-border py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </div>
              )}

              {view === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setView("forgot")} className="text-xs text-secondary hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Sign In
                  </button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setView("signup")} className="text-secondary hover:underline font-medium">
                      Sign Up
                    </button>
                  </p>
                </form>
              )}

              {view === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary pr-10"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Create Account
                  </button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setView("login")} className="text-secondary hover:underline font-medium">
                      Sign In
                    </button>
                  </p>
                </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter your email and we'll send you a password reset link.</p>
                  <div>
                    <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Send Reset Link
                  </button>
                  <p className="text-center text-sm text-muted-foreground">
                    <button type="button" onClick={() => setView("login")} className="text-secondary hover:underline font-medium">
                      Back to Sign In
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
