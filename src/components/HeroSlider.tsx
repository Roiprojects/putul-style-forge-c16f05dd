import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { heroBanners } from "@/data/products";

type HeroBanner = {
  image: string;
  title: string;
};

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("title, image_urls")
      .eq("section_type", "hero_banner")
      .eq("is_enabled", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Flatten: each section can have multiple images
          const dbSlides: HeroBanner[] = [];
          data.forEach((s: any) => {
            if (s.image_urls?.length) {
              s.image_urls.forEach((url: string) => {
                dbSlides.push({ image: url, title: s.title || "Banner" });
              });
            }
          });
          if (dbSlides.length > 0) {
            setSlides(dbSlides);
            return;
          }
        }
        // Fallback to static data
        setSlides(heroBanners.map(b => ({ image: b.image, title: b.title })));
      });
  }, []);

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  if (slides.length === 0) {
    return <section className="relative w-full aspect-[16/9] md:aspect-[16/7] bg-muted" />;
  }

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
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover object-center"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, i) => (
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
