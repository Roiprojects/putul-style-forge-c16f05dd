import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20">
          <div>
            <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-4 font-body">
              Browse By
            </p>
            <h2 className="font-heading text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Shop By<br />
              <span className="italic font-normal">Category</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-6 md:mt-0 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-secondary transition-colors flex items-center gap-2 group"
          >
            View All
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            // Asymmetric sizing: first item larger
            const colSpan = i === 0 ? "col-span-6 md:col-span-5" :
                           i === 1 ? "col-span-6 md:col-span-7" :
                           i === 2 ? "col-span-6 md:col-span-7" :
                                     "col-span-6 md:col-span-5";
            const aspectClass = i < 2 ? "aspect-[3/4]" : "aspect-[4/5]";

            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={colSpan}
              >
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className={`group block relative overflow-hidden ${aspectClass}`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <h3 className="text-background font-heading text-2xl md:text-3xl font-semibold mb-1 tracking-tight">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-background/50 text-[10px] tracking-[0.2em] uppercase">
                        {cat.productCount} Products
                      </span>
                      <div className="w-0 group-hover:w-8 h-[1px] bg-secondary transition-all duration-500" />
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-6 right-6 w-11 h-11 bg-background/0 group-hover:bg-background flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0">
                    <ArrowUpRight size={16} className="text-foreground" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
