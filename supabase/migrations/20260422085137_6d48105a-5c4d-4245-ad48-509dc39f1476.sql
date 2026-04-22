ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER TABLE public.admin_products REPLICA IDENTITY FULL;
ALTER TABLE public.admin_categories REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;