const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('❌ Could not find build/index.html');
  process.exit(1);
}

let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Strip any external CDN references and ensure clean relative paths
htmlContent = htmlContent.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/]+(@[^/]+)?\/build\//g, '/');

fs.writeFileSync(indexPath, htmlContent, 'utf8');
console.log('✅ index.html configured for direct local/Azure serving (no CDN dependency)');

// Now embed into server files for instant zero-disk-latency serving
const b64 = Buffer.from(htmlContent, 'utf8').toString('base64');
const pattern = /(?:const|var|let)\s+EMBEDDED_INDEX_HTML\s*=\s*Buffer\.from\(['"][^'"]+['"]\s*,\s*['"]base64['"]\)\.toString\(['"]utf8['"]\);/;

const targets = ['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'];
for (const t of targets) {
  const p = path.resolve(__dirname, '..', t);
  if (fs.existsSync(p)) {
    let code = fs.readFileSync(p, 'utf8');
    if (pattern.test(code)) {
      code = code.replace(pattern, `const EMBEDDED_INDEX_HTML = Buffer.from('${b64}', 'base64').toString('utf8');`);
      fs.writeFileSync(p, code, 'utf8');
      console.log(`✅ Embedded direct local index.html into ${t}`);
    } else {
      console.log(`⚠️ Pattern not found in ${t}`);
    }
  }
}
