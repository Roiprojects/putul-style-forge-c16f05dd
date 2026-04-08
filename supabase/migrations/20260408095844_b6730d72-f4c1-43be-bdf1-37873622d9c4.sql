
-- Black Premium Sandal: remove tan and brown images
UPDATE admin_products SET images = ARRAY['cat_img/Black_Premium__Sandal_For_Men_UJYH0IXMSM_2026-03-05_1.webp'] WHERE id = 'be236a7e-b4f1-428b-8054-ef63fb9edec4';

-- Brown Premium Pvc Sandal: use brown sandal images only
UPDATE admin_products SET images = ARRAY['cat_img/Brown_Premium_Sandal_For_Men_FBYWKVAXTT_2026-03-05_1.webp', 'cat_img/Brown_Premium_Sandal_For_Men_QL5BQ3DOHU_2026-03-05_2.webp', 'cat_img/Brown_Premium_Sandal_For_Men_4B6DFHZAYP_2026-03-05_3.webp'] WHERE id = '0f2df79d-5538-4c8d-8475-e0c30757c772';

-- Blue Premium Eva Clogs: remove grey/mehandi images
UPDATE admin_products SET images = ARRAY['cat_img/Blue_Premium_Eva_Clogs_For_Men_M46JSNUJOA_2026-02-25_1.webp'] WHERE id = '44478aae-a38d-4d71-bb60-a76b9cbc9dd1';

-- Sky Premium Eva Slides: remove grey/black images
UPDATE admin_products SET images = ARRAY['cat_img/Sky_Premium_Eva_Slides_For_Men_3KV7DSGB6B_2026-02-25_1.webp'] WHERE id = '627b0032-6713-493f-bb51-2b58bafc430b';

-- Beige Premium Eva Slides: remove white/black images
UPDATE admin_products SET images = ARRAY['cat_img/Beige_Premium_Eva_Slides_For_Men_WZY078AUOI_2026-02-26_1.jpeg'] WHERE id = '4bdff974-83fa-4f80-8e09-978417e93f29';

-- Sky Premium Eva Clogs: remove black/white images
UPDATE admin_products SET images = ARRAY['cat_img/Sky_Premium_Eva_Clogs_For_Men_873189XXRO_2026-02-25_1.webp'] WHERE id = '82f4ec51-77b6-4b3c-ae37-5ca36525f4a5';

-- Grey Premium Eva Clogs: keep only grey image
UPDATE admin_products SET images = ARRAY['cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg'] WHERE id = '5eb8d0cf-4e03-4f69-8c6e-f0afb3dfc84d';

-- Brown Mens Airmix Sandals: remove black variant
UPDATE admin_products SET images = ARRAY['cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg', 'cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg'] WHERE id = '67a2f9ad-c61f-4498-a8de-627524861401';

-- Grey Mens Casual Slip-On Eva Clogs: remove white/black variants
UPDATE admin_products SET images = ARRAY['cat_img/Grey_Mens_Casual_Slip_On_Eva_Cloges_Q10CAV6IH3_2026-02-28_1.jpeg'] WHERE id = '1e752e97-e45b-400b-9ae4-8cfde8259f68';

-- Mouse Premium Eva Slides: remove white/black images, keep only mouse
UPDATE admin_products SET images = ARRAY['cat_img/Mouse_Premium_Eva_Slides_For_Men_XSYCYK151O_2026-02-26_1.jpg', 'cat_img/Mouse_Premium_Eva_Slides_For_Men_PN8NU4KCHQ_2026-02-26_2.jpeg'] WHERE id = 'f16b2af5-b700-4492-85bb-3ebe855d2ac8';

-- Grey Premium Eva Slides: check and fix
UPDATE admin_products SET images = ARRAY['cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg'] WHERE id = '46f3ba0a-6243-422b-98a9-6623793f48a7';
