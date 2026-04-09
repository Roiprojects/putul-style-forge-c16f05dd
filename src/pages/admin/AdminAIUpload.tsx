import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, CheckCircle, XCircle, AlertTriangle, Image, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductResult {
  id: string;
  name: string;
  category: string;
  imageCount: number;
}

interface Summary {
  productsCreated: number;
  productsUpdated: number;
  imagesUploaded: number;
  duplicatesSkipped: number;
  errors: number;
}

const AdminAIUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processProgress, setProcessProgress] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...imageFiles]);
    setSummary(null);
    setProducts([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const uploadToStorage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `ai-upload/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    setProcessProgress(0);
    setSummary(null);
    setProducts([]);

    // Step 1: Upload all images to storage (5 concurrent)
    const urls: string[] = [];
    const CONCURRENT = 5;
    let uploaded = 0;

    for (let i = 0; i < files.length; i += CONCURRENT) {
      const batch = files.slice(i, i + CONCURRENT);
      const results = await Promise.all(batch.map(uploadToStorage));
      results.forEach((url) => {
        if (url) urls.push(url);
      });
      uploaded += batch.length;
      setUploadProgress(Math.round((uploaded / files.length) * 100));
    }

    if (urls.length === 0) {
      toast.error("No images were uploaded successfully");
      setUploading(false);
      return;
    }

    setUploading(false);
    setProcessing(true);

    // Step 2: Send to AI in batches of 10
    const BATCH_SIZE = 10;
    const allProducts: ProductResult[] = [];
    const totalSummary: Summary = {
      productsCreated: 0,
      productsUpdated: 0,
      imagesUploaded: urls.length,
      duplicatesSkipped: 0,
      errors: 0,
    };

    let processed = 0;

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      try {
        const { data, error } = await supabase.functions.invoke(
          "ai-product-creator",
          { body: { imageUrls: batch } }
        );

        if (error) {
          console.error("Edge function error:", error);
          totalSummary.errors += batch.length;
        } else if (data?.success) {
          totalSummary.productsCreated += data.summary.productsCreated;
          totalSummary.productsUpdated += data.summary.productsUpdated;
          totalSummary.duplicatesSkipped += data.summary.duplicatesSkipped;
          totalSummary.errors += data.summary.errors;
          if (data.products) allProducts.push(...data.products);
        } else {
          console.error("AI error:", data?.error);
          totalSummary.errors += batch.length;
          toast.error(data?.error || "AI processing failed for a batch");
        }
      } catch (e) {
        console.error("Batch error:", e);
        totalSummary.errors += batch.length;
      }

      processed += batch.length;
      setProcessProgress(Math.round((processed / urls.length) * 100));
    }

    setSummary(totalSummary);
    setProducts(allProducts);
    setProcessing(false);
    setFiles([]);

    if (totalSummary.productsCreated > 0) {
      toast.success(`${totalSummary.productsCreated} products created!`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Product Upload
        </h1>
        <p className="text-muted-foreground mt-1">
          Drop product images and AI will automatically detect, group, categorize, and create products.
        </p>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="p-0">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              Drag & drop product images here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse. Supports 50+ images at once.
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && !uploading && !processing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                {files.length} images selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                  Clear
                </Button>
                <Button size="sm" onClick={processImages}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Process with AI
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {files.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {f.name.length > 25 ? f.name.slice(0, 22) + "..." : f.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading images...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Processing Progress */}
      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                  AI analyzing and creating products...
                </span>
                <span>{processProgress}%</span>
              </div>
              <Progress value={processProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <div className="text-2xl font-bold">{summary.productsCreated}</div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <CheckCircle className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold">{summary.productsUpdated}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <Image className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-2xl font-bold">{summary.imagesUploaded}</div>
                <div className="text-xs text-muted-foreground">Images</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                <div className="text-2xl font-bold">{summary.duplicatesSkipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
                <div className="text-2xl font-bold">{summary.errors}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Products */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {p.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {p.imageCount} images
                      </span>
                    </div>
                  </div>
                  <Link to={`/admin/products/${p.id}`}>
                    <Button variant="ghost" size="sm">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAIUpload;
