const mysql = require('mysql2/promise');

async function clearAllProductImages() {
  const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER || 'zahratbeesan',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
    database: process.env.DB_NAME || 'golf_flooer',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  // Ensure table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS product_image_store (
      filename  VARCHAR(255) PRIMARY KEY,
      data_uri  LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 1. Clear permanent image store table
  await connection.query('TRUNCATE TABLE product_image_store');
  console.log('[Clean] Cleared product_image_store table.');

  // 2. Reset image_url and images in menu_items table
  await connection.query("UPDATE menu_items SET image_url = NULL, images = '[]'");
  console.log('[Clean] Reset all product images in menu_items table.');

  console.log('--- ALL OLD PRODUCT IMAGES REMOVED. READY FOR FRESH USER UPLOADS ---');
  await connection.end();
}

clearAllProductImages().catch(console.error);
