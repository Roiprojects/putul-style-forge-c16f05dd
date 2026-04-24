import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "putul_recently_viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    if (!productId) return;
    setIds((prev) => {
      const next = [productId, ...prev.filter((p) => p !== productId)].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { recentlyViewedIds: ids, addRecentlyViewed, clearRecentlyViewed };
}
