const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function uploadZipFile(scmHost, basicAuth, zipFilePath, targetPath = '/api/zip/site/wwwroot/') {
  if (!fs.existsSync(zipFilePath)) {
    console.log(`ℹ️ Optional file not found, skipping: ${zipFilePath}`);
    return true;
  }

  const stats = fs.statSync(zipFilePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const baseName = path.basename(zipFilePath);

  ghNotice(`Uploading ${baseName} (${sizeMB} MB) to https://${scmHost}${targetPath} ...`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: targetPath,
      method: 'PUT',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size,
        'User-Agent': 'Antigravity-Azure-Deployer/3.0'
      },
      timeout: 600000 // 10 minutes timeout for larger files
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`${baseName} Upload Response: HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ghNotice(`🎉 ${baseName} deployed and extracted successfully!`);
          resolve(true);
        } else {
          ghError(`${baseName} failed with HTTP ${res.statusCode}: ${body.substring(0, 300)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      ghError(`Network error uploading ${baseName}: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Upload timed out for ${baseName}`));
    });

    const stream = fs.createReadStream(zipFilePath);
    stream.pipe(req);
  });
}

async function main() {
  ghNotice('Starting Azure Deploy via Kudu API...');

  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || process.env.PUBLISH_PROFILE || '';
  if (!rawSecret || rawSecret.trim().length === 0) {
    ghError('AZURE_WEBAPP_PUBLISH_PROFILE secret is empty or missing in GitHub Secrets!');
    process.exit(1);
  }

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

  ghNotice(`Target Host: ${scmHost}, User: ${userName}`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Step 1: Upload Core App release.zip (server.js, build JS/CSS, package.json)
  const coreOk = await uploadZipFile(scmHost, basicAuth, path.resolve(process.cwd(), 'release.zip'));
  if (!coreOk) {
    ghError('Core release.zip deployment failed!');
    process.exit(1);
  }

  // Step 2: Upload media.zip if available
  const mediaZipPath = path.resolve(process.cwd(), 'media.zip');
  if (fs.existsSync(mediaZipPath)) {
    ghNotice('Media package found. Uploading images & videos...');
    await uploadZipFile(scmHost, basicAuth, mediaZipPath);
  }

  ghNotice('🎉 All deployment tasks completed successfully!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
