import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const root = process.cwd();
const pkgsCsvPath = path.join(root, 'public', 'data', 'packages.csv');
const marketingTsPath = path.join(root, 'lib', 'package-marketing.ts');
const pricingTsPath = path.join(root, 'lib', 'pricing.ts');
const dataTsPath = path.join(root, 'lib', 'data.ts');

const pkgsCsv = Papa.parse(fs.readFileSync(pkgsCsvPath, 'utf8'), { header: true, skipEmptyLines: true }).data;
let marketingContent = fs.readFileSync(marketingTsPath, 'utf8');

const replacements = [
  { slug: 'basic-full-body-checkup', price: 699, mrp: 1713, oldPriceText: '₹599', newPriceText: '₹699' },
  { slug: 'thyroid-wellness-check-package', price: 499, mrp: 1289, oldPriceText: '₹399', newPriceText: '₹499' },
  { slug: 'heart-metabolic-check-package', price: 799, mrp: 1879, oldPriceText: '₹699', newPriceText: '₹799' },
  { slug: 'vitamin-energy-check-package', price: 1091, mrp: 2835, oldPriceText: '₹949', newPriceText: '₹1,091' },
  { slug: 'acute-infection-immunity-fever-package', price: 849, mrp: 2400, oldPriceText: '₹699', newPriceText: '₹849' },
  { slug: 'senior-citizen-chronic-disease-package', price: 1299, mrp: 3600, oldPriceText: '₹1,099', newPriceText: '₹1,299' },
  { slug: 'junior-wellness-child-growth-package', price: 949, mrp: 2600, oldPriceText: '₹799', newPriceText: '₹949' },
];

replacements.forEach(r => {
  // Update marketing copy
  marketingContent = marketingContent.replace(
    new RegExp(`(slug:\\s*'${r.slug}'[\\s\\S]*?)${r.oldPriceText}`, 'g'),
    `$1${r.newPriceText}`
  );
});

fs.writeFileSync(marketingTsPath, marketingContent, 'utf8');
console.log('Updated marketing text price references in lib/package-marketing.ts!');

// Sync lib/pricing.ts healthPackagesPricing
let pricingTsContent = fs.readFileSync(pricingTsPath, 'utf8');
pkgsCsv.forEach(pkg => {
  const id = pkg.package_id;
  const price = parseFloat(pkg.discount_price);
  const mrp = parseFloat(pkg.price);

  const idRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?price:\\s*)\\d+([\\s\\S]*?mrp:\\s*)\\d+`, 'g');
  pricingTsContent = pricingTsContent.replace(idRegex, `$1${price}$2${mrp}`);
});
fs.writeFileSync(pricingTsPath, pricingTsContent, 'utf8');
console.log('Synced package prices in lib/pricing.ts!');

// Sync lib/data.ts healthPackages
let dataTsContent = fs.readFileSync(dataTsPath, 'utf8');
pkgsCsv.forEach((pkg, i) => {
  const id = `pkg-${i + 1}`;
  const price = parseFloat(pkg.discount_price);
  const mrp = parseFloat(pkg.price);

  const idRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?price:\\s*)\\d+([\\s\\S]*?originalPrice:\\s*)\\d+`, 'g');
  dataTsContent = dataTsContent.replace(idRegex, `$1${price}$2${mrp}`);
});
fs.writeFileSync(dataTsPath, dataTsContent, 'utf8');
console.log('Synced package prices in lib/data.ts!');
