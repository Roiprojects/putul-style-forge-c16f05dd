import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-24 md:py-36">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="section-subheading mb-4">Categories</p>
          <h2 className="section-heading">
            Shop By <span className="italic">Category</span>
          </h2>
        </motion.div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden"
              >
                <div className={`${i === 0 ? "aspect-square" : "aspect-[4/5]"} overflow-hidden`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-12">
                  <h3 className={`font-heading text-background font-light tracking-wide mb-1 ${i === 0 ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}`}>
                    {cat.name}
                  </h3>
                  <span className="text-background/50 text-[9px] tracking-[0.3em] uppercase flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Explore <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
