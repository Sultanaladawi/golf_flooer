const fs = require('fs');
const path = require('path');

const cssAliases = ['main.v20260817.css', 'main.ff9e555f.css', 'main.f978a579.css', 'main.css'];
const jsAliases = ['main.v20260817.js', 'main.d6632411.js', 'main.dacf438b.js', 'main.2d15e045.js', 'main.b45cc53b.js', 'main.js'];

const cssDir = path.resolve(__dirname, '..', 'build', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir)
    .filter(f => f.startsWith('main.') && f.endsWith('.css') && !f.endsWith('.map') && !cssAliases.includes(f))
    .map(f => ({ name: f, time: fs.statSync(path.join(cssDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (cssFiles.length > 0) {
    const newestCss = path.join(cssDir, cssFiles[0].name);
    console.log(`✅ Using newest compiled CSS: ${cssFiles[0].name}`);
    cssAliases.forEach(a => {
      fs.copyFileSync(newestCss, path.join(cssDir, a));
    });
    console.log('✅ CSS Aliases created:', cssAliases.join(', '));
  }
}

const jsDir = path.resolve(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir)
    .filter(f => f.startsWith('main.') && f.endsWith('.js') && !f.endsWith('.map') && !jsAliases.includes(f))
    .map(f => ({ name: f, time: fs.statSync(path.join(jsDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (jsFiles.length > 0) {
    const newestJs = path.join(jsDir, jsFiles[0].name);
    console.log(`✅ Using newest compiled JS: ${jsFiles[0].name}`);
    jsAliases.forEach(a => {
      fs.copyFileSync(newestJs, path.join(jsDir, a));
    });
    console.log('✅ JS Aliases created:', jsAliases.join(', '));
  }
}
