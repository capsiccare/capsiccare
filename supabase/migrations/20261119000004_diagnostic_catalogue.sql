-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 004: DIAGNOSTIC CATALOGUE
-- ==============================================================================
-- Scope: Categories, Lab Tests, Health Packages, Package Items, and Price History
-- Monetary Units: Integer paise (e.g. 249 INR = 24,900 paise)
-- Features: Immutable price snapshots, validity windows, branch-level price overrides
-- ==============================================================================

-- 1. Diagnostic Categories
CREATE TABLE IF NOT EXISTS diagnostic_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_categories_slug ON diagnostic_categories(slug);
CREATE INDEX IF NOT EXISTS idx_diag_categories_org ON diagnostic_categories(organization_id);

-- 2. Diagnostic Tests
CREATE TABLE IF NOT EXISTS diagnostic_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE, -- Stable identifier (e.g. 'T001', 'CBC')
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id UUID REFERENCES diagnostic_categories(id) ON DELETE SET NULL,
  sample_type VARCHAR(100) NOT NULL DEFAULT 'Blood',
  specimen_volume VARCHAR(100),
  fasting_required BOOLEAN NOT NULL DEFAULT false,
  fasting_hours INT NOT NULL DEFAULT 0,
  turnaround_hours INT NOT NULL DEFAULT 24,
  home_collection_supported BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  prerequisites TEXT,
  clinical_significance TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_tests_slug ON diagnostic_tests(slug);
CREATE INDEX IF NOT EXISTS idx_diag_tests_code ON diagnostic_tests(code);
CREATE INDEX IF NOT EXISTS idx_diag_tests_category ON diagnostic_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_diag_tests_active ON diagnostic_tests(is_active);

-- 3. Diagnostic Packages (Full Body / Panel Bundles)
CREATE TABLE IF NOT EXISTS diagnostic_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'PKG-BASIC-01'
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  badge VARCHAR(50) DEFAULT 'POPULAR',
  target_audience VARCHAR(100),
  description TEXT,
  prerequisites TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_packages_slug ON diagnostic_packages(slug);
CREATE INDEX IF NOT EXISTS idx_diag_packages_code ON diagnostic_packages(code);

-- 4. Diagnostic Package Items (Tests contained within package)
CREATE TABLE IF NOT EXISTS diagnostic_package_items (
  package_id UUID NOT NULL REFERENCES diagnostic_packages(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES diagnostic_tests(id) ON DELETE RESTRICT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (package_id, test_id)
);

CREATE INDEX IF NOT EXISTS idx_diag_pkg_items_test ON diagnostic_package_items(test_id);

-- 5. Diagnostic Prices (Immutable price snapshots with history and branch overrides)
CREATE TABLE IF NOT EXISTS diagnostic_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT, -- NULL = Org-wide standard rate
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('test', 'package')),
  test_id UUID REFERENCES diagnostic_tests(id) ON DELETE CASCADE,
  package_id UUID REFERENCES diagnostic_packages(id) ON DELETE CASCADE,
  price_paise INT NOT NULL CHECK (price_paise >= 0),
  mrp_paise INT NOT NULL CHECK (mrp_paise >= price_paise),
  discount_paise INT GENERATED ALWAYS AS (mrp_paise - price_paise) STORED,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ, -- NULL means actively effective price
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure item_type strictly matches the populated foreign key
  CHECK (
    (item_type = 'test' AND test_id IS NOT NULL AND package_id IS NULL) OR
    (item_type = 'package' AND package_id IS NOT NULL AND test_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_diag_prices_test ON diagnostic_prices(test_id, is_active, valid_to);
CREATE INDEX IF NOT EXISTS idx_diag_prices_package ON diagnostic_prices(package_id, is_active, valid_to);
CREATE INDEX IF NOT EXISTS idx_diag_prices_lookup ON diagnostic_prices(organization_id, branch_id, item_type, is_active);
