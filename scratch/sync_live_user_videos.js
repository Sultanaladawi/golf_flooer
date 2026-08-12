const mysql = require('mysql2/promise');
const http = require('https');
const fs = require('fs');
const path = require('path');

const azureBase = 'https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net';

function fetchUrlBuffer(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function syncUserUploadedVideos() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const [products] = await connection.query('SELECT id, name, video_url FROM menu_items WHERE video_url IS NOT NULL AND video_url != "" ORDER BY id ASC');
  console.log('--- STARTING SYNC FOR EXACT USER UPLOADED VIDEOS ---');

  let count = 0;

  for (const p of products) {
    const rawVideo = p.video_url.trim();
    const cleanName = rawVideo.replace(/^\/images\//, '').replace(/^\/videos\//, '').replace(/^\//, '').trim();
    if (!cleanName) continue;

    console.log(`Product #${p.id} [${p.name}] video_url: "${cleanName}"`);

    const videoUrl = `${azureBase}/images/${encodeURIComponent(cleanName)}`;
    try {
      const buffer = await fetchUrlBuffer(videoUrl);
      
      // Save locally to public/images so it is committed to Git repository
      const localGitPath = path.resolve(__dirname, '../public/images', cleanName);
      fs.writeFileSync(localGitPath, buffer);

      // Save to MySQL product_image_store table permanently
      const ext = path.extname(cleanName).toLowerCase();
      const mimeType = ext === '.mov' ? 'video/quicktime' : ext === '.webm' ? 'video/webm' : 'video/mp4';
      const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

      await connection.query(
        'INSERT INTO product_image_store (filename, data_uri) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_uri = VALUES(data_uri)',
        [cleanName, dataUri]
      );
      count++;
      console.log(`✓ Permanently Locked & Saved Video: [${cleanName}] (${buffer.length} bytes) to DB & Git!`);
    } catch(err) {
      console.error(`❌ Could not download video ${cleanName}:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 VIDEO SYNC COMPLETE: ${count} EXACT USER VIDEOS SAVED!`);
  console.log(`==================================================\n`);
  await connection.end();
}

syncUserUploadedVideos().catch(console.error);
