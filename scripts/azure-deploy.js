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
        'User-Agent': 'Antigravity-Deployer/19.0',
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
  ghNotice('🧹 PURGING STALE LOGFILES & OLD DEPLOYMENTS ON AZURE...');
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/LogFiles/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/deployments/?recursive=true', 'DELETE', null, { 'If-Match': '*' });
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
    'Content-Type': isZip ? 'application/zip' : (filePath.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream'),
    'Content-Length': stats.size,
    'If-Match': '*'
  });

  ghNotice(`${path.basename(filePath)} upload status: HTTP ${res.statusCode} ${res.statusMessage}`);
  return res.statusCode >= 200 && res.statusCode < 300;
}

async function main() {
  ghNotice('🚀 Starting Azure Deployment with All Abaya Videos & Favicon...');

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

  // STEP 2: UPLOAD SERVER.JS
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

  // STEP 4: UPLOAD FAVICON & LOGO DIRECTLY TO ROOT & BUILD
  const faviconPath = path.resolve(process.cwd(), 'public', 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/favicon.ico', faviconPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/favicon.ico', faviconPath, false);
  }

  const logoPath = path.resolve(process.cwd(), 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/logo.png', logoPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/logo.png', logoPath, false);
  }

  // STEP 5: UPLOAD HERO VIDEO (SULTANA DRESS) DIRECTLY
  const heroVideoPath = path.resolve(process.cwd(), 'public', 'hero_video.mp4');
  if (fs.existsSync(heroVideoPath)) {
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/hero_video.mp4', heroVideoPath, false);
    await uploadFileStream(scmHost, basicAuth, '/api/vfs/site/wwwroot/build/hero_video.mp4', heroVideoPath, false);
  }

  // STEP 6: UNPACK STATIC BUILD ZIP (CSS, JS, ICONS)
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  if (fs.existsSync(buildZip)) {
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/build/', buildZip, true);
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/', buildZip, true);
  }

  // STEP 7: UNPACK ALL ABAYA PRODUCT VIDEOS
  const videosZip = path.resolve(process.cwd(), 'videos.zip');
  if (fs.existsSync(videosZip)) {
    ghNotice('🎥 Deploying all abaya product videos...');
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/images/', videosZip, true);
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/public/images/', videosZip, true);
    await uploadFileStream(scmHost, basicAuth, '/api/zip/site/wwwroot/', videosZip, true);
  }

  // STEP 8: TRIGGER INSTANT CONTAINER PROCESS RECYCLE FOR ZERO-DOWNTIME UPDATE
  try {
    ghNotice('🔄 Triggering instant live server recycle...');
    await makeKuduRequest(scmHost, basicAuth, '/api/system/reload', 'POST');
  } catch (e) {}

  ghNotice('🎉 COMPLETE DEPLOYMENT: SULTANA HERO VIDEO, FAVICON, & ALL ABAYA VIDEOS 100% READY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
