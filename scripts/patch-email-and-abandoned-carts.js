const fs = require('fs');
const path = require('path');

const BACKEND_EMAIL_CODE = `
// ══════════════════════════════════════════════════════════════════════════════
// 📧 DEDICATED CUSTOMER ORDER CONFIRMATION & ABANDONED CART ENGINE
// ══════════════════════════════════════════════════════════════════════════════

// API to trigger direct customer confirmation email
app.post('/api/send-order-confirmation', async (req, res) => {
  const { orderId, customerName, email, phone, deliveryAddress, totalAmount, items } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    await sendCustomerOrderConfirmation({
      orderId: orderId || 'جديد',
      customerName: customerName || 'عميلة زهرة بيسان',
      email: email.trim(),
      phone: phone || '',
      deliveryAddress: deliveryAddress || '',
      totalAmount: totalAmount || 0,
      cartItems: items || []
    });

    res.json({ success: true, message: 'Customer confirmation email dispatched successfully' });
  } catch (err) {
    console.error('[Send Confirmation Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark abandoned cart as recovered upon successful purchase
app.post('/api/cart/recovered', (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.json({ success: false });
  db.query("UPDATE abandoned_carts SET status = 'recovered' WHERE (email = ? OR phone = ?) AND status != 'recovered'", [email || '', phone || ''], (err) => {
    if (err) console.error('[Abandoned Cart Recovered Error]:', err);
    res.json({ success: true });
  });
});
`;

const files = ['main_server.js', 'server.js', 'app.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add sendCustomerOrderConfirmation call inside /api/orders
  const orderTarget = 'sendStoreNotificationEmail({';
  const customerEmailCall = `
    // 👑 Send instant confirmation email directly to the customer
    if (email && email.includes('@')) {
      try {
        sendCustomerOrderConfirmation({
          orderId,
          customerName: customer_name,
          email: email.trim(),
          phone: phone || '',
          deliveryAddress: delivery_address || '',
          totalAmount,
          cartItems
        });
      } catch (custEmailErr) {
        console.error('[Customer Email Dispatch Error]:', custEmailErr.message);
      }
    }
`;

  if (content.includes(orderTarget) && !content.includes('// 👑 Send instant confirmation email directly to the customer')) {
    content = content.replace(orderTarget, customerEmailCall + '\n    ' + orderTarget);
    console.log('✅ Added customer email dispatch into /api/orders in:', file);
  }

  // 2. Fix cron job & abandoned cart reminder to use SMTP_USER properly
  content = content.replace(/process\.env\.SMTP_USER\s*\|\s*""/g, 'SMTP_USER');
  content = content.replace(/if \(!process\.env\.SMTP_USER\) break;/g, '// process.env.SMTP_USER check replaced');
  content = content.replace(/if \(!process\.env\.SMTP_USER\) return res\.status\(500\)/g, '// process.env.SMTP_USER check bypassed');
  content = content.replace(/<(\${process\.env\.SMTP_USER})>/g, '<${SMTP_USER}>');

  // 3. Add the dedicated endpoints
  if (!content.includes('// API to trigger direct customer confirmation email')) {
    const attachPoint = 'app.post("/api/cart/abandoned"';
    if (content.includes(attachPoint)) {
      content = content.replace(attachPoint, BACKEND_EMAIL_CODE + '\n' + attachPoint);
      console.log('✅ Added /api/send-order-confirmation and /api/cart/recovered in:', file);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('🎉 Email & Abandoned Cart Patch completed successfully!');
