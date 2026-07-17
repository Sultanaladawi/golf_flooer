import emailjs from '@emailjs/browser';

const SERVICE_ID = "service_gnjnpzn";
const TEMPLATE_ID = "template_rsi72vt";
const PUBLIC_KEY = "GwA2uuN53g6eRGAVA";

/**
 * إرسال إيميل تأكيد الطلب للزبون
 * @param {string} toEmail إيميل الزبون
 * @param {string} orderId رقم الطلب
 * @param {Array} cartItems المنتجات
 * @param {number} total السعر الإجمالي
 */
export const sendOrderConfirmationEmail = async (toEmail, orderId, cartItems, total) => {
  try {
    // تجهيز قائمة المنتجات كنص لتتناسب مع القالب
    let itemsText = cartItems.map(item => `- ${item.name} (الكمية: ${item.qty}) = ${item.price} JOD`).join('\n');

    const templateParams = {
      email: toEmail,
      order_id: orderId,
      // تمرير الطلبات كمصفوفة إذا كان القالب يدعمها، أو كنص احتياطي
      orders: cartItems.map(item => ({ name: item.name, units: item.qty, price: item.price })),
      orderDetails: itemsText, // متغير إضافي في حال تعديل القالب لاحقاً
      totalPrice: total
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Email sent successfully!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
