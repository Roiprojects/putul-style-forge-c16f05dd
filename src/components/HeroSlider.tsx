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
            className="h-full w-full object-cover object-[78%_center] md:object-[82%_center]"
            animate={{ scale: [1, 1.06] }}
            transition={{ duration: 8, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/88 via-foreground/50 to-foreground/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/72 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content — bottom-aligned editorial style */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-16 md:pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-[32rem] md:max-w-[38rem] border border-background/10 bg-foreground/28 p-6 backdrop-blur-sm md:p-8 lg:p-10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6 h-[2px] bg-secondary md:mb-8"
              />
              <h1 className="mb-4 font-heading text-[clamp(3.2rem,8vw,6rem)] font-bold leading-[0.92] tracking-tight text-background md:mb-5">
                {slide.title}
              </h1>
              <p className="mb-8 max-w-lg font-body text-sm font-light leading-relaxed text-background/75 md:mb-10 md:text-lg">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-5 md:gap-6">
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-3 bg-background px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:bg-secondary hover:text-secondary-foreground md:px-10 md:py-5"
                >
                  {slide.cta}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/shop"
                  className="border-b border-background/20 pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-background/70 transition-colors duration-300 hover:text-secondary"
                >
                  Explore All
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
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
