

## Cancel Order — Plan

### 1. Database
New migration adding a `cancellation_requests` table:
- `id` (uuid, pk), `order_id` (uuid), `user_id` (uuid)
- `reason` (text), `reason_note` (text, nullable)
- `request_type` (text: `refund` | `replacement`)
- `payment_method` (text — snapshot of order payment method)
- `refund_method` (text, nullable: `original` | `bank` | `upi`)
- `bank_name`, `account_holder`, `account_number`, `ifsc` (text, nullable)
- `upi_id` (text, nullable)
- `replacement_size`, `replacement_color`, `replacement_variant`, `replacement_note` (text, nullable)
- `status` (text default `pending`: `pending` | `approved` | `rejected`)
- `admin_notes` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

RLS:
- Users: insert their own (via `orders.user_id = auth.uid()`), select their own
- Admins: full manage via `has_role(auth.uid(), 'admin')`
- Trigger to auto-update `updated_at`

### 2. Storefront — Order Detail page (`src/pages/OrderDetailPage.tsx`)
- Add a **Cancel Order** button in the right column under "Need Help?" (shown only when status is `pending`/`confirmed`/`processing` — not for shipped/delivered/cancelled, and only when no existing cancellation request).
- Fetch latest `cancellation_requests` row for this order alongside other data. If one exists:
  - Hide Cancel Order button
  - Show a "Cancellation Requested" status card (status pill + reason + type + admin notes)
- New component **`src/components/CancelOrderModal.tsx`** — multi-step dialog:
  1. **Reason** — dropdown (Changed mind, Ordered by mistake, Found cheaper, Delivery too slow, Wrong item, Other) + optional textarea.
  2. **Action type** — Request Replacement vs Request Refund.
  3a. **Refund details** — radio:
      - If `payment_method === 'razorpay'` / online: options `Original payment method`, `Bank account`, `UPI ID`.
      - If `cod`: options `Bank account`, `UPI ID` only.
      - Conditional fields for bank (name, acct no, IFSC, bank name) or UPI id, validated with zod.
  3b. **Replacement details** — reason textarea (prefilled from step 1), size/variant/color selects (populated from order items + product variants), optional note.
  4. Submit → insert into `cancellation_requests`, also update `orders.status = 'cancellation_requested'`. Toast + close + refetch.

### 3. Admin Panel
- New page **`src/pages/admin/AdminCancellations.tsx`** showing table of all cancellation requests:
  Order ID, Customer Name, Reason, Request Type, Payment Method, Refund/Replacement details (expandable row), Status, Created.
  Filters by status. Row actions: **View Details** (drawer/dialog), **Approve**, **Reject**, optional admin notes.
- Add sidebar entry in `AdminSidebar.tsx`: "Cancellations" (icon `XCircle`) → `/admin/cancellations`.
- Register route in `src/App.tsx`.
- On approve: update request status; if refund → admin can manually process (out of scope to auto-refund); if replacement → mark order accordingly. On reject: status `rejected` + note.

### 4. UX details
- Cancel Order button: red outlined style, with confirmation in modal.
- After submission button replaced by disabled badge "Cancellation Requested".
- All forms validated with `react-hook-form` + `zod`.

### Files touched
- `supabase/migrations/<new>.sql` (new)
- `src/components/CancelOrderModal.tsx` (new)
- `src/pages/OrderDetailPage.tsx`
- `src/pages/admin/AdminCancellations.tsx` (new)
- `src/components/admin/AdminSidebar.tsx`
- `src/App.tsx`

