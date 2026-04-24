import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 8000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
    setVisible(false);
  };

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-card border border-border rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Install PUTUL App</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Quick access, faster checkout, exclusive deals.
          </p>
          <Button size="sm" onClick={handleInstall} className="mt-3 w-full">
            Install Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
