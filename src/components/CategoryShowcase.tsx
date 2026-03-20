import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";

const CategoryShowcase = () => {
  return (
    <section className="py-10 md:py-14 bg-accent/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-heading font-semibold tracking-wide uppercase text-foreground">
            Shop By Category
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Find your perfect pair</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block relative overflow-hidden rounded-lg aspect-[4/5]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-background tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-background/60 tracking-wide mt-0.5">
                    {cat.productCount} Products
                  </p>
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
