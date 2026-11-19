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

// Resize logo for poster overlay
const resizedLogoBuffer = await sharp(logoPath)
  .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
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

const packageTestsList = {
  'basic-full-body-checkup': ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)', 'Lipid Profile (Cholesterol)', 'Liver Function Test (LFT)', 'Serum Urea (Kidney)', 'Serum Creatinine (Kidney)', 'Thyroid TSH'],
  'diabetes-sugar-care-package': ['Fasting Blood Sugar (FBS)', 'PP Blood Sugar (PPBS)', 'HbA1c (3-Month Average Sugar)', 'Lipid Profile (Heart Care)'],
  'thyroid-wellness-check-package': ['Thyroid Profile (T3, T4, TSH)', 'Complete Blood Count (CBC)', 'Hemoglobin (Hb% Anemia)'],
  'heart-metabolic-check-package': ['Lipid Profile (Cholesterol & Triglycerides)', 'Fasting Blood Sugar (FBS)', 'HbA1c (3-Month Glycemic Control)', 'Serum Creatinine (Kidney Health)'],
  'vitamin-energy-check-package': ['Vitamin B12 (Energy & Nerve Health)', 'Vitamin D3 (Bone & Immunity)', 'Serum Calcium Total', 'Complete Blood Count (CBC)'],
  'comprehensive-healthy-heart-package': ['Lipid Profile Comprehensive', 'Troponin-I Quantitative', 'Fasting Blood Sugar (FBS)', 'HbA1c (3-Month Glucose)', 'Urea & Creatinine (Kidney)', 'Serum Electrolytes', 'Complete Blood Count (CBC)'],
  'advanced-spine-joint-nerve-pain-package': ['Vitamin D3 (25-OH)', 'Vitamin B12 (Nerve Shield)', 'Serum Calcium Total', 'Serum Uric Acid', 'RA (Rheumatoid) Factor', 'CRP Quantitative', 'ESR (Inflammation)', 'CBC'],
  'neuro-metabolic-memory-wellness-package': ['Vitamin B12 & Vitamin D3', 'Thyroid Profile (T3, T4, TSH)', 'HbA1c & Fasting Glucose', 'Lipid Profile', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Serum Electrolytes'],
  'pcos-hormonal-women-wellness-package': ['Thyroid Profile (T3, T4, TSH)', 'LH (Luteinizing Hormone)', 'FSH (Follicle Hormone)', 'Prolactin', 'CBC with Hb%', 'Fasting Glucose', 'Urine Routine', 'Serum Calcium'],
  'orthopedic-bone-density-joint-package': ['Vitamin D3 (25-OH)', 'Serum Calcium Total', 'Serum Phosphorus', 'Serum Uric Acid', 'Alkaline Phosphatase (ALP)', 'RA Factor', 'ESR', 'Complete Blood Count (CBC)'],
  'acute-infection-immunity-fever-package': ['CBC with Differential', 'ESR & CRP Quantitative', 'Dengue NS1 Antigen Assay', 'Widal Test (Typhoid)', 'Urine Routine Examination', 'Fasting Blood Glucose'],
  'advanced-diabetes-reversal-organ-shield': ['Fasting & PP Blood Sugar', 'HbA1c (3-Month Glycated)', 'Urine Microalbumin:Creatinine Ratio', 'Lipid Profile', 'Serum Creatinine', 'Liver Function Test (LFT)'],
  'senior-citizen-chronic-disease-package': ['CBC with ESR', 'Fasting Glucose & HbA1c', 'Lipid Profile (Cholesterol)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Thyroid TSH', 'Urine Routine'],
  'junior-wellness-child-growth-package': ['CBC with Hb% (Child Anemia)', 'Vitamin D3 (25-OH)', 'Serum Calcium Total', 'Serum Ferritin (Iron Reserve)', 'Urine Routine', 'Blood Group & Rh Typing', 'Thyroid TSH'],
  'neonatal-pediatric-allergy-nutrition-panel': ['CBC with AEC (Allergy)', 'Total IgE Assay', 'Bilirubin Total & Direct (Jaundice)', 'Serum Calcium Total', 'Vitamin D3', 'Urine Routine'],
  'holistic-allergy-inflammation-wellness-screen': ['Total IgE (Allergy Marker)', 'Absolute Eosinophil Count (AEC)', 'CBC & ESR (Inflammation)', 'Routine Urine Analysis', 'Liver Function Test (LFT)']
};

let generatedCount = 0;

for (const pkg of pkgsCsv) {
  const slug = pkg.package_slug;
  const name = pkg.package_name;
  const sellingPrice = parseFloat(pkg.discount_price);
  const mrp = parseFloat(pkg.price);
  const savings = mrp - sellingPrice;
  const discountPct = Math.round((savings / mrp) * 100);

  // Extract Bengali / English Slogan from marketing content
  let tagline = 'Stay Ahead. Stay Healthy. Your health is in your hands.';
  let slogan = 'আজই বুক করুন — সম্পূর্ণ ডিজিটাল রিপোর্ট ২৪ ঘণ্টায়';

  const slugRegex = new RegExp(`'${slug}'\\s*:\\s*{[\\s\\S]*?tagline:\\s*'([^']+)'[\\s\\S]*?bengaliSlogan:\\s*'([^']+)'`);
  const match = marketingTsContent.match(slugRegex);
  if (match) {
    tagline = match[1];
    slogan = match[2];
  }

  const testsList = packageTestsList[slug] || ['Complete Diagnostics', 'Free Home Collection', 'Reports in 24 Hours'];

  const testsSvgItems = testsList.map((t, idx) => `
    <g transform="translate(0, ${idx * 48})">
      <rect x="0" y="0" width="36" height="36" rx="8" fill="#006837" />
      <path d="M10 18 L15 23 L26 12" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <text x="50" y="24" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="22" font-weight="700">${escapeXml(t)}</text>
    </g>
  `).join('');

  const svgImage = `
    <svg width="1200" height="1600" viewBox="0 0 1200 1600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#022c22"/>
          <stop offset="40%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#fbbf24"/>
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#006837"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
        <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Main Canvas Background -->
      <rect width="1200" height="1600" fill="url(#bgGrad)"/>
      <circle cx="1100" cy="150" r="350" fill="#10b981" opacity="0.12" filter="blur(60px)"/>
      <circle cx="100" cy="1400" r="400" fill="#006837" opacity="0.2" filter="blur(80px)"/>

      <!-- Header Section -->
      <g transform="translate(60, 50)">
        <image href="${logoBase64}" width="120" height="120" />
        <text x="145" y="62" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="1">CAPSIC CARE</text>
        <text x="145" y="94" fill="#a7f3d0" font-family="-apple-system, sans-serif" font-size="20" font-weight="600">From Care to Cure with you at every step</text>
      </g>

      <!-- Top Badge -->
      <g transform="translate(800, 75)">
        <rect width="340" height="54" rx="27" fill="url(#goldGrad)" />
        <text x="170" y="34" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="1">OFFICIAL DIAGNOSTIC POSTER</text>
      </g>

      <!-- White Main Card Container -->
      <g transform="translate(60, 190)" filter="url(#dropShadow)">
        <rect width="1080" height="1320" rx="36" fill="url(#cardGrad)" stroke="#cbd5e1" stroke-width="2"/>

        <!-- Package Category Badge -->
        <rect x="60" y="50" width="360" height="44" rx="12" fill="#e6f4ea" stroke="#006837" stroke-width="2"/>
        <text x="240" y="78" fill="#006837" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" text-anchor="middle">🔬 ${escapeXml(pkg.category || 'HEALTH PACKAGE')}</text>

        <!-- Package Title -->
        <text x="60" y="145" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="44" font-weight="900">${escapeXml(name)}</text>

        <!-- Tagline / Slogan -->
        <rect x="60" y="175" width="960" height="56" rx="14" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
        <text x="80" y="210" fill="#166534" font-family="-apple-system, sans-serif" font-size="21" font-weight="700">“${escapeXml(tagline)}”</text>

        <!-- Slogan Bengali -->
        <text x="60" y="270" fill="#475569" font-family="-apple-system, sans-serif" font-size="22" font-weight="600">${escapeXml(slogan)}</text>

        <line x1="60" y1="295" x2="1020" y2="295" stroke="#e2e8f0" stroke-width="2"/>

        <!-- Included Tests Heading -->
        <text x="60" y="340" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="26" font-weight="900">Included Key Investigations (${pkg.tests_included_count} Tests):</text>

        <!-- Tests Bullet List -->
        <g transform="translate(60, 375)">
          ${testsSvgItems}
        </g>

        <!-- Prominent Price Offer Card -->
        <g transform="translate(60, 800)">
          <rect width="960" height="280" rx="28" fill="#022c22" stroke="#10b981" stroke-width="3"/>

          <!-- Offer Badge Pill -->
          <rect x="50" y="30" width="220" height="42" rx="21" fill="#e11d48"/>
          <text x="160" y="57" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="22" font-weight="900" text-anchor="middle">🔥 ${discountPct}% OFF</text>

          <!-- Savings Badge Pill -->
          <rect x="290" y="30" width="260" height="42" rx="21" fill="url(#goldGrad)"/>
          <text x="420" y="57" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="21" font-weight="900" text-anchor="middle">SAVE ₹${savings.toLocaleString('en-IN')}</text>

          <!-- Selling Price -->
          <text x="50" y="170" fill="#10b981" font-family="-apple-system, sans-serif" font-size="78" font-weight="900">₹${sellingPrice.toLocaleString('en-IN')}</text>
          <text x="50" y="220" fill="#a7f3d0" font-family="-apple-system, sans-serif" font-size="22" font-weight="700">Special Discounted Selling Price</text>

          <!-- Standard Price / MRP Strikethrough -->
          <text x="520" y="150" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="36" font-weight="700">MRP: ₹${mrp.toLocaleString('en-IN')}</text>
          <line x1="515" y1="138" x2="720" y2="138" stroke="#ef4444" stroke-width="4"/>

          <!-- Validity / NABL Tag -->
          <text x="520" y="210" fill="#f8fafc" font-family="-apple-system, sans-serif" font-size="22" font-weight="700">✓ Free Home Sample Collection Included</text>
        </g>

        <!-- Trust Features Bar -->
        <g transform="translate(60, 1120)">
          <rect width="960" height="120" rx="20" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>

          <g transform="translate(40, 40)">
            <text x="0" y="24" fill="#006837" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">🏠 FREE Doorstep Collection</text>
            <text x="0" y="54" fill="#475569" font-family="-apple-system, sans-serif" font-size="19" font-weight="600">Zero Home Collection Charge</text>
          </g>

          <g transform="translate(380, 40)">
            <text x="0" y="24" fill="#006837" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">⚡ 24-Hour Digital Reports</text>
            <text x="0" y="54" fill="#475569" font-family="-apple-system, sans-serif" font-size="19" font-weight="600">WhatsApp &amp; Email Delivery</text>
          </g>

          <g transform="translate(710, 40)">
            <text x="0" y="24" fill="#006837" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">🔬 NABL Accredited</text>
            <text x="0" y="54" fill="#475569" font-family="-apple-system, sans-serif" font-size="19" font-weight="600">100% Accurate Testing</text>
          </g>
        </g>

        <!-- Location & Contact Footer -->
        <g transform="translate(60, 1265)">
          <text x="0" y="20" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="20" font-weight="800">📍 Location: Bankra Bazar, Dewan Para Rd, Domjur, Howrah - 711403</text>
          <text x="960" y="20" fill="#006837" font-family="-apple-system, sans-serif" font-size="22" font-weight="900" text-anchor="end">📞 Book: +91 8910260709 | www.capsic.in</text>
        </g>
      </g>
    </svg>
  `;

  const outputJpgPath = path.join(outputDir, `${slug}.jpg`);
  await sharp(Buffer.from(svgImage))
    .jpeg({ quality: 92 })
    .toFile(outputJpgPath);

  generatedCount++;
  console.log(`Generated poster for [${slug}] -> Selling Price: ₹${sellingPrice}, MRP: ₹${mrp}, Discount: ${discountPct}%`);
}

console.log(`\nSuccessfully generated ${generatedCount} high-resolution 1200x1600 branded package poster images!`);
