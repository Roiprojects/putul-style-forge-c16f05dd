import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    // Store locally (newsletter delivery hook can be added later)
    const list = JSON.parse(localStorage.getItem("newsletter_subs") || "[]");
    if (!list.includes(email)) list.push(email);
    localStorage.setItem("newsletter_subs", JSON.stringify(list));
    setSubmitted(true);
    toast.success("You're in! Use code WELCOME10 for 10% off your first order.");
  };

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-accent/5 border-y">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-serif font-semibold mb-2">Join the inner circle</h2>
        <p className="text-muted-foreground mb-6">
          Get 10% off your first order, early access to drops, and styling tips.
        </p>
        {submitted ? (
          <div className="inline-block px-6 py-3 rounded-full bg-primary/10 text-primary font-medium">
            ✓ Welcome aboard! Check your inbox soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
