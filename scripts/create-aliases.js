const fs = require('fs');
const path = require('path');

// Clean up any old duplicate bundles to keep deploy package ultra-light
const jsDir = path.resolve(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(jsDir)) {
  const allFiles = fs.readdirSync(jsDir);
  const mainFiles = allFiles
    .filter(f => f.startsWith('main.') && f.endsWith('.js') && !f.endsWith('.map') && f !== 'main.js')
    .map(f => ({ name: f, time: fs.statSync(path.join(jsDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (mainFiles.length > 0) {
    const newest = mainFiles[0].name;
    console.log(`✅ Active React JS bundle: ${newest}`);
    // Create aliases
    fs.copyFileSync(path.join(jsDir, newest), path.join(jsDir, 'main.js'));
    fs.copyFileSync(path.join(jsDir, newest), path.join(jsDir, 'main.ef562455.js'));
    fs.copyFileSync(path.join(jsDir, newest), path.join(jsDir, 'main.c9aa5b70.js'));
    // Remove other stale files
    mainFiles.slice(1).forEach(f => {
      if (f.name !== 'main.ef562455.js' && f.name !== 'main.c9aa5b70.js') {
        try { fs.unlinkSync(path.join(jsDir, f.name)); } catch (_) {}
      }
    });
  }
}

const cssDir = path.resolve(__dirname, '..', 'build', 'static', 'css');
if (fs.existsSync(cssDir)) {
  const allFiles = fs.readdirSync(cssDir);
  const mainFiles = allFiles
    .filter(f => f.startsWith('main.') && f.endsWith('.css') && !f.endsWith('.map') && f !== 'main.css')
    .map(f => ({ name: f, time: fs.statSync(path.join(cssDir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (mainFiles.length > 0) {
    const newest = mainFiles[0].name;
    console.log(`✅ Active React CSS bundle: ${newest}`);
    fs.copyFileSync(path.join(cssDir, newest), path.join(cssDir, 'main.css'));
    fs.copyFileSync(path.join(cssDir, newest), path.join(cssDir, 'main.c506378e.css'));
    fs.copyFileSync(path.join(cssDir, newest), path.join(cssDir, 'main.ed86ab77.css'));
    mainFiles.slice(1).forEach(f => {
      if (f.name !== 'main.c506378e.css' && f.name !== 'main.ed86ab77.css') {
        try { fs.unlinkSync(path.join(cssDir, f.name)); } catch (_) {}
      }
    });
  }
}
console.log('✅ Clean build directory ready for packaging.');
