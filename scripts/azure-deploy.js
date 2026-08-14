const fs = require('fs');
const https = require('https');
const path = require('path');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function makeKuduUpload(scmHost, basicAuth, reqPath, filePath, isZip = false) {
  if (!fs.existsSync(filePath)) {
    ghError(`File not found: ${filePath}`);
    return false;
  }
  const stats = fs.statSync(filePath);
  ghNotice(`Uploading ${path.basename(filePath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB) to ${reqPath} ...`);

  return new Promise((resolve) => {
    const stream = fs.createReadStream(filePath);
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: reqPath,
      method: 'PUT',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': isZip ? 'application/zip' : 'application/octet-stream',
        'Content-Length': stats.size,
        'If-Match': '*',
        'User-Agent': 'Antigravity-Direct-Deployer/14.0'
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`${path.basename(filePath)} upload status: HTTP ${res.statusCode} ${res.statusMessage}`);
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
    });

    req.on('error', (err) => {
      ghError(`Upload network error for ${path.basename(filePath)}: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      ghError(`Upload timed out for ${path.basename(filePath)}`);
      resolve(false);
    });

    stream.pipe(req);
  });
}

async function main() {
  ghNotice('🚀 Starting Direct VFS File Upload to Azure wwwroot...');

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

  // 1. Upload server.js directly
  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  const okServer = await makeKuduUpload(scmHost, basicAuth, '/api/vfs/site/wwwroot/server.js', serverPath, false);
  if (!okServer) {
    ghError('Failed to upload server.js');
    process.exit(1);
  }

  // 2. Upload package.json directly
  const pkgPath = path.resolve(process.cwd(), 'release', 'package.json');
  if (fs.existsSync(pkgPath)) {
    await makeKuduUpload(scmHost, basicAuth, '/api/vfs/site/wwwroot/package.json', pkgPath, false);
  }

  // 3. Upload static build zip
  const buildZip = path.resolve(process.cwd(), 'build.zip');
  if (fs.existsSync(buildZip)) {
    await makeKuduUpload(scmHost, basicAuth, '/api/zip/site/wwwroot/', buildZip, true);
  }

  ghNotice('🎉 ALL FILES DEPLOYED DIRECTLY AND SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
