import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Papa from 'papaparse';

const root = process.cwd();
const logoPath = path.join(root, 'public', 'logo.png');
const packagesCsvPath = path.join(root, 'public', 'data', 'packages.csv');
const marketingTsPath = path.join(root, 'lib', 'package-marketing.ts');
const outputDir = path.join(root, 'public', 'images', 'packages');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pkgsCsv = Papa.parse(fs.readFileSync(packagesCsvPath, 'utf8'), { header: true, skipEmptyLines: true }).data;
const marketingTsContent = fs.readFileSync(marketingTsPath, 'utf8');

// Resize logo for poster top-left header
const resizedLogoBuffer = await sharp(logoPath)
  .resize(90, 90, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const logoBase64 = `data:image/png;base64,${resizedLogoBuffer.toString('base64')}`;

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Dedicated test list & medical icons for all 16 packages
const packageDetails = {
  'basic-full-body-checkup': {
    title: 'Complete Health Check-up',
    subtitle: 'A small step today for a healthier tomorrow.',
    slogan: 'PREVENT • DETECT • STAY HEALTHY',
    tests: [
      { name: 'Complete Blood Count (CBC)', icon: 'blood' },
      { name: 'Fasting Blood Sugar (FBS)', icon: 'sugar' },
      { name: 'Lipid Profile (Cholesterol)', icon: 'heart' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' },
      { name: 'Serum Urea (Kidney)', icon: 'kidney' },
      { name: 'Serum Creatinine (Kidney)', icon: 'kidney' },
      { name: 'Thyroid TSH', icon: 'thyroid' }
    ]
  },
  'diabetes-sugar-care-package': {
    title: 'Diabetes & Sugar Care',
    subtitle: 'Track 3-month sugar control & protect your heart.',
    slogan: 'CONTROL • MANAGE • PROTECT',
    tests: [
      { name: 'Fasting Blood Sugar (FBS)', icon: 'sugar' },
      { name: 'PP Blood Sugar (PPBS)', icon: 'sugar' },
      { name: 'HbA1c (3-Month Glycated)', icon: 'sugar' },
      { name: 'Lipid Profile (Heart Care)', icon: 'heart' }
    ]
  },
  'thyroid-wellness-check-package': {
    title: 'Thyroid & Wellness Check',
    subtitle: 'Small gland, big impact on your metabolic health.',
    slogan: 'ENERGY • BALANCE • VITALITY',
    tests: [
      { name: 'Thyroid Profile (T3, T4, TSH)', icon: 'thyroid' },
      { name: 'Complete Blood Count (CBC)', icon: 'blood' },
      { name: 'Hemoglobin (Hb% Anemia)', icon: 'blood' }
    ]
  },
  'heart-metabolic-check-package': {
    title: 'Heart & Metabolic Check',
    subtitle: 'Heart health + sugar + cholesterol evaluation.',
    slogan: 'CARDIAC • METABOLIC • SHIELD',
    tests: [
      { name: 'Lipid Profile (Cholesterol)', icon: 'heart' },
      { name: 'Fasting Blood Sugar (FBS)', icon: 'sugar' },
      { name: 'HbA1c (3-Month Glycemic)', icon: 'sugar' },
      { name: 'Serum Creatinine (Kidney)', icon: 'kidney' }
    ]
  },
  'vitamin-energy-check-package': {
    title: 'Vitamin & Energy Check',
    subtitle: 'Eliminate chronic fatigue, joint aches & low energy.',
    slogan: 'MORE ENERGY • BETTER EVERYDAY',
    tests: [
      { name: 'Vitamin B12 (Nerve Health)', icon: 'vitamin' },
      { name: 'Vitamin D3 (Bone & Immunity)', icon: 'vitamin' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Complete Blood Count (CBC)', icon: 'blood' }
    ]
  },
  'comprehensive-healthy-heart-package': {
    title: 'Healthy Heart Risk Profile',
    subtitle: 'Complete cardiology & troponin risk assessment.',
    slogan: 'PRECISION • CARDIOLOGY • RISK TRIAGE',
    tests: [
      { name: 'Lipid Profile Comprehensive', icon: 'heart' },
      { name: 'Troponin-I Quantitative', icon: 'heart' },
      { name: 'Fasting Blood Sugar (FBS)', icon: 'sugar' },
      { name: 'HbA1c (3-Month Glucose)', icon: 'sugar' },
      { name: 'Urea & Creatinine (Kidney)', icon: 'kidney' },
      { name: 'Serum Electrolytes', icon: 'general' },
      { name: 'Complete Blood Count (CBC)', icon: 'blood' }
    ]
  },
  'advanced-spine-joint-nerve-pain-package': {
    title: 'Spine, Joint & Nerve Pain Care',
    subtitle: 'Targeted screening for chronic back, knee & nerve pain.',
    slogan: 'PAIN RELIEF • JOINT HEALTH • SHIELD',
    tests: [
      { name: 'Vitamin D3 (25-OH)', icon: 'vitamin' },
      { name: 'Vitamin B12 (Nerve Shield)', icon: 'vitamin' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Serum Uric Acid (Gout)', icon: 'bone' },
      { name: 'RA (Rheumatoid) Factor', icon: 'bone' },
      { name: 'CRP Quantitative', icon: 'general' },
      { name: 'ESR & CBC', icon: 'blood' }
    ]
  },
  'neuro-metabolic-memory-wellness-package': {
    title: 'Neuro-Metabolic & Memory',
    subtitle: 'Brain vitality, memory & metabolic balance screen.',
    slogan: 'BRAIN HEALTH • DEMENTIA RISK • CARE',
    tests: [
      { name: 'Vitamin B12 & Vitamin D3', icon: 'vitamin' },
      { name: 'Thyroid Profile (T3, T4, TSH)', icon: 'thyroid' },
      { name: 'HbA1c & Fasting Glucose', icon: 'sugar' },
      { name: 'Lipid Profile', icon: 'heart' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' },
      { name: 'Kidney Function Test (KFT)', icon: 'kidney' },
      { name: 'Serum Electrolytes', icon: 'general' }
    ]
  },
  'pcos-hormonal-women-wellness-package': {
    title: 'PCOS & Women Wellness',
    subtitle: 'Hormonal balance, fertility & cycle regulation.',
    slogan: 'WOMEN HEALTH • HORMONAL BALANCE',
    tests: [
      { name: 'Thyroid Profile (T3, T4, TSH)', icon: 'thyroid' },
      { name: 'LH (Luteinizing Hormone)', icon: 'general' },
      { name: 'FSH (Follicle Hormone)', icon: 'general' },
      { name: 'Prolactin Assay', icon: 'general' },
      { name: 'CBC with Hb% (Anemia)', icon: 'blood' },
      { name: 'Fasting Glucose', icon: 'sugar' },
      { name: 'Urine Routine & Calcium', icon: 'urine' }
    ]
  },
  'orthopedic-bone-density-joint-package': {
    title: 'Bone Density & Joint Health',
    subtitle: 'Specialized bone mineral, osteoporosis & cartilage screen.',
    slogan: 'STRONG BONES • ACTIVE LIFE',
    tests: [
      { name: 'Vitamin D3 (25-OH)', icon: 'vitamin' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Serum Phosphorus', icon: 'bone' },
      { name: 'Serum Uric Acid', icon: 'bone' },
      { name: 'Alkaline Phosphatase (ALP)', icon: 'bone' },
      { name: 'RA Factor & ESR', icon: 'bone' },
      { name: 'Complete Blood Count (CBC)', icon: 'blood' }
    ]
  },
  'acute-infection-immunity-fever-package': {
    title: 'Acute Fever & Infection Screen',
    subtitle: 'Rapid triage for dengue, typhoid & acute fevers.',
    slogan: 'FEVER TRIAGE • FAST DIAGNOSIS',
    tests: [
      { name: 'CBC with Differential', icon: 'blood' },
      { name: 'ESR & CRP Quantitative', icon: 'general' },
      { name: 'Dengue NS1 Antigen Assay', icon: 'blood' },
      { name: 'Widal Test (Typhoid)', icon: 'general' },
      { name: 'Urine Routine Examination', icon: 'urine' },
      { name: 'Fasting Blood Glucose', icon: 'sugar' }
    ]
  },
  'advanced-diabetes-reversal-organ-shield': {
    title: 'Diabetes Reversal & Organ Shield',
    subtitle: 'Precision glycemic reversal with organ protection.',
    slogan: 'GLYCEMIC CONTROL • VITAL ORGAN SHIELD',
    tests: [
      { name: 'Fasting & PP Blood Sugar', icon: 'sugar' },
      { name: 'HbA1c (3-Month Glycated)', icon: 'sugar' },
      { name: 'Urine Microalbumin Ratio', icon: 'urine' },
      { name: 'Lipid Profile', icon: 'heart' },
      { name: 'Serum Creatinine (Kidney)', icon: 'kidney' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' }
    ]
  },
  'senior-citizen-chronic-disease-package': {
    title: 'Senior Citizen Health Checkup',
    subtitle: 'Annual multi-system geriatric health checkup.',
    slogan: 'SENIOR CARE • VITAL LONGEVITY',
    tests: [
      { name: 'CBC with ESR', icon: 'blood' },
      { name: 'Fasting Glucose & HbA1c', icon: 'sugar' },
      { name: 'Lipid Profile (Cholesterol)', icon: 'heart' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' },
      { name: 'Kidney Function Test (KFT)', icon: 'kidney' },
      { name: 'Thyroid TSH', icon: 'thyroid' },
      { name: 'Urine Routine Examination', icon: 'urine' }
    ]
  },
  'junior-wellness-child-growth-package': {
    title: 'Junior Wellness & Child Growth',
    subtitle: 'Pediatric growth, nutrition & anemia shield.',
    slogan: 'CHILD HEALTH • NUTRITION • IMMUNITY',
    tests: [
      { name: 'CBC with Hb% (Anemia)', icon: 'blood' },
      { name: 'Vitamin D3 (25-OH)', icon: 'vitamin' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Serum Ferritin (Iron)', icon: 'blood' },
      { name: 'Urine Routine Examination', icon: 'urine' },
      { name: 'Blood Grouping & Rh', icon: 'blood' },
      { name: 'Thyroid TSH', icon: 'thyroid' }
    ]
  },
  'neonatal-pediatric-allergy-nutrition-panel': {
    title: 'Child Allergy & Nutrition Panel',
    subtitle: 'Newborn jaundice, food allergy & nutrient screen.',
    slogan: 'PEDIATRIC ALLERGY • NEWBORN CARE',
    tests: [
      { name: 'CBC with AEC (Allergy)', icon: 'blood' },
      { name: 'Total IgE Assay', icon: 'general' },
      { name: 'Bilirubin Total & Direct', icon: 'liver' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Vitamin D3', icon: 'vitamin' },
      { name: 'Urine Routine Examination', icon: 'urine' }
    ]
  },
  'holistic-allergy-inflammation-wellness-screen': {
    title: 'Holistic Allergy & Inflammation',
    subtitle: 'Root-cause evaluation for allergies, asthma & skin.',
    slogan: 'HOLISTIC HEALTH • ALLERGY SHIELD',
    tests: [
      { name: 'Total IgE (Allergy Marker)', icon: 'general' },
      { name: 'Absolute Eosinophil Count', icon: 'blood' },
      { name: 'CBC & ESR (Inflammation)', icon: 'blood' },
      { name: 'Routine Urine Analysis', icon: 'urine' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' }
    ]
  }
};

// SVG Medical Icons matching exact example design
function getMedicalIconSvg(iconType) {
  switch (iconType) {
    case 'blood':
      return `
        <circle cx="20" cy="20" r="18" fill="#fee2e2" />
        <path d="M20 9 C20 9, 11 19, 11 24 C11 28.9, 15 31, 20 31 C25 31, 29 28.9, 29 24 C29 19, 20 9, 20 9 Z" fill="#ef4444" />
      `;
    case 'sugar':
      return `
        <circle cx="20" cy="20" r="18" fill="#e0f2fe" />
        <rect x="13" y="10" width="14" height="20" rx="4" fill="#0284c7" />
        <rect x="15" y="13" width="10" height="8" rx="1" fill="#ffffff" />
        <circle cx="20" cy="25" r="2.5" fill="#ffffff" />
      `;
    case 'heart':
      return `
        <circle cx="20" cy="20" r="18" fill="#ffe4e6" />
        <path d="M20 29 L11.5 20.5 C9 18, 9 14, 11.5 11.5 C14 9, 18 9, 20 12.5 C22 9, 26 9, 28.5 11.5 C31 14, 31 18, 28.5 20.5 Z" fill="#e11d48" />
      `;
    case 'liver':
      return `
        <circle cx="20" cy="20" r="18" fill="#ffedd5" />
        <path d="M12 14 C12 12, 28 11, 28 17 C28 23, 22 28, 16 28 C11 28, 12 19, 12 14 Z" fill="#ea580c" />
      `;
    case 'kidney':
      return `
        <circle cx="20" cy="20" r="18" fill="#fee2e2" />
        <path d="M15 11 C11 13, 10 21, 14 26 C17 30, 22 28, 20 23 C18 19, 20 16, 22 15 C24 14, 20 9, 15 11 Z" fill="#dc2626" />
        <path d="M25 11 C29 13, 30 21, 26 26 C23 30, 18 28, 20 23 C22 19, 20 16, 18 15 C16 14, 20 9, 25 11 Z" fill="#dc2626" />
      `;
    case 'thyroid':
      return `
        <circle cx="20" cy="20" r="18" fill="#ffedd5" />
        <path d="M12 15 C10 20, 14 27, 18 25 C19 22, 19 18, 18 15 Z" fill="#e11d48" />
        <path d="M28 15 C30 20, 26 27, 22 25 C21 22, 21 18, 22 15 Z" fill="#e11d48" />
        <rect x="17" y="18" width="6" height="4" rx="1" fill="#e11d48" />
      `;
    case 'vitamin':
      return `
        <circle cx="20" cy="20" r="18" fill="#fef3c7" />
        <path d="M13 13 L27 27 C30 24, 30 16, 27 13 C24 10, 16 10, 13 13 Z" fill="#d97706" />
        <path d="M13 13 L27 27 C24 30, 16 30, 13 27 C10 24, 10 16, 13 13 Z" fill="#f59e0b" />
      `;
    case 'bone':
      return `
        <circle cx="20" cy="20" r="18" fill="#f3f4f6" />
        <rect x="12" y="18" width="16" height="4" rx="2" fill="#4b5563" transform="rotate(-45 20 20)" />
        <circle cx="12" cy="14" r="3" fill="#4b5563" />
        <circle cx="14" cy="12" r="3" fill="#4b5563" />
        <circle cx="28" cy="26" r="3" fill="#4b5563" />
        <circle cx="26" cy="28" r="3" fill="#4b5563" />
      `;
    case 'urine':
      return `
        <circle cx="20" cy="20" r="18" fill="#fef9c3" />
        <path d="M15 11 L25 11 L23 27 C23 28, 17 28, 17 27 Z" fill="#ca8a04" opacity="0.8" />
        <rect x="13" y="9" width="14" height="3" rx="1" fill="#854d0e" />
      `;
    default:
      return `
        <circle cx="20" cy="20" r="18" fill="#ccfbf1" />
        <circle cx="20" cy="20" r="10" fill="#0d9488" />
        <path d="M17 20 L23 20 M20 17 L20 23" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      `;
  }
}

let generatedCount = 0;

for (const pkg of pkgsCsv) {
  const slug = pkg.package_slug;
  const sellingPrice = parseFloat(pkg.discount_price);
  const mrp = parseFloat(pkg.price);
  const savings = mrp - sellingPrice;
  const discountPct = Math.round((savings / mrp) * 100);

  const detail = packageDetails[slug] || {
    title: pkg.package_name,
    subtitle: 'Comprehensive preventive health evaluation.',
    slogan: 'PREVENT • DETECT • STAY HEALTHY',
    tests: [
      { name: 'Complete Blood Count (CBC)', icon: 'blood' },
      { name: 'Fasting Blood Sugar (FBS)', icon: 'sugar' },
      { name: 'Lipid Profile (Cholesterol)', icon: 'heart' }
    ]
  };

  const testRowsSvg = detail.tests.slice(0, 7).map((t, idx) => `
    <g transform="translate(0, ${idx * 60})">
      ${getMedicalIconSvg(t.icon)}
      <text x="54" y="26" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="20" font-weight="700">${escapeXml(t.name)}</text>
      <line x1="0" y1="52" x2="420" y2="52" stroke="#f1f5f9" stroke-width="1.5" />
    </g>
  `).join('');

  // 1024x1024 Square Minimal SVG Canvas
  const svgImage = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Soft Mint Gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f2faf6"/>
          <stop offset="60%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#e6f5ef"/>
        </linearGradient>

        <!-- Dark Teal Gradient -->
        <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#004d40"/>
          <stop offset="100%" stop-color="#00695c"/>
        </linearGradient>

        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.08"/>
        </filter>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#004d40" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1024" height="1024" fill="url(#bgGrad)"/>

      <!-- Organic Wave Accents -->
      <path d="M-50 900 Q 250 820, 600 960 T 1100 880 L 1100 1070 L -50 1070 Z" fill="#004d40" opacity="0.95"/>
      <path d="M-50 920 Q 300 860, 650 970 T 1100 910 L 1100 1070 L -50 1070 Z" fill="#00695c" opacity="0.4"/>

      <!-- Top Header & Logo -->
      <g transform="translate(50, 45)">
        <image href="${logoBase64}" width="80" height="80" />
        <g transform="translate(95, 20)">
          <text x="0" y="24" fill="#004d40" font-family="-apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="1">CAPSIC CARE</text>
          <text x="0" y="46" fill="#0f766e" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">From Care to Cure with you at every step</text>
        </g>
      </g>

      <!-- Slogan Tagline -->
      <g transform="translate(50, 160)">
        <text x="0" y="0" fill="#475569" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="2">${escapeXml(detail.slogan)}</text>
      </g>

      <!-- Title & Subtitle -->
      <g transform="translate(50, 230)">
        <text x="0" y="0" fill="#004d40" font-family="-apple-system, sans-serif" font-size="44" font-weight="900">${escapeXml(detail.title)}</text>
        <text x="0" y="38" fill="#334155" font-family="-apple-system, sans-serif" font-size="20" font-weight="600">${escapeXml(detail.subtitle)}</text>
      </g>

      <!-- 3 Circular Feature Badges -->
      <g transform="translate(50, 310)">
        <!-- Badge 1 -->
        <g transform="translate(0,0)">
          <circle cx="35" cy="35" r="32" fill="#e0f2fe" />
          <path d="M35 22 L35 48 M22 35 L48 35" stroke="#0284c7" stroke-width="5" stroke-linecap="round" />
          <text x="35" y="85" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">Early</text>
          <text x="35" y="103" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">Detection</text>
        </g>

        <!-- Badge 2 -->
        <g transform="translate(130,0)">
          <circle cx="35" cy="35" r="32" fill="#dcfce7" />
          <circle cx="28" cy="30" r="7" fill="#16a34a" />
          <circle cx="42" cy="30" r="7" fill="#16a34a" />
          <path d="M20 46 C20 38, 50 38, 50 46" stroke="#16a34a" stroke-width="4" fill="none" />
          <text x="35" y="85" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">Better</text>
          <text x="35" y="103" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">Prevention</text>
        </g>

        <!-- Badge 3 -->
        <g transform="translate(260,0)">
          <circle cx="35" cy="35" r="32" fill="#ffe4e6" />
          <path d="M35 46 L24 35 C20 31, 20 25, 24 21 C28 17, 33 17, 35 22 C37 17, 42 17, 46 21 C50 25, 50 31, 46 35 Z" fill="#e11d48" />
          <text x="35" y="85" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">A Healthier</text>
          <text x="35" y="103" fill="#334155" font-family="-apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle">You</text>
        </g>
      </g>

      <!-- Minimal Price Container -->
      <g transform="translate(50, 470)" filter="url(#cardShadow)">
        <!-- Dark Teal Our Price Box -->
        <rect width="190" height="150" rx="24" fill="url(#tealGrad)" />
        <text x="95" y="42" fill="#a7f3d0" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle">Our Price</text>
        <text x="95" y="112" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">₹${sellingPrice.toLocaleString('en-IN')}</text>

        <!-- MRP & Discount Container -->
        <g transform="translate(205, 0)">
          <rect width="210" height="150" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

          <text x="30" y="45" fill="#64748b" font-family="-apple-system, sans-serif" font-size="17" font-weight="700">MRP</text>
          <text x="80" y="45" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="24" font-weight="800">₹${mrp.toLocaleString('en-IN')}</text>
          <line x1="75" y1="37" x2="165" y2="37" stroke="#ef4444" stroke-width="3" />

          <!-- Red Discount Pill -->
          <rect x="30" y="66" width="150" height="34" rx="17" fill="#ef4444" />
          <text x="105" y="89" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="17" font-weight="900" text-anchor="middle">${discountPct}% OFF</text>

          <text x="30" y="128" fill="#dc2626" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">Save ₹${savings.toLocaleString('en-IN')}</text>
        </g>
      </g>

      <!-- Handwritten Cursive Accent -->
      <g transform="translate(80, 680)">
        <text fill="#0f766e" font-family="Georgia, serif" font-style="italic" font-size="28" font-weight="bold">Healthier Today</text>
        <text y="32" fill="#0f766e" font-family="Georgia, serif" font-style="italic" font-size="28" font-weight="bold">Brighter Tomorrow</text>
      </g>

      <!-- Right Side Tests Card Container -->
      <g transform="translate(485, 70)" filter="url(#cardShadow)">
        <rect width="485" height="770" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

        <!-- Dark Teal Card Header Pill -->
        <g transform="translate(30, 30)">
          <rect width="320" height="52" rx="26" fill="url(#tealGrad)" />
          <text x="160" y="33" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="20" font-weight="900" text-anchor="middle">Tests Included (${pkg.tests_included_count})</text>
        </g>

        <!-- Test List Items -->
        <g transform="translate(35, 115)">
          ${testRowsSvg}
        </g>
      </g>

      <!-- 3D Heart Graphic Element on Bottom Wave -->
      <g transform="translate(730, 800)">
        <circle cx="80" cy="80" r="70" fill="#e11d48" filter="url(#softShadow)" />
        <path d="M80 120 L48 85 C35 70, 35 50, 48 38 C60 25, 75 25, 80 35 C85 25, 100 25, 112 38 C125 50, 125 70, 112 85 Z" fill="#ffffff" />
        <path d="M50 78 L68 78 L74 60 L84 95 L92 70 L98 78 L110 78" stroke="#e11d48" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Bottom Trust Bar -->
      <g transform="translate(50, 955)">
        <text x="0" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">✓ ${pkg.tests_included_count} Essential Tests</text>
        <line x1="200" y1="10" x2="200" y2="30" stroke="#a7f3d0" stroke-width="2" opacity="0.6"/>
        <text x="230" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">🕒 Quick &amp; Convenient</text>
        <line x1="450" y1="10" x2="450" y2="30" stroke="#a7f3d0" stroke-width="2" opacity="0.6"/>
        <text x="480" y="24" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">👥 Suitable for All Adults</text>
      </g>
    </svg>
  `;

  const outputJpgPath = path.join(outputDir, `${slug}.jpg`);
  await sharp(Buffer.from(svgImage))
    .jpeg({ quality: 95 })
    .toFile(outputJpgPath);

  generatedCount++;
  console.log(`Generated minimal poster for [${slug}] -> Price: ₹${sellingPrice}, MRP: ₹${mrp}, Discount: ${discountPct}%`);
}

console.log(`\nSuccessfully re-generated all ${generatedCount} package poster images in minimal standard design!`);
