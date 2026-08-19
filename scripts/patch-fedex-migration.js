const fs = require('fs');
const path = require('path');

const targets = ['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

const migrationCode = `
      // Ensure FedEx columns exist on orders table
      const fedexCols = [
        "ALTER TABLE orders ADD COLUMN fedex_tracking_number VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE orders ADD COLUMN fedex_label_url VARCHAR(500) DEFAULT NULL",
        "ALTER TABLE orders ADD COLUMN fedex_status VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE orders ADD COLUMN fedex_service_type VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE orders ADD COLUMN fedex_created_at TIMESTAMP NULL"
      ];
      for (const colQuery of fedexCols) {
        try { await promiseDb.query(colQuery); } catch (e) {}
      }
`;

for (const t of targets) {
  const p = path.resolve(__dirname, '..', t);
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');

  if (code.includes('fedex_tracking_number VARCHAR(100)')) {
    console.log(t + ' already has FedEx columns migration');
    continue;
  }

  const anchor = 'console.log("[Migration] Schema verification complete.");';
  if (code.includes(anchor)) {
    code = code.replace(anchor, migrationCode + '\n      ' + anchor);
    fs.writeFileSync(p, code, 'utf8');
    console.log('✅ Patched FedEx columns migration into ' + t);
  } else {
    console.log('⚠️ Anchor not found in ' + t);
  }
}
