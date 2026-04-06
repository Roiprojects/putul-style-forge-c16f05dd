ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS awb_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_label_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS manifest_url text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url text;