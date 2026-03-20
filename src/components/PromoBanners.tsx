import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products } from "@/data/products";

const PromoBanners = () => {
  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/shop" className="group block relative overflow-hidden rounded-lg aspect-[16/8]">
              <img
                src={products[0]?.image}
                alt="New Arrivals"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
              <div className="absolute inset-0 flex items-center p-8">
                <div>
                  <p className="text-secondary text-[10px] tracking-[0.3em] uppercase font-medium mb-2">New Season</p>
                  <h3 className="font-heading text-3xl md:text-4xl font-semibold text-background leading-tight">
                    New<br />Arrivals
                  </h3>
                  <span className="inline-block mt-4 text-[11px] tracking-wide uppercase text-background/80 border-b border-background/40 pb-0.5 group-hover:border-secondary group-hover:text-secondary transition-colors">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/shop" className="group block relative overflow-hidden rounded-lg aspect-[16/8]">
              <img
                src={products[3]?.image}
                alt="Best Deals"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
              <div className="absolute inset-0 flex items-center p-8">
                <div>
                  <p className="text-secondary text-[10px] tracking-[0.3em] uppercase font-medium mb-2">Up To 71% Off</p>
                  <h3 className="font-heading text-3xl md:text-4xl font-semibold text-background leading-tight">
                    Amazing<br />Deals
                  </h3>
                  <span className="inline-block mt-4 text-[11px] tracking-wide uppercase text-background/80 border-b border-background/40 pb-0.5 group-hover:border-secondary group-hover:text-secondary transition-colors">
                    Shop Sale
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
