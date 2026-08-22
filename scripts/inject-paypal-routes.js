#!/usr/bin/env node
// Adds PayPal server-side endpoints to main_server.js after the social-pixels route

const fs = require('fs');
const path = require('path');

const PAYPAL_ROUTES = `
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
});
`;

// Anchor: insert PAYPAL_ROUTES after the social-pixels GET route (after its closing });)
const ANCHOR = `app.get("/api/admin/social-pixels", (req, res) => {`;

const files = ['main_server.js', 'app.js', 'server.js'];
let patchedCount = 0;

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) { console.log(`Skipping ${file} (not found)`); continue; }

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('paypal/create-order')) {
    console.log(`✅ ${file} already has PayPal routes, skipping.`);
    continue;
  }
  if (!content.includes(ANCHOR)) {
    console.log(`❌ ${file}: Anchor not found. Skipping.`);
    continue;
  }

  content = content.replace(ANCHOR, PAYPAL_ROUTES + '\n' + ANCHOR);
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${file}: PayPal server-side routes injected.`);
  patchedCount++;
}

console.log(`\nDone! Patched ${patchedCount} file(s).`);
