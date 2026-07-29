const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
const config = {
  host: dbHost,
  user: process.env.DB_USER || 'zahratbeesan',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
  database: process.env.DB_NAME || 'golf_flooer',
  port: process.env.DB_PORT || 3306,
  ssl: (dbHost !== 'localhost' && dbHost !== '127.0.0.1') ? { rejectUnauthorized: false } : false
};

async function test() {
  const conn = await mysql.createConnection(config);
  const [tables] = await conn.query('SHOW TABLES');
  for (const tRow of tables) {
    const tableName = Object.values(tRow)[0];
    const [countRes] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
    console.log(`${tableName}: ${countRes[0].cnt} rows`);
  }
  await conn.end();
}

test().catch(console.error);
