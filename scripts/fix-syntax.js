const fs = require('fs');
const path = require('path');

const targetFiles = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

const oldBlock = `      const result = await runDirectFedExShipment(order.id, order.customer_name, order.phone, order.email, order.delivery_address, order.total_amount); //
        orderId: order.id,
        customerName: order.customer_name,
        phone: order.phone,
        email: order.email,
        address: order.delivery_address,
        orderTotalJOD: order.total_amount
      });`;

const newBlock = `      const result = await runDirectFedExShipment(order.id, order.customer_name, order.phone, order.email, order.delivery_address, order.total_amount);`;

for (const f of targetFiles) {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed syntax in ${f}`);
  } else {
    // Try general regex
    const reg = /const\s+result\s*=\s*await\s+runDirectFedExShipment[\s\S]*?\}\);/g;
    if (reg.test(content)) {
      content = content.replace(reg, newBlock);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Regex fixed syntax in ${f}`);
    }
  }
}
