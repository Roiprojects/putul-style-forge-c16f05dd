import { Star } from "lucide-react";
import { testimonials } from "@/data/products";

const TestimonialSection = () => {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-8 md:py-10 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 mb-5">
        <h2 className="text-lg md:text-xl font-heading font-semibold tracking-wide uppercase text-foreground">
          Customer Reviews
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Real reviews from real people</p>
      </div>

      <div className="relative">
        <div className="flex gap-3 animate-marquee-testimonial hover:[animation-play-state:paused]">
          {doubled.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex-shrink-0 w-[260px] bg-background border border-border rounded-md overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden bg-accent">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={10} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-foreground">{t.name}</p>
                    <p className="text-[9px] text-muted-foreground">{t.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
