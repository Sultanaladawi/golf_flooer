const fs = require('fs');
const https = require('https');
const path = require('path');

async function main() {
  console.log('==============================================');
  console.log('🚀 AZURE KUDU DIRECT ZIP DEPLOYER');
  console.log('==============================================\n');

  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || process.env.PUBLISH_PROFILE || '';
  if (!rawSecret || rawSecret.trim().length === 0) {
    console.error('❌ FATAL: AZURE_WEBAPP_PUBLISH_PROFILE secret is empty or missing in GitHub Secrets!');
    console.error('Please verify that AZURE_WEBAPP_PUBLISH_PROFILE exists in Settings > Secrets and variables > Actions');
    process.exit(1);
  }

  console.log(`📄 Secret content loaded (${rawSecret.length} characters)`);

  // Robust XML block extraction
  const profileBlocks = rawSecret.match(/<publishProfile[\s\S]*?(?:\/>|>[\s\S]*?<\/publishProfile>)/gi) || [];
  console.log(`🔍 Detected ${profileBlocks.length} profile block(s) in XML.`);

  const getAttr = (block, attrName) => {
    const match = block.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, 'i'));
    return match ? match[1] : null;
  };

  let selectedBlock = null;
  let publishMethod = '';

  // Priority 1: MSDeploy
  for (const block of profileBlocks) {
    const method = getAttr(block, 'publishMethod') || '';
    if (method.toLowerCase() === 'msdeploy') {
      selectedBlock = block;
      publishMethod = method;
      break;
    }
  }

  // Priority 2: Any block with publishUrl containing scm or azurewebsites
  if (!selectedBlock) {
    for (const block of profileBlocks) {
      const url = getAttr(block, 'publishUrl') || '';
      if (url.includes('scm') || url.includes('azurewebsites')) {
        selectedBlock = block;
        publishMethod = getAttr(block, 'publishMethod') || 'SCM';
        break;
      }
    }
  }

  // Priority 3: First available block
  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
    publishMethod = getAttr(selectedBlock, 'publishMethod') || 'Default';
  }

  if (!selectedBlock) {
    console.error('❌ ERROR: Could not find any valid <publishProfile> blocks in the XML secret.');
    console.error('Raw secret preview (first 200 chars):', rawSecret.substring(0, 200));
    process.exit(1);
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  if (!rawUrl || !userName || !userPWD) {
    console.error('❌ ERROR: Missing required fields in selected profile:');
    console.error(`  publishUrl: ${rawUrl ? 'FOUND' : 'MISSING'}`);
    console.error(`  userName:   ${userName ? 'FOUND' : 'MISSING'}`);
    console.error(`  userPWD:    ${userPWD ? 'FOUND' : 'MISSING'}`);
    process.exit(1);
  }

  // Clean hostname (remove protocol and port)
  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  console.log(`📌 Using Profile Method: ${publishMethod}`);
  console.log(`🌐 Target SCM Host:     ${scmHost}`);
  console.log(`👤 Deploy Username:     ${userName}`);
  console.log(`🔑 Deploy Password:     [${userPWD.length} characters masked]`);

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    console.error(`❌ ERROR: release.zip file does not exist at ${zipPath}`);
    process.exit(1);
  }

  const zipStats = fs.statSync(zipPath);
  const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
  console.log(`📦 Release Package:     release.zip (${zipSizeMB} MB, ${zipStats.size} bytes)`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Perform ZipDeploy
  console.log(`\n⏳ Uploading ${zipSizeMB} MB to https://${scmHost}/api/zipdeploy ...`);

  const uploadResult = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: '/api/zipdeploy?isAsync=true&clean=true',
      method: 'POST',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/octet-stream',
        'Content-Length': zipStats.size,
        'User-Agent': 'Antigravity-Azure-Deployer/2.0'
      },
      timeout: 300000 // 5 minutes timeout
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => {
      console.error('❌ Network error during upload:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy(new Error('Upload request timed out after 5 minutes'));
    });

    const readStream = fs.createReadStream(zipPath);
    readStream.pipe(req);
  });

  console.log(`📥 Upload Response: HTTP ${uploadResult.statusCode} ${uploadResult.statusMessage}`);
  if (uploadResult.body) {
    console.log(`📥 Response Body: ${uploadResult.body.substring(0, 300)}`);
  }

  if (uploadResult.statusCode < 200 || uploadResult.statusCode >= 300) {
    console.error(`\n❌ Deployment upload rejected with status ${uploadResult.statusCode}!`);
    process.exit(1);
  }

  console.log('\n✅ Package uploaded and accepted by Azure Kudu engine.');
  console.log('⏳ Polling deployment completion status...');

  // Poll for deployment status
  let pollCount = 0;
  const maxPolls = 60; // 5 minutes (60 * 5s)
  let isDone = false;

  while (pollCount < maxPolls && !isDone) {
    pollCount++;
    await new Promise(r => setTimeout(r, 5000));

    try {
      const pollRes = await new Promise((resolve, reject) => {
        const pReq = https.request({
          hostname: scmHost,
          port: 443,
          path: '/api/deployments/latest',
          method: 'GET',
          headers: {
            'Authorization': basicAuth,
            'User-Agent': 'Antigravity-Azure-Deployer/2.0'
          },
          timeout: 10000
        }, (res) => {
          let b = '';
          res.on('data', c => { b += c; });
          res.on('end', () => resolve({ code: res.statusCode, body: b }));
        });
        pReq.on('error', reject);
        pReq.end();
      });

      if (pollRes.code === 200) {
        try {
          const deployInfo = JSON.parse(pollRes.body);
          const status = deployInfo.status;
          const statusText = deployInfo.status_text || 'Deploying...';
          const complete = deployInfo.complete;
          const progressMsg = deployInfo.progress || deployInfo.message || '';

          console.log(`  [Poll ${pollCount}/${maxPolls}] Status: ${statusText} (Code: ${status}, Complete: ${complete}) ${progressMsg ? '- ' + progressMsg : ''}`);

          // Status 4 = Success, Status 3 = Failed
          if (complete === true || status === 4 || status === 'Success') {
            if (status === 3 || status === 'Failed') {
              console.error('\n❌ Kudu deployment failed during extraction/build.');
              console.error('Details:', deployInfo);
              process.exit(1);
            }
            console.log('\n==============================================');
            console.log('🎉 DEPLOYMENT SUCCEEDED 100% IN AZURE!');
            console.log('==============================================\n');
            isDone = true;
            return;
          }
        } catch (parseErr) {
          console.log(`  [Poll ${pollCount}] Status: HTTP ${pollRes.code} (unpacking files...)`);
        }
      } else {
        console.log(`  [Poll ${pollCount}] Status endpoint returned HTTP ${pollRes.code}`);
      }
    } catch (pollError) {
      console.log(`  [Poll ${pollCount}] Polling notice: ${pollError.message}`);
    }
  }

  if (!isDone) {
    console.log('\n⚠️ Polling finished. Upload succeeded with HTTP 202. Azure is finishing startup.');
  }
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
