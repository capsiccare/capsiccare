-- ==============================================================================
-- CAPSIC CARE OS — MIGRATION 008: BILLING, POS & DIAGNOSTICS ENGINE
-- ==============================================================================
-- Scope: Invoices, Invoice Items, Payments, Refunds, Cash Counter Sessions,
--        Tax Classifications, Home Collection Rules, Diagnostic Reports & Promotions
-- Monetary Units: Strictly integer paise throughout (e.g. 100 INR = 10,000 paise)
-- ==============================================================================

-- 1. Tax Classifications (GST Engine)
CREATE TABLE IF NOT EXISTS tax_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  rate_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  cgst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  sgst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  igst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  is_exempt BOOLEAN NOT NULL DEFAULT true,
  hsn_sac VARCHAR(20) DEFAULT '999312',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_class_code ON tax_classifications(code);
CREATE INDEX IF NOT EXISTS idx_tax_class_active ON tax_classifications(is_active);

-- Enable RLS
ALTER TABLE tax_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active tax classifications"
  ON tax_classifications FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated full access to tax classifications"
  ON tax_classifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to tax classifications"
  ON tax_classifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Home Collection Fee Rules
CREATE TABLE IF NOT EXISTS home_collection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  base_fee_paise INT NOT NULL DEFAULT 10000 CHECK (base_fee_paise >= 0),
  free_threshold_paise INT NOT NULL DEFAULT 100000 CHECK (free_threshold_paise >= 0),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_col_rules_branch ON home_collection_rules(branch_id, is_active);

ALTER TABLE home_collection_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read to active home collection rules"
  ON home_collection_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated full access to home collection rules"
  ON home_collection_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to home collection rules"
  ON home_collection_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Promotions & Discounts Master
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INT NOT NULL CHECK (discount_value > 0),
  min_order_paise INT DEFAULT 0 CHECK (min_order_paise >= 0),
  max_discount_paise INT,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  usage_limit INT DEFAULT 1000,
  times_used INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active promotions"
  ON promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated full access to promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to promotions"
  ON promotions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Cash Counter Sessions (Shift Reconciliation)
CREATE TABLE IF NOT EXISTS cash_counter_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_balance_paise INT NOT NULL DEFAULT 0 CHECK (opening_balance_paise >= 0),
  cash_collected_paise INT NOT NULL DEFAULT 0 CHECK (cash_collected_paise >= 0),
  cash_refunded_paise INT NOT NULL DEFAULT 0 CHECK (cash_refunded_paise >= 0),
  expected_closing_paise INT GENERATED ALWAYS AS (opening_balance_paise + cash_collected_paise - cash_refunded_paise) STORED,
  actual_closing_paise INT CHECK (actual_closing_paise IS NULL OR actual_closing_paise >= 0),
  variance_paise INT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'verified')),
  closing_notes TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_sessions_branch ON cash_counter_sessions(branch_id, session_date);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_counter_sessions(status);

ALTER TABLE cash_counter_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to cash counter sessions"
  ON cash_counter_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to cash counter sessions"
  ON cash_counter_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Unified Invoices Master (Consultations & Diagnostics)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnostic_order_id UUID REFERENCES diagnostic_orders(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal_paise INT NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  discount_paise INT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  tax_paise INT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  total_paise INT NOT NULL DEFAULT 0 CHECK (total_paise >= 0),
  paid_paise INT NOT NULL DEFAULT 0 CHECK (paid_paise >= 0),
  balance_paise INT GENERATED ALWAYS AS (total_paise - paid_paise) STORED,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'refunded')
  ),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')
  ),
  promo_code VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch ON invoices(branch_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(diagnostic_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_apt ON invoices(appointment_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to invoices"
  ON invoices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(30) NOT NULL CHECK (
    item_type IN ('consultation', 'test', 'package', 'home_collection', 'other')
  ),
  reference_id UUID,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_paise INT NOT NULL CHECK (unit_price_paise >= 0),
  discount_paise INT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  tax_paise INT NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
  total_paise INT NOT NULL CHECK (total_paise >= 0),
  tax_classification_id UUID REFERENCES tax_classifications(id),
  hsn_sac VARCHAR(20) DEFAULT '999312',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to invoice items"
  ON invoice_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to invoice items"
  ON invoice_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Payments Master
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  amount_paise INT NOT NULL CHECK (amount_paise > 0),
  payment_method VARCHAR(30) NOT NULL CHECK (
    payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'cheque')
  ),
  transaction_reference VARCHAR(100),
  notes TEXT,
  cash_counter_session_id UUID REFERENCES cash_counter_sessions(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES profiles(id),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch ON payments(branch_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(cash_counter_session_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to payments"
  ON payments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to payments"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. Refunds Master
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  amount_paise INT NOT NULL CHECK (amount_paise > 0),
  refund_method VARCHAR(30) NOT NULL CHECK (
    refund_method IN ('cash', 'upi', 'original_payment_method')
  ),
  reason TEXT NOT NULL,
  cash_counter_session_id UUID REFERENCES cash_counter_sessions(id) ON DELETE SET NULL,
  authorized_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_invoice ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_branch ON refunds(branch_id);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to refunds"
  ON refunds FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to refunds"
  ON refunds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. Diagnostic Reports Master
CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES diagnostic_order_items(id) ON DELETE SET NULL,
  report_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'received_from_lab', 'verified', 'ready_for_delivery', 'delivered')
  ),
  file_url TEXT,
  file_name VARCHAR(255),
  file_size_bytes INT,
  clinical_notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diag_reports_order ON diagnostic_reports(order_id);
CREATE INDEX IF NOT EXISTS idx_diag_reports_status ON diagnostic_reports(status);

ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to diagnostic reports"
  ON diagnostic_reports FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to diagnostic reports"
  ON diagnostic_reports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 10. Seed Initial Tax Classifications, Home Collection Rules & Promotions
INSERT INTO tax_classifications (organization_id, code, name, rate_percent, cgst_percent, sgst_percent, igst_percent, is_exempt, hsn_sac, description)
SELECT 
  id,
  'HEALTHCARE_EXEMPT',
  'Healthcare Diagnostic & Clinical Services (Exempt)',
  0.00, 0.00, 0.00, 0.00,
  true,
  '999312',
  'Exempt under GST Notification No. 12/2017-Central Tax (Rate) covering clinical diagnosis, care and treatments'
FROM organizations
LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO tax_classifications (organization_id, code, name, rate_percent, cgst_percent, sgst_percent, igst_percent, is_exempt, hsn_sac, description)
SELECT 
  id,
  'GST_18',
  'Non-Exempt Medical Consumables / Sanitization (18% GST)',
  18.00, 9.00, 9.00, 18.00,
  false,
  '999319',
  'Standard rate applicable to non-exempt medical consumables and ancillary equipment supplies'
FROM organizations
LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO home_collection_rules (organization_id, branch_id, base_fee_paise, free_threshold_paise)
SELECT 
  o.id,
  NULL,
  10000, -- ₹100 standard
  100000 -- Free on order value ₹1,000 and above
FROM organizations o
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO promotions (organization_id, code, discount_type, discount_value, min_order_paise, max_discount_paise, usage_limit)
SELECT 
  o.id,
  'WELCOME10',
  'percentage',
  10, -- 10% discount
  50000, -- Min order ₹500
  25000, -- Max discount ₹250
  5000
FROM organizations o
LIMIT 1
ON CONFLICT (code) DO NOTHING;
