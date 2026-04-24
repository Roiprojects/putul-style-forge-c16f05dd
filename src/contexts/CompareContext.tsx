import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "@/contexts/StoreContext";
import { toast } from "sonner";

interface CompareContextValue {
  items: Product[];
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
  isCompared: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const KEY = "compare-list";
const MAX = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= MAX) {
        toast.error(`You can compare up to ${MAX} products`);
        return prev;
      }
      toast.success("Added to compare");
      return [...prev, product];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);
  const isCompared = (id: string) => items.some((p) => p.id === id);

  return (
    <CompareContext.Provider value={{ items, toggle, remove, clear, isCompared }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
