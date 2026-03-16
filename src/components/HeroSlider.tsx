import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const slides = [heroSlide1, heroSlide2, heroSlide3, heroSlide4];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full min-h-[85svh] mt-[calc(2rem+4rem)] md:mt-[calc(2rem+5rem)] overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current]}
          alt={`Putul Fashions Collection ${current + 1}`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-foreground/60 to-transparent pointer-events-none" />

      {/* Slide indicators */}
      <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[2px] transition-all duration-500 ${
              i === current ? "w-8 bg-background" : "w-4 bg-background/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-6 pb-10">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-3 bg-background px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:bg-secondary hover:text-secondary-foreground"
        >
          Shop Now
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default HeroSlider;
