import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import AIChatbox from "@/components/AIChatbox";

const FloatingButtons = () => {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handler = () => setChatOpen(true);
    window.addEventListener("toggle-chatbot", handler);
    return () => window.removeEventListener("toggle-chatbot", handler);
  }, []);

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-5 z-50">
        <motion.button
          onClick={() => setChatOpen((v) => !v)}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={18} strokeWidth={1.5} />
        </motion.button>
      </div>

      <AIChatbox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default FloatingButtons;
