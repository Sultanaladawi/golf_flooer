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
      description: \`طلب من متجر زهرة بيسان #\${orderId || 'New'} (\${orderItems?.length || 1} قطعة)\`,
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
      source: {
        id: "src_all"
      },
      redirect: {
        url: finalRedirectUrl
      }
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
          if (tapRes.statusCode >= 200 && tapRes.statusCode < 300 && json.transaction?.url) {
            console.log(\`[Tap Payments] Created charge \${json.id} successfully: \${json.transaction.url}\`);
            res.json({
              success: true,
              chargeId: json.id,
              redirectUrl: json.transaction.url
            });
          } else {
            console.error(\`[Tap Payments Error]:\`, json);
            res.status(tapRes.statusCode || 400).json({
              error: json.errors?.[0]?.description || json.message || "Failed to create Tap charge",
              details: json
            });
          }
        } catch(e) {
          res.status(500).json({ error: "Invalid response from Tap Payments" });
        }
      });
    });

    tapReq.on('error', (e) => {
      console.error(\`[Tap Payments Request Error]:\`, e.message);
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
      path: \`/v2/charges/\${id}\`,
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${TAP_SECRET_KEY}\`
      }
    }, (tapRes) => {
      let body = '';
      tapRes.on('data', chunk => body += chunk);
      tapRes.on('end', async () => {
        try {
          const json = JSON.parse(body);
          if (json.status === 'CAPTURED') {
            const orderId = json.metadata?.orderId;
            if (orderId) {
              try {
                db.query("UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = ?", [orderId]);
              } catch(e) {}
            }
            res.json({ success: true, status: 'CAPTURED', charge: json });
          } else {
            res.json({ success: false, status: json.status, message: json.response?.message || 'Payment not completed' });
          }
        } catch(e) {
          res.status(500).json({ error: "Invalid response from Tap verify" });
        }
      });
    });

    tapReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
    });

    tapReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

['main_server.js', 'server.js', 'app.js'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Remove old block if present
    const oldIdx = content.indexOf('// 💳 TAP PAYMENTS GATEWAY');
    if (oldIdx !== -1) {
      const nextBlock = content.indexOf('app.post("/api/store-status"', oldIdx);
      if (nextBlock !== -1) {
        content = content.slice(0, oldIdx) + content.slice(nextBlock);
      }
    }
    const target = 'app.get("/api/fedex/track/:trackingNumber"';
    if (content.includes(target)) {
      const idx = content.indexOf(target);
      const endOfBlock = content.indexOf('});', idx) + 3;
      content = content.slice(0, endOfBlock) + '\n\n' + tapCode + '\n\n' + content.slice(endOfBlock);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Successfully added Tap Payments to ${file}`);
    }
  }
});
