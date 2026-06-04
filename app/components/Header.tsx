"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState, useRef } from 'react';
import styles from './Header.module.css';
import CartDrawer from './CartDrawer';

const countries = [
  { code: 'JO', name: 'الأردن', flag: '🇯🇴' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪' },
];

const currencies = [
  { code: 'JOD', name: 'د.أ', label: 'JOD' },
  { code: 'SAR', name: 'ر.س', label: 'SAR' },
  { code: 'AED', name: 'د.إ', label: 'AED' },
];

export default function Header() {
  const { cart, currency, setCurrency, country, setCountry } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const countryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHome = pathname === '/';
  const isHeaderSolid = scrolled || !isHome;

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className={`${styles.header} ${isHeaderSolid ? styles.headerScrolled : ''}`}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              <span>✦ شحن مجاني للطلبات فوق 500 د.أ</span>
              <span>✦ خصم 15% على طلبك الأول عند الاشتراك</span>
              <span>✦ توصيل خلال 24 ساعة داخل المملكة</span>
              <span>✦ تطريز يدوي 100٪ بضمان الجودة</span>
              <span>✦ شحن مجاني للطلبات فوق 500 د.أ</span>
              <span>✦ خصم 15% على طلبك الأول عند الاشتراك</span>
              <span>✦ توصيل خلال 24 ساعة داخل المملكة</span>
              <span>✦ تطريز يدوي 100٪ بضمان الجودة</span>
            </div>
          </div>
          <div className={styles.selectors}>
            {/* Country Selector */}
            <div className={styles.dropdownContainer} ref={countryRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowCurrencyDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showCountryDropdown}
              >
                <span>{countries.find(c => c.code === country)?.flag} {countries.find(c => c.code === country)?.name}</span>
                <ChevronDown size={12} className={`${styles.chevron} ${showCountryDropdown ? styles.chevronOpen : ''}`} />
              </button>
              {showCountryDropdown && (
                <div className={styles.dropdownMenu}>
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      className={`${styles.dropdownOption} ${country === c.code ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setCountry(c.code);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <span className={styles.flagSpan}>{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className={styles.dropdownContainer} ref={currencyRef}>
              <button
                className={styles.dropdownTrigger}
                onClick={() => {
                  setShowCurrencyDropdown(!showCurrencyDropdown);
                  setShowCountryDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showCurrencyDropdown}
              >
                <span>{currencies.find(c => c.code === currency)?.label} {currencies.find(c => c.code === currency)?.name}</span>
                <ChevronDown size={12} className={`${styles.chevron} ${showCurrencyDropdown ? styles.chevronOpen : ''}`} />
              </button>
              {showCurrencyDropdown && (
                <div className={styles.dropdownMenu}>
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      className={`${styles.dropdownOption} ${currency === c.code ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setCurrency(c.code);
                        setShowCurrencyDropdown(false);
                      }}
                    >
                      <span className={styles.currencyLabel}>{c.label}</span>
                      <span className={styles.optionName}>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.iconBtn} aria-label="القائمة"><Menu size={22} /></button>
          <button className={styles.iconBtn} aria-label="البحث"><Search size={22} /></button>
        </div>

        <Link href="/" className={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/logo.png" 
              alt="لوجو زهرة الخليج" 
              width="40" 
              height="40" 
              style={{ objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--gold-primary)' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className={styles.brandMain}>زهرة الخليج</span>
              <span className={styles.brandSub}>للمطرزات الشرقية</span>
            </div>
          </div>
        </Link>

        <div className={styles.navRight}>
          <Link href="/admin" className={styles.iconBtn} aria-label="لوحة التحكم الإدارية">
            <User size={22} />
          </Link>
          <button 
            className={styles.iconBtn} 
            aria-label="سلة التسوق"
            onClick={() => setIsCartOpen(true)}
          >
            <div className={styles.cartIconWrapper}>
              <ShoppingBag size={22} />
              {cartItemsCount > 0 && (
                <span className={styles.cartBadge}>{cartItemsCount}</span>
              )}
            </div>
          </button>
        </div>
      </nav>

      {/* Mega Menu Links */}
      <div className={styles.megaMenu}>
        <div className={styles.megaMenuInner}>
          <Link href="/shop" className={styles.menuLink}>الكل</Link>
          <Link href="/shop?category=new" className={styles.menuLink}>وصل حديثاً</Link>
          <Link href="/shop?category=winter" className={styles.menuLink}>تشكيلة الشتاء</Link>
          <Link href="/shop?category=classic" className={styles.menuLink}>كلاسيك</Link>
          <Link href="/shop?category=occassions" className={styles.menuLink}>مناسبات</Link>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
