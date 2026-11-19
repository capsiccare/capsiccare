import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import sharp from 'sharp';

const root = process.cwd();

console.log('====================================================');
console.log('CAPSIC CARE FULL PRICING & PACKAGE AUDIT');
console.log('====================================================\n');

const issues = [];
const completed = [];
const missing = [];
const packageImagesInfo = [];

// 1. READ ALL DATA FILES
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');
const packagesCsvPath = path.join(root, 'public', 'data', 'packages.csv');
const userCsvPath = path.join(root, 'scripts', 'user_tests.csv');
const pricingTsPath = path.join(root, 'lib', 'pricing.ts');
const dataTsPath = path.join(root, 'lib', 'data.ts');
const marketingTsPath = path.join(root, 'lib', 'package-marketing.ts');
const cashMemoPath = path.join(root, 'components', 'outpatient-cash-memo.tsx');
const doctorTsPath = path.join(root, 'data', 'doctors.ts');

const testsCsv = Papa.parse(fs.readFileSync(testsCsvPath, 'utf8'), { header: true, skipEmptyLines: true }).data;
const packagesCsv = Papa.parse(fs.readFileSync(packagesCsvPath, 'utf8'), { header: true, skipEmptyLines: true }).data;
const userCsv = Papa.parse(fs.readFileSync(userCsvPath, 'utf8'), { header: false, skipEmptyLines: true }).data.slice(1);
const pricingTsContent = fs.readFileSync(pricingTsPath, 'utf8');
const dataTsContent = fs.readFileSync(dataTsPath, 'utf8');
const marketingTsContent = fs.readFileSync(marketingTsPath, 'utf8');
const cashMemoContent = fs.readFileSync(cashMemoPath, 'utf8');
const doctorTsContent = fs.readFileSync(doctorTsPath, 'utf8');

console.log(`Loaded ${testsCsv.length} tests from tests.csv`);
console.log(`Loaded ${packagesCsv.length} packages from packages.csv`);
console.log(`Loaded ${userCsv.length} user test pricing rows from user_tests.csv\n`);

// ---------------------------------------------------------
// AUDIT ITEM 1 & 2: Individual Test Prices & MRPs
// ---------------------------------------------------------
console.log('--- AUDITING INDIVIDUAL TESTS ---');
function normalize(s) {
  return (s || '').toLowerCase().replace(/[^\w]/g, '').trim();
}

const userTestMap = new Map();
userCsv.forEach((row, idx) => {
  const name = row[0];
  const actualPrice = parseFloat(row[1]);
  const customerPrice = parseFloat(row[4]);
  if (name && !isNaN(customerPrice)) {
    userTestMap.set(normalize(name), { name, actualPrice, customerPrice, line: idx + 2 });
  }
});

let testMismatchCount = 0;
let mrpLowerCount = 0;
testsCsv.forEach(t => {
  const normName = normalize(t.test_name);
  const price = parseFloat(t.price);
  const mrp = parseFloat(t.mrp);

  if (isNaN(price) || isNaN(mrp)) {
    issues.push({
      item: 'Invalid numeric test price or mrp',
      location: `public/data/tests.csv (${t.test_id} - ${t.test_name})`,
      fix: 'Fix NaN price/mrp fields in tests.csv'
    });
  }

  if (mrp < price) {
    mrpLowerCount++;
    issues.push({
      item: `MRP (${mrp}) is lower than selling price (${price})`,
      location: `public/data/tests.csv (${t.test_id} - ${t.test_name})`,
      fix: 'Ensure MRP is greater than or equal to selling price'
    });
  }

  if (userTestMap.has(normName)) {
    const userItem = userTestMap.get(normName);
    if (price !== userItem.customerPrice) {
      testMismatchCount++;
      issues.push({
        item: `Test price mismatch: tests.csv=${price} vs user_tests.csv=${userItem.customerPrice}`,
        location: `public/data/tests.csv (${t.test_id} - ${t.test_name})`,
        fix: `Update tests.csv selling price to approved price ₹${userItem.customerPrice}`
      });
    }
  }
});

if (testMismatchCount === 0) {
  completed.push('All matched individual test prices in tests.csv match user_tests.csv approved prices.');
}

// Check lib/pricing.ts labTestsPricing
console.log('Checking lib/pricing.ts labTestsPricing...');
const labTestsPricingMatch = pricingTsContent.match(/export const labTestsPricing: PricingItem\[\] = \[([\s\S]*?)\]\n\nexport const healthPackagesPricing/);
if (labTestsPricingMatch) {
  const code = labTestsPricingMatch[1];
  const items = eval(`[${code}]`);
  items.forEach(item => {
    const csvItem = testsCsv.find(t => t.test_id === item.id);
    if (csvItem) {
      if (item.price !== parseFloat(csvItem.price) || item.mrp !== parseFloat(csvItem.mrp)) {
        issues.push({
          item: `lib/pricing.ts labTestsPricing mismatch for ${item.id} (${item.name}): pricing.ts price=${item.price}/mrp=${item.mrp} vs tests.csv price=${csvItem.price}/mrp=${csvItem.mrp}`,
          location: `lib/pricing.ts (${item.id})`,
          fix: `Update lib/pricing.ts to price=${csvItem.price}, mrp=${csvItem.mrp}`
        });
      }
    }
  });
}

// ---------------------------------------------------------
// AUDIT ITEM 3: Package Prices & MRPs across all sources
// ---------------------------------------------------------
console.log('\n--- AUDITING HEALTH PACKAGES ---');

const packageSourcesMap = new Map();
packagesCsv.forEach(p => {
  packageSourcesMap.set(p.package_slug, {
    id: p.package_id,
    name: p.package_name,
    slug: p.package_slug,
    csvPrice: parseFloat(p.discount_price), // In packages.csv: discount_price = selling price, price = mrp
    csvMrp: parseFloat(p.price)
  });
});

// Parse healthPackagesPricing in lib/pricing.ts
const pkgPricingMatch = pricingTsContent.match(/export const healthPackagesPricing: PricingItem\[\] = \[([\s\S]*?)\]\n\n\/\/ UTILITY/);
let pricingTsPkgs = [];
if (pkgPricingMatch) {
  pricingTsPkgs = eval(`[${pkgPricingMatch[1]}]`);
}

pricingTsPkgs.forEach(pkg => {
  const csvPkg = packagesCsv.find(p => p.package_id === pkg.id);
  if (csvPkg) {
    const csvPrice = parseFloat(csvPkg.discount_price);
    const csvMrp = parseFloat(csvPkg.price);
    if (pkg.price !== csvPrice || pkg.mrp !== csvMrp) {
      issues.push({
        item: `Package ${pkg.id} (${pkg.name}) price/MRP mismatch in lib/pricing.ts: pricing.ts price=${pkg.price}/mrp=${pkg.mrp} vs packages.csv price=${csvPrice}/mrp=${csvMrp}`,
        location: `lib/pricing.ts (${pkg.id})`,
        fix: `Update lib/pricing.ts for ${pkg.id} to price=${csvPrice}, mrp=${csvMrp}`
      });
    }
  }
});

// Parse healthPackages in lib/data.ts
const dataTsPkgsMatch = dataTsContent.match(/export const healthPackages: HealthPackage\[\] = \[([\s\S]*?)\]\n\nexport const blogPosts/);
let dataTsPkgs = [];
if (dataTsPkgsMatch) {
  dataTsPkgs = eval(`[${dataTsPkgsMatch[1]}]`);
}

dataTsPkgs.forEach(pkg => {
  const csvPkg = packagesCsv.find(p => p.id === pkg.id || p.package_slug === pkg.image?.replace('/images/packages/', '').replace('.jpg', ''));
  if (csvPkg) {
    const csvPrice = parseFloat(csvPkg.discount_price);
    const csvMrp = parseFloat(csvPkg.price);
    if (pkg.price !== csvPrice || pkg.originalPrice !== csvMrp) {
      issues.push({
        item: `Package ${pkg.id} (${pkg.name}) price/MRP mismatch in lib/data.ts: data.ts price=${pkg.price}/originalPrice=${pkg.originalPrice} vs packages.csv price=${csvPrice}/mrp=${csvMrp}`,
        location: `lib/data.ts (${pkg.id})`,
        fix: `Update lib/data.ts for ${pkg.id} to price=${csvPrice}, originalPrice=${csvMrp}`
      });
    }
  }
});

// Check marketing content in lib/package-marketing.ts
packagesCsv.forEach(pkg => {
  const slug = pkg.package_slug;
  const csvPrice = parseFloat(pkg.discount_price);
  const csvMrp = parseFloat(pkg.price);

  // Search marketing text for outdated price numbers
  const marketingRegex = new RegExp(`'${slug}'\\s*:\\s*{[\\s\\S]*?keyBenefits[\\s\\S]*?whyChooseUs`, 'm');
  const match = marketingTsContent.match(marketingRegex);
  if (match) {
    const block = match[0];
    const rupeePrices = block.match(/₹([\d,]+)/g);
    if (rupeePrices) {
      rupeePrices.forEach(rp => {
        const val = parseInt(rp.replace(/[₹,]/g, ''));
        // If this value looks like a price or MRP that doesn't match csvPrice or csvMrp
        if (val < 20000 && val !== csvPrice && val !== csvMrp && !block.includes(`MRP ₹${val}`) && !block.includes(`₹${val} individual MRP`)) {
          // Check if it's a known outdated price in marketing copy
          if (val === 599 || val === 399 || val === 699 || val === 799 || val === 1099 || val === 849) {
            issues.push({
              item: `Outdated marketing text price reference ₹${val} for package '${slug}' (Database Selling Price: ₹${csvPrice}, MRP: ₹${csvMrp})`,
              location: `lib/package-marketing.ts ('${slug}')`,
              fix: `Update package-marketing.ts copy for '${slug}' to mention selling price ₹${csvPrice} and MRP ₹${csvMrp}`
            });
          }
        }
      });
    }
  } else {
    issues.push({
      item: `Missing marketing data block for package '${slug}'`,
      location: `lib/package-marketing.ts`,
      fix: `Add marketing data block for '${slug}'`
    });
  }
});

// ---------------------------------------------------------
// AUDIT ITEM 4 & 5: Package Images
// ---------------------------------------------------------
console.log('\n--- AUDITING PACKAGE IMAGES ---');
const packagesDir = path.join(root, 'public', 'images', 'packages');

for (const pkg of packagesCsv) {
  const slug = pkg.package_slug;
  const imgPath = path.join(packagesDir, `${slug}.jpg`);
  const csvPrice = parseFloat(pkg.discount_price);
  const csvMrp = parseFloat(pkg.price);
  const discountPct = Math.round(((csvMrp - csvPrice) / csvMrp) * 100);

  if (!fs.existsSync(imgPath)) {
    packageImagesInfo.push({
      slug,
      name: pkg.package_name,
      status: 'MISSING',
      path: imgPath,
      price: csvPrice,
      mrp: csvMrp,
      discountPct
    });
    missing.push(`Package poster image missing for ${slug}`);
  } else {
    try {
      const metadata = await sharp(imgPath).metadata();
      packageImagesInfo.push({
        slug,
        name: pkg.package_name,
        status: 'EXISTS',
        width: metadata.width,
        height: metadata.height,
        sizeKb: Math.round(fs.statSync(imgPath).size / 1024),
        price: csvPrice,
        mrp: csvMrp,
        discountPct
      });
    } catch (err) {
      packageImagesInfo.push({
        slug,
        name: pkg.package_name,
        status: 'CORRUPT',
        error: err.message
      });
      issues.push({
        item: `Corrupt image for package '${slug}'`,
        location: imgPath,
        fix: `Regenerate image for ${slug}`
      });
    }
  }
}

// ---------------------------------------------------------
// AUDIT ITEM 6, 7, 8, 9: Bill Generator & Pricing Logic
// ---------------------------------------------------------
console.log('\n--- AUDITING BILL GENERATOR & CALCULATIONS ---');

// Check Home Collection Charge in OutpatientCashMemo
if (!cashMemoContent.includes('150') && !cashMemoContent.includes('homeCollectionFee') && !cashMemoContent.includes('home_collection')) {
  issues.push({
    item: 'Home Sample Collection ₹150 charge not clearly handled in Outpatient Cash Memo component',
    location: `components/outpatient-cash-memo.tsx`,
    fix: 'Verify home collection fee state and pricing calculations in outpatient-cash-memo.tsx'
  });
} else {
  completed.push('Outpatient cash memo includes home collection calculation logic.');
}

// Check mathematical formulas in pricing logic
console.log('Checking discount calculations math...');
packagesCsv.forEach(pkg => {
  const price = parseFloat(pkg.discount_price);
  const mrp = parseFloat(pkg.price);
  const discountAmount = mrp - price;
  const discountPct = Math.round((discountAmount / mrp) * 100);

  if (discountAmount <= 0) {
    issues.push({
      item: `Package ${pkg.package_id} has non-positive discount amount: MRP=${mrp}, Price=${price}`,
      location: `public/data/packages.csv (${pkg.package_id})`,
      fix: 'Fix package MRP or discount price'
    });
  }
});

// ---------------------------------------------------------
// SUMMARY REPORT
// ---------------------------------------------------------
console.log('\n====================================================');
console.log('AUDIT SUMMARY');
console.log('====================================================');
console.log(`✅ Completed checks: ${completed.length}`);
console.log(`⚠️ Issues found: ${issues.length}`);
console.log(`❌ Missing items: ${missing.length}`);
console.log(`🖼️ Package images inspected: ${packageImagesInfo.length}`);

console.log('\n--- DETAILED ISSUES ---');
issues.forEach((iss, i) => {
  console.log(`${i + 1}. [${iss.location}] ${iss.item}`);
  console.log(`   🔧 Fix: ${iss.fix}\n`);
});

console.log('\n--- PACKAGE IMAGES SUMMARY ---');
packageImagesInfo.forEach(img => {
  console.log(`- ${img.slug}: ${img.status} (${img.width || 0}x${img.height || 0}, ${img.sizeKb || 0}KB) | Price: ₹${img.price}, MRP: ₹${img.mrp}, Discount: ${img.discountPct}%`);
});

// Save audit output to json for reference
fs.writeFileSync(path.join(root, 'scripts', 'audit_report.json'), JSON.stringify({
  completed,
  issues,
  missing,
  packageImagesInfo
}, null, 2));

console.log('\nAudit report written to scripts/audit_report.json');
