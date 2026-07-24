const mysql = require('mysql2/promise');
require('dotenv').config();

async function createRecipesTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const query = `
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_item_id INT NOT NULL,
        inventory_id INT NOT NULL,
        quantity_required DECIMAL(10,2) DEFAULT 1,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(query);
    console.log('Recipes table created successfully!');
  } catch (err) {
    console.error('Error creating recipes table:', err);
  } finally {
    await pool.end();
  }
}

createRecipesTable();
