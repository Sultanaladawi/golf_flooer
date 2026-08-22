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
  endpoint: 'https://secure-jordan.paytabs.com'
};

app.post('/api/paytabs/create-payment', async (req, res) => {
  const { customer_name, email, phone, country, city, delivery_address, items, total_amount, shipping_fee } = req.body;
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check stock availability for all items before initiating payment
    for (const item of items) {
      const pid = item.productId || item.id;
      if (!pid) continue;
      const [rows] = await conn.query('SELECT name, stock_quantity, available FROM menu_items WHERE id = ? FOR UPDATE', [pid]);
      if (rows.length > 0) {
        const p = rows[0];
        if (p.available === 0) throw new Error(\`المنتج "\${p.name}" غير متوفر حالياً.\`);
        if (p.stock_quantity !== null && p.stock_quantity !== undefined && p.stock_quantity < (item.qty || 1)) {
          throw new Error(\`الكمية المتاحة من "\${p.name}" هي \${p.stock_quantity} فقط.\`);
        }
      }
    }

    const grandTotal = parseFloat(total_amount || 0).toFixed(2);
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6);

    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_name, email, phone, delivery_address, total_price, payment_method, status, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        customer_name,
        email || 'customer@zahratbeesan.com',
        phone || '',
        \`الدولة: \${country || 'الأردن'} - المدينة: \${city || 'عمان'} - \${delivery_address || ''} | PayTabs MEPS\`,
        grandTotal,
        'paytabs_card',
        'pending_payment',
        JSON.stringify(items)
      ]
    );

    const orderId = orderResult.insertId;

    // Deduct stock temporarily
    for (const item of items) {
      const pid = item.productId || item.id;
      if (pid) {
        await conn.query('UPDATE menu_items SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?', [item.qty || 1, pid]);
      }
    }

    await conn.commit();

    const host = req.get('host') || 'zahratbeesan.com';
    const protocol = req.protocol || 'https';
    const baseUrl = \`\${protocol}://\${host}\`;

    const paytabsPayload = {
      profile_id: PAYTABS_CONFIG.profileId,
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: String(orderId),
      cart_description: \`طلب #ORD-\${orderId} من بوتيك زهرة بيسان\`,
      cart_currency: 'JOD',
      cart_amount: parseFloat(grandTotal),
      callback: \`\${baseUrl}/api/paytabs/callback\`,
      return: \`\${baseUrl}/checkout?paytabs_order_id=\${orderId}\`,
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

    const ptRes = await fetch(\`\${PAYTABS_CONFIG.endpoint}/payment/request\`, {
      method: 'POST',
      headers: {
        'authorization': PAYTABS_CONFIG.serverKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(paytabsPayload)
    });

    const ptData = await ptRes.json();

    if (ptData.redirect_url) {
      // Save tran_ref on order
      await db.promise().query('UPDATE orders SET paypal_order_id = ? WHERE id = ?', [ptData.tran_ref || '', orderId]);
      return res.json({
        success: true,
        orderId,
        redirect_url: ptData.redirect_url,
        tran_ref: ptData.tran_ref
      });
    } else {
      console.error('[PayTabs Request Error]:', ptData);
      return res.status(400).json({ error: ptData.message || 'Failed to initialize PayTabs payment' });
    }

  } catch (err) {
    await conn.rollback();
    console.error('[PayTabs Init Error]:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Verify PayTabs transaction status
app.get('/api/paytabs/verify/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const [rows] = await db.promise().query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];

    if (order.status === 'processing' || order.status === 'completed' || order.status === 'paid') {
      return res.json({ success: true, status: 'paid', order });
    }

    const tranRef = order.paypal_order_id;
    if (!tranRef) {
      return res.json({ success: false, status: order.status, order });
    }

    const ptRes = await fetch(\`\${PAYTABS_CONFIG.endpoint}/payment/query\`, {
      method: 'POST',
      headers: {
        'authorization': PAYTABS_CONFIG.serverKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        profile_id: PAYTABS_CONFIG.profileId,
        tran_ref: tranRef
      })
    });

    const ptData = await ptRes.json();
    const isApproved = ptData.payment_result && (ptData.payment_result.response_status === 'A' || ptData.payment_result.response_status === '100');

    if (isApproved) {
      await db.promise().query("UPDATE orders SET status = 'processing', payment_method = 'paytabs_paid' WHERE id = ?", [orderId]);
      
      let cartItems = [];
      try { cartItems = JSON.parse(order.items_json); } catch (_) {}

      // Trigger automatic customer Email and WhatsApp notifications
      if (order.email && order.email.includes('@')) {
        sendCustomerOrderConfirmation({
          orderId: order.id,
          customerName: order.customer_name,
          email: order.email,
          phone: order.phone,
          deliveryAddress: order.delivery_address,
          totalAmount: order.total_price,
          cartItems
        });
      }
      if (order.phone) {
        sendCustomerOrderWhatsApp({
          orderId: order.id,
          customerName: order.customer_name,
          phone: order.phone,
          totalAmount: order.total_price,
          cartItems
        });
      }

      sendStoreNotificationEmail({
        subject: \`💳 [دفع إلكتروني ناجح PayTabs/MEPS #\${order.id}] بقيمة \${order.total_price} JOD\`,
        title: 'تم استلام دفعة بنكية إلكترونية مؤكدة عبر MEPS / PayTabs!',
        senderName: order.customer_name,
        senderEmail: order.email,
        senderPhone: order.phone,
        content: \`رقم الطلب: #ORD-\${order.id}\\nالعميل: \${order.customer_name}\\nالهاتف: \${order.phone}\\nالمبلغ المدفوع: \${order.total_price} JOD\\nالمرجع البنكي: \${tranRef}\`
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

  if (content.includes('/api/paytabs/create-payment')) {
    console.log('PayTabs routes already present in:', file);
    return;
  }

  const anchor = 'async function sendCustomerOrderWhatsApp';
  if (content.includes(anchor)) {
    content = content.replace(anchor, PAYTABS_BACKEND_CODE + '\n' + anchor);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Injected PayTabs Jordan / MEPS backend routes in:', file);
  }
});
