import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function parseCSV(filePath) {
  return Papa.parse(fs.readFileSync(filePath, 'utf8'), { header: true, skipEmptyLines: true }).data;
}

function writeCSV(filePath, data) {
  fs.writeFileSync(filePath, Papa.unparse(data));
}

const testsCsvPath = path.join(projectRoot, 'public', 'data', 'tests.csv');
const pkgsCsvPath = path.join(projectRoot, 'public', 'data', 'packages.csv');
const pkgTestsCsvPath = path.join(projectRoot, 'public', 'data', 'package-tests.csv');

const allTests = parseCSV(testsCsvPath).filter(t => t.test_id);

const packagesConfig = [
  {
    id: 'PKG001',
    name: 'Complete Whole Body Wellness Profile',
    slug: 'complete-whole-body-wellness-profile',
    description: 'Comprehensive head-to-toe screening covering all major organs and metabolic markers.',
    status: 'Active',
    fasting_required: 'Yes',
    turnaround_time: '24 hours',
    logic: (t) => t.category_id === 'CAT_HEART' || t.category_id === 'CAT_LIVER' || t.category_id === 'CAT_KIDNEY' || String(t.test_name).match(/Hemogram|CBC|Glucose|TSH|Cholesterol/i)
  },
  {
    id: 'PKG002',
    name: 'Premium Cardiac Risk Panel',
    slug: 'premium-cardiac-risk-panel',
    description: 'Advanced assessment of your heart health, lipid profile, and cardiovascular risk factors.',
    status: 'Active',
    fasting_required: 'Yes',
    turnaround_time: '24 hours',
    logic: (t) => t.category_id === 'CAT_HEART' || String(t.test_name).match(/Lipid|Cholesterol|Apolipoprotein|Triglycerides|CRP/i)
  },
  {
    id: 'PKG003',
    name: 'Comprehensive Diabetic Care Profile',
    slug: 'comprehensive-diabetic-care-profile',
    description: 'Vital parameters to monitor and manage diabetes, including critical organ health impact.',
    status: 'Active',
    fasting_required: 'Yes',
    turnaround_time: '24-48 hours',
    logic: (t) => t.category_id === 'CAT_DIABETES' || String(t.test_name).match(/Glucose|HbA1c|Microalbumin|Insulin|C-Peptide|Creatinine/i)
  },
  {
    id: 'PKG004',
    name: 'Senior Citizen Health Check (Male)',
    slug: 'senior-citizen-health-check-male',
    description: 'Tailored health assessment for men over 60, covering prostate, heart, and metabolic wellness.',
    status: 'Active',
    fasting_required: 'Yes',
    turnaround_time: '48 hours',
    logic: (t) => String(t.test_name).match(/PSA|Prostate|Testosterone|Lipid|Calcium|CBC|Urea|Creatinine/i)
  },
  {
    id: 'PKG005',
    name: 'Senior Citizen Health Check (Female)',
    slug: 'senior-citizen-health-check-female',
    description: 'Specialized diagnostic panel for women over 60, focusing on bone density, thyroid, and organ function.',
    status: 'Active',
    fasting_required: 'Yes',
    turnaround_time: '48 hours',
    logic: (t) => String(t.test_name).match(/Calcium|Vitamin D|TSH|Thyroid|FSH|LH|Lipid|CBC|Creatinine/i)
  },
  {
    id: 'PKG006',
    name: 'Complete Women\'s Health & Hormones',
    slug: 'complete-womens-health-hormones',
    description: 'In-depth hormonal, thyroid, and reproductive health evaluation for women of all ages.',
    status: 'Active',
    fasting_required: 'No',
    turnaround_time: '48 hours',
    logic: (t) => String(t.test_name).match(/FSH|LH|Prolactin|Progesterone|Estrogen|Thyroid|Testosterone|AMH/i)
  },
  {
    id: 'PKG007',
    name: 'Fever & Infection Alert Panel',
    slug: 'fever-infection-alert-panel',
    description: 'Rapid diagnostic screening to identify the root cause of high fevers and viral infections.',
    status: 'Active',
    fasting_required: 'No',
    turnaround_time: '24-72 hours',
    logic: (t) => t.category_id === 'CAT_FEVER' || String(t.test_name).match(/Malaria|Dengue|Typhoid|Widal|Culture|CBC|ESR|CRP/i)
  },
  {
    id: 'PKG008',
    name: 'Essential Vitamins & Bone Health',
    slug: 'essential-vitamins-bone-health',
    description: 'Check for critical nutritional deficiencies impacting your energy immunity and bone density.',
    status: 'Active',
    fasting_required: 'No',
    turnaround_time: '24 hours',
    logic: (t) => t.category_id === 'CAT_VITAMINS' || String(t.test_name).match(/Vitamin|Calcium|Iron|Ferritin|Magnesium|Phosphorus/i)
  },
  {
    id: 'PKG009',
    name: 'Total Thyroid Profile',
    slug: 'total-thyroid-profile',
    description: 'Extensive evaluation of thyroid gland function, metabolism, and autoimmune indicators.',
    status: 'Active',
    fasting_required: 'No',
    turnaround_time: '24-48 hours',
    logic: (t) => String(t.test_name).match(/Thyroid|T3|T4|TSH|Anti-TPO|Thyroglobulin/i)
  }
];

const newPackageTests = [];
const newPackages = [];

packagesConfig.forEach(pkgConfig => {
  let mappedTests = allTests.filter(pkgConfig.logic);
  
  if (mappedTests.length > 40) mappedTests = mappedTests.slice(0, 40);
  else if (mappedTests.length === 0) mappedTests = allTests.slice(0, 10);

  let totalMrp = 0;
  let totalPrice = 0;

  mappedTests.forEach(t => {
    totalMrp += (parseFloat(t.mrp) || parseFloat(t.price) || 0);
    totalPrice += (parseFloat(t.price) || 0);
    newPackageTests.push({ package_id: pkgConfig.id, test_id: t.test_id });
  });

  newPackages.push({
    package_id: pkgConfig.id,
    package_name: pkgConfig.name,
    package_slug: pkgConfig.slug,
    price: Math.round(totalMrp),
    discount_price: Math.round(totalPrice * 0.85),
    tests_included_count: mappedTests.length,
    fasting_required: pkgConfig.fasting_required,
    turnaround_time: pkgConfig.turnaround_time,
    description: pkgConfig.description,
    status: pkgConfig.status
  });
});

writeCSV(pkgsCsvPath, newPackages);
writeCSV(pkgTestsCsvPath, newPackageTests);

console.log(`Successfully generated ${newPackages.length} highly intelligent medical packages mapping to ${newPackageTests.length} tests total!`);
