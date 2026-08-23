const fs = require('fs');
const path = require('path');

const files = ['main_server.js', 'server.js', 'app.js'];

files.forEach(file => {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('server_tracker')) {
    console.log(`Already patched in ${file}`);
    return;
  }
  const target = "app.post(\"/api/cart/abandoned\"";
  if (content.includes(target)) {
    content = content.replace(target, "try { require('./server_tracker')(app, db); } catch (e) { console.error('[Tracker Init Error]:', e); }\n\n" + target);
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Successfully patched ${file}`);
  } else {
    console.warn(`Target not found in ${file}`);
  }
});
