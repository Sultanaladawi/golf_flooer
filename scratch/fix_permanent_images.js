const mysql = require('mysql2/promise');

async function fixPermanentImages() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const imageMap = [
    { id: 1, img: 'whatsapp_image_kaftan.jpeg', images: ['whatsapp_image_kaftan.jpeg', '15.jpg'] },
    { id: 2, img: '15 (1).jpg', images: ['15 (1).jpg', '15 (2).jpg'] },
    { id: 3, img: '16.jpg', images: ['16.jpg', '15 (3).jpg'] },
    { id: 4, img: '15 (2).jpg', images: ['15 (2).jpg', '15 (4).jpg'] },
    { id: 5, img: '15 (3).jpg', images: ['15 (3).jpg', '15 (5).jpg'] },
    { id: 6, img: '13.png', images: ['13.png', '13 (1).png'] },
    { id: 7, img: '8.png', images: ['8.png', '8 (1).png'] },
    { id: 8, img: '13 (1).png', images: ['13 (1).png', '13 (2).png'] },
    { id: 16, img: '9 (1).png', images: ['9 (1).png', '9 (2).png'] }
  ];

  for (const item of imageMap) {
    const imagesJson = JSON.stringify(item.images);
    await connection.query(
      'UPDATE menu_items SET image_url = ?, images = ? WHERE id = ?',
      [item.img, imagesJson, item.id]
    );
    console.log(`Updated Product ID ${item.id} -> ${item.img}`);
  }

  console.log('--- ALL PRODUCTS UPDATED WITH PERMANENT GIT-TRACKED IMAGES ---');
  await connection.end();
}

fixPermanentImages().catch(console.error);
