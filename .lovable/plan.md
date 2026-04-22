

## The Bug

**New products priced above ₹3,000 are silently filtered out of the Shop page and category pages.**

Your two newest products (`simple`, `shash`) are both ₹5,000 and correctly mapped to `sports-shoes` in the database — but `ShopPage.tsx` defaults `maxPrice = 3000` and the price slider only goes up to ₹3,000. The line `items.filter((p) => p.price <= 3000)` removes them before render.

Search still works because the `SearchDropdown` doesn't apply any price filter — it only matches name/description/category text.

Database, FK mapping, RLS, realtime sync, and the admin save flow are all working correctly. This is purely a stale frontend price-cap problem.

## The Fix

### 1. `src/pages/ShopPage.tsx` — make the price filter dynamic

- Compute `priceCap` from the actual product set: `Math.max(3000, ...products.map(p => p.price))` rounded up to nearest 500.
- Initialize `maxPrice` state to that cap (so the filter is a no-op until the user touches the slider).
- Set the `<input type="range">` `max` attribute to the same dynamic cap.
- Update the "Up to ₹X" label and the "Clear all" reset to use the dynamic cap instead of hardcoded `3000`.
- Update `hasActiveFilters` check accordingly.

This makes ShopPage automatically accommodate any future product price (₹500 sandals or ₹15,000 limited drops) without code changes.

### 2. `src/pages/ShopPage.tsx` — fix the size filter list

The hardcoded `sizes = ["6", "7", "8", "9", "10"]` misses sizes admin actually uses (11, S, M, L, XL, XXL). Replace with a dynamic list derived from `products.flatMap(p => p.sizes)` deduped + sorted via the existing `SIZE_ORDER` logic. Prevents the same silent-filter bug for size.

### 3. Verification (no code change needed)

After the fix, the two ₹5,000 products will appear:
- `/shop` → All products
- `/shop?category=sports-shoes` → Sports Shoes tab
- Homepage "New Arrivals" (already works — no price filter there)
- Search dropdown (already works)

### Files touched

- `src/pages/ShopPage.tsx` — only file that needs editing

### Out of scope (already fine)

- Database schema, FK, RLS, realtime publication — verified correct via SQL
- `AdminProductForm.tsx` save logic — saves `category_id` and `is_active=true` correctly
- `useProducts` hook — query returns the full set with proper category join
- `SearchDropdown` — already shows new products

