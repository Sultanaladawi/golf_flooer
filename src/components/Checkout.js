import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import styles from './Checkout.module.css';
import { Sparkles, AlertTriangle, CreditCard, Landmark, Check, CheckCircle2, Zap, Truck, ShieldCheck, MapPin, Phone, User, X, Tag } from 'lucide-react';
import { City } from 'country-state-city';
import { sendOrderConfirmationEmail } from '../utils/emailService';

// Comprehensive list of world countries with flag ISO codes (flagcdn.com)
const WORLD_COUNTRIES = [
  { name: 'الأردن',           iso: 'jo' }, { name: 'السعودية',         iso: 'sa' },
  { name: 'الإمارات',         iso: 'ae' }, { name: 'الكويت',           iso: 'kw' },
  { name: 'قطر',              iso: 'qa' }, { name: 'البحرين',          iso: 'bh' },
  { name: 'عمان',             iso: 'om' }, { name: 'مصر',              iso: 'eg' },
  { name: 'السودان',          iso: 'sd' }, { name: 'اليمن',            iso: 'ye' },
  { name: 'ليبيا',            iso: 'ly' }, { name: 'تونس',             iso: 'tn' },
  { name: 'الجزائر',          iso: 'dz' }, { name: 'المغرب',           iso: 'ma' },
  { name: 'موريتانيا',        iso: 'mr' }, { name: 'العراق',           iso: 'iq' },
  { name: 'سوريا',            iso: 'sy' }, { name: 'لبنان',            iso: 'lb' },
  { name: 'فلسطين',           iso: 'ps' }, { name: 'تركيا',            iso: 'tr' },
  { name: 'إيران',            iso: 'ir' }, { name: 'باكستان',          iso: 'pk' },
  { name: 'أفغانستان',        iso: 'af' }, { name: 'الهند',            iso: 'in' },
  { name: 'بنغلاديش',         iso: 'bd' }, { name: 'إندونيسيا',        iso: 'id' },
  { name: 'ماليزيا',          iso: 'my' }, { name: 'سنغافورة',         iso: 'sg' },
  { name: 'الصين',            iso: 'cn' }, { name: 'اليابان',          iso: 'jp' },
  { name: 'كوريا الجنوبية',   iso: 'kr' }, { name: 'أستراليا',         iso: 'au' },
  { name: 'نيوزيلندا',        iso: 'nz' }, { name: 'United States',    iso: 'us' },
  { name: 'United Kingdom',   iso: 'gb' }, { name: 'Canada',           iso: 'ca' },
  { name: 'Germany',          iso: 'de' }, { name: 'France',           iso: 'fr' },
  { name: 'Italy',            iso: 'it' }, { name: 'Spain',            iso: 'es' },
  { name: 'Netherlands',      iso: 'nl' }, { name: 'Belgium',          iso: 'be' },
  { name: 'Sweden',           iso: 'se' }, { name: 'Norway',           iso: 'no' },
  { name: 'Denmark',          iso: 'dk' }, { name: 'Switzerland',      iso: 'ch' },
  { name: 'Austria',          iso: 'at' }, { name: 'Russia',           iso: 'ru' },
  { name: 'Ukraine',          iso: 'ua' }, { name: 'Poland',           iso: 'pl' },
  { name: 'Czech Republic',   iso: 'cz' }, { name: 'Hungary',          iso: 'hu' },
  { name: 'Romania',          iso: 'ro' }, { name: 'Bulgaria',         iso: 'bg' },
  { name: 'Greece',           iso: 'gr' }, { name: 'Portugal',         iso: 'pt' },
  { name: 'Brazil',           iso: 'br' }, { name: 'Argentina',        iso: 'ar' },
  { name: 'Mexico',           iso: 'mx' }, { name: 'Colombia',         iso: 'co' },
  { name: 'Chile',            iso: 'cl' }, { name: 'South Africa',     iso: 'za' },
  { name: 'Nigeria',          iso: 'ng' }, { name: 'Kenya',            iso: 'ke' },
  { name: 'Ghana',            iso: 'gh' }, { name: 'Ethiopia',         iso: 'et' },
  { name: 'Tanzania',         iso: 'tz' }, { name: 'دولة أخرى / Other', iso: null },
];

export default function Checkout({ onClose, onBack, initialStep = 'form', initialOrderId = null }) {
  const { items, totalPrice, clearCart } = useCart();
  const { format } = useCurrency();
  const [step, setStep] = useState(initialStep);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [timeRemaining, setTimeRemaining] = useState(120);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'الأردن',
    state: '',
    city: '',
    area: '',
    address: '',
    paymentMethod: 'cod', // Default to Cash on Delivery
    transferReceipt: '', // Reference number for manual transfers
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [orderType] = useState('delivery'); // Online-only store — always delivery
  const [errors, setErrors] = useState({});
  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState('');
  const [outOfStockError, setOutOfStockError] = useState(null);

  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

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
          setLocationError('فشل في جلب المنطقة تلقائياً، يرجى الإدخال يدوياً');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setLocationError('يرجى السماح للمتصفح بالوصول لموقعك');
        setIsLocating(false);
      }
    );
  };

  const [showCountrySelect, setShowCountrySelect] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countrySelectRef = useRef(null);

  const [showCitySelect, setShowCitySelect] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [countryCities, setCountryCities] = useState([]);
  const citySelectRef = useRef(null);

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

  useEffect(() => {
    const currentCountryObj = WORLD_COUNTRIES.find(c => c.name === form.country);
    if (currentCountryObj && currentCountryObj.iso) {
      const cities = City.getCitiesOfCountry(currentCountryObj.iso.toUpperCase());
      // Filter out duplicate city names
      const uniqueCities = cities ? Array.from(new Set(cities.map(c => c.name))).map(name => {
        return cities.find(c => c.name === name);
      }) : [];
      setCountryCities(uniqueCities);
    } else {
      setCountryCities([]);
    }
  }, [form.country]);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState({ points: 0 });
  const [usePoints, setUsePoints] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftPackaging, setGiftPackaging] = useState('');
  const [giftMessage, setGiftMessage] = useState('');


  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setStoreSettings(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.country || form.country === 'دولة أخرى / Other') {
      setShippingFee(0);
      return;
    }
    
    if (form.country === 'الأردن') {
      setShippingError('');
      setIsCalculatingShipping(false);
      if (!form.city.trim()) {
        setShippingFee(0);
      } else if (form.city.includes('عمان') || form.city.toLowerCase() === 'amman') {
        setShippingFee(2);
      } else {
        setShippingFee(3);
      }
    } else {
      if (!form.city.trim()) {
        setShippingFee(0);
        return;
      }

      setIsCalculatingShipping(true);
      setShippingError('');
      const totalWeight = items.length || 1;
      const countryIso = WORLD_COUNTRIES.find(c => c.name === form.country)?.iso?.toUpperCase() || '';
      
      fetch('/api/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: countryIso,
          city: form.city || 'Capital',
          totalWeight: totalWeight
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.amount) {
            setShippingFee(data.amount);
          } else {
            setShippingFee(15); // Fallback standard intl shipping
          }
        })
        .catch(err => {
          console.error(err);
          setShippingFee(15);
          setShippingError('تم تطبيق سعر الشحن الدولي الافتراضي.');
        })
        .finally(() => {
          setIsCalculatingShipping(false);
        });
    }
  }, [form.country, form.city, items.length]);

  useEffect(() => {
    const phoneClean = (form.phone || '').trim();
    if (phoneClean.length >= 7) {
      const delayDebounce = setTimeout(() => {
        fetch(`/api/loyalty/member/${encodeURIComponent(phoneClean)}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setLoyaltyInfo(data);
            else setLoyaltyInfo({ points: 0 });
          })
          .catch(() => setLoyaltyInfo({ points: 0 }));
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setLoyaltyInfo({ points: 0 });
      setUsePoints(false);
    }
  }, [form.phone]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const formatPrice = (n) => {
    return format(n);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}&subtotal=${totalPrice}`);
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'كود الخصم غير صحيح أو منتهي');
        setCouponApplied(null);
      } else if (data.valid) {
        setCouponApplied(data);
        setCouponError('');
      }
    } catch (err) {
      console.error(err);
      setCouponError('حدث خطأ أثناء التحقق من الكوبون');
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = couponApplied 
    ? (couponApplied.discountType === 'percent' 
        ? (totalPrice * (couponApplied.discountValue / 100)) 
        : couponApplied.discountValue)
    : 0;

  const loyalty_redeem_ratio = parseFloat(storeSettings?.loyalty_redeem_ratio) || 0.01;
  const loyalty_min_points = parseInt(storeSettings?.loyalty_min_points, 10) || 100;
  
  const canRedeem = loyaltyInfo.points >= loyalty_min_points;
  const maxPossibleDiscount = Math.max(0, totalPrice - discountAmount);
  const pointsToRedeem = Math.min(loyaltyInfo.points, Math.floor(maxPossibleDiscount / loyalty_redeem_ratio));
  const pointsDiscountAmount = (usePoints && canRedeem) ? (pointsToRedeem * loyalty_redeem_ratio) : 0;

  const giftFee = isGift ? (giftPackaging === 'silk_wrap' ? 5 : (giftPackaging === 'premium_box' ? 3 : 0)) : 0;
  const subtotalAfterDiscount = Math.max(0, totalPrice - discountAmount - pointsDiscountAmount);
  // Calculate final price including shipping fee
  const finalPrice = subtotalAfterDiscount + giftFee + shippingFee;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let interval;
    if (step === 'success' && orderId) {
      setTimeRemaining(prev => prev === 0 ? 120 : prev);

      const syncWithServer = async () => {
        try {
          const res = await fetch(`/api/order-status/${orderId}`);
          const data = await res.json();
          if (data.status) setOrderStatus(data.status);

          if (typeof data.seconds_left === 'number'
              && data.status !== 'ready' && data.status !== 'completed') {
            setTimeRemaining(data.seconds_left > 0 ? data.seconds_left : 0);
          }
        } catch (err) {
          console.error('Sync Error:', err);
        }
      };

      syncWithServer();
      interval = setInterval(syncWithServer, 3000);
    }
    return () => clearInterval(interval);
  }, [step, orderId]);

  useEffect(() => {
    if (step === 'success' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeRemaining]);

  function formatCardNumber(v) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(v) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return d;
  }

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = formatCardNumber(value);
    if (name === 'expiry') value = formatExpiry(value);
    if (name === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: '' }));
  }

  function validate() {
    const e = {};
    const safeName = (form.name || '').trim();
    const safeEmail = (form.email || '').trim();
    const safePhone = (form.phone || '').trim();

    if (!safeName) e.name = 'الاسم الكامل مطلوب';
    
    if (!safePhone) {
      e.phone = 'رقم الهاتف مطلوب';
    } else if (!/^\+?[\d\s\-().]{7,20}$/.test(safePhone)) {
      e.phone = 'رقم هاتف غير صحيح (يقبل الأرقام الدولية مع رمز +)';
    }

    if (safeEmail && !safeEmail.includes('@')) {
      e.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (orderType === 'delivery') {
      if (!(form.country || '').trim()) e.country = 'يرجى اختيار الدولة';
      if (!(form.city || '').trim()) e.city = 'يرجى إدخال المدينة';
      if (!(form.address || '').trim()) e.address = 'يرجى إدخال تفاصيل العنوان';
      
      if (form.country && form.country !== 'الأردن' && form.paymentMethod === 'cod') {
        e.paymentMethod = 'الدفع عند الاستلام متاح فقط داخل الأردن. يرجى اختيار الدفع بالتحويل البنكي أو المحفظة.';
      }
    }

    if (['cliq', 'wallet', 'transfer'].includes(form.paymentMethod) && !(form.transferReceipt || '').trim()) {
      e.transferReceipt = 'يرجى إدخال رقم الحوالة المرجعي لتأكيد الدفع';
    }

    // Card payment is processed via Stripe Checkout session redirect, so no local fields validation is needed

    setErrors(e);
    return Object.keys(e).length === 0;
  }

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
            id: item.productId, // Use pure productId
            name: `${item.name} (${item.size})`,
            qty: item.qty,
            priceNum: item.priceNum
          })),
          order_type: 'delivery',
          delivery_address: `الدولة: ${form.country} - المدينة: ${form.city}${form.state ? ' / ' + form.state : ''} - المنطقة: ${form.area} - تفاصيل: ${form.address} | طريقة الدفع: ${
            form.paymentMethod === 'cod' ? 'عند الاستلام' : 
            form.paymentMethod === 'card' ? 'بطاقة ائتمانية (Visa/MasterCard)' :
            form.paymentMethod === 'cliq' ? ('تحويل كليك - رقم الحوالة: ' + form.transferReceipt) :
            ('محفظة إلكترونية/تحويل بنكي - رقم الحوالة: ' + form.transferReceipt)
          } | رسوم التوصيل: ${shippingFee} JOD`,
          phone: form.phone.trim(),
          coupon_code: couponApplied ? couponApplied.code : null,
          redeem_points: (usePoints && canRedeem) ? pointsToRedeem : 0,
          points_discount: pointsDiscountAmount,
          is_gift: isGift ? 1 : 0,
          gift_message: giftMessage,
          gift_packaging: giftPackaging,
          gift_fee: giftFee
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
        setTimeRemaining(120);
        return 'success';
      }
      return 'error';
    } catch (error) {
      console.error('API Error:', error);
      return 'error';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (['cod', 'cliq', 'wallet', 'transfer'].includes(form.paymentMethod)) {
      await new Promise(r => setTimeout(r, 1500));
      const resultStatus = await saveOrderToBackend();

      if (resultStatus === 'success') {
        // Send EmailJS Confirmation
        try {
           sendOrderConfirmationEmail(form.email.trim(), orderId || 'جديد', items, finalPrice);
        } catch(e) {}
        
        clearCart();
        setStep('success');

        // Save profile
        try {
          const raw = localStorage.getItem('yafa_profiles');
          let profiles = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(profiles)) profiles = [];
          const newProfile = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            city: form.city,
            area: form.area,
            address: form.address
          };
          profiles = profiles.filter(p => p.name.toLowerCase() !== newProfile.name.toLowerCase());
          profiles.unshift(newProfile);
          if (profiles.length > 10) profiles = profiles.slice(0, 10);
          localStorage.setItem('yafa_profiles', JSON.stringify(profiles));
        } catch(e) {}

        // Submit feedback if given
        if (storeComment.trim()) {
          fetch('/api/feedback/general', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reviewer_name: form.name.trim() || 'عميلة',
              comment: storeComment,
              rating: storeRating
            })
          }).catch(err => console.error('Feedback error:', err));
        }
      } else if (resultStatus === 'outofstock') {
        setStep('outofstock');
      } else {
        setStep('error');
      }
    } else if (form.paymentMethod === 'card') {
      // Card payment via Stripe Checkout Session
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: form.name.trim(),
            email: form.email.trim() || null,
            total_amount: finalPrice,
            cartItems: items.map(item => ({
              id: item.productId,
              name: `${item.name} (${item.size})`,
              qty: item.qty,
              priceNum: item.priceNum
            })),
            order_type: 'delivery',
            delivery_address: `الدولة: ${form.country} - المدينة: ${form.city}${form.state ? ' / ' + form.state : ''} - المنطقة: ${form.area} - تفاصيل: ${form.address}`,
            phone: form.phone.trim(),
            coupon_code: couponApplied ? couponApplied.code : null,
            currency: currency.code,
            redeem_points: (usePoints && canRedeem) ? pointsToRedeem : 0,
            points_discount: pointsDiscountAmount,
            is_gift: isGift ? 1 : 0,
            gift_message: giftMessage,
            gift_packaging: giftPackaging,
            gift_fee: giftFee
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment session');
        }

        if (data.mock) {
          // Sandbox Mode
          await new Promise(r => setTimeout(r, 2000));
          const resultStatus = await saveOrderToBackend();
          if (resultStatus === 'success') {
            clearCart();
            setStep('success');
          } else if (resultStatus === 'outofstock') {
            setStep('outofstock');
          } else {
            setStep('error:' + (resultStatus === 'error' ? 'حدث خطأ غير معروف' : resultStatus));
          }
        } else if (data.url) {
          // Redirect to Stripe Checkout page
          window.location.href = data.url;
        } else {
          setStep('error');
        }
      } catch (error) {
        console.error('Stripe Redirect Error:', error);
        setStep('error');
      }
    }
  }

  if (step === 'success') {
    return (
      <div className={styles.overlay} onClick={onClose} style={{ direction: 'rtl' }}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ borderRadius: '30px', overflow: 'hidden' }}>
          <div className={styles.modalBody} style={{ padding: '40px 30px', textAlign: 'center', background: 'var(--bg-surface)' }}>
            
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <div className={styles.successRing}>
                <div className={styles.ringInner} style={{ borderColor: 'var(--gold)' }} />
                <div className={styles.ringOuter} style={{ borderColor: 'var(--gold-glow)' }} />
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-gold)', zIndex: 2
                }}>
                  <Check size={40} style={{ color: 'var(--espresso)' }} />
                </div>
              </div>
              <h2 style={{ fontFamily: "var(--font-primary)", fontSize: '2.2rem', color: 'var(--gold-dim)', margin: '20px 0 10px', fontWeight: '900' }}>تم تسجيل طلبكِ بنجاح!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>شكراً لكِ لتسوقكِ من زهرة بيسان. طلبكِ رقم <strong>#{orderId}</strong> قيد التجهيز وسيصلكِ قريباً.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '30px', color: 'var(--gold-dim)', fontSize: '1rem', fontWeight: 'bold' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.5s infinite' }} />
              حالة الطلب الحالية: <span style={{ color: 'var(--espresso)' }}>{orderStatus === 'preparing' ? 'قيد التجهيز والتغليف' : orderStatus}</span>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{
              width: '100%', padding: '20px', borderRadius: '18px',
              background: 'var(--gold)', color: 'var(--espresso)', border: 'none',
              fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)'
            }}>
              العودة للمعرض
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'outofstock') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(250, 248, 245, 0.98)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--espresso)', textAlign: 'center', padding: '30px',
        animation: 'fadeIn 0.5s ease',
        direction: 'rtl'
      }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-dim), var(--gold))',
            borderRadius: '2px',
            marginBottom: '30px'
          }} />

          <div style={{ 
            color: 'var(--gold-dim)', 
            marginBottom: '25px', 
            display: 'flex', 
            justifyContent: 'center'
          }}>
            <AlertTriangle size={85} strokeWidth={1} />
          </div>

          <h2 style={{ 
            fontFamily: "var(--font-primary)", 
            fontSize: '2.2rem', 
            marginBottom: '20px', 
            color: 'var(--gold-dim)'
          }}>
            نفدت الكمية المطلوبة
          </h2>

          <p style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.75', 
            opacity: 0.9, 
            marginBottom: '35px', 
            color: 'var(--text-secondary)'
          }}>
            عذراً، يبدو أن أحد الموديلات في سلتكِ قد نفد للتو من المخزون أثناء إتمام الطلب.
          </p>

          <div style={{ 
            padding: '25px', 
            border: '1px solid var(--border)', 
            borderRadius: '22px', 
            backgroundColor: 'var(--gold-glow)',
            boxShadow: 'var(--shadow-gold)',
            marginBottom: '35px',
            textAlign: 'right'
          }}>
            <p style={{ 
              fontWeight: '900', 
              fontSize: '0.85rem', 
              letterSpacing: '1px', 
              marginBottom: '12px', 
              color: 'var(--gold-dim)'
            }}>
              تفاصيل المخزون:
            </p>
            <div style={{ 
              fontSize: '1rem', 
              color: 'var(--espresso)', 
              lineHeight: '1.6',
              background: 'var(--bg-surface)',
              padding: '12px 15px',
              borderRadius: '12px',
              borderRight: '4px solid var(--gold)'
            }}>
              {outOfStockError || 'المنتج المطلوب غير متوفر بالكمية المحددة حالياً.'}
            </div>
          </div>

          <button 
            onClick={() => {
              setStep('form');
              if (onBack) onBack();
            }} 
            style={{
              width: '100%', 
              padding: '18px', 
              borderRadius: '18px',
              background: 'var(--gold)', 
              color: 'var(--espresso)', 
              border: 'none',
              fontWeight: '900', 
              fontSize: '1.1rem', 
              cursor: 'pointer',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            تعديل السلة والمحاولة مجدداً
          </button>
        </div>
      </div>
    );
  }

  if (step && step.startsWith('error')) {
    const errorMsg = step.replace('error', '').replace(':', '') || 'لم نتمكن من معالجة طلبكِ. يرجى التأكد من البيانات والمحاولة مجدداً.';
    return (
      <div className={styles.overlay} onClick={() => setStep('form')} style={{ direction: 'rtl' }}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className={styles.errorScreen} style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '20px' }}>
              <i className="fas fa-exclamation-circle" />
            </div>
            <h2 style={{ fontSize: '2rem', color: 'var(--gold-dim)', marginBottom: '10px' }}>حدث خطأ ما</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', wordBreak: 'break-word' }}>{errorMsg}</p>
            <button
              className="btn btn-primary"
              onClick={() => setStep('form')}
              style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'var(--gold)', color: 'var(--espresso)', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              حسناً، المحاولة مرة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className={styles.overlay} style={{ direction: 'rtl' }}><div className={styles.modal} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className={styles.processingScreen} style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div className={styles.spinner} style={{ margin: '0 auto 20px', borderTopColor: 'var(--gold)' }} />
          <p style={{ fontSize: '1.2rem', color: 'var(--gold-dim)', fontWeight: 'bold' }}>جاري تسجيل وإرسال طلبكِ الفاخر...</p>
        </div>
      </div></div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose} style={{ direction: 'rtl' }}>
      <div className={`${styles.modal} ${styles.mainModal}`} onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className={styles.modalHead} style={{ borderBottom: '1px solid var(--border)' }}>
          <button className={styles.backBtn} onClick={onBack} style={{ color: 'var(--gold-dim)' }}>
            <i className="fas fa-arrow-right" /> رجوع للسلة
          </button>
          <h2 className={styles.modalTitle} style={{ color: 'var(--gold-dim)', fontFamily: 'var(--font-primary)' }}>الدفع وإتمام الطلب</h2>
          <button className={styles.closeBtn} onClick={onClose} style={{ color: 'var(--gold-dim)' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* 1. Order Summary Section */}
          <div className={styles.orderSummary} style={{ padding: '20px', backgroundColor: 'var(--gold-glow)', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <div className={styles.summaryLabel} style={{ marginBottom: '15px', color: 'var(--gold-dim)', fontWeight: '900', fontSize: '0.9rem' }}>ملخص الطلب</div>
            {items.map(item => (
              <div key={item.id} className={styles.sumItem} style={{ marginBottom: '8px', borderBottom: '1px solid var(--divider)' }}>
                <span style={{ color: 'var(--espresso)' }}>{item.name} × {item.qty} {item.size && `(${item.size})`}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--gold-dim)' }}>{formatPrice(item.priceNum * item.qty)}</span>
              </div>
            ))}
            
            {couponApplied && (
              <div className={styles.sumItem} style={{ color: '#27ae60', fontWeight: 'bold', marginTop: '10px' }}>
                <span>خصم الكوبون ({couponApplied.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            {pointsDiscountAmount > 0 && (
              <div className={styles.sumItem} style={{ color: '#c5a880', fontWeight: 'bold', marginTop: '5px' }}>
                <span>خصم نقاط الولاء ({pointsToRedeem} نقطة)</span>
                <span>-{formatPrice(pointsDiscountAmount)}</span>
              </div>
            )}

            <div className={styles.sumItem} style={{ marginTop: '5px' }}>
              <span>رسوم الشحن والتوصيل</span>
              {isCalculatingShipping ? (
                <span style={{ color: 'var(--gold-dim)' }}>جاري الحساب...</span>
              ) : (
                <span style={{ color: (!form.city.trim() || shippingFee === 0) ? 'var(--espresso-dim)' : 'var(--espresso)', fontWeight: shippingFee > 0 ? 'bold' : 'normal', fontSize: (!form.city.trim() || shippingFee === 0) ? '0.8rem' : '1rem' }}>
                  {!form.city.trim() ? 'يُحسب بعد إدخال المدينة' : (shippingFee === 0 ? 'مجاني' : `+${formatPrice(shippingFee)}`)}
                </span>
              )}
            </div>

            {isGift && giftFee > 0 && (
              <div className={styles.sumItem} style={{ color: '#c5a880', marginTop: '5px' }}>
                <span>رسوم التغليف الفاخر ({giftPackaging === 'silk_wrap' ? 'تغليف حرير ملكي' : 'كرتونة فاخرة'})</span>
                <span style={{ fontWeight: 'bold' }}>+{formatPrice(giftFee)}</span>
              </div>
            )}

            <div className={styles.sumTotal} style={{ marginTop: '15px', borderTop: '1px dashed var(--border-hover)', paddingTop: '15px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--espresso)' }}>المجموع الكلي</span>
              <span className={styles.sumTotalAmt} style={{ color: 'var(--gold-dim)' }}>{formatPrice(finalPrice)}</span>
            </div>
          </div>

          {/* 2. Coupon Validation */}
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <label className={styles.label} style={{ color: 'var(--gold-dim)', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>هل لديكِ كوبون خصم؟</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="أدخلي كود الخصم (مثال: VIP10)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                className={styles.input}
                style={{ flex: 1, textTransform: 'uppercase', background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                disabled={!!couponApplied}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="btn"
                style={{ background: 'var(--gold)', color: 'var(--espresso)', fontWeight: 'bold', padding: '0 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                disabled={couponLoading || !!couponApplied}
              >
                {couponLoading ? 'جاري التحقق...' : 'تطبيق'}
              </button>
            </div>
            {couponError && <p style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '5px', fontWeight: 'bold' }}>{couponError}</p>}
            {couponApplied && (
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#27ae60', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> تم تطبيق الكود بنجاح: خصم بقيمة {couponApplied.discountValue}{couponApplied.discountType === 'percent' ? '%' : ' JOD'}
                </p>
                <button
                  type="button"
                  onClick={() => { setCouponApplied(null); setCouponCode(''); }}
                  style={{ background: 'none', border: 'none', color: '#dc3545', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  إلغاء الكوبون
                </button>
              </div>
            )}
          </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
            
            {/* Delivery Details — Online store only: always delivery */}
            <div className={styles.formSection} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <label className={styles.label} style={{ fontSize: '1.1rem', color: 'var(--gold-dim)', marginBottom: '15px', display: 'block', fontWeight: '800', textAlign: 'center' }}>عنوان التوصيل</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '18px', padding: '12px', borderRadius: '12px', background: 'var(--gold-glow)', border: '1px solid var(--border)' }}>
                <i className="fas fa-globe" style={{ fontSize: '1.3rem', color: 'var(--gold)' }} />
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--espresso)', fontSize: '0.95rem' }}>توصيل دولي لجميع دول العالم</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--espresso-dim)' }}>نشحن إلى أي مكان حول العالم — تسوقي بلا حدود</div>
                </div>
              </div>
              {(
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--espresso)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      cursor: isLocating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background 0.2s',
                      marginBottom: '10px'
                    }}
                  >
                    <i className="fas fa-map-marker-alt" />
                    {isLocating ? 'جاري تحديد الموقع...' : 'تحديد موقعي تلقائياً 📍'}
                  </button>
                  {locationError && <p style={{ color: '#dc3545', fontSize: '0.8rem', textAlign: 'center', marginTop: '-5px' }}>{locationError}</p>}

                  {/* Country Custom Dropdown */}
                  <div className={styles.field} ref={countrySelectRef} style={{ position: 'relative' }}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>الدولة <span style={{ color: 'red' }}>*</span></label>
                    <div
                      onClick={() => setShowCountrySelect(v => !v)}
                      className={styles.input}
                      style={{
                        background: 'var(--white)',
                        border: '1px solid rgba(196,164,132,0.3)',
                        color: 'var(--espresso)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(() => {
                          const currentCountryObj = WORLD_COUNTRIES.find(c => c.name === form.country);
                          if (currentCountryObj && currentCountryObj.iso) {
                            return (
                              <img
                                src={getFlagUrl(currentCountryObj.iso)}
                                alt={currentCountryObj.name}
                                style={{ width: '22px', height: '16px', objectFit: 'cover', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                              />
                            );
                          }
                          return null;
                        })()}
                        <span>{form.country || 'اختر الدولة'}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                    </div>

                    {showCountrySelect && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        zIndex: 9999,
                        maxHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        marginTop: '5px',
                        direction: 'rtl'
                      }}>
                        {/* Search field */}
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                          <input
                            type="text"
                            placeholder="ابحثي عن الدولة..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid rgba(196,164,132,0.3)',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              outline: 'none',
                              direction: 'rtl',
                              background: '#fff',
                              color: 'var(--espresso)'
                            }}
                          />
                        </div>
                        {/* Country Options */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                          {WORLD_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                            .map(c => (
                              <div
                                key={c.name}
                                onClick={() => {
                                  const isJo = c.name === 'الأردن';
                                  setForm(f => ({
                                    ...f,
                                    country: c.name,
                                    paymentMethod: isJo ? f.paymentMethod : 'transfer'
                                  }));
                                  setErrors(err => ({ ...err, country: '' }));
                                  setShowCountrySelect(false);
                                  setCountrySearch('');
                                }}
                                style={{
                                  padding: '10px 16px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  fontSize: '0.9rem',
                                  color: 'var(--espresso)',
                                  background: form.country === c.name ? 'var(--gold-glow)' : 'transparent',
                                  transition: 'background 0.2s',
                                  textAlign: 'right'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                                onMouseLeave={e => e.currentTarget.style.background = form.country === c.name ? 'var(--gold-glow)' : 'transparent'}
                              >
                                {c.iso && (
                                  <img
                                    src={getFlagUrl(c.iso)}
                                    alt={c.name}
                                    style={{ width: '22px', height: '16px', objectFit: 'cover', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                                  />
                                )}
                                <span style={{ flex: 1 }}>{c.name}</span>
                                {form.country === c.name && <Check size={16} style={{ color: 'var(--gold)' }} />}
                              </div>
                            ))}
                          {WORLD_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>
                              لا توجد نتائج مطابقة
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {errors.country && <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '4px' }}>{errors.country}</p>}
                  </div>

                  {/* State / Province */}
                  <div className={styles.field}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>الولاية / المحافظة <span style={{ color: '#888', fontSize: '0.75rem' }}>(اختياري)</span></label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="مثال: California, محافظة الرياض، Yorkshire"
                      className={styles.input}
                      style={{ background: 'var(--white)', border: '1px solid rgba(196,164,132,0.3)', color: 'var(--espresso)' }}
                    />
                  </div>

                  {/* City */}
                  <div className={styles.field} ref={citySelectRef} style={{ position: 'relative' }}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>المدينة <span style={{ color: 'red' }}>*</span></label>
                    {countryCities.length > 0 ? (
                      <>
                        <div
                          onClick={() => setShowCitySelect(v => !v)}
                          className={styles.input}
                          style={{
                            background: 'var(--white)',
                            border: '1px solid rgba(196,164,132,0.3)',
                            color: 'var(--espresso)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '8px',
                          }}
                        >
                          <span>{form.city || 'اختر المدينة'}</span>
                          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                        </div>

                        {showCitySelect && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            zIndex: 9999,
                            maxHeight: '250px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginTop: '5px',
                            direction: 'rtl'
                          }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                              <input
                                type="text"
                                placeholder="ابحثي عن المدينة..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%', padding: '8px 12px', border: '1px solid rgba(196,164,132,0.3)',
                                  borderRadius: '8px', fontSize: '0.85rem', outline: 'none', direction: 'rtl',
                                  background: '#fff', color: 'var(--espresso)'
                                }}
                              />
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                              {countryCities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                                .map(c => (
                                  <div
                                    key={c.name}
                                    onClick={() => {
                                      setForm(f => ({ ...f, city: c.name }));
                                      setErrors(err => ({ ...err, city: '' }));
                                      setShowCitySelect(false);
                                      setCitySearch('');
                                    }}
                                    style={{
                                      padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                      justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--espresso)',
                                      background: form.city === c.name ? 'var(--gold-glow)' : 'transparent',
                                      transition: 'background 0.2s', textAlign: 'right'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                                    onMouseLeave={e => e.currentTarget.style.background = form.city === c.name ? 'var(--gold-glow)' : 'transparent'}
                                  >
                                    <span>{c.name}</span>
                                    {form.city === c.name && <Check size={16} style={{ color: 'var(--gold)' }} />}
                                  </div>
                                ))}
                              {countryCities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>
                                  لا توجد نتائج مطابقة
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="مثال: عمان، London, Dubai, New York"
                        className={styles.input}
                        style={{ background: 'var(--white)', border: '1px solid rgba(196,164,132,0.3)', color: 'var(--espresso)' }}
                      />
                    )}
                    {errors.city && <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '4px' }}>{errors.city}</p>}
                  </div>

                  {/* Area */}
                  <div className={styles.field}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>الحي / المنطقة <span style={{ color: '#888', fontSize: '0.75rem' }}>(اختياري)</span></label>
                    <input
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="مثال: الجاردنز، Chelsea, Downtown"
                      className={styles.input}
                      style={{ background: 'var(--white)', border: '1px solid rgba(196,164,132,0.3)', color: 'var(--espresso)' }}
                    />
                  </div>

                  {/* Full Address */}
                  <div className={styles.field}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>العنوان بالتفصيل <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="مثال: 123 Main Street, Apt 4B"
                      className={styles.input}
                      style={{ background: 'var(--white)', border: '1px solid rgba(196, 164, 132, 0.3)', color: 'var(--espresso)', minHeight: '60px', resize: 'vertical' }}
                    />
                    {errors.address && <p style={{ color: '#dc3545', fontSize: '0.75rem' }}>{errors.address}</p>}
                  </div>
                </div>
              )}

            </div>

            {/* Contact Details */}
            <div className={styles.formSection} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <h4 style={{ color: 'var(--gold-dim)', marginBottom: '15px' }}>معلومات الاتصال</h4>
              <div className={styles.field} style={{ marginBottom: '15px' }}>
                <label className={styles.label} style={{ color: 'var(--espresso)' }}>الاسم الكامل <span style={{ color: 'red' }}>*</span></label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="الرجاء كتابة الاسم الكامل"
                  style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                />
                {errors.name && <p style={{ color: '#dc3545', fontSize: '0.75rem' }}>{errors.name}</p>}
              </div>

              <div className={styles.field} style={{ marginBottom: '15px' }}>
                <label className={styles.label} style={{ color: 'var(--espresso)' }}>رقم الهاتف <span style={{ color: 'red' }}>*</span></label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="مثال: 0791234567"
                  style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                />
                {errors.phone && <p style={{ color: '#dc3545', fontSize: '0.75rem' }}>{errors.phone}</p>}
              </div>

              {loyaltyInfo.points > 0 && (
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(197,168,128,0.1) 0%, rgba(197,168,128,0.02) 100%)',
                  border: '1px solid rgba(197,168,128,0.3)',
                  marginBottom: '20px',
                  animation: 'fadeIn 0.4s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--gold-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✨ {loyaltyInfo.customer_name ? `مرحباً بكِ ${loyaltyInfo.customer_name}` : 'رصيد نقاط الولاء'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#fff', background: 'rgba(197,168,128,0.2)', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                      {loyaltyInfo.points} نقطة
                    </span>
                  </div>
                  
                  {canRedeem ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '0.82rem', color: 'var(--espresso)' }}>
                      <input 
                        type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--gold-dim)' }}
                      />
                      استبدال {pointsToRedeem} نقطة للحصول على خصم بقيمة <strong>{formatPrice(pointsDiscountAmount)}</strong>
                    </label>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#c5a880', opacity: 0.8 }}>
                      الحد الأدنى لاستبدال النقاط هو {loyalty_min_points} نقطة. اجمعي المزيد من النقاط مع كل طلب!
                    </div>
                  )}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label} style={{ color: 'var(--espresso)' }}>البريد الإلكتروني <span style={{ color: '#888', fontSize: '0.75rem' }}>(اختياري)</span></label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="example@domain.com"
                  style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                />
                {errors.email && <p style={{ color: '#dc3545', fontSize: '0.75rem' }}>{errors.email}</p>}
              </div>
            </div>

            {/* Gift Options Section - Temporarily Hidden per user request */}
            {false && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'right',
              direction: 'rtl'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: '0 0 12px 0' }}>
                <input 
                  type="checkbox" checked={isGift} onChange={e => {
                    setIsGift(e.target.checked);
                    if (e.target.checked && !giftPackaging) {
                      setGiftPackaging('premium_box');
                    }
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--gold-dim)' }}
                />
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--gold-dim)' }}>✨ هل ترغبين في إرسال الطلب كهدية؟</span>
              </label>

              {isGift && (
                <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label className={styles.label} style={{ color: 'var(--espresso)', marginBottom: '8px', display: 'block', fontSize: '0.82rem' }}>نوع تغليف الهدية:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button 
                        type="button"
                        onClick={() => setGiftPackaging('premium_box')}
                        style={{
                          padding: '14px', borderRadius: '12px',
                          border: `1px solid ${giftPackaging === 'premium_box' ? 'var(--gold-dim)' : 'var(--border)'}`,
                          background: giftPackaging === 'premium_box' ? 'rgba(197,168,128,0.1)' : 'var(--white)',
                          color: 'var(--espresso)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', transition: '0.2s'
                        }}
                      >
                        كرتونة فاخرة (+3 JOD)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setGiftPackaging('silk_wrap')}
                        style={{
                          padding: '14px', borderRadius: '12px',
                          border: `1px solid ${giftPackaging === 'silk_wrap' ? 'var(--gold-dim)' : 'var(--border)'}`,
                          background: giftPackaging === 'silk_wrap' ? 'rgba(197,168,128,0.1)' : 'var(--white)',
                          color: 'var(--espresso)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem', transition: '0.2s'
                        }}
                      >
                        تغليف حرير ملكي (+5 JOD)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label} style={{ color: 'var(--espresso)', marginBottom: '8px', display: 'block', fontSize: '0.82rem' }}>رسالة بطاقة الإهداء:</label>
                    <textarea 
                      value={giftMessage}
                      onChange={e => setGiftMessage(e.target.value)}
                      placeholder="اكتبي رسالة الإهداء التي سيتم إرفاقها مع الهدية داخل العبوة..."
                      style={{
                        width: '100%', height: '80px', padding: '12px', borderRadius: '12px',
                        border: '1px solid var(--border)', background: 'var(--white)',
                        color: 'var(--espresso)', outline: 'none', resize: 'none', fontSize: '0.82rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Policy Notice Box */}
            <div style={{
              background: 'rgba(196, 164, 132, 0.06)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'right',
              fontSize: '0.9rem',
              color: 'var(--espresso)',
              lineHeight: '1.6',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--gold-dim)', fontWeight: '800', fontSize: '1rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--gold)' }} />
                <span>سياسة التوصيل، التبديل والاسترجاع:</span>
              </div>
              <ul style={{ margin: 0, paddingRight: '20px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>الترجيع (الاسترجاع):</strong> خيار الاسترجاع <strong>غير متوفر نهائياً</strong> لجميع الطلبات.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>التبديل (الاستبدال):</strong> التبديل متاح <strong>داخل الأردن فقط</strong>. لا يوجد تبديل للطلبات خارج الأردن.
                </li>
                <li>
                  <strong>الدفع عند الاستلام:</strong> متوفر <strong>داخل الأردن فقط</strong>. للطلبات خارج الأردن، الدفع عبر الحوالة البنكية أو المحافظ الإلكترونية.
                </li>
              </ul>
            </div>

            {/* Payment Method Selection */}
            <div className={styles.formSection} style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <label className={styles.label} style={{ fontSize: '1.1rem', color: 'var(--gold-dim)', marginBottom: '15px', display: 'block', fontWeight: '800', textAlign: 'center' }}>طريقة الدفع</label>
              
              {errors.paymentMethod && (
                <p style={{ color: '#dc3545', fontSize: '0.85rem', textAlign: 'center', marginTop: '-5px', marginBottom: '15px', fontWeight: 'bold' }}>
                  {errors.paymentMethod}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {/* 1. Cash on Delivery */}
                <div
                  onClick={() => {
                    if (form.country === 'الأردن') {
                      setForm(f => ({ ...f, paymentMethod: 'cod' }));
                      setErrors(err => ({ ...err, paymentMethod: '' }));
                    }
                  }}
                  style={{
                    padding: '15px 10px', textAlign: 'center', borderRadius: '12px', cursor: form.country === 'الأردن' ? 'pointer' : 'not-allowed', transition: '0.3s',
                    border: form.paymentMethod === 'cod' && form.country === 'الأردن' ? '2px solid var(--gold)' : '2px solid var(--border)',
                    backgroundColor: form.country !== 'الأردن' ? 'var(--bg-elevated)' : (form.paymentMethod === 'cod' ? 'var(--gold-glow)' : 'var(--white)'),
                    color: form.country !== 'الأردن' ? 'var(--espresso-dim)' : 'var(--espresso)', fontWeight: 'bold', opacity: form.country === 'الأردن' ? 1 : 0.5
                  }}
                >
                  <Landmark size={22} style={{ margin: '0 auto 6px', color: form.paymentMethod === 'cod' && form.country === 'الأردن' ? 'var(--gold-dim)' : 'var(--espresso-dim)' }} />
                  <div style={{ fontSize: '0.85rem' }}>الدفع عند الاستلام</div>
                </div>

                {/* 2. Credit Card */}
                <div
                  onClick={() => {
                    setForm(f => ({ ...f, paymentMethod: 'card' }));
                    setErrors(err => ({ ...err, paymentMethod: '' }));
                  }}
                  style={{
                    padding: '15px 10px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
                    border: form.paymentMethod === 'card' ? '2px solid var(--gold)' : '2px solid var(--border)',
                    backgroundColor: form.paymentMethod === 'card' ? 'var(--gold-glow)' : 'var(--white)',
                    color: 'var(--espresso)', fontWeight: 'bold'
                  }}
                >
                  <CreditCard size={22} style={{ margin: '0 auto 6px', color: form.paymentMethod === 'card' ? 'var(--gold-dim)' : 'var(--espresso-dim)' }} />
                  <div style={{ fontSize: '0.85rem' }}>بطاقة ائتمانية</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--espresso-dim)' }}>Visa / MasterCard</div>
                </div>

                {/* 3. CliQ */}
                <div
                  onClick={() => {
                    setForm(f => ({ ...f, paymentMethod: 'cliq' }));
                    setErrors(err => ({ ...err, paymentMethod: '' }));
                  }}
                  style={{
                    padding: '15px 10px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
                    border: form.paymentMethod === 'cliq' ? '2px solid var(--gold)' : '2px solid var(--border)',
                    backgroundColor: form.paymentMethod === 'cliq' ? 'var(--gold-glow)' : 'var(--white)',
                    color: 'var(--espresso)', fontWeight: 'bold'
                  }}
                >
                  <Zap size={22} style={{ margin: '0 auto 6px', color: form.paymentMethod === 'cliq' ? 'var(--gold-dim)' : 'var(--espresso-dim)' }} />
                  <div style={{ fontSize: '0.85rem' }}>كليك (CliQ)</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--espresso-dim)' }}>تحويل فوري</div>
                </div>

                {/* 4. Wallet / Bank */}
                <div
                  onClick={() => {
                    setForm(f => ({ ...f, paymentMethod: 'wallet' }));
                    setErrors(err => ({ ...err, paymentMethod: '' }));
                  }}
                  style={{
                    padding: '15px 10px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', transition: '0.3s',
                    border: form.paymentMethod === 'wallet' ? '2px solid var(--gold)' : '2px solid var(--border)',
                    backgroundColor: form.paymentMethod === 'wallet' ? 'var(--gold-glow)' : 'var(--white)',
                    color: 'var(--espresso)', fontWeight: 'bold'
                  }}
                >
                  <CreditCard size={22} style={{ margin: '0 auto 6px', color: form.paymentMethod === 'wallet' ? 'var(--gold-dim)' : 'var(--espresso-dim)' }} />
                  <div style={{ fontSize: '0.85rem' }}>محفظة إلكترونية</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--espresso-dim)' }}>ZainCash / Umniah</div>
                </div>
              </div>

              {['cliq', 'wallet', 'transfer'].includes(form.paymentMethod) && (
                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--gold-glow)',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  color: 'var(--espresso)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  textAlign: 'right',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                    <i className="fas fa-university" style={{ color: 'var(--gold-dim)' }} />
                    <strong style={{ color: 'var(--gold-dim)', fontSize: '1.05rem' }}>بيانات التحويل ({form.paymentMethod === 'cliq' ? 'كليك CliQ' : 'المحفظة الإلكترونية / البنك'})</strong>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                    يرجى تحويل مبلغ الطلب الإجمالي ({formatPrice(finalPrice)}) إلى حسابنا أدناه، ثم إدخال رقم الحوالة لتأكيد طلبك:
                  </p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.7)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(196,164,132,0.2)' }}>
                    {form.paymentMethod === 'cliq' ? (
                      <div>
                        <span style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem', display: 'block' }}>اسم مستعار كليك (CliQ Alias):</span>
                        <strong style={{ fontSize: '1rem', letterSpacing: '1px' }}>{storeSettings?.cliqAlias || 'غير متوفر مؤقتاً'}</strong>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem', display: 'block' }}>المحفظة الإلكترونية (Zain Cash / Orange Money):</span>
                          <strong style={{ fontSize: '1rem', letterSpacing: '1px' }}>{storeSettings?.wallet || 'غير متوفر مؤقتاً'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem', display: 'block' }}>رقم الحساب البنكي (IBAN):</span>
                          <strong style={{ fontSize: '1rem', letterSpacing: '1px' }}>{storeSettings?.iban || 'غير متوفر مؤقتاً'}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.field} style={{ marginBottom: 0 }}>
                    <label className={styles.label} style={{ color: 'var(--espresso)' }}>الرقم المرجعي للحركة (Transfer Reference No.) <span style={{ color: 'red' }}>*</span></label>
                    <input
                      name="transferReceipt"
                      value={form.transferReceipt}
                      onChange={handleChange}
                      placeholder="أدخل الرقم المرجعي للحركة أو آخر 4 أرقام من رقمك"
                      className={styles.input}
                      style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--espresso)' }}
                    />
                    {errors.transferReceipt && <p style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>{errors.transferReceipt}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* General Feedback / Comments */}
            <div style={{ backgroundColor: 'var(--gold-glow)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--gold-dim)', fontSize: '1.1rem' }}>ملاحظات أو تعليقات إضافية للطلب:</h4>
              <textarea
                placeholder="اكتبي أي ملاحظات للتوصيل (مثال: يرجى الاتصال قبل الوصول...)"
                value={storeComment}
                onChange={(e) => setStoreComment(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--espresso)', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${styles.payBtn}`} 
              disabled={step === 'processing'}
              style={{
                background: 'var(--gold)',
                padding: '20px',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: '800',
                boxShadow: '0 10px 25px rgba(196, 164, 132, 0.2)',
                border: 'none',
                cursor: step === 'processing' ? 'not-allowed' : 'pointer',
                color: 'var(--espresso)',
                width: '100%',
                transition: 'all 0.3s',
                opacity: step === 'processing' ? 0.7 : 1
              }}
            >
              {step === 'processing' ? 'جاري إرسال الطلب...' : `تأكيد وإتمام الطلب بقيمة ${formatPrice(finalPrice)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}