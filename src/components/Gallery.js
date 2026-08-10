import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopInfo } from '../data/shopData';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Gallery.module.css';
import { Sparkles, ArrowLeft, Crown } from 'lucide-react';

function getImageUrl(item) {
  if (!item) return '/12.png';
  if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim()) {
    let src = item.image_url.trim();
    if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return src;
    return `/images/${src}`;
  }
  let imagesArray = [];
  try {
    imagesArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
  } catch (e) { imagesArray = []; }
  if (imagesArray.length > 0 && imagesArray[0]) {
    let src = imagesArray[0];
    if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return src;
    return `/images/${src}`;
  }
  return '/12.png';
}



export default function Gallery() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { format: formatPrice } = useCurrency();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.slice(0, 8));
        } else {
          setProducts([
            { id: 1, name: 'عباية حرير فاخرة', category: 'عبايات المناسبات', price_num: 155, images: ['/15.jpg'] },
            { id: 2, name: 'عباية بشت شتوية', category: 'التشكيلة الشتوية', price_num: 175, images: ['/13.png'] },
            { id: 3, name: 'عباية التطريز اليدوي', category: 'عبايات كلاسيك', price_num: 160, images: ['/8.png'] },
            { id: 4, name: 'عباية الستائر العاجية', category: 'عبايات الاستقبال', price_num: 145, images: ['/13 (1).png'] },
            { id: 5, name: 'عباية كلاسيكية سوداء', category: 'عبايات كلاسيك', price_num: 150, images: ['/12.png'] },
            { id: 6, name: 'عباية الأناقة الصيفية', category: 'تشكيلة الصيف', price_num: 135, images: ['/9 (1).png'] },
          ]);
        }
      })
      .catch(() => {
        setProducts([
          { id: 1, name: 'عباية حرير فاخرة', category: 'عبايات المناسبات', price_num: 155, images: ['/15.jpg'] },
          { id: 2, name: 'عباية بشت شتوية', category: 'التشكيلة الشتوية', price_num: 175, images: ['/13.png'] },
          { id: 3, name: 'عباية التطريز اليدوي', category: 'عبايات كلاسيك', price_num: 160, images: ['/8.png'] },
          { id: 4, name: 'عباية الستائر العاجية', category: 'عبايات الاستقبال', price_num: 145, images: ['/13 (1).png'] },
          { id: 5, name: 'عباية كلاسيكية سوداء', category: 'عبايات كلاسيك', price_num: 150, images: ['/12.png'] },
          { id: 6, name: 'عباية الأناقة الصيفية', category: 'تشكيلة الصيف', price_num: 135, images: ['/9 (1).png'] },
        ]);
      });
  }, []);

  return (
    <section className={styles.gallerySection} id="gallery">
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.goldBadge}>
            <Crown size={14} color="var(--gold, #c5a880)" />
            <span>معرض المنتجات الحقيقية</span>
          </div>
          <h2 className={styles.title}>معرض زهرة بيسان الفاخر</h2>
          <p className={styles.subtitle}>
            شاهدي تفاصيل الفخامة والتطريز في تشكيلاتنا الملكية المتاحة مباشرة في المتجر
          </p>
        </div>

        {/* Gallery Grid */}
        <div className={styles.grid}>
          {products.map((item, idx) => {
            const imgSrc = getImageUrl(item);
            const price = item.price_num || item.price || 150;

            return (
              <div
                key={item.id || idx}
                className={styles.card}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {/* Image Container */}
                <div className={styles.imageWrap}>
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className={styles.image}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
                  />
                  <div className={styles.overlay} />

                  {/* Top Badges */}
                  <span className={styles.categoryBadge}>
                    <Sparkles size={11} />
                    {item.category || 'تشكيلة فاخرة'}
                  </span>

                  <span className={styles.priceChip}>
                    {formatPrice(price)}
                  </span>

                  {/* Bottom Info & Action */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.productTitle}>{item.name}</h3>
                    <div className={styles.actionBtn}>
                      <span>معاينة العباية</span>
                      <ArrowLeft size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className={styles.footerNote}>
          <p>
            تابعوا جديد الإطلالات الملكية اليومية عبر حسابنا الرسمي على إنستغرام{' '}
            <a
              href={shopInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instaLink}
            >
              {shopInfo.instagramHandle || '@zahratbeesan'}
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}