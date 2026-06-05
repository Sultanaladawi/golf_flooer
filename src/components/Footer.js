import { useState } from 'react';
import { shopInfo } from '../data/shopData';
import styles from './Footer.module.css';

const QUICK = [
  { label: 'الرئيسية',    href: '#home' },
  { label: 'التشكيلة',    href: '#collection' },
  { label: 'معرضنا',      href: '#gallery' },
  { label: 'اتصلي بنا',   href: '#contact' },
];

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.04-8.35a8.2 8.2 0 0 0 4.8 1.54V5.01a4.85 4.85 0 0 1-1-.32z"/>
  </svg>
);

const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:'6px',flexShrink:0,verticalAlign:'middle'}}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft:'6px',flexShrink:0,verticalAlign:'middle'}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSubMsg('✓ تم الاشتراك في النشرة البريدية بنجاح!');
        setEmail('');
      } else {
        setSubMsg(data.error || 'عذراً، فشل الاشتراك.');
      }
    } catch (err) {
      console.error(err);
      setSubMsg('حدث خطأ ما، يرجى المحاولة لاحقاً.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className={styles.footer} style={{ direction: 'rtl', background: 'var(--cream-dark)' }}>
      <div className={styles.inner}>

        {/* Brand */}
        <div className={styles.brand} style={{ textAlign: 'right' }}>
          <a href="#home" className={styles.logo} aria-label={shopInfo.name}>
            <img src="/logo.png" alt="يافا للمطرزات الشرقية" style={{ height: '60px', width: 'auto', borderRadius: '10px' }} />
          </a>
          <p className={styles.brandDesc} style={{ color: 'var(--text-secondary)', marginTop: '15px' }}>
            يافا للمطرزات الشرقية — تصاميم حصرية وخامات فاخرة تعكس الأصالة والوقار للمرأة العربية. نوصّل لجميع دول العالم.
          </p>

          {/* Shipping badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {['🌍 توصيل دولي', '🔒 دفع آمن', '↩️ إرجاع مجاني'].map(b => (
              <span key={b} style={{
                fontSize: '0.75rem', fontWeight: '700',
                padding: '4px 10px', borderRadius: '20px',
                background: 'var(--gold-glow)',
                border: '1px solid var(--border)',
                color: 'var(--espresso)'
              }}>{b}</span>
            ))}
          </div>

          {/* Social */}
          <div className={styles.socialGroup} style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <a href={shopInfo.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="TikTok">
              <TikTokIcon />
            </a>
          </div>

          {/* Newsletter */}
          <div style={{ marginTop: '25px', maxWidth: '300px' }}>
            <p style={{ color: 'var(--espresso)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
              اشتركي لتصلكِ العروض الحصرية:
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email" required
                placeholder="بريدكِ الإلكتروني"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: 'var(--white)', border: '1px solid var(--border)',
                  color: 'var(--espresso)', padding: '8px 12px',
                  borderRadius: '8px', fontSize: '0.85rem', flex: 1, outline: 'none'
                }}
              />
              <button type="submit" disabled={subscribing}
                style={{ background: 'var(--gold)', color: 'var(--espresso)', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                {subscribing ? '...' : 'اشتراك'}
              </button>
            </form>
            {subMsg && <p style={{ color: subMsg.startsWith('✓') ? '#27ae60' : '#dc3545', fontSize: '0.8rem', marginTop: '5px', fontWeight: 'bold' }}>{subMsg}</p>}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.col} style={{ textAlign: 'right' }}>
          <h4 style={{ color: 'var(--gold-dim)', marginBottom: '15px' }}>روابط سريعة</h4>
          <ul style={{ padding: 0 }}>
            {QUICK.map(({ label, href }) => (
              <li key={label} style={{ marginBottom: '10px', listStyle: 'none' }}>
                <a href={href} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none', fontSize: '0.95rem' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <h4 style={{ color: 'var(--gold-dim)', marginBottom: '15px', marginTop: '30px' }}>العملات المقبولة</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['JOD 🇯🇴', 'USD 🇺🇸', 'SAR 🇸🇦', 'AED 🇦🇪', 'EUR 🇪🇺', 'GBP 🇬🇧', 'KWD 🇰🇼'].map(c => (
              <span key={c} style={{
                fontSize: '0.75rem', padding: '3px 8px',
                borderRadius: '6px', border: '1px solid var(--border)',
                color: 'var(--espresso)', background: 'var(--white)',
                fontWeight: '600'
              }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className={styles.col} style={{ textAlign: 'right' }}>
          <h4 style={{ color: 'var(--gold-dim)', marginBottom: '15px' }}>تواصلي معنا</h4>

          <a href={`mailto:${shopInfo.email}`} className={styles.emailLink}
            style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px', textDecoration: 'none' }}
          >
            <EnvelopeIcon /> {shopInfo.email}
          </a>

          <a href={`https://wa.me/${shopInfo.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#25D366'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <WhatsAppIcon /> واتساب: {shopInfo.phone}
          </a>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '14px', background: 'var(--gold-glow)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: '800', color: 'var(--espresso)', marginBottom: '6px', fontSize: '0.9rem' }}>
              🌍 نوصّل لجميع دول العالم
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
              الأردن • السعودية • الإمارات • الكويت<br />
              قطر • البحرين • مصر • وجميع دول العالم
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '12px', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>🔒</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--espresso)', fontSize: '0.85rem' }}>دفع آمن ومشفّر</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Visa · Mastercard · Paypal · COD</div>
            </div>
          </div>
        </div>

      </div>

      <div className={styles.bottom} style={{
        borderTop: '1px solid var(--divider)', color: 'var(--text-muted)',
        paddingTop: '20px', display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px'
      }}>
        <span>© {new Date().getFullYear()} يافا للمطرزات الشرقية. جميع الحقوق محفوظة.</span>
        <span>Yafa Eastern Embroidery — Worldwide Shipping</span>
      </div>
    </footer>
  );
}