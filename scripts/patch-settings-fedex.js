const fs = require('fs');
const path = require('path');

const targetFiles = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

const fedexBlock = `
    if (req.body && req.body.action === 'create_fedex_shipment') {
      const { orderId } = req.body;
      const [rows] = await promiseDb.query("SELECT * FROM orders WHERE id = ?", [orderId]);
      if (!rows || rows.length === 0) return res.status(404).json({ error: "Order not found" });
      const order = rows[0];
      const fedexService = require('./server/fedexService');
      const result = await fedexService.createFedExShipment({
        orderId: order.id,
        customerName: order.customer_name,
        phone: order.phone,
        email: order.email,
        address: order.delivery_address,
        orderTotalJOD: order.total_amount
      });
      await promiseDb.query("UPDATE orders SET fedex_tracking_number = ?, fedex_label_url = ?, fedex_service_type = ?, fedex_status = 'shipped', status = 'ready' WHERE id = ?", [result.trackingNumber, result.labelUrl, result.serviceType, order.id]);
      return res.json({ success: true, trackingNumber: result.trackingNumber, labelUrl: result.labelUrl, serviceType: result.serviceType });
    }
`;

for (const f of targetFiles) {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("req.body.action === 'create_fedex_shipment'")) {
    console.log(`✓ Already patched in ${f}`);
    continue;
  }
  
  const regex = /app\.post\(["']\/api\/settings["'],\s*async\s*\(req,\s*res\)\s*=>\s*\{\s*try\s*\{\s*const\s+promiseDb\s*=\s*db\.promise\(\);/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match) => `${match}\n${fedexBlock}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Regex patched /api/settings in ${f}`);
  } else {
    console.log(`⚠️ Regex not matched in ${f}`);
  }
}
