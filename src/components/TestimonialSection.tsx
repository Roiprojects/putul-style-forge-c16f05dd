import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/products";

const TestimonialSection = () => {
  return (
    <section className="py-24 md:py-32 bg-accent">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3 font-body">
            Testimonials
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background p-8 border border-border group hover:border-secondary/30 transition-colors duration-300"
            >
              <Quote size={24} className="text-secondary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} className="fill-secondary text-secondary" />
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
