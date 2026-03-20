

# Plan: Advanced Admin Panel for Putul Fashions

## Overview
Add 7 new admin modules: Homepage Content Builder, Media Library, CMS (pages + blog), Reviews Management, Analytics, Admin Roles, and Website Settings. This is a large scope — we'll build each as a standalone admin page with corresponding database tables.

## Database Changes (1 migration)

New tables:
- **homepage_sections**: id, section_type (hero/featured_collection/trending/editorial/banner), title, subtitle, content (jsonb), image_urls (text[]), sort_order, is_enabled, created_at, updated_at
- **media_library**: id, file_url, file_name, file_type, file_size, folder, tags (text[]), uploaded_by (uuid), created_at
- **cms_pages**: id, slug (unique), title, content (text - markdown/html), meta_description, is_published, created_at, updated_at
- **blog_posts**: id, title, slug (unique), content (text), excerpt, cover_image, author_name, tags (text[]), is_published, published_at, created_at, updated_at
- **reviews**: id, product_id (fk admin_products), user_id, author_name, rating (int), comment, status (pending/approved/rejected), is_featured, created_at
- **site_settings**: id, setting_key (unique text), setting_value (jsonb), updated_at

Storage bucket:
- **media** (public) — for image/video uploads from Media Library and content builder

RLS: All tables admin-only for write, public read for published content (cms_pages, blog_posts with is_published, reviews with approved status, site_settings, homepage_sections with is_enabled).

## New Admin Pages

### 1. Homepage Content Builder (`AdminHomepage.tsx`)
- List all homepage_sections ordered by sort_order
- Each section: toggle enabled/disabled, edit content (title, subtitle, images, linked products)
- Drag-and-drop reorder (update sort_order)
- Section types: hero_banner, product_carousel, category_showcase, promo_banner, editorial, marquee
- Frontend HomePage.tsx reads from this table instead of hardcoded data

### 2. Media Library (`AdminMedia.tsx`)
- Upload images/videos to storage bucket
- Grid view of all assets with search/filter by folder/type
- Click to copy URL
- Delete assets
- Folder organization

### 3. CMS Pages & Blog (`AdminCMS.tsx`)
- Tabs: Pages | Blog
- Pages: Edit About, Contact, Policies content (rich text via textarea + markdown preview)
- Blog: CRUD for blog posts with title, content, cover image, tags, publish/draft toggle
- New route needed: `/blog` and `/blog/:slug` on storefront

### 4. Reviews Management (`AdminReviews.tsx`)
- List all reviews with status filter (pending/approved/rejected)
- Approve/reject actions
- Toggle "featured" for homepage testimonials
- Link to product

### 5. Analytics (`AdminAnalytics.tsx`)
- Sales by date range (query orders table, aggregate by day/month)
- Top products by revenue
- Customer count over time
- Charts using recharts (already in project via shadcn)

### 6. Admin Roles (`AdminRoles.tsx`)
- List users with roles from user_roles table
- Assign/remove roles (admin, moderator, user)
- Add INSERT/UPDATE/DELETE policies for user_roles (currently missing — only admins can manage)
- Display role-based access info

### 7. Website Settings (`AdminSettings.tsx`)
- Logo URL (upload via media bucket)
- Theme colors (primary, accent, background) stored as JSON
- Font selections (heading font, body font)
- Currency symbol, region
- Settings stored as key-value pairs in site_settings table

## Routing & Sidebar Updates

New routes under `/admin`:
- `/admin/homepage` — Content Builder
- `/admin/media` — Media Library
- `/admin/cms` — Pages & Blog
- `/admin/reviews` — Reviews
- `/admin/analytics` — Analytics
- `/admin/roles` — Roles & Permissions
- `/admin/settings` — Website Settings

Sidebar gets 7 new nav items with appropriate icons (Layout, Image, FileText, Star, BarChart2, Shield, Settings).

## Storefront Integration
- HomePage.tsx will query `homepage_sections` table to render sections dynamically
- TestimonialSection will query approved+featured reviews
- Site settings (logo, colors) can be consumed via a React context

## File Summary
- **1 migration**: ~8 new tables + storage bucket + RLS policies
- **7 new pages**: AdminHomepage, AdminMedia, AdminCMS, AdminReviews, AdminAnalytics, AdminRoles, AdminSettings
- **2 new storefront pages**: BlogList, BlogPost
- **Modified**: App.tsx (routes), AdminSidebar.tsx (nav), HomePage.tsx (dynamic sections)

