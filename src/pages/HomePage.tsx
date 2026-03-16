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
const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);

const features = [
  { icon: Truck, title: "Free Shipping", desc: "Free shipping on all orders across India" },
  { icon: Shield, title: "Premium Quality", desc: "Only the finest materials and craftsmanship" },
  { icon: RefreshCcw, title: "Easy Returns", desc: "Hassle-free returns within 7 days" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer support always available" },
];

const HomePage = () => (
  <div>
    {/* Promo bar */}
    <PromoBar />

    {/* Hero Slider */}
    <HeroSlider />

    {/* Features strip */}
    <section className="border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="py-8 px-6 text-center"
            >
              <f.icon size={24} className="mx-auto mb-3 text-secondary" strokeWidth={1.5} />
              <h3 className="text-xs tracking-[0.2em] uppercase font-semibold mb-1">{f.title}</h3>
              <p className="text-[11px] text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Categories */}
    <CategoryShowcase />

    {/* Best Sellers */}
    <section className="py-24 md:py-32 bg-accent">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3 font-body">
              Most Popular
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold">Best Sellers</h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-foreground hover:text-secondary transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <Link
          to="/shop"
          className="md:hidden flex items-center justify-center gap-2 mt-10 text-sm tracking-widest uppercase text-foreground hover:text-secondary transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>
    </section>

    {/* Split banner */}
    <section className="grid md:grid-cols-2 min-h-[60vh]">
      <div className="relative overflow-hidden">
        <img
          src={products[0]?.image}
          alt="New arrivals"
          className="w-full h-full object-cover min-h-[400px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">New Season</p>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-background mb-6">
              New Arrivals
            </h2>
            <Link to="/shop" className="btn-primary">
              Shop New In
            </Link>
          </motion.div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <img
          src={products[3]?.image}
          alt="Sale"
          className="w-full h-full object-cover min-h-[400px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">Up to 71% Off</p>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-background mb-6">
              Amazing Deals
            </h2>
            <Link to="/shop" className="btn-outline-gold border-background/40 text-background hover:bg-background/10 hover:text-background">
              Shop Sale
            </Link>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Trending */}
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3 font-body">
            What's Hot
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} variant="large" />
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <TestimonialSection />

    {/* Why Choose Us */}
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">The Putul Promise</p>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold mb-6">
              Why Choose<br />Putul Fashions
            </h2>
            <p className="text-background/60 mb-8 leading-relaxed">
              At Putul Fashions, we believe that premium quality shouldn't come with a premium price tag.
              Every product is crafted with attention to detail, using carefully selected materials for
              unmatched comfort and durability.
            </p>
            <div className="space-y-4">
              {["Premium Materials", "Handpicked Designs", "Comfort Guaranteed", "Affordable Luxury"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-secondary" />
                  <span className="text-sm tracking-wide">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-outline-gold mt-10 inline-block">
              Learn More
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={products[0]?.images[1] || products[0]?.image}
                alt="Putul Fashions quality"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 md:p-8">
              <p className="font-heading text-3xl md:text-4xl font-bold">50%</p>
              <p className="text-xs tracking-wider uppercase mt-1">Min Savings</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 md:py-32 bg-accent">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-3">Don't Miss Out</p>
          <h2 className="font-heading text-4xl md:text-6xl font-semibold mb-4">
            Step Into Style
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join thousands of men who trust Putul Fashions for premium comfort footwear at unbeatable prices.
          </p>
          <Link to="/shop" className="btn-primary inline-block text-base px-12 py-4">
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

export default HomePage;
