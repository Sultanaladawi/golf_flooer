import { useState } from 'react';
import { shopInfo } from '../data/shopData';
import styles from './Footer.module.css';
import { 
  ShieldCheck, Sparkles, Truck, 
  Crown, Mail, Phone, ArrowUp, Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

const SnapchatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

export default function Footer({ onOpenPolicy }) {
  const { currentLang, t } = useLanguage();
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
      if (res.ok) {
        setSubMsg(t('subscribeSuccess'));
        setEmail('');
      } else {
        setSubMsg(t('error'));
      }
    } catch (err) {
      console.error(err);
      setSubMsg(t('error'));
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer} style={{ direction: currentLang.dir || 'rtl' }}>
      
      {/* 👑 Top Royal Assurances Banner */}
      <div className={styles.topAssuranceBanner}>
        <div className={styles.assuranceInner}>
          <div className={styles.assuranceItem}>
            <div className={styles.assuranceIcon}><Crown size={22} color="var(--gold, #c5a880)" /></div>
            <div>
              <strong className={styles.assuranceTitle}>{t('royalCraftsmanshipTitle')}</strong>
              <p className={styles.assuranceDesc}>{t('royalCraftsmanshipDesc')}</p>
            </div>
          </div>

          <div className={styles.assuranceItem}>
            <div className={styles.assuranceIcon}><Truck size={22} color="var(--gold, #c5a880)" /></div>
            <div>
              <strong className={styles.assuranceTitle}>{t('globalShippingTitle')}</strong>
              <p className={styles.assuranceDesc}>{t('globalShippingDesc')}</p>
            </div>
          </div>

          <div className={styles.assuranceItem}>
            <div className={styles.assuranceIcon}><Sparkles size={22} color="var(--gold, #c5a880)" /></div>
            <div>
              <strong className={styles.assuranceTitle}>{t('giftPackagingTitle')}</strong>
              <p className={styles.assuranceDesc}>{t('giftPackagingDesc')}</p>
            </div>
          </div>

          <div className={styles.assuranceItem}>
            <div className={styles.assuranceIcon}><ShieldCheck size={22} color="var(--gold, #c5a880)" /></div>
            <div>
              <strong className={styles.assuranceTitle}>{t('authenticityGuaranteeTitle')}</strong>
              <p className={styles.assuranceDesc}>{t('authenticityGuaranteeDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className={styles.inner}>

        {/* Column 1: Brand & Identity */}
        <div className={styles.brandCol}>
          <a href="#home" className={styles.logoLink} aria-label={shopInfo.name}>
            <img src="/logo.png" alt="زهرة بيسان" className={styles.logoImg} />
          </a>
          <p className={styles.brandDesc}>
            {t('footerBrandDesc')}
          </p>

          <div className={styles.socialGroup}>
            <a href={shopInfo.instagram} target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.socialIconInsta}`} aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={shopInfo.facebook} target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.socialIconFb}`} aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={shopInfo.tiktok} target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.socialIconTikTok}`} aria-label="TikTok">
              <TikTokIcon />
            </a>
            <a href={shopInfo.snapchat} target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.socialIconSnap}`} aria-label="Snapchat">
              <SnapchatIcon />
            </a>
          </div>

          <div className={styles.onlineBadge}>
            <span className={styles.liveDot} />
            <span>{t('globalOnlineStore')}</span>
          </div>

          {/* 📋 Commercial Register & Business Identity */}
          <div style={{ fontSize: '0.78rem', color: 'var(--gold-dim, #b8966c)', fontWeight: '700', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(197, 168, 128, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
            <span>📋 السجل التجاري: <strong>398210</strong></span>
            <span>🏛️ دار زهرة بيسان المسجلة رسمياً</span>
          </div>
        </div>

        {/* Column 2: Exclusive Collections */}
        <div className={styles.col}>
          <h4 className={styles.colHeader}>{t('exclusiveCollections')}</h4>
          <ul className={styles.linkList}>
            <li><a href="/#collection">{t('classicAbayas')}</a></li>
            <li><a href="/#collection">{t('occasionAbayas')}</a></li>
            <li><a href="/#collection">{t('winterCollection')}</a></li>
            <li><a href="/#collection">{t('dailyAbayas')}</a></li>
            <li><a href="/#collection">{t('newArrivals')}</a></li>
            <li><a href="/gift-cards">{t('royalGiftCards')}</a></li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Policies */}
        <div className={styles.col}>
          <h4 className={styles.colHeader}>{t('customerCare')}</h4>
          <ul className={styles.linkList}>
            <li><button onClick={() => onOpenPolicy && onOpenPolicy('returns')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0, textAlign: 'inherit' }}>{t('exchangeReturnPolicy')}</button></li>
            <li><button onClick={() => onOpenPolicy && onOpenPolicy('privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0, textAlign: 'inherit' }}>{t('privacyPolicy')}</button></li>
            <li><button onClick={() => onOpenPolicy && onOpenPolicy('about')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0, textAlign: 'inherit' }}>{t('aboutZahratBeesan')}</button></li>
            <li><a href="/account">{t('smartSizeGuide')}</a></li>
            <li><a href="/account">{t('vipLounge')}</a></li>
            <li><a href="/blog">{t('magazineAndElegance')}</a></li>
            <li><a href="/api/catalog/pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold, #c5a880)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{t('downloadPdfCatalog')}</a></li>
          </ul>

        </div>


        {/* Column 4: Direct Royal Contact */}
        <div className={styles.col}>
          <h4 className={styles.colHeader}>{t('consultationContact')}</h4>
          
          <a href={`mailto:${shopInfo.email}`} className={styles.contactItem}>
            <Mail size={16} color="var(--gold-dim)" />
            <span>{shopInfo.email}</span>
          </a>

          <a href={`https://wa.me/${shopInfo.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className={styles.contactItem} style={{ color: '#25D366' }}>
            <WhatsAppIcon />
            <span>{t('directWhatsApp')}: {shopInfo.phone}</span>
          </a>

          <a href={`tel:${shopInfo.phone}`} className={styles.contactItem}>
            <Phone size={16} color="var(--gold-dim)" />
            <span>{t('contactUs')}: {shopInfo.phone}</span>
          </a>
        </div>

        {/* Column 5: Royal Newsletter & Payments */}
        <div className={styles.col}>
          <h4 className={styles.colHeader}>{t('newsletter')}</h4>
          <p className={styles.newsletterDesc}>
            {t('newsletterDesc')}
          </p>
          
          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
            <div className={styles.inputWrap}>
              <input
                type="email"
                required
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.newsletterInput}
              />
              <button type="submit" disabled={subscribing} className={styles.subscribeBtn} aria-label="اشتراك">
                {subscribing ? '...' : <Send size={14} />}
              </button>
            </div>
            {subMsg && <p className={styles.subscribeSuccessMsg}>{subMsg}</p>}
          </form>

          {/* Payment Methods Badges */}
          <div className={styles.paymentSection}>
            <span className={styles.paymentTitle}>{t('securePaymentDesc')}</span>
            <div className={styles.paymentBadges}>
              <span className={styles.payChip}>💳 Visa</span>
              <span className={styles.payChip}>💳 Mastercard</span>
              <span className={styles.payChip}> Pay</span>
              <span className={styles.payChip}>mada</span>
              <span className={styles.payChip}>CliQ</span>
              <span className={styles.payChip}>💵 Cash</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            جميع الحقوق محفوظة © 2026 <strong>زهرة بيسان</strong> — العلامة الملكية المسجلة للعبايات والأزياء الفاخرة | سجل تجاري رقم: <strong>398210</strong>.
          </p>
          <button onClick={scrollToTop} className={styles.scrollTopBtn} aria-label="العودة للأعلى">
            <span>العودة للأعلى</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}