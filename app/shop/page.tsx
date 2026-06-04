"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';
import { useAppContext } from '../context/AppContext';
import ProductModal, { type ModelData } from '../components/ProductModal';

function ShopContent() {
  const { products, currency } = useAppContext();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openModel, setOpenModel] = useState<ModelData | null>(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('all');
    }
  }, [categoryParam]);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className={styles.shopContainer}>
      {openModel && (
        <ProductModal model={openModel} onClose={() => setOpenModel(null)} />
      )}

      {/* Sidebar Filters */}
      <aside className={styles.filters}>
        <div className={styles.filterHeader}>
          <Filter size={20} />
          <h2>تصفية المنتجات</h2>
        </div>
        
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>الأقسام <ChevronDown size={16} /></h3>
          <ul className={styles.filterList}>
            <li>
              <button 
                className={activeCategory === 'all' ? styles.activeFilter : ''} 
                onClick={() => setActiveCategory('all')}
              >
                الكل
              </button>
            </li>
            <li>
              <button 
                className={activeCategory === 'new' ? styles.activeFilter : ''} 
                onClick={() => setActiveCategory('new')}
              >
                وصل حديثاً
              </button>
            </li>
            <li>
              <button 
                className={activeCategory === 'winter' ? styles.activeFilter : ''} 
                onClick={() => setActiveCategory('winter')}
              >
                تشكيلة الشتاء
              </button>
            </li>
            <li>
              <button 
                className={activeCategory === 'classic' ? styles.activeFilter : ''} 
                onClick={() => setActiveCategory('classic')}
              >
                كلاسيك
              </button>
            </li>
            <li>
              <button 
                className={activeCategory === 'occassions' ? styles.activeFilter : ''} 
                onClick={() => setActiveCategory('occassions')}
              >
                مناسبات
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Product Grid */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>التشكيلة الكاملة</h1>
          <span>{filteredProducts.length} منتجات</span>
        </div>
        
        <div className={styles.productGrid}>
          {filteredProducts.map((product) => {
            const hasImages = product.images.length > 0;
            const displayImage = hasImages ? product.images[0] : '/12.png';
            
            return (
              <div 
                key={product.id} 
                className={styles.productCard}
                onClick={() => setOpenModel(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.productImageContainer}>
                  {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                  
                  {hasImages ? (
                    <Image 
                      src={displayImage} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy" 
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    product.videos.length > 0 && (
                      <video 
                        src={product.videos[0]} 
                        muted 
                        playsInline 
                        autoPlay
                        loop
                        preload="none"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                  <button 
                    className="btn-secondary" 
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModel(product);
                    }}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div style={{ padding: '8rem 2rem', textAlign: 'center', color: 'var(--color-primary)', fontSize: '1.2rem' }}>جاري التحميل...</div>}>
      <ShopContent />
    </Suspense>
  );
}
