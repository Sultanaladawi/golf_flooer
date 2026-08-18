const fs = require('fs');
const https = require('https');
const path = require('path');

async function deploy() {
  console.log('🚀 Starting Direct Linux ZipDeploy...');
  
  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || '';
  if (!rawSecret) {
    console.error('❌ AZURE_WEBAPP_PUBLISH_PROFILE is missing');
    process.exit(1);
  }

  const profileBlocks = rawSecret.match(/<publishProfile[\s\S]*?(?:\/>|>[\s\S]*?<\/publishProfile>)/gi) || [];
  const getAttr = (block, name) => {
    const m = block.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
    return m ? m[1] : null;
  };

  let selected = profileBlocks.find(b => (getAttr(b, 'publishMethod') || '').toLowerCase() === 'msdeploy') || profileBlocks[0];
  const rawUrl = getAttr(selected, 'publishUrl');
  const userName = getAttr(selected, 'userName');
  const userPWD = getAttr(selected, 'userPWD');

  const scmHost = rawUrl.replace(/^https?:\/\//i, '').replace(/^ftp:\/\//i, '').replace(/:\d+$/, '').trim();
  console.log(`📡 Connecting to SCM: ${scmHost} (User: ${userName})`);

  const auth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');
  const zipPath = path.resolve(process.cwd(), 'build.zip');

  if (!fs.existsSync(zipPath)) {
    console.error('❌ build.zip not found');
    process.exit(1);
  }

  const zipData = fs.readFileSync(zipPath);

  function attemptUpload(attempt = 1) {
    return new Promise((resolve, reject) => {
      console.log(`📦 [Attempt ${attempt}/4] Uploading build.zip (${(zipData.length / 1024 / 1024).toFixed(2)} MB)...`);

      const req = https.request({
        hostname: scmHost,
        port: 443,
        path: '/api/zipdeploy?isAsync=true',
        method: 'POST',
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/zip',
          'Content-Length': zipData.length,
          'User-Agent': 'LinuxZipDeploy/1.0'
        },
        timeout: 300000
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          console.log(`📡 Azure ZipDeploy response: HTTP ${res.statusCode} ${res.statusMessage}`);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('🎉 Async Zip Deployment accepted by Azure successfully!');
            resolve(true);
          } else if ([502, 503, 504, 429].includes(res.statusCode) && attempt < 4) {
            console.warn(`⚠️ Azure returned temporary HTTP ${res.statusCode}. Retrying in 15 seconds...`);
            setTimeout(() => {
              attemptUpload(attempt + 1).then(resolve).catch(reject);
            }, 15000);
          } else {
            console.error('❌ ZipDeploy error body:', body.slice(0, 500));
            reject(new Error(`Deployment failed with HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', err => {
        if (attempt < 4) {
          console.warn(`⚠️ Network error (${err.message}). Retrying in 15s...`);
          setTimeout(() => attemptUpload(attempt + 1).then(resolve).catch(reject), 15000);
        } else {
          reject(err);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (attempt < 4) {
          console.warn(`⏰ Request timeout. Retrying in 15s...`);
          setTimeout(() => attemptUpload(attempt + 1).then(resolve).catch(reject), 15000);
        } else {
          reject(new Error('Request timed out after all retries'));
        }
      });

      req.write(zipData);
      req.end();
    });
  }

  await attemptUpload();
}

deploy().catch(err => {
  console.error('Fatal Deployment Error:', err.message);
  process.exit(1);
});
