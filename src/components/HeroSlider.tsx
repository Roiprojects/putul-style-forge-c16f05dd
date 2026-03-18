import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

const slides = [
  { image: heroSlide1, subtitle: "Spring / Summer 2026", title: "The New\nEdit" },
  { image: heroSlide2, subtitle: "Premium Collection", title: "Walk With\nConfidence" },
  { image: heroSlide3, subtitle: "Crafted With Care", title: "Style\nRedefined" },
  { image: heroSlide4, subtitle: "Everyday Luxury", title: "Step Into\nComfort" },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgX = useTransform(mouseX, [0, 1], [-15, 15]);
  const imgY = useTransform(mouseY, [0, 1], [-10, 10]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-svh overflow-hidden bg-foreground"
    >
      {/* Parallax background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-[-30px]"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ x: imgX, y: imgY }}
        >
          <img
            src={slides[current].image}
            alt={`Putul Fashions — ${slides[current].subtitle}`}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-foreground/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 to-transparent pointer-events-none" />

      {/* Large animated title */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-8 md:px-16 pb-28 md:pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={`title-${current}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-secondary tracking-[0.5em] uppercase text-[9px] md:text-[10px] mb-4 md:mb-6"
            >
              {slides[current].subtitle}
            </motion.p>
            <h2 className="font-heading text-5xl md:text-8xl lg:text-9xl font-light text-background leading-[0.95] tracking-tight whitespace-pre-line">
              {slides[current].title}
            </h2>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 md:mt-14"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-4 text-background text-[10px] tracking-[0.3em] uppercase font-medium"
          >
            <span className="w-12 h-px bg-secondary group-hover:w-20 transition-all duration-700" />
            Explore Collection
            <ArrowRight size={12} className="transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </div>

      {/* Vertical slide indicators */}
      <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group flex items-center gap-3"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`text-[9px] tracking-wider font-body transition-all duration-500 ${
              i === current ? "text-background opacity-100" : "text-background/0 group-hover:text-background/50 opacity-0 group-hover:opacity-100"
            }`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`block transition-all duration-700 ${
                i === current ? "h-10 w-px bg-background" : "h-5 w-px bg-background/25 group-hover:bg-background/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-background/0 via-background/60 to-background/0" />
      </motion.div>
    </section>
  );
};

export default HeroSlider;
