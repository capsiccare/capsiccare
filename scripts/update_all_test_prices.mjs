import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();

const userCsvPath = path.join(root, 'scripts', 'user_tests.csv');
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');
const pricingTsPath = path.join(root, 'lib', 'pricing.ts');

const userCsvData = fs.readFileSync(userCsvPath, 'utf8');
const userParsed = Papa.parse(userCsvData, { header: false, skipEmptyLines: true }).data.slice(1);

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\w]/g, '')
    .trim();
}

const userMap = new Map();
userParsed.forEach(row => {
  const name = row[0];
  const actualPrice = parseFloat(row[1]); // Old inflated MRP
  const customerPrice = parseFloat(row[4]); // Approved Selling Price
  if (name && !isNaN(customerPrice)) {
    userMap.set(normalize(name), {
      originalName: name,
      actualPrice,
      customerPrice,
    });
  }
});

const testsCsvContent = fs.readFileSync(testsCsvPath, 'utf8');
const testsParsed = Papa.parse(testsCsvContent, { header: true, skipEmptyLines: true });

let updatedCount = 0;
const updatedTestsMap = new Map();

const updatedTests = testsParsed.data.map(testRow => {
  const norm = normalize(testRow.test_name);

  let sellingPrice = parseFloat(testRow.price);
  let oldMrp = parseFloat(testRow.mrp);

  if (userMap.has(norm)) {
    const userItem = userMap.get(norm);
    sellingPrice = userItem.customerPrice;
    if (!isNaN(userItem.actualPrice) && userItem.actualPrice > 0) {
      oldMrp = userItem.actualPrice;
    }
  }

  // Reduce inflated MRP by ~25% (multiplier ~0.74328)
  let finalMrp = Math.round((oldMrp * 0.74328) / 10) * 10;
  if (finalMrp <= sellingPrice) {
    finalMrp = Math.round((sellingPrice * 1.5) / 10) * 10;
  }

  testRow.price = sellingPrice.toString();
  testRow.mrp = finalMrp.toString();
  updatedTestsMap.set(testRow.test_id, { price: sellingPrice, mrp: finalMrp });
  updatedCount++;
  return testRow;
});

const outputCsv = Papa.unparse(updatedTests);
fs.writeFileSync(testsCsvPath, outputCsv, 'utf8');
console.log(`Successfully updated ${updatedCount} tests in tests.csv to match user_tests.csv!`);

// Also sync labTestsPricing in lib/pricing.ts
let pricingTsContent = fs.readFileSync(pricingTsPath, 'utf8');
updatedTestsMap.forEach((val, id) => {
  const idRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?price:\\s*)\\d+([\\s\\S]*?mrp:\\s*)\\d+`, 'g');
  pricingTsContent = pricingTsContent.replace(idRegex, `$1${val.price}$2${val.mrp}`);
});
fs.writeFileSync(pricingTsPath, pricingTsContent, 'utf8');
console.log('Synced lib/pricing.ts labTestsPricing!');
