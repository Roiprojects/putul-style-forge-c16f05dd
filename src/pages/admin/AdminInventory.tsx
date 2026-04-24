import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Save, AlertTriangle } from "lucide-react";
import { resolveCatalogImage } from "@/lib/catalogImage";

const AdminInventory = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("admin_products")
      .select("id, name, stock, low_stock_threshold, images, sku")
      .order("stock", { ascending: true });
    if (error) toast.error(error.message);
    else setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleStockChange = (id: string, value: number) => {
    setEdits({ ...edits, [id]: value });
  };

  const saveAll = async () => {
    const entries = Object.entries(edits);
    if (entries.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    let errorCount = 0;
    await Promise.all(
      entries.map(async ([id, stock]) => {
        const { error } = await supabase
          .from("admin_products")
          .update({ stock })
          .eq("id", id);
        if (error) errorCount++;
      })
    );
    if (errorCount > 0) toast.error(`${errorCount} updates failed`);
    else toast.success(`${entries.length} products updated`);
    setEdits({});
    setSaving(false);
    fetchProducts();
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchesSearch && p.stock > 0 && p.stock < (p.low_stock_threshold ?? 10);
    if (filter === "out") return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and update stock levels
          </p>
        </div>
        {hasEdits && (
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            Save {Object.keys(edits).length} Changes
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {([
            ["all", "All"],
            ["low", "Low Stock"],
            ["out", "Out of Stock"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 text-[11px] font-medium rounded-lg transition-colors ${
                filter === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Stock</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">New Stock</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No products found</td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const currentStock = edits[product.id] ?? product.stock;
                  const isLow = currentStock > 0 && currentStock < (product.low_stock_threshold ?? 10);
                  const isOut = currentStock === 0;
                  const isEdited = edits[product.id] !== undefined;

                  return (
                    <tr key={product.id} className={`transition-colors ${isEdited ? "bg-amber-50/30" : "hover:bg-accent/30"}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img src={resolveCatalogImage(product.images[0], 80)} alt="" className="w-8 h-8 rounded object-cover bg-accent" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-accent" />
                          )}
                          <span className="text-sm font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{product.sku || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{product.stock}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(product.id, Number(e.target.value))}
                          className={`w-20 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring ${
                            isEdited ? "border-amber-400 bg-amber-50/50" : "border-border bg-background"
                          }`}
                        />
                      </td>
                      <td className="px-5 py-3">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                            <AlertTriangle size={10} /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            <AlertTriangle size={10} /> Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
