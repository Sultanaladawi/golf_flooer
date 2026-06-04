"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Play, ShoppingBag, Ruler, Shirt } from 'lucide-react';
import Image from 'next/image';
import styles from './ProductModal.module.css';
import { useAppContext } from '../context/AppContext';

export default function ProductModal({ model, onClose }) {
  const { addToCart } = useAppContext();
  const hasImages = model.images && model.images.length > 0;
  const hasVideos = model.videos && model.videos.length > 0;

  const [activeTab, setActiveTab] = useState(hasImages ? 'photos' : 'video');
  const [activeInfoTab, setActiveInfoTab] = useState('fabric');
  const [activeImg, setActiveImg] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const videoRef = useRef(null);
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => {
      modalRef.current?.classList.add(styles.visible);
    }, 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    modalRef.current?.classList.remove(styles.visible);
    setTimeout(onClose, 400);
  }, [onClose]);

  const prevImg = () => setActiveImg(i => (i === 0 ? model.images.length - 1 : i - 1));
  const nextImg = () => setActiveImg(i => (i === model.images.length - 1 ? 0 : i + 1));

  const handleAddCart = () => {
    const parsedPrice = parseFloat(model.price.replace(/[^\d.]/g, '')) || 0;
    addToCart({
      id: model.id,
      name: model.name,
      price: parsedPrice,
      image: model.images[0] || '/12.png'
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        ref={modalRef}
        className={styles.modal}
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
          {activeTab === 'photos' && model.images.length > 0 && (
            <div className={styles.photosView}>
              {/* Main Image */}
              <div className={styles.mainImgWrap}>
                <Image
                  key={activeImg}
                  src={model.images[activeImg]}
                  alt={`${model.name} — صورة ${activeImg + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.mainImg}
                  style={{ objectFit: 'cover' }}
                />
                {model.images.length > 1 && (
                  <>
                    <button className={`${styles.navBtn} ${styles.navBtnPrev}`} onClick={prevImg} aria-label="السابقة">
                      <ChevronRight size={20} />
                    </button>
                    <button className={`${styles.navBtn} ${styles.navBtnNext}`} onClick={nextImg} aria-label="التالية">
                      <ChevronLeft size={20} />
                    </button>
                    <div className={styles.imgCounter}>{activeImg + 1} / {model.images.length}</div>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {model.images.length > 1 && (
                <div className={styles.thumbsStrip}>
                  {model.images.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`صورة ${i + 1}`}
                    >
                      <Image 
                        src={img} 
                        alt={`thumb-${i}`} 
                        width={60} 
                        height={72} 
                        style={{ objectFit: 'cover' }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== VIDEO TAB (or model with no images) ===== */}
          {(activeTab === 'video' || model.images.length === 0) && model.videos.length > 0 && (
            <div className={styles.videoView}>
              <div className={styles.mainVideoWrap}>
                <video
                  ref={videoRef}
                  key={activeVideo}
                  src={model.videos[activeVideo]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className={styles.mainVideo}
                />
              </div>
              {/* Video thumbnails */}
              {model.videos.length > 1 && (
                <div className={styles.videoStrip}>
                  {model.videos.map((_, i) => (
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
            <p className={styles.price}>{model.price}</p>
          </div>

          {/* Info Tabs */}
          <div className={styles.infoTabBar}>
            <button
              className={`${styles.infoTab} ${activeInfoTab === 'fabric' ? styles.infoTabActive : ''}`}
              onClick={() => setActiveInfoTab('fabric')}
            >
              <Shirt size={14} /> مواصفات القماش
            </button>
            <button
              className={`${styles.infoTab} ${activeInfoTab === 'sizes' ? styles.infoTabActive : ''}`}
              onClick={() => setActiveInfoTab('sizes')}
            >
              <Ruler size={14} /> المقاسات
            </button>
          </div>

          {/* ===== FABRIC TAB ===== */}
          {activeInfoTab === 'fabric' && (
            <div className={styles.fabricTab}>
              {model.fabric.map((item, i) => (
                <div key={i} className={styles.fabricRow}>
                  <span className={styles.fabricLabel}>{item.label}</span>
                  <span className={styles.fabricValue}>{item.value}</span>
                </div>
              ))}
              {model.care.length > 0 && (
                <div className={styles.careBlock}>
                  <p className={styles.careTitle}>تعليمات العناية</p>
                  <ul className={styles.careList}>
                    {model.care.map((c, i) => (
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
                {model.sizes.map((sz) => (
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
              <ShoppingBag size={18} />
              <span>{addedToCart ? '✓ تمت الإضافة للسلة' : 'أضيفي للسلة'}</span>
            </button>
            <p className={styles.shippingNote}>✦ شحن مجاني خلال 24 ساعة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
