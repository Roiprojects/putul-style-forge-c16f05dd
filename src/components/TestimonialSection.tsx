import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/products";
import { useRef } from "react";

const TestimonialSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-15%"]);

  return (
    <section ref={containerRef} className="py-24 md:py-36 overflow-hidden">
      <div className="container mx-auto px-8 md:px-16 mb-16 md:mb-20">
        <p className="section-subheading mb-3">Testimonials</p>
        <h2 className="section-heading">
          Voices of <span className="italic">Confidence</span>
        </h2>
      </div>

      {/* Horizontally scrolling testimonial strip */}
      <motion.div style={{ x }} className="flex gap-6 md:gap-8 px-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="flex-shrink-0 w-[85vw] md:w-[40vw] lg:w-[30vw] bg-foreground text-background p-8 md:p-12 grain-overlay group"
          >
            <div className="relative z-10">
              <div className="flex gap-0.5 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={10} className="fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-background/50 text-sm leading-[2.2] mb-10 font-light">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-background/10">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-[11px] font-medium text-background/80 tracking-wider uppercase">{t.name}</p>
                  <p className="text-[9px] text-background/30 tracking-wider mt-0.5">{t.date}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TestimonialSection;
