import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/products";

const TestimonialSection = () => {
  return (
    <section className="py-32 md:py-44 bg-accent">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-4 font-body">
            Testimonials
          </p>
          <h2 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">
            What Our Customers
            <span className="italic font-normal"> Say</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-background p-8 md:p-10 border border-border group hover:border-secondary/30 transition-all duration-500"
            >
              <Quote size={28} className="text-secondary/20 mb-6" />
              <p className="text-sm text-muted-foreground leading-[1.8] mb-8">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-medium text-foreground tracking-wide">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-1">{t.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={11} className="fill-secondary text-secondary" />
                  ))}
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
