import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductModal from './ProductModal';
import styles from './CategorySlider.module.css';

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
}

function getImageUrl(item) {
  if (!item) return '/12.png';

  let imagesArray = [];
  try {
    imagesArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
    if (!Array.isArray(imagesArray)) imagesArray = [];
  } catch (e) { imagesArray = []; }

  const realImgs = imagesArray.filter(img => img && img !== '12.png' && img !== '/12.png');
  if (realImgs.length > 0) {
    let src = realImgs[0];
    if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return encodeURI(src);
    return encodeURI(`/images/${src}`);
  }

  if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim()) {
    let src = item.image_url.trim();
    if (src !== '12.png' && src !== '/12.png') {
      if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return encodeURI(src);
      return encodeURI(`/images/${src}`);
    }
  }

  return '/12.png';
}





function ProductCard({ item, onOpen }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();
  const { addItem } = useCart();
  const { t, tProduct, currentLang } = useLanguage();
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(getImageUrl(item));
  const [hovered, setHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const wishlisted = isWishlisted(item.id);

  // Sync image whenever item data changes (e.g., after admin saves from mobile)
  useEffect(() => {
    setImgSrc(getImageUrl(item));
  }, [item.image_url, item.images, item.id]);


  const hasVariants = item.variants && item.variants.length > 0;
  const dir = currentLang.dir || 'rtl';

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (item.isOutOfStock) return;
    if (hasVariants) {
      // Open modal to pick variant/size
      onOpen(item);
      return;
    }
    addItem({
      id: item.id,
      name: item.name,
      priceNum: parsePrice(item.price_num || item.price),
      image_url: getImageUrl(item),
      category: item.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (item.isOutOfStock) return;
    if (hasVariants) {
      onOpen(item);
      return;
    }
    addItem({
      id: item.id,
      name: item.name,
      priceNum: parsePrice(item.price_num || item.price),
      image_url: getImageUrl(item),
      category: item.category,
    });
    navigate('/checkout');
  };

  // Get second image for hover swap
  let images = [];
  try { images = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []); } catch (e) {}
  const secondImg = images.length > 1 ? images[1] : null;

  const price = parsePrice(item.price_num || item.price);
  const oldPrice = item.old_price ? parsePrice(item.old_price) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;
  const isOutOfStock = !!item.isOutOfStock;
  const rating = parseFloat(item.avg_rating || 5);
  const rawVideo = item.video_url || item.video;
  const videoSrc = rawVideo ? (rawVideo.startsWith('/') || rawVideo.startsWith('http') ? rawVideo : `/images/${rawVideo}`) : null;

  return (
    <div
      className={styles.productCard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* Image Container */}
      <div className={styles.imageWrap} onClick={() => !isOutOfStock && onOpen(item)}>
        {hovered && videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 2, transform: 'translateZ(0)', willChange: 'transform' }}
          />

        ) : (
          <img
            src={imgSrc}
            alt={item.name}
            className={styles.productImg}
            onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
          />
        )}
        {/* Badges */}
        {discount && !isOutOfStock && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}
        {videoSrc && !isOutOfStock && (
          <span style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(26, 26, 26, 0.75)', color: 'var(--gold, #c5a36a)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '4px',
            zIndex: 3, border: '1px solid rgba(197,163,106,0.4)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            🎥 انسيابية العباية
          </span>
        )}
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span>نفذت الكمية</span>
          </div>
        )}
        {/* Wishlist Button */}
        <button
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist({ id: item.id, name: item.name, image_url: getImageUrl(item), priceNum: price, category: item.category });
          }}
          aria-label={wishlisted ? 'إزالة من الأمنيات' : 'إضافة للأمنيات'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : 'currentColor'}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* Quick Add Overlay */}
        {!isOutOfStock && (
          <div className={`${styles.quickAddOverlay} ${hovered ? styles.visible : ''}`}>
            <button className={styles.quickAddBtn} onClick={(e) => { e.stopPropagation(); onOpen(item); }}>
              {t('details')}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.cardInfo}>
        {/* Stars */}
        <div className={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24"
              fill={i < Math.round(rating) ? '#c5a36a' : 'none'}
              stroke="#c5a36a" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
          {item.total_reviews > 0 && (
            <span className={styles.reviewCount}>({item.total_reviews})</span>
          )}
        </div>
        <h3 className={styles.productName} onClick={() => !isOutOfStock && onOpen(item)}>
          {tProduct(item.name)}
        </h3>
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>{format(price)}</span>
          {oldPrice && <span className={styles.oldPrice}>{format(oldPrice)}</span>}
        </div>
        {/* Color Swatches */}
        {item.variants && item.variants.length > 0 && (
          <div className={styles.swatches}>
            {item.variants.slice(0, 6).map(v => {
              const list = v.colors || [];
              let bg = list[0] || '#ccc';
              if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
              return <div key={v.id} className={styles.swatch} title={v.color_name} style={{ background: bg }} />;
            })}
            {item.variants.length > 6 && (
              <span className={styles.moreColors}>+{item.variants.length - 6}</span>
            )}
          </div>
        )}
        {/* Action Buttons */}
        {!isOutOfStock ? (
          <div className={styles.actionBtns} dir={dir}>
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              title={t('addToCart')}
            >
              {addedToCart ? '✓' : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              )}
              <span>{addedToCart ? '✓' : t('addToCart')}</span>
            </button>
            <button
              className={styles.buyNowBtn}
              onClick={handleBuyNow}
              title={t('buyNow')}
            >
              {t('buyNow')}
            </button>
          </div>
        ) : (
          <div className={styles.outOfStockTag}>{t('outOfStock')}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Horizontal Slider ═══════════ */
function ProductsSlider({ items, onOpen }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, items]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.querySelector(`.${styles.productCard}`)?.offsetWidth || 260;
    el.scrollBy({ left: dir === 'left' ? -(cardW + 16) * 2 : (cardW + 16) * 2, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.sliderWrap}>
      {canScrollLeft && (
        <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scroll('left')} aria-label="السابق">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <div className={styles.sliderTrack} ref={trackRef}>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} onOpen={onOpen} />
        ))}
      </div>
      {canScrollRight && items.length > 3 && (
        <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scroll('right')} aria-label="التالي">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ═══════════ Category Section Block ═══════════ */
function CategoryBlock({ category, items, onOpen }) {
  const { t, currentLang } = useLanguage();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={ref}
      className={`${styles.categoryBlock} ${visible ? styles.blockVisible : ''}`}
      id={`cat-${category.id}`}
    >
      {/* Background Banner */}
      {category.banner_url && (
        <div className={styles.bannerWrap}>
          <img src={category.banner_url} alt={category.label} className={styles.bannerImg} />
          <div className={styles.bannerOverlay} />
          <div className={styles.bannerText}>
            <p className={styles.bannerSub}>تشكيلة</p>
            <h2 className={styles.bannerTitle}>{category.label}</h2>
            {category.description && (
              <p className={styles.bannerDesc}>{category.description}</p>
            )}
          </div>
        </div>
      )}

      {/* If no banner, show inline header */}
      {!category.banner_url && (
        <div className={styles.inlineHeader}>
          <div className={styles.headerLine} />
          <h2 className={styles.inlineTitle}>{category.label}</h2>
          <div className={styles.headerLine} />
        </div>
      )}

      {/* Slider */}
      <div className={`${styles.sliderContainer} ${category.banner_url ? styles.sliderNegative : ''}`}>
        <div className={styles.sliderInner}>
          <ProductsSlider items={items} onOpen={onOpen} />
          {/* View All Link */}
          <div className={styles.viewAllWrap}>
            <a href={`#collection`} className={styles.viewAllBtn}
              onClick={(e) => { e.preventDefault(); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}>
              {t('viewAll')} {currentLang?.dir === 'ltr' ? '→' : '←'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ Best Sellers Section ═══════════ */
function BestSellersGrid({ items, onOpen }) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section ref={ref} className={`${styles.bestSellersSection} ${visible ? styles.blockVisible : ''}`}>
      <div className={styles.bestSellersHeader}>
        <span className={styles.sectionLabel}>{t('mostRequested')}</span>
        <h2 className={styles.sectionTitle}>{t('bestSellers')}</h2>
        <p className={styles.sectionSub}>{t('bestSellersDesc')}</p>
      </div>
      <div className={styles.sliderWrap} style={{ paddingTop: 0 }}>
        <div className={styles.sliderTrack}>
          {items.map(item => (
            <ProductCard key={item.id} item={item} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ Trust Badges Section ═══════════ */
function TrustBadges() {
  const { t } = useLanguage();
  const badges = [
    { icon: '✈️', title: t('expressShipping'), desc: t('expressShippingDesc') },
    { icon: '💎', title: t('premiumQuality'), desc: t('premiumQualityDesc') },
    { icon: '🔒', title: t('securePayment'), desc: t('securePaymentDesc') },
    { icon: '↩️', title: t('easyReturns'), desc: t('easyReturnsDesc') },
  ];
  return (
    <div className={styles.trustBadges}>
      {badges.map((b, i) => (
        <div key={i} className={styles.badge}>
          <span className={styles.badgeIcon}>{b.icon}</span>
          <div>
            <div className={styles.badgeTitle}>{b.title}</div>
            <div className={styles.badgeDesc}>{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ Customer Reviews ═══════════ */
function CustomerReviews() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/store-reviews?limit=8')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.bestSellersHeader}>
        <span className={styles.sectionLabel}>{t('customerReviews')}</span>
        <h2 className={styles.sectionTitle}>{t('whatCustomersSay')}</h2>
      </div>
      <div className={styles.reviewsTrack}>
        {reviews.map((r, i) => (
          <div key={r.id || i} className={styles.reviewCard}>
            <div className={styles.reviewStars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <svg key={si} width="14" height="14" viewBox="0 0 24 24"
                  fill={si < (r.rating || 5) ? '#c5a36a' : 'none'}
                  stroke="#c5a36a" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <p className={styles.reviewComment}>"{r.comment}"</p>
            <div className={styles.reviewAuthor}>
              <div className={styles.reviewAvatar}>
                {(r.reviewer_name || 'C').charAt(0)}
              </div>
              <span className={styles.reviewName}>{r.reviewer_name || 'Customer'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ Main Export ═══════════ */
export default function CategorySlider() {
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([cats, items]) => {
      if (Array.isArray(cats)) {
        const sorted = [...cats].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setCategories(sorted);
      }
      if (Array.isArray(items)) setAllItems(items);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getItemsForCategory = useCallback((catId) => {
    return allItems
      .filter(item => String(item.category_id) === String(catId))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [allItems]);

  // Best sellers = items with highest ratings or most reviews
  const bestSellers = [...allItems]
    .sort((a, b) => {
      const scoreA = (parseFloat(a.avg_rating || 5) * 0.6) + ((a.total_reviews || 0) * 0.4);
      const scoreB = (parseFloat(b.avg_rating || 5) * 0.6) + ((b.total_reviews || 0) * 0.4);
      return scoreB - scoreA;
    })
    .slice(0, 12);

  if (loading) return (
    <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid #e8e0d4',
        borderTopColor: '#c5a36a', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  return (
    <div className={styles.categorySliderRoot}>
      {/* Trust Badges Strip */}
      <TrustBadges />

      {/* Category Blocks */}
      {categories.map(cat => (
        <CategoryBlock
          key={cat.id}
          category={cat}
          items={getItemsForCategory(cat.id)}
          onOpen={setSelectedProduct}
        />
      ))}

      {/* Best Sellers */}
      <BestSellersGrid items={bestSellers} onOpen={setSelectedProduct} />

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          model={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
