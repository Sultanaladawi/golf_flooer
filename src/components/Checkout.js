import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, getSafeImageUrl, extractItemImage, FALLBACK_IMAGE_DATA_URI } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { trackPurchase } from '../utils/socialPixel';
import { trackStoreEvent } from '../utils/storeTracker';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import styles from './Checkout.module.css';
import { Sparkles, AlertTriangle, CreditCard, Landmark, Check, CheckCircle2, Zap, Truck, ShieldCheck, MapPin, Phone, User, X, Tag } from 'lucide-react';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { BILINGUAL_COUNTRIES, getCitiesForCountry, matchCountryFromAddress, getCountryIso, matchCityFromAddress } from '../utils/countryCityData';
import MapLocationPicker from './MapLocationPicker';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Checkout() {
  const navigate = useNavigate();
  const { customer, openLoginModal, login } = useCustomerAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { t, currentLang } = useLanguage();
  const { format: formatPrice } = useCurrency();
  const { showAlert, showToast } = useAlert();
  
  const [step, setStep] = useState('form');
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('preparing');

  useEffect(() => {
    if (customer && customer.email) {
      setForm(prev => ({
        ...prev,
        email: customer.email,
        name: prev.name || customer.name || ''
      }));
    }
  }, [customer]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const urlParams = new URLSearchParams(window.location.search);
    const tapId = urlParams.get('tap_id');
    const retOrderId = urlParams.get('order_id');
    if (tapId) {
      setStep('processing');
      if (retOrderId) setOrderId(retOrderId);
      fetch(`/api/tap/verify-charge/${tapId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.status === 'CAPTURED') {
            try {
              const pending = sessionStorage.getItem('zb_pending_tap_order');
              if (pending) {
                const payload = JSON.parse(pending);
                fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                }).then(r => r.json()).then(res => {
                  if (res.orderId) setOrderId(res.orderId);
                });
                sessionStorage.removeItem('zb_pending_tap_order');
              }
            } catch (_) {}
            clearCart();
            setStep('success');
            try { trackPurchase(data.charge?.amount || finalPrice, 'JOD'); } catch (_) {}
          } else {
            setStep('form');
            showAlert({
              title: 'لم تكتمل عملية الدفع',
              message: data.message || 'تم إلغاء عملية الدفع أو لم تتم الموافقة على البطاقة. يمكنكِ إعادة المحاولة أو اختيار وسيلة دفع أخرى.',
              type: 'warning'
            });
          }
        })
        .catch(() => {
          setStep('form');
          showAlert({
            title: 'تعذر التحقق من الدفع',
            message: 'حدث خطأ أثناء التحقق من حالة الدفع. يرجى التواصل معنا للتأكيد.',
            type: 'error'
          });
        });
      return;
    }

    const paytabsOrderId = urlParams.get('paytabs_order_id');
    if (paytabsOrderId) {
      setStep('processing');
      setOrderId(paytabsOrderId);
      fetch(`/api/paytabs/verify/${paytabsOrderId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.status === 'paid') {
            clearCart();
            setStep('success');
            try { trackPurchase(finalPrice, 'JOD'); } catch (_) {}
          } else {
            setStep('form');
            showAlert({
              title: 'تنبيه بوابة الدفع',
              message: 'لم تكتمل عملية الدفع أو تم إلغاؤها. سلة مشترياتك محفوظة.',
              type: 'warning'
            });
          }
        })
        .catch(() => {
          setStep('form');
        });
    }
  }, []);
  
  const isLocalEnvironment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.search.includes('enable_paytabs=true')
  );

  // 📍 MULTIPLE SAVED ADDRESSES BOOK
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('zb_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate legacy single saved address
      const legacy = localStorage.getItem('zb_customer_shipping_data');
      if (legacy) {
        const p = JSON.parse(legacy);
        if (p && (p.address || p.city)) {
          const initial = [{
            id: 'addr_' + Date.now(),
            label: p.area ? `${p.city || ''} - ${p.area}` : (p.city || 'العنوان الرئيسي'),
            country: p.country || 'الأردن',
            state: p.state || '',
            city: p.city || 'عمان',
            area: p.area || '',
            address: p.address || '',
            lat: p.lat || null,
            lng: p.lng || null
          }];
          localStorage.setItem('zb_saved_addresses', JSON.stringify(initial));
          return initial;
        }
      }
    } catch (e) {}
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const saved = localStorage.getItem('zb_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
      const legacy = localStorage.getItem('zb_customer_shipping_data');
      if (legacy) {
        const p = JSON.parse(legacy);
        if (p && (p.address || p.city)) return 'addr_default';
      }
    } catch (e) {}
    return 'new';
  });

  const [saveNewAddressOption, setSaveNewAddressOption] = useState(true);
  const [newAddressLabel, setNewAddressLabel] = useState('المنزل 🏠');

  const [form, setForm] = useState(() => {
    let customerName = '';
    let customerEmail = '';
    let customerPhone = '';
    let country = 'الأردن';
    let state = '';
    let city = '';
    let area = '';
    let address = '';
    let lat = null;
    let lng = null;

    try {
      const legacy = localStorage.getItem('zb_customer_shipping_data');
      if (legacy) {
        const p = JSON.parse(legacy);
        if (p) {
          customerName = p.name || '';
          customerEmail = p.email || '';
          customerPhone = p.phone || '';
        }
      }
      const saved = localStorage.getItem('zb_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          country = first.country || 'الأردن';
          state = first.state || '';
          city = first.city || '';
          area = first.area || '';
          address = first.address || '';
          lat = first.lat || null;
          lng = first.lng || null;
        }
      }
    } catch (e) {}

    return {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      country: country,
      state: state,
      city: city,
      area: area,
      address: address,
      lat: lat,
      lng: lng,
      googleMapsLink: (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : '',
      paymentMethod: isLocalEnvironment ? 'paytabs' : (country === 'الأردن' ? 'cod' : 'paypal'),
      transferReceipt: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
    };
  });

  const [selectedDialCode, setSelectedDialCode] = useState(() => {
    const matched = BILINGUAL_COUNTRIES.find(c => c.ar === form.country || c.en === form.country);
    return matched ? matched.dialCode : '+962';
  });

  const [phoneDigits, setPhoneDigits] = useState(() => {
    if (form.phone) {
      return form.phone.replace(/^\+\d+\s*/, '').trim();
    }
    return '';
  });

  // Sync dial code when destination country changes
  useEffect(() => {
    const matched = BILINGUAL_COUNTRIES.find(c => c.ar === form.country || c.en === form.country);
    if (matched && matched.dialCode) {
      setSelectedDialCode(matched.dialCode);
    }
  }, [form.country]);

  // Sync formatted full international phone number to form.phone
  useEffect(() => {
    const cleanDigits = phoneDigits.replace(/[^0-9]/g, '');
    if (cleanDigits) {
      setForm(prev => ({ ...prev, phone: `${selectedDialCode} ${cleanDigits}`.trim() }));
    } else {
      setForm(prev => ({ ...prev, phone: '' }));
    }
  }, [selectedDialCode, phoneDigits]);

  // 💾 Real-time tracker for customer info
  useEffect(() => {
    try {
      if (form.name.trim() || form.phone.trim() || form.email.trim()) {
        const toSave = {
          name: form.name,
          email: form.email,
          phone: form.phone
        };
        localStorage.setItem('zb_customer_shipping_data', JSON.stringify(toSave));

        trackStoreEvent('checkout_view', {
          stage: 'checkout_step',
          customer: { ...toSave, address: form.address, city: form.city, country: form.country },
          cartItems: items,
          cartTotal: totalPrice
        });
      }
    } catch (e) {}
  }, [form.name, form.email, form.phone, form.country, form.city, form.address, items, totalPrice]);

  // Handle selecting a saved address card
  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setForm(f => ({
      ...f,
      country: addr.country || 'الأردن',
      state: addr.state || '',
      city: addr.city || '',
      area: addr.area || '',
      address: addr.address || '',
      lat: addr.lat || null,
      lng: addr.lng || null,
      googleMapsLink: addr.googleMapsLink || (addr.lat && addr.lng ? `https://maps.google.com/?q=${addr.lat},${addr.lng}` : '')
    }));
    if (addr.country) {
      const cities = getCitiesForCountry(addr.country, currentLang);
      setCountryCities(cities);
    }
    setLocationError('');
    setLocationSuccess(`تم اختيار: ${addr.label || addr.city}`);
  };

  // Handle adding a fresh new address
  const handleAddNewAddressClick = () => {
    setSelectedAddressId('new');
    setForm(f => ({
      ...f,
      city: '',
      area: '',
      address: '',
      lat: null,
      lng: null,
      googleMapsLink: ''
    }));
    setLocationError('');
    setLocationSuccess('');
  };

  // Handle deleting a saved address
  const handleDeleteSavedAddress = (e, id) => {
    e.stopPropagation();
    try {
      const updated = savedAddresses.filter(a => a.id !== id);
      setSavedAddresses(updated);
      localStorage.setItem('zb_saved_addresses', JSON.stringify(updated));
      if (selectedAddressId === id) {
        if (updated.length > 0) {
          handleSelectSavedAddress(updated[0]);
        } else {
          handleAddNewAddressClick();
        }
      }
    } catch (err) {}
  };

  // Save current address to saved addresses book
  const saveCurrentAddressToBook = (customLabel) => {
    if (!form.city || !form.address) return;
    try {
      const existing = JSON.parse(localStorage.getItem('zb_saved_addresses') || '[]');
      const duplicateIndex = existing.findIndex(a => 
        (a.id === selectedAddressId && selectedAddressId !== 'new') ||
        (a.city === form.city && a.address === form.address && a.area === form.area)
      );

      const entry = {
        id: (selectedAddressId && selectedAddressId !== 'new') ? selectedAddressId : 'addr_' + Date.now(),
        label: customLabel || newAddressLabel || (form.area ? `${form.city} - ${form.area}` : `${form.city}`),
        country: form.country || 'الأردن',
        state: form.state || '',
        city: form.city,
        area: form.area || '',
        address: form.address,
        lat: form.lat || null,
        lng: form.lng || null,
        googleMapsLink: form.googleMapsLink || ''
      };

      let updated;
      if (duplicateIndex >= 0) {
        updated = [...existing];
        updated[duplicateIndex] = entry;
      } else {
        updated = [entry, ...existing];
      }
      localStorage.setItem('zb_saved_addresses', JSON.stringify(updated));
      setSavedAddresses(updated);
      setSelectedAddressId(entry.id);
      setLocationSuccess(`تم حفظ العنوان بنجاح: ${entry.label}`);
    } catch (e) {}
  };

  const [errors, setErrors] = useState({});
  const [storeComment, setStoreComment] = useState('');
  const [outOfStockError, setOutOfStockError] = useState(null);

  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

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
      setShippingFee(isAmman ? 2 : 3);
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

  // Location handler with GPS and seamless IP Geolocation fallback
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');
    setLocationSuccess('');

    const resolveLocation = async (lat, lon) => {
      try {
        let detectedCountry = form.country || 'الأردن';
        let detectedCity = form.city || '';
        let detectedArea = '';
        let detectedState = form.state || '';
        let cleanAddress = '';
        let finalLat = lat;
        let finalLng = lon;

        // BigDataCloud reverse geocode (with coordinates or via client IP automatically)
        try {
          const url = (lat && lon)
            ? `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`
            : `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=ar`;

          const bdcRes = await fetch(url);
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            if (bdcData && bdcData.countryName) {
              const cleanAr = (t) => (t || '').replace(/[\u064B-\u065F\u0670]/g, '').trim();
              detectedCountry = matchCountryFromAddress(cleanAr(bdcData.countryName)) || 'الأردن';
              const iso = getCountryIso(detectedCountry);
              const adminList = bdcData.localityInfo?.administrative || [];
              let district = '';
              for (let i = adminList.length - 1; i >= 0; i--) {
                const item = adminList[i];
                if (item.adminLevel >= 5 && item.name && !item.name.includes('الأردن')) {
                  district = cleanAr(item.name).replace(/^(لواء|قضاء|محافظة|ناحية)\s+/, '');
                  break;
                }
              }

              const mockData = {
                address: {
                  country: cleanAr(bdcData.countryName),
                  state: cleanAr(bdcData.principalSubdivision),
                  city: cleanAr(bdcData.city),
                  town: cleanAr(bdcData.locality),
                  suburb: district || bdcData.localityInfo?.administrative?.[3]?.name
                },
                display_name: [district, cleanAr(bdcData.locality), cleanAr(bdcData.principalSubdivision), cleanAr(bdcData.countryName)].filter(Boolean).join(', ')
              };
              detectedCity = matchCityFromAddress(mockData, iso) || cleanAr(bdcData.city || bdcData.locality) || 'عمان';
              detectedArea = district || (cleanAr(bdcData.locality) !== detectedCity ? cleanAr(bdcData.locality) : '') || '';
              detectedState = cleanAr(bdcData.principalSubdivision) || '';
              cleanAddress = [detectedArea && detectedArea !== detectedCity ? detectedArea : null, detectedCity, detectedState].filter(Boolean).join('، ');
              if (!finalLat && bdcData.latitude) finalLat = bdcData.latitude;
              if (!finalLng && bdcData.longitude) finalLng = bdcData.longitude;
            }
          }
        } catch (e) {
          console.warn('BigDataCloud geocoding error:', e);
        }

        const finalCountry = detectedCountry || form.country || 'الأردن';
        const finalCity = detectedCity || form.city || 'عمان';
        const finalArea = detectedArea || (detectedCity ? `حي ${detectedCity}` : 'وسط المدينة');
        const finalAddress = cleanAddress || `${finalArea}، ${finalCity}، ${finalCountry}`;

        // Instantly sync country cities
        if (finalCountry) {
          const cities = getCitiesForCountry(finalCountry, currentLang);
          if (cities && cities.length > 0) {
            setCountryCities(cities);
          }
        }

        setForm(f => ({
          ...f,
          country: finalCountry,
          state: detectedState || f.state,
          city: finalCity,
          area: finalArea,
          address: finalAddress,
          lat: finalLat || f.lat,
          lng: finalLng || f.lng,
          googleMapsLink: (finalLat && finalLng) ? `https://maps.google.com/?q=${finalLat},${finalLng}` : f.googleMapsLink
        }));

        setLocationError('');
        setLocationSuccess(`تم تحديد الموقع: ${finalCity} - ${finalArea}، ${finalCountry}`);
      } catch (err) {
        console.error('Location resolve error:', err);
        setLocationError('فشل في جلب المنطقة تلقائياً');
      } finally {
        setIsLocating(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolveLocation(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation fallback to IP:', err);
          // Seamless fallback to IP Geolocation without showing error
          resolveLocation(null, null);
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    } else {
      resolveLocation(null, null);
    }
  };

  const handleSelectLocationFromMap = (loc) => {
    setForm(f => ({
      ...f,
      country: loc.country || f.country,
      city: loc.city || f.city,
      area: loc.area || f.area,
      address: loc.address || f.address,
      lat: loc.lat,
      lng: loc.lng,
      googleMapsLink: loc.mapUrl
    }));
    setLocationError('');
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
    const cleanDigits = phoneDigits.replace(/[^0-9]/g, '');
    if (!cleanDigits || cleanDigits.length < 6) e.phone = 'يرجى كتابة رقم هاتف صحيح للتوصيل والواتساب';
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
        if (saveNewAddressOption) {
          try { saveCurrentAddressToBook(newAddressLabel); } catch(e){}
        }
        return 'success';
      }
      return 'error: فشل حفظ الطلب';
    } catch (error) {
      return 'error:' + error.message;
    }
  }

  // Submit handler for COD & Tap Payments
  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showAlert({
        title: 'يرجى استكمال البيانات',
        message: 'يرجى إدخال الاسم، رقم الهاتف، والمدينة وتفاصيل العنوان قبل إتمام الطلب.',
        type: 'warning'
      });
      return;
    }

    if (form.paymentMethod === 'cod') {
      setStep('processing');
      const resultStatus = await saveOrderToBackend();

      if (resultStatus === 'success') {
        try { 
          sendOrderConfirmationEmail(
            form.email.trim(), 
            orderId || 'جديد', 
            items, 
            finalPrice, 
            form.name, 
            `${form.country} - ${form.city} (${form.address})`, 
            form.phone
          ); 
          fetch('/api/cart/recovered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email.trim(), phone: form.phone.trim() })
          }).catch(() => {});
        } catch(e) {}
        clearCart();
        setStep('success');
      } else if (resultStatus === 'outofstock') {
        setStep('outofstock');
      } else {
        setStep(resultStatus.startsWith('error') ? resultStatus : 'error:' + resultStatus);
      }
    } else if (form.paymentMethod === 'paytabs') {
      setStep('processing');
      try {
        let endpoint = '/api/paytabs/create-payment';
        if (typeof window !== 'undefined' && window.location.port === '3000') {
          endpoint = `http://${window.location.hostname}:5000/api/paytabs/create-payment`;
        }

        const ptRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim(),
            country: form.country,
            city: form.city.trim(),
            delivery_address: `المنطقة: ${form.area} - تفاصيل: ${form.address}`,
            items: items.map(item => ({
              id: item.productId || item.id,
              name: `${item.name} (${item.size || 'حر'})`,
              qty: item.qty,
              priceNum: item.priceNum
            })),
            total_amount: finalPrice,
            shipping_fee: shippingFee
          })
        });

        let ptData = {};
        try {
          ptData = await ptRes.json();
        } catch (e) {
          ptData = { error: 'استجابة غير متوقعة من بوابة الدفع' };
        }

        if (ptRes.ok && ptData.success && ptData.redirect_url) {
          window.location.assign(ptData.redirect_url);
        } else {
          setStep('form');
          showAlert({
            title: 'تنبيه بوابة الدفع',
            message: ptData.error || 'تعذر بدء عملية الدفع عبر PayTabs/MEPS حالياً. يرجى التأكد من البيانات أو اختيار الدفع عند الاستلام.',
            type: 'warning'
          });
        }
      } catch (err) {
        setStep('form');
        showAlert({
          title: 'تعذر بدء الدفع',
          message: 'حدث خطأ في الاتصال. يرجى المحاولة مجدداً أو اختيار الدفع عند الاستلام.',
          type: 'error'
        });
      }
    }
  };

  const downloadInvoicePDF = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        window.print();
        return;
      }

      const invoiceItemsHtml = (items || []).map((item, idx) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; text-align: center; color: #777;">${idx + 1}</td>
          <td style="padding: 12px; font-weight: bold; color: #222; text-align: right;">
            ${item.name || 'عباية ملكية'}
            ${item.size ? `<span style="display: block; font-size: 11px; color: #888; font-weight: normal;">المقاس: ${item.size}</span>` : ''}
          </td>
          <td style="padding: 12px; text-align: center; color: #444;">${item.qty || 1}</td>
          <td style="padding: 12px; text-align: left; font-weight: 600; color: #222;">${(item.priceNum || 0).toFixed(2)} د.أ</td>
          <td style="padding: 12px; text-align: left; font-weight: bold; color: #a6865d;">${((item.priceNum || 0) * (item.qty || 1)).toFixed(2)} د.أ</td>
        </tr>
      `).join('');

      const orderNumber = orderId || 'ORD-' + Date.now().toString().slice(-6);
      const today = new Date().toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      const invoiceHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة شراء #${orderNumber} - بوتيك زهرة بيسان</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
            * { box-sizing: border-box; font-family: 'Cairo', sans-serif; }
            body { margin: 0; padding: 30px; background: #fff; color: #333; }
            .invoice-card { max-width: 750px; margin: 0 auto; border: 1.5px solid #d4af37; border-radius: 18px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f0e6d6; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #2c2523; }
            .logo span { color: #c5a880; font-size: 16px; margin-right: 8px; }
            .badge { background: #fbf8f3; color: #a6865d; border: 1px solid #d4af37; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #faf8f5; padding: 18px; border-radius: 12px; }
            .info-title { font-size: 11px; color: #888; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
            .info-val { font-size: 14px; font-weight: 700; color: #222; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { background: #2c2523; color: #d4af37; padding: 10px 12px; font-size: 13px; text-align: right; }
            th:first-child { border-top-right-radius: 8px; }
            th:last-child { border-top-left-radius: 8px; text-align: left; }
            .totals { width: 280px; margin-right: auto; background: #faf8f5; padding: 16px; border-radius: 12px; border: 1px solid #eee; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #666; }
            .totals-row.grand { border-top: 1.5px solid #d4af37; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #2c2523; }
            .footer-note { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ddd; font-size: 12px; color: #888; }
            @media print {
              body { padding: 0; }
              .invoice-card { border: none; box-shadow: none; max-width: 100%; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: linear-gradient(135deg, #c5a880, #a6865d); color: #fff; border: none; padding: 12px 30px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(197,168,128,0.4);">
              🖨️ طباعة الفاتورة أو حفظ كـ PDF
            </button>
          </div>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="logo">زهرة بيسان <span>ZAHRAT BEESAN</span></div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">بوتيك العبايات والفساتين الملكية الفاخرة</div>
              </div>
              <div style="text-align: left;">
                <div class="badge">فاتورة إلكترونية ضريبية معتمدة</div>
                <div style="font-size: 13px; font-weight: bold; color: #222; margin-top: 6px;">#${orderNumber}</div>
              </div>
            </div>

            <div class="info-grid">
              <div>
                <div class="info-title">بيانات العميلة</div>
                <div class="info-val">${form.name || 'عميلة زهرة بيسان'}</div>
                <div style="font-size: 12px; color: #666; margin-top: 2px;" dir="ltr">${form.phone || ''}</div>
                <div style="font-size: 12px; color: #666;">${form.email || ''}</div>
              </div>
              <div>
                <div class="info-title">تفاصيل التوصيل والشحن</div>
                <div class="info-val">${form.country || 'الأردن'} - ${form.city || 'عمان'}</div>
                <div style="font-size: 12px; color: #666; margin-top: 2px;">${form.address || ''}</div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">تاريخ الطلب: ${today}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">#</th>
                  <th>المنتج / الوصف</th>
                  <th style="text-align: center;">الكمية</th>
                  <th style="text-align: left;">سعر الوحدة</th>
                  <th style="text-align: left;">المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>المجموع الفرعي:</span>
                <span style="font-weight: 600;">${(finalPrice - shippingFee).toFixed(2)} د.أ</span>
              </div>
              <div class="totals-row">
                <span>رسوم التوصيل:</span>
                <span style="font-weight: 600;">${shippingFee.toFixed(2)} د.أ</span>
              </div>
              <div class="totals-row grand">
                <span>المبلغ الإجمالي:</span>
                <span style="color: #a6865d;">${finalPrice.toFixed(2)} د.أ</span>
              </div>
            </div>

            <div class="footer-note">
              <div>🌸 شكراً لتسوقكِ من بوتيك زهرة بيسان! نسعد دائماً بخدمتكِ.</div>
              <div style="margin-top: 4px; font-size: 11px; color: #aaa;">عمان، الأردن • هاتف: 0796697413 • www.zahratbeesan.com</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 350);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    } catch (e) {
      console.error('Invoice error:', e);
      window.print();
    }
  };

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
                onClick={downloadInvoicePDF}
                style={{
                  background: 'linear-gradient(135deg, #2c2523 0%, #1a1615 100%)',
                  color: '#d4af37',
                  border: '1.5px solid #d4af37',
                  padding: '16px 28px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📄 طباعة وتحميل الفاتورة الرسمية</span>
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
    return extractItemImage(item);
  };

  const isJordan = form.country === 'الأردن' || form.country === 'Jordan' || form.country === 'JO' || form.country === 'jo';

  // ── AUTH GATE: Require customer login / registration before checking out ──
  if (!customer) {
    return (
      <div className={styles.checkoutPageWrapper}>
        <Navbar />
        <main className={styles.mainContainer} style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '24px',
            padding: '40px 28px',
            boxShadow: '0 20px 50px rgba(197, 168, 128, 0.2)',
            border: '1.5px solid rgba(197, 168, 128, 0.35)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(197, 168, 128, 0.4)'
            }}>
              <User size={38} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-primary, serif)', fontSize: '1.75rem', color: 'var(--espresso)', margin: '0 0 10px' }}>
              تسجيل الدخول لإتمام الطلب 👑
            </h2>
            <p style={{ color: '#666', fontSize: '0.96rem', lineHeight: '1.7', marginBottom: '28px' }}>
              لتسجيل طلبكِ الملكي، وحفظ عناوينكِ وإرسال الفاتورة الرسمية وتتبع الشحنة مباشرة إلى بريدكِ الإلكتروني، يرجى تسجيل الدخول أو إنشاء حسابكِ أولاً.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    try {
                      const decoded = jwtDecode(credentialResponse.credential);
                      if (decoded && decoded.email) {
                        login({
                          email: decoded.email,
                          name: decoded.name || '',
                          picture: decoded.picture || ''
                        });
                      }
                    } catch (e) {}
                  }}
                  onError={() => console.log('Login Failed')}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '6px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                <span style={{ fontSize: '0.82rem', color: '#999' }}>أو بالبريد الإلكتروني</span>
                <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
              </div>

              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2c2523 0%, #1a1615 100%)',
                  color: '#d4af37',
                  border: '1.5px solid #d4af37',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <User size={18} />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>🔒</span>
              <span>بياناتكِ مشفرة ومحمية بأعلى معايير الأمان الملكية</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              {/* Logged in Customer Royal Badge */}
              <div style={{
                backgroundColor: 'rgba(197, 168, 128, 0.1)',
                border: '1.5px solid rgba(197, 168, 128, 0.35)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {customer.picture ? (
                    <img src={customer.picture} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--gold)' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--espresso)', fontSize: '0.95rem' }}>
                      {customer.name || 'عميلة زهرة بيسان'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {customer.email} (سيتم إرسال الفاتورة والتأكيد فوراً لهذا البريد 📧)
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', background: '#ffffff', color: 'var(--gold-dim)', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold', border: '1px solid rgba(197, 168, 128, 0.3)', whiteSpace: 'nowrap' }}>
                  حساب مؤكد ✅
                </span>
              </div>

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
                    <label className={styles.label}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={15} color="var(--gold-dim)" />
                        <span>رقم الهاتف / الواتساب *</span>
                      </span>
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      borderRadius: '12px',
                      border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid rgba(197, 168, 128, 0.45)',
                      backgroundColor: '#ffffff',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      direction: 'ltr',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}>
                      {/* Country Flag & Dial Code Selector */}
                      <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#faf8f5',
                        borderRight: '1.5px solid rgba(197, 168, 128, 0.35)',
                        padding: '0 12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        flexShrink: 0
                      }}>
                        <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>
                          {(BILINGUAL_COUNTRIES.find(c => c.dialCode === selectedDialCode) || BILINGUAL_COUNTRIES[0]).flag}
                        </span>
                        <span style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--espresso)' }}>
                          {selectedDialCode}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#999', marginLeft: '2px' }}>▼</span>
                        
                        <select
                          value={selectedDialCode}
                          onChange={(e) => setSelectedDialCode(e.target.value)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          {BILINGUAL_COUNTRIES.map((c, idx) => (
                            <option key={idx} value={c.dialCode}>
                              {c.flag} {c.ar} ({c.dialCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Digits Input */}
                      <input
                        type="tel"
                        className={styles.input}
                        style={{
                          border: 'none',
                          borderRadius: 0,
                          boxShadow: 'none',
                          flex: 1,
                          padding: '12px 14px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}
                        placeholder={(BILINGUAL_COUNTRIES.find(c => c.dialCode === selectedDialCode) || BILINGUAL_COUNTRIES[0]).placeholder || '79 123 4567'}
                        value={phoneDigits}
                        onChange={e => setPhoneDigits(e.target.value)}
                        dir="ltr"
                      />
                    </div>
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
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      style={{
                        background: 'none',
                        border: '1px solid var(--gold, #c5a880)',
                        color: 'var(--gold-dim, #9b723e)',
                        padding: '6px 12px',
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

                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      style={{
                        background: 'rgba(197, 168, 128, 0.12)',
                        border: '1px solid var(--gold-dim, #c5a880)',
                        color: 'var(--gold-dim, #9b723e)',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>🗺️</span>
                      <span>تحديد من الخريطة</span>
                    </button>
                  </div>
                </div>
                {locationError && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '-10px', marginBottom: '15px' }}>{locationError}</p>}
                {locationSuccess && <p style={{ color: '#16a34a', fontSize: '0.82rem', marginTop: '-10px', marginBottom: '15px', fontWeight: '600' }}>✓ {locationSuccess}</p>}

                {/* ── SAVED ADDRESSES SELECTOR CARDS ── */}
                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--espresso)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <span>📍</span>
                        <span>عناويني المحفوظة ({savedAddresses.length}):</span>
                      </label>
                      <span style={{ fontSize: '0.78rem', color: '#777' }}>
                        اضغطي على العنوان لاختياره فوراً
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                      gap: '12px'
                    }}>
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        const labelText = addr.label || 'المنزل 🏠';
                        const areaText = (addr.area && addr.area !== addr.city) ? `${addr.city} - ${addr.area}` : addr.city;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '14px',
                              border: isSelected ? '2px solid var(--gold, #c5a880)' : '1.5px solid #e5e5e5',
                              backgroundColor: isSelected ? 'rgba(197, 168, 128, 0.12)' : '#ffffff',
                              boxShadow: isSelected ? '0 4px 14px rgba(197, 168, 128, 0.25)' : '0 2px 6px rgba(0,0,0,0.02)',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.25s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              direction: 'rtl'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.88rem', color: isSelected ? 'var(--gold-dim, #9b723e)' : '#222', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{labelText}</span>
                                {isSelected && <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>}
                              </span>
                              <button
                                type="button"
                                title="حذف هذا العنوان"
                                onClick={(e) => handleDeleteSavedAddress(e, addr.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  padding: '2px 4px',
                                  opacity: 0.6,
                                  transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                              >
                                🗑️
                              </button>
                            </div>
                            {labelText !== areaText && (
                              <div style={{ fontSize: '0.82rem', color: '#444', fontWeight: '600' }}>
                                {areaText}
                              </div>
                            )}
                            <div style={{ fontSize: '0.76rem', color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {addr.address || `${addr.country}`}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add New Address Card */}
                      <div
                        onClick={handleAddNewAddressClick}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '14px',
                          border: selectedAddressId === 'new' ? '2px dashed var(--gold, #c5a880)' : '1.5px dashed #ccc',
                          backgroundColor: selectedAddressId === 'new' ? 'rgba(197, 168, 128, 0.08)' : '#fafafa',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          minHeight: '88px',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', color: 'var(--gold-dim, #9b723e)' }}>➕</span>
                        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: selectedAddressId === 'new' ? 'var(--gold-dim, #9b723e)' : '#555' }}>
                          إضافة عنوان جديد
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
                        {BILINGUAL_COUNTRIES.filter(c => c.ar.includes(countrySearch) || (c.en && c.en.toLowerCase().includes(countrySearch.toLowerCase()))).map((c, idx) => (
                          <div
                            key={c.iso || idx}
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
                            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{c.flag || '🌐'}</span>
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
                          <span>{(typeof form.city === 'object' ? (form.city.ar || form.city.name) : form.city) || 'اختاري المدينة...'}</span>
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
                            {countryCities.map((cityItem, idx) => {
                              const cityName = typeof cityItem === 'object' ? (currentLang === 'en' ? cityItem.en : cityItem.ar) : cityItem;
                              const cityValue = typeof cityItem === 'object' ? (cityItem.ar || cityItem.name) : cityItem;
                              return (
                                <div
                                  key={cityName || idx}
                                  onClick={() => {
                                    setForm({ ...form, city: cityValue });
                                    setShowCitySelect(false);
                                  }}
                                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: '0.9rem' }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.1)'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  {cityName}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="مثال: الرياض، دبي، المنامة..."
                        value={typeof form.city === 'object' ? (form.city.ar || form.city.name) : form.city}
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

                {/* 💾 Save Address to Book Controls */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(197, 168, 128, 0.08)',
                  border: '1px solid rgba(197, 168, 128, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: '700', color: 'var(--espresso)' }}>
                      <input
                        type="checkbox"
                        checked={saveNewAddressOption}
                        onChange={e => setSaveNewAddressOption(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--gold, #c5a880)', cursor: 'pointer' }}
                      />
                      <span>حفظ هذا العنوان في قائمة عناويني</span>
                    </label>

                    {saveNewAddressOption && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['المنزل 🏠', 'العمل 🏢', 'أخرى 📍'].map(lbl => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setNewAddressLabel(lbl)}
                            style={{
                              padding: '3px 9px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              border: newAddressLabel === lbl ? '1.5px solid var(--gold, #c5a880)' : '1px solid #ddd',
                              backgroundColor: newAddressLabel === lbl ? 'var(--gold, #c5a880)' : '#ffffff',
                              color: newAddressLabel === lbl ? '#ffffff' : '#555',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(form.city && form.address) && (
                    <button
                      type="button"
                      onClick={() => saveCurrentAddressToBook(newAddressLabel)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: 'var(--gold, #c5a880)',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(197, 168, 128, 0.3)'
                      }}
                    >
                      <span>💾</span>
                      <span>حفظ العنوان الآن</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Payment Methods Card */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>
                  <CreditCard size={22} color="var(--gold-dim)" />
                  <span>3. طريقة الدفع</span>
                </h3>

                <div className={styles.paymentGrid}>
                  {/* Option 1: Direct Cards & Apple Pay (MEPS / PayTabs Jordan) - LOCAL ONLY */}
                  {isLocalEnvironment && (
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'paytabs' })}
                      className={styles.paymentCard}
                      style={{
                        border: form.paymentMethod === 'paytabs' ? '2px solid var(--gold, #c5a880)' : '1.5px solid #e0e0e0',
                        backgroundColor: form.paymentMethod === 'paytabs' ? 'rgba(197, 168, 128, 0.12)' : '#ffffff',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-10px', left: '15px', backgroundColor: 'var(--gold, #c5a880)', color: '#1a1008', fontSize: '0.72rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                        موصى به (تجريبي محلي) ⚡
                      </div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '1.4rem' }}>
                        <span>💳</span>
                        <span>🍏</span>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>
                        بطاقة بنكية أو Apple Pay
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-dim)', fontWeight: 'bold' }}>
                        Visa • MasterCard • مدى • Apple Pay
                      </div>
                    </div>
                  )}

                  {/* Option 2: Cash on Delivery (Jordan only) */}
                  {isJordan && (
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'cod' })}
                      className={styles.paymentCard}
                      style={{
                        border: form.paymentMethod === 'cod' ? '2px solid var(--gold, #c5a880)' : '1.5px solid #e0e0e0',
                        backgroundColor: form.paymentMethod === 'cod' ? 'rgba(197, 168, 128, 0.12)' : '#ffffff'
                      }}
                    >
                      <div style={{ fontSize: '1.6rem' }}>💵</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>الدفع عند الاستلام</div>
                      <div style={{ fontSize: '0.78rem', color: '#777' }}>ادفعي نقداً عند استلام طلبكِ (داخل الأردن)</div>
                    </div>
                  )}

                  {/* Option 3: PayPal (Worldwide) */}
                  <div
                    onClick={() => setForm({ ...form, paymentMethod: 'paypal' })}
                    className={styles.paymentCard}
                    style={{
                      border: form.paymentMethod === 'paypal' ? '2px solid var(--gold, #c5a880)' : '1.5px solid #e0e0e0',
                      backgroundColor: form.paymentMethod === 'paypal' ? 'rgba(197, 168, 128, 0.12)' : '#ffffff'
                    }}
                  >
                    <div style={{ fontSize: '1.6rem' }}>🅿️</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--espresso)' }}>
                      حساب PayPal
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#777' }}>
                      دفع إلكتروني آمن عالمياً
                    </div>
                  </div>
                </div>

                {/* PayTabs MEPS Card & Apple Pay Info Banner */}
                {form.paymentMethod === 'paytabs' && (
                  <div style={{
                    marginTop: '20px',
                    background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.12) 0%, rgba(197, 168, 128, 0.04) 100%)',
                    border: '1px solid rgba(197, 168, 128, 0.35)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--espresso)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🔒</span>
                      <span>دفع فوري وآمن ومشفر عبر بوابة MEPS / PayTabs Jordan الرسمية</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.86rem' }}>
                      يقبل بطاقات <strong>Visa</strong>، <strong>MasterCard</strong>، <strong>مدى (Mada)</strong>، و <strong>Apple Pay</strong> مع دعم التحقق البنكي الآمن 3D Secure.
                    </div>
                  </div>
                )}

                {/* PayPal & Direct Card Buttons */}
                {form.paymentMethod === 'paypal' && (
                  <div style={{ marginTop: '20px' }}>
                    <PayPalScriptProvider options={{ 
                      "client-id": (storeSettings?.paypal_client_id && storeSettings.paypal_client_id.trim()) || process.env.REACT_APP_PAYPAL_CLIENT_ID || "ARdYvIMc9bA48NZVLTI18B63ctWU9GxHRCmxhW_fXxuaDD4hogMl6xKVDPIgsUs_nRBgE1G7YxQb_2Mk", 
                      currency: "USD", 
                      intent: "capture"
                    }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "pill", color: "gold" }}
                        onClick={(data, actions) => {
                          if (!validate()) {
                            showAlert({
                              title: 'يرجى استكمال البيانات',
                              message: 'يرجى إدخال الاسم، رقم الهاتف، والمدينة وتفاصيل العنوان قبل إتمام الدفع.',
                              type: 'warning'
                            });
                            return actions.reject();
                          }
                          return actions.resolve();
                        }}
                        createOrder={(data, actions) => {
                          const usdAmount = (finalPrice * 1.41).toFixed(2);
                          const iso = (getCountryIso(form.country) || 'JO').toUpperCase();
                          const cleanDigits = (form.phone || '').replace(/\D/g, '');
                          const nameParts = (form.name || '').trim().split(' ');
                          const firstName = nameParts[0] || 'Customer';
                          const lastName = nameParts.slice(1).join(' ') || firstName;

                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  currency_code: "USD",
                                  value: usdAmount
                                },
                                description: `طلب من متجر زهرة بيسان (${items.length} قطعة)`,
                                shipping: {
                                  name: { full_name: form.name.trim() || 'Valued Customer' },
                                  address: {
                                    address_line_1: form.address || form.city || 'Amman',
                                    admin_area_2: form.city || 'Amman',
                                    country_code: iso
                                  }
                                }
                              }
                            ],
                            payer: {
                              name: {
                                given_name: firstName,
                                surname: lastName
                              },
                              phone: cleanDigits ? {
                                phone_type: "MOBILE",
                                phone_number: {
                                  national_number: cleanDigits
                                }
                              } : undefined,
                              address: {
                                country_code: iso
                              }
                            },
                            application_context: {
                              shipping_preference: 'NO_SHIPPING',
                              user_action: 'PAY_NOW'
                            }
                          });
                        }}
                        onApprove={async (data, actions) => {
                          try {
                            setStep('processing');
                            await actions.order.capture();
                            const resultStatus = await saveOrderToBackend();
                            if (resultStatus === 'success') {
                              try { 
                                sendOrderConfirmationEmail(
                                  form.email.trim(), 
                                  orderId || 'جديد', 
                                  items, 
                                  finalPrice, 
                                  form.name, 
                                  `${form.country} - ${form.city} (${form.address})`, 
                                  form.phone
                                ); 
                                fetch('/api/cart/recovered', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: form.email.trim(), phone: form.phone.trim() })
                                }).catch(() => {});
                              } catch(e) {}
                              clearCart();
                              setStep('success');
                            } else {
                              setStep('error:حدث خطأ أثناء تسجيل الطلب');
                            }
                          } catch (err) {
                            setStep('error:فشلت عملية الدفع عبر PayPal. يرجى المحاولة مجدداً.');
                          }
                        }}
                        onCancel={() => {
                          showToast('تم إلغاء عملية الدفع. سلة مشترياتك محفوظة.', 'info');
                        }}
                        onError={(err) => {
                          console.warn('[PayPal Notice]:', err);
                          showAlert({
                            title: 'تنبيه بوابة الدفع',
                            message: 'تعذر استكمال عملية الدفع عبر PayPal حالياً. يرجى المحاولة مجدداً أو اختيار الدفع عند الاستلام.',
                            type: 'warning'
                          });
                        }}
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
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_DATA_URI; }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>مجموع المنتجات:</span>
                  <strong style={{ color: '#1a1a1a', fontWeight: '700' }}>{formatPrice(totalPrice)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                  <span>تكلفة الشحن:</span>
                  {isCalculatingShipping ? (
                    <span style={{ color: 'var(--gold-dim)' }}>جاري الحساب...</span>
                  ) : (
                    <strong style={{ color: shippingFee === 0 ? '#15803d' : '#1a1a1a', fontWeight: '700' }}>
                      {shippingFee === 0 ? '0 JOD (مجاناً)' : `+${formatPrice(shippingFee)}`}
                    </strong>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 'bold' }}>
                    <span>الخصم {couponApplied?.code ? `(${couponApplied.code})` : ''}:</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Row */}
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '16px',
                marginBottom: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--espresso)' }}>
                  الإجمالي ({items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) === 1 ? 'منتج' : 'منتجات'}):
                </span>
                <div style={{ textAlign: 'left', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {couponDiscount > 0 && (
                    <span style={{ fontSize: '1.1rem', color: '#999', textDecoration: 'line-through' }}>
                      {formatPrice(totalPrice + shippingFee)}
                    </span>
                  )}
                  <span style={{ fontSize: '1.55rem', fontWeight: '900', color: 'var(--espresso)' }}>
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              {couponDiscount > 0 && (
                <div style={{
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#15803d',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  marginBottom: '10px'
                }}>
                  <span>🎉</span>
                  <span>التوفير {formatPrice(couponDiscount)}</span>
                </div>
              )}

              {/* Confirm Button for PayTabs / MEPS Cards & Apple Pay */}
              {form.paymentMethod === 'paytabs' && (
                <button
                  type="submit"
                  disabled={step === 'processing'}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2c2523 0%, #1a1615 100%)',
                    color: '#d4af37',
                    border: '1.5px solid #d4af37',
                    padding: '18px 24px',
                    borderRadius: '16px',
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    cursor: step === 'processing' ? 'not-allowed' : 'pointer',
                    marginTop: '25px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                    transition: 'transform 0.2s',
                    opacity: step === 'processing' ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <CreditCard size={22} color="#d4af37" />
                  <span>{step === 'processing' ? 'جاري فتح بوابة الدفع الآمنة...' : `المتابعة للدفع بالبطاقة أو Apple Pay (${formatPrice(finalPrice)}) 🔒`}</span>
                </button>
              )}

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

      <MapLocationPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectLocation={handleSelectLocationFromMap}
        initialCountry={form.country}
        initialCity={form.city}
      />

      <Footer />
    </div>
  );
}