const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || "zahratbeesanshop@gmail.com";
const SMTP_PASS = (process.env.SMTP_PASS || "xonwujxfjuciraei").replace(/\s+/g, "");

console.log('Testing SMTP connection for:', SMTP_USER);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to take our messages!');
    
    transporter.sendMail({
      from: `"متجر زهرة بيسان" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: 'اختبار وصول رسائل متجر زهرة بيسان 🌸',
      text: 'هذا بريد تجريبي للتأكد من وصول رسائل نموذج التواصل بنجاح.'
    }, (err, info) => {
      if (err) {
        console.error('❌ Send Mail Error:', err.message);
      } else {
        console.log('🎉 Email Sent Successfully! Message ID:', info.messageId);
      }
    });
  }
});
