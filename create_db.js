const mysql = require('mysql2');
require('dotenv').config();

// Connect without specifying a database first
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false } // Needed for Azure
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server: ', err);
    process.exit(1);
  }
  
  console.log('Connected to MySQL server.');
  
  connection.query(`CREATE DATABASE IF NOT EXISTS \`golf_flooer\``, (err, results) => {
    if (err) {
      console.error('Error creating database: ', err);
    } else {
      console.log('Database golf_flooer created or already exists.');
    }
    
    connection.end();
  });
});
