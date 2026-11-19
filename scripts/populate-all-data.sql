-- Populate categories with correct schema (id, name, type, created_at, updated_at)
INSERT INTO categories (id, name, type, created_at, updated_at) VALUES
(gen_random_uuid(), 'Blood Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'General Lab Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Heart & Lipid Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Hormone Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Infection Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Molecular Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Stool Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Thyroid Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Urine Tests', 'diagnostic', NOW(), NOW()),
(gen_random_uuid(), 'Vitamin Tests', 'diagnostic', NOW(), NOW());

-- Populate health packages with correct schema (id, name, price, mrp, includes, category_id, description, created_at, updated_at)
INSERT INTO health_packages (id, name, price, mrp, includes, category_id, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'Basic Health Checkup', 999, 1999, ARRAY['CBC', 'Thyroid Profile', 'Lipid Panel']::text[], NULL, 'Preventive health screening package', NOW(), NOW()),
(gen_random_uuid(), 'Diabetes Panel', 899, 1499, ARRAY['Fasting Blood Sugar', 'PP Blood Sugar', 'HbA1c']::text[], NULL, 'Diabetes monitoring package', NOW(), NOW()),
(gen_random_uuid(), 'Thyroid Profile', 499, 799, ARRAY['TSH', 'Free T3', 'Free T4']::text[], NULL, 'Thyroid health panel', NOW(), NOW()),
(gen_random_uuid(), 'Liver Function Package', 799, 1299, ARRAY['SGOT', 'SGPT', 'Alkaline Phosphatase', 'Bilirubin']::text[], NULL, 'Liver health panel', NOW(), NOW()),
(gen_random_uuid(), 'Kidney Function Package', 699, 1199, ARRAY['Creatinine', 'BUN', 'Electrolytes']::text[], NULL, 'Kidney health panel', NOW(), NOW()),
(gen_random_uuid(), 'Heart Risk Panel', 999, 1799, ARRAY['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'Lipoprotein(a)']::text[], NULL, 'Cardiac risk profile', NOW(), NOW()),
(gen_random_uuid(), 'Women Wellness Package', 1499, 2499, ARRAY['Complete Health Check', 'Hormone Panel', 'Bone Health', 'Breast Health']::text[], NULL, 'Women''s preventive health check', NOW(), NOW()),
(gen_random_uuid(), 'Men Wellness Package', 1299, 2199, ARRAY['Complete Health Check', 'Prostate Health', 'Hormonal Profile', 'Cardiac Risk']::text[], NULL, 'Men''s preventive health check', NOW(), NOW()),
(gen_random_uuid(), 'Full Body Checkup', 1999, 3999, ARRAY['70+ Tests', 'Complete Health Analysis', 'Preventive Screening']::text[], NULL, 'Comprehensive body checkup', NOW(), NOW());
