#!/usr/bin/env node
/**
 * Safe PayPal patch for main_server.js:
 * 1. Fixes /api/social-pixels 500 error (paypal_client_id column not in DB)
 * 2. Adds PayPal server-side create-order / capture-order endpoints
 *
 * Uses exact string matching with surrounding context to avoid corruption.
 */

const fs = require('fs');
const path = require('path');

const PAYPAL_SERVER_ROUTES = `
// ─── PayPal Server-side Integration (SDK v6+ compatible) ───────────────────
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { amount, description } = req.body;
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: "PayPal credentials missing" });
    const https = require("https");
    const authStr = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const getToken = () => new Promise((resolve, reject) => {
      const body = "grant_type=client_credentials";
      const r = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v1/oauth2/token", method: "POST",
        headers: { "Authorization": "Basic " + authStr, "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }
      }, res2 => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => resolve(JSON.parse(d))); });
      r.on("error", reject); r.write(body); r.end();
    });
    const { access_token } = await getToken();
    if (!access_token) return res.status(500).json({ error: "Failed to get PayPal token" });
    const orderBody = JSON.stringify({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "USD", value: String(amount) }, description: description || "Zahrat Beesan Order" }] });
    const order = await new Promise((resolve, reject) => {
      const r = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v2/checkout/orders", method: "POST",
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(orderBody) }
      }, res2 => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => resolve(JSON.parse(d))); });
      r.on("error", reject); r.write(orderBody); r.end();
    });
    res.json({ id: order.id });
  } catch (err) {
    console.error("[PayPal create-order]:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/paypal/capture-order/:orderID", async (req, res) => {
  try {
    const { orderID } = req.params;
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: "PayPal credentials missing" });
    const https = require("https");
    const authStr = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const getToken = () => new Promise((resolve, reject) => {
      const body = "grant_type=client_credentials";
      const r = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v1/oauth2/token", method: "POST",
        headers: { "Authorization": "Basic " + authStr, "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }
      }, res2 => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => resolve(JSON.parse(d))); });
      r.on("error", reject); r.write(body); r.end();
    });
    const { access_token } = await getToken();
    if (!access_token) return res.status(500).json({ error: "Failed to get PayPal token" });
    const capture = await new Promise((resolve, reject) => {
      const r = https.request({
        hostname: "api-m.paypal.com", port: 443, path: "/v2/checkout/orders/" + orderID + "/capture", method: "POST",
        headers: { "Authorization": "Bearer " + access_token, "Content-Type": "application/json", "Content-Length": 0 }
      }, res2 => { let d = ""; res2.on("data", c => d += c); res2.on("end", () => resolve(JSON.parse(d))); });
      r.on("error", reject); r.end();
    });
    res.json(capture);
  } catch (err) {
    console.error("[PayPal capture-order]:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// ────────────────────────────────────────────────────────────────────────────
`;

const files = ['main_server.js', 'app.js', 'server.js'];

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) { console.log(`Skipping ${file} (not found)`); continue; }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already patched
  if (content.includes('paypal/create-order')) {
    console.log(`✅ ${file} already patched.`);
    continue;
  }

  // Fix 1: Remove non-existent paypal_client_id column from social_pixels query
  const oldQuery = '"SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id, paypal_client_id FROM social_pixels WHERE id = 1 LIMIT 1"';
  const newQuery = '"SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id FROM social_pixels WHERE id = 1 LIMIT 1"';
  if (content.includes(oldQuery)) {
    content = content.replace(oldQuery, newQuery);
    console.log(`  ✓ ${file}: Fixed social-pixels query.`);
  }

  // Fix 2: Inject PayPal routes right before app.listen or before the catalog route (safe anchor)
  // Use the catalog route as anchor since it's far from any broken area
  const ANCHOR = 'app.get("/api/catalog.json",';
  if (!content.includes(ANCHOR)) {
    console.log(`  ❌ ${file}: Anchor not found - skipping PayPal route injection.`);
  } else {
    content = content.replace(ANCHOR, PAYPAL_SERVER_ROUTES + '\n' + ANCHOR);
    console.log(`  ✓ ${file}: PayPal server-side routes injected safely.`);
  }

  // Final syntax safety check
  try {
    require('vm').Script && new (require('vm').Script)(content, { filename: file });
  } catch (syntaxErr) {
    console.error(`  ❌ ${file}: SYNTAX ERROR detected after patch! Rolling back.`);
    console.error('  Error:', syntaxErr.message);
    continue; // Don't write broken file
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ ${file}: Patched and saved successfully.`);
}

console.log('\nDone!');
