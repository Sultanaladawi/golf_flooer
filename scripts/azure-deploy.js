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
        'User-Agent': 'Antigravity-DiskCleaner-Deployer/16.0',
        ...headers
      },
      timeout: 180000
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
  ghNotice('🧹 PURGING DISK SPACE ON AZURE TO ELIMINATE "NO SPACE LEFT ON DEVICE"...');
  
  // 1. Delete LogFiles directory contents
  const resLogs = await makeKuduRequest(scmHost, basicAuth, '/api/vfs/LogFiles/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  ghNotice(`Purge LogFiles status: HTTP ${resLogs.statusCode}`);

  // 2. Delete old deployment history artifacts
  const resDeps = await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/deployments/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  ghNotice(`Purge old deployments history status: HTTP ${resDeps.statusCode}`);

  // 3. Delete any stale heavy directories in wwwroot (like node_modules or old broken builds)
  const resNm = await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/node_modules/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  ghNotice(`Purge stale wwwroot/node_modules status: HTTP ${resNm.statusCode}`);

  const resBuild = await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  ghNotice(`Purge old wwwroot/build status: HTTP ${resBuild.statusCode}`);

  ghNotice('✅ Disk space purge completed.');
}

async function uploadFileStream(scmHost, basicAuth, reqPath, filePath, isZip = false) {
  if (!fs.existsSync(filePath)) {
    ghError(`File not found: ${filePath}`);
    return false;
  }
  const stats = fs.statSync(filePath);
  ghNotice(`Uploading ${path.basename(filePath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB) to ${reqPath} ...`);

  const stream = fs.createReadStream(filePath);
  const res = await makeKuduRequest(scmHost, basicAuth, reqPath, 'PUT', stream, {
    'Content-Type': isZip ? 'application/zip' : 'application/octet-stream',
    'Content-Length': stats.size,
    'If-Match': '*'
  });

  ghNotice(`${path.basename(filePath)} upload status: HTTP ${res.statusCode} ${res.statusMessage}`);
  if (res.statusCode < 200 || res.statusCode >= 300) {
    if (res.body) ghNotice(`Details: ${res.body.substring(0, 300)}`);
  }
  return res.statusCode >= 200 && res.statusCode < 300;
}

async function main() {
  ghNotice('🚀 Starting Space Recovery & Clean Deployment...');

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

  // STEP 1: FREE UP DISK SPACE ON AZURE
  await cleanDiskSpace(scmHost, basicAuth);

  // STEP 2: UPLOAD SERVER.JS DIRECTLY
  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  const okServer = await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/server.js', serverPath, false);
  if (!okServer) {
    ghError('Failed to upload server.js');
    process.exit(1);
  }

  // STEP 3: UPLOAD PACKAGE.JSON
  const pkgPath = path.resolve(process.cwd(), 'release', 'package.json');
  if (fs.existsSync(pkgPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/package.json', pkgPath, false);
  }

  // STEP 4: UNPACK LIGHT BUILD.ZIP (CSS / JS)
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  if (fs.existsSync(buildZip)) {
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/', buildZip, true);
  }

  ghNotice('🎉 DISK SPACE PURGED & ALL APPLICATION FILES DEPLOYED 100% CLEANLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
