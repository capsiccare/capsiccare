import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const userCsvPath = path.join(process.cwd(), 'scripts', 'user_tests.csv');
const userCsvData = fs.readFileSync(userCsvPath, 'utf8');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\w]/g, '')
    .trim();
}

const parsedUser = Papa.parse(userCsvData, { header: false, skipEmptyLines: true });
const userRows = parsedUser.data.slice(1);

const userMap = new Map();
userRows.forEach(row => {
  const name = row[0];
  const actualPrice = parseFloat(row[1]);
  const customerPrice = parseFloat(row[4]);
  if (name) {
    userMap.set(normalize(name), {
      originalName: name,
      actualPrice,
      customerPrice,
    });
  }
});

const existingCsvPath = path.join(process.cwd(), 'public', 'data', 'tests.csv');
const existingContent = fs.readFileSync(existingCsvPath, 'utf8');
const existingParsed = Papa.parse(existingContent, { header: true, skipEmptyLines: true });

let updatedCount = 0;
const updatedTests = existingParsed.data.map(testRow => {
  const norm = normalize(testRow.test_name);
  if (userMap.has(norm)) {
    const userItem = userMap.get(norm);
    testRow.price = userItem.customerPrice.toString();
    testRow.mrp = userItem.actualPrice.toString();
    updatedCount++;
  }
  return testRow;
});

const outputCsv = Papa.unparse(updatedTests);
fs.writeFileSync(existingCsvPath, outputCsv, 'utf8');

console.log(`Successfully updated ${updatedCount} / ${updatedTests.length} tests in tests.csv!`);
