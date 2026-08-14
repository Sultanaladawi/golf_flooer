const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function uploadZipBuffer(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) return false;
  const buffer = fs.readFileSync(zipPath);
  ghNotice(`Deploying clean release.zip (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) to /api/zip/site/wwwroot/ ...`);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: '/api/zip/site/wwwroot/',
      method: 'PUT',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/zip',
        'Content-Length': buffer.length,
        'User-Agent': 'Antigravity-Deployer/13.0'
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`Zip upload status: HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          ghNotice(`VFS upload response: ${body.substring(0, 300)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      ghError(`Upload error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      ghError('Upload timed out');
      resolve(false);
    });

    req.write(buffer);
    req.end();
  });
}

async function deployZipDeploy(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) return false;
  const buffer = fs.readFileSync(zipPath);
  ghNotice(`Deploying clean release.zip (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) via /api/zipdeploy ...`);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: '/api/zipdeploy',
      method: 'POST',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/zip',
        'Content-Length': buffer.length,
        'User-Agent': 'Antigravity-Deployer/13.0'
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`ZipDeploy status: HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          ghNotice(`ZipDeploy response: ${body.substring(0, 300)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      ghError(`ZipDeploy network error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      ghError('ZipDeploy timed out');
      resolve(false);
    });

    req.write(buffer);
    req.end();
  });
}

async function main() {
  ghNotice('🚀 Starting Direct Azure Deployment with Safe Auth...');

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
  const releaseZip = path.resolve(process.cwd(), 'release.zip');

  // Try VFS PUT first (which gave 200 OK in runs #343/344)
  let ok = await uploadZipBuffer(scmHost, basicAuth, releaseZip);
  if (!ok) {
    ghNotice('Trying ZipDeploy endpoint as fallback...');
    ok = await deployZipDeploy(scmHost, basicAuth, releaseZip);
  }

  if (!ok) {
    ghError('Deployment failed on all endpoints.');
    process.exit(1);
  }

  ghNotice('🎉 100% CLEAN DEPLOYMENT COMPLETED!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
