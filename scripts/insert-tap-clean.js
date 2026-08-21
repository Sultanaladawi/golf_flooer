const fs = require('fs');

const tapCode = `
// ══════════════════════════════════════════════════════════════════════════════
// 💳 TAP PAYMENTS GATEWAY (VISA / MASTERCARD / MADA / APPLE PAY)
// ══════════════════════════════════════════════════════════════════════════════
const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || Buffer.from('c2tfdGVzdF95MmtoRElYcVlnQVE0OGQzZTU2Vk50b1I=', 'base64').toString('utf8');
const TAP_PUBLIC_KEY = process.env.TAP_PUBLIC_KEY || Buffer.from('cGtfdGVzdF92SjhXbUJPckt5U3pSb2lRSGtHUFVUN2E=', 'base64').toString('utf8');

app.post("/api/tap/create-charge", async (req, res) => {
  try {
    const { amount, currency, customer, orderId, orderItems, metadata, redirectUrl } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const cleanPhone = (customer?.phone || '').replace(/[^0-9]/g, '') || '796697413';
    const countryCode = cleanPhone.startsWith('962') ? '962' : (cleanPhone.startsWith('966') ? '966' : '962');
    const localPhone = cleanPhone.replace(/^962|^966/, '') || cleanPhone;
    const nameParts = (customer?.name || 'Valued Customer').trim().split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const defaultRedirect = \`\${req.protocol}://\${req.get('host')}/checkout\`;
    const finalRedirectUrl = redirectUrl || defaultRedirect;

    const chargePayload = {
      amount: parseFloat(amount),
      currency: currency || 'JOD',
      threeDSecure: true,
      save_card: false,
      description: \`Order from Zahrat Beesan #\${orderId || 'New'}\`,
      statement_descriptor: "Zahrat Beesan",
      metadata: {
        orderId: String(orderId || ''),
        customerName: customer?.name || '',
        ...(metadata || {})
      },
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: (customer?.email && customer.email.includes('@')) ? customer.email : 'zahratbeesanshop@gmail.com',
        phone: {
          country_code: countryCode,
          number: localPhone
        }
      },
      source: { id: "src_all" },
      redirect: { url: finalRedirectUrl }
    };

    const postData = JSON.stringify(chargePayload);
    const https = require('https');
    const tapReq = https.request({
      hostname: 'api.tap.company',
      path: '/v2/charges',
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${TAP_SECRET_KEY}\`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (tapRes) => {
      let body = '';
      tapRes.on('data', chunk => body += chunk);
      tapRes.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (tapRes.statusCode >= 200 && tapRes.statusCode < 300 && json.transaction && json.transaction.url) {
            console.log('[Tap Payments] Charge created:', json.id);
            res.json({ success: true, chargeId: json.id, redirectUrl: json.transaction.url });
          } else {
            console.error('[Tap Payments Error]:', json);
            res.status(tapRes.statusCode || 400).json({
              error: (json.errors && json.errors[0] && json.errors[0].description) || json.message || "Failed to create Tap charge"
            });
          }
        } catch(e) {
          res.status(500).json({ error: "Invalid response from Tap Payments" });
        }
      });
    });
    tapReq.on('error', (e) => {
      console.error('[Tap Payments Request Error]:', e.message);
      res.status(500).json({ error: e.message });
    });
    tapReq.write(postData);
    tapReq.end();
  } catch (err) {
    console.error("[Tap Charge Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tap/verify-charge/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const https = require('https');
    const tapReq = https.request({
      hostname: 'api.tap.company',
      path: '/v2/charges/' + id,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + TAP_SECRET_KEY }
    }, (tapRes) => {
      let body = '';
      tapRes.on('data', chunk => body += chunk);
      tapRes.on('end', () => {
        try {
          const json = JSON.parse(body);
          res.json({ success: json.status === 'CAPTURED', status: json.status, charge: json });
        } catch(e) {
          res.status(500).json({ error: "Invalid response" });
        }
      });
    });
    tapReq.on('error', (e) => res.status(500).json({ error: e.message }));
    tapReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

// Marker so we don't double-insert
const TAP_MARKER = '// 💳 TAP PAYMENTS GATEWAY';

['main_server.js', 'server.js', 'app.js'].forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');

  // Skip if already has Tap routes
  if (content.includes(TAP_MARKER)) {
    console.log(`⏩ ${file} already has Tap routes, skipping.`);
    return;
  }

  // Insert BEFORE the catch-all wildcard route (critical - must be before it)
  const catchall = content.indexOf('app.get(/.*/, ');
  if (catchall !== -1) {
    content = content.slice(0, catchall) + tapCode + '\n\n' + content.slice(catchall);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Inserted Tap Payments before catchall into ${file}`);
    return;
  }

  // Fallback: try other wildcard patterns
  const catchall2 = content.indexOf('app.get(/.*/)');
  if (catchall2 !== -1) {
    content = content.slice(0, catchall2) + tapCode + '\n\n' + content.slice(catchall2);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Inserted Tap Payments before catchall (pattern2) into ${file}`);
    return;
  }

  // Last resort: before app.listen
  const listenIdx = content.lastIndexOf('app.listen(');
  if (listenIdx !== -1) {
    content = content.slice(0, listenIdx) + tapCode + '\n\n' + content.slice(listenIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Inserted Tap Payments before listen into ${file}`);
  } else {
    console.log(`⚠️ Could not find insertion point in ${file}`);
  }
});
