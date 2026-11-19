import fs from 'fs';
import path from 'path';

const root = process.cwd();
const brainDir = path.join('C:', 'Users', 'FusionIT', '.gemini', 'antigravity-ide', 'brain', '78e698bb-cdc1-4f88-a43d-b31d1ab34b99');
const outputDir = path.join(root, 'public', 'images', 'packages');

const mappings = [
  {
    brainFile: 'holistic_allergy_inflammation_wellness_screen_ai_1789911485438.jpg',
    targetSlug: 'holistic-allergy-inflammation-wellness-screen.jpg'
  },
  {
    brainFile: 'junior_wellness_child_growth_package_ai_1789911509979.jpg',
    targetSlug: 'junior-wellness-child-growth-package.jpg'
  },
  {
    brainFile: 'neonatal_pediatric_allergy-nutrition_panel_ai_1789911534180.jpg',
    targetSlug: 'neonatal-pediatric-allergy-nutrition-panel.jpg'
  }
];

// Fallback search in brainDir if exact filename timestamp differs slightly
const brainFiles = fs.readdirSync(brainDir);

mappings.forEach(m => {
  let src = path.join(brainDir, m.brainFile);
  if (!fs.existsSync(src)) {
    const prefix = m.targetSlug.replace('.jpg', '').replace(/-/g, '_');
    const matched = brainFiles.find(f => f.startsWith(prefix) && f.endsWith('.jpg'));
    if (matched) {
      src = path.join(brainDir, matched);
    }
  }

  if (fs.existsSync(src)) {
    const dest = path.join(outputDir, m.targetSlug);
    fs.copyFileSync(src, dest);
    const stats = fs.statSync(dest);
    console.log(`[Copied AI Image] ${m.targetSlug} (${Math.round(stats.size / 1024)} KB)`);
  } else {
    console.error(`Error: Could not find source file for ${m.targetSlug}`);
  }
});
