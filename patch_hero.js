const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Hero.js');

const heroContent = `import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styles from './Hero.module.css';
import { Sparkles } from 'lucide-react';

export default function Hero() {
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
        {banners.length > 0 ? (
          banners.map((url, idx) => (
            <img 
              key={idx}
              src={url}
              alt={\`Hero Banner \${idx}\`}
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
            src="/hero_video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className={styles.heroVideo}
          />
        )}
        <div className={styles.heroOverlay} />
        <div className={styles.heroGradientBottom} />
      </div>
      
      <div className={styles.heroDecorTL} />
      <div className={styles.heroDecorBR} />

      <div className={styles.heroContent}>
        <span className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Sparkles size={14} /> التشكيلة الحصرية 2026 <Sparkles size={14} /></span>
        <h1 className={styles.heroTitle}>
          زهرة بيسان
          <span className={styles.heroTitleAccent}>متجر إلكتروني فاخر</span>
        </h1>
        <p className={styles.heroSubtitle}>
          حيث تلتقي الأصالة بالفخامة — اكتشفي أحدث تشكيلاتنا
          <br />المصممة خصيصاً لتتوج إطلالتكِ بأبهى صورها
        </p>
        <div className={styles.heroCtas}>
          <a href="#collection" className="btn btn-primary">تسوقي التشكيلة الجديدة</a>
          <a href="#categories" className={styles.heroSecondaryLink}>
            <span>تصفحي الأقسام</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <div className={styles.scrollLine} />
        <span>مرري للأسفل</span>
      </div>
    </section>
  );
}
`;

fs.writeFileSync(filePath, heroContent);
console.log("Hero.js rewritten successfully!");
