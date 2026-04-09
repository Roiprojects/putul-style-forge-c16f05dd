import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls, mode } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "imageUrls array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch categories
    const { data: categories } = await supabase
      .from("admin_categories")
      .select("id, name, slug");

    const categoryList = (categories || [])
      .map((c: any) => `${c.slug} (${c.name})`)
      .join(", ");

    // Check for duplicate images
    const { data: existingProducts } = await supabase
      .from("admin_products")
      .select("id, name, images");

    const existingImageSet = new Set<string>();
    (existingProducts || []).forEach((p: any) => {
      (p.images || []).forEach((img: string) => {
        const filename = img.split("/").pop()?.toLowerCase();
        if (filename) existingImageSet.add(filename);
      });
    });

    const newUrls: string[] = [];
    const skippedUrls: string[] = [];

    for (const url of imageUrls) {
      const filename = url.split("/").pop()?.toLowerCase() || "";
      if (existingImageSet.has(filename)) {
        skippedUrls.push(url);
      } else {
        newUrls.push(url);
      }
    }

    if (newUrls.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            productsCreated: 0,
            productsUpdated: 0,
            imagesUploaded: 0,
            duplicatesSkipped: skippedUrls.length,
            errors: 0,
          },
          products: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If mode is "analyze", just return AI groupings without creating products
    const createProducts = mode !== "analyze";

    // Build vision content for AI
    const imageContent = newUrls.map((url, idx) => ({
      type: "image_url" as const,
      image_url: { url },
    }));

    const prompt = `You are a product catalog expert for an Indian footwear & accessories e-commerce store called "Putul".

Analyze these ${newUrls.length} product images. For each image, identify:
1. What type of product it is
2. Group images that show the SAME product (different angles/colors count as different products)
3. Assign to one of these categories: ${categoryList}

Return a JSON object with this exact structure:
{
  "groups": [
    {
      "productName": "Descriptive product name",
      "description": "2-3 sentence product description highlighting key features",
      "tags": ["tag1", "tag2", "tag3"],
      "categorySlug": "one-of-the-slugs-above",
      "imageIndices": [0, 1],
      "suggestedPrice": 999,
      "suggestedOriginalPrice": 1499
    }
  ]
}

Rules:
- Each image index (0 to ${newUrls.length - 1}) must appear in exactly one group
- If unsure about category, use "accessories"
- Product names should be descriptive and marketable (e.g. "Men's Black Mesh Sports Running Shoes")
- Prices in INR, reasonable for Indian market footwear/accessories
- Tags should include product type, color, material, gender if identifiable`;

    console.log(`Sending ${newUrls.length} images to AI for analysis...`);

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                ...imageContent,
              ],
            },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    console.log("AI response received, parsing...");

    // Extract JSON from response
    let groups: any[];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      const parsed = JSON.parse(jsonMatch[0]);
      groups = parsed.groups || [];
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", rawResponse: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map category slugs to IDs
    const categoryMap: Record<string, string> = {};
    (categories || []).forEach((c: any) => {
      categoryMap[c.slug] = c.id;
    });

    const createdProducts: any[] = [];
    let errorCount = 0;

    if (createProducts) {
      for (const group of groups) {
        try {
          const categoryId = categoryMap[group.categorySlug] || null;
          const productImages = (group.imageIndices || []).map(
            (idx: number) => newUrls[idx]
          );

          const { data: product, error } = await supabase
            .from("admin_products")
            .insert({
              name: group.productName,
              description: group.description,
              price: group.suggestedPrice || 999,
              original_price: group.suggestedOriginalPrice || null,
              category_id: categoryId,
              images: productImages,
              tags: group.tags || [],
              stock: 10,
              is_active: true,
            })
            .select()
            .single();

          if (error) {
            console.error("Error creating product:", error);
            errorCount++;
          } else {
            createdProducts.push({
              id: product.id,
              name: product.name,
              category: group.categorySlug,
              imageCount: productImages.length,
            });
          }
        } catch (e) {
          console.error("Error processing group:", e);
          errorCount++;
        }
      }
    }

    const result = {
      success: true,
      summary: {
        productsCreated: createdProducts.length,
        productsUpdated: 0,
        imagesUploaded: newUrls.length,
        duplicatesSkipped: skippedUrls.length,
        errors: errorCount,
      },
      products: createProducts ? createdProducts : groups,
      skippedUrls,
    };

    console.log("Result:", JSON.stringify(result.summary));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
