const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'build', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('build/index.html not found');
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexPath, 'utf8');
const base64 = Buffer.from(htmlContent, 'utf8').toString('base64');

const files = ['main_server.js', 'server.js', 'app.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace EMBEDDED_INDEX_HTML line
  const regex = /const EMBEDDED_INDEX_HTML = Buffer\.from\('[^']+',\s*'base64'\)\.toString\('utf8'\);/;
  if (regex.test(content)) {
    content = content.replace(regex, `const EMBEDDED_INDEX_HTML = Buffer.from('${base64}', 'base64').toString('utf8');`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Synchronized EMBEDDED_INDEX_HTML in:', file);
  } else {
    console.warn('⚠️ Pattern not matched in:', file);
  }
});
