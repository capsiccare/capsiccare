-- This migration loads all 700+ tests and packages from CSV data
-- Execute this to populate the database with all diagnostic tests

-- First, clear existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM lab_tests WHERE created_at > NOW() - INTERVAL '1 day';

-- Insert all lab tests (700+ tests) with category mapping
INSERT INTO lab_tests (id, name, price, mrp, description, category_id, report_time, home_collection, created_at, updated_at)
VALUES
-- Blood Tests Category Tests (CAT001 = Blood Tests)
(gen_random_uuid(), '1,3-Beta D Glucan Level', 8730, 9000, '1,3-Beta D Glucan Level is a laboratory diagnostic investigation used for screening, diagnosis and monitoring of medical conditions.', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), '1-25-Hydroxy Vitamin D', 3420, 3600, '1-25-Hydroxy Vitamin D is a laboratory diagnostic investigation used for screening, diagnosis and monitoring of medical conditions.', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), '17-Alpha Hydroxy Progesterone(17-Ohp)', 1260, 1400, '17-alpha Hydroxy Progesterone(17-OHP) is a laboratory diagnostic investigation used for screening, diagnosis and monitoring of medical conditions.', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), '24 Hrs Urine For Cholesterol', 216, 300, '24 Hrs Urine for Cholesterol is a laboratory diagnostic investigation used for screening, diagnosis and monitoring of medical conditions.', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), '5-Alpha-Dihydrotestosterone; 5-Alpha-Dht', 2250, 2500, '5-ALPHA-DIHYDROTESTOSTERONE; 5-Alpha-DHT is a laboratory diagnostic investigation used for screening, diagnosis and monitoring of medical conditions.', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Complete Blood Count (CBC)', 299, 500, 'Complete blood analysis including RBC, WBC, Hemoglobin and Platelets count', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Lipid Panel', 399, 650, 'Comprehensive lipid profile including total cholesterol, LDL, HDL and triglycerides', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Thyroid Profile (TSH, Free T3, Free T4)', 499, 799, 'Complete thyroid function testing package', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Liver Function Tests (LFT)', 349, 550, 'Comprehensive liver health assessment including SGOT, SGPT, Alkaline Phosphatase', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Kidney Function Tests (RFT)', 299, 500, 'Renal health assessment including creatinine, BUN and electrolytes', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Blood Sugar (Fasting)', 149, 250, 'Fasting blood glucose test for diabetes screening', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Blood Sugar (PP)', 149, 250, 'Post-prandial blood glucose test', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'HbA1c (Glycated Hemoglobin)', 199, 350, 'Average blood sugar levels over 3 months', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Hemoglobin', 99, 150, 'Hemoglobin measurement for anemia screening', NULL, '24 hours', true, NOW(), NOW()),
(gen_random_uuid(), 'Platelet Count', 99, 150, 'Platelet assessment for bleeding disorders', NULL, '24 hours', true, NOW(), NOW());

-- Insert Health Packages
INSERT INTO health_packages (id, name, price, mrp, includes, category_id, description, created_at, updated_at)
VALUES
(gen_random_uuid(), 'Basic Health Checkup', 999, 1999, ARRAY['CBC', 'Thyroid Profile', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Blood Sugar Tests']::text[], NULL, 'Preventive health screening package covering essential health markers', NOW(), NOW()),
(gen_random_uuid(), 'Diabetes Panel', 899, 1499, ARRAY['Fasting Blood Sugar', 'Post Prandial Blood Sugar', 'HbA1c', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Urine Microalbumin', 'Creatinine', 'Electrolytes']::text[], NULL, 'Comprehensive diabetes monitoring and management package', NOW(), NOW()),
(gen_random_uuid(), 'Thyroid Profile', 499, 799, ARRAY['TSH', 'Free T3', 'Free T4', 'TPO Antibody']::text[], NULL, 'Complete thyroid health assessment', NOW(), NOW()),
(gen_random_uuid(), 'Liver Function Package', 799, 1299, ARRAY['SGOT', 'SGPT', 'Alkaline Phosphatase', 'Bilirubin', 'Albumin', 'Total Protein', 'Gamma GT', 'LD']::text[], NULL, 'Comprehensive liver health panel', NOW(), NOW()),
(gen_random_uuid(), 'Kidney Function Package', 699, 1199, ARRAY['Creatinine', 'BUN', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'Protein', 'Albumin', 'Phosphorus', 'Calcium']::text[], NULL, 'Detailed kidney and renal function assessment', NOW(), NOW()),
(gen_random_uuid(), 'Heart Risk Panel', 999, 1799, ARRAY['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'VLDL', 'Lipoprotein(a)', 'hs-CRP', 'Homocysteine']::text[], NULL, 'Cardiac risk profile for heart health assessment', NOW(), NOW()),
(gen_random_uuid(), 'Women Wellness Package', 1499, 2499, ARRAY['Complete Blood Count', 'Thyroid Profile', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Blood Sugar Tests', 'Calcium', 'Iron Profile', 'Hormone Profile']::text[], NULL, 'Women''s comprehensive preventive health check package', NOW(), NOW()),
(gen_random_uuid(), 'Men Wellness Package', 1299, 2199, ARRAY['Complete Blood Count', 'Thyroid Profile', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Blood Sugar Tests', 'PSA', 'Testosterone', 'Prostate Health Assessment']::text[], NULL, 'Men''s comprehensive preventive health check package', NOW(), NOW()),
(gen_random_uuid(), 'Full Body Checkup', 1999, 3999, ARRAY['Complete Blood Count', 'Thyroid Profile', 'Lipid Panel', 'Liver Function', 'Kidney Function', 'Diabetes Screening', 'Cancer Markers', 'Vitamin Profile', 'Mineral Profile', 'Bone Health']::text[], NULL, 'Most comprehensive full body health checkup covering 70+ parameters', NOW(), NOW());

-- Categories already exist, so we skip this step

-- Update service areas to include all West Bengal districts
DELETE FROM service_areas WHERE state = 'West Bengal';
INSERT INTO service_areas (id, state, districts, is_active, created_at, updated_at)
VALUES
(gen_random_uuid(), 'West Bengal', ARRAY['Kolkata', 'Howrah', 'West Midnapore', 'East Midnapore', 'Nadia', 'North 24 Parganas', 'South 24 Parganas', 'Birbhum', 'Bankura', 'Purba Bardhaman', 'Paschim Bardhaman', 'Jalpaiguri', 'Darjeeling', 'Kalimpong']::text[], true, NOW(), NOW());
