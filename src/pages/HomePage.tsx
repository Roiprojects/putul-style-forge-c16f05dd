import HeroSlider from "@/components/HeroSlider";
import ProductCarousel from "@/components/ProductCarousel";
import CategoryShowcase from "@/components/CategoryShowcase";
import PromoBanners from "@/components/PromoBanners";
import MarqueeBanner from "@/components/MarqueeBanner";
import TestimonialSection from "@/components/TestimonialSection";
import { useProducts, useRealtimeStorefront } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const HomePage = () => {
  const { data: products = [] } = useProducts();
  useRealtimeStorefront();

  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 8);
  const trending = products.filter((p) => p.trending).slice(0, 8);

  return (
    <div>
      <HeroSlider />

      <ProductCarousel
        title="Best Sellers"
        subtitle="Top picks loved by our customers"
        products={bestSellers}
        viewAllLink="/shop"
      />

      <PromoBanners />

      {newArrivals.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-heading font-semibold tracking-wide uppercase text-foreground">
                  New Arrivals
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Fresh drops you'll love</p>
              </div>
              <Link to="/shop" className="text-xs tracking-wide text-secondary font-medium hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {newArrivals.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CategoryShowcase />
      <MarqueeBanner />

      {trending.length > 0 && (
        <ProductCarousel
          title="Trending Now"
          subtitle="What everyone's wearing"
          products={trending}
          viewAllLink="/shop"
        />
      )}

      <TestimonialSection />

      <section className="py-10 md:py-14 bg-accent/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-heading font-semibold tracking-wide uppercase text-foreground">
              Why Choose Putul
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: "🏆", title: "Premium Quality", desc: "Handpicked materials for lasting comfort" },
              { icon: "🚚", title: "Free Shipping", desc: "On every order, no minimum" },
              { icon: "💎", title: "Best Prices", desc: "Luxury quality at affordable prices" },
              { icon: "↩️", title: "Easy Returns", desc: "Hassle-free 7-day return policy" },
              { icon: "💵", title: "Cash on Delivery", desc: "Pay when you receive your order" },
              { icon: "🔒", title: "Secure Payments", desc: "100% safe & trusted transactions" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-5 md:p-6 bg-background rounded-lg border border-border"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
