import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Star } from "lucide-react";

type Review = {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  comment: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success(`Review ${status}`);
    fetchReviews();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from("reviews").update({ is_featured: featured }).eq("id", id);
    toast.success(featured ? "Featured on homepage" : "Removed from featured");
    fetchReviews();
  };

  const filtered = reviews.filter(r => r.status === tab);

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({reviews.filter(r => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({reviews.filter(r => r.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({reviews.filter(r => r.status === "rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No {tab} reviews.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(r => (
                <Card key={r.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{r.author_name}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"} />
                            ))}
                          </div>
                          {r.is_featured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment || "No comment"}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        {tab === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "approved")}><Check size={14} className="mr-1" />Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")}><X size={14} className="mr-1" />Reject</Button>
                          </>
                        )}
                        {tab === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => toggleFeatured(r.id, !r.is_featured)}>
                            {r.is_featured ? "Unfeature" : "Feature"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReviews;
