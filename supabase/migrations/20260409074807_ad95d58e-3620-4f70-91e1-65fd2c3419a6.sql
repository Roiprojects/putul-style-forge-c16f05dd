
-- Add product_group and color_code columns
ALTER TABLE public.admin_products ADD COLUMN IF NOT EXISTS product_group TEXT;
ALTER TABLE public.admin_products ADD COLUMN IF NOT EXISTS color_code TEXT;

-- Create index for fast sibling lookups
CREATE INDEX IF NOT EXISTS idx_admin_products_product_group ON public.admin_products(product_group) WHERE product_group IS NOT NULL;

-- Populate product groups and color codes

-- Premium Eva Clogs For Men (basic line)
UPDATE public.admin_products SET product_group = 'premium-eva-clogs', color_code = '#000000' WHERE id = '795b37c7-0186-4530-b5b8-317a36dd9f90'; -- Black
UPDATE public.admin_products SET product_group = 'premium-eva-clogs', color_code = '#F5F5DC' WHERE id = '83bff2f2-ee53-4f56-b7d3-d5f8dfb2ac75'; -- Beige
UPDATE public.admin_products SET product_group = 'premium-eva-clogs', color_code = '#2563EB' WHERE id = '44478aae-a38d-4d71-bb60-a76b9cbc9dd1'; -- Blue
UPDATE public.admin_products SET product_group = 'premium-eva-clogs', color_code = '#228B22' WHERE id = '88e89ff4-beed-477c-9961-aaa4439b9686'; -- Green
UPDATE public.admin_products SET product_group = 'premium-eva-clogs', color_code = '#808080' WHERE id = '5eb8d0cf-4e03-4f69-8c6e-f0afb3dfc84d'; -- Grey

-- Premium Eva Clogs Classic
UPDATE public.admin_products SET product_group = 'premium-eva-clogs-classic', color_code = '#F5F5DC' WHERE id = '14d4e579-41a2-4f1c-8190-d8af9893cb20'; -- Beige Classic
UPDATE public.admin_products SET product_group = 'premium-eva-clogs-classic', color_code = '#808080' WHERE id = 'cc0c684b-3e2f-4c0e-a020-ba28c8796bf8'; -- Grey Classic

-- Premium Eva Slides For Men (basic line)
UPDATE public.admin_products SET product_group = 'premium-eva-slides', color_code = '#000000' WHERE id = '35c0e762-8a2b-4066-a955-140c9b793084'; -- Black
UPDATE public.admin_products SET product_group = 'premium-eva-slides', color_code = '#F5F5DC' WHERE id = '4bdff974-83fa-4f80-8e09-978417e93f29'; -- Beige
UPDATE public.admin_products SET product_group = 'premium-eva-slides', color_code = '#808080' WHERE id = '46f3ba0a-6243-422b-98a9-6623793f48a7'; -- Grey

-- Premium Eva Slides Style 2
UPDATE public.admin_products SET product_group = 'premium-eva-slides-style2', color_code = '#000000' WHERE id = '2098cad0-42fa-4625-a910-1a05ae7f0dd1'; -- Black
UPDATE public.admin_products SET product_group = 'premium-eva-slides-style2', color_code = '#808080' WHERE id = 'ec2566e1-c527-4a3a-be3a-c8e10896c399'; -- Grey

-- Premium Eva Slides Style 3
UPDATE public.admin_products SET product_group = 'premium-eva-slides-style3', color_code = '#000000' WHERE id = 'd31321fa-d49f-4869-a410-cfa9e6a6352f'; -- Black
UPDATE public.admin_products SET product_group = 'premium-eva-slides-style3', color_code = '#808080' WHERE id = '725e554d-832a-49de-a9b9-5be9e0419cef'; -- Grey

-- Mens Casual Slip-On Eva Clogs
UPDATE public.admin_products SET product_group = 'casual-slip-on-clogs', color_code = '#000000' WHERE id = '81a20700-eab1-446b-b5d8-15a8feb05c5d'; -- Black
UPDATE public.admin_products SET product_group = 'casual-slip-on-clogs', color_code = '#808080' WHERE id = '1e752e97-e45b-400b-9ae4-8cfde8259f68'; -- Grey

-- Double Color Soft Quality Clogs
UPDATE public.admin_products SET product_group = 'double-color-clogs', color_code = '#1a1a1a' WHERE id = '2f0c80fd-e32c-4e8e-a54d-4338976d1a38'; -- Black Grey
UPDATE public.admin_products SET product_group = 'double-color-clogs', color_code = '#808080' WHERE id = '347dfa83-6551-4a76-97b4-cea79678cde0'; -- Grey Orange

-- Premium Sandal For Men
UPDATE public.admin_products SET product_group = 'premium-sandal', color_code = '#000000' WHERE id = 'be236a7e-b4f1-428b-8054-ef63fb9edec4'; -- Black
UPDATE public.admin_products SET product_group = 'premium-sandal', color_code = '#8B4513' WHERE id = 'ed8ad506-73c2-45a0-ae48-5800307cec1d'; -- Brown

-- Mens Premium Quality Airmix Sandals
UPDATE public.admin_products SET product_group = 'premium-airmix-sandals', color_code = '#000000' WHERE id = '8d7bb30a-389e-4645-8174-26e4108d0235'; -- Black
UPDATE public.admin_products SET product_group = 'premium-airmix-sandals', color_code = '#8B4513' WHERE id = '67a2f9ad-c61f-4498-a8de-627524861401'; -- Brown

-- Chest Bag variants (individual bags, not the combo listing)
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#000000' WHERE id = '066bc835-79c4-4d0e-8b63-f4ddf5f8165a'; -- Black Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#6B3A2A' WHERE id = 'e1438a3c-b921-4b14-af92-ec5335ffbbc4'; -- Premium Brown Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#2D5A3D' WHERE id = '40b28dd1-ac18-4c15-8120-821a28bbf5d7'; -- Premium Green Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#4A7A4A' WHERE id = '458bd0a2-4f73-495b-a568-1a3272f70a1b'; -- Premium Green Plain
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#D2B48C' WHERE id = '7694b524-dc86-4f8e-a616-2664d0525858'; -- Premium Tan Plain
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#5C3317' WHERE id = '60716685-949b-42ee-9299-df179009cff7'; -- Regal Brown Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#7B5B3A' WHERE id = '48038196-fd6f-444f-8a8d-0aa4588b3660'; -- Regal Brown Plain
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#3C1414' WHERE id = 'a3f37b0b-a49c-4045-8795-c1327a017ba5'; -- Regal Choc Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#355E3B' WHERE id = 'c87860b7-1e1e-4a2f-9cba-0aab090daefe'; -- Regal Green Croc
UPDATE public.admin_products SET product_group = 'chest-bag', color_code = '#C4A882' WHERE id = '8c8a566d-a6bc-44ac-a6c6-31072383f9e1'; -- Regal Tan Croc
