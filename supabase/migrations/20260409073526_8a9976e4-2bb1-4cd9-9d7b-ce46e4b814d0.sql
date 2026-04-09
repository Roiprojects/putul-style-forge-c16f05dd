
-- Fix all products with empty sizes/colors
-- Crocs/Clogs get Free Size (6-10 range)
UPDATE admin_products SET 
  sizes = ARRAY['6','7','8','9','10'],
  colors = ARRAY[
    CASE 
      WHEN LOWER(name) LIKE '%beige%' THEN 'Beige'
      WHEN LOWER(name) LIKE '%cream%' THEN 'Cream'
      WHEN LOWER(name) LIKE '%grey%' OR LOWER(name) LIKE '%gray%' THEN 'Grey'
      WHEN LOWER(name) LIKE '%white%' THEN 'White'
      WHEN LOWER(name) LIKE '%olive%' OR LOWER(name) LIKE '%green%' THEN 'Green'
      ELSE 'Default'
    END
  ]
WHERE id IN (
  'a370759f-578e-4250-9a90-8356ea4f2499',
  '803d7e0a-2f46-4a12-ba07-c767b7d0a9c1',
  '7af78996-70de-4e37-8d2d-1cdd96edef0f',
  '225d40d8-fc17-472a-9af3-59732c619018',
  'b363dd24-1730-452c-9905-32107345642f',
  'd7493e43-d047-4d28-824a-a65c75beaf5f',
  '3946da68-3b34-43c5-9177-b88943d695b4',
  '11be3e5a-a9b4-4c3c-9bb6-27e8be9d20cd',
  '00d8b37b-56ad-497a-a202-d1b74c3867f9',
  '5dc06886-810e-4a9e-b917-159c8d537375',
  '69d7c7fc-7e03-4c6c-bf50-e13bbdda90e3',
  '4384e290-17cc-4344-b364-1afedfac7a5d',
  '825899a3-4ace-43c1-b0a5-7082d64817e8',
  '4cceeb3c-1395-45cb-a2f0-552023e5eacc'
);

-- Sports shoes & sneakers get sizes 6-10
UPDATE admin_products SET 
  sizes = ARRAY['6','7','8','9','10']
WHERE id IN (
  '621c51cc-468b-4b4a-bde0-9f61c1b40d87',
  'dd0c6b1e-355b-462c-a34d-be24f1dcb8fc',
  'e70ce584-98d7-46cb-b974-2e065576f2e0',
  '107f80bb-77d8-4fb6-b8ae-d567a16f5011',
  'b2a44c61-3fa8-4663-80cd-c5f018b231fc',
  '2571759a-c5b4-46aa-b9bb-6a379c17861a',
  'db20f7bb-5209-49ed-bc69-053d2a2ed9d6',
  '5d24282f-1d45-4c73-8131-c8b8a3ca2c69'
);

-- Set colors for sports shoes/sneakers based on names
UPDATE admin_products SET colors = ARRAY['Brown','Blue'] WHERE id = '621c51cc-468b-4b4a-bde0-9f61c1b40d87';
UPDATE admin_products SET colors = ARRAY['Multi-color'] WHERE id = 'dd0c6b1e-355b-462c-a34d-be24f1dcb8fc';
UPDATE admin_products SET colors = ARRAY['Multi-color'] WHERE id = 'e70ce584-98d7-46cb-b974-2e065576f2e0';
UPDATE admin_products SET colors = ARRAY['Red','White'] WHERE id = '107f80bb-77d8-4fb6-b8ae-d567a16f5011';
UPDATE admin_products SET colors = ARRAY['Tan','Blue'] WHERE id = 'b2a44c61-3fa8-4663-80cd-c5f018b231fc';
UPDATE admin_products SET colors = ARRAY['White'] WHERE id = '2571759a-c5b4-46aa-b9bb-6a379c17861a';
UPDATE admin_products SET colors = ARRAY['White'] WHERE id = 'db20f7bb-5209-49ed-bc69-053d2a2ed9d6';
UPDATE admin_products SET colors = ARRAY['Multi-color'] WHERE id = '5d24282f-1d45-4c73-8131-c8b8a3ca2c69';
