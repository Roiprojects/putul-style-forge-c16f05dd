

# Product Color Variant Linking

## Problem
Products like "Black Premium Eva Clogs For Men" and "Grey Premium Eva Clogs For Men" are the same product in different colors, but stored as separate entries. There's no way to navigate between them on the product page.

## Solution
Add a `product_group` column to `admin_products`. Products sharing the same group ID are color siblings. On the product page, color swatches for all siblings appear — clicking one navigates to that product's page with a smooth transition.

```text
Product Page (Black Clogs)
┌──────────────────────────────┐
│  [product images]            │
│                              │
│  Color: Black                │
│  ● ● ● ● ● ● ●             │  ← Each circle = a sibling product
│  (click Grey → navigates     │     with its first image as thumbnail
│   to Grey Clogs page)        │
└──────────────────────────────┘
```

## Implementation Steps

### 1. Database: Add `product_group` column
- Add `product_group TEXT` to `admin_products`
- Populate groups for existing products (e.g., all "Premium Eva Clogs For Men" variants get the same group ID)
- Add `color_code` column if missing (hex values for swatch rendering)

### 2. Frontend: Product page sibling swatches
- In `ProductPage.tsx`, query sibling products: `SELECT id, name, colors, images, color_code FROM admin_products WHERE product_group = ? AND is_active = true`
- Render color swatches showing sibling product thumbnails (first image)
- Clicking a swatch navigates to `/product/{siblingId}` — no page reload needed (React Router)
- Highlight the current product's color swatch with a border
- Show color name on hover via tooltip

### 3. Admin panel: Group management
- Add a "Product Group" field in `AdminProductForm.tsx` — a text input or dropdown
- Admin can assign a group name (e.g., "premium-eva-clogs") to link color variants together
- Add a color code picker for hex values

### 4. Hook: Fetch siblings
- Add `useProductSiblings(productGroup)` to `useProducts.ts`
- Returns all products in the same group, excluding the current one

## Files to Modify

| File | Change |
|------|--------|
| Migration SQL | Add `product_group` and `color_code` columns, populate existing groups |
| `src/hooks/useProducts.ts` | Add `useProductSiblings` hook |
| `src/pages/ProductPage.tsx` | Add sibling color swatches section with navigation |
| `src/pages/admin/AdminProductForm.tsx` | Add product group and color code fields |
| `src/components/ProductCard.tsx` | Optionally show available color dots on shop grid |

## Data Population
Will auto-group ~80+ products by matching product names (stripping color prefixes). Example groups:
- "Premium Eva Clogs For Men" → Black, Beige, Blue, Green, Grey, etc.
- "Premium Eva Slides For Men" → Black, Beige, etc.
- "Chest Bag" → all chest bag color variants

