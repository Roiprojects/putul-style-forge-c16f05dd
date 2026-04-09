

# AI-Based Product Creation & Bulk Image Upload

## Overview
Build an admin page where you drag-and-drop product images, and AI automatically detects product types, groups images into products, assigns categories, generates titles/descriptions/tags, and creates products in the database.

## Architecture

```text
┌─────────────────────────────────────────────┐
│  Admin UI: /admin/ai-upload                 │
│  - Drag & drop zone (50+ images)            │
│  - Upload to Supabase "media" bucket        │
│  - Send image URLs in batches to edge fn    │
│  - Show progress bar + live summary         │
│  - Review/edit results before final save    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Edge Function: ai-product-creator          │
│  - Receives batch of image URLs             │
│  - Calls Lovable AI (Gemini Flash) with     │
│    vision to analyze images                 │
│  - Returns: product groupings, names,       │
│    descriptions, tags, category slugs       │
│  - Matches categories from DB               │
│  - Creates/updates products via service key │
│  - Returns summary of actions taken         │
└─────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Edge Function: `ai-product-creator`
- Accepts `{ imageUrls: string[] }` (batch of uploaded image URLs)
- Fetches existing categories from DB
- Sends images to Gemini 2.5 Flash (vision-capable) with a prompt asking it to:
  - Identify product type per image
  - Group images that show the same product
  - Generate name, description, tags, and category match
- Checks for duplicate images by filename against existing `admin_products.images`
- Creates new products or appends images to existing ones
- Returns structured summary (created, updated, skipped, errors)

### 2. Admin Page: `AdminAIUpload.tsx`
- Drag-and-drop zone accepting 50+ images
- On drop: upload all images to `media` bucket with progress
- Then send URLs in batches of ~10 to the edge function
- Live progress bar: "Processing 20/65 images..."
- After completion, show summary table:
  - Products created (with names and categories)
  - Products updated
  - Images uploaded
  - Duplicates skipped
  - Errors encountered
- Each result row links to the product edit form

### 3. Route & Sidebar Integration
- Add route `/admin/ai-upload` in `App.tsx`
- Add "AI Upload" nav item with a Sparkles icon in `AdminSidebar.tsx`

### 4. Handle the Uploaded Zip
- Extract images from `Putul-2.zip` and process them through the same flow, or allow the admin to upload the zip directly (extract on client side before uploading individual images)

## Technical Details

**AI Model**: `google/gemini-2.5-flash` (supports vision, fast, cost-effective for image classification)

**Prompt Strategy**: Send up to 10 images per request with category list. Ask AI to return JSON with groupings:
```json
{
  "groups": [
    {
      "productName": "Men Black Sports Running Shoes",
      "description": "Lightweight sports running shoes...",
      "tags": ["sports", "running", "men"],
      "categorySlug": "sports-shoes",
      "imageIndices": [0, 1, 2, 3]
    }
  ]
}
```

**Duplicate Detection**: Compare uploaded filenames against existing `images` arrays in `admin_products`.

**Error Handling**: Each batch processes independently; failures in one batch don't block others. Failed images are logged and reported in the summary.

**Performance**: Images upload in parallel (5 concurrent), AI processing in batches of 10, products created via bulk inserts.

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/ai-product-creator/index.ts` | Create - Edge function for AI analysis + product creation |
| `src/pages/admin/AdminAIUpload.tsx` | Create - Admin page with drag-drop UI and progress |
| `src/App.tsx` | Modify - Add route for `/admin/ai-upload` |
| `src/components/admin/AdminSidebar.tsx` | Modify - Add "AI Upload" nav item |

