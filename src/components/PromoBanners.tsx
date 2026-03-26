import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PromoSection = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_urls: string[];
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
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`grid ${banners.length >= 2 ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4 md:gap-5`}>
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to="/shop" className="group block relative overflow-hidden rounded-lg aspect-[16/8]">
                {banner.image_urls?.[0] ? (
                  <img
                    src={banner.image_urls[0]}
                    alt={banner.title || "Promo"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-accent" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
                <div className="absolute inset-0 flex items-center p-8">
                  <div>
                    {banner.subtitle && (
                      <p className="text-secondary text-[10px] tracking-[0.3em] uppercase font-medium mb-2">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.title && (
                      <h3 className="font-heading text-3xl md:text-4xl font-semibold text-background leading-tight">
                        {banner.title}
                      </h3>
                    )}
                    <span className="inline-block mt-4 text-[11px] tracking-wide uppercase text-background/80 border-b border-background/40 pb-0.5 group-hover:border-secondary group-hover:text-secondary transition-colors">
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
