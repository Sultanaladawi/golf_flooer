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
        'User-Agent': 'Antigravity-Universal-Deployer/1.0',
        ...headers
      },
      timeout: 180000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body }));
    });

    req.on('error', (err) => resolve({ code: 0, msg: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ code: 408, msg: 'Timeout', body: '' }); });

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

async function deployZipArchive(scmHost, basicAuth, zipPath, zipSize) {
  ghNotice(`Uploading full release package (${(zipSize / (1024 * 1024)).toFixed(2)} MB) to Azure...`);

  // Method 1: Kudu VFS Zip Extract API
  ghNotice('Method 1: PUT /api/zip/site/wwwroot/ with Content-Type: application/zip ...');
  const stream1 = fs.createReadStream(zipPath);
  const vfsRes = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream1, {
    'Content-Type': 'application/zip',
    'Content-Length': zipSize
  });

  ghNotice(`VFS Zip API Result: HTTP ${vfsRes.code} ${vfsRes.msg}`);
  if (vfsRes.code >= 200 && vfsRes.code < 300) {
    ghNotice('🎉 Successfully unpacked entire application to /site/wwwroot/ !');
    return true;
  }

  // Method 2: ZipDeploy API fallback
  ghNotice('Method 2: POST /api/zipdeploy?isAsync=true&clean=false ...');
  for (let i = 1; i <= 3; i++) {
    const stream2 = fs.createReadStream(zipPath);
    const zdRes = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true&clean=false', 'POST', stream2, {
      'Content-Type': 'application/zip',
      'Content-Length': zipSize
    });

    ghNotice(`ZipDeploy Attempt ${i}: HTTP ${zdRes.code} ${zdRes.msg}`);
    if (zdRes.code >= 200 && zdRes.code < 300) {
      ghNotice('🎉 ZipDeploy accepted and extraction queued successfully!');
      return true;
    }
    await new Promise(r => setTimeout(r, 15000));
  }

  return false;
}

async function main() {
  ghNotice('🚀 Starting Comprehensive Azure Deployment...');

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

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);

  const ok = await deployZipArchive(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('Zip package deployment failed.');
    process.exit(1);
  }

  // Touch restart file
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/restart.txt', 'PUT', new Date().toISOString(), { 'If-Match': '*' });

  ghNotice('🎉 DEPLOYMENT COMPLETED 100% SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
