const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function deployViaFTP() {
  console.log('🚀 Starting Bulletproof FTPS Deployment to Azure...');

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

  let ftpProfile = profileBlocks.find(b => (getAttr(b, 'publishMethod') || '').toLowerCase() === 'ftp');
  if (!ftpProfile) {
    ftpProfile = profileBlocks.find(b => (getAttr(b, 'publishUrl') || '').startsWith('ftp'));
  }

  if (!ftpProfile) {
    console.error('❌ FTP profile not found in publish profile XML');
    process.exit(1);
  }

  const publishUrl = getAttr(ftpProfile, 'publishUrl') || '';
  const userName = getAttr(ftpProfile, 'userName') || '';
  const userPWD = getAttr(ftpProfile, 'userPWD') || '';

  // Parse host from publishUrl e.g. "ftp://waws-prod-swedencentral-001.ftp.azurewebsites.windows.net/site/wwwroot"
  const hostMatch = publishUrl.match(/^ftps?:\/\/([^/:]+)/i);
  const host = hostMatch ? hostMatch[1] : publishUrl.replace(/^ftps?:\/\//i, '').split('/')[0];
  
  console.log(`📡 Connecting to FTPS Host: ${host}`);
  console.log(`👤 Username: ${userName}`);

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: host,
      user: userName,
      password: userPWD,
      secure: 'implicit', // Azure App Service FTPS uses implicit TLS on port 990 or explicit on 21
      port: 990,
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('✅ Connected via FTPS on port 990!');
  } catch (err990) {
    console.log('⚠️ Port 990 failed, trying explicit FTPS on port 21...', err990.message);
    try {
      await client.access({
        host: host,
        user: userName,
        password: userPWD,
        secure: true,
        port: 21,
        secureOptions: { rejectUnauthorized: false }
      });
      console.log('✅ Connected via explicit FTPS on port 21!');
    } catch (err21) {
      console.error('❌ FTPS connection failed on both ports:', err21.message);
      process.exit(1);
    }
  }

  const localDeployDir = path.resolve(process.cwd(), 'deploy_stage');
  console.log(`📁 Uploading local directory: ${localDeployDir} to /site/wwwroot...`);

  await client.ensureDir('/site/wwwroot');
  await client.clearWorkingDir(); // Remove stale files
  await client.uploadFromDir(localDeployDir, '/site/wwwroot');

  console.log('🎉 ALL FILES TRANSFERRED TO AZURE /site/wwwroot SUCCESSFULLY VIA FTPS!');
  client.close();
}

deployViaFTP().then(() => {
  console.log('✅ FTPS Deployment Complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ FTP Error:', err);
  process.exit(1);
});
