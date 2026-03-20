import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type CmsPage = { id: string; slug: string; title: string; content: string; meta_description: string | null; is_published: boolean; updated_at: string };
type BlogPost = { id: string; title: string; slug: string; content: string; excerpt: string | null; cover_image: string | null; author_name: string; tags: string[]; is_published: boolean; published_at: string | null; updated_at: string };

const AdminCMS = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageDialog, setPageDialog] = useState(false);
  const [postDialog, setPostDialog] = useState(false);
  const [editPage, setEditPage] = useState<CmsPage | null>(null);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  const [pageForm, setPageForm] = useState({ title: "", slug: "", content: "", meta_description: "", is_published: false });
  const [postForm, setPostForm] = useState({ title: "", slug: "", content: "", excerpt: "", cover_image: "", author_name: "Admin", tags: "", is_published: false });

  const fetch = async () => {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("cms_pages").select("*").order("updated_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    ]);
    if (p) setPages(p as CmsPage[]);
    if (b) setPosts(b as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  // Pages
  const openNewPage = () => { setEditPage(null); setPageForm({ title: "", slug: "", content: "", meta_description: "", is_published: false }); setPageDialog(true); };
  const openEditPage = (p: CmsPage) => { setEditPage(p); setPageForm({ title: p.title, slug: p.slug, content: p.content || "", meta_description: p.meta_description || "", is_published: p.is_published }); setPageDialog(true); };

  const savePage = async () => {
    const payload = { ...pageForm, meta_description: pageForm.meta_description || null };
    if (editPage) {
      const { error } = await supabase.from("cms_pages").update(payload).eq("id", editPage.id);
      if (error) return toast.error(error.message);
      toast.success("Page updated");
    } else {
      const { error } = await supabase.from("cms_pages").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Page created");
    }
    setPageDialog(false); fetch();
  };

  const deletePage = async (id: string) => { await supabase.from("cms_pages").delete().eq("id", id); toast.success("Deleted"); fetch(); };

  // Blog
  const openNewPost = () => { setEditPost(null); setPostForm({ title: "", slug: "", content: "", excerpt: "", cover_image: "", author_name: "Admin", tags: "", is_published: false }); setPostDialog(true); };
  const openEditPost = (p: BlogPost) => { setEditPost(p); setPostForm({ title: p.title, slug: p.slug, content: p.content || "", excerpt: p.excerpt || "", cover_image: p.cover_image || "", author_name: p.author_name, tags: (p.tags || []).join(", "), is_published: p.is_published }); setPostDialog(true); };

  const savePost = async () => {
    const payload = {
      title: postForm.title, slug: postForm.slug, content: postForm.content,
      excerpt: postForm.excerpt || null, cover_image: postForm.cover_image || null,
      author_name: postForm.author_name, tags: postForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      is_published: postForm.is_published,
      published_at: postForm.is_published ? new Date().toISOString() : null,
    };
    if (editPost) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editPost.id);
      if (error) return toast.error(error.message);
      toast.success("Post updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Post created");
    }
    setPostDialog(false); fetch();
  };

  const deletePost = async (id: string) => { await supabase.from("blog_posts").delete().eq("id", id); toast.success("Deleted"); fetch(); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      <Tabs defaultValue="pages">
        <TabsList><TabsTrigger value="pages">Pages</TabsTrigger><TabsTrigger value="blog">Blog</TabsTrigger></TabsList>

        <TabsContent value="pages" className="mt-4">
          <div className="flex justify-end mb-4"><Button onClick={openNewPage}><Plus size={16} className="mr-2" />New Page</Button></div>
          <div className="space-y-3">
            {pages.map(p => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">/{p.slug}</p>
                  </div>
                  {p.is_published ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-muted-foreground" />}
                  <Button variant="ghost" size="icon" onClick={() => openEditPage(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePage(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
            {!loading && pages.length === 0 && <p className="text-center text-muted-foreground py-8">No pages yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="blog" className="mt-4">
          <div className="flex justify-end mb-4"><Button onClick={openNewPost}><Plus size={16} className="mr-2" />New Post</Button></div>
          <div className="space-y-3">
            {posts.map(p => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.author_name} · {(p.tags || []).join(", ")}</p>
                  </div>
                  {p.is_published ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-muted-foreground" />}
                  <Button variant="ghost" size="icon" onClick={() => openEditPost(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePost(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </CardContent>
              </Card>
            ))}
            {!loading && posts.length === 0 && <p className="text-center text-muted-foreground py-8">No blog posts yet.</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Page Dialog */}
      <Dialog open={pageDialog} onOpenChange={setPageDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editPage ? "Edit Page" : "New Page"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><Input value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Slug</label><Input value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Content (HTML/Markdown)</label><Textarea value={pageForm.content} onChange={e => setPageForm({ ...pageForm, content: e.target.value })} rows={8} /></div>
            <div><label className="text-sm font-medium">Meta Description</label><Input value={pageForm.meta_description} onChange={e => setPageForm({ ...pageForm, meta_description: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={pageForm.is_published} onCheckedChange={v => setPageForm({ ...pageForm, is_published: v })} /><span className="text-sm">Published</span></div>
            <Button className="w-full" onClick={savePage}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Dialog */}
      <Dialog open={postDialog} onOpenChange={setPostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editPost ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Title</label><Input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Slug</label><Input value={postForm.slug} onChange={e => setPostForm({ ...postForm, slug: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Content</label><Textarea value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} rows={10} /></div>
            <div><label className="text-sm font-medium">Excerpt</label><Textarea value={postForm.excerpt} onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Cover Image URL</label><Input value={postForm.cover_image} onChange={e => setPostForm({ ...postForm, cover_image: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Author</label><Input value={postForm.author_name} onChange={e => setPostForm({ ...postForm, author_name: e.target.value })} /></div>
            </div>
            <div><label className="text-sm font-medium">Tags (comma-separated)</label><Input value={postForm.tags} onChange={e => setPostForm({ ...postForm, tags: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={postForm.is_published} onCheckedChange={v => setPostForm({ ...postForm, is_published: v })} /><span className="text-sm">Published</span></div>
            <Button className="w-full" onClick={savePost}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCMS;
