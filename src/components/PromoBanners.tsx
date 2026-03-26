import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type PromoSection = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_urls: string[];
};

const PromoSlider = ({ banner }: { banner: PromoSection }) => {
  const images = banner.image_urls || [];
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    if (images.length <= 1) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  if (images.length === 0) {
    return <div className="w-full h-full bg-accent" />;
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={banner.title || "Promo"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Blurred backdrop to prevent any flash */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: `url(${images[current]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(16px) brightness(0.7)",
          transform: "scale(1.15)",
        }}
      />
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={current}
          src={images[current]}
          alt={banner.title || "Promo"}
          custom={direction}
          variants={{
            enter: (dir: number) => ({
              x: dir > 0 ? "100%" : "-100%",
              opacity: 0.3,
            }),
            center: {
              x: 0,
              opacity: 1,
            },
            exit: (dir: number) => ({
              x: dir > 0 ? "-100%" : "100%",
              opacity: 0.3,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>
      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-5 h-1.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const PromoBanners = () => {
  const [banners, setBanners] = useState<PromoSection[]>([]);

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("id, title, subtitle, image_urls")
      .eq("section_type", "promo_banner")
      .eq("is_enabled", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setBanners(data as PromoSection[]);
      });
  }, []);

  if (banners.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`grid ${banners.length >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"} gap-3 md:gap-4`}>
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to="/shop" className="group block relative overflow-hidden rounded-lg aspect-[16/6]">
                <PromoSlider banner={banner} />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent pointer-events-none z-[2]" />
                <div className="absolute inset-0 flex items-center p-6 z-[3]">
                  <div>
                    {banner.subtitle && (
                      <p className="text-secondary text-[10px] tracking-[0.3em] uppercase font-medium mb-1.5">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.title && (
                      <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background leading-tight">
                        {banner.title}
                      </h3>
                    )}
                    <span className="inline-block mt-3 text-[10px] tracking-wide uppercase text-background/80 border-b border-background/40 pb-0.5 group-hover:border-secondary group-hover:text-secondary transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
