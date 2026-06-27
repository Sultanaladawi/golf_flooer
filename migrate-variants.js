require('dotenv').config({ path: __dirname + '/.env.local' });
require('dotenv').config({ path: __dirname + '/.env' });

const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'golf_flooer',
  port: parseInt(process.env.DB_PORT || '3306')
};

console.log('Attempting DB connection with config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port
});

function runMigration(dbConnection) {
  const sql = `
    CREATE TABLE IF NOT EXISTS product_variants (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      product_id  INT NOT NULL,
      color_name  VARCHAR(200) NOT NULL,
      colors      LONGTEXT NOT NULL,
      images      LONGTEXT,
      video_url   VARCHAR(500) DEFAULT NULL,
      sizes       LONGTEXT,
      sort_order  INT DEFAULT 0,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  dbConnection.query(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('✅ product_variants table created successfully!');
    }
    dbConnection.end();
  });
}

const db = mysql.createConnection(config);
db.connect(err => {
  if (err) {
    console.warn(`Connection failed on port ${config.port}: ${err.message}. Trying port 3306 fallback...`);
    const fallbackConfig = { ...config, port: 3306 };
    const dbFallback = mysql.createConnection(fallbackConfig);
    dbFallback.connect(err2 => {
      if (err2) {
        console.error('Fallback also failed. Connection to DB failed:', err2.message);
        process.exit(1);
      }
      console.log('Connected to database on fallback port 3306.');
      runMigration(dbFallback);
    });
  } else {
    console.log(`Connected to database on port ${config.port}.`);
    runMigration(db);
  }
});

