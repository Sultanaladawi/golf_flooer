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
        'User-Agent': 'Antigravity-Release-Deployer/8.0',
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

async function uploadZipToWwwroot(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) return false;
  const stats = fs.statSync(zipPath);
  ghNotice(`Unpacking full ${path.basename(zipPath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB) directly to /site/wwwroot/ ...`);

  const stream = fs.createReadStream(zipPath);
  const res = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream, {
    'Content-Type': 'application/zip',
    'Content-Length': stats.size
  });

  ghNotice(`Release ZIP unpack status: HTTP ${res.code} ${res.msg}`);
  return res.code >= 200 && res.code < 300;
}

async function triggerZipDeployRecycle(scmHost, basicAuth, zipPath) {
  ghNotice('Triggering official Azure Linux container recycle via /api/zipdeploy...');
  const stats = fs.statSync(zipPath);
  const stream = fs.createReadStream(zipPath);
  const res = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true', 'POST', stream, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stats.size
  });
  ghNotice(`ZipDeploy recycle status: HTTP ${res.code} ${res.msg}`);
}

async function main() {
  ghNotice('🚀 Starting Full Release ZIP Deployment to wwwroot...');

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

  // Step 1: Upload and extract full release.zip to /site/wwwroot/
  const releaseZip = path.resolve(process.cwd(), 'release.zip');
  const ok = await uploadZipToWwwroot(scmHost, basicAuth, releaseZip);
  if (!ok) {
    ghError('Release ZIP deployment failed.');
    process.exit(1);
  }

  // Step 2: Trigger official container recycle via zipdeploy
  await triggerZipDeployRecycle(scmHost, basicAuth, releaseZip);

  ghNotice('🎉 FULL RELEASE ZIP UNPACKED AND CONTAINER RECYCLE SIGNALED!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
