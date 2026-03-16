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

  const slide = heroBanners[current];

  return (
    <section className="w-full pt-8">
      <div className="grid md:grid-cols-[2fr_3fr] min-h-[100svh]">
        {/* Left — text on solid background */}
        <div className="flex flex-col justify-center bg-foreground px-8 py-16 md:px-12 lg:px-16 md:py-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-8 h-[2px] bg-secondary"
              />
              <h1 className="mb-4 font-heading text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-background">
                {slide.title}
              </h1>
              <p className="mb-10 max-w-md font-body text-sm font-light leading-relaxed text-background/60 md:text-base">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-3 bg-background px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:bg-secondary hover:text-secondary-foreground"
                >
                  {slide.cta}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/shop"
                  className="border-b border-background/20 pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-background/50 transition-colors duration-300 hover:text-secondary"
                >
                  Explore All
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide counter */}
          <div className="mt-16 flex items-center gap-4">
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
        </div>

        {/* Right — image only */}
        <div className="relative overflow-hidden min-h-[50vh] md:min-h-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
