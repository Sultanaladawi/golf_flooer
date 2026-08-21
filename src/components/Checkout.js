import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, getSafeImageUrl } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { trackPurchase } from '../utils/socialPixel';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import styles from './Checkout.module.css';
import { Sparkles, AlertTriangle, CreditCard, Landmark, Check, CheckCircle2, Zap, Truck, ShieldCheck, MapPin, Phone, User, X, Tag } from 'lucide-react';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { BILINGUAL_COUNTRIES, getCitiesForCountry } from '../utils/countryCityData';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { t, currentLang } = useLanguage();
  const { format: formatPrice } = useCurrency();
  
  const [step, setStep] = useState('form');
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('preparing');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'الأردن',
    state: '',
    city: '',
    area: '',
    address: '',
    paymentMethod: 'cod',
    transferReceipt: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [errors, setErrors] = useState({});
  const [storeComment, setStoreComment] = useState('');
  const [outOfStockError, setOutOfStockError] = useState(null);

  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countrySelectRef = useRef(null);

  const [showCitySelect, setShowCitySelect] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [countryCities, setCountryCities] = useState([]);
  const citySelectRef = useRef(null);

  const [storeSettings, setStoreSettings] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Close selects on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (countrySelectRef.current && !countrySelectRef.current.contains(e.target)) {
        setShowCountrySelect(false);
      }
      if (citySelectRef.current && !citySelectRef.current.contains(e.target)) {
        setShowCitySelect(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync cities when country changes
  useEffect(() => {
    const cities = getCitiesForCountry(form.country, currentLang);
    setCountryCities(cities);

    const isJordan = form.country === 'الأردن' || form.country === 'Jordan' || form.country === 'JO' || form.country === 'jo';
    if (!isJordan && form.paymentMethod === 'cod') {
      setForm(f => ({ ...f, paymentMethod: 'paypal' }));
    }
  }, [form.country, currentLang]);

  // Load store settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setStoreSettings(data))
      .catch(console.error);
  }, []);

  // Shipping calculation
  useEffect(() => {
    if (!form.country || form.country === 'دولة أخرى / Other') {
      setShippingFee(0);
      return;
    }
    
    if (form.country === 'الأردن' || form.country === 'Jordan') {
      setShippingError('');
      setIsCalculatingShipping(false);
      const isAmman = !form.city.trim() || form.city.includes('عمان') || form.city.toLowerCase().includes('amman');
      setShippingFee(isAmman ? 3 : 4);
      return;
    }

    if (!form.city.trim()) {
      setShippingFee(0);
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError('');
    
    const matchedCountry = BILINGUAL_COUNTRIES.find(c => c.ar === form.country || c.en === form.country);
    const countryCode = matchedCountry ? matchedCountry.code : 'SA';

    fetch('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode: countryCode,
        postalCode: '11111',
        city: form.city.trim(),
        weightKg: Math.max(1, items.reduce((acc, it) => acc + (it.qty || 1) * 0.8, 0)),
        itemCount: items.reduce((acc, it) => acc + (it.qty || 1), 0),
        subtotal: totalPrice
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsCalculatingShipping(false);
        if (data.fee !== undefined) {
          setShippingFee(parseFloat(data.fee) || 0);
        } else {
          setShippingFee(15);
        }
      })
      .catch(() => {
        setIsCalculatingShipping(false);
        setShippingFee(15);
      });
  }, [form.country, form.city, totalPrice, items]);

  // Location handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`);
          const data = await res.json();
          if (data && data.address) {
            setForm(f => ({
              ...f,
              country: data.address.country || f.country,
              state: data.address.state || f.state,
              city: data.address.city || data.address.town || data.address.village || f.city,
              area: data.address.suburb || data.address.neighbourhood || f.area,
              address: data.display_name || f.address
            }));
          }
        } catch (err) {
          setLocationError('فشل في جلب المنطقة تلقائياً');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationError('يرجى السماح للمتصفح بالوصول لموقعك');
        setIsLocating(false);
      }
    );
  };

  // Coupon handler
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
        setCouponError(data.message || 'كود الخصم غير صالح');
        setCouponApplied(null);
      }
    } catch (e) {
      setCouponError('تعذر التحقق من كود الخصم');
    } finally {
      setCouponLoading(false);
    }
  };

  const couponDiscount = couponApplied ? (couponApplied.discount || (totalPrice * (couponApplied.percent / 100))) : 0;
  const finalPrice = Math.max(totalPrice - couponDiscount + shippingFee, 0);

  // Validation
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'يرجى كتابة الاسم الكامل';
    if (!form.phone.trim()) e.phone = 'يرجى كتابة رقم الهاتف للتوصيل';
    if (!form.country.trim()) e.country = 'يرجى تحديد الدولة';
    if (!form.city.trim()) e.city = 'يرجى تحديد أو كتابة المدينة';
    if (!form.address.trim()) e.address = 'يرجى إدخال تفاصيل العنوان أو الشارع';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Save order to backend (Instantaneous)
  async function saveOrderToBackend() {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          email: form.email.trim() || null,
          total_amount: finalPrice,
          cartItems: items.map(item => ({
            id: item.productId,
            name: `${item.name} (${item.size || 'حر'})`,
            qty: item.qty,
            priceNum: item.priceNum
          })),
          order_type: 'delivery',
          delivery_address: `الدولة: ${form.country} - المدينة: ${form.city} - المنطقة: ${form.area} - تفاصيل: ${form.address} | طريقة الدفع: ${
            form.paymentMethod === 'cod' ? 'عند الاستلام (داخل الأردن)' : 'PayPal / Visa / MasterCard'
          } | رسوم التوصيل: ${shippingFee} JOD`,
          phone: form.phone.trim(),
          coupon_code: couponApplied ? couponApplied.code : null,
          is_gift: 0
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409 && result.outOfStock) {
          setOutOfStockError(result.error);
          return 'outofstock';
        }
        throw new Error(result.error || 'Failed to save order');
      }

      if (result.success) {
        setOrderId(result.orderId);
        try { trackPurchase(result.orderId, finalPrice, items); } catch (_) {}
        return 'success';
      }
      return 'error: فشل حفظ الطلب';
    } catch (error) {
      return 'error:' + error.message;
    }
  }

  // Submit handler for COD
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (form.paymentMethod === 'cod') {
      setStep('processing');
      const resultStatus = await saveOrderToBackend();

      if (resultStatus === 'success') {
        try { sendOrderConfirmationEmail(form.email.trim(), orderId || 'جديد', items, finalPrice); } catch(e) {}
        clearCart();
        setStep('success');
      } else if (resultStatus === 'outofstock') {
        setStep('outofstock');
      } else {
        setStep(resultStatus.startsWith('error') ? resultStatus : 'error:' + resultStatus);
      }
    }
  }

  // ── SUCCESS SCREEN (Full-Page Royal Confirmation) ──
  if (step === 'success') {
    return (
      <div className={styles.checkoutPageWrapper}>
        <Navbar />
        <main className={styles.mainContainer}>
          <div className={styles.successContainer}>
            <div className={styles.successRing}>
              <Check size={48} color="#ffffff" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-primary, serif)', fontSize: '2.5rem', color: 'var(--espresso)', margin: '0 0 10px 0' }}>
              تم تسجيل طلبكِ الملكي بنجاح! 🌸
            </h1>
            <p style={{ color: '#666', fontSize: '1.15rem', marginBottom: '25px', lineHeight: '1.7' }}>
              شكراً لتسوقكِ من زهرة بيسان. طلبكِ رقم <strong style={{ color: 'var(--gold-dim)', fontSize: '1.3rem' }}>#{orderId}</strong> قيد التجهيز والتغليف الفاخر وسيصلكِ في أقرب وقت.
            </p>

            <div style={{ backgroundColor: '#fcfaf7', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.3)', marginBottom: '30px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>اسم العميلة:</span>
                <strong style={{ color: '#1a1a1a' }}>{form.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>رقم الهاتف:</span>
                <strong style={{ color: '#1a1a1a' }} dir="ltr">{form.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span>عنوان التوصيل:</span>
                <strong style={{ color: '#1a1a1a' }}>{form.country} - {form.city} ({form.address})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <span>المبلغ الإجمالي المدفوع:</span>
                <strong style={{ color: 'var(--gold-dim)', fontSize: '1.2rem' }}>{formatPrice(finalPrice)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: 'var(--gold, #c5a880)',
                  color: '#1a1008',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                العودة للرئيسية ←
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: 'transparent',
                  color: '#444',
                  border: '1.5px solid #ddd',
                  padding: '16px 24px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🖨️ طباعة الفاتورة
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── EMPTY CART REDIRECT ──
  if (items.length === 0 && step !== 'success') {
    return (
      <div className={styles.checkoutPageWrapper}>
        <Navbar />
        <main className={styles.mainContainer} style={{ textAlign: 'center', padding: '160px 20px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--espresso)', marginBottom: '15px' }}>لا توجد منتجات في السلة لإتمام الطلب</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>يرجى اختيار عبايتكِ المفضلة أولاً</p>
          <button onClick={() => navigate('/#collection')} style={{ backgroundColor: 'var(--gold)', padding: '14px 32px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            تصفحي التشكيلة الآن ←
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── MAIN FULL-PAGE CHECKOUT ──
  const getItemImage = (item) => {
    if (!item) return '/favicon-512.png';
    const rawImg = item.image || (item.images && item.images[0]) || item.image_url;
    return getSafeImageUrl(rawImg);
  };

  const isJordan = form.country === 'الأردن' || form.country === 'Jordan' || form.country === 'JO' || form.country === 'jo';

  return (
    <div className={styles.checkoutPageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>الرئيسية</Link>
          <span>/</span>
          <Link to="/cart" style={{ color: '#888', textDecoration: 'none' }}>سلة المشتريات</Link>
          <span>/</span>
          <span style={{ color: 'var(--gold-dim)', fontWeight: 'bold' }}>إتمام الطلب والدفع</span>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>إتمام الطلب والدفع الآمن</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
            يرجى إدخال بيانات التوصيل واختيار طريقة الدفع المناسبة لكِ
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.checkoutGrid}>
            
            {/* ── RIGHT COLUMN: Information & Payment ── */}
            <div>
              {/* 1. Customer Information Card */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>
                  <User size={22} color="var(--gold-dim)" />
                  <span>1. بيانات المستلمة والتواصل</span>
                </h3>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>الاسم الكامل *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="مثال: سارة العبدالله"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>رقم الهاتف / الواتساب *</label>
                    <input
                      type="tel"
                      className={styles.input}
                      placeholder="مثال: 0791234567 أو +966..."
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      dir="ltr"
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>

                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.label}>البريد الإلكتروني (لاستلام الفاتورة وتتبع الشحنة)</label>
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address Card */}
              <div className={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--espresso)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={22} color="var(--gold-dim)" />
                    <span>2. عنوان التوصيل والشحن</span>
                  </h3>
                  
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    style={{
                      background: 'none',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold-dim)',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📍</span>
                    <span>{isLocating ? 'جاري التحديد...' : 'تحديد موقعي تلقائياً'}</span>
                  </button>
                </div>
                {locationError && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '-10px', marginBottom: '15px' }}>{locationError}</p>}

                <div className={styles.formGrid}>
                  {/* Country Selector */}
                  <div className={styles.formGroup} ref={countrySelectRef} style={{ position: 'relative' }}>
                    <label className={styles.label}>الدولة *</label>
                    <div 
                      onClick={() => setShowCountrySelect(v => !v)}
                      className={styles.input}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>{form.country}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                    </div>

                    {showCountrySelect && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0, right: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        zIndex: 999,
                        maxHeight: '260px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ padding: '8px' }}>
                          <input
                            type="text"
                            placeholder="ابحثي عن الدولة..."
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.85rem' }}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        {BILINGUAL_COUNTRIES.filter(c => c.ar.includes(countrySearch) || c.en.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <div
                            key={c.code}
                            onClick={() => {
                              setForm({ ...form, country: c.ar, city: '' });
                              setShowCountrySelect(false);
                            }}
                            style={{
                              padding: '10px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '0.9rem'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <img src={getFlagUrl(c.code.toLowerCase())} alt={c.ar} style={{ width: '18px', height: '12px', objectFit: 'cover' }} />
                            <span>{c.ar} ({c.en})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                  </div>

                  {/* City Selector / Input */}
                  <div className={styles.formGroup} ref={citySelectRef} style={{ position: 'relative' }}>
                    <label className={styles.label}>المدينة / المحافظة *</label>
                    {countryCities.length > 0 ? (
                      <>
                        <div 
                          onClick={() => setShowCitySelect(v => !v)}
                          className={styles.input}
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span>{form.city || 'اختاري المدينة...'}</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                        </div>

                        {showCitySelect && (
                          <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0, right: 0,
                            backgroundColor: '#ffffff',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            zIndex: 999,
                            maxHeight: '220px',
                            overflowY: 'auto'
                          }}>
                            {countryCities.map(city => (
                              <div
                                key={city}
                                onClick={() => {
                                  setForm({ ...form, city: city });
                                  setShowCitySelect(false);
                                }}
                                style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: '0.9rem' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="مثال: الرياض، دبي، المنامة..."
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                      />
                    )}
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>المنطقة / الحي</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="مثال: حي الروضة، دابوق، الصويفية..."
                      value={form.area}
                      onChange={e => setForm({ ...form, area: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>الشارع / رقم البناية / تفاصيل إضافية *</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="مثال: شارع المدينة المنورة، مجمع رقم 14"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                    {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                  </div>
                </div>
              </div>

              {/* 3. Payment Methods Card */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>
                  <CreditCard size={22} color="var(--gold-dim)" />
                  <span>3. طريقة الدفع</span>
                </h3>

                <div className={styles.paymentGrid}>
                  {/* Option A: Cash on Delivery (Jordan only) */}
                  {isJordan && (
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'cod' })}
                      className={styles.paymentCard}
                      style={{
                        border: form.paymentMethod === 'cod' ? '2px solid var(--gold)' : '1.5px solid #e0e0e0',
                        backgroundColor: form.paymentMethod === 'cod' ? 'rgba(197, 168, 128, 0.12)' : '#ffffff'
                      }}
                    >
                      <div style={{ fontSize: '1.6rem' }}>💵</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>عند الاستلام (داخل الأردن)</div>
                      <div style={{ fontSize: '0.78rem', color: '#777' }}>ادفعي نقداً عند استلام طلبكِ</div>
                    </div>
                  )}

                  {/* Option B: Direct Card & PayPal (Worldwide + Jordan) */}
                  <div
                    onClick={() => setForm({ ...form, paymentMethod: 'paypal' })}
                    className={styles.paymentCard}
                    style={{
                      border: form.paymentMethod === 'paypal' ? '2px solid var(--gold)' : '1.5px solid #e0e0e0',
                      backgroundColor: form.paymentMethod === 'paypal' ? 'rgba(197, 168, 128, 0.12)' : '#ffffff',
                      gridColumn: isJordan ? 'auto' : '1 / -1'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', fontSize: '1.4rem' }}>
                      <span>💳</span>
                      <span>🅿️</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>
                      بطاقة بنكية (Visa / MasterCard) أو PayPal
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gold-dim)', fontWeight: 'bold' }}>
                      دفع إلكتروني آمن ومباشر
                    </div>
                  </div>
                </div>

                {/* PayPal & Direct Card Buttons */}
                {form.paymentMethod === 'paypal' && (
                  <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    {/* Guidance Tip Box */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 48, 135, 0.05) 0%, rgba(0, 156, 222, 0.05) 100%)',
                      border: '1px solid rgba(0, 156, 222, 0.25)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      marginBottom: '20px',
                      fontSize: '0.88rem',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#003087', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💳</span>
                        <span>طرق الدفع الإلكتروني المتاحة:</span>
                      </div>
                      <div>• <strong>لديكِ حساب PayPal؟</strong> اختاري الزر الأصفر (PayPal).</div>
                      <div>• <strong>ترغبين بالدفع ببطاقة Visa أو MasterCard مباشرة؟</strong> اختاري الزر الأسود (Debit or Credit Card) دون الحاجة لإنشاء أي حساب في PayPal!</div>
                    </div>

                    <PayPalScriptProvider options={{ "client-id": storeSettings?.paypal_client_id || process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb", currency: "USD", intent: "capture", "enable-funding": "card" }}>
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "pill", color: "gold" }}
                        onClick={(data, actions) => {
                          if (!validate()) {
                            alert('يرجى استكمال الحقول المطلوبة أولاً (الاسم، رقم الهاتف، والمدينة والعنوان).');
                            return actions.reject();
                          }
                          return actions.resolve();
                        }}
                        createOrder={(data, actions) => {
                          const usdAmount = (finalPrice * 1.41).toFixed(2);
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: usdAmount
                                },
                                description: `طلب من متجر زهرة بيسان (${items.length} قطعة)`
                              }
                            ]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            setStep('processing');
                            await actions.order.capture();
                            const resultStatus = await saveOrderToBackend();
                            if (resultStatus === 'success') {
                              try { sendOrderConfirmationEmail(form.email.trim(), orderId || 'جديد', items, finalPrice); } catch(e) {}
                              clearCart();
                              setStep('success');
                            } else {
                              setStep('error:حدث خطأ أثناء تسجيل الطلب');
                            }
                          } catch (err) {
                            setStep('error:فشلت عملية الدفع عبر PayPal. يرجى المحاولة مجدداً.');
                          }
                        }}
                        onCancel={() => alert('تم إلغاء عملية الدفع. يمكنكِ إعادة المحاولة في أي وقت.')}
                        onError={(err) => alert('حدث تضارب أثناء الاتصال ببوابة الدفع. يرجى المحاولة مجدداً.')}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className={styles.sectionCard}>
                <label className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>
                  ملاحظات أو تعليمات خاصة بمندوب التوصيل:
                </label>
                <textarea
                  placeholder="مثال: يرجى الاتصال قبل الوصول بـ 15 دقيقة..."
                  value={storeComment}
                  onChange={e => setStoreComment(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', minHeight: '60px', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* ── LEFT COLUMN: Order Summary (Sticky) ── */}
            <div className={styles.orderSummarySticky}>
              <h3 style={{ margin: '0 0 18px 0', fontSize: '1.3rem', color: 'var(--espresso)', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', fontFamily: 'var(--font-primary, serif)' }}>
                ملخص مشترياتكِ ({items.length})
              </h3>

              {/* Items List Preview */}
              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <img 
                      src={getItemImage(item)} 
                      alt={item.name} 
                      style={{ width: '45px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/favicon-512.png'; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#777' }}>الكمية: {item.qty} {item.size && `| المقاس: ${item.size}`}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--gold-dim)' }}>
                      {formatPrice(item.priceNum * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>المجموع الفرعي:</span>
                  <strong style={{ color: '#1a1a1a' }}>{formatPrice(totalPrice)}</strong>
                </div>

                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>خصم الكوبون ({couponApplied?.code}):</span>
                    <strong>-{formatPrice(couponDiscount)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>رسوم الشحن والتوصيل:</span>
                  {isCalculatingShipping ? (
                    <span style={{ color: 'var(--gold-dim)' }}>جاري الحساب...</span>
                  ) : (
                    <strong style={{ color: shippingFee === 0 ? '#15803d' : '#1a1a1a' }}>
                      {shippingFee === 0 ? 'شحن مجاني' : `+${formatPrice(shippingFee)}`}
                    </strong>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className={styles.sumTotal}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--espresso)' }}>المبلغ الإجمالي:</span>
                <div style={{ textAlign: 'left' }}>
                  <div className={styles.sumTotalAmt}>{formatPrice(finalPrice)}</div>
                  {useCurrency().currency?.code !== 'JOD' && (
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      ≈ {finalPrice.toFixed(2)} دينار أردني
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Button for COD */}
              {form.paymentMethod === 'cod' && (
                <button
                  type="submit"
                  disabled={step === 'processing'}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--gold, #c5a880)',
                    color: '#1a1008',
                    border: 'none',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    cursor: step === 'processing' ? 'not-allowed' : 'pointer',
                    marginTop: '25px',
                    boxShadow: '0 10px 25px rgba(197, 168, 128, 0.4)',
                    transition: 'transform 0.2s',
                    opacity: step === 'processing' ? 0.7 : 1
                  }}
                >
                  {step === 'processing' ? 'جاري تأكيد الطلب...' : `تأكيد الطلب الآن (${formatPrice(finalPrice)}) ←`}
                </button>
              )}

              {/* Security badges */}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', fontSize: '0.78rem', color: '#777', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>🔒 تسوق آمن ومحمي 100%</div>
                <div>🚚 توصيل سريع مع خدمة التتبع المباشر</div>
              </div>
            </div>

          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}