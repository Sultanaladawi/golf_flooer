const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

const tablesToImport = ['addons', 'tags', 'menu_item_addons', 'menu_item_tags'];

async function run() {
  const sqlPath = path.join(__dirname, 'graduation_project.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('graduation_project.sql not found at:', sqlPath);
    return;
  }

  console.log('Reading graduation_project.sql...');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Parse SQL statements
  // Split by semicolon, but be careful with multi-line statements.
  // A simple way is to match CREATE TABLE and INSERT INTO blocks.
  const statements = [];
  let currentStatement = '';
  
  const lines = sqlContent.split('\n');
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) {
      continue;
    }
    currentStatement += line + '\n';
    if (trimmed.endsWith(';')) {
      statements.push(currentStatement);
      currentStatement = '';
    }
  }
  if (currentStatement.trim()) {
    statements.push(currentStatement);
  }

  console.log(`Parsed ${statements.length} SQL statements.`);

  // Connect to MySQL
  const connection = await mysql.createConnection(config);
  console.log('Connected to database.');

  for (const table of tablesToImport) {
    console.log(`Checking if table '${table}' exists...`);
    const [exists] = await connection.query(`SHOW TABLES LIKE ?`, [table]);
    if (exists.length > 0) {
      console.log(`Table '${table}' already exists. Skipping.`);
      continue;
    }

    console.log(`Table '${table}' does not exist. Creating and importing data...`);

    // Find the CREATE TABLE statement for this table
    const createStmt = statements.find(s => s.toLowerCase().includes(`create table \`${table}\``));
    if (createStmt) {
      console.log(`Executing: CREATE TABLE \`${table}\``);
      // Clean query (replace current_timestamp() or other MariaDB syntax issues)
      const cleanCreate = createStmt
        .replace(/current_timestamp\(\)/gi, 'CURRENT_TIMESTAMP')
        .replace(/'0000-00-00 00:00:00'/g, 'CURRENT_TIMESTAMP');
      await connection.query(cleanCreate);
    } else {
      console.warn(`CREATE TABLE statement for '${table}' not found!`);
    }

    // Find and execute all INSERT INTO statements for this table
    const insertStmts = statements.filter(s => s.toLowerCase().includes(`insert into \`${table}\``));
    for (const insertStmt of insertStmts) {
      console.log(`Executing INSERT for \`${table}\` (${insertStmt.length} bytes)...`);
      await connection.query(insertStmt);
    }
  }

  console.log('Migration completed successfully.');
  await connection.end();
}

run().catch(console.error);
