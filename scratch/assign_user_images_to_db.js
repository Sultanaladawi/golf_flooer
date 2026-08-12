const mysql = require('mysql2/promise');

async function assignUserImages() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const productMapping = [
    { id: 1, img: 'media_1786393087470.jpg', images: ['media_1786393087470.jpg', 'whatsapp_image_kaftan.jpeg'] },
    { id: 2, img: 'media_1786393173054.jpg', images: ['media_1786393173054.jpg', '15 (1).jpg'] },
    { id: 3, img: 'media_1786392959962.jpg', images: ['media_1786392959962.jpg', '16.jpg'] },
    { id: 4, img: 'media_1786392644940.jpg', images: ['media_1786392644940.jpg', '15 (2).jpg'] },
    { id: 5, img: 'media_1786354787427.jpg', images: ['media_1786354787427.jpg', '15 (3).jpg'] },
    { id: 6, img: 'media_1786393087470.jpg', images: ['media_1786393087470.jpg'] },
    { id: 7, img: 'media_1786392959962.jpg', images: ['media_1786392959962.jpg'] }
  ];

  for (const item of productMapping) {
    const imagesJson = JSON.stringify(item.images);
    await connection.query(
      'UPDATE menu_items SET image_url = ?, images = ? WHERE id = ?',
      [item.img, imagesJson, item.id]
    );
    console.log(`Product ID ${item.id} updated with exact uploaded image -> ${item.img}`);
  }

  console.log('--- DB UPDATED WITH EXACT USER-UPLOADED IMAGES ---');
  await connection.end();
}

assignUserImages().catch(console.error);
