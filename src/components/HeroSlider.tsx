import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroBanners } from "@/data/products";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroBanners.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = heroBanners[current];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-30%" : "30%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-foreground">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 md:px-8 flex items-center z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-secondary tracking-[0.4em] uppercase text-xs md:text-sm mb-4 font-body"
            >
              Putul Fashions — 2026
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-heading font-bold text-background leading-[0.95] mb-4">
              {slide.title}
            </h1>
            <p className="text-background/70 text-lg md:text-xl mb-10 font-body max-w-lg font-light">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary text-base px-10 py-4">
                {slide.cta}
              </Link>
              <Link
                to="/shop"
                className="border border-background/30 text-background px-10 py-4 tracking-widest uppercase text-sm font-medium transition-all duration-300 hover:bg-background/10"
              >
                View All
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-20">
        <button
          onClick={prev}
          className="w-12 h-12 border border-background/30 text-background flex items-center justify-center hover:bg-background/10 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="w-12 h-12 border border-background/30 text-background flex items-center justify-center hover:bg-background/10 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-0.5 transition-all duration-500 ${
              i === current ? "w-10 bg-secondary" : "w-6 bg-background/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
