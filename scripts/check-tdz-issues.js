const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'build') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find index of export default function
  let exportDefLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export default function') || lines[i].includes('export default (function') || lines[i].includes('export default class')) {
      exportDefLine = i;
      break;
    }
  }

  if (exportDefLine === -1) return;

  // Check lines AFTER export default function for const/let definitions of styles or objects that are used inside the component
  for (let i = exportDefLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('const ') || line.startsWith('let ')) {
      // If it's a top-level const outside any function (indentation 0)
      if (lines[i].startsWith('const ') || lines[i].startsWith('let ')) {
        const varName = line.split(' ')[1].split('=')[0].trim();
        console.log(`⚠️ Potential TDZ in ${path.relative(__dirname, filePath)}: line ${i+1}: const ${varName}`);
      }
    }
  }
}

scanDir(path.join(__dirname, '..', 'src'));
console.log('✅ TDZ Scan finished.');
