import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { shopInfo } from '../data/shopData';
import { useCart } from '../context/CartContext';
import { useCurrency, getFlagUrl } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import styles from './Navbar.module.css';

// SVG Icons
const SearchIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BagIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function Navbar({ onOpenPolicy }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Independent dropdown states for Country and Language
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const countryRef = useRef(null);
  const langRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const { totalItems } = useCart();
  const { currency, setCurrency, currencies } = useCurrency();
  const { langCode, currentLang, changeLanguage, languages, t } = useLanguage();
  const { customer, openLoginModal } = useCustomerAuth();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setShowCountryModal(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 45) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search logic
  const doSearch = useCallback((q) => {
    clearTimeout(searchDebounceRef.current);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
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
    }, 280);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    doSearch(q);
  };

  const handleSelectProduct = (product) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${product.id}`);
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Dynamic Theme Colors
  const isDarkText = scrolled || !isHomePage;
  const navTextColor = isDarkText ? '#1a1a1a' : '#ffffff';
  const topTextColor = isDarkText ? '#444444' : '#e0e0e0';

  return (
    <>
      <header className={`${styles.header} ${isDarkText ? styles.scrolled : ''}`} style={{ direction: currentLang.dir || 'rtl' }}>
        {/* ── 1. Top Strip Bar (Assaf Style with Separated Country & Language) ── */}
        <div className={`${styles.topBar} ${isDarkText ? styles.topBarScrolled : ''}`}>
          
          {/* Right Section: Separated Country Selector and Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            
            {/* 📍 A. Independent Country & Currency Selector */}
            <div ref={countryRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowCountryModal(v => !v);
                  setShowLangModal(false);
                }}
                className={styles.topBarLink}
                style={{ color: topTextColor }}
                title="تغيير الدولة والعملة"
              >
                <img 
                  src={getFlagUrl(currency?.iso || 'jo')} 
                  alt={currency?.name} 
                  style={{ width: '16px', height: '11px', borderRadius: '2px', objectFit: 'cover' }} 
                />
                <span>متجر {currency?.name || 'الأردن'} ({currency?.code || 'JOD'})</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
              </button>

              {showCountryModal && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                  padding: '12px 0',
                  minWidth: '260px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  direction: 'rtl',
                  color: '#1a1a1a'
                }}>
                  <div style={{ padding: '6px 16px 10px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--gold-dim)', borderBottom: '1px solid #eee' }}>
                    اختاري الدولة والعملة
                  </div>
                  {currencies.map(c => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c);
                        setShowCountryModal(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: currency?.code === c.code ? 'rgba(197, 168, 128, 0.12)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.86rem',
                        fontWeight: currency?.code === c.code ? '700' : '500',
                        color: '#1a1a1a',
                        textAlign: 'right'
                      }}
                    >
                      <img src={getFlagUrl(c.iso || 'jo')} alt={c.name} style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} />
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span style={{ color: 'var(--gold-dim)', fontSize: '0.8rem', fontWeight: 'bold' }}>{c.symbol || c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span style={{ color: topTextColor, opacity: 0.3 }}>|</span>

            {/* 🌐 B. Independent Language Switcher */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowLangModal(v => !v);
                  setShowCountryModal(false);
                }}
                className={styles.topBarLink}
                style={{ color: topTextColor }}
                title="تغيير لغة المتجر"
              >
                <GlobeIcon />
                <span>{langCode === 'ar' ? 'العربية' : 'English'}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
              </button>

              {showLangModal && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                  padding: '8px 0',
                  minWidth: '160px',
                  zIndex: 9999,
                  direction: 'rtl',
                  color: '#1a1a1a'
                }}>
                  <button
                    onClick={() => {
                      changeLanguage('ar');
                      setShowLangModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: langCode === 'ar' ? 'rgba(197, 168, 128, 0.12)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.86rem',
                      fontWeight: langCode === 'ar' ? '700' : '500',
                      color: '#1a1a1a'
                    }}
                  >
                    <span>🇸🇦</span>
                    <span>العربية (AR)</span>
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setShowLangModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: langCode === 'en' ? 'rgba(197, 168, 128, 0.12)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.86rem',
                      fontWeight: langCode === 'en' ? '700' : '500',
                      color: '#1a1a1a'
                    }}
                  >
                    <span>🇬🇧</span>
                    <span>English (EN)</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Left: Support Email */}
          <div>
            <a 
              href={`mailto:${shopInfo.email}`} 
              className={styles.topBarLink}
              style={{ color: topTextColor, direction: 'ltr' }}
            >
              <MailIcon />
              <span>{shopInfo.email}</span>
            </a>
          </div>
        </div>

        {/* ── 2. Main Navigation Bar (Assaf Style) ── */}
        <div className={styles.inner}>
          {/* Right: Royal Brand Logo */}
          <a href="/#home" className={styles.logoLink} aria-label="زهرة بيسان">
            <img 
              src="/logo.png" 
              alt="زهرة بيسان" 
              className={styles.logoImg} 
              style={{ filter: isDarkText ? 'none' : 'brightness(1.1)' }}
            />
          </a>

          {/* Center: Navigation Categories with Luxury Dropdown Arrows */}
          <nav aria-label="التنقل الرئيسي">
            <ul className={styles.navLinks}>
              <li className={styles.navItem}>
                <a href="/#home" className={styles.navLink} style={{ color: navTextColor }}>
                  {t('home') || 'الرئيسية'}
                </a>
              </li>

              <li className={styles.navItem}>
                <a href="/#collection" className={styles.navLink} style={{ color: navTextColor }}>
                  <span>العبايات الملكية</span>
                  <span className={styles.chevron}>⌵</span>
                </a>
                <div className={styles.dropdownMenu}>
                  <a href="/#collection" className={styles.dropdownItem}>✦ جميع العبايات الفاخرة</a>
                  <a href="/#collection" className={styles.dropdownItem}>✦ عبايات كلاسيكية سوداء</a>
                  <a href="/#collection" className={styles.dropdownItem}>✦ عبايات ملونة وشتوية</a>
                  <a href="/#collection" className={styles.dropdownItem}>✦ عبايات بشت وبليزر فاخر</a>
                </div>
              </li>

              <li className={styles.navItem}>
                <a href="/#collection" className={styles.navLink} style={{ color: navTextColor }}>
                  <span>كولكشن المناسبات</span>
                  <span className={styles.chevron}>⌵</span>
                </a>
                <div className={styles.dropdownMenu}>
                  <a href="/#collection" className={styles.dropdownItem}>✦ كولكشن السهرة والأعراس</a>
                  <a href="/#collection" className={styles.dropdownItem}>✦ عبايات حرير وتطريز يدوي</a>
                  <a href="/#collection" className={styles.dropdownItem}>✦ تشكيلة الاستقبال الملكية</a>
                </div>
              </li>

              <li className={styles.navItem}>
                <a href="/blog" className={styles.navLink} style={{ color: navTextColor }}>
                  مجلة زهرة بيسان
                </a>
              </li>

              <li className={styles.navItem}>
                <a href="/gift-cards" className={styles.navLink} style={{ color: navTextColor }}>
                  بطاقات الهدايا
                </a>
              </li>

              <li className={styles.navItem}>
                <a href="/#contact" className={styles.navLink} style={{ color: navTextColor }}>
                  اتصلي بنا
                </a>
              </li>
            </ul>
          </nav>

          {/* Left: The 3 Iconic Action Buttons (Search, Account, Cart Bag with Red Badge) */}
          <div className={styles.actionsArea}>
            {/* 1. Search Icon */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className={styles.iconBtn}
              style={{ color: navTextColor }}
              title="البحث الذكي"
              aria-label="بحث"
            >
              <SearchIcon size={21} />
            </button>

            {/* 2. User / Account Icon */}
            <button 
              onClick={() => {
                if (customer) {
                  navigate('/account');
                } else {
                  openLoginModal();
                }
              }} 
              className={styles.iconBtn}
              style={{ color: navTextColor }}
              title={customer ? `حسابي (${customer.name})` : "تسجيل الدخول / حسابي"}
              aria-label="الحساب الشخصي"
            >
              <div className={styles.avatarIcon} style={{ borderColor: isDarkText ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)' }}>
                {customer?.avatar ? (
                  <img src={customer.avatar} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={17} />
                )}
              </div>
            </button>

            {/* 3. Shopping Bag Icon with RED BADGE (Assaf Style) */}
            <button 
              onClick={() => navigate('/cart')} 
              className={styles.iconBtn}
              style={{ color: navTextColor }}
              title="سلة المشتريات"
              aria-label="سلة المشتريات"
            >
              <BagIcon size={22} />
              {totalItems > 0 && (
                <span className={styles.redBadge}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Burger */}
            <button 
              onClick={() => setMobileOpen(v => !v)}
              className={styles.burger}
              style={{ color: navTextColor }}
              aria-label="القائمة"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── 3. Full-Screen Smart Search Overlay ── */}
      {searchOpen && (
        <div className={styles.searchModalOverlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.searchBoxContainer} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a1a', fontWeight: '800' }}>
                🔍 البحث في تشكيلة زهرة بيسان
              </h3>
              <button 
                onClick={() => setSearchOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f6f6f6',
              borderRadius: '16px',
              padding: '12px 18px',
              border: '1.5px solid #e5e5e5',
              gap: '12px'
            }}>
              <SearchIcon size={22} color="var(--gold-dim)" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="اكتبي اسم العباية، القماش، أو الموديل..."
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.05rem',
                  fontFamily: 'inherit',
                  color: '#1a1a1a'
                }}
              />
              {searchLoading && <span style={{ fontSize: '0.8rem', color: '#888' }}>جاري البحث...</span>}
            </div>

            {/* Search Results */}
            {searchQuery.trim().length >= 2 && (
              <div style={{ marginTop: '20px', maxHeight: '350px', overflowY: 'auto' }}>
                {searchResults.length === 0 && !searchLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '0.95rem' }}>
                    لم نعثر على نتائج مطابقة لـ "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(197, 168, 128, 0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <img 
                        src={p.images && p.images[0] ? p.images[0] : '/12.png'} 
                        alt={p.name} 
                        style={{ width: '48px', height: '62px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1a1a1a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gold-dim)', fontWeight: 'bold', marginTop: '3px' }}>
                          {currency ? `${(parseFloat(p.price) * (currency.rate || 1)).toFixed(2)} ${currency.code}` : `${p.price} JOD`}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
          <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <img src="/logo.png" alt="زهرة بيسان" style={{ height: '40px' }} />
              <button 
                onClick={() => setMobileOpen(false)} 
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <a href="/#home" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>الرئيسية <span>←</span></a>
            <a href="/#collection" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>العبايات الملكية <span>←</span></a>
            <a href="/#collection" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>كولكشن المناسبات <span>←</span></a>
            <a href="/blog" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>مجلة زهرة بيسان <span>←</span></a>
            <a href="/gift-cards" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>بطاقات الهدايا <span>←</span></a>
            <a href="/cart" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>
              سلة المشتريات ({totalItems}) <span>🛍️</span>
            </a>
            <a href="/account" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>
              {customer ? `حسابي (${customer.name})` : 'تسجيل الدخول'} <span>👤</span>
            </a>
            <a href="/#contact" onClick={() => setMobileOpen(false)} className={styles.mobileNavLink}>اتصلي بنا <span>←</span></a>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#aaa', fontSize: '0.85rem' }}>
              <div>{shopInfo.phone}</div>
              <div style={{ marginTop: '4px' }}>{shopInfo.email}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}