import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ChevronRight, ChevronLeft, ShoppingBag, ArrowRight, Heart, Share2, MessageSquare, X } from 'lucide-react';

const SIZES = ['50', '52', '54', '56', '58', '60'];

function StarRating({ rating, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', color: 'var(--gold)' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} fill={s <= rating ? 'var(--gold)' : 'none'} stroke={s <= rating ? 'var(--gold)' : '#aaa'} />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { format } = useCurrency();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('54');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Luxury upgrades states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [userHeight, setUserHeight] = useState(160);
  const [recommendedSize, setRecommendedSize] = useState('54');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

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
        setReviews(data.reviews || []);
        if (data.variants && data.variants.length > 0) setSelectedVariant(data.variants[0]);
        // SEO
        document.title = `${data.name} | زهرة بيسان`;
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
            // shuffle and pick 4
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
    if (imgs.length === 0) imgs = ['/12.png'];
    return imgs;
  };

  const images = getImages();
  const handlePrev = () => setCurrentImg(i => (i === 0 ? images.length - 1 : i - 1));
  const handleNext = () => setCurrentImg(i => (i === images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price_display,
      priceNum: parseFloat(product.price_num) || 0,
      image_url: images[0],
      size: selectedSize,
      variant: selectedVariant ? selectedVariant.color_name : null,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const abayaName = product?.name || '';
    const abayaSize = selectedSize || 'غير محدد';
    const abayaColor = selectedVariant?.color_name || 'غير محدد';
    const abayaPrice = price || '';
    const pageUrl = window.location.href;

    const messageText = `السلام عليكم ورحمة الله، أرغب في طلب عباية:
*${abayaName}*
- المقاس: ${abayaSize}
- اللون: ${abayaColor}
- السعر: ${abayaPrice}
رابط المنتج: ${pageUrl}`;

    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/962796697413?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('تم نسخ الرابط!'));
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
        body: JSON.stringify({ product_id: product.id, reviewer_name: reviewName.trim() || 'مجهول', comment: reviewComment.trim(), rating: reviewRating }),
      });
      if (res.ok) {
        setReviews(prev => [{ id: Date.now(), reviewer_name: reviewName || 'مجهول', comment: reviewComment, rating: reviewRating, created_at: new Date().toISOString() }, ...prev]);
        setReviewName(''); setReviewComment(''); setReviewRating(5);
        setReviewSuccess(true); setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) { console.error('Review submit error:', err); }
    finally { setReviewSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #faf7f2)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid var(--gold, #c5a880)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ color: 'var(--espresso, #5c3d1e)', fontWeight: 700 }}>جاري التحميل...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--cream, #faf7f2)', gap: '20px' }}>
      <p style={{ color: 'var(--espresso, #5c3d1e)', fontSize: '1.2rem', fontWeight: 700 }}>{'⚠️ ' + (error || 'المنتج غير موجود')}</p>
      <button onClick={() => navigate('/')} style={btnStyle}>العودة للرئيسية</button>
    </div>
  );

  const price = product.price_num ? format(parseFloat(product.price_num)) : product.price_display;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--cream, #faf7f2)', fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .pp-thumb:hover { border-color: var(--gold, #c5a880) !important; opacity: 1 !important; }
        .pp-size-btn:hover { background: var(--gold, #c5a880) !important; color: #fff !important; border-color: var(--gold, #c5a880) !important; }
        .pp-swatch:hover { transform: scale(1.15) !important; }
        .pp-add-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(197,168,128,0.5) !important; }
        .pp-back-btn:hover { color: var(--gold, #c5a880) !important; }
        .pp-review-input:focus { border-color: var(--gold, #c5a880) !important; outline: none; }
        .pp-share-btn:hover { background: rgba(197,168,128,0.1) !important; border-color: var(--gold, #c5a880) !important; }
      `}</style>

      {/* Sticky Nav Bar */}
      <div style={{ background: 'rgba(250,247,242,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(197,168,128,0.2)', position: 'sticky', top: 0, zIndex: 50, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--espresso-dim, #8b6540)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--gold, #c5a880)', textDecoration: 'none', fontWeight: 700 }}>زهرة بيسان</Link>
          <ChevronLeft size={14} style={{ opacity: 0.5 }} />
          <Link to="/#collection" style={{ color: 'var(--espresso-dim, #8b6540)', textDecoration: 'none' }}>التشكيلة</Link>
          <ChevronLeft size={14} style={{ opacity: 0.5 }} />
          <span style={{ color: 'var(--espresso, #5c3d1e)', fontWeight: 700 }}>{product.name}</span>
        </div>
        <button className="pp-back-btn" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--espresso-dim, #8b6540)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '0.9rem', transition: 'color 0.2s', whiteSpace: 'nowrap' }}>
          <ArrowRight size={18} /><span>رجوع</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px 60px', animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* LEFT: Image Gallery */}
          <div>
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', aspectRatio: '3/4', maxHeight: '550px' }}>
              <img src={images[currentImg] || '/12.png'} alt={product.name}
                onError={e => { e.target.onerror = null; e.target.src = '/12.png'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {images.length > 1 && (<>
                <button onClick={handlePrev} style={arrowBtn('right')}><ChevronRight size={20} /></button>
                <button onClick={handleNext} style={arrowBtn('left')}><ChevronLeft size={20} /></button>
                <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImg(i)} style={{ width: i === currentImg ? '22px' : '8px', height: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: i === currentImg ? 'var(--gold, #c5a880)' : 'rgba(255,255,255,0.6)', transition: 'all 0.3s ease', padding: 0 }} />
                  ))}
                </div>
              </>)}
              
              {/* Play Video reels button overlay */}
              {(product.video_url || true) && (
                <button 
                  type="button" 
                  onClick={() => setIsPlayingVideo(true)}
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    right: '14px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    color: 'var(--espresso)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--gold, #c5a880)" stroke="var(--gold, #c5a880)" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  عرض الفيديو حركياً 🎥
                </button>
              )}

              <button onClick={() => setWishlisted(w => !w)} style={{ position: 'absolute', top: '14px', left: '14px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
                <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} stroke={wishlisted ? '#ef4444' : '#888'} />
              </button>
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', overflowX: 'auto', paddingBottom: '6px' }}>
                {images.map((img, i) => (
                  <button key={i} className="pp-thumb" onClick={() => setCurrentImg(i)} style={{ width: '72px', height: '90px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', padding: 0, cursor: 'pointer', border: `2px solid ${i === currentImg ? 'var(--gold, #c5a880)' : 'rgba(197,168,128,0.2)'}`, opacity: i === currentImg ? 1 : 0.65, transition: 'all 0.2s', background: '#fff' }}>
                    <img src={img} alt="" onError={e => { e.target.src = '/12.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
              {product.category && (<span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: 'rgba(197,168,128,0.15)', color: 'var(--gold, #c5a880)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '10px' }}>{product.category}</span>)}
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--espresso, #5c3d1e)', lineHeight: 1.3, margin: 0 }}>{product.name}</h1>
              {product.subtitle && (<p style={{ color: 'var(--espresso-dim, #8b6540)', fontSize: '1rem', marginTop: '6px', fontWeight: 500 }}>{product.subtitle}</p>)}
            </div>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <span style={{ color: 'var(--espresso-dim, #8b6540)', fontSize: '0.85rem', fontWeight: 600 }}>{avgRating} ({reviews.length} {reviews.length === 1 ? 'تقييم' : 'تقييمات'})</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '16px 20px', background: 'rgba(197,168,128,0.08)', borderRadius: '14px', border: '1px solid rgba(197,168,128,0.2)' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold, #c5a880)' }}>{price}</span>
            </div>

            {(product.description || product.desc) && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso, #5c3d1e)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>وصف المنتج</h3>
                <p style={{ color: 'var(--espresso-dim, #8b6540)', lineHeight: 1.8, fontSize: '0.95rem' }}>{product.description || product.desc}</p>
              </div>
            )}

            {/* Color Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso, #5c3d1e)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  اللون: <span style={{ color: 'var(--gold, #c5a880)' }}>{selectedVariant?.color_name || ''}</span>
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.variants.map(v => {
                    const list = v.colors || [];
                    let bg = list[0] || '#333';
                    if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
                    else if (list.length >= 3) bg = `conic-gradient(${list[0]} 0deg 120deg, ${list[1]} 120deg 240deg, ${list[2]} 240deg 360deg)`;
                    const isSel = selectedVariant?.id === v.id;
                    return (
                      <button key={v.id} className="pp-swatch" title={v.color_name} onClick={() => { setSelectedVariant(v); setCurrentImg(0); }}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: bg, border: `3px solid ${isSel ? 'var(--gold, #c5a880)' : 'rgba(197,168,128,0.3)'}`, cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', boxShadow: isSel ? '0 0 0 2px rgba(197,168,128,0.4)' : 'none', transform: isSel ? 'scale(1.15)' : 'scale(1)', padding: 0 }} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--espresso, #5c3d1e)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                  المقاس: <span style={{ color: 'var(--gold, #c5a880)' }}>{selectedSize}</span>
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowSizeModal(true)} 
                  style={{ background: 'none', border: 'none', color: 'var(--gold, #c5a880)', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  📏 دليل ومساعد المقاسات الذكي
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {SIZES.map(sz => (
                  <button key={sz} className="pp-size-btn" onClick={() => setSelectedSize(sz)}
                    style={{ padding: '8px 16px', borderRadius: '10px', fontWeight: 800, border: `2px solid ${selectedSize === sz ? 'var(--gold, #c5a880)' : 'rgba(197,168,128,0.3)'}`, background: selectedSize === sz ? 'var(--gold, #c5a880)' : 'transparent', color: selectedSize === sz ? '#fff' : 'var(--espresso, #5c3d1e)', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem', minWidth: '50px' }}>
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart + Share */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button className="pp-add-btn" onClick={handleAddToCart} disabled={!!product.isOutOfStock}
                style={{ flex: 1, padding: '16px 12px', background: product.isOutOfStock ? '#aaa' : 'transparent', color: product.isOutOfStock ? '#fff' : 'var(--gold, #c5a880)', border: product.isOutOfStock ? 'none' : '2px solid var(--gold, #c5a880)', borderRadius: '14px', fontWeight: 900, fontSize: '0.95rem', cursor: product.isOutOfStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', animation: addedToCart ? 'pulse 0.4s ease' : 'none' }}>
                <ShoppingBag size={18} />
                {product.isOutOfStock ? 'نفذت الكمية' : addedToCart ? 'تمت الإضافة!' : 'أضف للسلة'}
              </button>
              
              <button className="pp-add-btn" onClick={() => { handleAddToCart(); navigate('/checkout'); }} disabled={!!product.isOutOfStock}
                style={{ flex: 1.5, padding: '16px 12px', background: product.isOutOfStock ? '#aaa' : 'linear-gradient(135deg, var(--gold, #c5a880), #a8864d)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1rem', cursor: product.isOutOfStock ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(197,168,128,0.35)', transition: 'all 0.3s ease' }}>
                اطلب الآن
              </button>

              <button className="pp-share-btn" onClick={handleShare}
                style={{ padding: '16px', borderRadius: '14px', border: '2px solid rgba(197,168,128,0.3)', background: 'transparent', color: 'var(--espresso-dim, #8b6540)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                title="مشاركة المنتج">
                <Share2 size={20} />
              </button>
            </div>

            {/* WhatsApp Quick Order */}
            <button 
              type="button" 
              onClick={handleWhatsAppOrder} 
              disabled={!!product.isOutOfStock}
              style={{
                width: '100%',
                padding: '16px 12px',
                marginTop: '10px',
                background: product.isOutOfStock ? '#aaa' : '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: product.isOutOfStock ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.25)',
                transition: 'all 0.3s ease',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ flexShrink: 0 }}>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.453 5.461 0 9.902-4.43 9.905-9.877.002-2.639-1.02-5.12-2.878-6.98C16.636 1.89 14.152.868 11.516.868c-5.466 0-9.907 4.431-9.91 9.88-.002 1.716.452 3.39 1.31 4.887l-.994 3.633 3.725-.977zm11.367-7.915c-.12-.2-.44-.32-.92-.56-.48-.24-2.84-1.4-3.28-1.56-.44-.16-.76-.24-.96.24-.2.48-.76 1.56-.93 1.76-.17.2-.34.22-.82-.02-.48-.24-2.02-.74-3.84-2.37-1.42-1.27-2.38-2.84-2.66-3.32-.28-.48-.03-.74.21-.97.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-.96-2.32-1.32-3.18-.35-.85-.7-.73-.96-.74-.25-.01-.54-.01-.83-.01-.29 0-.76.11-1.15.53-.39.42-1.5 1.46-1.5 3.57 0 2.1 1.53 4.14 1.74 4.42.22.28 3.01 4.6 7.3 6.46 1.02.44 1.82.7 2.44.9.1.03.2.05.3.06 1.02.15 2.05.1 2.82-.02.86-.13 2.63-1.08 3-2.12.37-1.04.37-1.92.26-2.12z"/>
              </svg>
              طلب سريع وسهل عبر WhatsApp 💬
            </button>

            {/* Tags */}
            {product.tags && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                {(Array.isArray(product.tags) ? product.tags : String(product.tags).split(',')).filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(197,168,128,0.1)', color: 'var(--espresso-dim, #8b6540)', fontSize: '0.78rem', fontWeight: 600, border: '1px solid rgba(197,168,128,0.2)' }}>
                    #{typeof tag === 'object' ? tag.name : String(tag).trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '70px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <div style={{ width: '4px', height: '30px', background: 'var(--gold, #c5a880)', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--espresso, #5c3d1e)', margin: 0 }}>قد يعجبك أيضاً</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {relatedProducts.map(rp => (
                <Link to={`/product/${rp.id}`} key={rp.id} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ textDecoration: 'none', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
                    <img src={rp.image_url || '/12.png'} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--espresso)', margin: '0 0 6px', fontWeight: 800 }}>{rp.name}</h4>
                    <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '0.9rem' }}>{rp.price_display}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{ width: '4px', height: '30px', background: 'var(--gold, #c5a880)', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--espresso, #5c3d1e)', margin: 0 }}>آراء العملاء</h2>
            {reviews.length > 0 && (<span style={{ background: 'var(--gold, #c5a880)', color: '#fff', borderRadius: '20px', padding: '2px 12px', fontSize: '0.8rem', fontWeight: 800 }}>{reviews.length}</span>)}
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', borderRadius: '20px', border: '1px dashed rgba(197,168,128,0.3)', color: 'var(--espresso-dim, #8b6540)' }}>
              <MessageSquare size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 700 }}>لا توجد تقييمات بعد. كوني أول من يقيّم هذا المنتج!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ padding: '20px 24px', borderRadius: '16px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(197,168,128,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold, #c5a880), #a8864d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1rem' }}>
                        {(r.reviewer_name || '؟')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--espresso, #5c3d1e)', fontSize: '0.95rem' }}>{r.reviewer_name || 'مجهول'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
                      </div>
                    </div>
                    <StarRating rating={r.rating} size={14} />
                  </div>
                  {r.comment && <p style={{ color: 'var(--espresso-dim, #8b6540)', lineHeight: 1.7, margin: 0, fontSize: '0.93rem' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Write Review Form */}
          <div style={{ padding: '32px', borderRadius: '20px', background: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(197,168,128,0.15)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--espresso, #5c3d1e)', marginBottom: '20px' }}>✍️ اكتبي تقييمك</h3>
            {reviewSuccess && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', color: '#15803d', fontWeight: 700 }}>
                ✓ شكراً! تم إرسال تقييمك بنجاح.
              </div>
            )}
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input className="pp-review-input" type="text" placeholder="اسمك (اختياري)" value={reviewName} onChange={e => setReviewName(e.target.value)} style={inputStyle} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--espresso-dim, #8b6540)', fontWeight: 700, fontSize: '0.9rem' }}>تقييمك:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <Star size={24} fill={s <= reviewRating ? 'var(--gold, #c5a880)' : 'none'} stroke={s <= reviewRating ? 'var(--gold, #c5a880)' : '#ccc'} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className="pp-review-input" placeholder="شاركي رأيك في هذا المنتج..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} required rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} />
              <button type="submit" disabled={reviewSubmitting || !reviewComment.trim()}
                style={{ ...btnStyle, opacity: reviewSubmitting || !reviewComment.trim() ? 0.6 : 1, cursor: reviewSubmitting || !reviewComment.trim() ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Size Modal */}
      {showSizeModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', backdropFilter: 'blur(5px)', direction: 'rtl' }}>
          <div style={{ background: 'var(--bg-card, #fff)', width: '95%', maxWidth: '600px', borderRadius: '24px', border: '1.5px solid var(--gold, rgba(197, 168, 128, 0.3))', padding: '30px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowSizeModal(false)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'var(--espresso, #5c3d1e)', cursor: 'pointer', padding: 0 }} title="إغلاق">
              <X size={24} />
            </button>

            <h3 style={{ margin: '0 0 20px 0', color: 'var(--espresso, #5c3d1e)', fontSize: '1.4rem', fontWeight: 900, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              📏 دليل ومساعد المقاسات الذكي
            </h3>

            {/* Interactive Section */}
            <div style={{ background: 'rgba(197, 168, 128, 0.08)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.2)', marginBottom: '25px', textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--gold, #c5a880)', fontSize: '1.05rem', fontWeight: 800 }}>حاسبة المقاس التفاعلية</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--espresso)', marginBottom: '10px' }}>
                  طولكِ الكريم: <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{userHeight} سم</span>
                </label>
                <input 
                  type="range" 
                  min="145" 
                  max="185" 
                  value={userHeight} 
                  onChange={(e) => {
                    const h = parseInt(e.target.value);
                    setUserHeight(h);
                    let recSize = '54';
                    if (h <= 152) recSize = '50';
                    else if (h <= 157) recSize = '52';
                    else if (h <= 162) recSize = '54';
                    else if (h <= 167) recSize = '56';
                    else if (h <= 172) recSize = '58';
                    else recSize = '60';
                    setRecommendedSize(recSize);
                  }}
                  style={{ width: '100%', accentColor: 'var(--gold)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--espresso-dim)', marginTop: '4px' }}>
                  <span>145 سم</span>
                  <span>165 سم</span>
                  <span>185 سم</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card, #fff)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--espresso-dim)', display: 'block' }}>المقاس الموصى به:</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 900 }}>عباية مقاس {recommendedSize}</strong>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedSize(recommendedSize);
                    setShowSizeModal(false);
                  }}
                  style={{ padding: '8px 16px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  اعتماد المقاس
                </button>
              </div>
            </div>

            {/* Standard Size Table (KEPT SIDE-BY-SIDE!) */}
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--espresso, #5c3d1e)', fontSize: '1.05rem', fontWeight: 800 }}>جدول المقاسات القياسي للعبايات</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'center', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(197, 168, 128, 0.12)', color: 'var(--espresso)' }}>
                      <th style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>مقاس العباية</th>
                      <th style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>طولكِ الملائم (سم)</th>
                      <th style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>طول العباية (إنش)</th>
                      <th style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>طول الكم (إنش)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: '50', height: '147 - 152', length: '50', sleeve: '25' },
                      { size: '52', height: '153 - 157', length: '52', sleeve: '26' },
                      { size: '54', height: '158 - 162', length: '54', sleeve: '27' },
                      { size: '56', height: '163 - 167', length: '56', sleeve: '28' },
                      { size: '58', height: '168 - 172', length: '58', sleeve: '29' },
                      { size: '60', height: '173 - 178', length: '60', sleeve: '30' }
                    ].map((row) => (
                      <tr key={row.size} style={{ background: recommendedSize === row.size ? 'rgba(197, 168, 128, 0.15)' : 'none', fontWeight: recommendedSize === row.size ? 'bold' : 'normal' }}>
                        <td style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)', color: 'var(--gold)', fontWeight: 'bold' }}>{row.size}</td>
                        <td style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>{row.height} سم</td>
                        <td style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>{row.length}</td>
                        <td style={{ padding: '8px', border: '1px solid rgba(197,168,128,0.2)' }}>{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Video Reels Modal */}
      {isPlayingVideo && (product.video_url || true) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', backdropFilter: 'blur(10px)' }}>
          <button onClick={() => setIsPlayingVideo(false)} style={{ position: 'absolute', top: '25px', left: '25px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }} title="إغلاق">
            <X size={32} />
          </button>
          <div style={{ width: '100%', maxWidth: '450px', aspectRatio: '9/16', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video 
              src={product.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-posing-in-traditional-moroccan-dress-33158-large.mp4'} 
              autoPlay 
              loop 
              controls 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ── */
const arrowBtn = (side) => ({
  position: 'absolute', top: '50%', [side]: '12px', transform: 'translateY(-50%)',
  width: '38px', height: '38px', borderRadius: '50%',
  background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)',
  border: '1px solid rgba(255,255,255,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 2, color: '#333'
});

const inputStyle = {
  padding: '13px 16px', borderRadius: '12px',
  border: '1.5px solid rgba(197,168,128,0.3)',
  background: 'var(--cream, #faf7f2)',
  color: 'var(--espresso, #5c3d1e)',
  fontSize: '0.95rem', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.2s', direction: 'rtl'
};

const btnStyle = {
  padding: '13px 30px', borderRadius: '12px',
  background: 'linear-gradient(135deg, var(--gold, #c5a880), #a8864d)',
  color: '#fff', border: 'none', fontWeight: 900,
  fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
  transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(197,168,128,0.35)'
};
