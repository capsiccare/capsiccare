import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\FusionIT\\.gemini\\antigravity-ide\\brain\\78e698bb-cdc1-4f88-a43d-b31d1ab34b99';
const targetDir = path.resolve('public/images/packages');

const mapping = [
  {
    source: path.join(brainDir, 'fresh_holistic_allergy_premium_1789915964372.jpg'),
    target: path.join(targetDir, 'holistic-allergy-inflammation-wellness-screen.jpg')
  },
  {
    source: path.join(brainDir, 'fresh_junior_wellness_premium_1789916131363.jpg'),
    target: path.join(targetDir, 'junior-wellness-child-growth-package.jpg')
  },
  {
    source: path.join(brainDir, 'fresh_neonatal_pediatric_premium_1789916161572.jpg'),
    target: path.join(targetDir, 'neonatal-pediatric-allergy-nutrition-panel.jpg')
  }
];

mapping.forEach(({ source, target }) => {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`Copied ${source} -> ${target} (${(fs.statSync(target).size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`Source missing: ${source}`);
  }
});
