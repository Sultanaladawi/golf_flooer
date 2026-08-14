const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');
const serverPath = path.resolve(__dirname, '..', 'server.js');

if (fs.existsSync(indexPath) && fs.existsSync(serverPath)) {
  const htmlContent = fs.readFileSync(indexPath, 'utf8');
  let serverCode = fs.readFileSync(serverPath, 'utf8');

  // Base64 encode to completely prevent quotes/syntax errors during bundling
  const b64 = Buffer.from(htmlContent, 'utf8').toString('base64');
  const pattern = /const EMBEDDED_INDEX_HTML = [\s\S]*?;/;
  if (pattern.test(serverCode)) {
    serverCode = serverCode.replace(pattern, `const EMBEDDED_INDEX_HTML = Buffer.from('${b64}', 'base64').toString('utf8');`);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('✅ Successfully embedded build/index.html as Base64 into server.js (' + htmlContent.length + ' bytes)');
  } else {
    console.log('⚠️ EMBEDDED_INDEX_HTML pattern not found in server.js');
  }
} else {
  console.log('❌ Could not find build/index.html or server.js');
}
