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

  if (slides.length === 0) {
    return <section className="relative w-full aspect-[16/9] md:aspect-[16/7] bg-muted" />;
  }

  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[16/7] overflow-hidden bg-foreground/5">
      {/* Background: show current image as blurred backdrop to avoid white flash */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${slides[current].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.6)",
          transform: "scale(1.1)",
        }}
      />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={{
            enter: (dir: number) => ({
              x: dir > 0 ? "100%" : "-100%",
              opacity: 0,
              scale: 1.05,
            }),
            center: {
              x: 0,
              opacity: 1,
              scale: 1,
            },
            exit: (dir: number) => ({
              x: dir > 0 ? "-30%" : "30%",
              opacity: 0,
              scale: 0.95,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-[1]"
        >
          <Link to="/shop" className="block w-full h-full relative">
            <motion.img
              src={slides[current].image}
              alt={slides[current].title}
              className="w-full h-full object-cover object-center"
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 6, ease: "linear" }}
            />
            {/* Subtle gradient overlay at bottom for dot visibility */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </Link>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-background/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-background/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-foreground" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`transition-all duration-500 rounded-full ${
              i === current
                ? "w-8 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
