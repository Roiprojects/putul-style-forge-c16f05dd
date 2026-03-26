

## Plan: Fix Search, About Us, Footer, and Product Images

### Issues Identified

1. **Search bar**: The mobile search works but the ShopPage category bar is `sticky top-0` which overlaps the sticky Navbar. Also, the search query from URL isn't being cleared when leaving ShopPage. The desktop search works. The main issue: when navigating to `/shop?search=...`, the ShopPage category tabs cover the top since both Navbar and category bar are `sticky top-0`.

2. **About Us content**: Currently describes "men's clothing" generically. Putul Fashions actually sells **men's footwear** — crocs, sports shoes, slides & slippers, loafer sandals. Need to rewrite to reflect this accurately.

3. **Footer links**: Links to `/shop`, `/about`, `/contact` exist but "Privacy Policy", "Terms of Service", and "Shipping" use `href="#"` (non-functional). Social media links also use `href="#"`.

4. **Product images**: Multiple products in `data/products.ts` share identical image URLs (e.g., products 8-14 reuse the same Brown Airmix sandal images or Grey clogs images). This is a hardcoded data issue. The DB products may have the same problem if they were seeded from this data.

### Changes

#### 1. Fix ShopPage sticky category bar overlap
- Change the category bar in `ShopPage.tsx` from `sticky top-0` to `sticky top-14 lg:top-16` to account for the Navbar height, so it doesn't overlap.

#### 2. Rewrite About Us page
- Update `AboutPage.tsx` content to accurately describe Putul Fashions as a **men's footwear brand** specializing in crocs, sports shoes, slides & slippers, and loafer sandals.
- Replace generic "clothing" references with footwear-specific language about comfort, quality materials (EVA, Airmix, PVC), and affordable pricing.
- Update mission statement and values to reflect footwear focus.

#### 3. Fix Footer buttons
- Change "Privacy Policy", "Terms of Service", "Shipping" from `<a href="#">` to `<Link to="/...">` pointing to actual routes, or keep as anchor links but make them point to the contact page or relevant sections.
- Update social media links to open in new tabs with proper `target="_blank"` and `rel="noopener noreferrer"`.

#### 4. Fix duplicate product images in database
- Run a SQL update to fix the `images` arrays for products that share duplicate image URLs. Cross-reference with the actual putul.fashion product catalog to assign correct unique images to each product.
- For the local `data/products.ts` file, update the duplicate entries (products 8-15) with their correct unique image paths from the CDN.

### Files to Modify
- `src/pages/ShopPage.tsx` — fix sticky positioning
- `src/pages/AboutPage.tsx` — rewrite content for footwear brand
- `src/components/Footer.tsx` — fix non-functional links
- `src/data/products.ts` — fix duplicate images (if still used as fallback)
- Database migration or SQL update for product images in `admin_products` table

