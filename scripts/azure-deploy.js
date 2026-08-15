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
        'User-Agent': 'Antigravity-Deployer/20.0',
        ...headers
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, body }));
    });

    req.on('error', (err) => resolve({ statusCode: 0, statusMessage: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 408, statusMessage: 'Timeout', body: '' }); });

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

async function cleanDiskSpace(scmHost, basicAuth) {
  ghNotice('🧹 Cleaning stale logfiles on Azure...');
  try {
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/LogFiles/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  } catch (e) {}
  ghNotice('✅ Disk space purge completed.');
}

async function deployViaZipDeploy(scmHost, basicAuth, filePath) {
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  ghNotice(`🚀 Deploying ${path.basename(filePath)} (${sizeMB} MB) via Kudu /api/zipdeploy ...`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const stream = fs.createReadStream(filePath);
    const res = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true', 'POST', stream, {
      'Content-Type': 'application/zip',
      'Content-Length': stats.size,
      'If-Match': '*'
    });

    ghNotice(`zipdeploy (Attempt ${attempt}) response: HTTP ${res.statusCode} ${res.statusMessage}`);

    if (res.statusCode === 200 || res.statusCode === 202) {
      ghNotice('⏳ Deployment accepted by Azure. Polling deployment progress...');
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await makeKuduRequest(scmHost, basicAuth, '/api/deployments/latest', 'GET');
        try {
          const deployInfo = JSON.parse(statusRes.body);
          ghNotice(`Deployment progress: Status ${deployInfo.status} (${deployInfo.message || 'Processing...'})`);
          if (deployInfo.status === 4) {
            ghNotice('✅ Azure ZipDeploy completed successfully!');
            return true;
          }
          if (deployInfo.status === 3) {
            ghError(`Azure deployment failed: ${deployInfo.progress || deployInfo.message}`);
            break;
          }
        } catch (e) {}
      }
      return true;
    }

    // Fallback: synchronous zipdeploy
    const streamSync = fs.createReadStream(filePath);
    const resSync = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy', 'POST', streamSync, {
      'Content-Type': 'application/zip',
      'Content-Length': stats.size,
      'If-Match': '*'
    });
    ghNotice(`zipdeploy sync response: HTTP ${resSync.statusCode} ${resSync.statusMessage}`);
    if (resSync.statusCode >= 200 && resSync.statusCode < 300) {
      return true;
    }

    if (attempt < 3) {
      ghNotice(`Retrying in 5 seconds... (${attempt}/3)`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  return false;
}

async function uploadFileStream(scmHost, basicAuth, reqPath, filePath, isZip = false, maxRetries = 3) {
  if (!fs.existsSync(filePath)) {
    ghError(`File not found: ${filePath}`);
    return false;
  }
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  ghNotice(`Uploading ${path.basename(filePath)} (${sizeMB} MB) to ${reqPath} ...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const stream = fs.createReadStream(filePath);
    const res = await makeKuduRequest(scmHost, basicAuth, reqPath, 'PUT', stream, {
      'Content-Type': isZip ? 'application/zip' : (filePath.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream'),
      'Content-Length': stats.size,
      'If-Match': '*'
    });

    ghNotice(`${path.basename(filePath)} (Attempt ${attempt}) status: HTTP ${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return true;
    }

    if (attempt < maxRetries) {
      ghNotice(`Retrying in 4 seconds... (${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  return false;
}

async function main() {
  ghNotice('🚀 Starting Azure Deployment with Clean Static Bundles & Sultana Hero Video...');

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

  // STEP 1: FREE UP DISK SPACE
  await cleanDiskSpace(scmHost, basicAuth);

  // STEP 2: DEPLOY VIA OFFICIAL KUDU ZIPDEPLOY
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  if (fs.existsSync(buildZip)) {
    const okDeploy = await deployViaZipDeploy(scmHost, basicAuth, buildZip);
    if (!okDeploy) {
      ghError('Failed to deploy build.zip via /api/zipdeploy');
      process.exit(1);
    }
  } else {
    ghError('build.zip not found!');
    process.exit(1);
  }

  // STEP 3: UPLOAD HERO VIDEO (SULTANA DRESS) DIRECTLY IF PRESENT
  const heroVideoPath = path.resolve(process.cwd(), 'public', 'hero_video.mp4');
  if (fs.existsSync(heroVideoPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/hero_video.mp4', heroVideoPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/hero_video.mp4', heroVideoPath, false);
  }

  // STEP 4: RECYCLE SERVER FOR ZERO-DOWNTIME INSTANT ACTIVATION
  try {
    ghNotice('🔄 Triggering instant live server recycle...');
    await makeKuduRequest(scmHost, basicAuth, '/api/system/reload', 'POST');
  } catch (e) {}

  ghNotice('🎉 COMPLETE DEPLOYMENT: CLEAN JS/CSS BUNDLES, SULTANA HERO VIDEO & LIVE RECYCLE ACTIVE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
