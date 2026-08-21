/**
 * insert-tap-clean.js
 * Injects a require() call for Tap Payments routes into server files.
 * This approach is much more reliable than injecting raw code.
 */
const fs = require('fs');
const path = require('path');

const REQUIRE_LINE = `\n// 💳 TAP PAYMENTS GATEWAY\ntry { require('./server/tapRoutes')(app); } catch(e) { console.error('[Tap Routes] Failed to load:', e.message); }\n`;
const TAP_MARKER = '// 💳 TAP PAYMENTS GATEWAY';

['main_server.js', 'server.js', 'app.js'].forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');

  // Skip if already injected
  if (content.includes(TAP_MARKER)) {
    console.log(`⏩ ${file} already has Tap routes marker, skipping.`);
    return;
  }

  // Insert BEFORE the catch-all wildcard route (critical – must be before it)
  const catchall = content.indexOf('app.get(/.*/, ');
  if (catchall !== -1) {
    content = content.slice(0, catchall) + REQUIRE_LINE + '\n' + content.slice(catchall);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Injected Tap require() before catchall into ${file}`);
    return;
  }

  // Fallback: before app.listen
  const listenIdx = content.lastIndexOf('app.listen(');
  if (listenIdx !== -1) {
    content = content.slice(0, listenIdx) + REQUIRE_LINE + '\n' + content.slice(listenIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Injected Tap require() before listen into ${file}`);
  } else {
    console.log(`⚠️ Could not find insertion point in ${file}`);
  }
});
