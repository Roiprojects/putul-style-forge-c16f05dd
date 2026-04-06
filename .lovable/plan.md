

## Shiprocket Shipping Integration

Integrate Shiprocket API for automated shipping, tracking, and courier management.

---

### Phase 1: Secrets and Database

**1. Store Shiprocket credentials**
- Use `add_secret` to securely store `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` (used for token-based auth)

**2. Database migration — add shipping columns to `orders` table**
```sql
ALTER TABLE orders ADD COLUMN shiprocket_order_id text;
ALTER TABLE orders ADD COLUMN shiprocket_shipment_id text;
ALTER TABLE orders ADD COLUMN awb_code text;
ALTER TABLE orders ADD COLUMN courier_name text;
ALTER TABLE orders ADD COLUMN shipping_label_url text;
ALTER TABLE orders ADD COLUMN manifest_url text;
ALTER TABLE orders ADD COLUMN tracking_url text;
```

---

### Phase 2: Edge Functions

**3. `shiprocket-auth/index.ts`** — Token generation
- POST to `https://apiv2.shiprocket.in/v1/external/auth/login` with stored credentials
- Cache token (valid 10 days) — return existing if not expired

**4. `shiprocket-serviceability/index.ts`** — Courier availability + rates
- Input: pickup pincode, delivery pincode, weight, COD flag
- Returns available couriers with rates and ETAs
- Called from checkout to show real-time shipping charges

**5. `shiprocket-create-order/index.ts`** — Order sync + shipment creation
- Called after order placement
- Creates order in Shiprocket with all product/address details
- Requests courier assignment and AWB generation
- Stores `shiprocket_order_id`, `shipment_id`, `awb_code`, `courier_name` back to orders table

**6. `shiprocket-tracking/index.ts`** — Shipment tracking
- Input: AWB code or shipment ID
- Returns current tracking status and activity log
- Maps Shiprocket statuses to app statuses (Pending → Shipped → Out for Delivery → Delivered)

**7. `shiprocket-webhook/index.ts`** — Status sync (push-based)
- Receives Shiprocket webhook callbacks for status changes
- Auto-updates order status and tracking info in the database
- Handles: shipped, in-transit, out-for-delivery, delivered, RTO

**8. `shiprocket-labels/index.ts`** — Label and invoice download
- Fetches shipping label PDF and invoice from Shiprocket
- Returns downloadable URLs

---

### Phase 3: Checkout Updates (`CartPage.tsx`)

**9. Real-time shipping rates at checkout**
- After user enters pincode, call `shiprocket-serviceability` to fetch rates
- Display shipping charge (replace current "Free" hardcode)
- Update total dynamically based on selected/auto-selected courier

**10. Order placement flow update**
- After order is inserted into DB, call `shiprocket-create-order` edge function
- Store returned AWB and tracking info on the order
- Show tracking number on order confirmation page

---

### Phase 4: Customer-Facing Tracking (`OrderDetailPage.tsx`)

**11. Live tracking display**
- Fetch tracking data via `shiprocket-tracking` on order detail page
- Show tracking timeline with scan locations and timestamps
- Display courier name and AWB number
- Link to courier tracking page if available

---

### Phase 5: Admin Panel Updates (`AdminOrders.tsx`)

**12. Shipping management in admin**
- Show Shiprocket order ID, AWB, courier name in order details
- Add buttons: "Create Shipment" (manual), "Download Label", "Download Invoice"
- Add courier reassignment option (calls Shiprocket API)
- Show tracking timeline in order detail modal
- Display shipping status synced from Shiprocket

---

### Files to Create/Modify

| File | Change |
|------|--------|
| Migration | Add shiprocket columns to `orders` |
| `supabase/functions/shiprocket-auth/index.ts` | Token management |
| `supabase/functions/shiprocket-serviceability/index.ts` | Rate checking |
| `supabase/functions/shiprocket-create-order/index.ts` | Order + shipment creation |
| `supabase/functions/shiprocket-tracking/index.ts` | Tracking lookup |
| `supabase/functions/shiprocket-webhook/index.ts` | Push status updates |
| `supabase/functions/shiprocket-labels/index.ts` | Label/invoice download |
| `src/pages/CartPage.tsx` | Shipping rates at checkout |
| `src/pages/OrderDetailPage.tsx` | Live tracking UI |
| `src/pages/OrderConfirmationPage.tsx` | Show AWB/tracking |
| `src/pages/admin/AdminOrders.tsx` | Shipping management tools |

