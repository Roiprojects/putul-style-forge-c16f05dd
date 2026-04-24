import { Link } from "react-router-dom";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const CompareBar = () => {
  const { items, remove, clear } = useCompare();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border shadow-2xl rounded-2xl px-3 py-2 flex items-center gap-2 max-w-[95vw]"
        >
          <div className="flex items-center gap-1.5 pr-2 border-r border-border">
            <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium hidden sm:inline">Compare</span>
          </div>

          <div className="flex items-center gap-1.5">
            {items.map((p) => (
              <div key={p.id} className="relative group">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="h-10 w-10 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => remove(p.id)}
                  className="absolute -top-1.5 -right-1.5 bg-foreground text-background rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className="h-10 w-10 rounded-lg border border-dashed border-border bg-muted/30"
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-border">
            <Link to="/compare">
              <Button size="sm" className="h-8 text-xs px-3" disabled={items.length < 2}>
                Compare ({items.length})
              </Button>
            </Link>
            <button
              onClick={clear}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
