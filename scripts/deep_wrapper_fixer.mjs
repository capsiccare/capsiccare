import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

let fixedCount = 0;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Specifically targeting bare root wrappers used across the app 
      // which previously relied purely on CSS cascading var(--color-background)
      if (content.includes('className="w-full"')) {
        content = content.replace(/className="w-full"/g, 'className="w-full bg-white dark:bg-[#0a0e14]"');
        fs.writeFileSync(fullPath, content);
        fixedCount++;
        console.log(`Secured root wrapper background in: ${fullPath.replace(projectRoot, '')}`);
      }
    }
  }
}

const appDir = path.join(projectRoot, 'app');
if (fs.existsSync(appDir)) {
  processDirectory(appDir);
}

console.log(`Successfully hardcoded hex backgrounds onto ${fixedCount} exposed layout wrappers globally.`);
