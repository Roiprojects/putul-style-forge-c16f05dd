import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, GripVertical, Upload, X, Loader2 } from "lucide-react";

type HomepageSection = {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, any>;
  image_urls: string[];
  sort_order: number;
  is_enabled: boolean;
};

const SECTION_TYPES = [
  { value: "hero_banner", label: "Hero Banner" },
  { value: "product_carousel", label: "Product Carousel" },
  { value: "category_showcase", label: "Category Showcase" },
  { value: "promo_banner", label: "Promo Banner" },
  { value: "editorial", label: "Editorial Section" },
  { value: "marquee", label: "Marquee Banner" },
];

const AdminHomepage = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState<HomepageSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    section_type: "hero_banner",
    title: "",
    subtitle: "",
    image_urls: [] as string[],
    is_enabled: true,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const homepageFileRef = useRef<HTMLInputElement>(null);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order");
    if (!error && data) setSections(data as HomepageSection[]);
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const openNew = () => {
    setEditSection(null);
    setForm({ section_type: "hero_banner", title: "", subtitle: "", image_urls: [], is_enabled: true });
    setDialogOpen(true);
  };

  const openEdit = (s: HomepageSection) => {
    setEditSection(s);
    setForm({
      section_type: s.section_type,
      title: s.title || "",
      subtitle: s.subtitle || "",
      image_urls: (s.image_urls || []).join(", "),
      is_enabled: s.is_enabled,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      section_type: form.section_type,
      title: form.title || null,
      subtitle: form.subtitle || null,
      image_urls: form.image_urls.split(",").map(u => u.trim()).filter(Boolean),
      is_enabled: form.is_enabled,
      sort_order: editSection ? editSection.sort_order : sections.length,
    };

    if (editSection) {
      const { error } = await supabase.from("homepage_sections").update(payload).eq("id", editSection.id);
      if (error) return toast.error(error.message);
      toast.success("Section updated");
    } else {
      const { error } = await supabase.from("homepage_sections").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Section added");
    }
    setDialogOpen(false);
    fetchSections();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("homepage_sections").delete().eq("id", id);
    toast.success("Section deleted");
    fetchSections();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await supabase.from("homepage_sections").update({ is_enabled: enabled }).eq("id", id);
    fetchSections();
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    await Promise.all([
      supabase.from("homepage_sections").update({ sort_order: swapIndex }).eq("id", newSections[index].id),
      supabase.from("homepage_sections").update({ sort_order: index }).eq("id", newSections[swapIndex].id),
    ]);
    fetchSections();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Homepage Builder</h1>
          <p className="text-sm text-muted-foreground">Manage your homepage sections</p>
        </div>
        <Button onClick={openNew}><Plus size={16} className="mr-2" />Add Section</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : sections.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No sections yet. Add your first section.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <Card key={s.id} className="border">
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical size={16} className="text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-muted">
                      {s.section_type.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium truncate">{s.title || "Untitled"}</span>
                  </div>
                  {s.subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{s.subtitle}</p>}
                </div>
                <Switch checked={s.is_enabled} onCheckedChange={(v) => handleToggle(s.id, v)} />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveSection(i, "up")} disabled={i === 0}><ArrowUp size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveSection(i, "down")} disabled={i === sections.length - 1}><ArrowDown size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSection ? "Edit Section" : "Add Section"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={form.section_type} onValueChange={(v) => setForm({ ...form, section_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Subtitle</label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Image URLs (comma-separated)</label>
              <Textarea value={form.image_urls} onChange={(e) => setForm({ ...form, image_urls: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm({ ...form, is_enabled: v })} />
              <span className="text-sm">Enabled</span>
            </div>
            <Button className="w-full" onClick={handleSave}>{editSection ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomepage;
