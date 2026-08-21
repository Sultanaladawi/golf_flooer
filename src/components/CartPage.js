import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function CartPage() {
  const navigate = useNavigate();
  const { 
    items, 
    removeItem, 
    setQty, 
    clearCart, 
    subTotal,
    bundleDiscount,
    isBundleApplied,
    totalPrice,
    totalItems
  } = useCart();
  
  const { format: formatPrice, currency } = useCurrency();
  const { t } = useLanguage();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftPackaging, setGiftPackaging] = useState('luxury_box');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), total: totalPrice })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied(data);
        setCouponError('');
      } else {
        setCouponError(data.message || 'كود الخصم غير صالح أو منتهي الصلاحية');
        setCouponApplied(null);
      }
    } catch (e) {
      setCouponError('تعذر التحقق من كود الخصم حالياً');
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = couponApplied ? (couponApplied.discount || (totalPrice * (couponApplied.percent / 100))) : 0;
  const finalCartTotal = Math.max(totalPrice - discountAmount, 0);

  const getItemImage = (item) => {
    if (!item) return '/favicon-512.png';
    if (item.image && typeof item.image === 'string') {
      const trimmed = item.image.trim();
      if (trimmed && trimmed !== '12.png' && trimmed !== '/12.png' && trimmed !== '/images/12.png') {
        if (trimmed.startsWith('/') || trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;
        return `/images/${trimmed}`;
      }
    }
    if (item.images && Array.isArray(item.images)) {
      const valid = item.images.filter(i => i && i !== '12.png' && i !== '/12.png');
      if (valid.length > 0) {
        if (valid[0].startsWith('/') || valid[0].startsWith('http') || valid[0].startsWith('data:')) return valid[0];
        return `/images/${valid[0]}`;
      }
    }
    return '/favicon-512.png';
  };

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', direction: 'rtl', color: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1300px', margin: '0 auto', padding: '130px 20px 60px', width: '100%', boxSizing: 'border-box' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>الرئيسية</Link>
          <span>/</span>
          <span style={{ color: 'var(--gold-dim)', fontWeight: 'bold' }}>سلة المشتريات</span>
        </div>

        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', borderBottom: '1px solid rgba(197, 168, 128, 0.25)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-primary, serif)', fontSize: '2.4rem', margin: '0 0 6px 0', color: 'var(--espresso)' }}>
              سلة المشتريات الملكية
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
              لديكِ ({totalItems}) {totalItems === 1 ? 'قطعة فاخرة' : 'قطع فاخرة'} في السلة
            </p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('هل تودين إفراغ سلة المشتريات بالكامل؟')) {
                  clearCart();
                }
              }}
              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🗑️</span> إفراغ السلة
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '80px 20px',
            textAlign: 'center',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            boxShadow: '0 15px 40px rgba(0,0,0,0.03)',
            maxWidth: '650px',
            margin: '40px auto'
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '15px' }}>🛍️</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--espresso)', margin: '0 0 10px 0', fontFamily: 'var(--font-primary, serif)' }}>
              سلة مشترياتكِ فارغة حالياً
            </h2>
            <p style={{ color: '#777', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '30px' }}>
              استكشفي أحدث إبداعات وتصاميم زهرة بيسان من العبايات الملكية وكولكشن المناسبات الفاخر.
            </p>
            <button
              onClick={() => navigate('/#collection')}
              style={{
                backgroundColor: 'var(--gold, #c5a880)',
                color: '#1a1008',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(197, 168, 128, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              تصفحي التشكيلة الآن ←
            </button>
          </div>
        ) : (
          /* 2-Column Full Cart Layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
            gap: '35px',
            alignItems: 'flex-start'
          }} className="cart-page-grid">
            
            {/* ── RIGHT COLUMN: Products Table & Extra Options ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              {/* Products List Box */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fcfaf8', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--espresso)' }}>
                  المنتجات المختارة ({items.length})
                </div>

                <div style={{ padding: '0 24px' }}>
                  {items.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '90px minmax(0, 1.5fr) 130px 100px 40px',
                        gap: '20px',
                        alignItems: 'center',
                        padding: '24px 0',
                        borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f0f0f0'
                      }}
                      className="cart-item-row"
                    >
                      {/* Product Thumbnail */}
                      <div style={{ width: '85px', height: '110px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f5f5f5', border: '1px solid #eee' }}>
                        <img 
                          src={getItemImage(item)} 
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/favicon-512.png'; }}
                        />
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--espresso)', fontWeight: '800' }}>
                          {item.name}
                        </h3>
                        {item.size && (
                          <div style={{ display: 'inline-block', backgroundColor: 'rgba(197, 168, 128, 0.15)', color: 'var(--gold-dim)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px' }}>
                            المقاس: {item.size}
                          </div>
                        )}
                        <div style={{ color: '#777', fontSize: '0.85rem' }}>
                          سعر القطعة: <strong style={{ color: '#1a1a1a' }}>{formatPrice(item.priceNum)}</strong>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '12px',
                        padding: '4px',
                        border: '1px solid #e5e5e5',
                        width: '110px'
                      }}>
                        <button
                          onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                          style={{ width: '30px', height: '30px', border: 'none', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                          -
                        </button>
                        <span style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          style={{ width: '30px', height: '30px', border: 'none', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div style={{ textAlign: 'left', fontWeight: '800', fontSize: '1.05rem', color: 'var(--gold-dim)', direction: 'ltr' }}>
                        {formatPrice(item.priceNum * item.qty)}
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem', padding: '6px', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e63946'}
                        onMouseLeave={e => e.currentTarget.style.color = '#999'}
                        title="حذف من السلة"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Options Box */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--gold)' }}
                  />
                  <span>🎁 هل هذا الطلب هدية لشخص عزيز؟ (تغليف وبطاقة إهداء فاخرة)</span>
                </label>

                {isGift && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 'bold', color: '#555' }}>
                        نوع التغليف الملكي:
                      </label>
                      <select
                        value={giftPackaging}
                        onChange={(e) => setGiftPackaging(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                      >
                        <option value="luxury_box">صندوق زهرة بيسان الفاخر مع شريط حريري ملكي (مجاناً)</option>
                        <option value="royal_bag">كيس إهداء كلاسيكي فخم مع بطاقة تهنئة (مجاناً)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 'bold', color: '#555' }}>
                        نص بطاقة الإهداء المرفقة:
                      </label>
                      <textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="اكتبي كلمات الإهداء التي ترغبين بطباعتها على البطاقة..."
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '65px', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Application Box */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--espresso)' }}>
                  🏷️ كود الخصم أو قسيمة الشراء
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="أدخلي كود الخصم (مثال: BEESAN2026)"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #ddd',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      textTransform: 'uppercase',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    style={{
                      backgroundColor: 'var(--espresso, #2b1a09)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {couponLoading ? 'جاري التحقق...' : 'تطبيق'}
                  </button>
                </div>
                {couponApplied && (
                  <div style={{ marginTop: '10px', color: '#15803d', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    ✓ تم تطبيق كود الخصم بنجاح!
                  </div>
                )}
                {couponError && (
                  <div style={{ marginTop: '10px', color: '#b91c1c', fontSize: '0.88rem' }}>
                    {couponError}
                  </div>
                )}
              </div>

            </div>

            {/* ── LEFT COLUMN: Order Summary (Sticky) ── */}
            <div style={{ position: 'sticky', top: '110px' }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '28px',
                border: '1px solid rgba(197, 168, 128, 0.35)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--espresso)', margin: '0 0 20px 0', borderBottom: '1px solid #f0f0f0', paddingBottom: '14px', fontFamily: 'var(--font-primary, serif)' }}>
                  ملخص الطلب
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                    <span>المجموع الفرعي:</span>
                    <strong style={{ color: '#1a1a1a' }}>{formatPrice(subTotal)}</strong>
                  </div>

                  {bundleDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                      <span>خصم البكج الملكي:</span>
                      <strong>- {formatPrice(bundleDiscount)}</strong>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                      <span>خصم الكوبون ({couponApplied?.code}):</span>
                      <strong>- {formatPrice(discountAmount)}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                    <span>الشحن والتوصيل:</span>
                    <span style={{ color: '#15803d', fontWeight: 'bold' }}>يُحسب في الخطوة التالية</span>
                  </div>
                </div>

                <div style={{
                  borderTop: '2px dashed rgba(197, 168, 128, 0.3)',
                  paddingTop: '16px',
                  marginBottom: '25px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--espresso)' }}>المجموع الإجمالي:</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--gold-dim)' }}>
                      {formatPrice(finalCartTotal)}
                    </div>
                    {currency && currency.code !== 'JOD' && (
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        ≈ {finalCartTotal.toFixed(2)} دينار أردني
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Proceed to Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--gold, #c5a880)',
                    color: '#1a1008',
                    border: 'none',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 25px rgba(197, 168, 128, 0.4)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <span>المتابعة لإتمام الطلب والدفع</span>
                  <span style={{ fontSize: '1.3rem' }}>←</span>
                </button>

                {/* Safe Shopping Guarantee Badges */}
                <div style={{
                  marginTop: '25px',
                  paddingTop: '20px',
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔒</span>
                    <span>دفع إلكتروني مشفر وآمن 100% (Visa, MasterCard, PayPal)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚚</span>
                    <span>شحن سريع وموثوق لكافة دول العالم عبر فيدكس</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👑</span>
                    <span>ضمان الجودة والأقمشة الملكية الأصلية</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
      
      {/* Mobile Responsive Grid Styles */}
      <style>{`
        @media (max-width: 880px) {
          .cart-page-grid {
            grid-template-columns: 1fr !important;
          }
          .cart-item-row {
            grid-template-columns: 75px minmax(0, 1fr) !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
