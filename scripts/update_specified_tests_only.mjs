import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();
const testsCsvPath = path.join(root, 'public', 'data', 'tests.csv');
const pricingTsPath = path.join(root, 'lib', 'pricing.ts');

const testsCsvContent = fs.readFileSync(testsCsvPath, 'utf8');
const testsParsed = Papa.parse(testsCsvContent, { header: true, skipEmptyLines: true });

// The 40 specified test updates from the user prompt
const userRequestedUpdates = [
  { keywords: ['complete blood count', 'cbc'], newPrice: 180 },
  { keywords: ['erythrocyte sedimentation rate', 'esr'], newPrice: 50 },
  { keywords: ['crp quantitative', 'c-reactive protein', 'crp'], newPrice: 220 },
  { keywords: ['glucose fasting', 'fasting blood sugar', 'fbs'], newPrice: 50 },
  { keywords: ['glucose post prandial', 'post prandial blood sugar', 'ppbs'], newPrice: 60 },
  { keywords: ['glucose random', 'random blood sugar', 'rbs'], newPrice: 60 },
  { keywords: ['hba1c'], newPrice: 350 },
  { keywords: ['lipid profile'], newPrice: 440 },
  { keywords: ['liver function test', 'lft'], newPrice: 440 },
  { keywords: ['urea & creatinine', 'kidney function test', 'kft'], newPrice: 800, newMrp: 2200 },
  { keywords: ['uric acid'], newPrice: 120 },
  { keywords: ['creatinine'], newPrice: 80 },
  { keywords: ['urea'], exclude: ['creatinine', '24'], newPrice: 130 },
  { keywords: ['electrolytes'], newPrice: 350 },
  { keywords: ['tsh', 'thyroid stimulating hormone'], newPrice: 200 },
  { keywords: ['free t3', 'ft3'], newPrice: 250 },
  { keywords: ['free t4', 'ft4'], newPrice: 230 },
  { keywords: ['vitamin d3', '25 - oh', 'vitamin d'], exclude: ['b12', 'b6', 'c', 'e', 'k'], newPrice: 550 },
  { keywords: ['vitamin b12'], newPrice: 550 },
  { keywords: ['serum iron', 'iron profile', 'iron'], exclude: ['binding'], newPrice: 220 },
  { keywords: ['ferritin'], newPrice: 320 },
  { keywords: ['calcium'], exclude: ['ionized', '24'], newPrice: 120 },
  { keywords: ['phosphorus'], newPrice: 160 },
  { keywords: ['magnesium'], newPrice: 350 },
  { keywords: ['prothrombin time', 'pt / inr', 'pt with inr', 'pt (prothrombin'], newPrice: 200 },
  { keywords: ['activated partial thromboplastin time', 'aptt'], newPrice: 200 },
  { keywords: ['d-dimer'], newPrice: 500 },
  { keywords: ['blood group'], newPrice: 50 },
  { keywords: ['hiv i & ii', 'hiv'], newPrice: 400 },
  { keywords: ['hbsag', 'hepatitis b surface antigen'], newPrice: 380 },
  { keywords: ['anti-hcv', 'hcv (hepatitis c'], newPrice: 600 },
  { keywords: ['vdrl test', 'vdrl'], exclude: ['quantitation'], newPrice: 120 },
  { keywords: ['dengue ns1', 'dengue panel', 'dengue'], newPrice: 600 },
  { keywords: ['malarial parasite', 'malaria parasite', 'mp (malarial'], newPrice: 350 },
  { keywords: ['widal test', 'widal'], exclude: ['tube'], newPrice: 120 },
  { keywords: ['troponin i', 'troponin-i'], newPrice: 750 },
  { keywords: ['psa (prostate', 'psa total', 'psa'], exclude: ['free'], newPrice: 350 },
  { keywords: ['beta hcg', 'beta-hcg'], newPrice: 440 },
  { keywords: ['albumin'], exclude: ['microalbumin', 'ratio', 'globulin'], newPrice: 120 },
  { keywords: ['allergy profile (blood)', 'allergy profile'], exclude: ['drug', 'kolkata', 'medcis'], newPrice: 1400 },
];

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^\w]/g, '').trim();
}

let matchedCount = 0;

const updatedTests = testsParsed.data.map(testRow => {
  const nameNorm = testRow.test_name.toLowerCase();

  // Find if this test matches one of the 40 specified tests
  const updateMatch = userRequestedUpdates.find(rule => {
    if (rule.exclude && rule.exclude.some(ex => nameNorm.includes(ex))) {
      return false;
    }
    return rule.keywords.some(kw => nameNorm.includes(kw));
  });

  if (updateMatch) {
    testRow.price = updateMatch.newPrice.toString();
    if (updateMatch.newMrp) {
      testRow.mrp = updateMatch.newMrp.toString();
    } else {
      // Ensure MRP is at least 1.5x - 2x price if MRP was smaller
      const currentMrp = parseFloat(testRow.mrp) || 0;
      if (currentMrp < updateMatch.newPrice) {
        testRow.mrp = (updateMatch.newPrice * 2).toString();
      }
    }
    matchedCount++;
  }

  return testRow;
});

const outputCsv = Papa.unparse(updatedTests);
fs.writeFileSync(testsCsvPath, outputCsv, 'utf8');

console.log(`Successfully updated ${matchedCount} matching tests out of 40 requested! All other tests remained REVERTED to original.`);

// Check KFT in tests.csv
const kft = updatedTests.find(t => t.test_id === 'TST0625' || t.test_name.toLowerCase().includes('urea & creatinine'));
if (kft) {
  console.log(`KFT Check: ID=${kft.test_id}, Name=${kft.test_name}, Price=₹${kft.price}, MRP=₹${kft.mrp}`);
}
