const fs = require('fs');
const path = require('path');

const CUSTOMER_NOTIFICATIONS_CODE = `
async function sendCustomerOrderWhatsApp({ orderId, customerName, phone, totalAmount, cartItems }) {
  if (!phone) return;
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query("SELECT \`key\`, \`value\` FROM site_settings WHERE \`key\` IN ('wa_phone_number_id', 'wa_access_token')");
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    
    const waPhoneId = settings.wa_phone_number_id || process.env.WA_PHONE_NUMBER_ID;
    const waToken = settings.wa_access_token || process.env.WA_ACCESS_TOKEN;

    if (!waPhoneId || !waToken) {
      console.log('[WhatsApp Notice] WhatsApp Cloud API credentials not configured yet in /admin/settings.');
      return;
    }

    let cleanPhone = phone.replace(/\\D/g, '');
    if (cleanPhone.startsWith('07') && cleanPhone.length === 10) cleanPhone = '962' + cleanPhone.substring(1);
    if (cleanPhone.startsWith('05') && cleanPhone.length === 10) cleanPhone = '966' + cleanPhone.substring(1);

    const itemsSummary = Array.isArray(cartItems) ? cartItems.map(i => \`• \${i.name} (x\${i.qty})\`).join('\\n') : '';
    const messageBody = \`مرحباً \${customerName || 'عزيزتنا'} 🌸\\n\\nتم تأكيد طلبكِ بنجاح من *بوتيك زهرة بيسان الفاخر* 👑\\n\\n📌 *رقم الطلب:* #ORD-\${String(orderId).padStart(3, '0')}\\n💰 *المجموع:* \${parseFloat(totalAmount).toFixed(2)} JOD\\n\\n🛍️ *القطع المطلوبة:*\\n\${itemsSummary}\\n\\n🚚 جاري الآن تجهيز وتغليف طلبكِ بكل عناية.\\nلأي استفسار، يسعدنا تواصلكِ معنا على نفس هذا الرقم!\`;

    const waRes = await fetch(\`https://graph.facebook.com/v19.0/\${waPhoneId}/messages\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${waToken}\` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: messageBody }
      })
    });
    const waData = await waRes.json();
    if (waData.messages) {
      console.log(\`[WhatsApp Success] Automated order message sent to \${cleanPhone} for Order #\${orderId}\`);
    } else {
      console.error('[WhatsApp API Error]:', waData.error || waData);
    }
  } catch (err) {
    console.error('[WhatsApp Order Error]:', err.message);
  }
}

async function sendCustomerOrderConfirmation({ orderId, customerName, email, phone, deliveryAddress, totalAmount, cartItems }) {
  if (!email || !email.includes("@")) return;
  try {
    const itemsHtml = Array.isArray(cartItems) ? cartItems.map(item => \`
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #2c2523;">\${item.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #666;">\${item.qty || 1}</td>
        <td style="padding: 12px 8px; text-align: left; font-weight: bold; color: #a47c4f;">\${parseFloat(item.priceNum || item.price || 0).toFixed(2)} JOD</td>
      </tr>
    \`).join('') : '';

    await transporter.sendMail({
      from: \`"بوتيك زهرة بيسان الفاخر" <\${SMTP_USER}>\`,
      to: email.trim(),
      subject: \`✨ تم تأكيد طلبكِ بنجاح #\${orderId} — زهرة بيسان | Zahrat Beesan\`,
      html: \`
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; background-color: #fbf9f6; padding: 30px 15px; margin: 0;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e8e2d4;">
            
            <!-- Header Banner -->
            <div style="background: linear-gradient(135deg, #2c2523 0%, #1a1615 100%); padding: 35px 25px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 26px; letter-spacing: 2px; color: #d4af37;">ZAHRAT BEESAN</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #c5a880; letter-spacing: 1px;">بوتيك العبايات والفساتين الملكية الفاخرة</p>
            </div>

            <!-- Content Body -->
            <div style="padding: 30px 25px;">
              <h2 style="color: #2c2523; font-size: 20px; margin-top: 0;">مرحباً \${customerName || 'عزيزتنا'} 👋</h2>
              <p style="color: #555; line-height: 1.8; font-size: 15px;">
                يسعدنا إبلاغكِ بأنه <strong>تم تأكيد طلبكِ بنجاح</strong> وجاري الآن تجهيزه وتغليفه بكل حب وعناية ليكون بين يديكِ في أقرب وقت.
              </p>

              <!-- Order Badge -->
              <div style="background: #fdfaf6; border: 1.5px dashed #c5a880; border-radius: 12px; padding: 15px 20px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #666;">رقم الطلب:</span>
                  <strong style="font-size: 18px; color: #a47c4f; letter-spacing: 1px;">#ORD-\${String(orderId).padStart(3, '0')}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; color: #666;">المجموع الكلي:</span>
                  <strong style="font-size: 18px; color: #10b981;">\${parseFloat(totalAmount).toFixed(2)} JOD</strong>
                </div>
              </div>

              <!-- Items Table -->
              <h3 style="color: #2c2523; font-size: 16px; margin: 25px 0 10px; border-bottom: 2px solid #f0e9df; padding-bottom: 8px;">تفاصيل المشتريات:</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #fdfbf8; border-bottom: 1px solid #e8e2d4; color: #777;">
                    <th style="padding: 10px 8px; text-align: right;">المنتج</th>
                    <th style="padding: 10px 8px; text-align: center;">الكمية</th>
                    <th style="padding: 10px 8px; text-align: left;">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  \${itemsHtml}
                </tbody>
              </table>

              <!-- Delivery Details -->
              <div style="margin-top: 25px; padding: 18px; background: #faf8f5; border-radius: 12px; border: 1px solid #ede6db; font-size: 14px; line-height: 1.7; color: #444;">
                <strong style="color: #2c2523; display: block; margin-bottom: 6px;">📍 تفاصيل الشحن والتوصيل:</strong>
                <div>\${deliveryAddress || 'الاستلام من الفرع'}</div>
                \${phone ? \`<div><strong>الهاتف:</strong> \${phone}</div>\` : ''}
              </div>

              <!-- Tracking CTA -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://zahratbeesan.com/track-order?order_id=\${orderId}" style="background: linear-gradient(135deg, #c5a880 0%, #a47c4f 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(164,124,79,0.3);">
                  تتبع حالة طلبكِ مباشرة 🚚
                </a>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f4ede4; padding: 20px 25px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e8e2d4;">
              <p style="margin: 0 0 6px;">إذا كان لديكِ أي استفسار، يسعدنا تواصلكِ معنا عبر الواتساب: <a href="https://wa.me/962796697413" style="color: #a47c4f; font-weight: bold;">+962 79 669 7413</a></p>
              <p style="margin: 0; color: #999;">© 2026 بوتيك زهرة بيسان — جميع الحقوق محفوظة</p>
            </div>

          </div>
        </div>
      \`
    });
    console.log(\`[Customer Email] Order confirmation sent successfully to \${email} for Order #\${orderId}\`);
  } catch (err) {
    console.error("[Customer Order Email Error]:", err.message);
  }
}
`;

const files = ['main_server.js', 'server.js', 'app.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace previous email-only function or inject full notification suite
  if (content.includes('async function sendCustomerOrderConfirmation')) {
    const startIdx = content.indexOf('async function sendCustomerOrderConfirmation');
    const endAnchor = 'async function sendStoreNotificationEmail';
    const endIdx = content.indexOf(endAnchor);
    if (startIdx !== -1 && endIdx !== -1) {
      content = content.slice(0, startIdx) + CUSTOMER_NOTIFICATIONS_CODE + '\n' + content.slice(endIdx);
    }
  } else {
    const anchor = 'async function sendStoreNotificationEmail';
    if (content.includes(anchor)) {
      content = content.replace(anchor, CUSTOMER_NOTIFICATIONS_CODE + '\n' + anchor);
    }
  }

  // Ensure WhatsApp trigger is also called alongside Email trigger in POST /api/orders
  const oldCall = 'if (email && email.includes("@")) { sendCustomerOrderConfirmation({ orderId, customerName: customer_name, email, phone, deliveryAddress: delivery_address, totalAmount, cartItems }); }';
  const newCall = 'if (email && email.includes("@")) { sendCustomerOrderConfirmation({ orderId, customerName: customer_name, email, phone, deliveryAddress: delivery_address, totalAmount, cartItems }); }\n      if (phone) { sendCustomerOrderWhatsApp({ orderId, customerName: customer_name, phone, totalAmount, cartItems }); }';

  if (content.includes(oldCall) && !content.includes('sendCustomerOrderWhatsApp({')) {
    content = content.replace(oldCall, newCall);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Patched customer Email + WhatsApp notifications in:', file);
});
