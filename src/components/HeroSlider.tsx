import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { heroBanners } from "@/data/products";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full min-h-[85svh] mt-[calc(2rem+4rem)] md:mt-[calc(2rem+5rem)] overflow-hidden bg-foreground">
      {/* Full-screen image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={heroBanners[current].image}
          alt={heroBanners[current].title}
          className="absolute inset-0 h-full w-full object-cover object-top"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>

      {/* Subtle bottom gradient for controls */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-foreground/60 to-transparent pointer-events-none" />

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-6 pb-10">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-3 bg-background px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:bg-secondary hover:text-secondary-foreground"
        >
          Shop Now
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        {/* Slide indicators */}
        <div className="flex items-center gap-3">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="relative h-[2px] w-8 bg-background/30 overflow-hidden"
            >
              {i === current && (
                <motion.div
                  className="absolute inset-0 bg-background"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
