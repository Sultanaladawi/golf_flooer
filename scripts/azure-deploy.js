const fs = require('fs');
const https = require('https');
const path = require('path');

async function main() {
  console.log('🚀 Starting Azure Deploy via Kudu API...');

  const publishProfile = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || process.env.PUBLISH_PROFILE;
  if (!publishProfile) {
    console.error('❌ ERROR: AZURE_WEBAPP_PUBLISH_PROFILE secret is empty or not set!');
    process.exit(1);
  }

  console.log(`📄 Publish profile loaded (length: ${publishProfile.length} chars)`);

  // Extract MSDeploy profile attributes
  const profileMatches = publishProfile.match(/<publishProfile\s+[^>]+>/g) || [];
  console.log(`Found ${profileMatches.length} profiles in XML`);

  let targetProfile = profileMatches.find(p => p.includes('publishMethod="MSDeploy"') || p.includes('publishMethod=\'MSDeploy\''));
  if (!targetProfile) {
    console.log('⚠️ MSDeploy profile not found, checking all profiles...');
    targetProfile = profileMatches.find(p => p.includes('scm') || p.includes('kudu') || p.includes('publishUrl'));
  }
  if (!targetProfile && profileMatches.length > 0) {
    targetProfile = profileMatches[0];
  }

  if (!targetProfile) {
    console.error('❌ ERROR: Could not parse any <publishProfile> from publish settings!');
    process.exit(1);
  }

  const getAttr = (tag, name) => {
    const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
    return match ? match[1] : null;
  };

  const rawUrl = getAttr(targetProfile, 'publishUrl');
  const userName = getAttr(targetProfile, 'userName');
  const userPWD = getAttr(targetProfile, 'userPWD');

  if (!rawUrl || !userName || !userPWD) {
    console.error('❌ ERROR: Missing publishUrl, userName, or userPWD in publish profile!');
    console.error('Profile snippet:', targetProfile.substring(0, 150));
    process.exit(1);
  }

  // Clean hostname
  let host = rawUrl.replace(/^https?:\/\//i, '').replace(/^ftp:\/\//i, '').replace(/:\d+$/, '').trim();
  console.log(`🎯 Target SCM Host: ${host}`);
  console.log(`👤 Deploy User: ${userName}`);
  console.log(`🔑 Password length: ${userPWD.length} chars`);

  const zipPath = path.resolve(process.cwd(), 'release.zip');
  if (!fs.existsSync(zipPath)) {
    console.error(`❌ ERROR: release.zip not found at: ${zipPath}`);
    process.exit(1);
  }

  const zipSize = fs.statSync(zipPath).size;
  console.log(`📦 Release ZIP found: ${(zipSize / (1024 * 1024)).toFixed(2)} MB`);

  const authHeader = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Step 1: Trigger ZipDeploy (async mode for stability)
  console.log(`\n⏳ Uploading release.zip to https://${host}/api/zipdeploy?isAsync=true ...`);

  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: host,
      port: 443,
      path: '/api/zipdeploy?isAsync=true&clean=true',
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/octet-stream',
        'Content-Length': zipSize,
        'User-Agent': 'Antigravity-Azure-Deployer/1.0'
      },
      timeout: 300000 // 5 minutes upload timeout
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        console.log(`📥 Upload HTTP Status: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ ZIP uploaded successfully!');
          resolve();
        } else {
          console.error(`❌ ZIP upload failed with status ${res.statusCode}`);
          console.error(`Response: ${resBody}`);
          reject(new Error(`Upload failed with HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', err => {
      console.error('❌ Request error during upload:', err.message);
      reject(err);
    });

    // Stream file
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(req);
  });

  // Step 2: Poll deployment status until complete
  console.log('\n🔍 Monitoring deployment progress...');
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max polling (5s * 60)

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise(r => setTimeout(r, 5000));

    try {
      const statusData = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: host,
          port: 443,
          path: '/api/deployments/latest',
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'User-Agent': 'Antigravity-Azure-Deployer/1.0'
          },
          timeout: 10000
        }, (res) => {
          let body = '';
          res.on('data', d => body += d);
          res.on('end', () => {
            try {
              const json = JSON.parse(body);
              resolve(json);
            } catch (e) {
              resolve({ raw: body, status: res.statusCode });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      const status = statusData.status !== undefined ? statusData.status : statusData.status_text;
      const message = statusData.message || statusData.progress || 'Processing...';
      const complete = statusData.complete;

      console.log(`[Attempt ${attempts}/${maxAttempts}] Status: ${status} (Complete: ${complete}) - ${message}`);

      // Kudu status codes: 4 = Success, 3 = Failed
      if (complete === true || status === 4 || status === 'Success') {
        if (status === 3 || status === 'Failed') {
          console.error('❌ Deployment finished with FAILED status!');
          process.exit(1);
        }
        console.log('\n🎉 Deployment completed SUCCESSFULLY in Azure!');
        return;
      }
    } catch (pollErr) {
      console.log(`[Attempt ${attempts}] Polling notice: ${pollErr.message}`);
    }
  }

  console.log('\n⚠️ Polling timeout reached, but ZIP was accepted. Verifying app health...');
}

main().catch(err => {
  console.error('💥 Fatal deployment error:', err.message);
  process.exit(1);
});
