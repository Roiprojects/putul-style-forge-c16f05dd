

# Plan: Extend Admin Panel with Business Operations

## Overview
Add 4 new modules to the existing admin panel: enhanced Order Management (with invoices & returns), Customer Management, Offers & Discounts, and Shipping & Payment Settings.

## Database Changes (1 migration)

New tables:
- **coupons**: code, discount_type (percentage/flat), discount_value, min_order, max_discount, usage_limit, used_count, expiry_date, is_active
- **shipping_zones**: name, states (text[]), base_charge, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active
- **payment_settings**: method (upi/cards/cod), is_enabled, display_name, sort_order
- **returns**: order_id, reason, status (requested/approved/refunded/rejected), refund_amount, admin_notes, created_at

Add columns to existing tables:
- **orders**: add `tracking_number` (text), `invoice_number` (text)
- **profiles**: add `is_blocked` (boolean, default false)

All new tables get RLS policies restricted to admin role. The `profiles` table gets an admin SELECT ALL policy.

## New Admin Pages

### 1. Enhanced Order Management (`AdminOrders.tsx` - update)
- Add invoice generation (client-side PDF-like view with print)
- Add returns/refunds tab showing return requests
- Add tracking number field in order detail modal

### 2. Customer Management (`AdminCustomers.tsx` - new)
- List all profiles joined with order count and total spent
- Customer detail view with order history
- Block/unblock toggle

### 3. Coupons & Offers (`AdminCoupons.tsx` - new)
- CRUD for coupon codes
- Fields: code, type, value, min order, max discount, usage limit, expiry
- Active/inactive toggle

### 4. Shipping Settings (`AdminShipping.tsx` - new)
- CRUD for shipping zones with states, charges, free shipping threshold
- Estimated delivery days

### 5. Payment Settings (`AdminPayments.tsx` - new)
- Toggle UPI, Cards, COD on/off
- Reorder payment methods

## Sidebar Update
Add new nav items: Customers, Coupons, Shipping, Payments (with appropriate icons).

## Routing Update
Add routes in `App.tsx`: `/admin/customers`, `/admin/coupons`, `/admin/shipping`, `/admin/payments`.

## File Changes Summary
- **Migration**: 1 SQL migration for all new tables + column additions
- **New files**: `AdminCustomers.tsx`, `AdminCoupons.tsx`, `AdminShipping.tsx`, `AdminPayments.tsx`
- **Modified files**: `AdminOrders.tsx` (invoice + returns), `AdminSidebar.tsx` (new nav items), `App.tsx` (new routes)

