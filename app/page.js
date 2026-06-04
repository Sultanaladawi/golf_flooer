"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import ProductModal from './components/ProductModal';
import { useAppContext } from './context/AppContext';

// فئات للتصفح السريع (مثل لوزان)
const categories = [
  { name: 'كلاسيك', img: '/8.png', href: '/shop?category=classic' },
  { name: 'مناسبات', img: '/13 (1).png', href: '/shop?category=occassions' },
  { name: 'شتوية', img: '/13.png', href: '/shop?category=winter' },
  { name: 'وصل حديثاً', img: '/9 (1).png', href: '/shop?category=new' },
  { name: 'يومية', img: '/12.png', href: '/shop' },
];

// ===================================================
//   HOME PAGE
// ===================================================
export default function Home() {
  const { products } = useAppContext();
  const heroVideoRef = useRef(null);
  const [openModel, setOpenModel] = useState(null);

  useEffect(() => {
    if (heroVideoRef.current) heroVideoRef.current.playbackRate = 0.75;
  }, []);

  const handleClose = useCallback(() => setOpenModel(null), []);

  return (
    <main className={styles.main}>

      {/* ===== MODAL ===== */}
      {openModel && <ProductModal model={openModel} onClose={handleClose} />}

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroVideoWrap}>
          <video
            ref={heroVideoRef}
            src="/hero_video.mp4"
            autoPlay muted loop playsInline
            className={styles.heroVideo}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroGradientBottom} />
        </div>
        <div className={styles.heroDecorTL} />
        <div className={styles.heroDecorBR} />

        <div className={styles.heroContent}>
          <span className="section-label animate-fade-up">✦ التشكيلة الحصرية 2026 ✦</span>
          <h1 className={`${styles.heroTitle} animate-fade-up-delay-1`}>
            زهرة الخليج
            <br />
            <span className={styles.heroTitleAccent}>للمطرزات الشرقية</span>
          </h1>
          <div className="gold-line animate-fade-up-delay-1" />
          <p className={`${styles.heroSubtitle} animate-fade-up-delay-2`}>
            حيث تلتقي الأصالة بالفخامة — اكتشفي أحدث تشكيلاتنا
            <br />المصممة خصيصاً لتتوج إطلالتكِ بأبهى صورها
          </p>
          <div className={`${styles.heroCtas} animate-fade-up-delay-3`}>
            <Link href="/shop" className="btn-primary">تسوقي التشكيلة الجديدة</Link>
            <Link href="#categories" className={styles.heroSecondaryLink}>
              <span>تصفحي الأقسام</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
          <span>مرري للأسفل</span>
        </div>
      </section>

      {/* ===== CATEGORY CIRCLES (مثل لوزان) ===== */}
      <section id="categories" className={styles.categoriesSection}>
        <div className="container">
          <div className={`${styles.categoriesHeader} reveal`}>
            <span className="section-label">تسوقي حسب إطلالتك</span>
            <h2 className={styles.categoriesTitle}>الأقسام</h2>
          </div>
          <div className={styles.categoriesGrid}>
            {categories.map((cat, i) => (
              <Link
                href={cat.href}
                key={i}
                className={`${styles.categoryItem} reveal`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div className={styles.categoryCircle}>
                  <Image src={cat.img} alt={cat.name} width={100} height={100} className={styles.categoryImg} />
                  <div className={styles.categoryOverlay} />
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VALUES STRIP ===== */}
      <section className={styles.values}>
        <div className={`container ${styles.valuesInner}`}>
          {[
            { icon: '✦', title: 'تصاميم حصرية', desc: 'كل قطعة مصممة بيد الفنان' },
            { icon: '◈', title: 'خامات فاخرة', desc: 'أجود أقمشة الشرق والغرب' },
            { icon: '❧', title: 'تطريز يدوي', desc: 'حِرفة توارثناها جيلاً بعد جيل' },
            { icon: '⟡', title: 'شحن سريع', desc: 'توصيل في 24 ساعة لباب بيتك' },
          ].map((v, i) => (
            <div
              key={i}
              className={`${styles.valueCard} reveal`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <span className={styles.valueIcon}>{v.icon}</span>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COLLECTION — 4 COLUMNS (مثل سرداب لكن أفخم) ===== */}
      <section id="collection" className={`section ${styles.collectionSection}`}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <span className="section-label">أحدث الإبداعات</span>
            <h2 className={styles.sectionTitle}>التشكيلة المختارة</h2>
            <div className="gold-line" />
            <p className={styles.sectionDesc}>
              اضغطي على أي عباية لترى كامل الصور والفيديو وتفاصيل القماش والمقاسات
            </p>
          </div>

          <div className={styles.productGrid}>
            {products.map((model, index) => (
              <ProductCard
                key={model.id}
                model={model}
                index={index}
                onOpen={() => setOpenModel(model)}
              />
            ))}
          </div>

          <div className={styles.viewAllWrap}>
            <Link href="/shop" className="btn-primary">مشاهدة التشكيلة كاملة</Link>
          </div>
        </div>
      </section>

      {/* ===== LOOKBOOK EDITORIAL IMAGES ===== */}
      <section id="lookbook" className={styles.lookbookSection}>
        <div className={styles.lookbookGrid}>
          <div className={`${styles.lookbookVideo} reveal`} style={{ position: 'relative' }}>
            <Image src="/15.jpg" alt="فن العباية" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} className={styles.lookbookVideoEl} />
            <div className={styles.lookbookOverlay}>
              <span className="section-label">اللوك بوك</span>
              <h2 className={styles.lookbookTitle}>فن العباية</h2>
              <p className={styles.lookbookDesc}>إطلالات تجمع بين الحداثة والموروث العربي الأصيل</p>
            </div>
          </div>
          <div className={`${styles.lookbookSide} reveal`} style={{ transitionDelay: '0.15s' }}>
            <div className={styles.lookbookSmallVid}>
              <Image src="/8.png" alt="قصة العلامة" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.lookbookText}>
              <span className="section-label">قصة العلامة</span>
              <h3 className={styles.lookbookSideTitle}>أصالة توارثناها</h3>
              <p className={styles.lookbookSideDesc}>
                منذ أكثر من عقدين، نُتقن فن المطرزات الشرقية على أيدي حرفيين مهرة.
                كل خيط، كل غرزة، كل تفصيل — هو قصيدة نسجناها لكِ.
              </p>
              <Link href="/shop" className="btn-secondary"><span>اكتشفي مجموعتنا</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS (مثل إيلاف) ===== */}
      <section className={`section ${styles.testimonialsSection}`}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <span className="section-label">آراء عميلاتنا</span>
            <h2 className={styles.sectionTitle}>قالوا عنا</h2>
            <div className="gold-line" />
          </div>
          <div className={styles.testimonialsGrid}>
            {[
              { name: 'سارة المصري', text: 'أجمل عباية اشتريتها في حياتي، التطريز يدوي رائع والخامة لا مثيل لها. راح اعتمد المتجر للعبايات', stars: 5, city: 'عمّان' },
              { name: 'نورة الحمد', text: 'وصلت في نفس اليوم وكانت أروع مما توقعت، خدمة ممتازة وتغليف فاخر جداً مشاء الله', stars: 5, city: 'الرياض' },
              { name: 'لطيفة الكندي', text: 'لبستها في عرس ابنتي وكانت كل النساء تسألن عنها. العباية تاخذ العقل حرفياً! شكراً زهرة الخليج', stars: 5, city: 'دبي' },
            ].map((t, i) => (
              <div
                key={i}
                className={`${styles.testimonialCard} reveal`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className={styles.testimonialStars}>{'★'.repeat(t.stars)}</div>
                <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <span className={styles.testimonialName}>{t.name}</span>
                    <span className={styles.testimonialCity}>{t.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className={styles.newsletterSection}>
        <div className={styles.newsletterBg}>
          <Image src="/15.jpg" alt="Zahrat Al Khaleej Newsletter" fill sizes="100vw" style={{ objectFit: 'cover' }} className={styles.newsletterVideo} />
          <div className={styles.newsletterOverlay} />
        </div>
        <div className={`container ${styles.newsletterContent} reveal`}>
          <span className="section-label">كوني أول من يعلم</span>
          <h2 className={styles.newsletterTitle}>انضمي لعائلة زهرة الخليج</h2>
          <p className={styles.newsletterDesc}>احصلي على 15% خصم على طلبك الأول</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="بريدك الإلكتروني الكريم..." className={styles.newsletterInput} id="newsletter-email" />
            <button type="submit" className="btn-primary">اشتراك</button>
          </form>
        </div>
      </section>
    </main>
  );
}

// ===================================================
//   PRODUCT CARD
// ===================================================
function ProductCard({ model, index, onOpen }) {
  const [activeImg, setActiveImg] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const hasImages = model.images.length > 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasImages && model.videos.length > 0 && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hasImages && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`${styles.productCard} reveal`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
      style={{ transitionDelay: `${index * 0.06}s` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      aria-label={`فتح تفاصيل ${model.name}`}
    >
      {model.badge && <div className={styles.productBadge}>{model.badge}</div>}

      <div className={`${styles.tapHint} ${isHovered ? styles.tapHintVisible : ''}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        اضغطي للتفاصيل
      </div>

      <div className={styles.productMedia}>
        {hasImages && (
          <Image
            src={model.images[activeImg]}
            alt={model.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            className={`${styles.productImg} ${isHovered && model.videos.length > 0 ? styles.productImgHidden : ''}`}
            style={{ objectFit: 'cover' }}
          />
        )}

        {model.videos.length > 0 && (
          <video
            ref={videoRef}
            src={model.videos[0]}
            muted
            loop
            playsInline
            preload="metadata"
            autoPlay={!hasImages}
            className={`${styles.productVideo} ${(!hasImages || isHovered) ? styles.productVideoVisible : ''}`}
          />
        )}

        <div className={`${styles.productOverlay} ${isHovered ? styles.productOverlayVisible : ''}`} />

        {hasImages && model.images.length > 1 && (
          <div className={styles.productThumbs} onClick={(e) => e.stopPropagation()}>
            {model.images.slice(0, 6).map((_, i) => (
              <button
                key={i}
                className={`${styles.productThumb} ${activeImg === i ? styles.productThumbActive : ''}`}
                onMouseEnter={() => setActiveImg(i)}
                onClick={() => setActiveImg(i)}
                aria-label={`صورة ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.productInfo}>
        <div className={styles.productMeta}>
          <p className={styles.productSubtitle}>{model.subtitle}</p>
          <h3 className={styles.productName}>{model.name}</h3>
        </div>
        <div className={styles.productBottom}>
          <span className={styles.productPrice}>{model.price}</span>
          <button
            className={styles.productAddBtn}
            aria-label="إضافة للسلة"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
