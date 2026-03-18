import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import CategoryShowcase from "@/components/CategoryShowcase";
import TestimonialSection from "@/components/TestimonialSection";
import PromoBar from "@/components/PromoBar";
import { products } from "@/data/products";
import { useRef } from "react";

const bestSellers = products.filter((p) => p.bestSeller).slice(0, 6);
const trending = products.filter((p) => p.trending).slice(0, 5);

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <PromoBar />
      <HeroSlider />

      {/* Brand statement — oversized typography */}
      <section className="py-32 md:py-48 grain-overlay">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className="w-12 h-px bg-secondary mx-auto mb-10" />
            <h2 className="font-heading text-4xl md:text-6xl lg:text-8xl font-light leading-[1.1] tracking-tight mb-10">
              Where Comfort Meets
              <br />
              <span className="italic text-secondary">Contemporary</span> Design
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-[2] font-light">
              Curated collections of premium men's footwear — designed for those
              who believe style should never compromise comfort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Horizontal scroll product showcase */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 mb-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-subheading mb-3">Featured</p>
              <h2 className="section-heading">
                Best <span className="italic">Sellers</span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              View All
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="horizontal-scroll gap-4 md:gap-6 px-6 md:px-12 pb-4 scrollbar-none"
        >
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} variant="editorial" />
          ))}
        </div>
      </section>

      {/* Categories */}
      <CategoryShowcase />

      {/* Cinematic editorial split */}
      <section className="grid md:grid-cols-2 min-h-[90vh]">
        <div className="relative overflow-hidden group">
          <motion.img
            src={products[0]?.image}
            alt="New arrivals"
            className="w-full h-full object-cover min-h-[50vh]"
            loading="lazy"
            whileInView={{ scale: 1.05 }}
            transition={{ duration: 2 }}
            viewport={{ once: true }}
          />
          <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors duration-1000" />
          <div className="absolute inset-0 flex items-center justify-center text-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-8">New Season</p>
              <h2 className="font-heading text-5xl md:text-7xl font-light text-background mb-10 tracking-tight leading-[1.05]">
                New<br />Arrivals
              </h2>
              <Link to="/shop" className="inline-flex items-center gap-3 border border-background/40 text-background px-10 py-4 tracking-[0.25em] uppercase text-[10px] font-medium hover:bg-background hover:text-foreground transition-all duration-700 backdrop-blur-sm">
                Shop New In <ArrowRight size={12} />
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="relative overflow-hidden group">
          <motion.img
            src={products[3]?.image}
            alt="Sale"
            className="w-full h-full object-cover min-h-[50vh]"
            loading="lazy"
            whileInView={{ scale: 1.05 }}
            transition={{ duration: 2 }}
            viewport={{ once: true }}
          />
          <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors duration-1000" />
          <div className="absolute inset-0 flex items-center justify-center text-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-8">Up to 71% Off</p>
              <h2 className="font-heading text-5xl md:text-7xl font-light text-background mb-10 tracking-tight leading-[1.05]">
                Amazing<br />Deals
              </h2>
              <Link to="/shop" className="inline-flex items-center gap-3 border border-background/40 text-background px-10 py-4 tracking-[0.25em] uppercase text-[10px] font-medium hover:bg-background hover:text-foreground transition-all duration-700 backdrop-blur-sm">
                Shop Sale <ArrowRight size={12} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending — single-row editorial */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16 md:mb-24">
            <p className="section-subheading mb-3">What's Hot</p>
            <h2 className="section-heading">
              Trending <span className="italic">Now</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {trending.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} variant="large" />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Why Choose Us — editorial */}
      <section className="py-24 md:py-40">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-px bg-secondary mb-10" />
              <p className="section-subheading mb-4">Our Promise</p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl font-light mb-8 leading-[1.1] tracking-tight">
                Why Choose
                <br />
                <span className="italic text-secondary">Putul</span> Fashions
              </h2>
              <p className="text-muted-foreground mb-12 leading-[2] text-sm font-light max-w-md">
                We believe premium quality shouldn't come with a premium price tag.
                Every product is crafted with meticulous attention to detail.
              </p>
              <div className="space-y-6 mb-14">
                {["Premium Materials", "Handpicked Designs", "Comfort Guaranteed", "Affordable Luxury"].map((item) => (
                  <div key={item} className="flex items-center gap-5">
                    <div className="w-8 h-px bg-secondary" />
                    <span className="text-xs tracking-[0.15em] uppercase font-light">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-outline-gold">
                Learn More
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={products[0]?.images[1] || products[0]?.image}
                  alt="Putul Fashions quality"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-foreground text-background p-8 md:p-12">
                <p className="font-heading text-5xl md:text-6xl font-light tracking-tight">50%</p>
                <p className="text-[9px] tracking-[0.3em] uppercase mt-2 text-background/50">Min Savings</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA — cinematic minimal */}
      <section className="py-32 md:py-48 bg-foreground text-background grain-overlay">
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-12 h-px bg-secondary mx-auto mb-10" />
            <h2 className="font-heading text-5xl md:text-7xl lg:text-9xl font-light mb-8 tracking-tight leading-[1.05]">
              Step Into
              <span className="italic"> Style</span>
            </h2>
            <p className="text-background/40 mb-16 max-w-md mx-auto leading-[2] text-sm font-light">
              Join thousands of men who trust Putul Fashions for premium comfort
              footwear at unbeatable prices.
            </p>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-4 border border-background/30 px-14 py-5 tracking-[0.3em] uppercase text-[10px] font-medium text-background hover:bg-background hover:text-foreground transition-all duration-700"
            >
              Shop Now
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
