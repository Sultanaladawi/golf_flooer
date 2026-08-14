const fs = require('fs');
const path = require('path');

const cssDir = path.resolve(__dirname, '..', 'build', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.startsWith('main.') && f.endsWith('.css'));
  if (cssFiles.length > 0) {
    const mainCss = path.join(cssDir, cssFiles[0]);
    fs.copyFileSync(mainCss, path.join(cssDir, 'main.ff9e555f.css'));
    fs.copyFileSync(mainCss, path.join(cssDir, 'main.css'));
    console.log('✅ CSS Aliases created:', cssFiles[0], '-> main.ff9e555f.css & main.css');
  }
}

const jsDir = path.resolve(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.startsWith('main.') && f.endsWith('.js'));
  if (jsFiles.length > 0) {
    const mainJs = path.join(jsDir, jsFiles[0]);
    fs.copyFileSync(mainJs, path.join(jsDir, 'main.2d15e045.js'));
    fs.copyFileSync(mainJs, path.join(jsDir, 'main.b45cc53b.js'));
    fs.copyFileSync(mainJs, path.join(jsDir, 'main.js'));
    console.log('✅ JS Aliases created:', jsFiles[0], '-> main.2d15e045.js, main.b45cc53b.js & main.js');
  }
}
