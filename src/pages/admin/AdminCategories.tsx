import { useEffect, useState, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryForm {
  name: string;
  slug: string;
  image_url: string;
  parent_id: string;
}

const empty: CategoryForm = { name: "", slug: "", image_url: "", parent_id: "" };

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const catFileRef = useRef<HTMLInputElement>(null);

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatImage(true);
    const filePath = `categories/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("media").upload(filePath, file);
    if (error) { toast.error("Upload failed"); setUploadingCatImage(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    toast.success("Image uploaded");
    setUploadingCatImage(false);
    if (catFileRef.current) catFileRef.current.value = "";
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("admin_categories")
      .select("*")
      .order("sort_order");
    if (error) toast.error(error.message);
    else setCategories(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: editId ? form.slug : generateSlug(name) });
  };

  const openEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url || "",
      parent_id: cat.parent_id || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      image_url: form.image_url || null,
      parent_id: form.parent_id || null,
    };

    if (editId) {
      const { error } = await supabase.from("admin_categories").update(payload).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Category updated");
    } else {
      const { error } = await supabase.from("admin_categories").insert({
        ...payload,
        sort_order: categories.length,
      });
      if (error) toast.error(error.message);
      else toast.success("Category created");
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm(empty);
    fetchCategories();
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("admin_categories").delete().eq("id", deleteTarget.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Category deleted");
      fetchCategories();
    }
    setDeleteTarget(null);
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    await Promise.all(
      updated.map((cat, i) =>
        supabase.from("admin_categories").update({ sort_order: i }).eq("id", cat.id)
      )
    );
    fetchCategories();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product categories
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-background w-full max-w-md rounded-xl border border-border p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">{editId ? "Edit" : "Add"} Category</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Slug *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Category Image</label>
                  <input
                    ref={catFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCatImageUpload}
                  />
                  {form.image_url ? (
                    <div className="flex items-center gap-3">
                      <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => catFileRef.current?.click()} disabled={uploadingCatImage} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                        <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-destructive hover:underline">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => catFileRef.current?.click()}
                      disabled={uploadingCatImage}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-dashed border-border rounded-lg hover:border-foreground/30 hover:bg-accent/50 transition-colors w-full justify-center text-muted-foreground"
                    >
                      {uploadingCatImage ? (
                        <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload size={14} /> Upload Image</>
                      )}
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Parent Category</label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter((c) => c.id !== editId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {editId ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category List */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No categories yet. Add your first one!
            </p>
          ) : (
            categories.map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCategory(index, -1)}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categories.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                  >
                    ▼
                  </button>
                </div>
                {cat.image_url ? (
                  <img src={cat.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-accent" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground text-xs">
                    {cat.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{cat.slug}</p>
                </div>
                {cat.parent_id && (
                  <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-muted-foreground">
                    Sub
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
