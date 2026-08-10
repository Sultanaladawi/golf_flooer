const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zahrat_beesan'
    });

    const [rows] = await connection.query('SELECT id, name, price_num, image_url, images FROM menu_items LIMIT 20');
    console.log('--- PRODUCTS IN DB ---');
    rows.forEach(r => {
      console.log(`ID: ${r.id} | Name: ${r.name} | Price: ${r.price_num} | image_url: ${r.image_url} | images: ${r.images}`);
    });
    await connection.end();
  } catch (e) {
    console.error('DB Error:', e.message);
  }
}
check();
