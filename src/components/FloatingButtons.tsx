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
      {/* Chat FAB hidden for now */}

      <AIChatbox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default FloatingButtons;
