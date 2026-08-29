const mysql = require('mysql2/promise');

async function waitAndConnect() {
  for (let i = 1; i <= 10; i++) {
    console.log(`Attempt ${i}/10 at ${new Date().toISOString()}...`);
    try {
      const conn = await mysql.createConnection({
        host: 'zahrat-beesan-db.mysql.database.azure.com',
        user: 'zahratbeesan',
        password: 'S2u0l0t0a8n0$',
        database: 'golf_flooer',
        port: 3306,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 15000
      });
      console.log('✅✅ CONNECTED! Starting export...');

      // Get all tables
      const [tables] = await conn.query("SHOW TABLES");
      const tableNames = tables.map(t => Object.values(t)[0]);
      console.log('Tables found:', tableNames.join(', '));

      // Export each table
      const fs = require('fs');
      let sql = `-- Azure Zahrat Beesan DB Export\n-- Date: ${new Date().toISOString()}\n\n`;

      for (const table of tableNames) {
        try {
          const [createResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
          const createSQL = createResult[0]['Create Table'];
          sql += `\nDROP TABLE IF EXISTS \`${table}\`;\n${createSQL};\n\n`;

          const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
          if (rows.length > 0) {
            const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
            const values = rows.map(row =>
              '(' + Object.values(row).map(v =>
                v === null ? 'NULL' : `'${String(v).replace(/'/g, "''").replace(/\n/g,'\\n')}'`
              ).join(', ') + ')'
            ).join(',\n');
            sql += `INSERT INTO \`${table}\` (${cols}) VALUES\n${values};\n\n`;
          }
          console.log(`  ✓ ${table}: ${rows.length} rows`);
        } catch(e) {
          console.log(`  ⚠ ${table}: ${e.message.slice(0,60)}`);
        }
      }

      fs.writeFileSync('azure_full_backup.sql', sql, 'utf8');
      console.log('\n🎉 BACKUP COMPLETE! File: azure_full_backup.sql');
      await conn.end();
      return;
    } catch(err) {
      console.log(`  ❌ ${err.code}: waiting 30s...`);
      await new Promise(r => setTimeout(r, 30000));
    }
  }
  console.log('❌ Could not connect after 10 attempts.');
}

waitAndConnect();
