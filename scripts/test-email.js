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
    const info = await transporter.sendMail({
      from: '"متجر زهرة بيسان" <zahratbeesanshop@gmail.com>',
      to: 'zahratbeesanshop@gmail.com',
      subject: '👑 اختبار تفعيل نظام إشعارات متجر زهرة بيسان الفاخر',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #fdfbf7; border: 1px solid #e8dfd8; border-radius: 10px;">
          <h2 style="color: #b8943a;">👑 تم تفعيل نظام إشعارات متجر زهرة بيسان بنجاح!</h2>
          <p style="color: #333; font-size: 16px;">أهلاً بك، تم ربط بريد متجر زهرة بيسان بنجاح وسوف تصلك جميع رسائل العملاء واستفسارات نموذج التواصل وطلبات الشراء على هذا البريد فوراً وبشكل تلقائي.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="color: #777; font-size: 12px;">وقت الإرسال: ${new Date().toLocaleString('ar-JO', { timeZone: 'Asia/Amman' })}</p>
        </div>
      `
    });
    console.log('✅ EMAIL_SENT_SUCCESS! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ EMAIL_SEND_ERROR:', err);
  }
}

test();
