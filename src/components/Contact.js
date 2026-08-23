import React from 'react';
import { shopInfo } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, Sparkles, Clock, Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Contact.module.css';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#E1306C">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.04-8.35a8.2 8.2 0 0 0 4.8 1.54V5.01a4.85 4.85 0 0 1-1-.32z"/>
  </svg>
);

const SnapchatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#000000">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Contact() {
  const { t, currentLang } = useLanguage();
  const [infoRef, infoVis] = useReveal();
  const [channelsRef, channelsVis] = useReveal();

  const isRtl = currentLang.dir !== 'ltr';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const socialLinks = [
    {
      id: 'instagram',
      name: 'إنستغرام',
      nameEn: 'Instagram',
      handle: shopInfo.instagramHandle || '@zahratbeesanshop',
      url: shopInfo.instagram || 'https://www.instagram.com/zahratbeesanshop/',
      desc: 'جلسات التصوير الحصرية، كولكشن المناسبات، وأحدث الإطلالات الملكية.',
      icon: <InstagramIcon />,
      color: '#E1306C',
      bgColor: 'rgba(225, 48, 108, 0.1)',
      btnText: 'متابعة على إنستغرام'
    },
    {
      id: 'tiktok',
      name: 'تيك توك',
      nameEn: 'TikTok',
      handle: '@zahratbeesanshop',
      url: shopInfo.tiktok || 'https://www.tiktok.com/@zahratbeesanshop',
      desc: 'فيديوهات بدقة عالية لاستعراض انسيابية الأقمشة ودقة التطريز اليدوي.',
      icon: <TikTokIcon />,
      color: '#000000',
      bgColor: 'rgba(0, 0, 0, 0.08)',
      btnText: 'مشاهدة على تيك توك'
    },
    {
      id: 'snapchat',
      name: 'سناب شات',
      nameEn: 'Snapchat',
      handle: '@zahratbeesan',
      url: shopInfo.snapchat || 'https://www.snapchat.com/add/zahratbeesan',
      desc: 'كواليس يومية حصرية وتغطيات فورية للقطع والتصاميم الجديدة.',
      icon: <SnapchatIcon />,
      color: '#FFFC00',
      iconColor: '#000000',
      bgColor: 'rgba(255, 252, 0, 0.25)',
      btnText: 'إضافة على سناب شات'
    },
    {
      id: 'facebook',
      name: 'فيسبوك',
      nameEn: 'Facebook',
      handle: 'Zahrat Beesan',
      url: shopInfo.facebook || 'https://web.facebook.com/profile.php?id=61592655440235',
      desc: 'مجتمع عميلاتنا الفاخر، آراء السيدات، وآخر الأخبار والمناسبات.',
      icon: <FacebookIcon />,
      color: '#1877F2',
      bgColor: 'rgba(24, 119, 242, 0.1)',
      btnText: 'زيارة الصفحة'
    }
  ];

  const whatsappUrl = `https://wa.me/962796697413?text=${encodeURIComponent('مرحباً زهرة بيسان 🌸، يسعدني التواصل معكم للاستفسار عن تشكيلة العبايات والمقاسات.')}`;

  return (
    <section className={styles.section} id="contact" style={{ padding: '80px 0', backgroundColor: '#faf9f6', direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className="section-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(197, 168, 128, 0.12)',
            color: 'var(--gold-dim, #a67c48)',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '800',
            marginBottom: '12px'
          }}>
            <Sparkles size={16} />
            <span>تواصل VIP وخدمة العميلات</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-primary, serif)',
            fontSize: '2.4rem',
            fontWeight: '900',
            color: 'var(--espresso, #1a1a1a)',
            margin: '0 0 12px 0'
          }}>
            يسعدنا تواصلكِ معنا
          </h2>
          <p style={{
            maxWidth: '650px',
            margin: '0 auto',
            color: '#666',
            fontSize: '1.02rem',
            lineHeight: '1.7'
          }}>
            فريق مستشارات الأناقة في <strong>زهرة بيسان</strong> متواجد دائماً للإجابة على استفساراتكِ، المساعدة في اختيار المقاس المناسب، وتنسيق إطلالتكِ الملكية مباشرة عبر الواتساب ومواقع التواصل.
          </p>
        </div>

        {/* Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          
          {/* ── WhatsApp VIP Hero Card ── */}
          <div 
            ref={infoRef}
            className={`reveal ${infoVis ? 'vis' : ''}`}
            style={{
              background: 'linear-gradient(145deg, #181512 0%, #2a221a 100%)',
              borderRadius: '28px',
              padding: '40px 32px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid rgba(197, 168, 128, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Glow Accent */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '-40px',
              width: '180px',
              height: '180px',
              background: 'radial-gradient(circle, rgba(197, 168, 128, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(37, 211, 102, 0.35)'
                }}>
                  <MessageCircle size={32} />
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#e8decb'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#25D366', display: 'inline-block', boxShadow: '0 0 8px #25D366' }} />
                  <span>متواجدون للرد الفوري 24/7</span>
                </div>
              </div>

              <h3 style={{
                fontFamily: 'var(--font-primary, serif)',
                fontSize: '1.65rem',
                fontWeight: '900',
                color: 'var(--gold-light, #f0dfc8)',
                margin: '0 0 10px 0'
              }}>
                المستشارة الشخصية عبر واتساب
              </h3>
              
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '16px', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                +962 7 9669 7413
              </div>

              <p style={{ color: '#d1c7bc', fontSize: '0.94rem', lineHeight: '1.7', margin: '0 0 24px 0' }}>
                تواصلي معنا مباشرة عبر الواتساب للحصول على استشارة فورية وتنسيق إطلالتكِ، الإجابة عن أدق تفاصيل الأقمشة والمقاسات، ومتابعة طلباتكِ الخاصة خطوة بخطوة.
              </p>

              {/* Feature Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#eae4dc' }}>
                  <span style={{ color: 'var(--gold, #c5a880)', fontWeight: 'bold' }}>✓</span>
                  <span>مساعدة مخصصة في اختيار المقاس المناسب</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#eae4dc' }}>
                  <span style={{ color: 'var(--gold, #c5a880)', fontWeight: 'bold' }}>✓</span>
                  <span>تأكيد الطلبات وتتبع الشحن الدولي والمحلي</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#eae4dc' }}>
                  <span style={{ color: 'var(--gold, #c5a880)', fontWeight: 'bold' }}>✓</span>
                  <span>استقبال الطلبات الخاصة والمقاسات المحددة</span>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '16px 28px',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: '900',
                fontSize: '1.05rem',
                boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.4)';
              }}
            >
              <MessageCircle size={22} />
              <span>محادثة فورية عبر واتساب</span>
              <ArrowIcon size={18} />
            </a>
          </div>

          {/* ── Social Media Channels Grid ── */}
          <div
            ref={channelsRef}
            className={`reveal ${channelsVis ? 'vis' : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              justifyContent: 'space-between'
            }}
          >
            {socialLinks.map(social => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid rgba(197, 168, 128, 0.25)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(197, 168, 128, 0.2)';
                  e.currentTarget.style.borderColor = 'var(--gold, #c5a880)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.25)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: social.bgColor,
                    color: social.iconColor || social.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {social.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--espresso, #1a1a1a)' }}>
                        {social.name}
                      </h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--gold-dim, #a67c48)', fontWeight: '700', direction: 'ltr' }}>
                        {social.handle}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: '#666', lineHeight: '1.4' }}>
                      {social.desc}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(197, 168, 128, 0.1)',
                  color: 'var(--gold-dim, #9b723e)',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>زيارة</span>
                  <ArrowIcon size={14} />
                </div>
              </a>
            ))}
          </div>

        </div>

        {/* Global Delivery Note */}
        <div style={{
          marginTop: '45px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '18px 24px',
          border: '1px solid rgba(197, 168, 128, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--espresso, #2c1d11)', fontWeight: '700', fontSize: '0.92rem' }}>
            <Globe size={20} color="var(--gold-dim, #a67c48)" />
            <span>متجر إلكتروني عالمي — شحن سريع لكافة دول العالم</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--espresso, #2c1d11)', fontWeight: '700', fontSize: '0.92rem' }}>
            <Clock size={20} color="var(--gold-dim, #a67c48)" />
            <span>رد فوري خلال دقائق عبر الواتساب</span>
          </div>
        </div>

      </div>
    </section>
  );
}