import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/products";
import { useState } from "react";

const CategoryShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-36 bg-foreground text-background grain-overlay overflow-hidden">
      <div className="container mx-auto px-8 md:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-20"
        >
          <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-4">Categories</p>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Shop By <span className="italic">Category</span>
          </h2>
        </motion.div>

        {/* Interactive list-style categories */}
        <div className="relative">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative block border-t border-background/10 py-6 md:py-8"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 md:gap-10">
                    <span className="text-[10px] text-background/30 tracking-wider font-body w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-heading text-3xl md:text-5xl lg:text-6xl font-light tracking-tight transition-colors duration-500 group-hover:text-secondary">
                      {cat.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] text-background/30 tracking-[0.2em] uppercase hidden md:block">
                      {cat.productCount} Products
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-background/20 group-hover:text-secondary group-hover:translate-x-2 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Hover image reveal */}
                <motion.div
                  className="absolute right-24 top-1/2 -translate-y-1/2 w-48 h-32 md:w-64 md:h-44 overflow-hidden pointer-events-none z-20 hidden md:block"
                  initial={false}
                  animate={{
                    opacity: hoveredIndex === i ? 1 : 0,
                    scale: hoveredIndex === i ? 1 : 0.8,
                    rotate: hoveredIndex === i ? -3 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
          {/* Bottom border */}
          <div className="border-t border-background/10" />
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
