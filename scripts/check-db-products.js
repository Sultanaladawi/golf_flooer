const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'zahrat-beesan-db.mysql.database.azure.com',
    user: 'zahratbeesan',
    password: 'S2u0l0t0a8n0$',
    database: 'golf_flooer',
    port: 3306,
    ssl: { rejectUnauthorized: false }
  });
  
  const [rows] = await conn.query('SELECT * FROM menu_items');
  console.log('--- ALL MENU_ITEMS (' + rows.length + ') ---');
  rows.forEach(r => {
    console.log(r.id, '|', r.name, '| images:', r.images, '| image_url:', r.image_url);
  });

  await conn.end();
}

main().catch(console.error);
