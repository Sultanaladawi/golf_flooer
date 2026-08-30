import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import styles from './Hero.module.css';
import { Sparkles, ArrowLeft, Layers } from 'lucide-react';

export default function Hero() {
  const { t } = useLanguage();
  const heroVideoRef = useRef(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState('/images/1786522915955-411348681_1782578082455351.mp4');
  const [heroMediaType, setHeroMediaType] = useState('video');
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.playbackRate = 1.0;
    }
    
    // Fetch theme settings for dynamic hero video & banners
    axios.get('/api/settings/theme').then(res => {
      const data = res.data;
      if (data) {
        if (data.hero_video_url) {
          const vUrl = data.hero_video_url.startsWith('/') || data.hero_video_url.startsWith('http') 
            ? data.hero_video_url 
            : `/images/${data.hero_video_url}`;
          setHeroVideoUrl(vUrl);
        }
        if (data.hero_media_type) {
          setHeroMediaType(data.hero_media_type);
        }
        if (data.hero_banners) {
          try {
            const parsed = JSON.parse(data.hero_banners);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBanners(parsed);
            }
          } catch(e) {
            if (data.hero_banners) setBanners([data.hero_banners]);
          }
        }
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (banners.length > 1 && heroMediaType === 'slider') {
      const interval = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners, heroMediaType]);

  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroVideoWrap}>
        {heroMediaType === 'slider' && banners.length > 0 ? (
          banners.map((url, idx) => (
            <img 
              key={idx}
              src={url}
              alt={`Hero Banner ${idx}`}
              className={styles.heroVideo}
              style={{ 
                opacity: currentBanner === idx ? 1 : 0, 
                transition: 'opacity 1s ease-in-out',
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'
              }}
            />
          ))
        ) : (
          <video
            ref={heroVideoRef}
            key={`hero-${heroVideoUrl}`}
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            className={styles.heroVideoMain}
          />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroGradientBottom} />
      </div>
      
      <div className={styles.heroDecorTL} />
      <div className={styles.heroDecorBR} />

      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>
          <Sparkles size={16} /> التشكيلة الملكية الحصرية 2026
        </div>
        
        <h1 className={styles.heroTitle}>
          زهرة بيسان
          <span className={styles.heroSubtitle}>للعبايات والأزياء الفاخرة</span>
        </h1>
        
        <p className={styles.heroDesc}>
          حيثُ تلتقي الأصالة بالفخامة — اكتشفي أحدث تشكيلاتنا المصممة خصيصاً لتتوج إطلالتكِ بأبهى صور الأناقة الملكية.
        </p>

        <div className={styles.heroActions}>
          <a href="#collection" className={styles.heroBtnPrimary}>
            <span>تسوقي التشكيلة الجديدة</span>
            <span className={styles.btnArrow}>←</span>
          </a>
          <a href="#gallery" className={styles.heroBtnSecondary}>
            <span>معرض الأناقة الملكية</span>
            <span className={styles.btnArrow}>←</span>
          </a>
        </div>
      </div>
    </section>
  );
}
