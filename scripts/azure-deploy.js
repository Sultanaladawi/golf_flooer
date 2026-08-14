const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function main() {
  ghNotice('Starting Azure Deploy via Kudu API...');

  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || process.env.PUBLISH_PROFILE || '';
  if (!rawSecret || rawSecret.trim().length === 0) {
    ghError('AZURE_WEBAPP_PUBLISH_PROFILE secret is empty or missing in GitHub Secrets!');
    process.exit(1);
  }

  ghNotice(`Secret length: ${rawSecret.length} chars`);

  // Robust XML block extraction
  const profileBlocks = rawSecret.match(/<publishProfile[\s\S]*?(?:\/>|>[\s\S]*?<\/publishProfile>)/gi) || [];
  ghNotice(`Detected ${profileBlocks.length} profile block(s) in XML.`);

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

  if (!selectedBlock) {
    for (const block of profileBlocks) {
      const url = getAttr(block, 'publishUrl') || '';
      if (url.includes('scm') || url.includes('azurewebsites')) {
        selectedBlock = block;
        publishMethod = getAttr(block, 'publishMethod') || 'SCM';
        break;
      }
    }
  }

  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
    publishMethod = getAttr(selectedBlock, 'publishMethod') || 'Default';
  }

  if (!selectedBlock) {
    ghError('Could not find valid <publishProfile> in secret!');
    process.exit(1);
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  if (!rawUrl || !userName || !userPWD) {
    ghError(`Missing fields: URL=${!!rawUrl}, User=${!!userName}, PWD=${!!userPWD}`);
    process.exit(1);
  }

  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  ghNotice(`Method: ${publishMethod}, Host: ${scmHost}, User: ${userName}`);

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);
  const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
  ghNotice(`Package: release.zip (${zipSizeMB} MB)`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Strategy 1: Kudu VFS Zip Deploy (PUT /api/zip/site/wwwroot/)
  // This extracts directly to wwwroot and NEVER conflicts with OneDeploy or locks!
  ghNotice(`Attempting Direct VFS Zip Extract (PUT /api/zip/site/wwwroot/)...`);

  let success = false;

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
          'Content-Length': zipStats.size,
          'User-Agent': 'Antigravity-Azure-Deployer/3.0'
        },
        timeout: 300000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
      });

      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('VFS Upload timed out')));

      const stream = fs.createReadStream(zipPath);
      stream.pipe(req);
    });

    ghNotice(`VFS Deploy Response: HTTP ${vfsResult.code} ${vfsResult.msg}`);

    if (vfsResult.code >= 200 && vfsResult.code < 300) {
      ghNotice('🎉 SUCCESS! Files extracted directly into /home/site/wwwroot/');
      success = true;
    } else {
      ghNotice(`VFS returned HTTP ${vfsResult.code}: ${vfsResult.body.substring(0, 200)}`);
    }
  } catch (err) {
    ghNotice(`VFS Attempt notice: ${err.message}`);
  }

  // Strategy 2: If VFS failed, try /api/zipdeploy
  if (!success) {
    ghNotice('Attempting Kudu ZipDeploy endpoint (POST /api/zipdeploy?isAsync=true)...');

    const zipDeployResult = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: scmHost,
        port: 443,
        path: '/api/zipdeploy?isAsync=true&clean=true',
        method: 'POST',
        headers: {
          'Authorization': basicAuth,
          'Content-Type': 'application/octet-stream',
          'Content-Length': zipStats.size,
          'User-Agent': 'Antigravity-Azure-Deployer/3.0'
        },
        timeout: 300000
      }, (res) => {
        let body = '';
        res.on('data', c => { body += c; });
        res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
      });

      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('ZipDeploy timed out')));

      const stream = fs.createReadStream(zipPath);
      stream.pipe(req);
    });

    ghNotice(`ZipDeploy Response: HTTP ${zipDeployResult.code} ${zipDeployResult.msg}`);

    if (zipDeployResult.code >= 200 && zipDeployResult.code < 300) {
      ghNotice('🎉 SUCCESS! Package accepted via /api/zipdeploy');
      success = true;
    } else {
      ghError(`ZipDeploy failed with HTTP ${zipDeployResult.code}: ${zipDeployResult.body.substring(0, 300)}`);
    }
  }

  if (!success) {
    ghError('All deployment methods failed. Check credentials and Azure status.');
    process.exit(1);
  }

  ghNotice('Deployment finished successfully! Verifying health endpoint...');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
