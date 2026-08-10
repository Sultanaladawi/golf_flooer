const mysql = require('mysql2/promise');
require('dotenv').config();

async function list() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zahrat_beesan'
    });

    const [products] = await conn.query('SELECT id, name, price_num, image_url, images FROM menu_items ORDER BY id ASC');
    console.log(JSON.stringify(products, null, 2));
    await conn.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
}
list();
