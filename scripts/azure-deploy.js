const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function makeKuduRequest(scmHost, basicAuth, reqPath, method = 'GET', data = null, headers = {}) {
  const safePath = encodeURI(reqPath);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: safePath,
      method: method,
      headers: {
        'Authorization': basicAuth,
        'User-Agent': 'Antigravity-Direct-Sync/3.0',
        ...headers
      },
      timeout: 120000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
    });

    req.on('error', (err) => resolve({ code: 0, msg: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ code: 408, msg: 'Timeout', body: '' }); });

    if (data) {
      if (typeof data.pipe === 'function') {
        data.pipe(req);
      } else {
        req.write(data);
        req.end();
      }
    } else {
      req.end();
    }
  });
}

async function ensureRemoteDir(scmHost, basicAuth, remoteDirPath) {
  await makeKuduRequest(scmHost, basicAuth, `/api/vfs/site/wwwroot/${remoteDirPath}/`, 'PUT', null, { 'If-Match': '*' });
}

async function uploadDirectFile(scmHost, basicAuth, localPath, remotePath) {
  if (!fs.existsSync(localPath)) return false;
  const content = fs.readFileSync(localPath);
  const res = await makeKuduRequest(scmHost, basicAuth, `/api/vfs/site/wwwroot/${remotePath}`, 'PUT', content, {
    'If-Match': '*'
  });
  ghNotice(`Uploaded ${remotePath} -> HTTP ${res.code} ${res.msg}`);
  return res.code >= 200 && res.code < 300;
}

async function main() {
  ghNotice('🚀 Starting Critical Asset Synchronization & Deploy...');

  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || process.env.PUBLISH_PROFILE || '';
  if (!rawSecret || rawSecret.trim().length === 0) {
    ghError('AZURE_WEBAPP_PUBLISH_PROFILE secret is empty or missing in GitHub Secrets!');
    process.exit(1);
  }

  const profileBlocks = rawSecret.match(/<publishProfile[\s\S]*?(?:\/>|>[\s\S]*?<\/publishProfile>)/gi) || [];

  const getAttr = (block, attrName) => {
    const match = block.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i'));
    return match ? match[1] : null;
  };

  let selectedBlock = null;
  for (const block of profileBlocks) {
    const method = getAttr(block, 'publishMethod') || '';
    if (method.toLowerCase() === 'msdeploy') {
      selectedBlock = block;
      break;
    }
  }
  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  ghNotice(`Target: ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Step 1: Ensure directories exist
  await ensureRemoteDir(scmHost, basicAuth, 'build');
  await ensureRemoteDir(scmHost, basicAuth, 'build/static');
  await ensureRemoteDir(scmHost, basicAuth, 'build/static/css');
  await ensureRemoteDir(scmHost, basicAuth, 'build/static/js');
  await ensureRemoteDir(scmHost, basicAuth, 'static');
  await ensureRemoteDir(scmHost, basicAuth, 'static/css');
  await ensureRemoteDir(scmHost, basicAuth, 'static/js');

  // Step 2: Upload CSS bundle and all hash aliases
  const buildCssDir = path.resolve(process.cwd(), 'build', 'static', 'css');
  if (fs.existsSync(buildCssDir)) {
    const cssFiles = fs.readdirSync(buildCssDir);
    for (const cf of cssFiles) {
      const fullP = path.join(buildCssDir, cf);
      await uploadDirectFile(scmHost, basicAuth, fullP, `build/static/css/${cf}`);
      await uploadDirectFile(scmHost, basicAuth, fullP, `static/css/${cf}`);
    }
  }

  // Step 3: Upload JS bundle and all hash aliases
  const buildJsDir = path.resolve(process.cwd(), 'build', 'static', 'js');
  if (fs.existsSync(buildJsDir)) {
    const jsFiles = fs.readdirSync(buildJsDir);
    for (const jf of jsFiles) {
      const fullP = path.join(buildJsDir, jf);
      await uploadDirectFile(scmHost, basicAuth, fullP, `build/static/js/${jf}`);
      await uploadDirectFile(scmHost, basicAuth, fullP, `static/js/${jf}`);
    }
  }

  // Step 4: Upload index.html and server.js
  const indexPath = path.resolve(process.cwd(), 'build', 'index.html');
  await uploadDirectFile(scmHost, basicAuth, indexPath, 'build/index.html');
  await uploadDirectFile(scmHost, basicAuth, indexPath, 'index.html');

  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  if (fs.existsSync(serverPath)) {
    await uploadDirectFile(scmHost, basicAuth, serverPath, 'server.js');
  }

  // Step 5: Direct full Zip extraction
  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (fs.existsSync(zipPath)) {
    const zipStats = fs.statSync(zipPath);
    ghNotice(`Unpacking full release.zip (${(zipStats.size / (1024 * 1024)).toFixed(2)} MB) to /site/wwwroot/ ...`);
    const stream = fs.createReadStream(zipPath);
    await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream, {
      'Content-Type': 'application/zip',
      'Content-Length': zipStats.size
    });
  }

  ghNotice('🎉 ALL CRITICAL CSS, JS, HTML AND CODE SYNCHRONIZED DIRECTLY TO AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
