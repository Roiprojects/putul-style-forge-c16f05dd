import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Gift } from "lucide-react";

const STORAGE_KEY = "exit_intent_shown";

const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOpen(true);
      }
    };

    // Mobile fallback: trigger after 30s of inactivity
    let timer: number | undefined;
    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          setOpen(true);
        }
      }, 45000);
    };
    resetTimer();
    window.addEventListener("scroll", resetTimer, { passive: true });
    window.addEventListener("touchstart", resetTimer, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const handleClaim = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    navigator.clipboard?.writeText("WAIT10").catch(() => {});
    toast.success("Code WAIT10 copied! Use at checkout for 10% off.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Wait! Don't leave yet</h2>
          <p className="text-muted-foreground mb-6">
            Get <span className="font-bold text-primary">10% off</span> your first order. Use code <span className="font-mono font-bold">WAIT10</span>
          </p>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleClaim} className="w-full">Claim 10% Off</Button>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:underline">
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
