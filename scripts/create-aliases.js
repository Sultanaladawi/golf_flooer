const fs = require('fs');
const path = require('path');

const cssDir = path.resolve(__dirname, '..', 'build', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.startsWith('main.') && f.endsWith('.css'));
  if (cssFiles.length > 0) {
    const mainCss = path.join(cssDir, cssFiles[0]);
    const cssAliases = ['main.ff9e555f.css', 'main.f978a579.css', 'main.css'];
    cssAliases.forEach(a => {
      fs.copyFileSync(mainCss, path.join(cssDir, a));
    });
    console.log('✅ CSS Aliases created:', cssAliases.join(', '));
  }
}

const jsDir = path.resolve(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.startsWith('main.') && f.endsWith('.js'));
  if (jsFiles.length > 0) {
    const mainJs = path.join(jsDir, jsFiles[0]);
    const jsAliases = [
      'main.d6632411.js',
      'main.dacf438b.js',
      'main.2d15e045.js',
      'main.b45cc53b.js',
      'main.js'
    ];
    jsAliases.forEach(a => {
      fs.copyFileSync(mainJs, path.join(jsDir, a));
    });
    console.log('✅ JS Aliases created:', jsAliases.join(', '));
  }
}
