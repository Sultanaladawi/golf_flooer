const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function uploadZipViaVFS(scmHost, basicAuth, zipPath, zipSize) {
  ghNotice(`Unpacking release.zip (${(zipSize / (1024 * 1024)).toFixed(2)} MB) to /site/wwwroot/ via Kudu VFS Zip API...`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: '/api/zip/site/wwwroot/',
      method: 'PUT',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/zip',
        'Content-Length': zipSize,
        'User-Agent': 'Antigravity-Azure-Deployer/5.0'
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`VFS Zip Response: HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ghNotice('🎉 SUCCESS! All files, CSS, JS, and server.js extracted into /home/site/wwwroot/!');
          resolve(true);
        } else {
          ghNotice(`VFS Zip notice (${res.statusCode}): ${body.substring(0, 300)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      ghError(`Network error: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy(new Error('VFS Zip upload timed out'));
    });

    const stream = fs.createReadStream(zipPath);
    stream.pipe(req);
  });
}

async function main() {
  ghNotice('🚀 Starting Azure Deploy via Kudu VFS Zip API...');

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

  const ok = await uploadZipViaVFS(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('VFS Zip deployment failed!');
    process.exit(1);
  }

  ghNotice('🎉 ALL FILES & CSS BUNDLES DEPLOYED SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
