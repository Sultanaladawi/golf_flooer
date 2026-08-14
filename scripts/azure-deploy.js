const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function uploadZipDeploy(scmHost, basicAuth, zipPath, zipSize) {
  const maxRetries = 6;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    ghNotice(`[Attempt ${attempt}/${maxRetries}] Posting release.zip to /api/zipdeploy?isAsync=true&clean=true ...`);

    const result = await new Promise((resolve) => {
      const req = https.request({
        hostname: scmHost,
        port: 443,
        path: '/api/zipdeploy?isAsync=true&clean=true',
        method: 'POST',
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/octet-stream',
          'Content-Length': zipSize,
          'User-Agent': 'Antigravity-Azure-Deployer/7.0'
        },
        timeout: 300000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => {
          ghNotice(`ZipDeploy Status: HTTP ${res.statusCode} ${res.statusMessage}`);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, code: res.statusCode });
          } else {
            ghNotice(`ZipDeploy message (${res.statusCode}): ${body.substring(0, 150)}`);
            resolve({ ok: false, code: res.statusCode, body });
          }
        });
      });

      req.on('error', (err) => {
        ghNotice(`ZipDeploy network error: ${err.message}`);
        resolve({ ok: false, code: 0, err: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, code: 408 });
      });

      const stream = fs.createReadStream(zipPath);
      stream.pipe(req);
    });

    if (result.ok) {
      ghNotice('🎉 SUCCESS! Azure accepted release.zip for deployment.');
      return true;
    }

    if (result.code === 409) {
      ghNotice(`⏳ Azure has a background task in progress. Waiting 20s before attempt ${attempt + 1}...`);
      await new Promise(r => setTimeout(r, 20000));
    } else {
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

  ghNotice(`Deploying to ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);
  const sizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
  ghNotice(`Package: release.zip (${sizeMB} MB)`);

  const ok = await uploadZipDeploy(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('ZipDeploy failed after all retry attempts.');
    process.exit(1);
  }

  ghNotice('🎉 DEPLOYMENT ACCEPTED AND EXTRACTED IN AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
