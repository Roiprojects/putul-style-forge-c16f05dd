import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "@/data/products";

const TestimonialSection = () => {
  return (
    <section className="py-24 md:py-36 bg-foreground text-background grain-overlay">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <p className="text-secondary tracking-[0.5em] uppercase text-[10px] mb-4">
            Testimonials
          </p>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Voices of <span className="italic">Confidence</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-background/10">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="bg-foreground p-8 md:p-12 group"
            >
              <div className="flex gap-0.5 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={10} className="fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-background/60 text-sm leading-[2] mb-10 font-light">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-background/10">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-[12px] font-medium text-background/90 tracking-wider uppercase">{t.name}</p>
                  <p className="text-[10px] text-background/30 tracking-wider mt-0.5">{t.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
