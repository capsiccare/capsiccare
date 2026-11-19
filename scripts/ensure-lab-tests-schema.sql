-- Ensure lab_tests table has the correct structure for the application
-- This migration adds missing columns and ensures proper data types

-- Check if lab_tests table exists, if not create it
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  mrp NUMERIC DEFAULT 0,
  description TEXT DEFAULT '',
  category_id UUID REFERENCES categories(id),
  category TEXT DEFAULT 'General',
  organs TEXT[] DEFAULT ARRAY[]::TEXT[],
  gender TEXT DEFAULT 'all',
  home_collection BOOLEAN DEFAULT true,
  report_time TEXT DEFAULT '24 hours',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  discount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS organs TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'all';
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Ensure health_packages table has correct structure  
CREATE TABLE IF NOT EXISTS health_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  mrp NUMERIC DEFAULT 0,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  category_id UUID REFERENCES categories(id),
  includes TEXT[] DEFAULT ARRAY[]::TEXT[],
  ideal_for TEXT DEFAULT 'Everyone',
  fasting BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS ideal_for TEXT DEFAULT 'Everyone';
ALTER TABLE health_packages ADD COLUMN IF NOT EXISTS fasting BOOLEAN DEFAULT true;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_tests_category ON lab_tests(category);
CREATE INDEX IF NOT EXISTS idx_lab_tests_price ON lab_tests(price);
CREATE INDEX IF NOT EXISTS idx_health_packages_name ON health_packages(name);
CREATE INDEX IF NOT EXISTS idx_health_packages_price ON health_packages(price);
