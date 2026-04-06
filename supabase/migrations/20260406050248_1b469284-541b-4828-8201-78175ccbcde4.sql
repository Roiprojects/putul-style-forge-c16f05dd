
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_code text;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
