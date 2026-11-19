import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();

console.log('=== Step 1: Update public/data/tests.csv ===');
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');
const testsContent = fs.readFileSync(testsCsvPath, 'utf8');
const tests = Papa.parse(testsContent, { header: true, skipEmptyLines: true }).data;

let testsUpdated = 0;
tests.forEach(t => {
  const isVit = t.category_id === 'CAT010' || (t.test_name || '').toLowerCase().includes('vitamin');
  if (isVit) {
    const oldPrice = parseFloat(t.price);
    const oldMrp = parseFloat(t.mrp);
    if (!isNaN(oldPrice)) {
      const newPrice = Math.round(oldPrice * 1.15);
      t.price = String(newPrice);
    }
    if (!isNaN(oldMrp)) {
      const newMrp = Math.round(oldMrp * 1.15);
      t.mrp = String(newMrp);
    }
    console.log(`Updated test: [${t.test_id}] ${t.test_name} -> Price: ${t.price}, MRP: ${t.mrp}`);
    testsUpdated++;
  }
});
fs.writeFileSync(testsCsvPath, Papa.unparse(tests), 'utf8');
console.log(`Saved ${testsUpdated} updated tests to tests.csv\n`);

console.log('=== Step 2: Update public/data/packages.csv ===');
const pkgsCsvPath = path.join(root, 'public', 'data', 'packages.csv');
const pkgsContent = fs.readFileSync(pkgsCsvPath, 'utf8');
const pkgs = Papa.parse(pkgsContent, { header: true, skipEmptyLines: true }).data;

let pkgsUpdated = 0;
pkgs.forEach(p => {
  const isVit = (p.package_name || '').toLowerCase().includes('vitamin') || (p.package_id === 'PKG005');
  if (isVit) {
    const oldPrice = parseFloat(p.price); // MRP
    const oldDiscPrice = parseFloat(p.discount_price); // Selling price
    if (!isNaN(oldPrice)) {
      p.price = String(Math.round(oldPrice * 1.15));
    }
    if (!isNaN(oldDiscPrice)) {
      p.discount_price = String(Math.round(oldDiscPrice * 1.15));
    }
    console.log(`Updated package: [${p.package_id}] ${p.package_name} -> MRP: ${p.price}, Selling Price: ${p.discount_price}`);
    pkgsUpdated++;
  }
});
fs.writeFileSync(pkgsCsvPath, Papa.unparse(pkgs), 'utf8');
console.log(`Saved ${pkgsUpdated} updated packages to packages.csv\n`);

console.log('=== Step 3: Update scripts/user_test_updates.csv ===');
const userUpdatesPath = path.join(root, 'scripts', 'user_test_updates.csv');
if (fs.existsSync(userUpdatesPath)) {
  const userContent = fs.readFileSync(userUpdatesPath, 'utf8');
  const userRows = Papa.parse(userContent, { header: true, skipEmptyLines: true }).data;
  userRows.forEach(u => {
    if ((u.test_name || '').toLowerCase().includes('vitamin')) {
      const oldPrice = parseFloat(u['New Price']);
      const oldMrp = parseFloat(u['Standard_price/MRP']);
      if (!isNaN(oldPrice)) u['New Price'] = String(Math.round(oldPrice * 1.15));
      if (!isNaN(oldMrp)) u['Standard_price/MRP'] = String(Math.round(oldMrp * 1.15));
    }
  });
  fs.writeFileSync(userUpdatesPath, Papa.unparse(userRows), 'utf8');
  console.log(`Updated user_test_updates.csv\n`);
}

console.log('=== Step 4: Update lib/pricing.ts ===');
const pricingPath = path.join(root, 'lib', 'pricing.ts');
let pricingTs = fs.readFileSync(pricingPath, 'utf8');
// Vitamin D Level (25-OH) price: 560 -> 644, mrp: 1040 -> 1196
// Vitamin B12 price: 2960 -> 3404, mrp: 5500 -> 6325
// Vitamin & Energy Check Package price: 949 -> 1091, mrp: 2465 -> 2835
pricingTs = pricingTs.replace(
  /(\s*name:\s*'Vitamin D Level \(25-OH\)',\s*price:\s*)560(,\s*mrp:\s*)1040/,
  '$1644$21196'
);
pricingTs = pricingTs.replace(
  /(\s*name:\s*'Vitamin B12',\s*price:\s*)2960(,\s*mrp:\s*)5500/,
  '$13404$26325'
);
pricingTs = pricingTs.replace(
  /(\s*name:\s*'Vitamin & Energy Check Package',\s*price:\s*)949(,\s*mrp:\s*)2465/,
  '$11091$22835'
);
fs.writeFileSync(pricingPath, pricingTs, 'utf8');
console.log('Updated lib/pricing.ts\n');

console.log('=== Step 5: Update lib/data.ts ===');
const dataPath = path.join(root, 'lib', 'data.ts');
let dataTs = fs.readFileSync(dataPath, 'utf8');
// test-7: Vitamin B12 & Folate price 616 -> 708, originalPrice 1540 -> 1771
// pkg-5: Vitamin & Energy Check Package price 949 -> 1091, originalPrice 2465 -> 2835
dataTs = dataTs.replace(
  /(\s*name:\s*'Vitamin B12 & Folate',\s*price:\s*)616(,\s*originalPrice:\s*)1540/,
  '$1708$21771'
);
dataTs = dataTs.replace(
  /(\s*name:\s*'Vitamin & Energy Check Package',\s*price:\s*)949(,\s*originalPrice:\s*)2465/,
  '$11091$22835'
);
fs.writeFileSync(dataPath, dataTs, 'utf8');
console.log('Updated lib/data.ts\n');

console.log('=== Step 6: Update lib/package-marketing.ts ===');
const mktgPath = path.join(root, 'lib', 'package-marketing.ts');
let mktgTs = fs.readFileSync(mktgPath, 'utf8');
// Huge 68% discount: Get this ₹2,465 premium test bundle for only ₹949
// updated discount is ~62%, MRP 2,835, price 1,091
mktgTs = mktgTs.replace(
  /Huge \d+% discount: Get this ₹2,465 premium test bundle for only ₹949/,
  'Huge 62% discount: Get this ₹2,835 premium test bundle for only ₹1,091'
);
fs.writeFileSync(mktgPath, mktgTs, 'utf8');
console.log('Updated lib/package-marketing.ts\n');

console.log('=== All updates complete! ===');
