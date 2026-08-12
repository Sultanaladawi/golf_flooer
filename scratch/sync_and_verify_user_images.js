const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function syncAndVerifyUserImages() {
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
  console.log('--- CURRENT PRODUCTS IN MYSQL DB AFTER USER SELECTION ---');
  
  let backedUpCount = 0;

  for (const p of products) {
    console.log(`Product #${p.id} [${p.name}] -> Main Image: ${p.image_url}`);
    
    let imgs = [];
    try {
      imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
      if (!Array.isArray(imgs)) imgs = [];
    } catch(e) { imgs = []; }

    const allProductImgs = [p.image_url, ...imgs].filter(Boolean);

    for (const imgName of allProductImgs) {
      const cleanName = imgName.replace(/^\/images\//, '').replace(/^\//, '').trim();
      if (!cleanName || cleanName === '12.png') continue;

      // Check if file exists on local disk or public/images
      const possiblePaths = [
        path.resolve(__dirname, '../public/images', cleanName),
        path.resolve(__dirname, '../data/public/images', cleanName)
      ];

      let foundPath = possiblePaths.find(pt => fs.existsSync(pt));

      if (foundPath) {
        try {
          const fileBuffer = fs.readFileSync(foundPath);
          const ext = path.extname(cleanName).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

          await connection.query(
            'INSERT INTO product_image_store (filename, data_uri) VALUES (?, ?) ON DUPLICATE KEY UPDATE data_uri = VALUES(data_uri)',
            [cleanName, dataUri]
          );
          backedUpCount++;
        } catch(e) {
          console.error(`Error backing up ${cleanName}:`, e.message);
        }
      }
    }
  }

  console.log(`--- SUCCESSFULLY SYNCED & PERMANENTLY BACKED UP ${backedUpCount} IMAGES TO MYSQL DB ---`);
  await connection.end();
}

syncAndVerifyUserImages().catch(console.error);
