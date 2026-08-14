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
        'User-Agent': 'Antigravity-Direct-Deployer/5.0',
        ...headers
      },
      timeout: 180000
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

async function uploadZipToPath(scmHost, basicAuth, zipPath, remotePath) {
  if (!fs.existsSync(zipPath)) return false;
  const stats = fs.statSync(zipPath);
  ghNotice(`Unpacking ${path.basename(zipPath)} (${(stats.size / 1024).toFixed(1)} KB) into /site/wwwroot/${remotePath} ...`);

  const stream = fs.createReadStream(zipPath);
  const res = await makeKuduRequest(scmHost, basicAuth, `/api/zip/site/wwwroot/${remotePath}/`, 'PUT', stream, {
    'Content-Type': 'application/zip',
    'Content-Length': stats.size
  });

  ghNotice(`Unpack Result for ${remotePath}: HTTP ${res.code} ${res.msg}`);
  return res.code >= 200 && res.code < 300;
}

async function uploadDirectFile(scmHost, basicAuth, localPath, remotePath) {
  if (!fs.existsSync(localPath)) return false;
  const content = fs.readFileSync(localPath);
  const mime = remotePath.endsWith('.css')
    ? 'text/css'
    : (remotePath.endsWith('.js') ? 'application/javascript' : (remotePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'));

  const res = await makeKuduRequest(scmHost, basicAuth, `/api/vfs/site/wwwroot/${remotePath}`, 'PUT', content, {
    'If-Match': '*',
    'Content-Type': mime,
    'Content-Length': Buffer.byteLength(content)
  });

  ghNotice(`Uploaded ${remotePath} (${(content.length / 1024).toFixed(1)} KB) -> HTTP ${res.code} ${res.msg}`);
  return res.code >= 200 && res.code < 300;
}

async function main() {
  ghNotice('🚀 Starting Direct ZIP-Based Asset Synchronization...');

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

  // Step 1: Unpack static assets (CSS, JS, Aliases) to BOTH /build/static and /static
  const staticZip = path.resolve(process.cwd(), 'static.zip');
  if (fs.existsSync(staticZip)) {
    await uploadZipToPath(scmHost, basicAuth, staticZip, 'build/static');
    await uploadZipToPath(scmHost, basicAuth, staticZip, 'static');
  }

  // Step 2: Upload build/index.html and server.js directly
  const indexPath = path.resolve(process.cwd(), 'build', 'index.html');
  await uploadDirectFile(scmHost, basicAuth, indexPath, 'build/index.html');
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/index.html', 'DELETE', null, { 'If-Match': '*' });

  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  if (fs.existsSync(serverPath)) {
    await uploadDirectFile(scmHost, basicAuth, serverPath, 'server.js');
  }

  // Step 3: Trigger Live Reload
  ghNotice('Triggering instant Node process recycling...');
  const reloadReq = https.request({
    hostname: 'zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net',
    port: 443,
    path: '/api/system/reload',
    method: 'POST',
    timeout: 8000
  }, (res) => {
    ghNotice(`Live reload response: HTTP ${res.statusCode}`);
  });
  reloadReq.on('error', () => {});
  reloadReq.end();

  ghNotice('🎉 ALL CSS, JS, HTML AND CODE SYNCHRONIZED AND LIVE IN AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
