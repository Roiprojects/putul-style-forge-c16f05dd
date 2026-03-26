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
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[16/7] overflow-hidden bg-muted">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
          className="absolute inset-0"
        >
          <Link to="/shop" className="block w-full h-full">
            <img
              src={heroBanners[current].image}
              alt={heroBanners[current].title}
              className="w-full h-full object-cover object-top"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Left/Right arrows */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-full hover:bg-background transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-full hover:bg-background transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-foreground" />
      </button>

      {/* Bottom center dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-8 h-2 bg-foreground"
                : "w-2 h-2 bg-foreground/40 hover:bg-foreground/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
