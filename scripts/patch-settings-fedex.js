const fs = require('fs');
const path = require('path');

const targetFiles = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

for (const f of targetFiles) {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace fedexService.createFedExShipment with runDirectFedExShipment
  if (content.includes("const fedexService = require('./server/fedexService');")) {
    content = content.replace("const fedexService = require('./server/fedexService');\n      const result = await fedexService.createFedExShipment({", "const result = await runDirectFedExShipment(order.id, order.customer_name, order.phone, order.email, order.delivery_address, order.total_amount); //");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched settings handler in ${f}`);
  }
}
