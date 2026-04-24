import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "918000685588";

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleSend = (msg: string) => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    setOpen(false);
  };

  const quickMessages = [
    "Hi! I have a question about a product.",
    "I need help with my order.",
    "What are your shipping options?",
    "Do you have a size guide?",
  ];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[300px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Chat with PUTUL</p>
              <p className="text-xs opacity-90">Typically replies in minutes</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Quick messages:</p>
            {quickMessages.map((m) => (
              <button
                key={m}
                onClick={() => handleSend(m)}
                className="w-full text-left text-xs p-2.5 bg-muted hover:bg-muted/70 rounded-xl transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setOpen(!open);
          setPulse(false);
        }}
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 bg-[#25D366] hover:bg-[#1ebe5a] text-white p-3.5 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="WhatsApp Chat"
      >
        <MessageCircle className="h-5 w-5" />
        {pulse && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-75" />
        )}
      </button>
    </>
  );
};

export default WhatsAppWidget;
