const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');
const serverPath = path.resolve(__dirname, '..', 'server.js');

if (fs.existsSync(indexPath) && fs.existsSync(serverPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  let serverCode = fs.readFileSync(serverPath, 'utf8');

  // Replace either placeholder or existing assignment
  const pattern = /const EMBEDDED_INDEX_HTML = [\s\S]*?;/;
  if (pattern.test(serverCode)) {
    serverCode = serverCode.replace(pattern, `const EMBEDDED_INDEX_HTML = ${JSON.stringify(htmlContent)};`);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('✅ Successfully embedded build/index.html into server.js (' + htmlContent.length + ' bytes)');
  } else {
    console.log('⚠️ EMBEDDED_INDEX_HTML pattern not found in server.js');
  }
} else {
  console.log('❌ Could not find build/index.html or server.js');
}
