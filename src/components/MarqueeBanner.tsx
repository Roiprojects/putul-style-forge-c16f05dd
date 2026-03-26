import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MarqueeBanner = () => {
  const [text, setText] = useState("Premium Footwear For The Modern Man");

  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("title")
      .eq("section_type", "marquee")
      .eq("is_enabled", true)
      .order("sort_order")
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.title) setText(data[0].title);
      });
  }, []);

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
