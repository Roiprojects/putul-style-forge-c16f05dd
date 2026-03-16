import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, RefreshCcw, Headphones } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import HeroSlider from "@/components/HeroSlider";
import CategoryShowcase from "@/components/CategoryShowcase";
import TestimonialSection from "@/components/TestimonialSection";
import PromoBar from "@/components/PromoBar";
import { products } from "@/data/products";

const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);
const trending = products.filter((p) => p.trending).slice(0, 4);

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders across India" },
  { icon: Shield, title: "Premium Quality", desc: "Finest materials & craft" },
  { icon: RefreshCcw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const HomePage = () => (
  <div>
    <PromoBar />
    <HeroSlider />

    {/* Features strip */}
    <section className="border-b border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="py-10 md:py-14 px-6 text-center border-r border-border last:border-r-0"
            >
              <f.icon size={22} className="mx-auto mb-4 text-secondary" strokeWidth={1.5} />
              <h3 className="text-[10px] tracking-[0.25em] uppercase font-semibold mb-1">{f.title}</h3>
              <p className="text-[11px] text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Editorial statement */}
    <section className="py-32 md:py-44">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-8 font-body">
            The Edit
          </p>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-8">
            Where Comfort Meets
            <span className="italic font-normal text-secondary"> Contemporary</span>
            <br />Design
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Curated collections of premium men's footwear, designed for those who believe
            style should never compromise comfort.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Categories */}
    <CategoryShowcase />

    {/* Best Sellers — editorial grid */}
    <section className="py-32 md:py-44 bg-accent">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div>
            <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-4 font-body">
              Most Loved
            </p>
            <h2 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-foreground hover:text-secondary transition-colors group mt-6 md:mt-0"
          >
            View All
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} variant="large" />
          ))}
        </div>
        <Link
          to="/shop"
          className="md:hidden flex items-center justify-center gap-2 mt-12 text-[11px] tracking-[0.2em] uppercase text-foreground hover:text-secondary transition-colors"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
    </section>

    {/* Cinematic split banner */}
    <section className="grid md:grid-cols-2 min-h-[80vh]">
      <div className="relative overflow-hidden group">
        <motion.img
          src={products[0]?.image}
          alt="New arrivals"
          className="w-full h-full object-cover min-h-[50vh]"
          loading="lazy"
          whileInView={{ scale: 1.05 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        />
        <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors duration-700" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-6">New Season</p>
            <h2 className="font-heading text-4xl md:text-6xl font-semibold text-background mb-8 tracking-tight">
              New<br />Arrivals
            </h2>
            <Link to="/shop" className="inline-flex items-center gap-3 bg-background text-foreground px-10 py-4 tracking-[0.2em] uppercase text-[11px] font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all duration-500">
              Shop New In <ArrowRight size={13} />
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
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        />
        <div className="absolute inset-0 bg-foreground/50 group-hover:bg-foreground/40 transition-colors duration-700" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-6">Up to 71% Off</p>
            <h2 className="font-heading text-4xl md:text-6xl font-semibold text-background mb-8 tracking-tight">
              Amazing<br />Deals
            </h2>
            <Link to="/shop" className="inline-flex items-center gap-3 border border-background/50 text-background px-10 py-4 tracking-[0.2em] uppercase text-[11px] font-semibold hover:bg-background hover:text-foreground transition-all duration-500">
              Shop Sale <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Trending — large editorial */}
    <section className="py-32 md:py-44">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-4 font-body">
            What's Hot Right Now
          </p>
          <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
            Trending
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {trending.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} variant="large" />
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <TestimonialSection />

    {/* Why Choose Us — editorial with larger image */}
    <section className="py-32 md:py-44 bg-foreground text-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-10 h-[2px] bg-secondary mb-8" />
            <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-4">Our Promise</p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-8 leading-[1.05] tracking-tight">
              Why Choose
              <br />
              <span className="italic font-normal">Putul</span> Fashions
            </h2>
            <p className="text-background/50 mb-10 leading-relaxed text-base">
              We believe premium quality shouldn't come with a premium price tag.
              Every product is crafted with meticulous attention to detail, using
              carefully selected materials for unmatched comfort and durability.
            </p>
            <div className="space-y-5 mb-12">
              {["Premium Materials", "Handpicked Designs", "Comfort Guaranteed", "Affordable Luxury"].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-6 h-[1px] bg-secondary" />
                  <span className="text-sm tracking-[0.1em]">{item}</span>
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
            <div className="absolute -bottom-8 -left-8 bg-secondary text-secondary-foreground p-8 md:p-10">
              <p className="font-heading text-4xl md:text-5xl font-bold tracking-tight">50%</p>
              <p className="text-[10px] tracking-[0.25em] uppercase mt-2">Min Savings</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* CTA — cinematic */}
    <section className="py-36 md:py-48">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-secondary tracking-[0.4em] uppercase text-[10px] mb-6">Don't Miss Out</p>
          <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-semibold mb-6 tracking-tight">
            Step Into
            <span className="italic font-normal"> Style</span>
          </h2>
          <p className="text-muted-foreground mb-14 max-w-lg mx-auto leading-relaxed">
            Join thousands of men who trust Putul Fashions for premium comfort
            footwear at unbeatable prices.
          </p>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 bg-foreground text-background px-14 py-5 tracking-[0.25em] uppercase text-[11px] font-semibold hover:bg-secondary transition-all duration-500"
          >
            Shop Now
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

export default HomePage;
