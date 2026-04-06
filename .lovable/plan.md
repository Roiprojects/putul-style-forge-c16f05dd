

## Size + Color Variant Matrix Feature

This adds a full variant matrix system where each color-size combination has independent stock, and the product page dynamically enables/disables options based on availability.

---

### Database Changes

**1. Add `color_code` and `images` columns to `product_variants` table:**

```sql
ALTER TABLE product_variants ADD COLUMN color_code text;
ALTER TABLE product_variants ADD COLUMN images text[] DEFAULT '{}'::text[];
```

The existing `product_variants` table already has `product_id`, `color`, `size`, `stock`, `price_adjustment`, `sku` — perfect for the variant matrix.

**2. Enable realtime on `product_variants`:**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
```

---

### Admin Panel Changes (`AdminProductForm.tsx`)

- Add a **Variant Matrix Manager** section below the existing colors/sizes inputs
- When admin selects colors and sizes, auto-generate a matrix grid (table) showing every color×size combination
- Each cell has: stock input field
- Per-color row: image upload area, hex color code picker
- On product save, upsert all variants to `product_variants` table
- On edit, load existing variants and populate the matrix
- Remove the single `stock` field (replaced by per-variant stock)

---

### Data Layer Changes (`useProducts.ts`)

- `useProduct(id)` — also fetch `product_variants` for the product and return alongside product data
- Add a `useProductVariants(productId)` hook for standalone use
- Add variant data to realtime sync channel

---

### Product Interface Update (`products.ts`)

Add optional `variants` field to `Product` interface:
```typescript
export interface ProductVariant {
  id: string;
  color: string;
  colorCode?: string;
  size: string;
  stock: number;
  priceAdjustment: number;
  images: string[];
}
```

---

### Product Page Changes (`ProductPage.tsx`)

**Color Selection:**
- Render color swatches (circles filled with `color_code` hex, or labeled circles)
- On color select: filter sizes to show only those with stock > 0 for that color; grey out unavailable sizes
- Swap main image gallery to selected color's images (with smooth opacity transition)

**Size Selection:**
- On size select: filter colors to show only those with stock > 0 for that size; grey out unavailable colors
- Either selection can happen first — the other adjusts dynamically

**URL Sync:**
- Use `useSearchParams` to read/write `?color=black&size=9`
- On page load, restore selection from URL params

**Out of Stock:**
- If selected combination has stock = 0, show "Out of Stock" message and disable Add to Cart
- Greyed-out options show tooltip "Out of stock"

**Price:**
- Apply `price_adjustment` from variant to base price if non-zero

---

### Cart Changes (`StoreContext.tsx`)

- Add `color` field to `CartItem` interface
- Update `addToCart(product, size, color)` signature
- Unique key becomes `product.id + size + color`
- Update `removeFromCart`, `updateQuantity` to use 3-part key

---

### Cart Page & Order Flow (`CartPage.tsx`)

- Display selected color alongside size in cart line items
- Include color in `order_items` insert when placing order (column already exists)

---

### Files to Modify

| File | Change |
|------|--------|
| `product_variants` (migration) | Add `color_code`, `images` columns |
| `src/pages/admin/AdminProductForm.tsx` | Variant matrix manager UI |
| `src/hooks/useProducts.ts` | Fetch variants, add realtime sync |
| `src/data/products.ts` | Add `ProductVariant` interface |
| `src/pages/ProductPage.tsx` | Color swatches, smart availability, URL sync |
| `src/contexts/StoreContext.tsx` | Add color to cart item key |
| `src/pages/CartPage.tsx` | Show color in cart, include in orders |
| `src/components/ProductCard.tsx` | Optional: show color dots on cards |

