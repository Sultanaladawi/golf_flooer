const fs = require('fs');
const path = require('path');

const fedexCode = `
// ══════════════════════════════════════════════════════════════════════════════
// 📦 FedEx Official Integration APIs (Direct Core Routes)
// ══════════════════════════════════════════════════════════════════════════════
const fedexService = require("./server/fedexService");

// 1. Get Live FedEx Rates
app.get("/api/fedex/rates", async (req, res) => {
  try {
    const { countryCode, postalCode, city, weightKg, declaredValueJOD } = req.query;
    const rates = await fedexService.getFedExRates({
      destCountryCode: countryCode || 'SA',
      destPostalCode: postalCode || '12211',
      destCity: city || 'Riyadh',
      weightKg: parseFloat(weightKg) || 1.5,
      declaredValueJOD: parseFloat(declaredValueJOD) || 85
    });
    res.json({ success: true, rates });
  } catch (err) {
    console.error("[FedEx Rates Error]:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. 1-Click Create Official FedEx Air Waybill Shipment
const handleFedExShipmentCreation = async (req, res) => {
  try {
    const { orderId, serviceType, weightKg, itemDescription } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    db.query("SELECT * FROM orders WHERE id = ?", [orderId], async (err, rows) => {
      if (err || !rows || rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = rows[0];
      const address = order.delivery_address || 'Customer Address';
      
      let countryCode = 'SA';
      let city = 'Riyadh';
      let postalCode = '12211';

      if (address.includes('الأردن') || address.includes('Jordan') || address.includes('عمان') || address.includes('Amman')) {
        countryCode = 'JO';
        city = 'Amman';
        postalCode = '11181';
      } else if (address.includes('الإمارات') || address.includes('UAE') || address.includes('دبي') || address.includes('Dubai')) {
        countryCode = 'AE';
        city = 'Dubai';
        postalCode = '00000';
      } else if (address.includes('الكويت') || address.includes('Kuwait')) {
        countryCode = 'KW';
        city = 'Kuwait City';
        postalCode = '13001';
      } else if (address.includes('قطر') || address.includes('Qatar')) {
        countryCode = 'QA';
        city = 'Doha';
        postalCode = '00000';
      }

      try {
        const shipmentResult = await fedexService.createFedExShipment({
          orderId: order.id,
          customerName: order.customer_name || 'Valued Customer',
          phone: order.phone || '962796697413',
          email: order.email || 'customer@zahrat-beesan.com',
          address: address,
          city: city,
          postalCode: postalCode,
          countryCode: countryCode,
          serviceType: serviceType || 'FEDEX_INTERNATIONAL_PRIORITY',
          weightKg: parseFloat(weightKg) || 1.5,
          itemDescription: itemDescription || 'Luxury Traditional Kaftan / Abaya (Made in Jordan)',
          orderTotalJOD: parseFloat(order.total_amount) || 95
        });

        db.query(
          "UPDATE orders SET fedex_tracking_number = ?, fedex_label_url = ?, fedex_service_type = ?, fedex_status = 'shipped', status = 'ready' WHERE id = ?",
          [shipmentResult.trackingNumber, shipmentResult.labelUrl, shipmentResult.serviceType, order.id],
          (updateErr) => {
            if (updateErr) console.error("[FedEx DB Update Error]:", updateErr.message);
          }
        );

        if (req.logAdminAction) {
          req.logAdminAction("FedEx Shipment Created", \`Created FedEx Air Waybill #\${shipmentResult.trackingNumber} for Order #\${order.id}\`);
        }

        res.json({
          success: true,
          message: "FedEx Air Waybill Created Successfully!",
          trackingNumber: shipmentResult.trackingNumber,
          labelUrl: shipmentResult.labelUrl,
          serviceType: shipmentResult.serviceType,
          serviceName: shipmentResult.serviceName
        });
      } catch (shipErr) {
        console.error("[FedEx Ship Error]:", shipErr.message);
        res.status(500).json({ error: shipErr.message });
      }
    });
  } catch (err) {
    console.error("[FedEx Create Shipment Error]:", err.message);
    res.status(500).json({ error: err.message });
  }
};

app.post("/api/fedex/create-shipment", handleFedExShipmentCreation);
app.post("/api/fedex-ship", handleFedExShipmentCreation);

// 3. View / Print Official FedEx Shipping Label PDF
app.get("/api/fedex/label/:orderId", (req, res) => {
  const { orderId } = req.params;
  const labelPath = path.join(__dirname, "data", "labels", \`fedex-label-\${orderId}.pdf\`);
  
  if (fs.existsSync(labelPath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", \`inline; filename="FedEx-Label-Order-\${orderId}.pdf"\`);
    fs.createReadStream(labelPath).pipe(res);
  } else {
    res.status(404).json({ error: "FedEx Shipping Label not found for this order" });
  }
});

// 4. Live FedEx Tracking Info
app.get("/api/fedex/track/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const trackingInfo = await fedexService.trackFedExShipment(trackingNumber);
    res.json({ success: true, trackingInfo });
  } catch (err) {
    console.error("[FedEx Tracking Error]:", err.message);
    res.status(500).json({ error: err.message });
  }
});
`;

const targets = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

for (const t of targets) {
  const p = path.resolve(__dirname, '..', t);
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');

  // Remove any previous fedexCode if present
  const marker = '// 📦 FedEx Official Integration APIs';
  if (code.includes(marker)) {
    const parts = code.split(marker);
    // Find the end of previous block
    const rest = parts[1].split('app.get(/.*/');
    if (rest.length > 1) {
      code = parts[0] + 'app.get(/.*/' + rest[1];
    }
  }

  const anchor = 'app.post("/api/store-status", (req, res) => {';
  if (code.includes(anchor)) {
    code = code.replace(anchor, fedexCode + '\n' + anchor);
    fs.writeFileSync(p, code, 'utf8');
    console.log(`✅ Placed FedEx routes at core level in ${t}`);
  } else {
    console.log(`⚠️ Anchor not found in ${t}`);
  }
}
