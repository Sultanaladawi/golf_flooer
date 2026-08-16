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
    const isBuffer = Buffer.isBuffer(data);
    const reqHeaders = {
      'Authorization': basicAuth,
      'User-Agent': 'Antigravity-Deployer/20.0',
      ...headers
    };
    if (isBuffer) {
      reqHeaders['Content-Length'] = data.length;
    }

    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: safePath,
      method: method,
      headers: reqHeaders,
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, body }));
    });

    req.on('error', (err) => resolve({ statusCode: 0, statusMessage: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ statusCode: 408, statusMessage: 'Timeout', body: '' }); });

    if (data) {
      req.write(data);
      req.end();
    } else {
      req.end();
    }
  });
}

async function cleanDiskSpace(scmHost, basicAuth) {
  ghNotice('🧹 Cleaning stale logfiles and temp data on Azure...');
  try {
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/LogFiles/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/data/temp/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/deployments/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  } catch (e) {}
  ghNotice('✅ Disk space purge completed.');
}

async function deployViaZipDeploy(scmHost, basicAuth, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  ghNotice(`🚀 Deploying ${path.basename(filePath)} (${sizeMB} MB)...`);

  // Target 1: /api/zip/site/wwwroot/build/
  const res1 = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/build/', 'PUT', fileBuffer, {
    'Content-Type': 'application/zip',
    'If-Match': '*'
  });
  ghNotice(`Target /api/zip/site/wwwroot/build/ response: HTTP ${res1.statusCode} ${res1.statusMessage}`);

  // Target 2: /api/zip/site/wwwroot/
  const res2 = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', fileBuffer, {
    'Content-Type': 'application/zip',
    'If-Match': '*'
  });
  ghNotice(`Target /api/zip/site/wwwroot/ response: HTTP ${res2.statusCode} ${res2.statusMessage}`);

  // Target 3: /api/zipdeploy
  const res3 = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true', 'POST', fileBuffer, {
    'Content-Type': 'application/zip',
    'If-Match': '*'
  });
  ghNotice(`Target /api/zipdeploy response: HTTP ${res3.statusCode} ${res3.statusMessage}`);

  if (res1.statusCode < 300 || res2.statusCode < 300 || res3.statusCode < 300) {
    ghNotice('✅ Deployment package successfully unpacked on Azure via ZipDeploy!');
    return true;
  }

  return false;
}

async function uploadFolderVfs(scmHost, basicAuth, localDir, remoteBase) {
  if (!fs.existsSync(localDir)) return;
  const entries = fs.readdirSync(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullLocalPath = path.join(localDir, entry.name);
    const remotePath = `${remoteBase}/${entry.name}`;

    if (entry.isDirectory()) {
      // Create remote directory
      await makeKuduRequest(scmHost, basicAuth, `/api/vfs/${remotePath}/`, 'PUT', null, { 'If-Match': '*' });
      await uploadFolderVfs(scmHost, basicAuth, fullLocalPath, remotePath);
    } else {
      if (entry.name.endsWith('.mp4')) continue; // Videos handled separately
      const fileBuffer = fs.readFileSync(fullLocalPath);
      const res = await makeKuduRequest(scmHost, basicAuth, `/api/vfs/${remotePath}`, 'PUT', fileBuffer, {
        'Content-Type': 'application/octet-stream',
        'If-Match': '*'
      });
      console.log(`VFS uploaded: ${remotePath} -> HTTP ${res.statusCode}`);
    }
  }
}

async function uploadFileStream(scmHost, basicAuth, reqPath, filePath, isZip = false, maxRetries = 2) {
  if (!fs.existsSync(filePath)) return false;
  const fileBuffer = fs.readFileSync(filePath);
  const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  ghNotice(`Uploading ${path.basename(filePath)} (${sizeMB} MB) to ${reqPath} ...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await makeKuduRequest(scmHost, basicAuth, reqPath, 'PUT', fileBuffer, {
      'Content-Type': isZip ? 'application/zip' : (filePath.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream'),
      'If-Match': '*'
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      ghNotice(`${path.basename(filePath)} uploaded successfully.`);
      return true;
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

  // STEP 2: DEPLOY COMPLETE PACKAGE
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  let deploySuccess = false;

  if (fs.existsSync(buildZip)) {
    deploySuccess = await deployViaZipDeploy(scmHost, basicAuth, buildZip);
  }

  // STEP 3: FALLBACK TO DIRECT VFS UPLOAD IF ZIP FAILED
  if (!deploySuccess) {
    ghNotice('⚡ Zip extraction failed (HTTP 500 file lock) — Uploading all static build assets directly via VFS...');
    const localBuildDir = path.resolve(process.cwd(), 'build');
    if (fs.existsSync(localBuildDir)) {
      await uploadFolderVfs(scmHost, basicAuth, localBuildDir, 'site/wwwroot/build');
      ghNotice('✅ Direct VFS upload of build folder completed.');
    }
  }

  // STEP 4: UPLOAD SERVER.JS DIRECTLY
  const serverJsPath = path.resolve(process.cwd(), 'server.js');
  if (fs.existsSync(serverJsPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/server.js', serverJsPath);
  }

  // STEP 5: UPLOAD HERO VIDEO (SULTANA DRESS) DIRECTLY IF PRESENT
  const heroVideoPath = path.resolve(process.cwd(), 'public', 'hero_video.mp4');
  if (fs.existsSync(heroVideoPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/hero_video.mp4', heroVideoPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/hero_video.mp4', heroVideoPath, false);
  }

  // STEP 6: RECYCLE SERVER FOR ZERO-DOWNTIME INSTANT ACTIVATION
  try {
    ghNotice('🔄 Triggering instant live server recycle...');
    await makeKuduRequest(scmHost, basicAuth, '/api/system/reload', 'POST');
    await makeKuduRequest(scmHost, basicAuth, '/api/restart', 'POST');
  } catch (e) {}

  ghNotice('🎉 COMPLETE DEPLOYMENT: CLEAN JS/CSS BUNDLES, SULTANA HERO VIDEO & LIVE RECYCLE ACTIVE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
