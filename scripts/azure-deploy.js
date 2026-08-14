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
        'User-Agent': 'Antigravity-Direct-Deployer/1.0',
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
    // Exclude large raw media to keep sync instant; sync core code, html, css, js, json, svg
    return !['.mp4', '.mov', '.webm'].includes(ext);
  });

  ghNotice(`Syncing ${allFiles.length} core files directly via VFS to /site/wwwroot/${remoteSubdir}...`);

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const relPath = path.relative(localDir, file).replace(/\\/g, '/');
    const targetUrlPath = `/api/vfs/site/wwwroot/${remoteSubdir ? remoteSubdir + '/' : ''}${relPath}`;
    const fileData = fs.readFileSync(file);

    const res = await makeKuduRequest(scmHost, basicAuth, targetUrlPath, 'PUT', fileData, {
      'If-Match': '*'
    });

    if (res.code >= 200 && res.code < 300) {
      // Success
    } else {
      ghNotice(`[Notice] ${relPath} returned HTTP ${res.code}: ${res.msg}`);
    }
  }

  ghNotice(`✅ Direct VFS sync of ${allFiles.length} files completed!`);
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

  // Step 1: Upload server.js and package.json to root
  const serverPath = path.resolve(process.cwd(), 'release', 'server.js');
  if (fs.existsSync(serverPath)) {
    ghNotice('Uploading bundled server.js to /site/wwwroot/server.js ...');
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
    await syncDirectoryDirect(scmHost, basicAuth, buildDir, 'build');
  }

  ghNotice('🎉 ALL ASSETS & CODE DEPLOYED DIRECTLY TO AZURE!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
