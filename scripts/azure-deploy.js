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
        'User-Agent': 'Antigravity-ZipDeployer/12.0',
        ...headers
      },
      timeout: 300000
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => resolve({ code: res.statusCode, msg: res.statusMessage, body, headers: res.headers }));
    });

    req.on('error', (err) => resolve({ code: 0, msg: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ code: 408, msg: 'Timeout', body: '' }); });

    if (data) {
      req.write(data);
      req.end();
    } else {
      req.end();
    }
  });
}

async function deployZipViaZipDeploy(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) {
    ghError(`Zip file not found: ${zipPath}`);
    return false;
  }

  const buffer = fs.readFileSync(zipPath);
  ghNotice(`Deploying ${path.basename(zipPath)} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) via POST /api/zipdeploy?isAsync=false ...`);

  const res = await makeKuduRequest(
    scmHost,
    basicAuth,
    '/api/zipdeploy?isAsync=false',
    'POST',
    buffer,
    {
      'Content-Type': 'application/zip',
      'Content-Length': buffer.length
    }
  );

  ghNotice(`ZipDeploy response: HTTP ${res.code} ${res.msg}`);
  if (res.body && res.body.trim().length > 0) {
    ghNotice(`Response details: ${res.body.substring(0, 300)}`);
  }

  if (res.code >= 200 && res.code < 300) {
    ghNotice('✅ ZipDeploy succeeded with 2xx status!');
    return true;
  }

  // Fallback: If 409 or other conflict, try VFS PUT
  ghNotice('Attempting VFS /api/zip/site/wwwroot/ fallback...');
  const vfsRes = await makeKuduRequest(
    scmHost,
    basicAuth,
    '/api/zip/site/wwwroot/',
    'PUT',
    buffer,
    {
      'Content-Type': 'application/zip',
      'Content-Length': buffer.length
    }
  );

  ghNotice(`VFS fallback response: HTTP ${vfsRes.code} ${vfsRes.msg}`);
  if (vfsRes.body) {
    ghNotice(`VFS details: ${vfsRes.body.substring(0, 300)}`);
  }

  return vfsRes.code >= 200 && vfsRes.code < 300;
}

async function main() {
  ghNotice('🚀 Starting Official Azure ZipDeploy...');

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

  const ok = await deployZipViaZipDeploy(scmHost, basicAuth, releaseZip);
  if (!ok) {
    ghError('Deployment failed on both ZipDeploy and VFS fallback.');
    process.exit(1);
  }

  ghNotice('🎉 DEPLOYMENT FINISHED SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
