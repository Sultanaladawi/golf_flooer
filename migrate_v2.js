const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log("Adding stock_quantity to menu_items...");
    await connection.query(`ALTER TABLE menu_items ADD COLUMN stock_quantity INT DEFAULT -1`);
    console.log("Success");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("stock_quantity already exists.");
    else console.error(e);
  }

  try {
    console.log("Creating promo_codes table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percentage INT NOT NULL DEFAULT 0,
        expires_at DATETIME DEFAULT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Success");
  } catch (e) {
    console.error(e);
  }

  await connection.end();
}
migrate();
