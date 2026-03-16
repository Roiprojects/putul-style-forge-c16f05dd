import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { heroBanners } from "@/data/products";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroBanners[current];

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-foreground pt-8">
      {/* Background image with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <motion.img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.06] }}
            transition={{ duration: 8, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-foreground/10" />
        </motion.div>
      </AnimatePresence>

      {/* Content — bottom-aligned editorial style */}
      <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-end pb-20 md:pb-28 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="h-[2px] bg-secondary mb-8"
            />
            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-heading font-bold text-background leading-[0.9] tracking-tight mb-6">
              {slide.title}
            </h1>
            <p className="text-background/50 text-base md:text-xl mb-12 font-body max-w-xl font-light leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-background text-foreground px-10 py-5 tracking-[0.25em] uppercase text-[11px] font-semibold transition-all duration-500 hover:bg-secondary hover:text-secondary-foreground"
              >
                {slide.cta}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="text-background/60 tracking-[0.2em] uppercase text-[11px] font-medium hover:text-secondary transition-colors duration-300 border-b border-background/20 pb-1"
              >
                Explore All
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Minimal slide counter */}
      <div className="absolute bottom-8 right-8 md:right-12 flex items-center gap-4 z-20">
        <span className="text-background/40 text-xs tracking-[0.2em] font-body">
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="w-12 h-[1px] bg-background/20 relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            key={current}
          />
        </div>
        <span className="text-background/40 text-xs tracking-[0.2em] font-body">
          {String(heroBanners.length).padStart(2, "0")}
        </span>
      </div>

      {/* Vertical text accent */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 z-10">
        <p className="text-background/15 text-[10px] tracking-[0.5em] uppercase font-body [writing-mode:vertical-lr] rotate-180">
          Putul Fashions — Est. 2025
        </p>
      </div>
    </section>
  );
};

export default HeroSlider;
