import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, availableCurrencies } from "@/contexts/CurrencyContext";

const CurrencySelector = () => {
  const { currencyCode, setCurrencyCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground hover:text-secondary transition-colors rounded"
      >
        {currencyCode}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50">
          {availableCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrencyCode(c.code); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center justify-between ${
                currencyCode === c.code ? "bg-accent/50 font-medium" : ""
              }`}
            >
              <span>{c.symbol}</span>
              <span className="text-muted-foreground">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
