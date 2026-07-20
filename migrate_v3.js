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
    console.log('Adding display_order to menu_items...');
    await connection.query(`
      ALTER TABLE menu_items 
      ADD COLUMN display_order INT DEFAULT 0
    `);
    console.log('Success');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('display_order column already exists. Skipping...');
    } else {
      console.error('Migration Error:', err);
    }
  }

  // Set default display_order = id to preserve current order
  await connection.query('UPDATE menu_items SET display_order = id WHERE display_order = 0');
  
  await connection.end();
}

migrate();
