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
  console.log(`📁 Fast FTPS upload of core runtime files...`);

  await client.ensureDir('/site/wwwroot');
  
  // Upload root server files
  const rootFiles = ['index.html', 'main_server.js', 'package.json', 'web.config'];
  for (const f of rootFiles) {
    const src = path.join(localDeployDir, f);
    if (fs.existsSync(src)) {
      console.log(`⬆️ Uploading /site/wwwroot/${f}...`);
      await client.uploadFrom(src, `/site/wwwroot/${f}`);
    }
  }

  // Upload static assets
  await client.ensureDir('/site/wwwroot/static/js');
  await client.ensureDir('/site/wwwroot/static/css');

  const jsDir = path.join(localDeployDir, 'static', 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    for (const f of jsFiles) {
      console.log(`⬆️ Uploading JS: ${f}...`);
      await client.uploadFrom(path.join(jsDir, f), `/site/wwwroot/static/js/${f}`);
    }
  }

  const cssDir = path.join(localDeployDir, 'static', 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    for (const f of cssFiles) {
      console.log(`⬆️ Uploading CSS: ${f}...`);
      await client.uploadFrom(path.join(cssDir, f), `/site/wwwroot/static/css/${f}`);
    }
  }

  console.log('🎉 ALL FRESH ASSETS TRANSFERRED TO AZURE IN SECONDS VIA FTPS!');
  client.close();
}

deployViaFTP().then(() => {
  console.log('✅ FTPS Deployment Complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ FTP Error:', err);
  process.exit(1);
});
