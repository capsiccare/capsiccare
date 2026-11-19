-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'test' or 'package'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lab_tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  home_collection BOOLEAN DEFAULT true,
  report_time VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_packages table
CREATE TABLE IF NOT EXISTS health_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  includes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR(255),
  category VARCHAR(100),
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table to track added items (for color state)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  test_id UUID REFERENCES lab_tests(id) ON DELETE CASCADE,
  package_id UUID REFERENCES health_packages(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'added', -- 'added', 'purchased'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_lab_tests_category ON lab_tests(category_id);
CREATE INDEX idx_health_packages_category ON health_packages(category_id);
CREATE INDEX idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX idx_cart_items_session ON cart_items(session_id);

-- Insert default categories
INSERT INTO categories (name, type) VALUES
  ('Blood Work', 'test'),
  ('Cardiac Health', 'test'),
  ('Allergy Testing', 'test'),
  ('Vitamin & Mineral', 'test'),
  ('Basic Checkup', 'package'),
  ('Premium Checkup', 'package'),
  ('Disease Specific', 'package')
ON CONFLICT (name) DO NOTHING;

-- Insert sample lab tests
INSERT INTO lab_tests (name, price, mrp, category_id, description, features, report_time) 
SELECT 
  'Complete Blood Count (CBC)',
  249,
  499,
  (SELECT id FROM categories WHERE name = 'Blood Work'),
  'Comprehensive blood count analysis including RBC, WBC, and platelets.',
  ARRAY['26 Parameters', 'Home Collection', 'Report in 24hrs'],
  '24 hours'
WHERE NOT EXISTS (SELECT 1 FROM lab_tests WHERE name = 'Complete Blood Count (CBC)');

INSERT INTO lab_tests (name, price, mrp, category_id, description, features, report_time) 
SELECT 
  'Lipid Profile',
  399,
  599,
  (SELECT id FROM categories WHERE name = 'Cardiac Health'),
  'Complete cholesterol and lipid analysis.',
  ARRAY['4 Parameters', 'Home Collection', 'Report in 24hrs'],
  '24 hours'
WHERE NOT EXISTS (SELECT 1 FROM lab_tests WHERE name = 'Lipid Profile');

INSERT INTO lab_tests (name, price, mrp, category_id, description, features, report_time) 
SELECT 
  'Thyroid Function Test',
  349,
  549,
  (SELECT id FROM categories WHERE name = 'Vitamin & Mineral'),
  'Check thyroid function with TSH, T3, and T4 levels.',
  ARRAY['3 Parameters', 'Home Collection', 'Report in 24hrs'],
  '24 hours'
WHERE NOT EXISTS (SELECT 1 FROM lab_tests WHERE name = 'Thyroid Function Test');

INSERT INTO lab_tests (name, price, mrp, category_id, description, features, report_time) 
SELECT 
  'Cardiac Enzymes (Troponin I)',
  849,
  1199,
  (SELECT id FROM categories WHERE name = 'Cardiac Health'),
  'Detect cardiac markers for heart attack risk assessment.',
  ARRAY['2 Parameters', 'Home Collection', 'Report in 24hrs'],
  '24 hours'
WHERE NOT EXISTS (SELECT 1 FROM lab_tests WHERE name = 'Cardiac Enzymes (Troponin I)');

-- Insert sample blog articles
INSERT INTO blog_articles (title, slug, content, excerpt, author, category, featured) 
SELECT 
  'Understanding CBC Test: A Complete Guide',
  'understanding-cbc-test',
  'Complete Blood Count (CBC) is one of the most common blood tests performed in medical practice. This comprehensive guide explains what CBC measures, why it is important, and how to interpret the results.',
  'Learn about Complete Blood Count testing and what your CBC results mean.',
  'Dr. Rajesh Kumar',
  'Health Advice',
  true
WHERE NOT EXISTS (SELECT 1 FROM blog_articles WHERE slug = 'understanding-cbc-test');

INSERT INTO blog_articles (title, slug, content, excerpt, author, category, featured) 
SELECT 
  'Thyroid Health: Everything You Need to Know',
  'thyroid-health-guide',
  'The thyroid is a small gland in your neck that produces hormones controlling metabolism, heart rate, and body temperature. Understand thyroid disorders and the importance of TSH testing.',
  'Complete guide to thyroid health and hormone testing.',
  'Dr. Priya Sharma',
  'Health Advice',
  true
WHERE NOT EXISTS (SELECT 1 FROM blog_articles WHERE slug = 'thyroid-health-guide');
