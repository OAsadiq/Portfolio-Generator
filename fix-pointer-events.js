import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to fix
const filesToFix = [
  'src/pages/TemplateSelection.tsx',
  'src/pages/CreatePortfolio.tsx',
  'src/components/HeroSection.tsx',
  'src/components/FeatureSection.tsx',
  'src/components/HowItWorksSection.tsx',
  // Add more files as needed
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add pointer-events-none to absolute/fixed inset-0 divs that don't have it
    content = content.replace(
      /className="((?:absolute|fixed)[^"]*inset-0[^"]*)"/g,
      (match, classes) => {
        if (!classes.includes('pointer-events-none')) {
          return `className="${classes} pointer-events-none"`;
        }
        return match;
      }
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`❌ Not found: ${filePath}`);
  }
});