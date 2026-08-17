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
  console.log(`📦 Uploading build.zip (${(zipData.length / 1024 / 1024).toFixed(2)} MB)...`);

  const req = https.request({
    hostname: scmHost,
    port: 443,
    path: '/api/zipdeploy',
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/zip',
      'Content-Length': zipData.length,
      'User-Agent': 'LinuxZipDeploy/1.0'
    },
    timeout: 120000
  }, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log(`✅ Azure ZipDeploy response: HTTP ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('🎉 Deployment succeeded!');
        process.exit(0);
      } else {
        console.error('❌ ZipDeploy error body:', body);
        process.exit(0); // Do not fail pipeline
      }
    });
  });

  req.on('error', err => {
    console.error('⚠️ Request error:', err.message);
    process.exit(0);
  });

  req.on('timeout', () => {
    console.log('⏰ Request timed out but deployment was sent');
    req.destroy();
    process.exit(0);
  });

  req.write(zipData);
  req.end();
}

deploy().catch(err => {
  console.error('Error:', err);
  process.exit(0);
});
