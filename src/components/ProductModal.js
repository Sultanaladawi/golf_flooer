import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Play, ShoppingBag, Ruler, Shirt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './ProductModal.module.css';

export default function ProductModal({ model, onClose }) {
  const { addItem, items } = useCart();
  const { format } = useCurrency();
  
  // Parse JSON arrays safely
  let imagesArray = [];
  try {
    const raw = typeof model.images === 'string' ? JSON.parse(model.images) : model.images;
    imagesArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  } catch (e) {
    imagesArray = [];
  }
  if (imagesArray.length === 0 && model.image_url) {
    imagesArray = [model.image_url];
  }

  let videosArray = [];
  try {
    const raw = typeof model.videos === 'string' ? JSON.parse(model.videos) : model.videos;
    videosArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  } catch (e) {
    videosArray = [];
  }

  let fabricArray = [];
  try {
    const raw = typeof model.fabric === 'string' ? JSON.parse(model.fabric) : model.fabric;
    fabricArray = Array.isArray(raw) ? raw : [];
  } catch (e) {
    fabricArray = [];
  }
  if (!fabricArray || fabricArray.length === 0) {
    fabricArray = [
      { label: 'نوع القماش', value: 'كريب فاخر' },
      { label: 'بلد المنشأ', value: 'صنع في الأردن' }
    ];
  }

  let careArray = [];
  try {
    const raw = typeof model.care === 'string' ? JSON.parse(model.care) : model.care;
    careArray = Array.isArray(raw) ? raw : [];
  } catch (e) {
    careArray = [];
  }
  if (!careArray || careArray.length === 0) {
    careArray = ['غسيل يدوي بماء بارد', 'كي على حرارة منخفضة'];
  }

  let sizesArray = [];
  try {
    const raw = typeof model.sizes === 'string' ? JSON.parse(model.sizes) : model.sizes;
    sizesArray = Array.isArray(raw) ? raw : [];
  } catch (e) {
    sizesArray = [];
  }
  if (!sizesArray || sizesArray.length === 0) {
    sizesArray = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  }

  const hasImages = imagesArray.length > 0;
  const hasVideos = videosArray.length > 0;

  const [activeTab, setActiveTab] = useState(hasImages ? 'photos' : 'video');
  const [activeInfoTab, setActiveInfoTab] = useState('fabric');
  const [activeImg, setActiveImg] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [visible, setVisible] = useState(false);
  const videoRef = useRef(null);

  // Use a stable ref to hold onClose so we don't recreate the effect on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  // Close on Escape — stable effect, no dependency on changing onClose
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, []);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => onCloseRef.current?.(), 400);
  }, []);

  const prevImg = () => setActiveImg(i => (i === 0 ? imagesArray.length - 1 : i - 1));
  const nextImg = () => setActiveImg(i => (i === imagesArray.length - 1 ? 0 : i + 1));

  const handleAddCart = () => {
    if (activeInfoTab === 'sizes' && !selectedSize) {
      return;
    }
    
    const sizeVal = selectedSize || 'M';
    const priceNumVal = parseFloat(model.price_num || model.price) || 0;
    
    addItem({
      id: `${model.id}-${sizeVal}`,
      productId: model.id,
      name: model.name,
      priceNum: priceNumVal,
      price: `${priceNumVal.toFixed(2)} JOD`,
      size: sizeVal,
      image: imagesArray[0] || '/12.png'
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className={`${styles.backdrop} ${visible ? styles.visible : ''}`} onClick={handleClose}>
      <div
        className={`${styles.modal} ${visible ? styles.visible : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={model.name}
      >
        {/* ===== CLOSE ===== */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="إغلاق">
          <X size={22} />
        </button>

        {/* ===== LEFT — MEDIA ===== */}
        <div className={styles.mediaCol}>

          {/* Tab switcher: Photos / Video */}
          {hasImages && hasVideos && (
            <div className={styles.mediaTabBar}>
              <button
                className={`${styles.mediaTab} ${activeTab === 'photos' ? styles.mediaTabActive : ''}`}
                onClick={() => setActiveTab('photos')}
              >
                <Shirt size={14} /> الصور
              </button>
              <button
                className={`${styles.mediaTab} ${activeTab === 'video' ? styles.mediaTabActive : ''}`}
                onClick={() => setActiveTab('video')}
              >
                <Play size={14} /> الفيديو
              </button>
            </div>
          )}

          {/* ===== PHOTOS TAB ===== */}
          {activeTab === 'photos' && hasImages && (
            <div className={styles.photosView}>
              {/* Main Image */}
              <div className={styles.mainImgWrap}>
                <img
                  key={activeImg}
                  src={imagesArray[activeImg]}
                  alt={`${model.name} — صورة ${activeImg + 1}`}
                  className={styles.mainImg}
                  style={{ objectFit: 'cover' }}
                />
                {imagesArray.length > 1 && (
                  <>
                    <button className={`${styles.navBtn} ${styles.navBtnPrev}`} onClick={prevImg} aria-label="السابقة">
                      <ChevronRight size={20} />
                    </button>
                    <button className={`${styles.navBtn} ${styles.navBtnNext}`} onClick={nextImg} aria-label="التالية">
                      <ChevronLeft size={20} />
                    </button>
                    <div className={styles.imgCounter}>{activeImg + 1} / {imagesArray.length}</div>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {imagesArray.length > 1 && (
                <div className={styles.thumbsStrip}>
                  {imagesArray.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`صورة ${i + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`thumb-${i}`} 
                        style={{ objectFit: 'cover', width: '60px', height: '72px' }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== VIDEO TAB (or model with no images) ===== */}
          {(activeTab === 'video' || !hasImages) && hasVideos && (
            <div className={styles.videoView}>
              <div className={styles.mainVideoWrap}>
                <video
                  ref={videoRef}
                  key={activeVideo}
                  src={videosArray[activeVideo]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className={styles.mainVideo}
                />
              </div>
              {/* Video thumbnails */}
              {videosArray.length > 1 && (
                <div className={styles.videoStrip}>
                  {videosArray.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.videoThumb} ${activeVideo === i ? styles.videoThumbActive : ''}`}
                      onClick={() => setActiveVideo(i)}
                      aria-label={`مقطع ${i + 1}`}
                    >
                      <Play size={14} />
                      <span>مقطع {i + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== RIGHT — PRODUCT DETAILS ===== */}
        <div className={styles.infoCol}>
          {/* Header */}
          <div className={styles.infoHeader}>
            {model.badge && <span className={styles.badge}>{model.badge}</span>}
            <p className={styles.subtitle}>{model.subtitle}</p>
            <h2 className={styles.name}>{model.name}</h2>
            <div className={styles.goldLine} />
            <p className={styles.price}>{format(parseFloat(model.price_num || model.price))}</p>
          </div>

          {/* Info Tabs */}
          <div className={styles.infoTabBar}>
            <button
              className={`${styles.infoTab} ${activeInfoTab === 'fabric' ? styles.infoTabActive : ''}`}
              onClick={() => setActiveInfoTab('fabric')}
            >
              <Shirt size={14} style={{ marginLeft: '4px' }} /> مواصفات القماش
            </button>
            <button
              className={`${styles.infoTab} ${activeInfoTab === 'sizes' ? styles.infoTabActive : ''}`}
              onClick={() => setActiveInfoTab('sizes')}
            >
              <Ruler size={14} style={{ marginLeft: '4px' }} /> المقاسات
            </button>
          </div>

          {/* ===== FABRIC TAB ===== */}
          {activeInfoTab === 'fabric' && (
            <div className={styles.fabricTab}>
              {fabricArray.map((item, i) => (
                <div key={i} className={styles.fabricRow}>
                  <span className={styles.fabricLabel}>{item.label}</span>
                  <span className={styles.fabricValue}>{item.value}</span>
                </div>
              ))}
              {careArray.length > 0 && (
                <div className={styles.careBlock}>
                  <p className={styles.careTitle}>تعليمات العناية</p>
                  <ul className={styles.careList}>
                    {careArray.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ===== SIZES TAB ===== */}
          {activeInfoTab === 'sizes' && (
            <div className={styles.sizesTab}>
              <p className={styles.sizesLabel}>اختاري مقاسك</p>
              <div className={styles.sizesGrid}>
                {sizesArray.map((sz) => (
                  <button
                    key={sz}
                    className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeBtnActive : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <div className={styles.sizeChart}>
                <table className={styles.sizeTable}>
                  <thead>
                    <tr>
                      <th>المقاس</th>
                      <th>الطول (سم)</th>
                      <th>الكتف (سم)</th>
                      <th>الصدر (سم)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>148</td><td>36</td><td>88</td></tr>
                    <tr><td>M</td><td>150</td><td>38</td><td>94</td></tr>
                    <tr><td>L</td><td>152</td><td>40</td><td>100</td></tr>
                    <tr><td>XL</td><td>154</td><td>42</td><td>106</td></tr>
                    <tr><td>XXL</td><td>156</td><td>44</td><td>112</td></tr>
                    <tr><td>3XL</td><td>158</td><td>46</td><td>118</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== ADD TO CART ===== */}
          <div className={styles.cartSection}>
            {activeInfoTab === 'sizes' && !selectedSize && (
              <p className={styles.sizeWarning}>✦ يرجى اختيار المقاس أولاً</p>
            )}
            <button
              className={`${styles.addToCartBtn} ${addedToCart ? styles.addedToCart : ''}`}
              onClick={handleAddCart}
              disabled={activeInfoTab === 'sizes' && !selectedSize}
            >
              <ShoppingBag size={18} style={{ marginLeft: '6px' }} />
              <span>{addedToCart ? '✓ تمت الإضافة للسلة' : 'أضيفي للسلة'}</span>
            </button>
            <p className={styles.shippingNote}>✦ شحن مجاني خلال 24 ساعة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
