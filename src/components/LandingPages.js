import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Calendar, Heart, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import ProductModal from './ProductModal';
import { useStore } from '../context/StoreContext';

const formatPrice = (n) => `JOD ${parseFloat(n || 0).toFixed(2)}`;

// 1. Ramadan Landing Component
export const RamadanLanding = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { wishlist, toggleWishlist, addToCart } = useStore();

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        const filtered = (res.data || []).filter(p => 
          (p.tags || '').toLowerCase().includes('ramadan') || 
          (p.tags || '').toLowerCase().includes('رمضان')
        );
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #0f1624 0%, #05080e 100%)',
      minHeight: '100vh', color: '#fff', paddingBottom: '80px',
      fontFamily: "'Amiri', serif", direction: 'rtl', textAlign: 'right'
    }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative', height: '460px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000") center/cover',
        borderBottom: '2px solid #c5a880', overflow: 'hidden'
      }}>
        {/* Floating Crescent Glow */}
        <div style={{
          position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
          boxShadow: '0 0 100px rgba(197, 168, 128, 0.25)', top: '10%', right: '10%'
        }} />

        <div style={{ zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(197,168,128,0.15)', border: '1px solid #c5a880', padding: '6px 16px', borderRadius: '30px', color: '#c5a880', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 'bold' }}>
            <Sparkles size={14} /> تشكيلة رمضان الفاخرة
          </div>
          <h1 style={{ fontSize: '3.6rem', color: '#c5a880', textShadow: '0 4px 15px rgba(0,0,0,0.4)', margin: '0 0 15px' }}>مجموعة عبايات زهرة بيسان الرمضانية</h1>
          <p style={{ fontSize: '1.2rem', color: '#ddd', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            تألقي بوقار الشرق وأناقة التفاصيل مع باقة عبايات مصممة خصيصاً للشهر الفضيل بترميز شرقي فاخر وتطريز يدوي أصيل.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '0 20px' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#c5a880', marginBottom: '40px', borderBottom: '1px solid rgba(197,168,128,0.2)', paddingBottom: '15px' }}>عبايات الشهر الفضيل</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>جاري تحميل المجموعة الفاخرة...</div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(197,168,128,0.3)', borderRadius: '24px'
          }}>
            <Sparkles size={32} color="#c5a880" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>المجموعة ستتوفر قريباً جداً</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>نعمل على خياطة وتطريز التشكيلة لتكون جاهزة للعرض خلال أيام. ترقبي الإطلاق!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProduct(p)}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
                  <img src={p.image_url || '/12.png'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.badge && (
                    <span style={{ position: 'absolute', top: '15px', right: '15px', background: '#c5a880', color: '#1a0e05', padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.15rem', color: '#c5a880', fontWeight: 'bold' }}>{formatPrice(p.price_num || p.price)}</span>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{t ? t('View Details') : 'عرض التفاصيل'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal model={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

// 2. Eid Landing Component
export const EidLanding = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        const filtered = (res.data || []).filter(p => 
          (p.tags || '').toLowerCase().includes('eid') || 
          (p.tags || '').toLowerCase().includes('عيد') ||
          (p.tags || '').toLowerCase().includes('العيد')
        );
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #1c1024 0%, #0b060f 100%)',
      minHeight: '100vh', color: '#fff', paddingBottom: '80px',
      fontFamily: "'Outfit', sans-serif", direction: 'rtl', textAlign: 'right'
    }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative', height: '460px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url("https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=1000") center/cover',
        borderBottom: '2px solid #dfc19c', overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(223,193,156,0.15)', border: '1px solid #dfc19c', padding: '6px 16px', borderRadius: '30px', color: '#dfc19c', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 'bold' }}>
            <Sparkles size={14} /> بهجة إطلالة العيد
          </div>
          <h1 style={{ fontSize: '3.6rem', color: '#dfc19c', textShadow: '0 4px 15px rgba(0,0,0,0.4)', margin: '0 0 15px', fontFamily: "'DM Serif Display', serif" }}>تشكيلة عبايات العيد الفاخرة</h1>
          <p style={{ fontSize: '1.2rem', color: '#ddd', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            تميزي في لقاءات العيد وبثّي البهجة بحضوركِ مع أرقى موديلات عبايات الاستقبال والسهرة المطرزة بخيوط القصب واللؤلؤ.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '0 20px' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#dfc19c', marginBottom: '40px', borderBottom: '1px solid rgba(223,193,156,0.2)', paddingBottom: '15px' }}>عبايات العيد السعيدة</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>جاري تحميل التشكيلة الفاخرة...</div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(223,193,156,0.3)', borderRadius: '24px'
          }}>
            <Sparkles size={32} color="#dfc19c" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>أثواب العيد قيد التطريز النهائي</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>نضع اللمسات الأخيرة وتجهيز العبايات لتليق بإطلالتكِ الباهية في العيد. تابعينا قريباً!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProduct(p)}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
                  <img src={p.image_url || '/12.png'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.badge && (
                    <span style={{ position: 'absolute', top: '15px', right: '15px', background: '#dfc19c', color: '#1a0e05', padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.15rem', color: '#dfc19c', fontWeight: 'bold' }}>{formatPrice(p.price_num || p.price)}</span>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>تفاصيل الموديل</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal model={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

// 3. Summer Landing Component
export const SummerLanding = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        const filtered = (res.data || []).filter(p => 
          (p.tags || '').toLowerCase().includes('summer') || 
          (p.tags || '').toLowerCase().includes('صيف') ||
          (p.tags || '').toLowerCase().includes('صيفي')
        );
        setProducts(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #14221c 0%, #060a08 100%)',
      minHeight: '100vh', color: '#fff', paddingBottom: '80px',
      fontFamily: "'Inter', sans-serif", direction: 'rtl', textAlign: 'right'
    }}>
      {/* Header Banner */}
      <div style={{
        position: 'relative', height: '460px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000") center/cover',
        borderBottom: '2px solid #bda885', overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(189,168,133,0.15)', border: '1px solid #bda885', padding: '6px 16px', borderRadius: '30px', color: '#bda885', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 'bold' }}>
            <Sparkles size={14} /> خفة ونسائم الصيف
          </div>
          <h1 style={{ fontSize: '3.6rem', color: '#bda885', textShadow: '0 4px 15px rgba(0,0,0,0.4)', margin: '0 0 15px', fontFamily: "'DM Serif Display', serif" }}>عبايات الصيف الباردة والعملية</h1>
          <p style={{ fontSize: '1.2rem', color: '#ddd', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            أقمشة تتنفس ونعومة فائقة تناسب حرارة الصيف ونشاطات اليوم مع قصات عملية فضفاضة وألوان مستوحاة من هدوء الطبيعة.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '0 20px' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#bda885', marginBottom: '40px', borderBottom: '1px solid rgba(189,168,133,0.2)', paddingBottom: '15px' }}>المجموعة الصيفية الخفيفة</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>جاري تحميل المجموعة الصيفية...</div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(189,168,133,0.3)', borderRadius: '24px'
          }}>
            <Sparkles size={32} color="#bda885" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>المجموعة الصيفية قادمة قريباً</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem' }}>نعمل على توفير تشكيلة الكتان والحرير البارد لتواكب إطلالات الصيف المريحة. ترقبينا!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProduct(p)}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'transform 0.3s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
                  <img src={p.image_url || '/12.png'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.badge && (
                    <span style={{ position: 'absolute', top: '15px', right: '15px', background: '#bda885', color: '#1a0e05', padding: '4px 12px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.15rem', color: '#bda885', fontWeight: 'bold' }}>{formatPrice(p.price_num || p.price)}</span>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>تفاصيل العباءة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal model={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};
