-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type TEXT NOT NULL CHECK (partner_type IN ('health', 'business')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  organization_name TEXT,
  
  -- Address details
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  
  -- Health Partner specific
  profession TEXT, -- Doctor, Nurse, Health Worker, etc.
  qualifications JSONB, -- {degree, institution, year}
  license_number TEXT,
  experience_years INTEGER,
  
  -- Business Partner specific
  business_type TEXT, -- Clinic, Pharmacy, Diagnostic Center, etc.
  registration_number TEXT,
  investment_capacity TEXT, -- "less_than_1l", "1l_to_5l", "5l_to_10l", "more_than_10l"
  expected_volume TEXT, -- "less_than_100", "100_to_500", "500_to_1000", "more_than_1000"
  
  -- Common fields
  cv_url TEXT,
  document_urls JSONB, -- Store multiple document URLs
  bio TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
  partner_code TEXT UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email)
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Restrictions
  applicable_to TEXT[], -- array of test/package IDs, NULL means all
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer logins table (optional)
CREATE TABLE IF NOT EXISTS customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  full_name TEXT,
  phone TEXT,
  
  -- Profile
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  
  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  
  -- Account management
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_sent_at TIMESTAMP,
  
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer reports table
CREATE TABLE IF NOT EXISTS customer_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE SET NULL,
  
  -- Booking details
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  
  -- Tests/Reports
  tests JSONB NOT NULL, -- array of test details
  total_amount DECIMAL(10,2),
  
  -- Report status
  collection_date TIMESTAMP,
  collection_completed_at TIMESTAMP,
  report_generated_at TIMESTAMP,
  report_sent_at TIMESTAMP,
  
  -- Report file
  report_url TEXT,
  report_file_name TEXT,
  
  -- Additional info
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'processing', 'completed', 'cancelled')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (update existing if needed)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  date_of_birth DATE,
  gender TEXT,
  
  tests JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  
  -- Partner and promo tracking
  partner_code TEXT REFERENCES partners(partner_code),
  promo_code TEXT REFERENCES promo_codes(code),
  discount_applied DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2),
  
  -- Status and collection
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'collected', 'cancelled')),
  collection_date TIMESTAMP,
  collection_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_code ON partners(partner_code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_bookings_partner ON bookings(partner_code);
CREATE INDEX idx_bookings_promo ON bookings(promo_code);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_customer_accounts_email ON customer_accounts(email);
CREATE INDEX idx_customer_reports_booking ON customer_reports(booking_id);
CREATE INDEX idx_customer_reports_status ON customer_reports(status);
