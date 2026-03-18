import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const slides = [
  { image: heroSlide1, subtitle: "Spring / Summer 2026" },
  { image: heroSlide2, subtitle: "The New Collection" },
  { image: heroSlide3, subtitle: "Premium Comfort" },
  { image: heroSlide4, subtitle: "Crafted With Care" },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-svh overflow-hidden bg-foreground grain-overlay">
      {/* Fullscreen images with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current].image}
          alt={`Putul Fashions — ${slides[current].subtitle}`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </AnimatePresence>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-foreground/20 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 md:pb-32 px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-background/60 tracking-[0.5em] uppercase text-[10px] mb-6"
          >
            {slides[current].subtitle}
          </motion.p>
        </AnimatePresence>

        <Link
          to="/shop"
          className="group inline-flex items-center gap-4 border border-background/30 px-12 py-4 text-[10px] font-medium uppercase tracking-[0.3em] text-background transition-all duration-700 hover:bg-background hover:text-foreground backdrop-blur-sm"
        >
          Explore Collection
          <ArrowRight size={13} className="transition-transform duration-500 group-hover:translate-x-1.5" />
        </Link>
      </div>

      {/* Minimal slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-700 ${
              i === current ? "w-10 h-px bg-background" : "w-5 h-px bg-background/30"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Side counter */}
      <div className="absolute right-8 bottom-24 z-10 hidden md:flex flex-col items-end gap-1">
        <span className="text-background/40 text-[10px] tracking-[0.2em] font-body">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
