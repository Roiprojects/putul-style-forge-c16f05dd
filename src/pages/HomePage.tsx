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

const featured = products.filter((p) => p.bestSeller).slice(0, 4);
const trending = products.filter((p) => p.trending).slice(0, 3);

const HomePage = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div className="cursor-none md:cursor-none">
      <PromoBar />
      <HeroSlider />

      {/* Brand statement — split screen with parallax */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="container mx-auto px-8 md:px-16 py-24 md:py-0">
          <div className="grid md:grid-cols-12 gap-8 md:gap-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:col-span-7"
            >
              <div className="w-16 h-px bg-secondary mb-10" />
              <h2 className="font-heading text-4xl md:text-6xl lg:text-8xl font-light leading-[1.05] tracking-tight">
                Where Comfort
                <br />
                Meets <span className="italic text-secondary">Contemporary</span>
                <br />
                Design
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="md:col-span-4 md:col-start-9"
            >
              <p className="text-muted-foreground text-sm leading-[2.2] font-light mb-8">
                Curated collections of premium men's footwear — designed for
                those who believe style should never compromise comfort.
              </p>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-4 text-[10px] tracking-[0.3em] uppercase font-medium text-foreground hover:text-secondary transition-colors"
              >
                <span className="w-10 h-px bg-foreground group-hover:w-16 group-hover:bg-secondary transition-all duration-700" />
                Discover More
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Horizontal scroll product showcase — immersive */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="px-8 md:px-16 mb-12 md:mb-16 flex items-end justify-between">
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
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="horizontal-scroll gap-5 md:gap-8 px-8 md:px-16 pb-6 scrollbar-none">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} variant="editorial" />
          ))}
          {/* End CTA card */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[60vw] md:w-[25vw] flex items-center justify-center bg-foreground grain-overlay"
          >
            <Link
              to="/shop"
              className="relative z-10 text-center p-12 group"
            >
              <p className="text-secondary tracking-[0.4em] uppercase text-[9px] mb-4">See Everything</p>
              <p className="font-heading text-3xl md:text-5xl font-light text-background mb-8 tracking-tight">
                View All<br /><span className="italic">Products</span>
              </p>
              <ArrowRight size={20} className="mx-auto text-background/50 group-hover:text-secondary group-hover:translate-x-2 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interactive Categories */}
      <CategoryShowcase />

      {/* Cinematic overlapping editorial split */}
      <section className="relative min-h-screen" ref={parallaxRef}>
        <div className="grid md:grid-cols-2 min-h-screen">
          <div className="relative overflow-hidden group">
            <motion.div
              style={{ y: parallaxY }}
              className="absolute inset-[-20%] w-[140%] h-[140%]"
            >
              <img
                src={products[0]?.image}
                alt="New arrivals"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
            </motion.div>
            <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/35 transition-colors duration-1000" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-12">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-6">New Season</p>
                <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-background mb-10 tracking-tight leading-[0.95]">
                  New<br />Arrivals
                </h2>
                <Link
                  to="/shop"
                  className="group/btn inline-flex items-center gap-3 text-background text-[10px] tracking-[0.3em] uppercase"
                >
                  <span className="w-8 h-px bg-secondary group-hover/btn:w-14 transition-all duration-500" />
                  Shop New In
                  <ArrowRight size={11} />
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="relative overflow-hidden group">
            <motion.div
              style={{ y: parallaxY }}
              className="absolute inset-[-20%] w-[140%] h-[140%]"
            >
              <img
                src={products[3]?.image}
                alt="Sale"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
            </motion.div>
            <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/35 transition-colors duration-1000" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-12">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
              >
                <p className="text-secondary tracking-[0.5em] uppercase text-[9px] mb-6">Up to 71% Off</p>
                <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-light text-background mb-10 tracking-tight leading-[0.95]">
                  Amazing<br />Deals
                </h2>
                <Link
                  to="/shop"
                  className="group/btn inline-flex items-center gap-3 text-background text-[10px] tracking-[0.3em] uppercase"
                >
                  <span className="w-8 h-px bg-secondary group-hover/btn:w-14 transition-all duration-500" />
                  Shop Sale
                  <ArrowRight size={11} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating overlapping badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-20 bg-secondary text-secondary-foreground px-12 py-6 text-center"
        >
          <p className="font-heading text-3xl md:text-4xl font-light tracking-tight">50% OFF</p>
          <p className="text-[9px] tracking-[0.3em] uppercase mt-1 opacity-80">Minimum Savings</p>
        </motion.div>
      </section>

      {/* Trending — single product spotlight */}
      <section className="py-32 md:py-48">
        <div className="container mx-auto px-8 md:px-16">
          <div className="text-center mb-20 md:mb-28">
            <p className="section-subheading mb-3">What's Hot</p>
            <h2 className="section-heading">
              Trending <span className="italic">Now</span>
            </h2>
          </div>

          {/* Alternating large/small layout instead of uniform grid */}
          <div className="space-y-16 md:space-y-24">
            {trending.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`grid md:grid-cols-12 gap-6 md:gap-12 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}
              >
                <Link
                  to={`/product/${product.id}`}
                  className={`group relative overflow-hidden ${i % 2 === 1 ? "md:col-start-5 md:col-span-8" : "md:col-span-8"}`}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-700" />
                </Link>
                <div className={`${i % 2 === 1 ? "md:col-start-1 md:col-span-4 md:row-start-1" : "md:col-span-4"} flex flex-col justify-center`}>
                  <span className="text-[9px] text-secondary tracking-[0.4em] uppercase mb-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-2xl md:text-3xl font-light tracking-tight mb-3 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light mb-4">
                    ₹{product.price.toLocaleString()}
                    {product.originalPrice && (
                      <span className="line-through ml-2 text-xs">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </p>
                  <Link
                    to={`/product/${product.id}`}
                    className="group/link inline-flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-foreground hover:text-secondary transition-colors"
                  >
                    <span className="w-8 h-px bg-foreground group-hover/link:w-14 group-hover/link:bg-secondary transition-all duration-500" />
                    View Product
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Why Choose Us — overlapping editorial */}
      <section className="py-24 md:py-40 overflow-hidden">
        <div className="container mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-12 gap-8 md:gap-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <div className="w-12 h-px bg-secondary mb-10" />
              <p className="section-subheading mb-4">Our Promise</p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl font-light mb-8 leading-[1.05] tracking-tight">
                Why Choose
                <br />
                <span className="italic text-secondary">Putul</span>
              </h2>
              <p className="text-muted-foreground mb-12 leading-[2.2] text-sm font-light max-w-sm">
                We believe premium quality shouldn't come with a premium price tag.
                Every product is crafted with meticulous attention to detail.
              </p>
              <div className="space-y-5 mb-14">
                {["Premium Materials", "Handpicked Designs", "Comfort Guaranteed", "Affordable Luxury"].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-5 group"
                  >
                    <div className="w-6 h-px bg-secondary group-hover:w-10 transition-all duration-500" />
                    <span className="text-xs tracking-[0.15em] uppercase font-light group-hover:text-secondary transition-colors">{item}</span>
                  </motion.div>
                ))}
              </div>
              <Link to="/about" className="btn-outline-gold">
                Learn More
              </Link>
            </motion.div>

            {/* Overlapping image composition */}
            <div className="md:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 ml-auto w-full md:w-[85%]"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={products[0]?.images[1] || products[0]?.image}
                    alt="Putul Fashions quality"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-12 -left-4 md:left-0 w-48 md:w-60 z-20"
              >
                <div className="aspect-square overflow-hidden border-4 border-background">
                  <img
                    src={products[2]?.image}
                    alt="Quality detail"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
              <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-32 h-32 md:w-40 md:h-40 border border-secondary/20 z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA — cinematic */}
      <section className="py-32 md:py-48 bg-foreground text-background grain-overlay relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--secondary) / 0.3), transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--secondary) / 0.2), transparent 50%)`,
            backgroundSize: "200% 200%",
          }}
        />
        <div className="container mx-auto px-8 md:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="w-12 h-px bg-secondary mx-auto mb-10" />
            <h2 className="font-heading text-5xl md:text-8xl lg:text-[10rem] font-light mb-8 tracking-tight leading-[0.9]">
              Step Into
              <br />
              <span className="italic text-secondary/80">Style</span>
            </h2>
            <p className="text-background/30 mb-16 max-w-md mx-auto leading-[2] text-sm font-light">
              Join thousands of men who trust Putul Fashions for premium comfort
              footwear at unbeatable prices.
            </p>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-4 border border-background/20 px-14 py-5 tracking-[0.3em] uppercase text-[10px] font-medium text-background hover:bg-background hover:text-foreground transition-all duration-700"
            >
              Shop Now
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
