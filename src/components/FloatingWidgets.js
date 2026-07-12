import { useState } from 'react';
import { shopInfo } from '../data/shopData';

/* ────────── SVG Icons ────────── */
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
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

/* ────────────────────────────────────────────────
   Social Sidebar — left side, vertically centered
──────────────────────────────────────────────── */
const socialLinks = [
  {
    label: 'Instagram',
    href: shopInfo.instagram || 'https://instagram.com/zahratbeesan',
    icon: <InstagramIcon />,
    bg: '#E1306C',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/zahratbeesan',
    icon: <FacebookIcon />,
    bg: '#1877F2',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@zahratbeesan',
    icon: <TikTokIcon />,
    bg: '#010101',
  },
  {
    label: 'WhatsApp',
    href: `https://wa.me/962${shopInfo.phone?.replace(/\D/g, '').replace(/^0+/, '')}`,
    icon: <WhatsAppIcon />,
    bg: '#25D366',
  },
];

function SocialSidebar() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
    }}>
      {socialLinks.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          onMouseEnter={() => setHovered(s.label)}
          onMouseLeave={() => setHovered(null)}
          title={s.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            background: s.bg,
            color: '#fff',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: hovered === s.label ? 'translateX(6px)' : 'translateX(0)',
            boxShadow: hovered === s.label
              ? `3px 3px 14px ${s.bg}88`
              : '1px 1px 6px rgba(0,0,0,0.3)',
            borderRadius: '0 8px 8px 0',
            marginBottom: '2px',
          }}
        >
          {s.icon}
        </a>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   WhatsApp floating button — bottom right
──────────────────────────────────────────────── */
function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const waUrl = `https://wa.me/962${shopInfo.phone?.replace(/\D/g, '').replace(/^0+/, '')}?text=${encodeURIComponent('مرحباً، أودّ الاستفسار عن المنتجات 🌸')}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="واتساب"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: hovered ? '160px' : '52px',
        height: '52px',
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        borderRadius: hovered ? '26px' : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '0.82rem',
        fontWeight: '700',
        boxShadow: hovered
          ? '0 6px 25px rgba(37,211,102,0.55)'
          : '0 4px 15px rgba(37,211,102,0.4)',
        zIndex: 9100,
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingRight: hovered ? '16px' : 0,
        paddingLeft: hovered ? '12px' : 0,
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <WhatsAppIcon />
      </span>
      <span style={{
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        fontSize: '0.8rem',
      }}>
        واتساب
      </span>
    </a>
  );
}

/* ────────────────────────────────────────────────
   Contact Us floating button — bottom right above WhatsApp
──────────────────────────────────────────────── */
function ContactButton() {
  const [hovered, setHovered] = useState(false);

  const scrollToContact = (e) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <a
      href="#contact"
      onClick={scrollToContact}
      aria-label="تواصل معنا"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '155px',
        right: '20px',
        width: hovered ? '160px' : '52px',
        height: '52px',
        background: hovered
          ? 'linear-gradient(135deg, var(--gold, #c5a880), var(--espresso, #3b2515))'
          : 'linear-gradient(135deg, rgba(197,168,128,0.95), rgba(166,134,93,0.95))',
        borderRadius: hovered ? '26px' : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: hovered ? '#fff' : '#3b2515',
        textDecoration: 'none',
        fontSize: '0.82rem',
        fontWeight: '700',
        boxShadow: hovered
          ? '0 6px 25px rgba(197,168,128,0.6)'
          : '0 4px 15px rgba(197,168,128,0.4)',
        zIndex: 9100,
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        paddingRight: hovered ? '16px' : 0,
        paddingLeft: hovered ? '12px' : 0,
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <PhoneIcon />
      </span>
      <span style={{
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        fontSize: '0.8rem',
      }}>
        تواصل معنا
      </span>
    </a>
  );
}

/* ────────── Default export ────────── */
export default function FloatingWidgets() {
  return (
    <>
      <SocialSidebar />
      <WhatsAppButton />
      <ContactButton />
    </>
  );
}
