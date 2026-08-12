import { useState, useEffect, useRef, useCallback } from 'react';
import { shopInfo } from '../data/shopData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useDarkMode } from '../context/DarkModeContext';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { FiUser } from 'react-icons/fi';
import ProductModal from './ProductModal';
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
  { label: 'الرئيسية',  href: '/#home' },
  { label: 'التشكيلة',  href: '/#collection' },
  { label: 'معرضنا',    href: '/#gallery' },
  { label: 'مجلة زهرة بيسان', href: '/blog' },
  { label: 'بطاقات الهدايا', href: '/gift-cards' },
  { label: 'اتصلي بنا', href: '/#contact' }
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
  
  // ── دول إنجليزية ──
  { code: 'en', name: 'USA', iso: 'us' },
  { code: 'en', name: 'United Kingdom', iso: 'gb' },
  { code: 'en', name: 'Canada', iso: 'ca' },
  { code: 'en', name: 'Australia', iso: 'au' }
];

const SITE_LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default function Navbar({ onCartOpen, onWishlistOpen, onTrackOrderOpen, onOpenPolicy }) {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const [offers, setOffers]       = useState([]);
  const [bounce, setBounce]       = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef(null);


  const { totalItems, totalPrice } = useCart();
  const { wishlist }               = useWishlist();
  const wishlistCount              = wishlist.length;
  const { isDark, toggleDark }     = useDarkMode();
  const { currency, setCurrency, currencies } = useCurrency();
  const { customer, openLoginModal } = useCustomerAuth();
  const { langCode, currentLang, changeLanguage: setAppLang, t, LANGUAGES: APP_LANGUAGES } = useLanguage();

  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // ── Smart Search ──
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState(null);
  const searchRef                         = useRef(null);
  const searchInputRef                    = useRef(null);
  const searchDebounceRef                 = useRef(null);

  const [showLanguage, setShowLanguage] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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
  const countryRef                = useRef(null);

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
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowLanguage(false);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target)) {
        setShowLanguage(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doSearch = useCallback((q) => {
    clearTimeout(searchDebounceRef.current);
    if (!q || q.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!searchOpen) setSearchOpen(true);
    doSearch(q);
  };

  const handleResultClick = (product) => {
    setSearchProduct(product);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const changeLanguage = (langCode, countryIso) => {
    try {
      if (setAppLang) {
        setAppLang(langCode);
      }
      setSelectedLanguage(langCode);
      setSelectedIso(countryIso);
      localStorage.setItem('zahrat_language', langCode);
      localStorage.setItem('zahrat_language_iso', countryIso);

      let matchingCurr = currencies.find(c => c.iso === countryIso);
      if (!matchingCurr && ['de', 'fr', 'eu', 'ch', 'se', 'no'].includes(countryIso)) {
        if (countryIso === 'ch') matchingCurr = currencies.find(c => c.code === 'CHF');
        else if (countryIso === 'se') matchingCurr = currencies.find(c => c.code === 'SEK');
        else if (countryIso === 'no') matchingCurr = currencies.find(c => c.code === 'NOK');
        else matchingCurr = currencies.find(c => c.code === 'EUR');
      }
      if (!matchingCurr) {
        matchingCurr = currencies.find(c => c.code === 'USD');
      }
      if (matchingCurr) {
        setCurrency(matchingCurr);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const formattedTotal = currency ? (totalPrice * (currency.rate || 1)).toFixed(0) : totalPrice.toFixed(0);
  const displayCurrency = langCode === 'en' ? (currency?.code || 'JOD') : (currency?.symbol || 'د.أ');

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        style={{ direction: currentLang.dir || 'rtl' }}
      >


        <div style={{
          backgroundColor: scrolled ? 'rgba(250,249,246,0.98)' : 'rgba(250,249,246,0.96)',
          borderBottom: '1px solid rgba(197,168,128,0.18)',
          padding: '7px 24px',
          color: 'var(--espresso-mid)',
          fontSize: '0.82rem',
          fontWeight: '600',
          direction: currentLang.dir || 'rtl',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onOpenPolicy && onOpenPolicy('privacy')} 
                onMouseEnter={e => e.currentTarget.style.color = '#b8966c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-dim)'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-dim)', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s ease', padding: 0 }}
              >
                {t('privacyPolicy')}
              </button>
              <span style={{ opacity: 0.3, color: 'var(--gold-dim)' }}>|</span>
              <button 
                onClick={() => onOpenPolicy && onOpenPolicy('about')} 
                onMouseEnter={e => e.currentTarget.style.color = '#b8966c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-dim)'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-dim)', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s ease', padding: 0 }}
              >
                {t('aboutUs')}
              </button>
              <span style={{ opacity: 0.3, color: 'var(--gold-dim)' }}>|</span>
              <button 
                onClick={() => onOpenPolicy && onOpenPolicy('returns')} 
                onMouseEnter={e => e.currentTarget.style.color = '#b8966c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-dim)'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-dim)', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s ease', padding: 0 }}
              >
                {t('exchangeReturnPolicy')}
              </button>
            </div>


            <div ref={searchRef} style={{ position: 'relative', flex: '0 1 360px', minWidth: '220px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: '24px',
                padding: '6px 14px',
                border: '1px solid #E5E7EB',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.25s'
              }}>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchOpen(true)}
                  placeholder={t('searchPlaceholder')}
                  dir={currentLang.dir || 'rtl'}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: '#1F2937',
                    fontFamily: 'inherit',
                    fontWeight: '500',
                    paddingRight: '4px'
                  }}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.2" style={{ flexShrink: 0, cursor: 'pointer' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {searchOpen && (searchResults.length > 0 || (searchQuery.trim().length >= 2 && !searchLoading)) && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: 0,
                  background: '#fff',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                  zIndex: 9999,
                  overflow: 'hidden',
                  direction: 'rtl',
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem' }}>
                      لا توجد نتائج بحث مطابقة
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: '8px 14px 6px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', borderBottom: '1px solid var(--divider)' }}>
                        نتائج البحث ({searchResults.length})
                      </div>
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product)}
                          style={{
                            width: '100%', background: 'none', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '12px', padding: '10px 14px',
                            borderBottom: '1px solid var(--divider)',
                            transition: 'background 0.18s', textAlign: 'right'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <div style={{
                            width: '44px', height: '44px', borderRadius: '10px',
                            overflow: 'hidden', flexShrink: 0,
                            background: '#F3F4F6',
                            border: '1px solid #E5E7EB'
                          }}>
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌸</div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gold-dim)', fontWeight: '700', marginTop: '2px' }}>
                              {currency ? `${(parseFloat(product.price) * (currency.rate || 1)).toFixed(2)} ${currency.code}` : `${product.price} JD`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', direction: 'ltr' }}>
              <a 
                href={`mailto:${shopInfo.email}`} 
                onMouseEnter={e => e.currentTarget.style.color = '#b8966c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-dim)'}
                style={{ color: 'var(--gold-dim)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s ease' }}
              >
                {shopInfo.email}
              </a>
              <span style={{ opacity: 0.3, color: 'var(--gold-dim)' }}>|</span>
              <a 
                href={`tel:${shopInfo.phone}`} 
                onMouseEnter={e => e.currentTarget.style.color = '#b8966c'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-dim)'}
                style={{ color: 'var(--gold-dim)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600', direction: 'rtl', transition: 'all 0.2s ease' }}
              >
                {t('contactUs')}: {shopInfo.phone}
              </a>
            </div>
          </div>
        </div>

        {offers.length > 0 && (
          <div style={{
            background: scrolled
              ? 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-dim))'
              : 'rgba(0,0,0,0.55)',
            color: scrolled ? 'var(--espresso)' : '#fff',
            padding: '5px 0',
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

        <div className={styles.inner}>
          <a href="#home" aria-label="زهرة بيسان للعبايات والأزياء الفاخرة" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="زهرة بيسان" style={logoStyle} />
          </a>

          <nav aria-label="Main navigation">
            <ul style={{ display: 'flex', alignItems: 'center', gap: '1.3rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'nowrap' }}>
              {[
                { label: t('home'), href: '/#home' },
                { label: t('collection'), href: '/#collection' },
                { label: t('showcase'), href: '/#gallery' },
                { label: t('magazine'), href: '/blog' },
                { label: t('giftCards'), href: '/gift-cards' },
                { label: t('contact'), href: '/contact' },
              ].map(({ label, href }) => (
                <li key={label} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <a href={href} className={styles.navLink} style={{ color: textColor, transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
                    {label}
                  </a>
                </li>
              ))}
              <li style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                <button
                  onClick={onTrackOrderOpen}
                  className={styles.navLink}
                  style={{
                    color: textColor, transition: 'color 0.3s',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                    padding: 0, whiteSpace: 'nowrap'
                  }}
                >
                  {t('trackOrder')}
                </button>
              </li>
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* 🌐 Dedicated Language Translator Dropdown (9 World Languages) */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLangDropdown(v => !v)}
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
                  gap: '6px',
                  transition: 'all 0.3s',
                  letterSpacing: '0.5px'
                }}
                aria-label="تغيير لغة الموقع"
              >
                <span style={{ fontSize: '0.9rem' }}>🌐</span>
                <span>{(SITE_LANGUAGES.find(sl => sl.code === langCode) || SITE_LANGUAGES[0]).flag} {(SITE_LANGUAGES.find(sl => sl.code === langCode) || SITE_LANGUAGES[0]).name}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
              </button>

              {showLangDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  padding: '10px 0',
                  minWidth: '190px',
                  zIndex: 9999,
                  direction: 'rtl'
                }}>
                  <div style={{ padding: '8px 16px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', borderBottom: '1px solid var(--divider)' }}>
                    ترجمة المتجر (9 لغات عالمية)
                  </div>
                  {SITE_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setAppLang(l.code);
                        setShowLangDropdown(false);
                        
                        // Google Translate works via cookie — set it then reload
                        const langPair = l.code === 'ar' ? '/ar/ar' : `/ar/${l.code}`;
                        const host = window.location.hostname;
                        
                        // Clear old cookies first
                        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host}`;
                        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                        
                        if (l.code === 'ar') {
                          // Reset to Arabic = clear translation
                          localStorage.setItem('zahrat_site_lang', 'ar');
                          window.location.reload();
                        } else {
                          // Set new language cookie and reload
                          document.cookie = `googtrans=${langPair}; path=/; domain=.${host}`;
                          document.cookie = `googtrans=${langPair}; path=/;`;
                          localStorage.setItem('zahrat_site_lang', l.code);
                          window.location.reload();
                        }
                      }}


                      style={{
                        width: '100%',
                        padding: '9px 16px',
                        background: langCode === l.code ? 'var(--gold-glow)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        color: 'var(--espresso)',
                        fontWeight: langCode === l.code ? '700' : '400',
                        textAlign: 'right',
                        borderRight: langCode === l.code ? '3px solid var(--gold)' : '3px solid transparent'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = langCode === l.code ? 'var(--gold-glow)' : 'transparent'}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={countryRef} style={{ position: 'relative' }}>

              <button
                onClick={() => setShowCountryDropdown(v => !v)}
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
                aria-label="تغيير البلد والعملة"
              >
                <img
                  src={getFlagUrl(currentLangObj.iso)}
                  alt={currentLangObj.name}
                  style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <span>{currentLangObj.name} ({currency.code})</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
              </button>

              {showCountryDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '0',
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  padding: '10px 0',
                  minWidth: '220px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  direction: 'rtl'
                }}>
                  <div style={{ padding: '8px 16px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', letterSpacing: '1px', borderBottom: '1px solid var(--divider)' }}>
                    اختاري البلد / العملة
                  </div>
                  {LANGUAGES.map(l => {
                    const isSelected = selectedLanguage === l.code && selectedIso === l.iso;
                    const cur = currencies.find(c => c.iso === l.iso) || currencies.find(c => c.code === 'USD');
                    return (
                      <button
                        key={`${l.code}-${l.iso}`}
                        onClick={() => {
                          changeLanguage(l.code, l.iso);
                          setCurrency(cur);
                          setShowCountryDropdown(false);
                        }}
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
                        <span style={{ color: 'var(--gold-dim)', fontWeight: '700', fontSize: '0.8rem' }}>{cur.code}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            <div 
              onClick={onCartOpen}
              title="فتح السلة"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                direction: 'ltr'
              }}
            >
              <span style={{
                fontSize: '1.02rem',
                fontWeight: '900',
                color: scrolled ? 'var(--espresso)' : '#FFFFFF',
                letterSpacing: '0.3px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {langCode === 'en' ? `${formattedTotal} ${displayCurrency}` : `${displayCurrency} ${formattedTotal}`}
              </span>

              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B3A4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#A81C1C',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '900',
                    minWidth: '19px',
                    height: '19px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    lineHeight: 1
                  }}>
                    {totalItems}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => customer ? (window.location.href = '/account') : openLoginModal()}
              aria-label="حسابي"
              title={customer ? "حسابي" : "تسجيل الدخول"}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="17.5" fill="#EEF2F6" stroke="#CBD5E1" strokeWidth="1" />
                <path d="M12 12C12 8.68629 14.6863 6 18 6C21.3137 6 24 8.68629 24 12V18C24 19.5 24.5 21 25.5 22H10.5C11.5 21 12 19.5 12 18V12Z" fill="#475569" />
                <ellipse cx="18" cy="16" rx="5.5" ry="6.5" fill="#FDE047" opacity="0.9" />
                <circle cx="15.5" cy="15.5" r="2.2" stroke="#1E293B" strokeWidth="1.2" fill="none" />
                <circle cx="20.5" cy="15.5" r="2.2" stroke="#1E293B" strokeWidth="1.2" fill="none" />
                <line x1="17.7" y1="15.5" x2="18.3" y2="15.5" stroke="#1E293B" strokeWidth="1.2" />
                <path d="M12.5 13.5C12.5 10.5 14.5 8 18 8C21.5 8 23.5 10.5 23.5 13.5C23.5 14.5 23 15.5 22.5 16C22 13.5 20 12 18 12C16 12 14 13.5 13.5 16C13 15.5 12.5 14.5 12.5 13.5Z" fill="#334155" />
                <path d="M9.5 29.5C9.5 24.2513 13.3056 20 18 20C22.6944 20 26.5 24.2513 26.5 29.5V32H9.5V29.5Z" fill="#4B6B94" />
                <path d="M15.5 20L18 24L20.5 20H15.5Z" fill="#FFFFFF" />
              </svg>

              {customer && (
                <span style={{
                  position: 'absolute', top: '2px', right: '2px',
                  width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%',
                  border: '1.5px solid #fff'
                }} />
              )}
            </button>

            <button
              className={`${styles.burger} ${open ? styles.open : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label="القائمة"
              aria-expanded={open}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              <span style={{ width: '25px', height: '2px', background: open ? 'var(--espresso)' : textColor, transition: 'background 0.3s' }} />
              <span style={{ width: '25px', height: '2px', background: open ? 'var(--espresso)' : textColor, transition: 'background 0.3s' }} />
              <span style={{ width: '25px', height: '2px', background: open ? 'var(--espresso)' : textColor, transition: 'background 0.3s' }} />
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.mobile} ${open ? styles.mobileOpen : ''}`} role="dialog" aria-label="Navigation" style={{ direction: 'rtl' }}>
        <nav style={{ width: '100%' }}>
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

        {/* Country / Currency in mobile */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '10px', color: '#fff', letterSpacing: '1px' }}>البلد / العملة</div>
          <div style={{ position: 'relative' }}>
            <select
              value={`${selectedLanguage}-${selectedIso}`}
              onChange={(e) => {
                const [lang, iso] = e.target.value.split('-');
                const matchingLang = LANGUAGES.find(l => l.code === lang && l.iso === iso);
                if (matchingLang) {
                  const cur = currencies.find(c => c.iso === matchingLang.iso) || currencies.find(c => c.code === 'USD');
                  changeLanguage(matchingLang.code, matchingLang.iso);
                  setCurrency(cur);
                }
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
              {LANGUAGES.map(l => {
                const cur = currencies.find(c => c.iso === l.iso) || currencies.find(c => c.code === 'USD');
                return (
                  <option key={`${l.code}-${l.iso}`} value={`${l.code}-${l.iso}`} style={{ background: '#1a1a1a', color: '#fff' }}>
                    {l.name} ({cur.code})
                  </option>
                );
              })}
            </select>
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#fff', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
          </div>
        </div>

        <a href={shopInfo.instagram} className={styles.mobileInsta} target="_blank" rel="noopener noreferrer">
          <InstaIcon /> {shopInfo.instagramHandle}
        </a>
      </div>

      {/* ── Search Product Modal ── */}
      {searchProduct && (
        <ProductModal model={searchProduct} onClose={() => setSearchProduct(null)} />
      )}
    </>
  );
}