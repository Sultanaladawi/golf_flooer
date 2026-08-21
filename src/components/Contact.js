import React from 'react';
import { shopInfo } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, Sparkles, Clock, Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './Contact.module.css';

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
      icon: <i className="fab fa-instagram" style={{ fontSize: '1.4rem' }} />,
      color: '#E1306C',
      bgColor: 'rgba(225, 48, 108, 0.08)',
      btnText: 'متابعة على إنستغرام'
    },
    {
      id: 'tiktok',
      name: 'تيك توك',
      nameEn: 'TikTok',
      handle: '@zahratbeesanshop',
      url: shopInfo.tiktok || 'https://www.tiktok.com/@zahratbeesanshop',
      desc: 'فيديوهات بدقة عالية لاستعراض انسيابية الأقمشة ودقة التطريز اليدوي.',
      icon: <i className="fab fa-tiktok" style={{ fontSize: '1.4rem' }} />,
      color: '#000000',
      bgColor: 'rgba(0, 0, 0, 0.06)',
      btnText: 'مشاهدة على تيك توك'
    },
    {
      id: 'snapchat',
      name: 'سناب شات',
      nameEn: 'Snapchat',
      handle: '@zahratbeesan',
      url: shopInfo.snapchat || 'https://www.snapchat.com/add/zahratbeesan',
      desc: 'كواليس يومية حصرية وتغطيات فورية للقطع والتصاميم الجديدة.',
      icon: <i className="fab fa-snapchat-ghost" style={{ fontSize: '1.4rem' }} />,
      color: '#FFFC00',
      iconColor: '#e6b800',
      bgColor: 'rgba(255, 252, 0, 0.12)',
      btnText: 'إضافة على سناب شات'
    },
    {
      id: 'facebook',
      name: 'فيسبوك',
      nameEn: 'Facebook',
      handle: 'Zahrat Beesan',
      url: shopInfo.facebook || 'https://web.facebook.com/profile.php?id=61592655440235',
      desc: 'مجتمع عميلاتنا الفاخر، آراء السيدات، وآخر الأخبار والمناسبات.',
      icon: <i className="fab fa-facebook-f" style={{ fontSize: '1.3rem' }} />,
      color: '#1877F2',
      bgColor: 'rgba(24, 119, 242, 0.08)',
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