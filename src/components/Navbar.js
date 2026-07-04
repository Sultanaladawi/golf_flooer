import { useState, useEffect, useRef } from 'react';
import { shopInfo } from '../data/shopData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import styles from './Navbar.module.css';

const BagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const InstaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LINKS = [
  { label: 'الرئيسية',  href: '#home' },
  { label: 'التشكيلة',  href: '#collection' },
  { label: 'معرضنا',    href: '#gallery' },
  { label: 'اتصلي بنا', href: '#contact' }
];

const LANGUAGES = [
  // ── الدول العربية ──
  { code: 'ar', name: 'الأردن', iso: 'jo' },
  { code: 'ar', name: 'فلسطين', iso: 'ps' },
  { code: 'ar', name: 'السعودية', iso: 'sa' },
  { code: 'ar', name: 'الإمارات', iso: 'ae' },
  { code: 'ar', name: 'الكويت', iso: 'kw' },
  { code: 'ar', name: 'قطر', iso: 'qa' },
  { code: 'ar', name: 'البحرين', iso: 'bh' },
  { code: 'ar', name: 'عُمان', iso: 'om' },
  { code: 'ar', name: 'العراق', iso: 'iq' },
  { code: 'ar', name: 'مصر', iso: 'eg' },
  { code: 'ar', name: 'اليمن', iso: 'ye' },
  { code: 'ar', name: 'السودان', iso: 'sd' },
  { code: 'ar', name: 'المغرب', iso: 'ma' },
  { code: 'ar', name: 'الجزائر', iso: 'dz' },
  { code: 'ar', name: 'تونس', iso: 'tn' },
  { code: 'ar', name: 'ليبيا', iso: 'ly' },
  
  // ── دول عالمية ──
  { code: 'en', name: 'الولايات المتحدة', iso: 'us' },
  { code: 'en', name: 'بريطانيا', iso: 'gb' },
  { code: 'en', name: 'كندا', iso: 'ca' },
  { code: 'en', name: 'أستراليا', iso: 'au' },
  { code: 'tr', name: 'تركيا', iso: 'tr' },
  { code: 'fr', name: 'فرنسا', iso: 'fr' },
  { code: 'de', name: 'ألمانيا', iso: 'de' },
  { code: 'zh-CN', name: 'الصين', iso: 'cn' },
  { code: 'ja', name: 'اليابان', iso: 'jp' },
  { code: 'hi', name: 'الهند', iso: 'in' },
  { code: 'sv', name: 'السويد', iso: 'se' },
  { code: 'no', name: 'النرويج', iso: 'no' },
  { code: 'de', name: 'سويسرا', iso: 'ch' }
];


export default function Navbar({ onCartOpen, onWishlistOpen, onTrackOrderOpen }) {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const [offers, setOffers]       = useState([]);
  const [bounce, setBounce]       = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const currencyRef               = useRef(null);
  const { totalItems }            = useCart();
  const { wishlist }               = useWishlist();
  const wishlistCount              = wishlist.length;
  const { isDark, toggleDark }     = useDarkMode();
  const { currency, setCurrency, currencies } = useCurrency();

  const [showLanguage, setShowLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('zahrat_language');
      return saved || 'ar';
    } catch {
      return 'ar';
    }
  });

  const [selectedIso, setSelectedIso] = useState(() => {
    try {
      const saved = localStorage.getItem('zahrat_language_iso');
      return saved || 'jo';
    } catch {
      return 'jo';
    }
  });

  const languageRef               = useRef(null);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setOffers(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') { setOpen(false); setShowCurrency(false); setShowLanguage(false); } };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  // Close currency and language dropdowns when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setShowCurrency(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setShowLanguage(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const changeLanguage = (langCode, countryIso) => {
    try {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
        setSelectedLanguage(langCode);
        setSelectedIso(countryIso);
        localStorage.setItem('zahrat_language', langCode);
        localStorage.setItem('zahrat_language_iso', countryIso);

        // Sync currency with language country
        const matchingCurr = currencies.find(c => c.iso === countryIso);
        if (matchingCurr) {
          setCurrency(matchingCurr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        if (selectEl.value !== selectedLanguage) {
          selectEl.value = selectedLanguage;
          selectEl.dispatchEvent(new Event('change'));
        }
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [selectedLanguage]);

  // Sync language country flag with currency selector country flag
  useEffect(() => {
    if (currency && currency.iso) {
      const matchingLang = LANGUAGES.find(l => l.iso === currency.iso);
      if (matchingLang) {
        if (matchingLang.code !== selectedLanguage) {
          changeLanguage(matchingLang.code, matchingLang.iso);
        } else if (matchingLang.iso !== selectedIso) {
          setSelectedIso(matchingLang.iso);
          localStorage.setItem('zahrat_language_iso', matchingLang.iso);
        }
      }
    }
  }, [currency]);

  const currentLangObj = LANGUAGES.find(l => l.code === selectedLanguage && l.iso === selectedIso) ||
                         LANGUAGES.find(l => l.code === selectedLanguage) ||
                         LANGUAGES[0];

  const textColor = scrolled ? 'var(--espresso)' : '#fff';
  const logoStyle = {
    height: '62px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: '10px',
    transition: 'all 0.4s ease',
  };

  return (
    <>
      {/* ── Fixed Header ── */}
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        style={{ direction: 'rtl' }}
      >
        {/* Offers Ticker */}
        {offers.length > 0 && (
          <div style={{
            background: scrolled
              ? 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-dim))'
              : 'rgba(0,0,0,0.55)',
            color: scrolled ? 'var(--espresso)' : '#fff',
            padding: '6px 0',
            textAlign: 'center',
            fontSize: '0.82rem',
            fontWeight: '700',
            letterSpacing: '1px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
            borderBottom: scrolled
              ? '1px solid var(--divider)'
              : '1px solid rgba(197,168,128,0.2)',
          }}>
            <div style={{ display: 'inline-block', animation: 'marquee 28s linear infinite' }}>
              {offers.map(o => (
                <span key={o.id} style={{ margin: '0 36px' }}>
                  <span style={{ margin: '0 8px', opacity: 0.7 }}>✦</span>
                  {o.product_name === 'All' ? 'خصم خاص' : o.product_name}
                  {' — '}{o.reason}
                  {' '}
                  <span style={{
                    border: '1px solid currentColor',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    marginRight: '4px',
                    fontSize: '0.75rem',
                    opacity: 0.9
                  }}>
                    {parseFloat(o.discount_percent).toFixed(0)}% خصم
                  </span>
                  <span style={{ margin: '0 8px', opacity: 0.7 }}>✦</span>
                </span>
              ))}
            </div>
            <style>{`
              @keyframes marquee {
                0%   { transform: translateX(100vw); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>
        )}

        {/* Main Nav Bar */}
        <div className={styles.inner}>

          {/* Logo */}
          <a href="#home" aria-label="زهرة بيسان للعبايات والأزياء الفاخرة" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="زهرة بيسان" style={logoStyle} />
          </a>

          {/* Desktop Links */}
          <nav aria-label="Main navigation">
            <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={styles.navLink} style={{ color: textColor, transition: 'color 0.3s' }}>
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={onTrackOrderOpen}
                  className={styles.navLink}
                  style={{
                    color: textColor, transition: 'color 0.3s',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                    padding: 0
                  }}
                >
                  تتبع الطلب
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Hidden Google Translate Widget (used for backend translation trigger) */}
            <div
              id="google_translate_element"
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
              }}
            />

            {/* Custom Language Switcher (matching Country/Currency dropdown styling) */}
            <div ref={languageRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLanguage(v => !v)}
                style={{
                  background: scrolled ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.12)',
                  border: scrolled ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  color: textColor,
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.3s',
                  letterSpacing: '0.5px'
                }}
                aria-label="تغيير اللغة"
              >
                <img
                  src={getFlagUrl(currentLangObj.iso)}
                  alt={currentLangObj.name}
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span>{currentLangObj.name}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
              </button>

              {showLanguage && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  padding: '10px 0',
                  minWidth: '200px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  direction: 'rtl'
                }}>
                  <div style={{ padding: '8px 16px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', letterSpacing: '1px', borderBottom: '1px solid var(--divider)' }}>
                    اختاري اللغة / البلد
                  </div>
                  {LANGUAGES.map(l => {
                    const isSelected = selectedLanguage === l.code && selectedIso === l.iso;
                    return (
                      <button
                        key={`${l.code}-${l.iso}`}
                        onClick={() => { changeLanguage(l.code, l.iso); setShowLanguage(false); }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: isSelected ? 'var(--gold-glow)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.88rem',
                          color: 'var(--espresso)',
                          fontWeight: isSelected ? '700' : '400',
                          textAlign: 'right',
                          transition: 'background 0.2s',
                          borderRight: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = isSelected ? 'var(--gold-glow)' : 'transparent'}
                      >
                        <img
                          src={getFlagUrl(l.iso)}
                          alt={l.name}
                          style={{ width: '24px', height: '18px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        <span style={{ flex: 1 }}>{l.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>


            {/* Currency Switcher */}
            <div ref={currencyRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCurrency(v => !v)}
                style={{
                  background: scrolled ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.12)',
                  border: scrolled ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  color: textColor,
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.3s',
                  letterSpacing: '0.5px'
                }}
                aria-label="تغيير العملة"
              >
                <img
                  src={getFlagUrl(currency.iso)}
                  alt={currency.code}
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span>{currency.code}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
              </button>

              {showCurrency && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  padding: '10px 0',
                  minWidth: '220px',
                  zIndex: 9999,
                  maxHeight: '340px',
                  overflowY: 'auto',
                  direction: 'rtl'
                }}>
                  <div style={{ padding: '8px 16px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', letterSpacing: '1px', borderBottom: '1px solid var(--divider)' }}>
                    اختاري العملة
                  </div>
                  {currencies.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c); setShowCurrency(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: currency.code === c.code ? 'var(--gold-glow)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        color: 'var(--espresso)',
                        fontWeight: currency.code === c.code ? '700' : '400',
                        textAlign: 'right',
                        transition: 'background 0.2s',
                        borderRight: currency.code === c.code ? '3px solid var(--gold)' : '3px solid transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = currency.code === c.code ? 'var(--gold-glow)' : 'transparent'}
                    >
                      <img
                        src={getFlagUrl(c.iso)}
                        alt={c.code}
                        style={{ width: '24px', height: '18px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span style={{ color: 'var(--gold-dim)', fontWeight: '700', fontSize: '0.8rem' }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              style={{
                color: scrolled ? 'var(--gold-dim)' : '#fff',
                background: 'transparent', border: 'none', cursor: 'pointer',
                position: 'relative', padding: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.3s ease'
              }}
            >
              {isDark ? (
                /* Sun icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                /* Moon icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onWishlistOpen}
              aria-label={`قائمة الأمنيات — ${wishlistCount} منتج`}
              style={{ color: scrolled ? 'var(--gold-dim)' : '#fff', background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  background: '#ef4444', color: '#fff',
                  fontSize: '0.65rem', fontWeight: 'bold',
                  padding: '1px 5px', borderRadius: '50%',
                  minWidth: '16px', textAlign: 'center', lineHeight: '16px', height: '16px'
                }}>
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              className={`${styles.cartBtn} ${scrolled ? styles.cartBtnScrolled : ''}`}
              onClick={onCartOpen}
              aria-label={`فتح السلة — ${totalItems} منتج`}
              style={{ color: scrolled ? 'var(--gold-dim)' : '#fff', background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <BagIcon />
              {totalItems > 0 && (
                <span className={`${styles.cartBadge} ${bounce ? styles.cartBadgeBounce : ''}`} style={{
                  position: 'absolute', top: '-8px', right: '-10px',
                  background: 'var(--gold)', color: '#000',
                  fontSize: '0.7rem', fontWeight: 'bold',
                  padding: '2px 6px', borderRadius: '50%',
                  minWidth: '18px', textAlign: 'center'
                }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Burger */}
            <button
              className={`${styles.burger} ${open ? styles.open : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label="القائمة"
              aria-expanded={open}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <span style={{ width: '25px', height: '2px', background: textColor, transition: 'background 0.3s' }} />
              <span style={{ width: '25px', height: '2px', background: textColor, transition: 'background 0.3s' }} />
              <span style={{ width: '25px', height: '2px', background: textColor, transition: 'background 0.3s' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div className={`${styles.mobile} ${open ? styles.mobileOpen : ''}`} role="dialog" aria-label="Navigation" style={{ direction: 'rtl' }}>
        <button className={styles.mobileClose} onClick={() => setOpen(false)} aria-label="إغلاق">
          <CloseIcon />
        </button>
        <nav>
          {LINKS.map(({ label, href }) => (
            <a key={label} href={href} className={styles.mobileLink} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <button
            className={styles.mobileLink}
            onClick={() => { setOpen(false); onTrackOrderOpen(); }}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'right', cursor: 'pointer', font: 'inherit' }}
          >
            تتبع الطلب
          </button>
          <button className={styles.mobileCartLink} onClick={() => { setOpen(false); onCartOpen(); }}>
            <BagIcon />
            <span>سلتي</span>
            {totalItems > 0 && <span className={styles.mobileBadge}>{totalItems}</span>}
          </button>
        </nav>

        {/* Language in mobile */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '10px', color: '#fff', letterSpacing: '1px' }}>اللغة / البلد</div>
          <div style={{ position: 'relative' }}>
            <select
              value={`${selectedLanguage}-${selectedIso}`}
              onChange={(e) => {
                const [code, iso] = e.target.value.split('-');
                changeLanguage(code, iso);
              }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '10px 15px',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                textAlign: 'right',
                direction: 'rtl'
              }}
            >
              {LANGUAGES.map(l => (
                <option key={`${l.code}-${l.iso}`} value={`${l.code}-${l.iso}`} style={{ background: '#1a1a1a', color: '#fff' }}>
                  {l.name}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#fff', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
          </div>
        </div>

        {/* Currency in mobile */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '10px', color: '#fff', letterSpacing: '1px' }}>العملة</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c); }}
                style={{
                  background: currency.code === c.code ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid ' + (currency.code === c.code ? 'var(--gold)' : 'rgba(255,255,255,0.15)'),
                  borderRadius: '20px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  color: currency.code === c.code ? '#1a1a1a' : '#fff',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <img
                  src={getFlagUrl(c.iso)}
                  alt={c.code}
                  style={{ width: '18px', height: '13px', objectFit: 'cover', borderRadius: '2px' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                {c.code}
              </button>
            ))}
          </div>
        </div>

        <a href={shopInfo.instagram} className={styles.mobileInsta} target="_blank" rel="noopener noreferrer">
          <InstaIcon /> {shopInfo.instagramHandle}
        </a>
      </div>
    </>
  );
}