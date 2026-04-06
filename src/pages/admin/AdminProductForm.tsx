import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X, Plus } from "lucide-react";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  sku: string;
  category_id: string;
  stock: string;
  low_stock_threshold: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  fabric: string;
  is_active: boolean;
}

interface VariantRow {
  color: string;
  colorCode: string;
  size: string;
  stock: number;
  images: string[];
  id?: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  sku: "",
  category_id: "",
  stock: "0",
  low_stock_threshold: "10",
  images: [],
  sizes: [],
  colors: [],
  tags: [],
  fabric: "",
  is_active: true,
};

const availableSizes = ["5", "6", "7", "8", "9", "10", "11", "S", "M", "L", "XL", "XXL"];
const availableTags = ["Trending", "Bestseller", "New Arrival", "Sale", "Combo"];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant matrix state
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [colorCodes, setColorCodes] = useState<Record<string, string>>({});
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [uploadingVariantImages, setUploadingVariantImages] = useState<string | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);
  const [activeColorUpload, setActiveColorUpload] = useState<string>("");

  useEffect(() => {
    supabase
      .from("admin_categories")
      .select("id, name")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));

    if (isEdit) {
      supabase
        .from("admin_products")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error("Product not found");
            navigate("/admin/products");
            return;
          }
          setForm({
            name: data.name,
            description: data.description || "",
            price: String(data.price),
            original_price: data.original_price ? String(data.original_price) : "",
            sku: data.sku || "",
            category_id: data.category_id || "",
            stock: String(data.stock),
            low_stock_threshold: String(data.low_stock_threshold ?? 10),
            images: data.images || [],
            sizes: data.sizes || [],
            colors: data.colors || [],
            tags: data.tags || [],
            fabric: data.fabric || "",
            is_active: data.is_active ?? true,
          });

          // Load existing variants
          supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", id)
            .then(({ data: varData }) => {
              if (varData && varData.length > 0) {
                const rows: VariantRow[] = varData.map(v => ({
                  id: v.id,
                  color: v.color,
                  colorCode: v.color_code || "",
                  size: v.size,
                  stock: v.stock,
                  images: v.images || [],
                }));
                setVariantRows(rows);

                // Extract color codes and images
                const codes: Record<string, string> = {};
                const imgs: Record<string, string[]> = {};
                varData.forEach(v => {
                  if (v.color_code) codes[v.color] = v.color_code;
                  if (v.images?.length) imgs[v.color] = v.images;
                });
                setColorCodes(codes);
                setColorImages(imgs);
              }
            });
        });
    }
  }, [id, isEdit, navigate]);

  // Auto-generate variant matrix when colors or sizes change
  useEffect(() => {
    if (form.colors.length === 0 || form.sizes.length === 0) {
      return;
    }
    setVariantRows(prev => {
      const newRows: VariantRow[] = [];
      for (const color of form.colors) {
        for (const size of form.sizes) {
          const existing = prev.find(r => r.color === color && r.size === size);
          if (existing) {
            newRows.push(existing);
          } else {
            newRows.push({
              color,
              colorCode: colorCodes[color] || "",
              size,
              stock: 0,
              images: colorImages[color] || [],
            });
          }
        }
      }
      return newRows;
    });
  }, [form.colors, form.sizes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    if (form.original_price && Number(form.original_price) < Number(form.price)) {
      toast.error("MRP cannot be less than selling price");
      return;
    }
    setSaving(true);

    // Calculate total stock from variants if they exist
    const totalStock = variantRows.length > 0
      ? variantRows.reduce((sum, r) => sum + r.stock, 0)
      : Number(form.stock);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      sku: form.sku || null,
      category_id: form.category_id || null,
      stock: totalStock,
      low_stock_threshold: Number(form.low_stock_threshold),
      images: form.images,
      sizes: form.sizes,
      colors: form.colors,
      tags: form.tags,
      fabric: form.fabric || null,
      is_active: form.is_active,
    };

    let productId = id;

    if (isEdit) {
      const { error } = await supabase.from("admin_products").update(payload).eq("id", id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("admin_products").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Save variants if we have any
    if (variantRows.length > 0 && productId) {
      // Delete old variants and insert fresh
      await supabase.from("product_variants").delete().eq("product_id", productId);

      const variantPayloads = variantRows.map(r => ({
        product_id: productId!,
        color: r.color,
        color_code: colorCodes[r.color] || null,
        size: r.size,
        stock: r.stock,
        images: colorImages[r.color] || [],
        price_adjustment: 0,
      }));

      const { error: varError } = await supabase.from("product_variants").insert(variantPayloads);
      if (varError) {
        toast.error("Product saved but variants failed: " + varError.message);
        setSaving(false);
        return;
      }
    }

    toast.success(isEdit ? "Product updated" : "Product created");
    navigate("/admin/products");
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const filePath = `product-images/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("media").upload(filePath, file);
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      newUrls.push(urlData.publicUrl);
    }
    if (newUrls.length) {
      setForm(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
      toast.success(`${newUrls.length} image(s) uploaded`);
    }
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !activeColorUpload) return;
    setUploadingVariantImages(activeColorUpload);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const filePath = `product-images/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("media").upload(filePath, file);
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      newUrls.push(urlData.publicUrl);
    }
    if (newUrls.length) {
      setColorImages(prev => ({
        ...prev,
        [activeColorUpload]: [...(prev[activeColorUpload] || []), ...newUrls],
      }));
      toast.success(`${newUrls.length} image(s) uploaded for ${activeColorUpload}`);
    }
    setUploadingVariantImages(null);
    if (variantFileInputRef.current) variantFileInputRef.current.value = "";
  };

  const removeAllImages = () => {
    setForm({ ...form, images: [] });
  };

  const addColor = () => {
    if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
      setForm({ ...form, colors: [...form.colors, colorInput.trim()] });
      setColorInput("");
    }
  };

  const toggleSize = (s: string) => {
    setForm({
      ...form,
      sizes: form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s],
    });
  };

  const toggleTag = (t: string) => {
    setForm({
      ...form,
      tags: form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t],
    });
  };

  const updateVariantStock = (color: string, size: string, stock: number) => {
    setVariantRows(prev =>
      prev.map(r => r.color === color && r.size === size ? { ...r, stock: Math.max(0, stock) } : r)
    );
  };

  // Group variants by color for matrix display
  const variantMatrix = form.colors.map(color => ({
    color,
    colorCode: colorCodes[color] || "",
    images: colorImages[color] || [],
    sizes: form.sizes.map(size => {
      const row = variantRows.find(r => r.color === color && r.size === size);
      return { size, stock: row?.stock ?? 0 };
    }),
  }));

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={14} /> Back to Products
      </button>

      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Material / Fabric</label>
            <input
              type="text"
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">MRP (₹)</label>
              <input
                type="number"
                min="0"
                value={form.original_price}
                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Default Images */}
        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Default Images</h2>
            {form.images.length > 1 && (
              <button type="button" onClick={removeAllImages} className="text-xs text-destructive hover:underline">
                Remove All
              </button>
            )}
          </div>
          <div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImages}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-dashed border-border rounded-lg hover:border-foreground/30 hover:bg-accent/50 transition-colors w-full justify-center text-muted-foreground"
            >
              {uploadingImages ? (
                <><Loader2 size={16} className="animate-spin" /> Uploading...</>
              ) : (
                <><Upload size={16} /> Click to upload images</>
              )}
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover bg-accent border border-border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sizes & Colors */}
        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Sizes & Colors</h2>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    form.sizes.includes(s)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Colors</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add color (e.g. Brown)"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
              />
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-accent rounded-lg">
                  {colorCodes[c] && (
                    <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: colorCodes[c] }} />
                  )}
                  {c}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-destructive"
                    onClick={() => setForm({ ...form, colors: form.colors.filter((x) => x !== c) })}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Variant Matrix */}
        {form.colors.length > 0 && form.sizes.length > 0 && (
          <div className="bg-background rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Variant Matrix (Stock per Color × Size)</h2>
            <p className="text-xs text-muted-foreground">Set stock for each color-size combination. Upload images per color for the product page.</p>

            <input
              ref={variantFileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleVariantImageUpload}
            />

            <div className="space-y-6">
              {variantMatrix.map((row) => (
                <div key={row.color} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{row.color}</span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-muted-foreground">Hex:</label>
                      <input
                        type="color"
                        value={colorCodes[row.color] || "#888888"}
                        onChange={(e) => setColorCodes(prev => ({ ...prev, [row.color]: e.target.value }))}
                        className="w-7 h-7 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorCodes[row.color] || ""}
                        onChange={(e) => setColorCodes(prev => ({ ...prev, [row.color]: e.target.value }))}
                        placeholder="#000000"
                        className="w-20 border border-border rounded px-2 py-1 text-xs bg-background"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveColorUpload(row.color);
                        setTimeout(() => variantFileInputRef.current?.click(), 50);
                      }}
                      disabled={uploadingVariantImages === row.color}
                      className="ml-auto flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-accent transition-colors"
                    >
                      {uploadingVariantImages === row.color ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      Images
                    </button>
                  </div>

                  {/* Color images preview */}
                  {(colorImages[row.color] || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {colorImages[row.color].map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt="" className="w-14 h-14 rounded object-cover bg-accent border border-border" />
                          <button
                            type="button"
                            onClick={() => setColorImages(prev => ({
                              ...prev,
                              [row.color]: prev[row.color].filter((_, j) => j !== i),
                            }))}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock grid for sizes */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {row.sizes.map((s) => (
                      <div key={s.size} className="text-center">
                        <label className="text-[10px] text-muted-foreground block mb-1">{s.size}</label>
                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => updateVariantStock(row.color, s.size, parseInt(e.target.value) || 0)}
                          className="w-full border border-border rounded px-2 py-1.5 text-xs text-center bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              Total stock: <span className="font-semibold text-foreground">{variantRows.reduce((s, r) => s + r.stock, 0)}</span>
            </div>
          </div>
        )}

        {/* Stock (shown only when no variants) */}
        {(form.colors.length === 0 || form.sizes.length === 0) && (
          <div className="bg-background rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Stock</h2>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Tags & Status */}
        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Tags & Status</h2>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                  form.tags.includes(t)
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="accent-foreground"
            />
            <span className="text-sm text-foreground">Product is active and visible on store</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
