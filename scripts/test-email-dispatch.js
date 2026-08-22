const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER || "zahratbeesanshop@gmail.com";
const SMTP_PASS = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "xonwujxfjuciraei").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

async function testSend() {
  try {
    const info = await transporter.sendMail({
      from: `"بوتيك زهرة بيسان الفاخر" <${SMTP_USER}>`,
      to: "sultanadawi2004@gmail.com",
      subject: "✨ تجربة إرسال الفاتورة وتأكيد الطلب — بوتيك زهرة بيسان",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #faf8f5;">
          <h2 style="color: #c5a880;">مرحباً بكِ في زهرة بيسان 🌸</h2>
          <p>هذا إيميل تجريبي لتأكيد وصول الفاتورة وتفاصيل الطلب إلى إيميل الزبون بنجاح!</p>
          <div style="background: #fff; padding: 15px; border: 1px solid #d4af37; border-radius: 8px;">
            <strong>رقم الطلب: #ORD-TEST</strong><br/>
            <strong>المبلغ: 35.00 د.أ</strong>
          </div>
        </div>
      `
    });
    console.log("✅ Email sent successfully! MessageId:", info.messageId);
  } catch (err) {
    console.error("❌ Email Error:", err);
  }
}

testSend();
