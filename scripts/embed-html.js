const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');
const serverPath = path.resolve(__dirname, '..', 'server.js');

if (fs.existsSync(indexPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  const b64 = Buffer.from(htmlContent, 'utf8').toString('base64');
  const pattern = /const EMBEDDED_INDEX_HTML = Buffer\.from\('[^']+'\s*,\s*'base64'\)\.toString\('utf8'\);/;

  const targets = ['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'];
  for (const t of targets) {
    const p = path.resolve(__dirname, '..', t);
    if (fs.existsSync(p)) {
      let code = fs.readFileSync(p, 'utf8');
      if (pattern.test(code)) {
        code = code.replace(pattern, `const EMBEDDED_INDEX_HTML = Buffer.from('${b64}', 'base64').toString('utf8');`);
        fs.writeFileSync(p, code, 'utf8');
        console.log(`✅ Embedded index.html into ${t}`);
      }
    }
  }
} else {
  console.log('❌ Could not find build/index.html');
}
