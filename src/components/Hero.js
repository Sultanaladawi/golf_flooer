import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import styles from './Hero.module.css';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();
  const heroVideoRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.playbackRate = 0.75;
    }
    
    // Fetch theme settings for banners
    axios.get('/api/settings/theme').then(res => {
      const data = res.data;
      if (data && data.hero_banners) {
        try {
          const parsed = JSON.parse(data.hero_banners);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBanners(parsed);
          }
        } catch(e) {
          if (data.hero_banners) setBanners([data.hero_banners]);
        }
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds
      return () => clearInterval(interval);
    }
  }, [banners]);

  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroVideoWrap}>
        <video
          ref={heroVideoRef}
          src="/hero_video.mp4?v=sultana_royal_2026"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
          className={styles.heroVideo}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroGradientBottom} />
      </div>
      
      <div className={styles.heroDecorTL} />
      <div className={styles.heroDecorBR} />

      <div className={styles.heroContent}>
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--gold, #c5a880)', 
          backgroundColor: 'rgba(197, 168, 128, 0.15)', 
          border: '1px solid rgba(197, 168, 128, 0.35)', 
          padding: '6px 18px', 
          borderRadius: '30px', 
          fontSize: '0.88rem', 
          fontWeight: 800, 
          letterSpacing: '0.08em', 
          marginBottom: '1rem', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', 
          backdropFilter: 'blur(6px)' 
        }}>
          <Sparkles size={14} color="var(--gold)" /> {t('heroTag')} <Sparkles size={14} color="var(--gold)" />
        </span>
        <h1 className={styles.heroTitle}>
          {t('heroBrand')}
          <span className={styles.heroTitleAccent}>{t('heroSubtitleAccent')}</span>
        </h1>
        <p className={styles.heroSubtitle}>
          {t('heroDescription')}
        </p>
        <div className={styles.heroCtas}>
          <a href="#collection" className="btn btn-primary">{t('shopNewCollection')}</a>
          <a href="#categories" className={styles.heroSecondaryLink}>
            <span>{t('browseCategories')}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
