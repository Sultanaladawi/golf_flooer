import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const heroVideoRef = useRef(null);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.playbackRate = 0.75;
    }
  }, []);

  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroVideoWrap}>
        <video
          ref={heroVideoRef}
          src="/hero_video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className={styles.heroVideo}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroGradientBottom} />
      </div>
      
      <div className={styles.heroDecorTL} />
      <div className={styles.heroDecorBR} />

      <div className={styles.heroContent}>
        <span className="section-label">✦ التشكيلة الحصرية 2026 ✦</span>
        <h1 className={styles.heroTitle}>
          يافا اونلاين
          <span className={styles.heroTitleAccent}>للمطرزات الشرقية</span>
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