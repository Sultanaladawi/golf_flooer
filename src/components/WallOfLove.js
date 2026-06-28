import { useState, useEffect } from 'react';
import { Star, Heart, Quote } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import styles from './WallOfLove.module.css';

export default function WallOfLove() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, visible] = useReveal();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#c5a880' : 'none'}
        color={i < rating ? '#c5a880' : 'rgba(197,168,128,0.3)'}
      />
    ));
  };

  // Fallback demo reviews if database has no approved reviews yet
  const displayReviews = reviews.length > 0 ? reviews : [
    { customerName: 'منى الهاشمي', comment: 'العباية بتجنن والتطريز دقيق جداً والخامة ثقيلة وراقية. شحن سريع وتغليف فخم.', rating: 5, productName: 'عباية كلاسيك سوداء' },
    { customerName: 'سارة العتيبي', comment: 'توصيل سريع للسعودية والعباية طلعت أحلى من الصور بكثير. الخدمة ممتازة وسأكرر الطلب بالتأكيد.', rating: 5, productName: 'عباية ملكية مطرزة' },
    { customerName: 'رانية الكردي', comment: 'شغل متقن وراقي وتفاصيل التطريز ناعمة جداً. خيار رائع للمناسبات اليومية والرسمية.', rating: 5, productName: 'عباية زهرة الياسمين' },
    { customerName: 'أميرة جوهر', comment: 'فخامة لا توصف! ألوان التطريز والحرير متناسقة جداً ومريحة في اللبس.', rating: 5, productName: 'عباية الحرير الفاخر' },
    { customerName: 'هيفاء العنزي', comment: 'تطريز تراثي يدمج الأصالة باللمسة العصرية. التغليف يبيض الوجه كهدية.', rating: 5, productName: 'بشت زهرة بيسان' },
    { customerName: 'مريم الدوسري', comment: 'خدمة العملاء سريعة جداً وساعدوني في اختيار المقاس المناسب بدقة. شكراً لكم.', rating: 5, productName: 'عباية كلاسيك يومية' }
  ];

  return (
    <section id="reviews" className={styles.section} ref={ref}>
      <div className={`${styles.inner} ${visible ? styles.visible : ''}`}>

        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Heart size={14} fill="#c5a880" color="#c5a880" />
            <span>آراء عميلاتنا</span>
          </div>
          <h2 className={styles.title}>
            جدار <em>الحب</em>
          </h2>
          <p className={styles.subtitle}>
            كلمات حقيقية من نساء يحملن زهرة بيسان بكل فخر واعتزاز
          </p>
        </div>

        {/* Masonry/Grid of Reviews */}
        <div className={styles.grid}>
          {displayReviews.map((review, idx) => (
            <div
              key={review.id || idx}
              className={styles.card}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Quote Icon */}
              <div className={styles.quoteIcon}>
                <Quote size={20} />
              </div>

              {/* Stars */}
              <div className={styles.stars}>
                {renderStars(review.rating || 5)}
              </div>

              {/* Review Text */}
              <p className={styles.comment}>
                {review.comment || 'تجربة رائعة ومنتجات أصيلة وجميلة جداً!'}
              </p>

              {/* Reviewer Info */}
              <div className={styles.reviewer}>
                <div className={styles.avatar}>
                  {(review.customerName || 'ع').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.reviewerName}>
                    {review.customerName || 'عميلة مميزة'}
                  </div>
                  {review.productName && (
                    <div className={styles.productTag}>
                      {review.productName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
