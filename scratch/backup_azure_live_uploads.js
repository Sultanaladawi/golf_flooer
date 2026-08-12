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

async function backupLiveUploads() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const [products] = await connection.query('SELECT id, name, image_url, images FROM menu_items ORDER BY id ASC');
  console.log('--- STARTING LIVE BACKUP FOR ALL USER CHOSEN IMAGES ---');
  
  let backedUpCount = 0;

  for (const p of products) {
    let imgs = [];
    try {
      imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
      if (!Array.isArray(imgs)) imgs = [];
    } catch(e) { imgs = []; }

    const allProductImgs = [p.image_url, ...imgs].filter(Boolean);

    for (const imgName of allProductImgs) {
      const cleanName = imgName.replace(/^\/images\//, '').replace(/^\//, '').trim();
      if (!cleanName || cleanName === '12.png') continue;

      const imageUrl = `${azureBase}/images/${encodeURIComponent(cleanName)}`;
      try {
        console.log(`Fetching live image: ${cleanName}...`);
        const buffer = await fetchUrlBuffer(imageUrl);
        
        // Save locally to public/images so it's committed to Git
        const localGitPath = path.resolve(__dirname, '../public/images', cleanName);
        fs.writeFileSync(localGitPath, buffer);

        // Convert to data URI for permanent MySQL backup
        const ext = path.extname(cleanName).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

        await connection.query(
          'INSERT INTO product_image_store (filename, data_uri) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_uri = VALUES(data_uri)',
          [cleanName, dataUri]
        );
        backedUpCount++;
        console.log(`✓ Permanently Backed Up [${cleanName}] (${buffer.length} bytes) to MySQL DB & Git Repo.`);
      } catch (err) {
        console.error(`❌ Could not fetch ${cleanName} from Azure live:`, err.message);
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 BACKUP COMPLETE: ${backedUpCount} USER IMAGES PERMANENTLY SAVED!`);
  console.log(`==================================================\n`);
  await connection.end();
}

backupLiveUploads().catch(console.error);
