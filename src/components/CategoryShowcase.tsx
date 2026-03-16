import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-8">
          <p className="text-secondary tracking-[0.3em] uppercase text-[10px] mb-2 font-body">
            Browse By
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
            Shop By Category
          </h2>
        </div>

        {/* Myntra/Flipkart style: circular/rounded category cards in a row */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center text-center gap-2"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-secondary transition-colors duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] md:text-xs font-medium tracking-wide group-hover:text-secondary transition-colors">
                  {cat.name}
                </span>
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">
                  {cat.productCount} Products
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
