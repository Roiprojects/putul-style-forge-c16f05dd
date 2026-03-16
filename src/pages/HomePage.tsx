import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gem, Palette, Shirt, Shield } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import heroMain from "@/assets/hero-main.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const bestSellers = products.filter(p => p.bestSeller).slice(0, 8);
const trending = products.filter(p => p.trending);

const features = [
  { icon: Gem, title: "Premium Fabric", desc: "Only the finest materials sourced from trusted suppliers worldwide." },
  { icon: Palette, title: "Modern Designs", desc: "Contemporary styles that keep you ahead of every fashion curve." },
  { icon: Shirt, title: "Comfortable Fit", desc: "Engineered for all-day comfort without compromising on style." },
  { icon: Shield, title: "Trusted Quality", desc: "Rigorous quality checks ensure every piece meets our standards." },
];

const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

const HomePage = () => (
  <div className="pt-16 md:pt-20">
    {/* Hero */}
    <section className="relative h-[90vh] md:h-screen overflow-hidden">
      <img src={heroMain} alt="Modern men's fashion" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      <div className="relative h-full container mx-auto px-4 md:px-8 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <p className="text-secondary tracking-[0.3em] uppercase text-xs md:text-sm mb-4 font-body">
            New Collection 2026
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-background leading-[1.1] mb-6">
            Modern Men's Fashion for Everyday Style
          </h1>
          <p className="text-background/80 text-base md:text-lg mb-8 font-body max-w-md">
            Discover premium quality clothing designed for comfort and confidence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/shop" className="btn-primary">
              Shop Collection
            </Link>
            <Link to="/shop" className="btn-outline-gold border-background/40 text-background hover:bg-background/10 hover:text-background">
              View Best Sellers
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="section-subheading mb-2">Browse By</p>
          <h2 className="section-heading gold-underline pb-4">Shop Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to="/shop" className="group block relative overflow-hidden aspect-[3/4]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-background text-sm md:text-base font-medium tracking-wide">{cat.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Best Sellers */}
    <section className="py-20 md:py-28 bg-accent">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-subheading mb-2">Most Popular</p>
            <h2 className="section-heading">Best Sellers</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm tracking-widest uppercase text-foreground hover:text-secondary transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <Link to="/shop" className="md:hidden flex items-center justify-center gap-2 mt-8 text-sm tracking-widest uppercase text-foreground hover:text-secondary transition-colors">
          View All <ArrowRight size={16} />
        </Link>
      </div>
    </section>

    {/* Trending */}
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="section-subheading mb-2">What's Hot</p>
          <h2 className="section-heading gold-underline pb-4">Trending Collection</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-2">The Putul Promise</p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">Why Choose Putul Fashions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 border border-secondary/30 flex items-center justify-center">
                <f.icon size={28} className="text-secondary" />
              </div>
              <h3 className="font-heading text-lg mb-2">{f.title}</h3>
              <p className="text-primary-foreground/60 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Instagram Gallery */}
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="section-subheading mb-2">@putulfashions</p>
          <h2 className="section-heading gold-underline pb-4">Style Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="aspect-square overflow-hidden group cursor-pointer"
            >
              <img
                src={img}
                alt={`Style gallery ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="py-20 bg-accent">
      <div className="container mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-semibold mb-4">Step Into Style</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of men who trust Putul Fashions for their everyday fashion needs.
          </p>
          <Link to="/shop" className="btn-primary inline-block">
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

export default HomePage;
