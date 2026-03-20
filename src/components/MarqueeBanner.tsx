const MarqueeBanner = () => {
  const text = "Premium Footwear For The Modern Man";

  return (
    <div className="bg-foreground py-3 md:py-4 overflow-hidden">
      <div className="flex whitespace-nowrap gap-12 animate-marquee">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-background/60 text-xs md:text-sm tracking-[0.3em] uppercase font-light">
            {text}
            <span className="mx-8 text-secondary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
