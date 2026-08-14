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
  return new Promise((resolve) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: reqPath,
      method: method,
      headers: {
        'Authorization': basicAuth,
        'User-Agent': 'Antigravity-Azure-Deployer/9.0',
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

async function waitForKuduIdle(scmHost, basicAuth) {
  ghNotice('Checking Azure Kudu engine readiness...');
  for (let i = 1; i <= 12; i++) {
    const statusRes = await makeKuduRequest(scmHost, basicAuth, '/api/deployments/latest', 'GET');
    if (statusRes.code === 200) {
      try {
        const info = JSON.parse(statusRes.body);
        if (info.complete === true || info.status === 4 || info.status === 3) {
          ghNotice(`Kudu engine is IDLE and ready for deployment. (Last status: ${info.status_text || info.status})`);
          return true;
        }
        ghNotice(`[Wait ${i}/12] Azure is still finalizing previous task (${info.status_text || 'Processing'}). Waiting 15s...`);
      } catch (e) {
        return true;
      }
    } else if (statusRes.code === 404) {
      ghNotice('No previous deployment found. Kudu is ready.');
      return true;
    } else {
      ghNotice(`[Wait ${i}/12] Status check returned HTTP ${statusRes.code}. Waiting 10s...`);
    }
    await new Promise(r => setTimeout(r, 15000));
  }
  return true;
}

async function uploadZipDeploy(scmHost, basicAuth, zipPath, zipSize) {
  await waitForKuduIdle(scmHost, basicAuth);

  const maxRetries = 6;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    ghNotice(`[Attempt ${attempt}/${maxRetries}] Uploading release.zip (${(zipSize / (1024 * 1024)).toFixed(2)} MB) to /api/zipdeploy ...`);

    const stream = fs.createReadStream(zipPath);
    const result = await makeKuduRequest(scmHost, basicAuth, '/api/zipdeploy?isAsync=true&clean=false', 'POST', stream, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': zipSize
    });

    ghNotice(`ZipDeploy Status: HTTP ${result.code} ${result.msg}`);

    if (result.code >= 200 && result.code < 300) {
      ghNotice('🎉 SUCCESS! Azure accepted release.zip for deployment.');
      return true;
    }

    if (result.code === 409) {
      ghNotice(`⏳ Received 409 Conflict. Waiting 30s before retry attempt ${attempt + 1}...`);
      await new Promise(r => setTimeout(r, 30000));
    } else {
      ghNotice(`Response detail: ${result.body.substring(0, 150)}`);
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  return false;
}

async function main() {
  ghNotice('🚀 Starting Azure Deploy via Kudu API...');

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
  let publishMethod = '';

  for (const block of profileBlocks) {
    const method = getAttr(block, 'publishMethod') || '';
    if (method.toLowerCase() === 'msdeploy') {
      selectedBlock = block;
      publishMethod = method;
      break;
    }
  }

  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
    publishMethod = getAttr(selectedBlock, 'publishMethod') || 'Default';
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  ghNotice(`Deploying to ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    ghError(`release.zip not found at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);

  const ok = await uploadZipDeploy(scmHost, basicAuth, zipPath, zipStats.size);
  if (!ok) {
    ghError('Deployment failed after all attempts.');
    process.exit(1);
  }

  ghNotice('🎉 DEPLOYMENT FINISHED 100% SUCCESSFULLY IN AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
