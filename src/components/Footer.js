import React from 'react';
import { shopInfo } from '../data/shopData';
import styles from './Footer.module.css';
import { useLanguage } from '../context/LanguageContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

// Icons
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function Footer({ onOpenPolicy }) {
  const { currentLang } = useLanguage();
  const { customer, openLoginModal, logout } = useCustomerAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer} style={{ direction: currentLang.dir || 'rtl' }}>
      {/* Floating Scroll to top Button (Assaf Style) */}
      <button 
        onClick={scrollToTop} 
        className={styles.scrollToTopBtn}
        aria-label="العودة للأعلى"
        title="العودة للأعلى"
      >
        ↑
      </button>

      <div className={styles.inner}>
        {/* ── Column 1: Brand & Official Tax / Registration Seals ── */}
        <div className={styles.brandCol}>
          <h2 className={styles.brandLogo}>ZAHRAT BEESAN</h2>
          <p className={styles.brandSlogan}>.Either greatness, or nothing.</p>

          <div className={styles.trustBadgesRow}>
            <div className={styles.trustBadgeBox}>
              <span className={styles.trustBadgeLabel}>السجل التجاري</span>
              <span className={styles.trustBadgeVal}>617219</span>
            </div>

            <div className={styles.trustBadgeBox}>
              <span className={styles.trustBadgeLabel}>الرقم الضريبي</span>
              <span className={styles.trustBadgeVal}>81492545</span>
            </div>

            <div className={styles.saudiBadgeIcon} title="توثيق التجارة الإلكترونية المعتمد">
              🌴
            </div>
          </div>
        </div>

        {/* ── Column 2: حسابي (My Account) ── */}
        <div className={styles.col}>
          <h3 className={styles.colHeader}>حسابي</h3>
          <ul className={styles.linkList}>
            <li><a href="/account">الاشعارات</a></li>
            <li><a href="/account">الطلبات</a></li>
            <li><a href="/account">طلبات بانتظار الدفع</a></li>
            <li><a href="/account">الأمنيات والمفضلة</a></li>
            <li>
              {customer ? (
                <a href="/account">حسابي ({customer.name})</a>
              ) : (
                <button type="button" onClick={openLoginModal}>تسجيل الدخول / حسابي</button>
              )}
            </li>
            {customer && (
              <li>
                <button 
                  type="button" 
                  onClick={logout} 
                  style={{ color: '#e63946', fontWeight: 'bold' }}
                >
                  تسجيل الخروج
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* ── Column 3: روابط مهمة (Important Links) ── */}
        <div className={styles.col}>
          <h3 className={styles.colHeader}>روابط مهمة</h3>
          <ul className={styles.linkList}>
            <li><button type="button" onClick={() => onOpenPolicy && onOpenPolicy('about')}>من نحن</button></li>
            <li><button type="button" onClick={() => onOpenPolicy && onOpenPolicy('privacy')}>معلومات الشحن</button></li>
            <li><button type="button" onClick={() => onOpenPolicy && onOpenPolicy('privacy')}>سياسة الخصوصية</button></li>
            <li><button type="button" onClick={() => onOpenPolicy && onOpenPolicy('returns')}>معلومات الارجاع والاستبدال</button></li>
            <li><a href="/#contact">للشكاوي والاستفسارات</a></li>
            <li><a href="/blog">مدونة زهرة بيسان</a></li>
            <li><a href="/gift-cards">بطاقات الهدايا الملكية</a></li>
            <li><a href="/#gallery">معرض وتشكيلات زهرة بيسان</a></li>
          </ul>
        </div>

        {/* ── Column 4: تواصل معنا (Contact Us - Assaf Style) ── */}
        <div className={styles.col}>
          <h3 className={styles.colHeader}>تواصل معنا</h3>

          <a 
            href={`https://wa.me/${shopInfo.phone?.replace(/\D/g,'')}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.contactBoxRow}
          >
            <div className={styles.contactBoxIcon}>
              <WhatsAppIcon />
            </div>
            <span dir="ltr">{shopInfo.phone}</span>
          </a>

          <a 
            href={`mailto:${shopInfo.email}`} 
            className={styles.contactBoxRow}
          >
            <div className={styles.contactBoxIcon}>
              <MailIcon />
            </div>
            <span dir="ltr">{shopInfo.email}</span>
          </a>
        </div>
      </div>

      {/* ── Bottom Bar: Copyright, Payment Badges & Social Icons ── */}
      <div className={styles.bottomBar}>
        {/* Right: Copyright */}
        <p className={styles.copyrightText}>
          الحقوق محفوظة | ZAHRAT BEESAN - Greatness or Nothing 2026
        </p>

        {/* Center: Payment Gateway Badges (Assaf Clean Style) */}
        <div className={styles.paymentBadgesRow}>
          {/* Mada */}
          <div className={styles.payBadge}>
            <span style={{ color: '#007A3D', fontWeight: '900' }}>mada مدى</span>
          </div>

          {/* Visa & MasterCard */}
          <div className={styles.payBadge}>
            <span style={{ color: '#1A1F71', fontWeight: '900' }}>VISA</span>
            <span style={{ color: '#EB001B', marginLeft: '4px', fontWeight: '900' }}>• MC</span>
          </div>

          {/* Apple Pay */}
          <div className={styles.payBadge}>
            <span> Pay</span>
          </div>

          {/* STC Pay */}
          <div className={styles.payBadge}>
            <span style={{ color: '#4F008C', fontWeight: '900' }}>stc pay</span>
          </div>

          {/* Tabby */}
          <div className={styles.payBadge} style={{ background: '#3EFEB3', color: '#000' }}>
            <span style={{ fontWeight: '900' }}>tabby</span>
          </div>

          {/* Tamara */}
          <div className={styles.payBadge} style={{ background: '#FFAA00', color: '#000' }}>
            <span style={{ fontWeight: '900' }}>tamara</span>
          </div>

          {/* CliQ */}
          <div className={styles.payBadge} style={{ color: '#D4AF37', fontWeight: '900' }}>
            <span>CliQ كليك</span>
          </div>

          {/* Cash on Delivery */}
          <div className={styles.payBadge}>
            <span>💵 عند الاستلام</span>
          </div>

          {/* Business Platform Certification Badge */}
          <div className={styles.payBadge} style={{ border: '1px solid #c5a880' }}>
            <span style={{ color: '#b8943a' }}>🇸🇦 🇯🇴 موثق رسمياً</span>
          </div>
        </div>

        {/* Left: Square Social Media Icons (Assaf Style) */}
        <div className={styles.socialSquareGroup}>
          <a href={shopInfo.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialSquareBtn} aria-label="Instagram">
            <i className="fab fa-instagram" />
          </a>
          <a href={shopInfo.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialSquareBtn} aria-label="Facebook">
            <i className="fab fa-facebook-f" />
          </a>
          <a href={shopInfo.tiktok} target="_blank" rel="noopener noreferrer" className={styles.socialSquareBtn} aria-label="TikTok">
            <i className="fab fa-tiktok" />
          </a>
          <a href={shopInfo.snapchat} target="_blank" rel="noopener noreferrer" className={styles.socialSquareBtn} aria-label="Snapchat">
            <i className="fab fa-snapchat-ghost" />
          </a>
        </div>
      </div>
    </footer>
  );
}