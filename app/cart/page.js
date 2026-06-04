"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import styles from './page.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, currency, addOrder, clearCart } = useAppContext();
  
  // Form fields state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Amman');
  const [address, setAddress] = useState('');
  
  // Coupon state
  const [coupon, setCoupon] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Success order state
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const getPriceSymbol = () => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'AED': return 'د.إ';
      default: return 'د.أ';
    }
  };

  const getCurrencyMultiplier = () => {
    switch (currency) {
      case 'SAR': return 5.3; // 1 JOD ~ 5.3 SAR
      case 'AED': return 5.2; // 1 JOD ~ 5.2 AED
      default: return 1.0;
    }
  };

  const multiplier = getCurrencyMultiplier();
  const rawSubtotal = cartTotal * multiplier;
  
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = () => {
    const formatted = coupon.trim().toUpperCase();
    if (formatted === 'FIRST15') {
      setActiveCoupon('FIRST15');
      setDiscountPercent(15);
    } else if (formatted === 'WELCOME10') {
      setActiveCoupon('WELCOME10');
      setDiscountPercent(10);
    } else {
      alert('كوبون غير صالح. جربي الكود FIRST15 للحصول على 15% خصم!');
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('الرجاء إدخال كافة المعلومات المطلوبة للتوصيل');
      return;
    }

    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const orderId = addOrder({
      customer: fullName,
      phone,
      city,
      address,
      items: orderItems,
      total: cartTotal,
      currency
    });

    setOrderNumber(orderId);
    setOrderSubmitted(true);
    clearCart();
  };

  if (orderSubmitted) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle2 size={48} />
          </div>
          <h2>تم تأكيد طلبكِ بنجاح!</h2>
          <p>شكراً لتسوقكِ مع زهرة الخليج. لقد تم استلام طلبكِ وسيتواصل معكِ فريقنا لتأكيد موعد التوصيل خلال 24 ساعة.</p>
          
          <div className={styles.orderNumber}>
            رقم الطلب: {orderNumber}
          </div>

          <div>
            <Link href="/shop" className="btn-primary">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>
            <ShoppingBag size={64} />
          </div>
          <h2>سلتكِ فارغة حالياً</h2>
          <p>اكتشفي تشكيلة زهرة الخليج الفاخرة وأضيفي بعض القطع المميزة لسلتكِ.</p>
          <Link href="/shop" className="btn-primary">
            تصفحي التشكيلة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1>حقيبة التسوق</h1>
        <div className="gold-line" />
      </div>

      <div className={styles.cartLayout}>
        {/* ===== FORM COLUMN ===== */}
        <div className={styles.checkoutFormSection}>
          <h2 className={styles.sectionTitle}>معلومات الشحن والتسليم</h2>
          
          <form onSubmit={handleCheckout}>
            <div className={styles.formGroup}>
              <label htmlFor="full-name" className={styles.formLabel}>الاسم الكريم بالكامل *</label>
              <input 
                type="text" 
                id="full-name"
                className={styles.formInput} 
                placeholder="الاسم الثلاثي أو الرباعي..." 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone-number" className={styles.formLabel}>رقم الهاتف للاتصال والواتساب *</label>
              <input 
                type="tel" 
                id="phone-number"
                className={styles.formInput} 
                placeholder="مثال: 079XXXXXXX..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.formLabel}>المدينة أو المحافظة *</label>
              <select 
                id="city" 
                className={styles.formInput}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="Amman">عمّان (العاصمة)</option>
                <option value="Zarqa">الزرقاء</option>
                <option value="Irbid">إربد</option>
                <option value="Aqaba">العقبة</option>
                <option value="Salt">السلط</option>
                <option value="Madaba">مأدبا</option>
                <option value="Jerash">جرش</option>
                <option value="Ajloun">عجلون</option>
                <option value="Karak">الكرك</option>
                <option value="Tafileh">الطفيلة</option>
                <option value="Ma'an">معان</option>
                <option value="Mafraq">المفرق</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address-detail" className={styles.formLabel}>العنوان بالتفصيل *</label>
              <textarea 
                id="address-detail"
                className={styles.formInput} 
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder="اسم الشارع، البناية، رقم الشقة أو علامة فارقة..." 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className={styles.codNotice}>
              <p className={styles.codTitle}>الدفع عند الاستلام (COD)</p>
              <p>نوفر خدمة التوصيل الآمن والدفع نقداً عند استلام ومعاينة العباية لباب بيتك.</p>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              تأكيد وإرسال الطلب
            </button>
          </form>
        </div>

        {/* ===== ITEMS & SUMMARY COLUMN ===== */}
        <div className={styles.cartSummarySection}>
          <div className={styles.cartItemsList}>
            <h2 className={styles.sectionTitle}>محتويات السلة ({cart.length})</h2>
            
            {cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemMeta}>
                    <span>الكمية: {item.quantity}</span>
                  </div>
                  <div className={styles.itemPrice}>
                    {(item.price * multiplier).toFixed(1)} {getPriceSymbol()}
                  </div>
                </div>

                <div className={styles.itemControls}>
                  <div className={styles.quantitySelector}>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className={styles.removeBtn} 
                    onClick={() => removeFromCart(item.id)}
                    aria-label="حذف من السلة"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon and Summary Box */}
          <div className={styles.summaryBox}>
            <h2 className={styles.sectionTitle}>ملخص الحساب</h2>
            
            <div className={styles.couponBox}>
              <input 
                type="text" 
                placeholder="رمز الكوبون (FIRST15)..." 
                className={styles.formInput} 
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                id="coupon-input"
              />
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleApplyCoupon}
                style={{ padding: '8px 20px' }}
              >
                تطبيق
              </button>
            </div>

            {activeCoupon && (
              <div className={styles.couponSuccess}>
                ✓ تم تطبيق كوبون الخصم بنجاح ({discountPercent}%)
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>المجموع الفرعي</span>
              <span>{rawSubtotal.toFixed(1)} {getPriceSymbol()}</span>
            </div>

            {discountPercent > 0 && (
              <div className={styles.summaryRow} style={{ color: '#27ae60', fontWeight: '500' }}>
                <span>خصم الكوبون</span>
                <span>-{discountAmount.toFixed(1)} {getPriceSymbol()}</span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span>تكلفة الشحن والتوصيل</span>
              <span style={{ color: '#27ae60', fontWeight: 'bold' }}>مجاني</span>
            </div>

            <div className={styles.totalRow}>
              <span>الإجمالي الكلي</span>
              <span className={styles.totalPrice}>
                {finalTotal.toFixed(1)} {getPriceSymbol()}
              </span>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href="/shop" className={styles.backLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>الرجوع للمتجر للتسوق</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
