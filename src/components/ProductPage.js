import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { shopInfo } from '../data/shopData';
import { trackViewContent } from '../utils/socialPixel';
import ImageZoomViewer from './ImageZoomViewer';
import { 
  Star, ChevronLeft, ShoppingBag, ArrowRight, Heart, Share2, 
  MessageSquare, X, ShieldCheck, Truck, RotateCcw, Check, Sparkles, PhoneCall 
} from 'lucide-react';

const SIZES = ['50', '52', '54', '56', '58', '60'];

function StarRating({ rating, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', color: 'var(--gold, #c5a36a)' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star 
          key={s} 
          size={size} 
          fill={s <= rating ? 'var(--gold, #c5a36a)' : 'none'} 
          stroke={s <= rating ? 'var(--gold, #c5a36a)' : '#ccc'} 
        />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { format } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('54');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Reviews state
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Smart size modal & interactive features
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [userHeight, setUserHeight] = useState(160);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentImg(0);
    fetch(`/api/product/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('المنتج غير موجود');
        return r.json();
      })
      .then(data => {
        setProduct(data);
        try { trackViewContent(data); } catch (_) {}
        setReviews(data.reviews || []);
        
        let pChart = [];
        try { pChart = data.size_chart ? (typeof data.size_chart === 'string' ? JSON.parse(data.size_chart) : data.size_chart) : []; } catch(e){}
        let pSizes = [];
        if (Array.isArray(pChart) && pChart.length > 0) {
          pSizes = pChart.map(x => String(x.size)).filter(Boolean);
        } else {
          try { pSizes = data.sizes ? (typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes) : []; } catch(e){}
        }
        if (pSizes && pSizes.length > 0) setSelectedSize(String(pSizes[0]));

        // SEO Title & Meta Description
        document.title = `${data.name} | زهرة بيسان - الزي الملكي الفاخر`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.description || data.subtitle || data.name);
        } else {
          const m = document.createElement('meta');
          m.name = 'description';
          m.content = data.description || data.subtitle || data.name;
          document.head.appendChild(m);
        }
        
        // Fetch related products
        fetch('/api/products')
          .then(res => res.json())
          .then(items => {
            const others = items.filter(i => String(i.id) !== String(data.id));
            const shuffled = others.sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 4));
          })
          .catch(e => console.error(e));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    return () => { document.title = 'زهرة بيسان'; };
  }, [id]);

  const getImages = () => {
    if (!product) return [];
    let imgs = [];
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      imgs = selectedVariant.images;
    } else {
      imgs = Array.isArray(product.images) ? product.images : [];
      if (imgs.length === 0 && product.image_url) imgs = [product.image_url];
    }
    imgs = imgs.map(src => {
      if (!src) return '/12.png';
      if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return src;
      return `/images/${src.toLowerCase()}`;
    });
    if (imgs.length === 0) imgs = ['/12.png'];
    return imgs;
  };

  // Filter size chart to ONLY Chest and Hip/Waist per user directives
  let activeSizeChart = [];
  try {
    activeSizeChart = product?.size_chart ? (typeof product.size_chart === 'string' ? JSON.parse(product.size_chart) : product.size_chart) : [];
  } catch(e) { activeSizeChart = []; }

  let activeSizes = [];
  if (Array.isArray(activeSizeChart) && activeSizeChart.length > 0) {
    activeSizes = activeSizeChart.map(x => String(x.size || '').trim()).filter(Boolean);
  } else {
    try {
      activeSizes = product?.sizes ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes) : [];
    } catch(e) { activeSizes = []; }
  }
  const availableSizes = (activeSizes && activeSizes.length > 0) ? activeSizes : SIZES;

  const getDynamicRecommendedSize = (hVal) => {
    if (!availableSizes || availableSizes.length === 0) return '54';
    const ratio = Math.max(0, Math.min(0.999, (hVal - 145) / 41));
    const idx = Math.floor(ratio * availableSizes.length);
    return availableSizes[idx] || availableSizes[0];
  };

  const currentRecommendedSize = getDynamicRecommendedSize(userHeight);
  const selectedSizeInfo = Array.isArray(activeSizeChart) ? activeSizeChart.find(x => String(x.size) === String(selectedSize)) : null;
  const currentWeight = selectedSizeInfo?.weight || product?.weight || null;

  const images = getImages();
  const wishlisted = product ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price_display,
      priceNum: parseFloat(product.price_num) || 0,
      image_url: images[0],
      size: selectedSize,
      weight: currentWeight,
      variant: selectedVariant ? selectedVariant.color_name : null,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const abayaName = product?.name || '';
    const abayaSize = selectedSize || 'غير محدد';
    const abayaColor = selectedVariant?.color_name || 'اللون الأصلي';
    const abayaPrice = price || '';
    const pageUrl = window.location.href;

    const messageText = `السلام عليكم ورحمة الله، أرغب في طلب المنتج الملكي:
*${abayaName}*
- المقاس: ${abayaSize}
- اللون: ${abayaColor}
- السعر: ${abayaPrice}
رابط المنتج: ${pageUrl}`;

    const encodedText = encodeURIComponent(messageText);
    const phoneCleaned = shopInfo.phone ? shopInfo.phone.replace(/\D/g, '') : '962796697413';
    const whatsappUrl = `https://wa.me/${phoneCleaned}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('تم نسخ رابط المنتج بنجاح!'));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/feedback/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, reviewer_name: reviewName.trim() || 'عميل متميز', comment: reviewComment.trim(), rating: reviewRating }),
      });
      if (res.ok) {
        setReviews(prev => [{ id: Date.now(), reviewer_name: reviewName || 'عميل متميز', comment: reviewComment, rating: reviewRating, created_at: new Date().toISOString() }, ...prev]);
        setReviewName(''); setReviewComment(''); setReviewRating(5);
        setReviewSuccess(true); setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) { console.error('Review submit error:', err); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base, #faf8f5)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid var(--gold, #c5a36a)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ color: 'var(--espresso, #2b2015)', fontWeight: 800 }}>جاري إعداد صفحة العرض الملكية...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base, #faf8f5)', gap: '20px' }}>
      <p style={{ color: 'var(--espresso, #2b2015)', fontSize: '1.2rem', fontWeight: 800 }}>{'⚠️ ' + (error || 'المنتج غير موجود')}</p>
      <button onClick={() => navigate('/')} style={btnStyle}>العودة للرئيسية</button>
    </div>
  );

  const price = product.price_num ? format(parseFloat(product.price_num)) : product.price_display;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  const videoUrlFormatted = (selectedVariant && selectedVariant.video_url) ? 
    (selectedVariant.video_url.startsWith('/') || selectedVariant.video_url.startsWith('http') ? selectedVariant.video_url : `/images/${selectedVariant.video_url}`) : 
    (product.video_url ? (product.video_url.startsWith('/') || product.video_url.startsWith('http') ? product.video_url : `/images/${product.video_url}`) : null);

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg-base, #faf8f5)', color: 'var(--text-primary, #2b2015)', fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        .pp-size-btn:hover { background: var(--gold, #c5a36a) !important; color: #fff !important; border-color: var(--gold, #c5a36a) !important; }
        .pp-swatch:hover { transform: scale(1.15) !important; }
        .pp-add-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(197,163,106,0.4) !important; }
        .pp-back-btn:hover { color: var(--gold, #c5a36a) !important; }
        .pp-tab-btn { padding: 12px 20px; font-weight: 800; font-size: 0.92rem; border: none; background: none; cursor: pointer; color: var(--espresso-dim, #665544); border-bottom: 2px solid transparent; transition: all 0.2s; }
        .pp-tab-btn.active { color: var(--gold, #c5a36a); border-bottom-color: var(--gold, #c5a36a); }
        .pp-review-input:focus { border-color: var(--gold, #c5a36a) !important; outline: none; }
      `}</style>

      {/* Sticky Header Breadcrumb Nav */}
      <div style={{ background: 'var(--bg-card, rgba(255,255,255,0.95))', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(197,163,106,0.2)', position: 'sticky', top: 0, zIndex: 50, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--espresso-dim, #776655)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--gold, #c5a36a)', textDecoration: 'none', fontWeight: 800 }}>الرئيسية</Link>
          <ChevronLeft size={14} style={{ opacity: 0.5 }} />
          <Link to="/#collection" style={{ color: 'var(--espresso-dim, #776655)', textDecoration: 'none', fontWeight: 600 }}>التشكيلة</Link>
          <ChevronLeft size={14} style={{ opacity: 0.5 }} />
          <span style={{ color: 'var(--espresso, #2b2015)', fontWeight: 800 }}>{product.name}</span>
        </div>

        <button className="pp-back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--espresso-dim, #776655)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.9rem', transition: 'color 0.2s' }}>
          <ArrowRight size={18} />
          <span>رجوع</span>
        </button>
      </div>

      {/* Main Product Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '35px 20px 80px', animation: 'fadeInUp 0.4s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '45px', alignItems: 'start' }}>

          {/* LEFT COLUMN: Interactive Magnifier Gallery */}
          <div>
            <ImageZoomViewer 
              images={images}
              activeImg={currentImg}
              setActiveImg={setCurrentImg}
              videoUrl={videoUrlFormatted}
              productName={product.name}
              isPlayingVideo={isPlayingVideo}
              setIsPlayingVideo={setIsPlayingVideo}
            />

            {/* Quick Guarantee Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px', padding: '16px', borderRadius: '16px', background: 'var(--bg-card, #fff)', border: '1px solid rgba(197, 168, 128, 0.2)', textAling: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Truck size={20} color="var(--gold, #c5a36a)" style={{ margin: '0 auto 6px', display: 'block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--espresso)' }}>توصيل سريع</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <ShieldCheck size={20} color="var(--gold, #c5a36a)" style={{ margin: '0 auto 6px', display: 'block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--espresso)' }}>جودة ملكية</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <RotateCcw size={20} color="var(--gold, #c5a36a)" style={{ margin: '0 auto 6px', display: 'block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--espresso)' }}>تبديل ميسر</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full Product Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Category & Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(197,163,106,0.15)', color: 'var(--gold, #c5a36a)', fontSize: '0.8rem', fontWeight: 800 }}>
                  {product.category || 'تصميم خاص'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  متوفر في المخزون
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 900, color: 'var(--espresso, #2b2015)', lineHeight: 1.25, margin: 0 }}>
                {product.name}
              </h1>
              {product.subtitle && (
                <p style={{ color: 'var(--espresso-dim, #776655)', fontSize: '1.05rem', marginTop: '8px', fontWeight: 600 }}>
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Rating Summary */}
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <span style={{ color: 'var(--espresso-dim, #776655)', fontSize: '0.88rem', fontWeight: 700 }}>
                  {avgRating} ({reviews.length} {reviews.length === 1 ? 'تقييم' : 'تقييمات متميزة'})
                </span>
              </div>
            )}

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', padding: '18px 24px', background: 'rgba(197,163,106,0.08)', borderRadius: '16px', border: '1px solid rgba(197,163,106,0.25)' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--gold, #c5a36a)' }}>
                {price}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--espresso-dim)', fontWeight: 700 }}>
                (شامل كافة الضرائب المستحقة)
              </span>
            </div>

            {/* Description */}
            {(product.description || product.desc) && (
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--espresso, #2b2015)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  وصف وتفاصيل العباية / القفطان
                </h3>
                <p style={{ color: 'var(--espresso-dim, #665544)', lineHeight: 1.8, fontSize: '0.96rem', margin: 0 }}>
                  {product.description || product.desc}
                </p>
              </div>
            )}

            {/* Color Swatches */}
            {((product.variants && product.variants.length > 0) || product.image_url) && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso, #2b2015)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  اللون المختار: <span style={{ color: 'var(--gold, #c5a36a)' }}>{selectedVariant ? selectedVariant.color_name : 'اللون الأصلي'}</span>
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {product.variants && product.variants.length > 0 && (
                    <button 
                      type="button"
                      className="pp-swatch" 
                      title="اللون الأصلي" 
                      onClick={() => { setSelectedVariant(null); setCurrentImg(0); }}
                      style={{ 
                        width: '38px', height: '38px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #c5a36a, #8f6e40)', 
                        border: `3px solid ${!selectedVariant ? 'var(--gold, #c5a36a)' : 'rgba(197,163,106,0.3)'}`, 
                        cursor: 'pointer', transition: 'all 0.2s', 
                        boxShadow: !selectedVariant ? '0 0 0 2px rgba(197,163,106,0.4)' : 'none', 
                        transform: !selectedVariant ? 'scale(1.15)' : 'scale(1)', 
                        padding: 0 
                      }} 
                    />
                  )}
                  {(product.variants || []).map(v => {
                    const list = Array.isArray(v.colors) ? v.colors : (typeof v.colors === 'string' ? JSON.parse(v.colors || '[]') : []);
                    let bg = list[0] || '#333';
                    if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
                    else if (list.length >= 3) bg = `conic-gradient(${list[0]} 0deg 120deg, ${list[1]} 120deg 240deg, ${list[2]} 240deg 360deg)`;
                    const isSel = selectedVariant?.id === v.id;
                    return (
                      <button 
                        key={v.id} 
                        className="pp-swatch" 
                        title={v.color_name} 
                        onClick={() => { setSelectedVariant(v); setCurrentImg(0); }}
                        style={{ 
                          width: '38px', height: '38px', borderRadius: '50%', 
                          background: bg, 
                          border: `3px solid ${isSel ? 'var(--gold, #c5a36a)' : 'rgba(197,163,106,0.3)'}`, 
                          cursor: 'pointer', transition: 'all 0.2s', 
                          boxShadow: isSel ? '0 0 0 2px rgba(197,163,106,0.4)' : 'none', 
                          transform: isSel ? 'scale(1.15)' : 'scale(1)', 
                          padding: 0 
                        }} 
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso, #2b2015)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  المقاس المطلوب: <span style={{ color: 'var(--gold, #c5a36a)' }}>{selectedSize}</span>
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowSizeModal(true)} 
                  style={{ background: 'none', border: 'none', color: 'var(--gold, #c5a36a)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  📏 جدول القياسات ومساعد المقاس الذكي
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {availableSizes.map(sz => (
                  <button 
                    key={sz} 
                    className="pp-size-btn" 
                    onClick={() => setSelectedSize(sz)}
                    style={{ 
                      padding: '10px 18px', borderRadius: '12px', fontWeight: 800, 
                      border: `2px solid ${selectedSize === sz ? 'var(--gold, #c5a36a)' : 'rgba(197,163,106,0.3)'}`, 
                      background: selectedSize === sz ? 'var(--gold, #c5a36a)' : 'transparent', 
                      color: selectedSize === sz ? '#fff' : 'var(--espresso, #2b2015)', 
                      cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', minWidth: '55px' 
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Add to Cart */}
                <button 
                  className="pp-add-btn" 
                  onClick={handleAddToCart} 
                  disabled={!!product.isOutOfStock}
                  style={{ 
                    flex: 1, padding: '16px 14px', 
                    background: product.isOutOfStock ? '#aaa' : 'transparent', 
                    color: product.isOutOfStock ? '#fff' : 'var(--gold, #c5a36a)', 
                    border: product.isOutOfStock ? 'none' : '2px solid var(--gold, #c5a36a)', 
                    borderRadius: '14px', fontWeight: 900, fontSize: '1rem', 
                    cursor: product.isOutOfStock ? 'not-allowed' : 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    transition: 'all 0.3s ease', animation: addedToCart ? 'pulse 0.4s ease' : 'none' 
                  }}
                >
                  <ShoppingBag size={20} />
                  {product.isOutOfStock ? 'نفذت الكمية' : addedToCart ? 'تمت الإضافة للسلة!' : 'أضف إلى السلة'}
                </button>
                
                {/* Buy Now */}
                <button 
                  className="pp-add-btn" 
                  onClick={() => { handleAddToCart(); navigate('/checkout'); }} 
                  disabled={!!product.isOutOfStock}
                  style={{ 
                    flex: 1.4, padding: '16px 14px', 
                    background: product.isOutOfStock ? '#aaa' : 'linear-gradient(135deg, var(--gold, #c5a36a), #8f6e40)', 
                    color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', 
                    cursor: product.isOutOfStock ? 'not-allowed' : 'pointer', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    boxShadow: '0 6px 20px rgba(197,163,106,0.35)', transition: 'all 0.3s ease' 
                  }}
                >
                  <Sparkles size={18} />
                  اشترِ الآن
                </button>
              </div>

              {/* WhatsApp Quick Order & Share */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleWhatsAppOrder}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <PhoneCall size={18} />
                  طلب سريع عبر واتساب
                </button>

                <button 
                  onClick={() => toggleWishlist(product)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: `1.5px solid ${wishlisted ? '#ef4444' : 'rgba(197,163,106,0.3)'}`,
                    background: wishlisted ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: wishlisted ? '#ef4444' : 'var(--espresso)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="المفضلة"
                >
                  <Heart size={20} fill={wishlisted ? '#ef4444' : 'none'} />
                </button>

                <button 
                  onClick={handleShare}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(197,163,106,0.3)',
                    background: 'transparent',
                    color: 'var(--espresso)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="مشاركة المنتج"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Dynamic Weight & Tags */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '4px' }}>
              {currentWeight && (
                <span style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(197,163,106,0.15)', color: 'var(--espresso, #2b2015)', fontSize: '0.82rem', fontWeight: 800, border: '1px solid rgba(197,163,106,0.3)' }}>
                  ⚖️ الوزن التقريبي: {currentWeight}
                </span>
              )}
              {product.tags && (Array.isArray(product.tags) ? product.tags : String(product.tags).split(',')).filter(Boolean).map((tag, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(197,163,106,0.1)', color: 'var(--espresso-dim, #776655)', fontSize: '0.78rem', fontWeight: 600, border: '1px solid rgba(197,163,106,0.2)' }}>
                  #{typeof tag === 'object' ? tag.name : String(tag).trim()}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div style={{ marginTop: '70px', background: 'var(--bg-card, #fff)', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(197,163,106,0.2)', marginBottom: '20px', overflowX: 'auto' }}>
            <button className={`pp-tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>✨ التفاصيل والخامة</button>
            <button className={`pp-tab-btn ${activeTab === 'sizechart' ? 'active' : ''}`} onClick={() => setActiveTab('sizechart')}>📏 جدول القياسات (الصدر والحوض)</button>
            <button className={`pp-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>🚚 الشحن والتوصيل</button>
          </div>

          {activeTab === 'details' && (
            <div style={{ lineHeight: 1.8, color: 'var(--espresso-dim, #665544)', fontSize: '0.96rem' }}>
              <p>تم تصميم وتطريز هذا القطعة بعناية فائقة بأيدي أمهر المصممين، باستخدام أجود أنواع الأقمشة الفاخرة التي تمنحك إطلالة ملكية راقية تليق بالمناسبات الخاصة.</p>
              <ul style={{ paddingRight: '20px', margin: '15px 0 0' }}>
                <li>تطريز خاص عالي الدقة والمتقن.</li>
                <li>قماش ناعم مريح ومناسب لكافة الفصول.</li>
                <li>تعليمات العناية: غسيل يدوي بماء بارد أو تنظيف جاف (Dry Clean) للحفاظ على بريق التطريز.</li>
              </ul>
            </div>
          )}

          {activeTab === 'sizechart' && (
            <div style={{ overflowX: 'auto' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--espresso-dim)', marginBottom: '14px' }}>جدول المقاسات الرسمي المعتمد (القياسات بالسنتيمتر):</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid rgba(197,163,106,0.2)', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(197,163,106,0.15)', color: 'var(--espresso)', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)' }}>المقاس</th>
                    <th style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)' }}>محيط الصدر</th>
                    <th style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)' }}>محيط الحوض</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeSizeChart && activeSizeChart.length > 0 ? activeSizeChart : [
                    { size: '50', chest: '95 سم', hip: '105 سم' },
                    { size: '52', chest: '100 سم', hip: '110 سم' },
                    { size: '54', chest: '105 سم', hip: '115 سم' },
                    { size: '56', chest: '110 سم', hip: '120 سم' },
                    { size: '58', chest: '115 سم', hip: '125 سم' },
                    { size: '60', chest: '120 سم', hip: '130 سم' }
                  ]).map((row, idx) => (
                    <tr key={idx} style={{ background: selectedSize === String(row.size) ? 'rgba(197,163,106,0.2)' : 'none' }}>
                      <td style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)', color: 'var(--gold)', fontWeight: 900 }}>{row.size}</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)' }}>{row.chest || '—'}</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(197,163,106,0.2)' }}>{row.hip || row.waist || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ lineHeight: 1.8, color: 'var(--espresso-dim, #665544)', fontSize: '0.96rem' }}>
              <p>🟢 **التوصيل المحلي والخليجي والعالمي**: يتم شحن وتوصيل الطلب لجميع دول العالم.</p>
              <p>🟢 **التغليف الفاخر**: توضع كل قطعة داخل كيس وقائي فاخر ومعطر بعطر بيسان الملكي.</p>
            </div>
          )}
        </div>

        {/* Complete Outfit Stylist Section */}
        <div style={{
          marginTop: '50px',
          padding: '30px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(197, 163, 106, 0.08) 0%, rgba(197, 163, 106, 0.02) 100%)',
          border: '1.5px solid rgba(197, 163, 106, 0.3)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold, #c5a36a)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                ✨ تنسيق الموضة الملكي (Complete The Outfit)
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--espresso, #2b2015)', margin: '4px 0 0' }}>
                اكتملي أناقتكِ — إطلالة بيسان الكاملة
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--espresso-dim)', fontWeight: 600 }}>
              نصيحة خبيرة الأناقة يافا لربط هذه القطعة
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              {
                category: 'الطرحة المتناسقة',
                name: `طرحة حرير شيفون فاخرة (متوافقة مع ${product.name})`,
                desc: 'طرحة شيفون إيطالي ناعم بحواف مطرزة بخيط الحرير الراقية لتكتمل إطلالتك.',
                icon: '✨',
                price: '15.00 JOD'
              },
              {
                category: 'الحقيبة والكعب',
                name: 'حقيبة كليك مخملية وحذاء كعب عاجي',
                desc: 'تناسق ساحر من جلد الستان اللامع ومقبض كلاسيكي لتسليط الضوء على أنوثتك.',
                icon: '👝',
                price: '35.00 JOD'
              },
              {
                category: 'الإكسسوارات والعطر',
                name: 'عطر بيسان الملكي وطقم إكسسوار مذهب',
                desc: 'لمسة الثبات الأخيرة بخصلات العود والعنبر المعطر المعتمد لدى دار زهرة بيسان.',
                icon: '💎',
                price: '25.00 JOD'
              }
            ].map((styleItem, sIdx) => (
              <div key={sIdx} style={{
                background: 'var(--bg-card, #fff)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(197, 163, 106, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{styleItem.icon}</div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase' }}>{styleItem.category}</span>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--espresso)', margin: '6px 0 8px' }}>{styleItem.name}</h4>
                  <p style={{ fontSize: '0.83rem', color: 'var(--espresso-dim)', lineHeight: 1.6, margin: 0 }}>{styleItem.desc}</p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(197,163,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--gold)' }}>{styleItem.price}</span>
                  <button 
                    type="button"
                    onClick={handleAddToCart}
                    style={{
                      background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '24px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(197, 168, 128, 0.25)',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(197, 168, 128, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 168, 128, 0.25)'; }}
                  >
                    إضافة الإطلالة ✦
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '70px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <div style={{ width: '4px', height: '30px', background: 'var(--gold, #c5a36a)', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--espresso, #2b2015)', margin: 0 }}>منتجات ذات صلة قد تعجبكِ</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {relatedProducts.map(rp => (
                <Link 
                  to={`/product/${rp.id}`} 
                  key={rp.id} 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  style={{ textDecoration: 'none', background: 'var(--bg-card, #fff)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(197,163,106,0.15)', transition: 'transform 0.3s' }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'} 
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#FAF8F5' }}>
                    <img 
                      src={rp.image_url ? (rp.image_url.startsWith('/') || rp.image_url.startsWith('http') || rp.image_url.startsWith('data:') ? rp.image_url : `/images/${rp.image_url.toLowerCase()}`) : '/12.png'} 
                      alt={rp.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--espresso)', margin: '0 0 6px', fontWeight: 800 }}>{rp.name}</h4>
                    <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '0.95rem' }}>{rp.price_display}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{ width: '4px', height: '30px', background: 'var(--gold, #c5a36a)', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--espresso, #2b2015)', margin: 0 }}>آراء وتقييمات العملاء</h2>
            {reviews.length > 0 && (<span style={{ background: 'var(--gold, #c5a36a)', color: '#fff', borderRadius: '20px', padding: '2px 14px', fontSize: '0.82rem', fontWeight: 900 }}>{reviews.length}</span>)}
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', borderRadius: '20px', border: '1.5px dashed rgba(197,163,106,0.3)', color: 'var(--espresso-dim, #776655)', background: 'var(--bg-card, #fff)' }}>
              <MessageSquare size={44} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 800, fontSize: '1.05rem' }}>لا توجد تقييمات مسجلة بعد لهذا التصميم.</p>
              <p style={{ fontSize: '0.88rem' }}>كوني أول من يضع لمسته ويقيّم هذا المنتج!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '18px', marginBottom: '40px' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ padding: '22px 26px', borderRadius: '18px', background: 'var(--bg-card, #fff)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(197,163,106,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold, #c5a36a), #8f6e40)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
                        {(r.reviewer_name || 'ع')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--espresso, #2b2015)', fontSize: '0.98rem' }}>{r.reviewer_name || 'عميل متميز'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
                      </div>
                    </div>
                    <StarRating rating={r.rating} size={16} />
                  </div>
                  {r.comment && <p style={{ color: 'var(--espresso-dim, #665544)', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Review Form */}
          <div style={{ padding: '35px', borderRadius: '22px', background: 'var(--bg-card, #fff)', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(197,163,106,0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--espresso, #2b2015)', marginBottom: '20px' }}>✍️ شاركينا تقييمك وانطباعك</h3>
            {reviewSuccess && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '14px', padding: '14px 20px', marginBottom: '18px', color: '#15803d', fontWeight: 800 }}>
                ✓ شكراً لكِ! تم تسجيل تقييمك بنجاح.
              </div>
            )}
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="pp-review-input" type="text" placeholder="اسمك الكريم (اختياري)" value={reviewName} onChange={e => setReviewName(e.target.value)} style={inputStyle} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ color: 'var(--espresso-dim, #665544)', fontWeight: 800, fontSize: '0.92rem' }}>تقييمك:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <Star size={26} fill={s <= reviewRating ? 'var(--gold, #c5a36a)' : 'none'} stroke={s <= reviewRating ? 'var(--gold, #c5a36a)' : '#ccc'} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className="pp-review-input" placeholder="شاركينا تجريبتك وانطباعك عن خام وتطريز ومقاس هذا المنتج..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: '110px' }} />
              <button type="submit" disabled={reviewSubmitting || !reviewComment.trim()}
                style={{ ...btnStyle, opacity: reviewSubmitting || !reviewComment.trim() ? 0.6 : 1, cursor: reviewSubmitting || !reviewComment.trim() ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم الملكي'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Size Calculator Modal */}
      {showSizeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', backdropFilter: 'blur(6px)', direction: 'rtl' }}>
          <div style={{ background: 'var(--bg-card, #fff)', width: '95%', maxWidth: '600px', borderRadius: '24px', border: '1.5px solid var(--gold, rgba(197, 168, 128, 0.4))', padding: '32px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowSizeModal(false)} style={{ position: 'absolute', top: '22px', left: '22px', background: 'none', border: 'none', color: 'var(--espresso, #2b2015)', cursor: 'pointer', padding: 0 }} title="إغلاق">
              <X size={26} />
            </button>

            <h3 style={{ margin: '0 0 22px 0', color: 'var(--espresso, #2b2015)', fontSize: '1.45rem', fontWeight: 900, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              📏 دليل ومساعد المقاسات الذكي
            </h3>

            {/* Interactive Calculator */}
            <div style={{ background: 'rgba(197, 168, 128, 0.08)', padding: '22px', borderRadius: '18px', border: '1px solid rgba(197, 168, 128, 0.25)', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--gold, #c5a36a)', fontSize: '1.05rem', fontWeight: 900 }}>حاسبة الطول والمقاس التفاعلية</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso)', marginBottom: '10px' }}>
                  طولكِ الكريم: <span style={{ color: 'var(--gold)', fontWeight: 900 }}>{userHeight} سم</span>
                </label>
                <input 
                  type="range" 
                  min="145" 
                  max="185" 
                  value={userHeight} 
                  onChange={(e) => setUserHeight(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--espresso-dim)', marginTop: '6px', fontWeight: 600 }}>
                  <span>145 سم</span>
                  <span>165 سم</span>
                  <span>185 سم</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card, #fff)', padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(197,163,106,0.3)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--espresso-dim)', display: 'block' }}>المقاس الموصى به:</span>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--gold)', fontWeight: 900 }}>مقاس {currentRecommendedSize}</strong>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setSelectedSize(currentRecommendedSize); setShowSizeModal(false); }}
                  style={{ padding: '10px 18px', background: 'var(--gold, #c5a36a)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem' }}
                >
                  اعتماد المقاس
                </button>
              </div>
            </div>

            {/* Detailed Table STRICTLY Chest and Hip */}
            <div>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--espresso, #2b2015)', fontSize: '1.05rem', fontWeight: 900 }}>📏 جدول القياسات (الصدر والحوض فقط)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(197, 168, 128, 0.25)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(197, 168, 128, 0.15)', color: 'var(--espresso, #2b2015)', fontWeight: 'bold' }}>
                      <th style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)' }}>المقاس</th>
                      <th style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)' }}>محيط الصدر</th>
                      <th style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)' }}>محيط الحوض</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeSizeChart && activeSizeChart.length > 0 ? activeSizeChart : [
                      { size: '50', chest: '95 سم', hip: '105 سم' },
                      { size: '52', chest: '100 سم', hip: '110 سم' },
                      { size: '54', chest: '105 سم', hip: '115 سم' },
                      { size: '56', chest: '110 سم', hip: '120 سم' },
                      { size: '58', chest: '115 سم', hip: '125 سم' },
                      { size: '60', chest: '120 سم', hip: '130 سم' }
                    ]).map((row, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => { setSelectedSize(String(row.size)); setShowSizeModal(false); }}
                        style={{ 
                          background: selectedSize === String(row.size) ? 'rgba(197, 168, 128, 0.2)' : 'none', 
                          fontWeight: selectedSize === String(row.size) ? 'bold' : 'normal',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)', color: 'var(--gold, #c5a36a)', fontWeight: 900, fontSize: '1.05rem' }}>{row.size}</td>
                        <td style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)' }}>{row.chest || '—'}</td>
                        <td style={{ padding: '12px', border: '1px solid rgba(197,168,128,0.2)' }}>{row.hip || row.waist || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sticky Mobile Purchase Bar */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-card, rgba(255,255,255,0.95))',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(197,163,106,0.2)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 90,
          boxShadow: '0 -10px 25px rgba(0,0,0,0.08)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--espresso-dim)' }}>السعر الكلي:</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--gold)' }}>{price}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleAddToCart} 
            disabled={!!product.isOutOfStock}
            style={{ padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: '1.5px solid var(--gold)', color: 'var(--gold)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            أضف بالسلة
          </button>
          <button 
            onClick={() => { handleAddToCart(); navigate('/checkout'); }} 
            disabled={!!product.isOutOfStock}
            style={{ padding: '12px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--gold), #8f6e40)', color: '#fff', border: 'none', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(197,163,106,0.3)' }}
          >
            اشترِ الآن
          </button>
        </div>
      </div>

    </div>
  );
}

const inputStyle = {
  padding: '14px 18px', borderRadius: '14px',
  border: '1.5px solid rgba(197,163,106,0.3)',
  background: 'var(--bg-base, #faf8f5)',
  color: 'var(--espresso, #2b2015)',
  fontSize: '0.95rem', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.2s', direction: 'rtl'
};

const btnStyle = {
  padding: '14px 32px', borderRadius: '14px',
  background: 'linear-gradient(135deg, var(--gold, #c5a36a), #8f6e40)',
  color: '#fff', border: 'none', fontWeight: 900,
  fontSize: '0.98rem', cursor: 'pointer', fontFamily: 'inherit',
  transition: 'all 0.2s ease', boxShadow: '0 4px 18px rgba(197,163,106,0.35)'
};
