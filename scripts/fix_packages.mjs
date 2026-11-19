import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const testsCsvPath = path.join(projectRoot, 'public', 'data', 'tests.csv');
const pkgTestsCsvPath = path.join(projectRoot, 'public', 'data', 'package-tests.csv');
const pkgsCsvPath = path.join(projectRoot, 'public', 'data', 'packages.csv');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(content, { header: true, skipEmptyLines: true }).data;
}

function writeCSV(filePath, data) {
  fs.writeFileSync(filePath, Papa.unparse(data));
}

const tests = parseCSV(testsCsvPath).filter(t => t.test_id);
const packageTests = parseCSV(pkgTestsCsvPath).filter(pt => pt.package_id && pt.test_id);
const packages = parseCSV(pkgsCsvPath).filter(p => p.package_id);

const testsMap = new Map();
tests.forEach(t => {
  testsMap.set(t.test_id, {
    mrp: parseFloat(t.mrp) || parseFloat(t.price) || 0,
    price: parseFloat(t.price) || 0 // price represents the selling (discounted) price in tests.csv
  });
});

const packageToTestsMap = new Map();
packageTests.forEach(pt => {
  const current = packageToTestsMap.get(pt.package_id) || [];
  current.push(pt.test_id);
  packageToTestsMap.set(pt.package_id, current);
});

let updatedCount = 0;

const updatedPackages = packages.map(pkg => {
  const testIds = packageToTestsMap.get(pkg.package_id) || [];
  if (testIds.length === 0) return pkg; // Skip if no tests mapped
  
  let totalMrp = 0;
  let totalPrice = 0;
  let validTestCount = 0;
  
  testIds.forEach(id => {
    const testData = testsMap.get(id);
    if (testData) {
      totalMrp += testData.mrp;
      totalPrice += testData.price;
      validTestCount++;
    }
  });
  
  // The user states: Packages 'price' = total MRP. 'discount_price' = 15% OFF total discount price.
  pkg.tests_included_count = validTestCount;
  pkg.price = Math.round(totalMrp);
  pkg.discount_price = Math.round(totalPrice * 0.85); // 15% extra discount beyond the individual test discounts
  
  updatedCount++;
  return pkg;
});

writeCSV(pkgsCsvPath, updatedPackages);
console.log(`Successfully recalculated counts, MRPs, and 15% bonus discounted prices for ${updatedCount} packages!`);
