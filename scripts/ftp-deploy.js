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
  
  const offlinePath = path.join(localDeployDir, 'app_offline.htm');
  fs.writeFileSync(offlinePath, '<html><body>Updating server...</body></html>', 'utf8');
  try {
    console.log('🛑 Placing app_offline.htm to cleanly recycle IIS worker and release locks...');
    await client.uploadFrom(offlinePath, '/site/wwwroot/app_offline.htm');
  } catch (e) {
    console.log('app_offline notice:', e.message);
  }

  // Upload root server files
  const rootFiles = ['index.html', 'server_v2.js', 'main_server.js', 'server.js', 'app.js', 'package.json', 'web.config', 'Zahrat_Beesan_Catalog_2026.pdf'];
  for (const f of rootFiles) {
    const src = path.join(localDeployDir, f);
    if (fs.existsSync(src)) {
      console.log(`⬆️ Uploading /site/wwwroot/${f}...`);
      await client.uploadFrom(src, `/site/wwwroot/${f}`);
    }
  }

  // Also upload to build/
  const buildPdf = path.join(localDeployDir, 'build', 'Zahrat_Beesan_Catalog_2026.pdf');
  if (fs.existsSync(buildPdf)) {
    console.log(`⬆️ Uploading /site/wwwroot/build/Zahrat_Beesan_Catalog_2026.pdf...`);
    await client.uploadFrom(buildPdf, `/site/wwwroot/build/Zahrat_Beesan_Catalog_2026.pdf`);
  }

  // Ensure directories exist
  await client.ensureDir('/site/wwwroot/server');
  await client.ensureDir('/site/wwwroot/data/labels');
  await client.ensureDir('/site/wwwroot/static/js');
  await client.ensureDir('/site/wwwroot/static/css');
  await client.ensureDir('/site/wwwroot/build/static/js');
  await client.ensureDir('/site/wwwroot/build/static/css');

  // Upload server files
  const serverDir = path.join(localDeployDir, 'server');
  if (fs.existsSync(serverDir)) {
    const serverFiles = fs.readdirSync(serverDir);
    for (const sf of serverFiles) {
      console.log(`⬆️ Uploading server file: ${sf}...`);
      await client.uploadFrom(path.join(serverDir, sf), `/site/wwwroot/server/${sf}`);
    }
  }

  // Upload build/index.html
  const buildIndex = path.join(localDeployDir, 'build', 'index.html');
  if (fs.existsSync(buildIndex)) {
    await client.uploadFrom(buildIndex, '/site/wwwroot/build/index.html');
  }

  const jsDir = path.join(localDeployDir, 'static', 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    for (const f of jsFiles) {
      console.log(`⬆️ Uploading JS: ${f}...`);
      await client.uploadFrom(path.join(jsDir, f), `/site/wwwroot/static/js/${f}`);
      await client.uploadFrom(path.join(jsDir, f), `/site/wwwroot/build/static/js/${f}`);
    }
  }

  const cssDir = path.join(localDeployDir, 'static', 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir);
    for (const f of cssFiles) {
      console.log(`⬆️ Uploading CSS: ${f}...`);
      await client.uploadFrom(path.join(cssDir, f), `/site/wwwroot/static/css/${f}`);
      await client.uploadFrom(path.join(cssDir, f), `/site/wwwroot/build/static/css/${f}`);
    }
  }

  try {
    console.log('🚀 Removing app_offline.htm to start fresh worker with new code...');
    await client.remove('/site/wwwroot/app_offline.htm');
  } catch (e) {
    console.log('app_offline remove notice:', e.message);
  }


  console.log('🎉 ALL FRESH ASSETS TRANSFERRED TO AZURE IN SECONDS VIA FTPS!');
  client.close();
  console.log('✅ Azure deployment complete — app_offline removed, worker will restart automatically.');
}

async function runWithRetry() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🚀 Starting FTPS Deployment Attempt ${attempt}/3...`);
      await deployViaFTP();
      console.log('✅ FTPS Deployment Complete!');
      process.exit(0);
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} failed with:`, err.message);
      if (attempt === 3) {
        console.error('❌ All 3 FTP deployment attempts failed.');
        process.exit(1);
      }
      console.log('⏳ Retrying in 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

runWithRetry();
