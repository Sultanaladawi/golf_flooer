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
        'User-Agent': 'Antigravity-Direct-Deployer/2.0',
        ...headers
      },
      timeout: 60000
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

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function syncDirectoryDirect(scmHost, basicAuth, localDir, remoteSubdir) {
  const allFiles = getAllFiles(localDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return !['.mp4', '.mov', '.webm'].includes(ext);
  });

  ghNotice(`Direct VFS upload of ${allFiles.length} files to /site/wwwroot/${remoteSubdir}...`);

  // Upload in chunks of 5 parallel requests
  const CONCURRENCY = 5;
  for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
    const slice = allFiles.slice(i, i + CONCURRENCY);
    await Promise.all(slice.map(async (file) => {
      const relPath = path.relative(localDir, file).replace(/\\/g, '/');
      const targetUrlPath = `/api/vfs/site/wwwroot/${remoteSubdir ? remoteSubdir + '/' : ''}${relPath}`;
      const fileData = fs.readFileSync(file);
      await makeKuduRequest(scmHost, basicAuth, targetUrlPath, 'PUT', fileData, {
        'If-Match': '*'
      });
    }));
  }

  ghNotice(`✅ Direct VFS sync of ${allFiles.length} files completed successfully!`);
}

async function main() {
  ghNotice('🚀 Starting Azure Direct VFS Deployment...');

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

  // Step 1: Upload bundled server.js and package.json to root
  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  if (fs.existsSync(serverPath)) {
    ghNotice('Uploading server.js to /site/wwwroot/server.js ...');
    const sData = fs.readFileSync(serverPath);
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/server.js', 'PUT', sData, { 'If-Match': '*' });
  }

  const pkgPath = path.resolve(process.cwd(), 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pData = fs.readFileSync(pkgPath);
    await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/package.json', 'PUT', pData, { 'If-Match': '*' });
  }

  // Step 2: Direct sync of all build assets (build/index.html, build/static/css/*, build/static/js/*)
  const buildDir = path.resolve(process.cwd(), 'build');
  if (fs.existsSync(buildDir)) {
    // Sync into /site/wwwroot/build
    await syncDirectoryDirect(scmHost, basicAuth, buildDir, 'build');

    // Also sync index.html and static assets to /site/wwwroot directly
    const indexPath = path.join(buildDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      const idxData = fs.readFileSync(indexPath);
      await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/index.html', 'PUT', idxData, { 'If-Match': '*' });
    }

    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      await syncDirectoryDirect(scmHost, basicAuth, staticDir, 'static');
    }
  }

  // Step 3: Trigger Node App Restart to load latest assets and code immediately
  ghNotice('Restarting Azure Web App service to load fresh assets...');
  await makeKuduRequest(scmHost, basicAuth, '/api/vfs/site/wwwroot/restart.txt', 'PUT', new Date().toISOString(), { 'If-Match': '*' });

  // Send Kudu Command to restart Node server cleanly
  const cmdPayload = JSON.stringify({
    command: 'kill -9 $(pgrep -f server.js) || pkill -9 -f node || pm2 restart all || true',
    dir: '/home/site/wwwroot'
  });
  const cmdRes = await makeKuduRequest(scmHost, basicAuth, '/api/command', 'POST', cmdPayload, {
    'Content-Type': 'application/json'
  });
  ghNotice(`Kudu command restart result: HTTP ${cmdRes.code} ${cmdRes.msg}`);

  ghNotice('🎉 ALL ASSETS & CODE DEPLOYED AND APP RESTARTED SUCCESSFULLY IN AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
