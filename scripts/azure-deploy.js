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
        'User-Agent': 'Antigravity-Direct-Zip/2.0',
        ...headers
      },
      timeout: 300000
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

async function triggerLiveReload() {
  ghNotice('Sending reload signal to live application...');
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net',
      port: 443,
      path: '/api/system/reload',
      method: 'POST',
      timeout: 10000
    }, (res) => {
      ghNotice(`Live reload response: HTTP ${res.statusCode}`);
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function deployDirectToWwwroot(scmHost, basicAuth, zipPath, zipSize) {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    ghNotice(`[Attempt ${attempt}/${maxRetries}] Direct Extraction: PUT /api/zip/site/wwwroot/ (${(zipSize / (1024 * 1024)).toFixed(2)} MB)...`);

    const stream = fs.createReadStream(zipPath);
    const result = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream, {
      'Content-Type': 'application/zip',
      'Content-Length': zipSize
    });

    ghNotice(`Direct Zip Result: HTTP ${result.code} ${result.msg}`);

    if (result.code >= 200 && result.code < 300) {
      ghNotice('🎉 SUCCESS! All files extracted directly into /home/site/wwwroot/ on Azure!');
      return true;
    }

    ghNotice(`Response detail: ${result.body.substring(0, 200)}`);
    await new Promise(r => setTimeout(r, 10000));
  }

  return false;
}

async function main() {
  ghNotice('🚀 Starting Azure Direct wwwroot Deployment...');

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

  const ok = await deployDirectToWwwroot(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('Direct wwwroot extraction failed.');
    process.exit(1);
  }

  // Trigger live reload
  await triggerLiveReload();

  ghNotice('🎉 ALL ASSETS & CODE EXTRACTED DIRECTLY INTO WWWROOT SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
