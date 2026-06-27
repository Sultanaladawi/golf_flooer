import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Play, ShoppingBag, Ruler, Shirt, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './ProductModal.module.css';

export default function ProductModal({ model, onClose }) {
  const { addItem, items } = useCart();
  const { format } = useCurrency();
  
  const [variants, setVariants] = useState(model.variants || []);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (!model.variants) {
      fetch(`/api/products/${model.id}/variants`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setVariants(data);
          }
        })
        .catch(err => console.error("Error fetching variants:", err));
    }
  }, [model.id, model.variants]);

  // Parse JSON arrays safely
  let imagesArray = [];
  let videosArray = [];
  let sizesArray = [];

  if (selectedVariant) {
    // 1. Variant Images
    try {
      const raw = typeof selectedVariant.images === 'string' ? JSON.parse(selectedVariant.images) : selectedVariant.images;
      imagesArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    } catch (e) {
      imagesArray = [];
    }
    // Fallback to product images if variant has none
    if (imagesArray.length === 0) {
      try {
        const raw = typeof model.images === 'string' ? JSON.parse(model.images) : model.images;
        imagesArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      } catch (e) {
        imagesArray = [];
      }
      if (imagesArray.length === 0 && model.image_url) {
        imagesArray = [model.image_url];
      }
      if (imagesArray.length === 0 && model.image) {
        imagesArray = [model.image];
      }
    }

    // 2. Variant Video
    if (selectedVariant.video_url) {
      videosArray = [selectedVariant.video_url];
    } else {
      try {
        const raw = typeof model.videos === 'string' ? JSON.parse(model.videos) : model.videos;
        videosArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      } catch (e) {
        videosArray = [];
      }
    }

    // 3. Variant Sizes
    try {
      const raw = typeof selectedVariant.sizes === 'string' ? JSON.parse(selectedVariant.sizes) : selectedVariant.sizes;
      sizesArray = Array.isArray(raw) ? raw : [];
    } catch (e) {
      sizesArray = [];
    }
    if (sizesArray.length === 0) {
      try {
        const raw = typeof model.sizes === 'string' ? JSON.parse(model.sizes) : model.sizes;
        sizesArray = Array.isArray(raw) ? raw : [];
      } catch (e) {
        sizesArray = [];
      }
    }
  } else {
    // Default product images
    try {
      const raw = typeof model.images === 'string' ? JSON.parse(model.images) : model.images;
      imagesArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    } catch (e) {
      imagesArray = [];
    }
    if (imagesArray.length === 0 && model.image_url) {
      imagesArray = [model.image_url];
    }
    if (imagesArray.length === 0 && model.image) {
      imagesArray = [model.image];
    }

    // Default product video
    try {
      const raw = typeof model.videos === 'string' ? JSON.parse(model.videos) : model.videos;
      videosArray = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    } catch (e) {
      videosArray = [];
    }

    // Default product sizes
    try {
      const raw = typeof model.sizes === 'string' ? JSON.parse(model.sizes) : model.sizes;
      sizesArray = Array.isArray(raw) ? raw : [];
    } catch (e) {
      sizesArray = [];
    }
  }

  // Fabric and Care arrays (fallbacks)
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

  // Fallback default sizes if both product and variant have none
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

  // Reset image/video indices and switch tabs when variant changes
  useEffect(() => {
    setActiveImg(0);
    setActiveVideo(0);
    if (imagesArray.length > 0) {
      setActiveTab('photos');
    } else if (videosArray.length > 0) {
      setActiveTab('video');
    }
  }, [selectedVariant]);

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
    if (!selectedSize) {
      setActiveInfoTab('sizes');
      return;
    }

    let finalSizes = [];
    if (selectedVariant) {
      try {
        const raw = typeof selectedVariant.sizes === 'string' ? JSON.parse(selectedVariant.sizes) : selectedVariant.sizes;
        finalSizes = Array.isArray(raw) ? raw : [];
      } catch (e) { }
    } else {
      try {
        const raw = typeof model.sizes === 'string' ? JSON.parse(model.sizes) : model.sizes;
        finalSizes = Array.isArray(raw) ? raw : [];
      } catch (e) { }
    }

    if (finalSizes.length > 0 && typeof finalSizes[0] === 'object') {
      const sizeObj = finalSizes.find(s => s.size === selectedSize);
      if (sizeObj && sizeObj.quantity <= 0) {
        alert("عذراً، هذا المقاس نفدت كميته حالياً");
        return;
      }
    }
    
    const sizeVal = selectedSize;
    const priceNumVal = parseFloat(model.price_num || model.price) || 0;
    
    addItem({
      id: `${model.id}-${sizeVal}-${selectedVariant ? selectedVariant.id : 'default'}`,
      productId: model.id,
      name: selectedVariant ? `${model.name} - ${selectedVariant.color_name}` : model.name,
      priceNum: priceNumVal,
      price: `${priceNumVal.toFixed(2)} JOD`,
      size: sizeVal,
      image: imagesArray[0] || '/12.png',
      variantId: selectedVariant ? selectedVariant.id : null,
      variantName: selectedVariant ? selectedVariant.color_name : null
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

          {/* Color Variants Selection */}
          {variants && variants.length > 0 && (
            <div className={styles.variantsSection}>
              <div className={styles.variantsTitle}>
                <span>الخيارات والألوان:</span>
                <span className={styles.variantName}>
                  {selectedVariant ? selectedVariant.color_name : 'الأساسي'}
                </span>
              </div>
              <div className={styles.variantsRow}>
                {/* Default/Base Variant button */}
                <button
                  className={`${styles.swatchBtn} ${!selectedVariant ? styles.swatchActive : ''}`}
                  style={{ 
                    background: model.image_url ? `url(${model.image_url.startsWith('/images/') || model.image_url.startsWith('http') ? model.image_url : `/images/${model.image_url.toLowerCase()}`}) center/cover` : 'linear-gradient(135deg, #c5a880, #8f6e40)',
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}
                  onClick={() => {
                    setSelectedVariant(null);
                    setSelectedSize(null);
                  }}
                  title="اللون الأساسي"
                  aria-label="اللون الأساسي"
                />
                {/* Variant Swatches */}
                {variants.map(v => {
                  const list = v.colors || [];
                  let bg = '';
                  if (list.length === 1) bg = list[0];
                  else if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
                  else if (list.length === 3) bg = `conic-gradient(${list[0]} 0deg 120deg, ${list[1]} 120deg 240deg, ${list[2]} 240deg 360deg)`;
                  else if (list.length === 4) bg = `conic-gradient(${list[0]} 0deg 90deg, ${list[1]} 90deg 180deg, ${list[2]} 180deg 270deg, ${list[3]} 270deg 360deg)`;
                  
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      className={`${styles.swatchBtn} ${isActive ? styles.swatchActive : ''}`}
                      style={{ background: bg || '#333' }}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedSize(null);
                      }}
                      title={v.color_name}
                      aria-label={v.color_name}
                    />
                  );
                })}
              </div>
            </div>
          )}

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
                {(() => {
                  let finalSizes = [];
                  if (!sizesArray || sizesArray.length === 0) {
                    finalSizes = [{ size: 'S', quantity: 10 }, { size: 'M', quantity: 10 }, { size: 'L', quantity: 10 }, { size: 'XL', quantity: 10 }, { size: 'XXL', quantity: 10 }, { size: '3XL', quantity: 10 }];
                  } else {
                    if (typeof sizesArray[0] === 'string') {
                      finalSizes = sizesArray.map(s => ({ size: s, quantity: 10 }));
                    } else {
                      finalSizes = sizesArray;
                    }
                  }

                  return finalSizes.map((item) => {
                    const isOutOfStock = item.quantity <= 0;
                    return (
                      <button
                        key={item.size}
                        disabled={isOutOfStock}
                        className={`${styles.sizeBtn} ${selectedSize === item.size ? styles.sizeBtnActive : ''} ${isOutOfStock ? styles.outOfStock : ''}`}
                        onClick={() => setSelectedSize(item.size)}
                        style={{ opacity: isOutOfStock ? 0.4 : 1, textDecoration: isOutOfStock ? 'line-through' : 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                        title={isOutOfStock ? 'نفدت الكمية' : ''}
                      >
                        {item.size}
                      </button>
                    );
                  });
                })()}
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
            {!selectedSize && (
              <p className={styles.sizeWarning} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={14} /> يرجى اختيار المقاس أولاً</p>
            )}
            <button
              className={`${styles.addToCartBtn} ${addedToCart ? styles.addedToCart : ''}`}
              onClick={handleAddCart}
            >
              <ShoppingBag size={18} style={{ marginLeft: '6px' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{addedToCart ? <><CheckCircle2 size={16} /> تمت الإضافة للسلة</> : 'أضيفي للسلة'}</span>
            </button>
            <p className={styles.shippingNote} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Sparkles size={14} /> شحن مجاني خلال 24 ساعة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
