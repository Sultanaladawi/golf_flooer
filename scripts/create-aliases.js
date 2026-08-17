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
    // Only keep main.js as single alias if needed
    fs.copyFileSync(path.join(jsDir, newest), path.join(jsDir, 'main.js'));
    // Remove stale extra main.*.js files
    mainFiles.slice(1).forEach(f => {
      try { fs.unlinkSync(path.join(jsDir, f.name)); } catch (_) {}
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
    mainFiles.slice(1).forEach(f => {
      try { fs.unlinkSync(path.join(cssDir, f.name)); } catch (_) {}
    });
  }
}
console.log('✅ Clean build directory ready for packaging.');
