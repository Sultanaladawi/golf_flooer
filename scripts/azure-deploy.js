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
        'User-Agent': 'Antigravity-Release-Deployer/10.0',
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

async function clearDeploymentLocks(scmHost, basicAuth) {
  ghNotice('Clearing any active deployment locks on Azure...');
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/locks/', 'DELETE', null, { 'If-Match': '*' });
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/deployments/active', 'DELETE', null, { 'If-Match': '*' });
}

async function uploadZipToWwwroot(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) return false;
  const stats = fs.statSync(zipPath);
  ghNotice(`Deploying clean ${path.basename(zipPath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB) to Azure via /api/zipdeploy ...`);

  const stream = fs.createReadStream(zipPath);
  let res = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy', 'POST', stream, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stats.size
  });

  ghNotice(`ZipDeploy status: HTTP ${res.code} ${res.msg}`);

  if (res.code < 200 || res.code >= 300) {
    ghNotice('Fallback: Trying /api/zip/site/wwwroot/ endpoint...');
    const stream2 = fs.createReadStream(zipPath);
    res = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream2, {
      'Content-Type': 'application/zip',
      'Content-Length': stats.size
    });
    ghNotice(`VFS Zip fallback status: HTTP ${res.code} ${res.msg}`);
  }

  return res.code >= 200 && res.code < 300;
}

async function main() {
  ghNotice('🚀 Starting 100% Clean Direct Deployment to wwwroot...');

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

  // Step 1: Clear locks
  await clearDeploymentLocks(scmHost, basicAuth);

  // Step 2: Extract clean zip without .bin symlinks
  const releaseZip = path.resolve(process.cwd(), 'release.zip');
  const ok = await uploadZipToWwwroot(scmHost, basicAuth, releaseZip);
  if (!ok) {
    ghError('Release ZIP deployment failed.');
    process.exit(1);
  }

  ghNotice('🎉 CLEAN RELEASE DEPLOYED WITH FULL NODE_MODULES!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
