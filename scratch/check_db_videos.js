const mysql = require('mysql2/promise');

async function checkDbVideos() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const [products] = await connection.query('SELECT id, name, video_url FROM menu_items ORDER BY id ASC');
  console.log('--- PRODUCTS VIDEO_URL IN MYSQL DB ---');
  products.forEach(p => {
    console.log(`Product #${p.id} [${p.name}] -> video_url: "${p.video_url || ''}"`);
  });

  const [variants] = await connection.query('SELECT id, product_id, color_name, video_url FROM product_variants WHERE video_url IS NOT NULL AND video_url != ""');
  console.log('\n--- PRODUCT VARIANTS VIDEO_URL IN MYSQL DB ---');
  variants.forEach(v => {
    console.log(`Variant #${v.id} (Product #${v.product_id}) [${v.color_name}] -> video_url: "${v.video_url}"`);
  });

  await connection.end();
}

checkDbVideos().catch(console.error);
