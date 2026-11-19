import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const logoPath = path.join(root, 'public', 'logo.png');
const outputDir = path.join(root, 'public', 'images', 'packages');
const brainDir = path.join('C:', 'Users', 'FusionIT', '.gemini', 'antigravity-ide', 'brain', '78e698bb-cdc1-4f88-a43d-b31d1ab34b99');

// Load & resize official logo
const resizedLogoBuffer = await sharp(logoPath)
  .resize(75, 75, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const logoBase64 = `data:image/png;base64,${resizedLogoBuffer.toString('base64')}`;

// SVG header overlay containing official logo + Capsic Care text
const headerSvgOverlay = `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <!-- Header background patch to cleanly replace any AI text -->
    <rect x="300" y="0" width="424" height="135" fill="#ffffff" rx="20" opacity="0.95" />
    <g transform="translate(325, 25)">
      <image href="${logoBase64}" width="75" height="75" />
      <g transform="translate(88, 22)">
        <text x="0" y="24" fill="#004d40" font-family="-apple-system, sans-serif" font-size="30" font-weight="900" letter-spacing="1">CAPSIC CARE</text>
        <text x="0" y="46" fill="#0f766e" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" letter-spacing="0.5">PREVENT • DETECT • STAY HEALTHY</text>
      </g>
    </g>
  </svg>
`;

const targetFiles = [
  'holistic-allergy-inflammation-wellness-screen.jpg',
  'junior-wellness-child-growth-package.jpg',
  'neonatal-pediatric-allergy-nutrition-panel.jpg'
];

for (const fileName of targetFiles) {
  const filePath = path.join(outputDir, fileName);
  if (fs.existsSync(filePath)) {
    await sharp(filePath)
      .composite([{ input: Buffer.from(headerSvgOverlay), top: 0, left: 0 }])
      .jpeg({ quality: 95 })
      .toFile(filePath + '.tmp');

    fs.renameSync(filePath + '.tmp', filePath);
    console.log(`[Official Logo Composited] ${fileName}`);
  }
}

console.log('All 3 package posters updated with official Capsic Care logo!');
