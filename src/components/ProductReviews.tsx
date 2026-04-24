import { useEffect, useState } from "react";
import { Star, Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  created_at: string;
}

interface Props {
  productId: string;
}

const ProductReviews = ({ productId }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, rating, comment, photos, created_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) loadReviews();
  }, [productId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    setPhotos(prev => [...prev, ...files].slice(0, 5));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split(".").pop();
      const path = `reviews/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setUploading(false);
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }
    setSubmitting(true);
    try {
      const photoUrls = await uploadPhotos();
      const authorName =
        user.user_metadata?.display_name || user.email?.split("@")[0] || "Customer";
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        author_name: authorName,
        rating,
        comment: comment.trim() || null,
        photos: photoUrls,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Review submitted! It will appear after approval.");
      setShowForm(false);
      setRating(5);
      setComment("");
      setPhotos([]);
    } catch (err: any) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="container mx-auto px-4 md:px-8 py-12 border-t">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    className={i <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="bg-primary text-primary-foreground px-5 py-2.5 text-xs tracking-widest uppercase rounded-full"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-accent/30 p-6 rounded-2xl mb-8 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setRating(i)}>
                  <Star
                    size={28}
                    className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 border border-border rounded-xl bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Add Photos (up to 5)</label>
            <div className="flex flex-wrap gap-2 items-center">
              {photos.map((f, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent">
                  <Camera size={20} className="text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </label>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="bg-primary text-primary-foreground px-6 py-3 text-xs tracking-widest uppercase rounded-full disabled:opacity-50 inline-flex items-center gap-2"
          >
            {(submitting || uploading) && <Loader2 size={14} className="animate-spin" />}
            {uploading ? "Uploading..." : submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{r.author_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={12}
                          className={i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {r.comment && <p className="text-sm text-foreground/80 mt-2">{r.comment}</p>}
              {r.photos && r.photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.photos.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setLightbox(url)}
                      className="w-20 h-20 rounded-lg overflow-hidden hover:opacity-80 transition"
                    >
                      <img src={url} alt="Review" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0">
          {lightbox && <img src={lightbox} alt="Review" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductReviews;
