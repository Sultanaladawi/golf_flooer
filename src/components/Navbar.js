import { useState, useEffect, useRef } from 'react';
import { shopInfo } from '../data/shopData';
import { useCart } from '../context/CartContext';
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
  { label: 'اتصلي بنا', href: '#contact' },
];

export default function Navbar({ onCartOpen }) {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const [offers, setOffers]       = useState([]);
  const [bounce, setBounce]       = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const currencyRef               = useRef(null);
  const { totalItems }            = useCart();
  const { currency, setCurrency, currencies } = useCurrency();

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
    const onEsc = (e) => { if (e.key === 'Escape') { setOpen(false); setShowCurrency(false); } };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  // Close currency dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setShowCurrency(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const textColor = scrolled ? 'var(--espresso)' : '#fff';
  const logoStyle = {
    height: '52px',
    width: 'auto',
    objectFit: 'contain',
    borderRadius: '10px',
    transition: 'all 0.4s ease',
    ...(scrolled
      ? { background: '#1a1a1a', padding: '2px 4px' }
      : { mixBlendMode: 'lighten' }),
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
          <a href="#home" aria-label="يافا للمطرزات الشرقية" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="يافا للمطرزات الشرقية" style={logoStyle} />
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
            </ul>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Google Translate Widget */}
            <div
              id="google_translate_element"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: scrolled ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.12)',
                border: scrolled ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.25)',
                borderRadius: '20px',
                padding: '4px 10px',
                color: textColor,
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                minWidth: '50px'
              }}
              title="Translate to any language"
            />


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
          <button className={styles.mobileCartLink} onClick={() => { setOpen(false); onCartOpen(); }}>
            <BagIcon />
            <span>سلتي</span>
            {totalItems > 0 && <span className={styles.mobileBadge}>{totalItems}</span>}
          </button>
        </nav>

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