import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts, useCategories } from "@/hooks/useProducts";

interface SearchDropdownProps {
  query: string;
  onSelect: () => void;
}

const SearchDropdown = ({ query, onSelect }: SearchDropdownProps) => {
  const { data: products = [] } = useProducts();
  const { data: dbCategories = [] } = useCategories();

  const q = query.toLowerCase().trim();

  const matchedCategories = useMemo(() => {
    if (!q) return [];
    return dbCategories
      .filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
      .slice(0, 4);
  }, [q, dbCategories]);

  const matchedProducts = useMemo(() => {
    if (!q) return [];
    return products
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [q, products]);

  if (!q || (matchedCategories.length === 0 && matchedProducts.length === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
    >
      {matchedCategories.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Categories</p>
          {matchedCategories.map(c => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              onClick={onSelect}
              className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Tag size={13} className="text-secondary flex-shrink-0" />
              <span className="text-xs font-medium text-foreground">{c.name}</span>
            </Link>
          ))}
        </div>
      )}

      {matchedProducts.length > 0 && (
        <div className="px-3 pt-2 pb-3">
          {matchedCategories.length > 0 && <div className="border-t border-border mb-2" />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Products</p>
          {matchedProducts.map(p => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors"
            >
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-9 h-9 rounded object-cover flex-shrink-0 border border-border" />
              ) : (
                <div className="w-9 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Search size={14} className="text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                <p className="text-[11px] text-secondary font-semibold">₹{p.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SearchDropdown;
