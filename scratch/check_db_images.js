const mysql = require('mysql2/promise');

async function check() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const [rows] = await connection.query('SELECT id, name, image_url, images FROM menu_items ORDER BY id ASC');
  console.log('--- PRODUCTS IN MYSQL DB ---');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

check().catch(console.error);
