const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ build/index.html not found');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const jsMatch = indexHtml.match(/\/static\/js\/(main\.[a-zA-Z0-9]+\.js)/i);
const cssMatch = indexHtml.match(/\/static\/css\/(main\.[a-zA-Z0-9]+\.css)/i);

const activeJs = jsMatch ? jsMatch[1] : null;
const activeCss = cssMatch ? cssMatch[1] : null;

const jsDir = path.resolve(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(jsDir) && activeJs) {
  console.log(`✅ Deterministic Active React JS bundle from index.html: ${activeJs}`);
  const activePath = path.join(jsDir, activeJs);
  if (fs.existsSync(activePath)) {
    const commonJsAliases = [
      'main.js',
      'main.2ac17bb4.js',
      'main.74ecaf7b.js',
      'main.ef562455.js',
      'main.c9aa5b70.js',
      'main.1c4e12f8.js',
      'main.d06341fa.js',
      'main.2be10d3c.js'
    ];
    for (const alias of commonJsAliases) {
      fs.copyFileSync(activePath, path.join(jsDir, alias));
    }
  }
}

const cssDir = path.resolve(__dirname, '..', 'build', 'static', 'css');
if (fs.existsSync(cssDir) && activeCss) {
  console.log(`✅ Deterministic Active React CSS bundle from index.html: ${activeCss}`);
  const activePath = path.join(cssDir, activeCss);
  if (fs.existsSync(activePath)) {
    const commonCssAliases = [
      'main.css',
      'main.c506378e.css',
      'main.ed86ab77.css',
      'main.224378c4.css',
      'main.6aed2f9a.css'
    ];
    for (const alias of commonCssAliases) {
      fs.copyFileSync(activePath, path.join(cssDir, alias));
    }
  }
}

console.log('✅ All JS & CSS bundles and aliases synchronised with build/index.html.');
