import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'images', 'packages');
const brainDir = path.join('C:', 'Users', 'FusionIT', '.gemini', 'antigravity-ide', 'brain', '78e698bb-cdc1-4f88-a43d-b31d1ab34b99');
const baseTemplateJpg = path.join(brainDir, 'basic_full_body_checkup_1789806661718.jpg');

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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

const missingPackages = [
  {
    slug: 'junior-wellness-child-growth-package',
    titleLine1: 'Junior Wellness &',
    titleLine2: 'Child Growth',
    subtitle: 'Pediatric growth, nutrition & anemia shield.',
    slogan: 'PREVENT • DETECT • STAY HEALTHY',
    sellingPrice: 949,
    mrp: 2600,
    testsIncludedCount: 7,
    trustText: 'Suitable for Children & Teens',
    tests: [
      { name: 'CBC with Hb% (Child Anemia)', icon: 'blood' },
      { name: 'Vitamin D3 (25-OH)', icon: 'vitamin' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Serum Ferritin (Iron Reserve)', icon: 'blood' },
      { name: 'Urine Routine Examination', icon: 'urine' },
      { name: 'Blood Grouping & Rh', icon: 'blood' },
      { name: 'Thyroid TSH', icon: 'thyroid' }
    ]
  },
  {
    slug: 'neonatal-pediatric-allergy-nutrition-panel',
    titleLine1: 'Child Allergy &',
    titleLine2: 'Nutrition Panel',
    subtitle: 'Newborn jaundice, food allergy & nutrient screen.',
    slogan: 'PEDIATRIC ALLERGY • NEWBORN CARE',
    sellingPrice: 999,
    mrp: 2750,
    testsIncludedCount: 6,
    trustText: 'Specialized Pediatric Panel',
    tests: [
      { name: 'CBC with AEC (Allergy Count)', icon: 'blood' },
      { name: 'Total IgE Assay', icon: 'general' },
      { name: 'Bilirubin Total & Direct', icon: 'liver' },
      { name: 'Serum Calcium Total', icon: 'bone' },
      { name: 'Vitamin D3', icon: 'vitamin' },
      { name: 'Urine Routine Examination', icon: 'urine' }
    ]
  },
  {
    slug: 'holistic-allergy-inflammation-wellness-screen',
    titleLine1: 'Holistic Allergy &',
    titleLine2: 'Inflammation',
    subtitle: 'Root-cause evaluation for allergies, asthma & skin.',
    slogan: 'HOLISTIC HEALTH • ALLERGY SHIELD',
    sellingPrice: 899,
    mrp: 2500,
    testsIncludedCount: 6,
    trustText: 'Comprehensive Allergy Screen',
    tests: [
      { name: 'Total IgE (Allergy Marker)', icon: 'general' },
      { name: 'Absolute Eosinophil Count', icon: 'blood' },
      { name: 'CBC & ESR (Inflammation)', icon: 'blood' },
      { name: 'Routine Urine Analysis', icon: 'urine' },
      { name: 'Liver Function Test (LFT)', icon: 'liver' }
    ]
  }
];

for (const pkg of missingPackages) {
  const savings = pkg.mrp - pkg.sellingPrice;
  const discountPct = Math.round((savings / pkg.mrp) * 100);

  const testRowsSvg = pkg.tests.map((t, idx) => `
    <g transform="translate(0, ${idx * 60})">
      ${getMedicalIconSvg(t.icon)}
      <text x="54" y="26" fill="#1e293b" font-family="-apple-system, sans-serif" font-size="20" font-weight="700">${escapeXml(t.name)}</text>
      <line x1="0" y1="52" x2="400" y2="52" stroke="#f1f5f9" stroke-width="1.5" />
    </g>
  `).join('');

  // SVG overlay keeping exact official logo and backdrop untouched
  const svgOverlay = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#004d40"/>
          <stop offset="100%" stop-color="#00695c"/>
        </linearGradient>
        <filter id="softCardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#004d40" flood-opacity="0.12"/>
        </filter>
      </defs>

      <!-- Mask out old Title & Subtitle region -->
      <rect x="40" y="200" width="500" height="250" fill="#f4faf7" />

      <!-- Title & Subtitle -->
      <g transform="translate(50, 240)">
        <text x="0" y="0" fill="#004d40" font-family="-apple-system, sans-serif" font-size="44" font-weight="900">${escapeXml(pkg.titleLine1)}</text>
        <text x="0" y="48" fill="#004d40" font-family="-apple-system, sans-serif" font-size="44" font-weight="900">${escapeXml(pkg.titleLine2)}</text>
        <text x="0" y="92" fill="#334155" font-family="-apple-system, sans-serif" font-size="20" font-weight="600">${escapeXml(pkg.subtitle)}</text>
      </g>

      <!-- Mask out old Price Card region -->
      <rect x="35" y="495" width="460" height="185" fill="#f4faf7" />

      <!-- Price Card Container -->
      <g transform="translate(42, 505)" filter="url(#softCardShadow)">
        <!-- Dark Teal Our Price Box -->
        <rect width="190" height="150" rx="24" fill="url(#tealGrad)" />
        <text x="95" y="42" fill="#a7f3d0" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" text-anchor="middle">Our Price</text>
        <text x="95" y="112" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">₹${pkg.sellingPrice.toLocaleString('en-IN')}</text>

        <!-- MRP & Discount Container -->
        <g transform="translate(205, 0)">
          <rect width="210" height="150" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

          <text x="30" y="45" fill="#64748b" font-family="-apple-system, sans-serif" font-size="17" font-weight="700">MRP</text>
          <text x="80" y="45" fill="#0f172a" font-family="-apple-system, sans-serif" font-size="24" font-weight="800">₹${pkg.mrp.toLocaleString('en-IN')}</text>
          <line x1="75" y1="37" x2="165" y2="37" stroke="#ef4444" stroke-width="3" />

          <!-- Red Discount Pill -->
          <rect x="30" y="66" width="150" height="34" rx="17" fill="#ef4444" />
          <text x="105" y="89" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="17" font-weight="900" text-anchor="middle">${discountPct}% OFF</text>

          <text x="30" y="128" fill="#dc2626" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">Save ₹${savings.toLocaleString('en-IN')}</text>
        </g>
      </g>

      <!-- Mask out old Tests Included Card region -->
      <rect x="545" y="55" width="440" height="780" fill="#f4faf7" />

      <!-- Right Side Tests Card Container -->
      <g transform="translate(550, 60)" filter="url(#softCardShadow)">
        <rect width="435" height="765" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>

        <!-- Dark Teal Card Header Pill -->
        <g transform="translate(25, 25)">
          <rect width="300" height="52" rx="26" fill="url(#tealGrad)" />
          <text x="150" y="33" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="20" font-weight="900" text-anchor="middle">Tests Included (${pkg.testsIncludedCount})</text>
        </g>

        <!-- Test List Items -->
        <g transform="translate(25, 110)">
          ${testRowsSvg}
        </g>
      </g>

      <!-- Mask out bottom bar text -->
      <rect x="40" y="945" width="700" height="50" fill="#004d40" />

      <!-- Bottom Trust Bar -->
      <g transform="translate(50, 975)">
        <text x="0" y="0" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">✓ ${pkg.testsIncludedCount} Essential Tests</text>
        <line x1="200" y1="-14" x2="200" y2="6" stroke="#a7f3d0" stroke-width="2" opacity="0.6"/>
        <text x="230" y="0" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">🕒 Quick &amp; Convenient</text>
        <line x1="450" y1="-14" x2="450" y2="6" stroke="#a7f3d0" stroke-width="2" opacity="0.6"/>
        <text x="480" y="0" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">👥 ${escapeXml(pkg.trustText)}</text>
      </g>
    </svg>
  `;

  const outputJpgPath = path.join(outputDir, `${pkg.slug}.jpg`);

  await sharp(baseTemplateJpg)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toFile(outputJpgPath);

  const stats = fs.statSync(outputJpgPath);
  console.log(`[Official Logo 500KB+ Poster] ${pkg.slug}.jpg (${Math.round(stats.size / 1024)} KB)`);
}

console.log('\nAll 3 package posters updated with official logo & matching 3D layout!');
