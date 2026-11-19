import fs from 'fs';
import path from 'path';

const root = process.cwd();
const brainDir = path.join('C:', 'Users', 'FusionIT', '.gemini', 'antigravity-ide', 'brain', '78e698bb-cdc1-4f88-a43d-b31d1ab34b99');
const outputDir = path.join(root, 'public', 'images', 'packages');

const filesToCopy = [
  {
    brainFile: 'holistic_allergy_inflammation_wellness_screen_fresh_ai_1789914813543.jpg',
    targetSlug: 'holistic-allergy-inflammation-wellness-screen.jpg'
  },
  {
    brainFile: 'junior_wellness_child_growth_package_fresh_ai_1789914843648.jpg',
    targetSlug: 'junior-wellness-child-growth-package.jpg'
  },
  {
    brainFile: 'neonatal_pediatric_allergy_nutrition_panel_fresh_ai_1789914871775.jpg',
    targetSlug: 'neonatal-pediatric-allergy-nutrition-panel.jpg'
  }
];

const brainFiles = fs.readdirSync(brainDir);

filesToCopy.forEach(item => {
  let src = path.join(brainDir, item.brainFile);
  if (!fs.existsSync(src)) {
    const prefix = item.brainFile.split('_fresh_ai')[0];
    const match = brainFiles.find(f => f.startsWith(prefix) && f.includes('fresh_ai') && f.endsWith('.jpg'));
    if (match) {
      src = path.join(brainDir, match);
    }
  }

  if (fs.existsSync(src)) {
    const dest = path.join(outputDir, item.targetSlug);
    fs.copyFileSync(src, dest);
    const stats = fs.statSync(dest);
    console.log(`[Copied Fresh Pure AI Poster] ${item.targetSlug} (${Math.round(stats.size / 1024)} KB)`);
  } else {
    console.error(`Error: Could not find ${item.brainFile} in brain directory`);
  }
});
