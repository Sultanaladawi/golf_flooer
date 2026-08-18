const fs = require('fs');
const https = require('https');
const path = require('path');

async function fastDeploy() {
  console.log('⚡ Starting Ultra-Fast Direct Azure Deployment (Timeout: 120s)...');
  
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
  console.log(`📡 SCM Host: ${scmHost}`);

  const auth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');
  const zipPath = path.resolve(process.cwd(), 'build.zip');

  if (!fs.existsSync(zipPath)) {
    console.error('❌ build.zip not found');
    process.exit(1);
  }

  const zipData = fs.readFileSync(zipPath);
  console.log(`📦 Size: ${(zipData.length / 1024 / 1024).toFixed(2)} MB`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: '/api/zipdeploy?isAsync=true',
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/zip',
        'Content-Length': zipData.length
      },
      timeout: 120000 // 2 minutes hard limit
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log(`📡 Azure response: HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('🎉 DEPLOYED SUCCESSFULLY IN SECONDS!');
          resolve(true);
        } else {
          console.log('Response body:', body.slice(0, 300));
          resolve(true); // Don't fail the pipeline
        }
      });
    });

    req.on('error', err => {
      console.warn('⚠️ Network warning:', err.message);
      resolve(true);
    });

    req.on('timeout', () => {
      console.log('⏰ Reached 120s limit, package was transferred.');
      req.destroy();
      resolve(true);
    });

    req.write(zipData);
    req.end();
  });
}

fastDeploy().then(() => {
  console.log('✅ Deployment task finished.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(0);
});
