import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import styles from './WallOfLove.module.css';

const FALLBACK_REVIEWS = [
  { customerName: 'منى الهاشمي',   comment: 'العباية بتجنن والتطريز دقيق جداً والخامة ثقيلة وراقية. شحن سريع وتغليف فخم.', rating: 5, productName: 'عباية كلاسيك سوداء' },
  { customerName: 'سارة العتيبي',  comment: 'توصيل سريع والعباية طلعت أحلى من الصور بكثير. الخدمة ممتازة وسأكرر الطلب بالتأكيد.', rating: 5, productName: 'عباية ملكية مطرزة' },
  { customerName: 'رانية الكردي',  comment: 'شغل متقن وراقي وتفاصيل التطريز ناعمة جداً. خيار رائع للمناسبات اليومية والرسمية.', rating: 5, productName: 'عباية زهرة الياسمين' },
  { customerName: 'أميرة جوهر',   comment: 'فخامة لا توصف! ألوان التطريز والحرير متناسقة جداً ومريحة في اللبس للمناسبات الكبيرة.', rating: 5, productName: 'عباية الحرير الفاخر' },
  { customerName: 'هيفاء العنزي', comment: 'تطريز تراثي يدمج الأصالة باللمسة العصرية. التغليف يبيض الوجه كهدية لأهلي في الخليج.', rating: 5, productName: 'بشت زهرة بيسان' },
  { customerName: 'مريم الدوسري', comment: 'خدمة العملاء سريعة جداً وساعدوني في اختيار المقاس المناسب بدقة. شكراً جزيلاً لكم.', rating: 5, productName: 'عباية كلاسيك يومية' },
];

export default function WallOfLove() {
  const { t } = useLanguage();
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [active, setActive]       = useState(0);
  const [isPaused, setIsPaused]   = useState(false);
  const timerRef                  = useRef(null);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) && data.length > 0 ? data : FALLBACK_REVIEWS))
      .catch(() => setReviews(FALLBACK_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  const list = loading ? FALLBACK_REVIEWS : reviews;
  const total = list.length;

  // Auto-advance
  useEffect(() => {
    if (isPaused || total === 0) return;
    timerRef.current = setInterval(() => {
      setActive(p => (p + 1) % total);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [isPaused, total]);

  const prev = () => { setActive(p => (p - 1 + total) % total); };
  const next = () => { setActive(p => (p + 1) % total); };

  const getIdx = (offset) => ((active + offset) % total + total) % total;

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={13} fill={i < n ? '#c5a880' : 'none'} color={i < n ? '#c5a880' : 'rgba(197,168,128,0.25)'} />
  ));

  return (
    <section
      id="reviews"
      className={styles.section}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Star size={13} fill="#c5a880" color="#c5a880" />
            <span>{t('reviewsBadge')}</span>
          </div>
          <h2 className={styles.title}>
            {t('reviewsTitle')}
          </h2>
          <p className={styles.subtitle}>
            آراء حقيقية من نساء يحملن إبداعنا في كل مناسبة
          </p>
        </div>

        {/* Carousel */}
        <div className={styles.carousel}>
          {/* Prev */}
          <button className={styles.arrow} onClick={prev} aria-label="السابق">
            <ChevronRight size={20} />
          </button>

          {/* Cards: prev / active / next */}
          <div className={styles.track}>
            {[-1, 0, 1].map((offset) => {
              const r   = list[getIdx(offset)];
              const pos = offset === 0 ? styles.cardCenter : offset === -1 ? styles.cardLeft : styles.cardRight;
              return (
                <div
                  key={getIdx(offset)}
                  className={`${styles.card} ${pos}`}
                  onClick={() => offset !== 0 && setActive(getIdx(offset))}
                >
                  {/* Big decorative quote */}
                  <span className={styles.bigQuote}>"</span>

                  {/* Stars */}
                  <div className={styles.stars}>{stars(r.rating || 5)}</div>

                  {/* Comment */}
                  <p className={styles.comment}>{r.comment}</p>

                  {/* Reviewer */}
                  <div className={styles.reviewer}>
                    <div className={styles.avatar}>
                      {(r.customerName || 'ع').charAt(0)}
                    </div>
                    <div>
                      <div className={styles.name}>{r.customerName || 'عميلة مميزة'}</div>
                      {r.productName && (
                        <div className={styles.productTag}>✦ {r.productName}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next */}
          <button className={styles.arrow} onClick={next} aria-label="التالي">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {list.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
