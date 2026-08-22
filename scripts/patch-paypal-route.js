#!/usr/bin/env node
// Patches main_server.js to:
// 1. Fix /api/social-pixels 500 error (remove non-existent paypal_client_id column)
// 2. Add /api/paypal/create-order and /api/paypal/capture-order server-side endpoints

const fs = require('fs');
const path = require('path');

const files = ['main_server.js', 'app.js', 'server.js'];

const OLD_SOCIAL_PIXELS = `app.get("/api/social-pixels", (req, res) => {
  db.query("SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id, paypal_client_id FROM social_pixels WHERE id = 1 LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.json({ meta_pixel_id: "", snap_pixel_id: "", tiktok_pixel_id: "" });
    res.json(results[0]);
  });
});`;

const NEW_SOCIAL_PIXELS = `app.get("/api/social-pixels", (req, res) => {
  db.query("SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id FROM social_pixels WHERE id = 1 LIMIT 1", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const row = (results && results.length > 0) ? results[0] : { meta_pixel_id: "", snap_pixel_id: "", tiktok_pixel_id: "" };
    row.paypal_client_id = process.env.REACT_APP_PAYPAL_CLIENT_ID || "";
    res.json(row);
  });
});

// PayPal Server-side Order Creation (SDK v6+ compatible)
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { amount, description } = req.body;
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: "PayPal credentials missing" });

    const https = require("https");
    const authStr = Buffer.from(clientId + ":" + clientSecret).toString("base64");

    const tokenData = await new Promise((resolve, reject) => {
      const body = "grant_type=client_credentials";
      const req2 = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v1/oauth2/token", method: "POST",
        headers: { "Authorization": "Basic " + authStr, "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }
      }, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(JSON.parse(d))); });
      req2.on("error", reject); req2.write(body); req2.end();
    });

    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(500).json({ error: "Failed to get PayPal access token" });

    const orderBody = JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: String(amount) }, description: description || "Zahrat Beesan Order" }]
    });

    const order = await new Promise((resolve, reject) => {
      const req3 = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v2/checkout/orders", method: "POST",
        headers: { "Authorization": "Bearer " + accessToken, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(orderBody) }
      }, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(JSON.parse(d))); });
      req3.on("error", reject); req3.write(orderBody); req3.end();
    });

    res.json({ id: order.id });
  } catch (err) {
    console.error("PayPal create-order error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PayPal Server-side Order Capture (SDK v6+ compatible)
app.post("/api/paypal/capture-order/:orderID", async (req, res) => {
  try {
    const { orderID } = req.params;
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: "PayPal credentials missing" });

    const https = require("https");
    const authStr = Buffer.from(clientId + ":" + clientSecret).toString("base64");

    const tokenData = await new Promise((resolve, reject) => {
      const body = "grant_type=client_credentials";
      const req2 = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v1/oauth2/token", method: "POST",
        headers: { "Authorization": "Basic " + authStr, "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }
      }, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(JSON.parse(d))); });
      req2.on("error", reject); req2.write(body); req2.end();
    });

    const accessToken = tokenData.access_token;
    if (!accessToken) return res.status(500).json({ error: "Failed to get PayPal access token" });

    const captureBody = "";
    const capture = await new Promise((resolve, reject) => {
      const req4 = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v2/checkout/orders/" + orderID + "/capture", method: "POST",
        headers: { "Authorization": "Bearer " + accessToken, "Content-Type": "application/json", "Content-Length": 0 }
      }, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(JSON.parse(d))); });
      req4.on("error", reject); req4.end();
    });

    res.json(capture);
  } catch (err) {
    console.error("PayPal capture-order error:", err.message);
    res.status(500).json({ error: err.message });
  }
});`;

let patchedCount = 0;
for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) { console.log(`Skipping ${file} (not found)`); continue; }
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('paypal/create-order')) {
    console.log(`✅ ${file} already patched, skipping.`);
    continue;
  }
  
  if (!content.includes(OLD_SOCIAL_PIXELS)) {
    console.log(`⚠️  ${file}: Old social-pixels pattern not found exactly. Trying partial match...`);
    // Try to fix just the query
    const oldQuery = `"SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id, paypal_client_id FROM social_pixels WHERE id = 1 LIMIT 1"`;
    const newQuery = `"SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id FROM social_pixels WHERE id = 1 LIMIT 1"`;
    if (content.includes(oldQuery)) {
      content = content.replace(oldQuery, newQuery);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file}: Fixed social-pixels query (partial patch).`);
      patchedCount++;
    } else {
      console.log(`❌ ${file}: Query pattern not found either. Check manually.`);
    }
    continue;
  }
  
  content = content.replace(OLD_SOCIAL_PIXELS, NEW_SOCIAL_PIXELS);
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${file}: Fully patched (social-pixels fix + PayPal server-side routes added).`);
  patchedCount++;
}

console.log(`\nDone! Patched ${patchedCount} file(s).`);
