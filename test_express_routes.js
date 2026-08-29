const express = require('express');
const mysql = require('mysql2');

const app = express();
const pool = mysql.createPool({
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  user: '3Tzv3f22f9k6ymW.root',
  password: 'tO1bLyzwJ2h3lHqS',
  database: 'test',
  port: 4000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
});

const db = pool;

app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) {
      console.error('/api/categories error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('/api/categories success:', results.length);
    res.json(results);
  });
});

app.get("/api/store-status", (req, res) => {
  db.query("SELECT value FROM site_settings WHERE `key` = ? LIMIT 1", ["store_status"], (err, results) => {
    if (err) {
      console.error('/api/store-status error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('/api/store-status success:', results);
    res.json(results);
  });
});

app.listen(5002, () => {
  console.log('Test server on 5002');
  const http = require('http');
  http.get('http://localhost:5002/api/categories', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Response categories:', res.statusCode, d));
  });
  http.get('http://localhost:5002/api/store-status', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('Response store-status:', res.statusCode, d));
  });
});
