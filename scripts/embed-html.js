const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('❌ Could not find build/index.html');
  process.exit(1);
}

let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Detect the current main JS and CSS hash-named files
const jsMatch = htmlContent.match(/src="\/static\/js\/(main\.[a-f0-9]{8}\.js)"/);
const cssMatch = htmlContent.match(/href="\/static\/css\/(main\.[a-f0-9]{8}\.css)"/);

if (!jsMatch || !cssMatch) {
  console.log('❌ Could not detect JS/CSS bundle filenames in index.html');
  process.exit(1);
}

const jsFile = jsMatch[1];
const cssFile = cssMatch[1];
const REPO = 'Sultanaladawi/golf_flooer';
const BRANCH = 'main';
const CDN = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`;

console.log(`📦 JS bundle: ${jsFile}`);
console.log(`🎨 CSS bundle: ${cssFile}`);
console.log(`🌐 CDN base: ${CDN}`);

// Replace local asset references with CDN URLs
htmlContent = htmlContent
  .replace(
    new RegExp(`src="/static/js/${jsFile}"`, 'g'),
    `src="${CDN}/build/static/js/${jsFile}"`
  )
  .replace(
    new RegExp(`href="/static/css/${cssFile}"`, 'g'),
    `href="${CDN}/build/static/css/${cssFile}"`
  );

console.log(`✅ Replaced JS src with CDN URL`);
console.log(`✅ Replaced CSS href with CDN URL`);

// Write back to build/index.html (CDN version)
fs.writeFileSync(indexPath, htmlContent, 'utf8');

// Now embed into server files
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
      console.log(`✅ Embedded CDN index.html into ${t}`);
    } else {
      console.log(`⚠️ Pattern not found in ${t}`);
    }
  }
}
