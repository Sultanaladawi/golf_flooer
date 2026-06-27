const mysql = require('mysql');
require('dotenv').config({ path: __dirname + '/.env.local' });
require('dotenv').config({ path: __dirname + '/.env' });

let dbName = process.env.DB_NAME || 'golf_flooer';
if (process.env.DATABASE_URL) {
  const match = process.env.DATABASE_URL.match(/3307\/([^?]+)/);
  if (match) dbName = match[1];
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: dbName,
  port: process.env.DB_PORT || 3307,
});

const promiseDb = pool.promise ? pool.promise() : pool;

async function cleanDB() {
  try {
    console.log("Cleaning database...");

    await new Promise((resolve, reject) => {
      pool.query('DELETE FROM order_items', (err) => err ? reject(err) : resolve());
    });
    console.log("Deleted all order_items.");

    await new Promise((resolve, reject) => {
      pool.query('DELETE FROM orders', (err) => err ? reject(err) : resolve());
    });
    console.log("Deleted all orders.");

    await new Promise((resolve, reject) => {
      pool.query('DELETE FROM admin_logs', (err) => err ? reject(err) : resolve());
    });
    console.log("Deleted all admin_logs.");

    await new Promise((resolve, reject) => {
      pool.query('DELETE FROM contact_messages', (err) => err ? reject(err) : resolve());
    });
    console.log("Deleted all contact_messages.");

    try {
        await new Promise((resolve, reject) => {
          pool.query('DELETE FROM reviews', (err) => err ? reject(err) : resolve());
        });
        console.log("Deleted all reviews.");
    } catch (e) { }

    console.log("Test data cleanup complete!");
  } catch (err) {
    console.error("Cleanup Error:", err.message);
  } finally {
    pool.end();
  }
}

cleanDB();
