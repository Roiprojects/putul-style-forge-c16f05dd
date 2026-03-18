const promos = [
  "Save Min 50% on All Orders",
  "Free Shipping Across India",
  "Use GET10 for 10% off above ₹799",
  "Use GET15 for 15% off above ₹1299",
];

const PromoBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-foreground text-background/70 overflow-hidden h-7 flex items-center">
      <div className="flex whitespace-nowrap gap-16 animate-marquee">
        {[...promos, ...promos, ...promos, ...promos].map((p, i) => (
          <span key={i} className="text-[9px] tracking-[0.3em] uppercase font-light">
            {p}
            <span className="mx-10 text-secondary/40">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoBar;
