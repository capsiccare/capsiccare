import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();
const userCsvPath = path.join(root, 'scripts', 'user_test_updates.csv');
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');

function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const userContent = fs.readFileSync(userCsvPath, 'utf8');
const userParsed = Papa.parse(userContent, { header: true, skipEmptyLines: true }).data;

const testsContent = fs.readFileSync(testsCsvPath, 'utf8');
const testsParsed = Papa.parse(testsContent, { header: true, skipEmptyLines: true }).data;

const testMapByNormName = new Map();
testsParsed.forEach(t => {
  testMapByNormName.set(normalizeName(t.test_name), t);
  testMapByNormName.set(t.test_name.trim().toLowerCase(), t);
});

let matched = 0;
let mismatches = [];

userParsed.forEach((row, idx) => {
  const rawName = row.test_name ? row.test_name.trim() : '';
  if (!rawName) return;

  const expectedPrice = parseFloat(row['New Price']);
  const expectedMrp = parseFloat(row['Standard_price/MRP']);

  if (isNaN(expectedPrice) || isNaN(expectedMrp)) return;

  const norm = normalizeName(rawName);
  const found = testMapByNormName.get(norm) || testMapByNormName.get(rawName.toLowerCase());

  if (found) {
    const actualPrice = parseFloat(found.price);
    const actualMrp = parseFloat(found.mrp);

    if (actualPrice !== expectedPrice || actualMrp !== expectedMrp) {
      mismatches.push({
        name: rawName,
        expectedPrice,
        actualPrice,
        expectedMrp,
        actualMrp
      });
    } else {
      matched++;
    }
  } else {
    mismatches.push({
      name: rawName,
      error: 'Not found in tests.csv'
    });
  }
});

console.log('--- TEST PRICING AUDIT RESULT ---');
console.log(`Successfully verified matching tests: ${matched} / ${userParsed.length}`);
if (mismatches.length > 0) {
  console.log(`Found ${mismatches.length} mismatches:`);
  console.log(JSON.stringify(mismatches.slice(0, 20), null, 2));
} else {
  console.log('PERFECT 100% MATCH! All test prices and MRPs match the user provided dataset exactly!');
}
