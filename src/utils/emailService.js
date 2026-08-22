/**
 * 👑 ZAHRAT BEESAN LUXURY ORDER CONFIRMATION EMAIL SERVICE
 * Dispatches instant branded HTML order invoices directly to the customer's personal email.
 */

export const sendOrderConfirmationEmail = async (toEmail, orderId, cartItems, total, customerName, deliveryAddress, phone) => {
  if (!toEmail || !toEmail.includes('@')) {
    console.warn('[Email Dispatch] Skipped: No valid recipient email provided.');
    return false;
  }

  try {
    const isDev = typeof window !== 'undefined' && window.location.port === '3000';
    const endpoint = isDev 
      ? `http://${window.location.hostname}:5000/api/send-order-confirmation`
      : '/api/send-order-confirmation';

    const formattedItems = Array.isArray(cartItems) ? cartItems.map(item => ({
      name: item.name || 'عباية ملكية فاخرة',
      qty: item.qty || item.quantity || 1,
      price: item.priceNum || item.price || 0,
      size: item.size || 'حر'
    })) : [];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderId || 'جديد',
        customerName: customerName || 'عميلة زهرة بيسان',
        email: toEmail.trim(),
        phone: phone || '',
        deliveryAddress: deliveryAddress || '',
        totalAmount: total || 0,
        items: formattedItems
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ Customer order confirmation email sent to:', toEmail);
      return true;
    } else {
      console.warn('⚠️ Server notice on customer email dispatch:', data.error || data);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to dispatch customer confirmation email:', error.message);
    return false;
  }
};
