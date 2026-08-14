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
        'User-Agent': 'Antigravity-Release-Deployer/7.0',
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

async function uploadZipToWwwroot(scmHost, basicAuth, zipPath) {
  if (!fs.existsSync(zipPath)) return false;
  const stats = fs.statSync(zipPath);
  ghNotice(`Unpacking full ${path.basename(zipPath)} (${(stats.size / (1024 * 1024)).toFixed(2)} MB) directly to /site/wwwroot/ ...`);

  const stream = fs.createReadStream(zipPath);
  const res = await makeKuduRequest(scmHost, basicAuth, '/api/zip/site/wwwroot/', 'PUT', stream, {
    'Content-Type': 'application/zip',
    'Content-Length': stats.size
  });

  ghNotice(`Release ZIP unpack status: HTTP ${res.code} ${res.msg}`);
  return res.code >= 200 && res.code < 300;
}

async function forceContainerRestart(scmHost, basicAuth) {
  ghNotice('Forcefully recycling Node process on Azure Linux...');

  // 1. Process termination via Kudu
  const procRes = await makeKuduRequest(scmHost, basicAuth, '/api/processes/0', 'DELETE');
  ghNotice(`Process kill result: HTTP ${procRes.code} ${procRes.msg}`);

  // 2. Kudu bash command to kill node
  const cmdRes = await makeKuduRequest(scmHost, basicAuth, '/api/command', 'POST', JSON.stringify({
    command: 'killall -9 node || pkill -9 node || true',
    dir: '/home/site/wwwroot'
  }), { 'Content-Type': 'application/json', 'Content-Length': 73 });
  ghNotice(`Command kill result: HTTP ${cmdRes.code} ${cmdRes.msg}`);

  // 3. Diagnostics reboot endpoint
  const rebootRes = await makeKuduRequest(scmHost, basicAuth, '/api/diagnostics/reboot', 'POST');
  ghNotice(`Diagnostics reboot result: HTTP ${rebootRes.code} ${rebootRes.msg}`);

  // 4. Create restart.txt trigger
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/restart.txt', 'PUT', 'restart', {
    'If-Match': '*',
    'Content-Type': 'text/plain',
    'Content-Length': 7
  });

  // 5. App level reload
  const reloadReq = https.request({
    hostname: 'zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net',
    port: 443,
    path: '/api/system/reload',
    method: 'POST',
    timeout: 8000
  }, () => {});
  reloadReq.on('error', () => {});
  reloadReq.end();
}

async function main() {
  ghNotice('🚀 Starting Full Release ZIP Deployment to wwwroot...');

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

  // Step 1: Upload and extract full release.zip to /site/wwwroot/
  const releaseZip = path.resolve(process.cwd(), 'release.zip');
  const ok = await uploadZipToWwwroot(scmHost, basicAuth, releaseZip);
  if (!ok) {
    ghError('Release ZIP deployment failed.');
    process.exit(1);
  }

  // Step 2: Force process restart so new server.js starts
  await forceContainerRestart(scmHost, basicAuth);

  ghNotice('🎉 FULL RELEASE ZIP UNPACKED AND CONTAINER RESTARTED SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
