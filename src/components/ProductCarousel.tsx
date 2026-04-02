import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductCarousel = ({ title, subtitle, products, viewAllLink }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  // Auto-scroll continuously with seamless loop
  useEffect(() => {
    if (isPaused || !scrollRef.current) return;
    const el = scrollRef.current;
    let animId: number;
    const speed = 0.5;

    const step = () => {
      if (!el) return;
      // Half the scroll width is the original set; when we pass it, reset seamlessly
      const halfScroll = (el.scrollWidth - el.clientWidth) / 2;
      if (halfScroll > 0 && el.scrollLeft >= halfScroll) {
        el.scrollLeft -= halfScroll;
      }
      el.scrollLeft += speed;
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, products.length]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-semibold tracking-wide uppercase text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <a href={viewAllLink} className="text-xs tracking-wide text-secondary font-medium hover:underline mr-3 hidden md:block">
                View All
              </a>
            )}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft ? "border-foreground/20 hover:bg-foreground hover:text-background" : "border-border text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight ? "border-foreground/20 hover:bg-foreground hover:text-background" : "border-border text-muted-foreground/30 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-2"
        >
          {products.map((product, i) => (
            <div key={product.id} className="flex-shrink-0 w-[55vw] sm:w-[40vw] md:w-[28vw] lg:w-[22vw] xl:w-[18vw]">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
