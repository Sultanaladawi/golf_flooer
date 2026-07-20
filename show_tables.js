const mysql = require('mysql2/promise');
require('dotenv').config();

async function showTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'graduation_project',
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
  });

  const [rows] = await connection.query('SHOW TABLES');
  console.log(rows);
  await connection.end();
}
showTables();
