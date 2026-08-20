import React, { useState, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useLanguage } from '../context/LanguageContext';
import styles from './About.module.css';
import { Sparkles, Award, ShieldCheck, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function About() {
  const { t, currentLang } = useLanguage();
  const [imgRef,  imgVis]  = useReveal();
  const [textRef, textVis] = useReveal();
  const [pilRef,  pilVis]  = useReveal();

  const [productImages, setProductImages] = useState({
    main: '/images/1786519839820-435844472_1782492481694060.jpg',
    accent: '/images/1786519868822-566777010_1782578073971672.jpg'
  });

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : [];
        const validWithImg = items.filter(i => i.image_url && i.image_url.trim().length > 0);
        if (validWithImg.length >= 2) {
          const img1 = validWithImg[0].image_url.startsWith('/') ? validWithImg[0].image_url : `/images/${validWithImg[0].image_url}`;
          const img2 = validWithImg[1].image_url.startsWith('/') ? validWithImg[1].image_url : `/images/${validWithImg[1].image_url}`;
          setProductImages({ main: img1, accent: img2 });
        } else if (validWithImg.length === 1) {
          const img1 = validWithImg[0].image_url.startsWith('/') ? validWithImg[0].image_url : `/images/${validWithImg[0].image_url}`;
          setProductImages(prev => ({ ...prev, main: img1 }));
        }
      })
      .catch(console.error);
  }, []);

  const PILLARS = [
    { icon: <Sparkles size={22} />, title: t('pillar1Title'), desc: t('pillar1Desc') },
    { icon: <Award size={22} />,     title: t('pillar2Title'), desc: t('pillar2Desc') },
    { icon: <ShieldCheck size={22} />, title: t('pillar3Title'), desc: t('pillar3Desc') },
  ];

  return (
    <section className={styles.about} id="about" style={{ direction: currentLang.dir || 'rtl', background: 'var(--cream)' }}>
      <div className="section-wrap">
        <div className={styles.twoCol}>
          
          <div ref={textRef} className={`${styles.text} reveal ${textVis ? 'vis' : ''}`} style={{ textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}>
            <div className="label" style={{ color: 'var(--gold)' }}>{t('storyBadge')}</div>
            <div className="divider" style={{ background: 'var(--gold)' }} />
            <h2 className="h2" style={{ color: 'var(--espresso)' }}>{t('storyTitle')}</h2>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              {t('storyPara1')}
            </p>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              {t('storyPara2')}
            </p>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              {t('storyPara3')}
            </p>

            <a href="#collection" className="btn btn-outline" style={{ marginTop: '1.6rem', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid var(--gold)', color: 'var(--espresso)' }}>
              <ArrowLeft size={16} /> {t('browseCollectionBtn')}
            </a>
          </div>

          <div ref={imgRef} className={`${styles.imgWrap} reveal ${imgVis ? 'vis' : ''}`}>
            <div className={styles.imgMain}>
              <img
                src={productImages.main}
                alt="Zahrat Beesan lookbook"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/images/1786519839820-435844472_1782492481694060.jpg';
                }}
              />
            </div>
            <div className={styles.imgAccent}>
              <img
                src={productImages.accent}
                alt="Zahrat Beesan detail view"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/images/1786519868822-566777010_1782578073971672.jpg';
                }}
              />
            </div>
            <div className={styles.badge} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gold)' }}>
              <span className={styles.badgeText} style={{ color: 'var(--espresso-dim)' }}>{t('luxuryAbayasBadge')}</span>
              <span className={styles.badgeMain} style={{ color: 'var(--gold)' }}>{t('exclusiveDesignsBadge')}</span>
              <span className={styles.badgeText} style={{ color: 'var(--espresso-dim)' }}>{t('handmadeCraftBadge')}</span>
            </div>
          </div>
        </div>

        <div ref={pilRef} className={`${styles.pillars} reveal ${pilVis ? 'vis' : ''}`}>
          {PILLARS.map((p, i) => (
            <div key={p.title} className={styles.pillar} style={{ animationDelay: `${i * 150}ms`, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className={styles.pillarIcon} style={{ color: 'var(--gold)', background: 'var(--gold-glow)' }}>{p.icon}</div>
              <h3 className={styles.pillarTitle} style={{ color: 'var(--espresso)' }}>{p.title}</h3>
              <p className={styles.pillarDesc} style={{ color: 'var(--espresso-dim)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}