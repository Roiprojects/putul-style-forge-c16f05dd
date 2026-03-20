import { Star } from "lucide-react";
import { testimonials } from "@/data/products";

const TestimonialSection = () => {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-6 md:py-8 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 mb-3">
        <h2 className="text-sm md:text-base font-heading font-semibold tracking-wide uppercase text-foreground">
          Customer Reviews
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">Real reviews from real people</p>
      </div>

      <div className="relative">
        <div className="flex gap-2.5 animate-marquee-testimonial hover:[animation-play-state:paused]">
          {doubled.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="flex-shrink-0 w-[200px] bg-background border border-border rounded-md overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden bg-accent">
                <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-2">
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={8} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[8px] font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[9px] font-medium text-foreground">{t.name}</p>
                    <p className="text-[8px] text-muted-foreground">{t.date}</p>
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
