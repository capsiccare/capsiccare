const fs = require('fs');
const path = require('path');

const serviceAreasPath = path.join(__dirname, '../public/data/service_areas.csv');
const areaTestPagesPath = path.join(__dirname, '../public/data/area_test_pages.csv');
const testsPath = path.join(__dirname, '../public/data/tests.csv');

// 1. Read existing service areas
let serviceAreasCsv = fs.readFileSync(serviceAreasPath, 'utf8').trim();
let serviceAreaLines = serviceAreasCsv.split(/\r?\n/);

const newAreas = [
  { id: 'AREA061', name: 'Bankra Bazar', slug: 'bankra-bazar', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA062', name: 'Kabar Para', slug: 'kabar-para', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA063', name: 'Kona', slug: 'kona', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA064', name: 'Makardah', slug: 'makardah', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA065', name: 'Salap', slug: 'salap', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA066', name: 'Nibra', slug: 'nibra', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA067', name: 'Andul', slug: 'andul', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA068', name: 'Mahiari', slug: 'mahiari', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA069', name: 'Kadamtala', slug: 'kadamtala', district: 'Howrah', type: 'Home Collection', status: 'Active' },
  { id: 'AREA070', name: 'Jalan Complex', slug: 'jalan-complex', district: 'Howrah', type: 'Home Collection', status: 'Active' },
];

const existingAreaSlugs = new Set();
for (let i = 1; i < serviceAreaLines.length; i++) {
  const parts = serviceAreaLines[i].split(',');
  if (parts[2]) existingAreaSlugs.add(parts[2].trim());
}

newAreas.forEach(area => {
  if (!existingAreaSlugs.has(area.slug)) {
    serviceAreaLines.push(`${area.id},${area.name},${area.slug},${area.district},${area.type},${area.status}`);
  }
});

fs.writeFileSync(serviceAreasPath, serviceAreaLines.join('\n') + '\n', 'utf8');
console.log('Updated service_areas.csv with new Bankra & Howrah areas.');

// 2. Read tests and map priority Bankra areas to area_test_pages.csv
const testsCsv = fs.readFileSync(testsPath, 'utf8').trim();
const testLines = testsCsv.split(/\r?\n/);
const testIds = [];
for (let i = 1; i < testLines.length; i++) {
  const line = testLines[i];
  if (!line) continue;
  const match = line.match(/^(TST\d+)/);
  if (match) {
    testIds.push(match[1]);
  }
}

// Priority area IDs that should be mapped for tests
// AREA026 = Bankra, AREA061 = Bankra Bazar, AREA062 = Kabar Para, AREA063 = Kona,
// AREA064 = Makardah, AREA033 = Domjur, AREA031 = Santragachi, AREA065 = Salap
const priorityAreaIds = [
  'AREA026', // Bankra
  'AREA061', // Bankra Bazar
  'AREA062', // Kabar Para
  'AREA063', // Kona
  'AREA064', // Makardah
  'AREA033', // Domjur
  'AREA031', // Santragachi
  'AREA065', // Salap
];

let areaTestPagesCsv = fs.readFileSync(areaTestPagesPath, 'utf8').trim();
let areaTestLines = areaTestPagesCsv.split(/\r?\n/);
const existingPairs = new Set();
for (let i = 1; i < areaTestLines.length; i++) {
  const [tId, aId] = areaTestLines[i].split(',');
  if (tId && aId) {
    existingPairs.add(`${tId.trim()},${aId.trim()}`);
  }
}

let addedCount = 0;
testIds.forEach(testId => {
  priorityAreaIds.forEach(areaId => {
    const pair = `${testId},${areaId}`;
    if (!existingPairs.has(pair)) {
      areaTestLines.push(pair);
      existingPairs.add(pair);
      addedCount++;
    }
  });
});

fs.writeFileSync(areaTestPagesPath, areaTestLines.join('\n') + '\n', 'utf8');
console.log(`Updated area_test_pages.csv: added ${addedCount} new mappings.`);
