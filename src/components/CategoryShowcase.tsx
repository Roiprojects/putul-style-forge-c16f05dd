import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3 font-body">
              Browse By
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold leading-tight">
              Shop Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 text-sm tracking-widest uppercase text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block relative overflow-hidden aspect-[3/4]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-background font-heading text-xl md:text-2xl font-semibold mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-background/60 text-xs tracking-wider uppercase">
                    {cat.productCount} Products
                  </p>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-background/0 group-hover:bg-background flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <ArrowUpRight size={18} className="text-foreground" />
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
