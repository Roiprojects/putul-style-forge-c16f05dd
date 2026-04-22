-- 1. Admin activity log
CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view activity log" ON public.admin_activity_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert activity log" ON public.admin_activity_log
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());
CREATE INDEX idx_admin_activity_created ON public.admin_activity_log (created_at DESC);
CREATE INDEX idx_admin_activity_entity ON public.admin_activity_log (entity_type, entity_id);

-- 2. Search log
CREATE TABLE public.search_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.search_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert search log" ON public.search_log
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view search log" ON public.search_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_search_log_created ON public.search_log (created_at DESC);
CREATE INDEX idx_search_log_query ON public.search_log (lower(query));

-- 3. Wishlist items (DB persistence)
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view wishlists" ON public.wishlist_items
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_wishlist_user ON public.wishlist_items (user_id);
CREATE INDEX idx_wishlist_product ON public.wishlist_items (product_id);

-- 4. Coupon attribution on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_coupon ON public.orders (coupon_code) WHERE coupon_code IS NOT NULL;