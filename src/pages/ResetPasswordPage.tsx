import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
  };

  if (!ready) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-primary text-primary-foreground px-6 py-5">
          <p className="text-secondary text-[10px] tracking-[0.3em] uppercase">Putul Fashions</p>
          <h1 className="font-heading text-xl font-semibold mt-1">Set New Password</h1>
        </div>
        <div className="border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-1.5">New Password</label>
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
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
