import { useEffect, useState } from "react";
import { Share2, Copy, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReferralCard = () => {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Generate stable code from user ID
        const short = session.user.id.replace(/-/g, "").slice(0, 6).toUpperCase();
        setCode(`PUTUL${short}`);
      }
    });
  }, []);

  const link = `${window.location.origin}/?ref=${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "PUTUL — Get ₹200 off",
          text: `Shop PUTUL with my code ${code} and get ₹200 off your first order.`,
          url: link,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  if (!code) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
        Sign in to get your referral code.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Refer & Earn</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Give friends ₹200 off, you get ₹200 store credit when they purchase.
      </p>
      <div className="bg-muted/40 rounded-xl p-3 flex items-center justify-between mb-3">
        <span className="font-mono font-semibold">{code}</span>
        <button
          onClick={handleCopy}
          className="text-xs flex items-center gap-1 text-primary hover:underline"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <Button onClick={handleShare} className="w-full" variant="outline">
        <Share2 className="w-4 h-4" />
        Share with friends
      </Button>
    </div>
  );
};

export default ReferralCard;
