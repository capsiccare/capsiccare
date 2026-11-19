import fs from 'fs';
import path from 'path';

const root = process.cwd();
const brainDir = path.join('C:', 'Users', 'FusionIT', '.gemini', 'antigravity-ide', 'brain', '78e698bb-cdc1-4f88-a43d-b31d1ab34b99');
const outputDir = path.join(root, 'public', 'images', 'packages');

const mappings = [
  { brainFile: 'basic_full_body_checkup_1789806661718.jpg', targetSlug: 'basic-full-body-checkup.jpg' },
  { brainFile: 'diabetes_sugar_care_package_1789806692990.jpg', targetSlug: 'diabetes-sugar-care-package.jpg' },
  { brainFile: 'thyroid_wellness_check_package_1789806728159.jpg', targetSlug: 'thyroid-wellness-check-package.jpg' },
  { brainFile: 'heart_metabolic_check_package_1789806771854.jpg', targetSlug: 'heart-metabolic-check-package.jpg' },
  { brainFile: 'vitamin_energy_check_package_1789806824448.jpg', targetSlug: 'vitamin-energy-check-package.jpg' },
  { brainFile: 'comprehensive_healthy_heart_package_1789806868439.jpg', targetSlug: 'comprehensive-healthy-heart-package.jpg' },
  { brainFile: 'advanced_spine_joint_nerve_pain_package_1789806906071.jpg', targetSlug: 'advanced-spine-joint-nerve-pain-package.jpg' },
  { brainFile: 'neuro_metabolic_memory_wellness_package_1789806946015.jpg', targetSlug: 'neuro-metabolic-memory-wellness-package.jpg' },
  { brainFile: 'pcos_hormonal_women_wellness_package_1789806993609.jpg', targetSlug: 'pcos-hormonal-women-wellness-package.jpg' },
  { brainFile: 'orthopedic_bone_density_joint_package_1789807053066.jpg', targetSlug: 'orthopedic-bone-density-joint-package.jpg' },
  { brainFile: 'acute_infection_immunity_fever_package_1789807110840.jpg', targetSlug: 'acute-infection-immunity-fever-package.jpg' },
  { brainFile: 'advanced_diabetes_reversal_organ_shield_1789807163382.jpg', targetSlug: 'advanced-diabetes-reversal-organ-shield.jpg' },
  { brainFile: 'senior_citizen_chronic_disease_package_1789807223128.jpg', targetSlug: 'senior-citizen-chronic-disease-package.jpg' },
];

let copiedCount = 0;
mappings.forEach(m => {
  const src = path.join(brainDir, m.brainFile);
  const dest = path.join(outputDir, m.targetSlug);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copiedCount++;
    console.log(`Copied AI poster to public/images/packages/${m.targetSlug}`);
  } else {
    console.log(`Warning: Source file ${src} not found`);
  }
});

console.log(`Copied ${copiedCount} AI package posters to public/images/packages/!`);
