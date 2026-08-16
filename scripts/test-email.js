const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'zahratbeesanshop@gmail.com',
      pass: 'xonwujxfjuciraei'
    }
  });

  try {
    const timeStr = new Date().toLocaleTimeString('ar-JO', { timeZone: 'Asia/Amman' });
    const info = await transporter.sendMail({
      from: '"متجر زهرة بيسان الفاخر" <zahratbeesanshop@gmail.com>',
      to: 'zahratbeesanshop@gmail.com',
      subject: `🔔 [إشعار عاجل] رسالة جديدة من متجر زهرة بيسان (${timeStr})`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 25px; background-color: #fdfbf7; border: 2px solid #b8943a; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #b8943a; margin-top: 0;">👑 متجر زهرة بيسان الفاخر</h2>
          <h3 style="color: #333;">وصلتك رسالة جديدة من نموذج التواصل!</h3>
          <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;">
            <p><strong>👤 الاسم:</strong> تجربة النظام</p>
            <p><strong>📧 البريد:</strong> zahratbeesanshop@gmail.com</p>
            <p><strong>📝 الرسالة:</strong> تم فحص وتأكيد الربط بنجاح، والإشعار يعمل الآن على مدار الساعة.</p>
          </div>
          <p style="color: #888; font-size: 12px;">وقت الإرسال: ${timeStr}</p>
        </div>
      `
    });
    console.log('✅ DELIVERY_CONFIRMED:', info.messageId, 'Response:', info.response);
  } catch (err) {
    console.error('❌ DELIVERY_FAILED:', err);
  }
}

test();
