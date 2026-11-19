import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();
const userCsvPath = path.join(root, 'scripts', 'user_test_updates.csv');
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');
const areaTestPagesCsvPath = path.join(root, 'public', 'data', 'area_test_pages.csv');
const serviceAreasCsvPath = path.join(root, 'public', 'data', 'service_areas.csv');

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const userContent = fs.readFileSync(userCsvPath, 'utf8');
const userParsed = Papa.parse(userContent, { header: true, skipEmptyLines: true }).data;

const testsContent = fs.readFileSync(testsCsvPath, 'utf8');
const testsParsed = Papa.parse(testsContent, { header: true, skipEmptyLines: true }).data;

const areaTestPagesContent = fs.readFileSync(areaTestPagesCsvPath, 'utf8');
const areaTestPages = Papa.parse(areaTestPagesContent, { header: true, skipEmptyLines: true }).data;

let serviceAreaIds = ['AREA001', 'AREA002', 'AREA003', 'AREA004', 'AREA005', 'AREA006', 'AREA007', 'AREA008', 'AREA009', 'AREA010', 'AREA011', 'AREA012', 'AREA013', 'AREA014', 'AREA015'];
if (fs.existsSync(serviceAreasCsvPath)) {
  const saContent = fs.readFileSync(serviceAreasCsvPath, 'utf8');
  const saParsed = Papa.parse(saContent, { header: true, skipEmptyLines: true }).data;
  if (saParsed.length > 0 && saParsed[0].area_id) {
    serviceAreaIds = saParsed.map(a => a.area_id);
  }
}

// Build map of existing tests by normalized name and exact name
const testMapByNormName = new Map();
const testMapByName = new Map();

testsParsed.forEach(t => {
  testMapByName.set(t.test_name.trim().toLowerCase(), t);
  testMapByNormName.set(normalizeName(t.test_name), t);
});

// Explicit aliases map
const aliasMap = {
  'ft3': 'Free T3 (Free Tri-Iodothyronine)',
  'ft4': 'Free T4 (Free Thyroxine)',
  'kft': 'Kidney Function Test (KFT)',
  'lft (liver function test)': 'Liver Function Test (LFT)',
  'lipid profile': 'Lipid Profile',
  'cbc (complete blood count)': 'Complete Blood Count (CBC)',
};

let updatedCount = 0;
let createdCount = 0;

for (const userRow of userParsed) {
  const rawName = userRow.test_name ? userRow.test_name.trim() : '';
  if (!rawName) continue;

  const newPrice = parseFloat(userRow['New Price']);
  const mrp = parseFloat(userRow['Standard_price/MRP']);

  if (isNaN(newPrice) || isNaN(mrp)) continue;

  const lowerRaw = rawName.toLowerCase();
  const norm = normalizeName(rawName);

  let targetTestName = aliasMap[lowerRaw] || rawName;
  let matchedTest = testMapByName.get(targetTestName.toLowerCase()) || testMapByNormName.get(normalizeName(targetTestName)) || testMapByName.get(lowerRaw) || testMapByNormName.get(norm);

  if (matchedTest) {
    matchedTest.price = String(newPrice);
    matchedTest.mrp = String(mrp);
    updatedCount++;
  } else {
    // Determine next ID
    let maxIdNum = 0;
    testsParsed.forEach(t => {
      const match = t.test_id?.match(/^TST(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }
    });

    const newTestId = `TST${String(maxIdNum + 1).padStart(4, '0')}`;
    const slug = `${slugify(rawName)}-test-near-me-best-lab`;
    
    let sampleType = 'Blood / Serum';
    if (lowerRaw.includes('urine')) sampleType = 'Urine';
    else if (lowerRaw.includes('stool') || lowerRaw.includes('faecal')) sampleType = 'Stool';
    else if (lowerRaw.includes('swab') || lowerRaw.includes('culture') || lowerRaw.includes('sputum')) sampleType = 'Swab / Culture';

    const newTestRecord = {
      test_id: newTestId,
      test_name: rawName,
      slug: slug,
      category_id: 'CAT002',
      price: String(newPrice),
      mrp: String(mrp),
      sample_type: sampleType,
      preparation: 'No special preparation required unless advised by doctor.',
      turnaround_time: 'Same day / 24 hours',
      short_description: `Get accurate ${rawName} diagnostic insights. Book home collection today for prompt results.`,
      full_description: `This diagnostic evaluation of ${rawName} is crucial for clinical assessment and preventive health monitoring. Utilising state-of-the-art laboratory technology, this investigation provides precise metrics that help your physician make informed medical decisions.`,
      parameters: rawName,
      report_type: 'PDF',
      home_collection_available: 'Yes',
      status: 'Active'
    };

    testsParsed.push(newTestRecord);
    testMapByName.set(lowerRaw, newTestRecord);
    testMapByNormName.set(norm, newTestRecord);
    createdCount++;
  }
}

console.log(`Updated ${updatedCount} existing tests, Created ${createdCount} new tests. Total tests: ${testsParsed.length}`);

// Write back updated tests.csv
const updatedTestsCsv = Papa.unparse(testsParsed);
fs.writeFileSync(testsCsvPath, updatedTestsCsv, 'utf8');
console.log(`Successfully updated ${testsCsvPath}`);

// Ensure area_test_pages.csv contains mappings for all tests
const existingMappings = new Set();
areaTestPages.forEach(m => {
  existingMappings.add(`${m.test_id}_${m.area_id}`);
});

let newAreaMappingsCount = 0;
testsParsed.forEach(t => {
  const testId = t.test_id;
  serviceAreaIds.slice(0, 6).forEach(areaId => {
    const key = `${testId}_${areaId}`;
    if (!existingMappings.has(key)) {
      areaTestPages.push({ test_id: testId, area_id: areaId });
      existingMappings.add(key);
      newAreaMappingsCount++;
    }
  });
});

if (newAreaMappingsCount > 0) {
  const updatedAreaTestPagesCsv = Papa.unparse(areaTestPages);
  fs.writeFileSync(areaTestPagesCsvPath, updatedAreaTestPagesCsv, 'utf8');
  console.log(`Added ${newAreaMappingsCount} area test page mappings.`);
}
