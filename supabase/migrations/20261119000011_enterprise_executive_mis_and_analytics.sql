-- ============================================================================
-- CAPSIC CARE OS — STEP 09 MIGRATION: ENTERPRISE EXECUTIVE MIS & DECISION ANALYTICS
-- Migration: 20261119000011_enterprise_executive_mis_and_analytics.sql
-- Description: Creates business targets, operating expenses, decision alerts,
--              custom report templates, and export jobs for Executive MIS.
-- ============================================================================

-- 1. Business Targets & Operational Budgets
CREATE TABLE IF NOT EXISTS business_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  target_metric VARCHAR(80) NOT NULL, -- e.g. 'monthly_revenue', 'monthly_collections', 'opd_visits', 'diagnostic_orders', 'new_patients', 'follow_up_rate', 'patient_satisfaction'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_value NUMERIC(14, 2) NOT NULL,
  responsible_owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_targets_metric ON business_targets(target_metric);
CREATE INDEX IF NOT EXISTS idx_business_targets_period ON business_targets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_business_targets_branch ON business_targets(branch_id);

-- 2. Operating Expenses & Cost Accounting
CREATE TABLE IF NOT EXISTS operating_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  expense_category VARCHAR(60) NOT NULL, -- 'doctor_professional_fees', 'laboratory_costs', 'phlebotomist_costs', 'payment_processing', 'medical_consumables', 'staff_salaries', 'marketing_advertising', 'rent', 'utilities', 'software_subscriptions', 'other_operating'
  expense_type VARCHAR(20) NOT NULL DEFAULT 'variable' CHECK (expense_type IN ('direct', 'variable', 'fixed')),
  amount_inr NUMERIC(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  vendor_name VARCHAR(150),
  invoice_reference VARCHAR(100),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_method VARCHAR(30) DEFAULT 'bank_transfer',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operating_expenses_cat ON operating_expenses(expense_category);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_branch ON operating_expenses(branch_id);

-- 3. Decision Intelligence & Rules-Based Management Alerts
CREATE TABLE IF NOT EXISTS decision_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  alert_rule_code VARCHAR(80) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  metric_name VARCHAR(80) NOT NULL,
  current_value NUMERIC(14, 2),
  threshold_value NUMERIC(14, 2),
  drilldown_url VARCHAR(255),
  action_recommendation TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_alerts_status ON decision_alerts(status);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_severity ON decision_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_decision_alerts_branch ON decision_alerts(branch_id);

-- 4. Custom Report Templates & Definitions
CREATE TABLE IF NOT EXISTS custom_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'financial', 'clinical_opd', 'diagnostics', 'patient_continuity', 'workforce', 'marketing'
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_cat ON custom_report_templates(category);

-- 5. Report Export Jobs & Audit Records
CREATE TABLE IF NOT EXISTS report_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_title VARCHAR(150) NOT NULL,
  report_type VARCHAR(60) NOT NULL,
  file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('csv', 'xlsx', 'pdf')),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_payload TEXT,
  file_size_bytes INT DEFAULT 0,
  filters_applied JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_report_export_jobs_status ON report_export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_report_export_jobs_created ON report_export_jobs(created_at);

-- 6. Enable Row Level Security (RLS) on all new tables
ALTER TABLE business_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_export_jobs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
CREATE POLICY "Allow all authenticated users access to business_targets"
  ON business_targets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users access to operating_expenses"
  ON operating_expenses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users access to decision_alerts"
  ON decision_alerts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users access to custom_report_templates"
  ON custom_report_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users access to report_export_jobs"
  ON report_export_jobs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Seed Baseline Business Targets, Expenses, Decision Alerts and Report Templates
DO $$
DECLARE
  v_org_id UUID;
  v_branch_main UUID;
  v_branch_south UUID;
  v_admin_id UUID;
  v_current_month_start DATE;
  v_current_month_end DATE;
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_branch_main FROM branches WHERE code = 'BR-KOL-MAIN' LIMIT 1;
  SELECT id INTO v_branch_south FROM branches WHERE code = 'BR-KOL-SOUTH' LIMIT 1;
  SELECT id INTO v_admin_id FROM profiles LIMIT 1;

  v_current_month_start := date_trunc('month', CURRENT_DATE)::DATE;
  v_current_month_end := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::DATE;

  IF v_org_id IS NOT NULL THEN
    -- Seed Targets
    INSERT INTO business_targets (organization_id, branch_id, target_metric, period_start, period_end, target_value, notes)
    VALUES
      (v_org_id, v_branch_main, 'monthly_revenue', v_current_month_start, v_current_month_end, 500000.00, 'Main Branch ₹5 Lakh Monthly Revenue Target'),
      (v_org_id, v_branch_main, 'monthly_collections', v_current_month_start, v_current_month_end, 480000.00, 'Main Branch Cash & Digital Collection Target'),
      (v_org_id, v_branch_main, 'opd_visits', v_current_month_start, v_current_month_end, 400.00, 'Target: 400 Consultation Visits'),
      (v_org_id, v_branch_main, 'diagnostic_orders', v_current_month_start, v_current_month_end, 250.00, 'Target: 250 Diagnostic Orders'),
      (v_org_id, v_branch_main, 'patient_satisfaction', v_current_month_start, v_current_month_end, 92.00, 'Minimum 92% Patient Satisfaction SLA'),
      (v_org_id, v_branch_south, 'monthly_revenue', v_current_month_start, v_current_month_end, 300000.00, 'South Branch ₹3 Lakh Monthly Revenue Target')
    ON CONFLICT DO NOTHING;

    -- Seed Verified Expenses
    INSERT INTO operating_expenses (organization_id, branch_id, expense_category, expense_type, amount_inr, expense_date, vendor_name, invoice_reference, payment_status, notes)
    VALUES
      (v_org_id, v_branch_main, 'doctor_professional_fees', 'direct', 45000.00, CURRENT_DATE - 5, 'Visiting Specialist Retainers', 'EXP-MED-001', 'paid', 'Bi-weekly doctor fees paid'),
      (v_org_id, v_branch_main, 'laboratory_costs', 'direct', 28500.00, CURRENT_DATE - 4, 'Thyrocare Partner Lab', 'EXP-LAB-891', 'paid', 'External specialized referral test processing'),
      (v_org_id, v_branch_main, 'medical_consumables', 'variable', 12400.00, CURRENT_DATE - 6, 'SurgiCare India', 'EXP-CON-104', 'paid', 'Vacutainers, needles, alcohol swabs, gloves'),
      (v_org_id, v_branch_main, 'phlebotomist_costs', 'variable', 8500.00, CURRENT_DATE - 3, 'Fleet Phlebotomists', 'EXP-PHL-023', 'paid', 'Per-sample collection allowance & travel'),
      (v_org_id, v_branch_main, 'payment_processing', 'variable', 3200.00, CURRENT_DATE - 2, 'Razorpay Payment Gateway', 'EXP-PG-044', 'paid', 'MDR transaction processing fee'),
      (v_org_id, v_branch_main, 'rent', 'fixed', 65000.00, v_current_month_start, 'Lake Road Commercial Estates', 'EXP-RNT-001', 'paid', 'Main Clinic Premise Lease'),
      (v_org_id, v_branch_main, 'utilities', 'fixed', 14200.00, CURRENT_DATE - 8, 'CESC Electric Supply', 'EXP-UTL-002', 'paid', 'Electricity and backup diesel generator'),
      (v_org_id, v_branch_main, 'staff_salaries', 'fixed', 110000.00, v_current_month_start, 'Staff Payroll Acct', 'EXP-SAL-001', 'paid', 'Receptionists, clinic assistants, phlebotomists'),
      (v_org_id, v_branch_main, 'marketing_advertising', 'variable', 18000.00, CURRENT_DATE - 7, 'Meta Ads / Google Local', 'EXP-MKT-011', 'paid', 'Local search & preventive checkup campaign')
    ON CONFLICT DO NOTHING;

    -- Seed Active Decision Alerts
    INSERT INTO decision_alerts (organization_id, branch_id, alert_rule_code, severity, title, description, metric_name, current_value, threshold_value, drilldown_url, action_recommendation, status)
    VALUES
      (
        v_org_id, v_branch_main, 'CASH_VARIANCE_WARNING', 'warning',
        'Cash Reconciliation Variance Exceeded',
        'Physical cash counted at the main reception counter ended with a ₹250 variance against system billing transactions.',
        'cash_variance', 250.00, 100.00, '/admin/billing',
        'Supervisor should review Cash Counter Session #CS-01 and verify physical vouchers before closing ledger.',
        'active'
      ),
      (
        v_org_id, v_branch_main, 'DIAGNOSTIC_TAT_SLA_BREACH', 'critical',
        'Diagnostic Report Verification Delay',
        '3 HbA1c and Lipid Panel reports from yesterday have exceeded the 24-hour turnaround SLA.',
        'diagnostic_overdue_hours', 27.50, 24.00, '/admin/diagnostics',
        'Notify duty biochemist and pathologist for expedited sign-off and trigger auto-delivery to patients.',
        'active'
      ),
      (
        v_org_id, v_branch_main, 'FOLLOWUP_BACKLOG_ACCUMULATION', 'info',
        'Post-Consultation Follow-Up Queue Alert',
        '14 follow-up call tasks are pending execution for patients seen 3 days ago.',
        'careflow_pending_tasks', 14.00, 10.00, '/admin/careflow/calls',
        'Assign temporary tele-caller quota to afternoon shift desk to clear 3-day recovery queue.',
        'active'
      )
    ON CONFLICT DO NOTHING;

    -- Seed Custom Report Templates
    INSERT INTO custom_report_templates (organization_id, name, category, description, config, is_public)
    VALUES
      (
        v_org_id, 'Monthly Executive Revenue & Margin Summary', 'financial',
        'Invoiced revenue, collected payments, direct medical costs, and contribution margins broken down by service category.',
        '{"metrics": ["gross_billed", "collected", "direct_costs", "gross_margin_pct"], "dimensions": ["service_type", "branch"], "timeframe": "current_month"}'::JSONB,
        true
      ),
      (
        v_org_id, 'Doctor OPD Productivity & Revenue Contribution', 'clinical_opd',
        'Consultation volumes, cancellation rates, avg waiting times, and revenue contribution per consulting physician.',
        '{"metrics": ["appointments_attended", "cancellation_rate", "avg_waiting_minutes", "consultation_revenue"], "dimensions": ["doctor"], "timeframe": "last_30_days"}'::JSONB,
        true
      ),
      (
        v_org_id, 'Diagnostic Lab Turnaround Time & Volume Audit', 'diagnostics',
        'Test order volumes, sample collection TAT, verification bottlenecks, and home collection share.',
        '{"metrics": ["total_orders", "tests_completed", "avg_tat_hours", "sla_compliance_pct"], "dimensions": ["category", "collection_type"], "timeframe": "last_30_days"}'::JSONB,
        true
      ),
      (
        v_org_id, 'Patient Retention & Cohort Continuity Tracker', 'patient_continuity',
        'Repeat consultation rates, 30/60/90-day retention curves, and CareFlow enrolled vs non-enrolled cohort outcomes.',
        '{"metrics": ["total_patients", "repeat_rate", "day_30_retention", "day_90_retention"], "dimensions": ["cohort_month"], "timeframe": "current_financial_year"}'::JSONB,
        true
      )
    ON CONFLICT DO NOTHING;

  END IF;
END $$;
