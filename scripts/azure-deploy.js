const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function doZipDeploy(scmHost, basicAuth, zipPath, zipSize) {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    ghNotice(`[Attempt ${attempt}/${maxAttempts}] Sending release.zip (${(zipSize / (1024 * 1024)).toFixed(2)} MB) to /api/zipdeploy ...`);

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: scmHost,
        port: 443,
        path: '/api/zipdeploy?isAsync=false&clean=false',
        method: 'POST',
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/octet-stream',
          'Content-Length': zipSize,
          'User-Agent': 'Antigravity-Azure-Deployer/4.0'
        },
        timeout: 300000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
      });

      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('ZipDeploy timeout')));

      const stream = fs.createReadStream(zipPath);
      stream.pipe(req);
    });

    ghNotice(`ZipDeploy HTTP Status: ${result.code} ${result.msg}`);

    if (result.code >= 200 && result.code < 300) {
      ghNotice('🎉 SUCCESS! Deployment extracted and applied in Azure.');
      return true;
    }

    if (result.code === 409) {
      ghNotice('⏳ Azure reported deployment in progress (409). Waiting 15s before retry...');
      await new Promise(r => setTimeout(r, 15000));
    } else {
      ghNotice(`Response detail: ${result.body.substring(0, 200)}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // Fallback to VFS
  ghNotice('Trying VFS direct zip unpack as fallback (PUT /api/zip/site/wwwroot/)...');
  try {
    const vfsResult = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: scmHost,
        port: 443,
        path: '/api/zip/site/wwwroot/',
        method: 'PUT',
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/octet-stream',
          'Content-Length': zipSize,
          'User-Agent': 'Antigravity-Azure-Deployer/4.0'
        },
        timeout: 300000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
      });
      req.on('error', reject);
      const stream = fs.createReadStream(zipPath);
      stream.pipe(req);
    });

    ghNotice(`VFS fallback status: ${vfsResult.code} ${vfsResult.msg}`);
    if (vfsResult.code >= 200 && vfsResult.code < 300) {
      ghNotice('🎉 VFS Fallback SUCCEEDED!');
      return true;
    }
  } catch (e) {
    ghNotice(`VFS fallback notice: ${e.message}`);
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

  ghNotice(`Deploying to ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);

  const ok = await doZipDeploy(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('Deployment failed after all attempts.');
    process.exit(1);
  }

  ghNotice('🎉 All deployment tasks completed successfully!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
