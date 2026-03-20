import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, Copy, Search, Image as ImageIcon } from "lucide-react";

type MediaItem = {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  folder: string | null;
  created_at: string;
};

const AdminMedia = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMedia(data as MediaItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file);
      if (uploadError) { toast.error(`Failed: ${file.name}`); continue; }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);

      await supabase.from("media_library").insert({
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        folder: "uploads",
      });
    }
    toast.success("Upload complete");
    setUploading(false);
    fetchMedia();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (item: MediaItem) => {
    const path = item.file_url.split("/media/")[1];
    if (path) await supabase.storage.from("media").remove([path]);
    await supabase.from("media_library").delete().eq("id", item.id);
    toast.success("Deleted");
    fetchMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const filtered = media.filter(m => m.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground">{media.length} files</p>
        </div>
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={16} className="mr-2" />{uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
          No media files. Upload some images or videos.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {item.file_type?.startsWith("image") ? (
                  <img src={item.file_url} alt={item.file_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => copyUrl(item.file_url)}><Copy size={14} /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(item)}><Trash2 size={14} /></Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate">{item.file_name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
