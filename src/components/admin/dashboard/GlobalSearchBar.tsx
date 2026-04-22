import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Hit {
  type: "order" | "product";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const GlobalSearchBar = () => {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const isUuidish = /^[0-9a-f-]{8,}$/i.test(term);
      const orderQuery = isUuidish
        ? supabase.from("orders").select("id, customer_name, total, status").ilike("id", `${term}%`).limit(5)
        : supabase.from("orders").select("id, customer_name, total, status").or(`customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,customer_phone.ilike.%${term}%`).limit(5);
      const productQuery = supabase.from("admin_products").select("id, name, price").ilike("name", `%${term}%`).limit(5);
      const [orders, products] = await Promise.all([orderQuery, productQuery]);
      const list: Hit[] = [];
      (orders.data || []).forEach((o: any) => list.push({
        type: "order", id: o.id, title: `Order #${o.id.slice(0, 8).toUpperCase()}`,
        subtitle: `${o.customer_name} — ₹${Number(o.total).toLocaleString("en-IN")} (${o.status})`,
        href: "/admin/orders",
      }));
      (products.data || []).forEach((p: any) => list.push({
        type: "product", id: p.id, title: p.name,
        subtitle: `Product — ₹${Number(p.price).toLocaleString("en-IN")}`,
        href: `/admin/products/${p.id}`,
      }));
      setHits(list);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search orders, customers, products…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
      </div>
      {open && q.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {hits.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No results for "{q}"</p>
          ) : hits.map((h) => (
            <button
              key={`${h.type}-${h.id}`}
              onClick={() => { navigate(h.href); setOpen(false); setQ(""); }}
              className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              <p className="text-sm font-medium text-foreground">{h.title}</p>
              <p className="text-[11px] text-muted-foreground">{h.subtitle}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
