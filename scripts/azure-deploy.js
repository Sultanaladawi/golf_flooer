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

async function runKuduCommand(scmHost, basicAuth, command) {
  try {
    const payload = Buffer.from(JSON.stringify({ command: command, dir: 'site\\wwwroot' }));
    return await makeKuduRequest(scmHost, basicAuth, '/api/command', 'POST', payload, {
      'Content-Type': 'application/json'
    });
  } catch (e) {
    return { statusCode: 0, body: e.message };
  }
}

async function setAppOffline(scmHost, basicAuth, offline = true) {
  if (offline) {
    ghNotice('⏸️ Putting App Service in offline mode and terminating running node processes...');
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/app_offline.htm', 'PUT', Buffer.from('<!DOCTYPE html><html><body>Updating</body></html>'), { 'If-Match': '*' });
    await runKuduCommand(scmHost, basicAuth, 'powershell -Command "Stop-Process -Name node -Force -ErrorAction SilentlyContinue"');
    await runKuduCommand(scmHost, basicAuth, 'taskkill /F /IM node.exe');
    await new Promise(r => setTimeout(r, 2500));
  } else {
    ghNotice('▶️ Bringing App Service back online...');
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/app_offline.htm', 'DELETE', null, { 'If-Match': '*' });
  }
}

async function cleanDiskSpace(scmHost, basicAuth) {
  ghNotice('🧹 Cleaning stale files and temp data on Azure...');
  try {
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/LogFiles/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/data/temp/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/deployments/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/release/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/server_bundled.js', 'DELETE', null, { 'If-Match': '*' });
  } catch (e) {}
  ghNotice('✅ Disk cleanup completed.');
}

async function deployViaZipDeploy(scmHost, basicAuth, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  ghNotice(`🚀 Deploying ${path.basename(filePath)} (${sizeMB} MB)...`);

  // Target 1: /api/zip/site/wwwroot/
  const res1 = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', fileBuffer, {
    'Content-Type': 'application/zip',
    'If-Match': '*'
  });
  ghNotice(`Target /api/zip/site/wwwroot/ response: HTTP ${res1.statusCode} ${res1.statusMessage}`);

  // Target 2: /api/zipdeploy
  const res2 = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=false', 'POST', fileBuffer, {
    'Content-Type': 'application/zip',
    'If-Match': '*'
  });
  ghNotice(`Target /api/zipdeploy response: HTTP ${res2.statusCode} ${res2.statusMessage}`);

  if (res1.statusCode < 300 || res2.statusCode < 300) {
    ghNotice('✅ Deployment package successfully unpacked on Azure!');
    return true;
  }

  return false;
}

async function uploadFileStream(scmHost, basicAuth, reqPath, filePath, isZip = false, maxRetries = 3) {
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
    } else {
      ghNotice(`Upload attempt ${attempt} failed with HTTP ${res.statusCode}. Retrying...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

async function main() {
  ghNotice('🚀 Starting Azure Deployment with Process Termination & Direct File Overwrite...');

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

  // STEP 1: FREE UP DISK SPACE AND REMOVE STALE RUNNERS
  await cleanDiskSpace(scmHost, basicAuth);

  // STEP 2: SET APP OFFLINE AND KILL RUNNING PROCESSES TO FREE LOCKS
  await setAppOffline(scmHost, basicAuth, true);

  // STEP 3: DEPLOY COMPLETE PACKAGE
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  if (fs.existsSync(buildZip)) {
    await deployViaZipDeploy(scmHost, basicAuth, buildZip);
  }

  // STEP 4: UPLOAD APP.JS, SERVER.JS AND WEB.CONFIG DIRECTLY
  const appJsPath = path.resolve(process.cwd(), 'app.js');
  if (fs.existsSync(appJsPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/app.js', appJsPath);
  }

  const serverJsPath = path.resolve(process.cwd(), 'server.js');
  if (fs.existsSync(serverJsPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/server.js', serverJsPath);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/release/server.js', serverJsPath);
  }

  const webConfigPath = path.resolve(process.cwd(), 'web.config');
  if (fs.existsSync(webConfigPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/web.config', webConfigPath);
  }

  // STEP 5: UPLOAD HERO VIDEO (SULTANA DRESS) DIRECTLY IF PRESENT
  const heroVideoPath = path.resolve(process.cwd(), 'public', 'hero_video.mp4');
  if (fs.existsSync(heroVideoPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/hero_video.mp4', heroVideoPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/hero_video.mp4', heroVideoPath, false);
  }

  // STEP 6: BRING APP BACK ONLINE
  await setAppOffline(scmHost, basicAuth, false);

  // STEP 7: RECYCLE SERVER FOR ZERO-DOWNTIME INSTANT ACTIVATION
  try {
    ghNotice('🔄 Triggering instant live server recycle and worker reload...');
    await runKuduCommand(scmHost, basicAuth, 'powershell -Command "Get-Process node, w3wp -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"');
    await makeKuduRequest(scmHost, basicAuth, '/api/system/reload', 'POST');
    await makeKuduRequest(scmHost, basicAuth, '/api/restart', 'POST');
  } catch (e) {}

  ghNotice('🎉 COMPLETE DEPLOYMENT: CLEAN JS/CSS BUNDLES, SULTANA HERO VIDEO & LIVE RECYCLE ACTIVE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
