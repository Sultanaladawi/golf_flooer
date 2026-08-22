const fs = require('fs');
const path = require('path');

const PAYTABS_BACKEND_CODE = `
// ══════════════════════════════════════════════════════════════════════════════
// 👑 MEPS / PAYTABS JORDAN SECURE PAYMENT GATEWAY INTEGRATION
// ══════════════════════════════════════════════════════════════════════════════
const PAYTABS_CONFIG = {
  profileId: process.env.PAYTABS_PROFILE_ID || 183995,
  serverKey: process.env.PAYTABS_SERVER_KEY || 'STJ9HNGJGR-J9LMM2HK9K-WKJRJDTHZK',
  clientKey: process.env.PAYTABS_CLIENT_KEY || 'CRK29D-BHBK6P-BNNMHK-QR6BQ6',
  hostname: 'secure-jordan.paytabs.com'
};

function queryDbAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params || [], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function sendPaytabsRequest(apiPath, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = require('https').request({
      hostname: PAYTABS_CONFIG.hostname,
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'authorization': PAYTABS_CONFIG.serverKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('انتهت مهلة الاتصال ببوابة الدفع'));
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

app.post('/api/paytabs/create-payment', async (req, res) => {
  const { customer_name, email, phone, country, city, delivery_address, items, total_amount, shipping_fee } = req.body;
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'يرجى استكمال بيانات الطلب والمنتجات' });
  }

  try {
    const grandTotal = parseFloat(total_amount || 0).toFixed(2);
    
    // Save order in orders table
    const fullAddress = \`الدولة: \${country || 'الأردن'} - المدينة: \${city || 'عمان'} - \${delivery_address || ''} | PayTabs MEPS\`;
    const orderResult = await queryDbAsync(
      'INSERT INTO orders (customer_name, email, total_amount, status, created_at, order_type, delivery_address, phone, payment_status) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)',
      [
        customer_name,
        email || 'customer@zahratbeesan.com',
        grandTotal,
        'pending_payment',
        'delivery',
        fullAddress,
        phone || '',
        'pending'
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const pid = parseInt(item.id || item.productId, 10);
      const qty = parseFloat(item.qty || 1);
      const price = parseFloat(item.priceNum || item.price || 0);
      try {
        await queryDbAsync(
          'INSERT INTO order_items (order_id, product_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, isNaN(pid) ? null : pid, item.name || 'عباية ملكية', qty, price]
        );
      } catch (_) {}
    }

    const host = req.get('host') || 'zahratbeesan.com';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const returnUrl = isLocal 
      ? \`http://localhost:3000/checkout?paytabs_order_id=\${orderId}\`
      : \`\${protocol}://\${host}/checkout?paytabs_order_id=\${orderId}\`;

    const paytabsPayload = {
      profile_id: PAYTABS_CONFIG.profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: String(orderId),
      cart_description: \`طلب #ORD-\${orderId} من بوتيك زهرة بيسان\`,
      cart_currency: 'JOD',
      cart_amount: parseFloat(grandTotal),
      callback: 'https://zahratbeesan.com/api/paytabs/callback',
      return: returnUrl,
      customer_details: {
        name: customer_name,
        email: email || 'customer@zahratbeesan.com',
        phone: phone || '+962796697413',
        street1: delivery_address || 'Amman',
        city: city || 'Amman',
        state: 'Amman',
        country: 'JO',
        zip: '11947',
        ip: req.ip || '127.0.0.1'
      }
    };

    const ptData = await sendPaytabsRequest('/payment/request', paytabsPayload);

    if (ptData.redirect_url) {
      try {
        await queryDbAsync('UPDATE orders SET stripe_session_id = ? WHERE id = ?', [ptData.tran_ref || '', orderId]);
      } catch (_) {}

      return res.json({
        success: true,
        orderId,
        redirect_url: ptData.redirect_url,
        tran_ref: ptData.tran_ref
      });
    } else {
      console.error('[PayTabs Request Error]:', ptData);
      return res.status(400).json({ error: ptData.message || 'تعذر بدء جلسة الدفع عبر MEPS' });
    }

  } catch (err) {
    console.error('[PayTabs Init Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Verify PayTabs transaction status
app.get('/api/paytabs/verify/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const rows = await queryDbAsync('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.status === 'preparing' || order.status === 'completed' || order.payment_status === 'paid') {
      return res.json({ success: true, status: 'paid', order });
    }

    const tranRef = order.stripe_session_id;
    if (!tranRef) {
      return res.json({ success: false, status: order.status, order });
    }

    const ptData = await sendPaytabsRequest('/payment/query', {
      profile_id: PAYTABS_CONFIG.profileId,
      tran_ref: tranRef
    });

    const isApproved = ptData.payment_result && (ptData.payment_result.response_status === 'A' || ptData.payment_result.response_status === '100');

    if (isApproved) {
      await queryDbAsync("UPDATE orders SET status = 'preparing', payment_status = 'paid' WHERE id = ?", [orderId]);
      
      let cartItems = [];
      try {
        cartItems = await queryDbAsync('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      } catch (_) {}

      if (order.email && order.email.includes('@')) {
        sendCustomerOrderConfirmation({
          orderId: order.id,
          customerName: order.customer_name,
          email: order.email,
          phone: order.phone,
          deliveryAddress: order.delivery_address,
          totalAmount: order.total_amount,
          cartItems
        });
      }
      if (order.phone) {
        sendCustomerOrderWhatsApp({
          orderId: order.id,
          customerName: order.customer_name,
          phone: order.phone,
          totalAmount: order.total_amount,
          cartItems
        });
      }

      sendStoreNotificationEmail({
        subject: \`💳 [دفع إلكتروني ناجح PayTabs/MEPS #\${order.id}] بقيمة \${order.total_amount} JOD\`,
        title: 'تم استلام دفعة بنكية إلكترونية مؤكدة عبر MEPS / PayTabs!',
        senderName: order.customer_name,
        senderEmail: order.email,
        senderPhone: order.phone,
        content: \`رقم الطلب: #ORD-\${order.id}\\nالعميل: \${order.customer_name}\\nالهاتف: \${order.phone}\\nالمبلغ المدفوع: \${order.total_amount} JOD\\nالمرجع البنكي: \${tranRef}\`
      });

      return res.json({ success: true, status: 'paid', order });
    } else {
      return res.json({ success: false, status: 'pending', ptData });
    }
  } catch (err) {
    console.error('[PayTabs Verify Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});
`;

const files = ['main_server.js', 'server.js', 'app.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const startMarker = '// 👑 MEPS / PAYTABS JORDAN SECURE PAYMENT GATEWAY INTEGRATION';
  const endMarker = 'async function sendCustomerOrderWhatsApp';
  
  if (content.includes(startMarker)) {
    const p1 = content.indexOf(startMarker);
    const p2 = content.indexOf(endMarker);
    if (p1 !== -1 && p2 !== -1) {
      content = content.slice(0, p1) + content.slice(p2);
    }
  }

  if (content.includes(endMarker)) {
    content = content.replace(endMarker, PAYTABS_BACKEND_CODE + '\n' + endMarker);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Updated PayTabs callback & return URLs in:', file);
  }
});
