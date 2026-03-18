import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window;
    if (isTouchDevice) return;

    setIsVisible(true);

    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("[data-cursor-expand]")
      ) {
        setIsHovering(true);
      }
    };

    const handleOut = () => setIsHovering(false);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - (isHovering ? 24 : 16),
          y: position.y - (isHovering ? 24 : 16),
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.5 }}
      >
        <div
          className={`w-full h-full rounded-full border transition-all duration-300 ${
            isHovering ? "border-background/80 scale-100" : "border-background/40 scale-100"
          }`}
        />
      </motion.div>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 2.5,
          y: position.y - 2.5,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className="w-[5px] h-[5px] rounded-full bg-background" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
