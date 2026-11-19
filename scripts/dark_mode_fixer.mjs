import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const dirsToScan = [
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'components')
];

let filesModified = 0;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Match className="..." and className={`...`} attributes
      const newContent = content.replace(/className=(["`'])(.*?)\1/g, (match, quote, classStr) => {
        let classes = classStr.split(' ');
        
        // Find if it has a typically light background
        const lightBgTriggers = ['bg-white', 'bg-slate-50', 'bg-teal-50', 'bg-cyan-50'];
        const hasLightBg = classes.some(c => lightBgTriggers.includes(c));
        
        // Find if it ALREADY has a dark equivalent background
        const hasDarkBg = classes.some(c => c.startsWith('dark:bg-') || c.startsWith('dark:from-') || c === 'dark:glass-dark');
        
        if (hasLightBg && !hasDarkBg) {
          classes.push('dark:bg-[#0a0e14]'); // Forcing strict deep black/slate
          modified = true;
          return `className=${quote}${classes.join(' ')}${quote}`;
        }
        
        return match;
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, newContent);
        filesModified++;
        console.log(`Injected strict dark mode background into: ${fullPath.replace(projectRoot, '')}`);
      }
    }
  }
}

dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});
console.log(`Global dark mode scan and fix complete! Manipulated ${filesModified} unique files.`);
