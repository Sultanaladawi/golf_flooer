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
  return new Promise((resolve) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: reqPath,
      method: method,
      headers: {
        'Authorization': basicAuth,
        'User-Agent': 'Antigravity-Azure-Deployer/8.0',
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

async function clearDeploymentLocks(scmHost, basicAuth) {
  ghNotice('Clearing any stale Azure deployment locks...');
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/locks/deployment.lock', 'DELETE', null, { 'If-Match': '*' });
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/data/locks/deployment.lock', 'DELETE', null, { 'If-Match': '*' });
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/locks/', 'DELETE', null, { 'If-Match': '*' });
}

async function uploadZipDeploy(scmHost, basicAuth, zipPath, zipSize) {
  await clearDeploymentLocks(scmHost, basicAuth);

  const maxRetries = 8;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    ghNotice(`[Attempt ${attempt}/${maxRetries}] Posting release.zip (${(zipSize / (1024 * 1024)).toFixed(2)} MB) to /api/zipdeploy ...`);

    const stream = fs.createReadStream(zipPath);
    const result = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true&clean=true', 'POST', stream, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': zipSize
    });

    ghNotice(`ZipDeploy Status: HTTP ${result.code} ${result.msg}`);

    if (result.code >= 200 && result.code < 300) {
      ghNotice('🎉 SUCCESS! Azure accepted release.zip for deployment.');
      return true;
    }

    if (result.code === 409) {
      ghNotice(`⏳ Waiting 25s for existing task to release (Attempt ${attempt}/${maxRetries})...`);
      await new Promise(r => setTimeout(r, 25000));
      await clearDeploymentLocks(scmHost, basicAuth);
    } else {
      ghNotice(`Response: ${result.body.substring(0, 150)}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  return false;
}

async function main() {
  ghNotice('🚀 Starting Azure Deploy via Kudu API...');

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
  let publishMethod = '';

  for (const block of profileBlocks) {
    const method = getAttr(block, 'publishMethod') || '';
    if (method.toLowerCase() === 'msdeploy') {
      selectedBlock = block;
      publishMethod = method;
      break;
    }
  }

  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
    publishMethod = getAttr(selectedBlock, 'publishMethod') || 'Default';
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  ghNotice(`Target Host: ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);

  const ok = await uploadZipDeploy(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('ZipDeploy failed after all retry attempts.');
    process.exit(1);
  }

  ghNotice('🎉 DEPLOYMENT FINISHED 100% SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
