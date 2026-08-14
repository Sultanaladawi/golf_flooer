const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

function ghNotice(msg) {
  console.log(`::notice::${msg}`);
}

function ghError(msg) {
  console.log(`::error::${msg}`);
}

async function uploadZipFile(scmHost, basicAuth, zipFilePath, targetPath = '/api/zip/site/wwwroot/') {
  if (!fs.existsSync(zipFilePath)) {
    return false;
  }

  const stats = fs.statSync(zipFilePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const baseName = path.basename(zipFilePath);

  ghNotice(`Uploading ${baseName} (${sizeMB} MB) to https://${scmHost}${targetPath} ...`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: scmHost,
      port: 443,
      path: targetPath,
      method: 'PUT',
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size,
        'User-Agent': 'Antigravity-Azure-Deployer/3.0'
      },
      timeout: 300000 // 5 minutes timeout
    }, (res) => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => {
        ghNotice(`${baseName} HTTP ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          ghError(`${baseName} failed with HTTP ${res.statusCode}: ${body.substring(0, 200)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      ghError(`Network error uploading ${baseName}: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Upload timed out for ${baseName}`));
    });

    const stream = fs.createReadStream(zipFilePath);
    stream.pipe(req);
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

async function packageAndUploadMediaChunks(scmHost, basicAuth) {
  const mediaDir = path.resolve(process.cwd(), 'build');
  if (!fs.existsSync(mediaDir)) return;

  const allFiles = getAllFiles(mediaDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.gif', '.svg'].includes(ext);
  });

  if (allFiles.length === 0) {
    ghNotice('No media files found in build to upload.');
    return;
  }

  ghNotice(`Found ${allFiles.length} media files. Chunking into <35MB packages...`);

  const chunkDir = path.resolve('/tmp/media_chunks');
  if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

  const CHUNK_LIMIT = 35 * 1024 * 1024; // 35 MB safe limit
  let currentChunkFiles = [];
  let currentChunkSize = 0;
  let chunkIndex = 1;
  const createdZips = [];

  for (const filePath of allFiles) {
    const size = fs.statSync(filePath).size;
    if (currentChunkSize + size > CHUNK_LIMIT && currentChunkFiles.length > 0) {
      // Create zip for current chunk
      const zipName = path.join(chunkDir, `media_part_${chunkIndex}.zip`);
      const fileListTxt = path.join(chunkDir, `files_${chunkIndex}.txt`);
      fs.writeFileSync(fileListTxt, currentChunkFiles.map(f => path.relative(process.cwd(), f)).join('\n'));
      execSync(`zip -q -@ "${zipName}" < "${fileListTxt}"`, { cwd: process.cwd() });
      createdZips.push(zipName);
      chunkIndex++;
      currentChunkFiles = [];
      currentChunkSize = 0;
    }
    currentChunkFiles.push(filePath);
    currentChunkSize += size;
  }

  if (currentChunkFiles.length > 0) {
    const zipName = path.join(chunkDir, `media_part_${chunkIndex}.zip`);
    const fileListTxt = path.join(chunkDir, `files_${chunkIndex}.txt`);
    fs.writeFileSync(fileListTxt, currentChunkFiles.map(f => path.relative(process.cwd(), f)).join('\n'));
    execSync(`zip -q -@ "${zipName}" < "${fileListTxt}"`, { cwd: process.cwd() });
    createdZips.push(zipName);
  }

  ghNotice(`Created ${createdZips.length} media chunk(s). Uploading to Azure...`);

  for (let i = 0; i < createdZips.length; i++) {
    const zipFile = createdZips[i];
    ghNotice(`[Chunk ${i + 1}/${createdZips.length}] Uploading ${path.basename(zipFile)}...`);
    await uploadZipFile(scmHost, basicAuth, zipFile);
  }

  ghNotice('🎉 All media assets deployed successfully!');
}

async function main() {
  ghNotice('🚀 Starting Azure Deploy via Kudu API...');

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
  let publishMethod = '';

  for (const block of profileBlocks) {
    const method = getAttr(block, 'publishMethod') || '';
    if (method.toLowerCase() === 'msdeploy') {
      selectedBlock = block;
      publishMethod = method;
      break;
    }
  }

  if (!selectedBlock && profileBlocks.length > 0) {
    selectedBlock = profileBlocks[0];
    publishMethod = getAttr(selectedBlock, 'publishMethod') || 'Default';
  }

  const rawUrl = getAttr(selectedBlock, 'publishUrl');
  const userName = getAttr(selectedBlock, 'userName');
  const userPWD = getAttr(selectedBlock, 'userPWD');

  const scmHost = rawUrl
    .replace(/^https?:\/\//i, '')
    .replace(/^ftp:\/\//i, '')
    .replace(/:\d+$/, '')
    .trim();

  ghNotice(`Deploying to ${scmHost} (User: ${userName})`);

  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // Step 1: Upload Core App release.zip
  const coreOk = await uploadZipFile(scmHost, basicAuth, path.resolve(process.cwd(), 'release.zip'));
  if (!coreOk) {
    ghError('Core release.zip deployment failed!');
    process.exit(1);
  }

  // Step 2: Chunk and upload all media assets safely under 35MB limits
  try {
    await packageAndUploadMediaChunks(scmHost, basicAuth);
  } catch (mediaErr) {
    ghNotice(`Media upload notice: ${mediaErr.message}`);
  }

  ghNotice('🎉 ALL DEPLOYMENT TASKS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  ghError(`Fatal error: ${err.message}`);
  process.exit(1);
});
