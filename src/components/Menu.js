import { useState, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Search, 
  XCircle, 
  Plus, 
  Shirt,
  Crown,
  Gem,
  Snowflake,
  Sparkles,
  Flower2,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { featuredItems } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Menu.module.css';
import ProductModal from './ProductModal';

const renderCategoryIcon = (iconName) => {
  const name = String(iconName || '').toLowerCase();
  const style = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  const size = 18;
  if (name.includes('classic') || name.includes('star') || name.includes('كلاسيك')) return <Crown size={size} style={style} />;
  if (name.includes('gem') || name.includes('occassion') || name.includes('مناسبات')) return <Gem size={size} style={style} />;
  if (name.includes('snowflake') || name.includes('winter') || name.includes('شتوية')) return <Snowflake size={size} style={style} />;
  if (name.includes('bullhorn') || name.includes('new') || name.includes('حديث')) return <Sparkles size={size} style={style} />;
  if (name.includes('sun') || name.includes('daily') || name.includes('يومية')) return <Flower2 size={size} style={style} />;
  return <Shirt size={size} style={style} />;
};

function parsePrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
}

export default function Menu() {
  const [headerRef, headerVis] = useReveal();
  const [featRef, featVis] = useReveal();
  const [fullRef, fullVis] = useReveal();
  const { items } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();

  const [dbItems, setDbItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ar-SA'); 
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Fetch categories from DB
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setCategories(sorted);
          setActiveTab(String(sorted[0].id));
        }
      } catch (err) {
        console.error('Categories fetch error:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch menu items from DB
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (Array.isArray(data)) {
          setDbItems(data);
        } else {
          setDbItems([]);
        }
      } catch (error) {
        console.error('Menu fetch error:', error);
        setDbItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // Bilingual Search Mapper (Arabic <-> English)
  const getSearchTerms = (term) => {
    const t = term.toLowerCase().trim();
    const dictionary = {
      'كريب': ['fabric', 'crepe'],
      'حرير': ['silk'],
      'شيفون': ['chiffon'],
      'صوف': ['wool', 'cashmere', 'صوف'],
      'ملكية': ['royal', 'classic'],
      'بشت': ['bisht', 'winter'],
      'سوداء': ['black', 'أسود'],
      'صيف': ['summer', 'new', 'صيفية'],
      'مطرز': ['embroid', 'hand', 'تطريز'],
      'مناسبات': ['occassion', 'night', 'مساء'],
      'شتوي': ['winter', 'heavy', 'شتوية']
    };
    
    let terms = [t];
    Object.keys(dictionary).forEach(key => {
      if (t.includes(key)) terms = [...terms, ...dictionary[key]];
    });
    return terms;
  };

  // Filter items based on active category AND search term AND filters
  const itemsToShow = dbItems
    .filter(item => {
      const searchTerms = getSearchTerms(searchTerm);
      const matchesSearch = searchTerms.some(s => {
        const matchesName = item.name.toLowerCase().includes(s);
        const matchesDesc = (item.desc || item.description || '').toLowerCase().includes(s);
        const matchesTags = (item.tags || '').toString().toLowerCase().includes(s);
        const matchesSubtitle = (item.subtitle || '').toLowerCase().includes(s);
        return matchesName || matchesDesc || matchesTags || matchesSubtitle;
      });
      
      if (searchTerm && !matchesSearch) return false;
      if (!searchTerm && String(item.category_id) !== String(activeTab)) return false;

      // Price Filter
      const itemPrice = parsePrice(item.price_num || item.price);
      if (priceRange.min !== '' && itemPrice < parseFloat(priceRange.min)) return false;
      if (priceRange.max !== '' && itemPrice > parseFloat(priceRange.max)) return false;

      // Color Filter
      if (selectedColors.length > 0) {
        const itemStr = JSON.stringify(item).toLowerCase();
        const hasColor = selectedColors.some(c => itemStr.includes(c.toLowerCase()));
        if (!hasColor) return false;
      }

      // Size Filter
      if (selectedSizes.length > 0) {
        const tags = Array.isArray(item.tags) ? item.tags : (item.tags || '').toString().split(',');
        const lowerTags = tags.map(t => t.trim().toLowerCase());
        const variantsStr = JSON.stringify(item.variants || []).toLowerCase();
        const descStr = (item.description || item.desc || '').toLowerCase();
        
        const hasSize = selectedSizes.some(s => {
           const sl = s.toLowerCase();
           return lowerTags.includes(sl) || variantsStr.includes(`"${sl}"`) || variantsStr.includes(`:${sl}`) || descStr.includes(sl);
        });
        if (!hasSize) return false;
      }

      return true;
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(item => ({
      ...item,
      displayPrice: format(parsePrice(item.price_num || item.price)),
      tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : [],
    }));

  const activeCategory = categories.find(c => String(c.id) === String(activeTab));
  const themeColor = activeCategory?.color || '#c5a880';

  const getImageUrl = (item) => {
    if (!item) return '/12.png';
    if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim()) {
      let src = item.image_url.trim();
      if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return src;
      return `/images/${src.toLowerCase()}`;
    }
    let imagesArray = [];
    try {
      imagesArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
    } catch (e) {
      imagesArray = [];
    }
    if (imagesArray.length > 0 && imagesArray[0]) {
      let src = imagesArray[0];
      if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) return src;
      return `/images/${src.toLowerCase()}`;
    }
    return '/12.png';
  };


  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/12.png';
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      
      const cleanTranscript = transcript.replace(/[.,]/g, '').trim();
      setSearchTerm(cleanTranscript);
    };

    recognition.start();
  };

  return (
    <section className={styles.menu} id="collection">
      {selectedProduct && (
        <ProductModal 
          model={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      <div ref={headerRef} className={`section-wrap ${styles.header} reveal ${headerVis ? 'vis' : ''}`}>
        <div className="label" style={{ color: 'var(--gold-dim)' }}>إبداعاتنا الحصرية</div>
        <div className="divider" style={{ background: 'var(--gold)' }} />
        <h2 className="h2" style={{ color: 'var(--espresso)', fontSize: '2.5rem' }}>التشكيلة المختارة</h2>
      </div>

      {/* Featured abayas cards */}
      <div ref={featRef} className={`section-wrap ${styles.featuredGrid} reveal ${featVis ? 'vis' : ''}`}>
        {((dbItems && dbItems.length > 0) ? dbItems.slice(0, 4) : featuredItems).map((rawItem, idx) => {
          const defaultTags = ['الأكثر مبيعاً', 'جديد', 'تشكيلة الشتاء', 'فاخر'];
          const item = {
            ...rawItem,
            tag: rawItem.tag || defaultTags[idx % defaultTags.length],
            displayPrice: format(parsePrice(rawItem.price_num || rawItem.price))
          };
          return (
            <FeaturedCard 
              key={item.id || idx} 
              item={item} 
              onAdd={() => setSelectedProduct(item)} 
              getImageUrl={getImageUrl} 
              handleImageError={handleImageError} 
            />
          );
        })}
      </div>

      <div ref={fullRef} className={`section-wrap ${styles.fullMenu} reveal ${fullVis ? 'vis' : ''}`}>
        
        {/* Search Bar - Modern & Glassy */}
        <div className={styles.searchBarWrap}>
          <div style={{
            position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gold)', opacity: 0.6, pointerEvents: 'none', zIndex: 5
          }}>
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder={listening 
              ? (voiceLang === 'ar-SA' ? '🎙️ جاري الاستماع...' : '🎙️ Listening...') 
              : (voiceLang === 'ar-SA' ? 'ابحثي عن عباية، قماش، ألوان...' : 'Search for abayas, fabric, colors...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 110px 18px 55px',
              borderRadius: '25px',
              border: '1px solid var(--border-hover)',
              backgroundColor: 'var(--white)',
              backdropFilter: 'blur(10px)',
              color: 'var(--espresso)',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-gold)',
              outline: 'none',
              transition: 'all 0.3s ease',
              textAlign: voiceLang === 'ar-SA' ? 'right' : 'left'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(166,134,93,0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
            }}
          />
          
          <div style={{
            position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer',
                  padding: '5px', fontSize: '1.1rem'
                }}
              >
                <XCircle size={20} />
              </button>
            )}

            <button
              onClick={() => setVoiceLang(v => v === 'en-GB' ? 'ar-SA' : 'en-GB')}
              style={{
                background: 'rgba(197, 168, 128, 0.1)', border: 'none',
                borderRadius: '8px', padding: '4px 6px', fontSize: '0.65rem',
                fontWeight: '900', color: 'var(--gold)', cursor: 'pointer'
              }}
              title={voiceLang === 'ar-SA' ? 'Switch to English' : 'التبديل للعربية'}
            >
              {voiceLang === 'ar-SA' ? 'AR' : 'EN'}
            </button>

            <button
              onClick={startVoice}
              style={{
                width: '35px', height: '35px', borderRadius: '50%',
                border: 'none', background: listening ? '#ff4d4d' : 'var(--gold)',
                color: '#000', cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: listening ? '0 0 15px rgba(255,77,77,0.4)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {listening ? <Square size={16} fill="#fff" style={{ color: '#fff' }} /> : <Mic size={16} style={{ color: '#000' }} />}
            </button>
          </div>
        </div>

        <div className={styles.tabBar} style={{ 
          display: 'flex', gap: '8px', overflowX: 'auto', padding: '15px',
          scrollbarWidth: 'none', msOverflowStyle: 'none', borderBottom: 'none',
          backgroundColor: 'transparent'
        }}>
          {categories.map(cat => {
            const isActive = activeTab === String(cat.id);
            const catColor = '#c5a880';
            return (
              <button 
                key={cat.id} 
                className={`${styles.tab} ${isActive ? styles.tabActive : ''}`} 
                onClick={() => { setActiveTab(String(cat.id)); setSearchTerm(''); }} 
                style={{
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--gold)' : 'var(--border)',
                  background: isActive ? 'linear-gradient(135deg, var(--gold), var(--gold-dim))' : 'var(--white)',
                  color: isActive ? 'var(--espresso)' : 'var(--espresso-dim)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: isActive ? 'var(--shadow-gold)' : 'none',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {renderCategoryIcon(cat.name || cat.label || cat.icon)}
                <span style={{ letterSpacing: '0.5px' }}>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Toggle Button */}
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'flex-start', marginTop: '10px', direction: 'rtl' }}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`${styles.filterToggleBtn} ${isFilterOpen ? styles.filterToggleActive : ''}`}
          >
            <SlidersHorizontal size={18} />
            <span>تصفية متقدمة</span>
          </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
              <h4 style={{ margin: 0, color: 'var(--espresso)', fontSize: '1.2rem', fontFamily: "'DM Serif Display', serif" }}>فلاتر البحث</h4>
              <button onClick={clearFilters} className={styles.clearBtn}>مسح الفلاتر</button>
            </div>
            
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>نطاق السعر</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="number" 
                    placeholder="من" 
                    value={priceRange.min}
                    onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                    className={styles.filterInput}
                  />
                  <input 
                    type="number" 
                    placeholder="إلى" 
                    value={priceRange.max}
                    onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                    className={styles.filterInput}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>الألوان</label>
                <div className={styles.tagsContainer}>
                  {['أسود', 'أبيض', 'بيج', 'ذهبي', 'بني', 'كحلي', 'عنابي', 'رمادي'].map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button 
                        key={color}
                        onClick={() => setSelectedColors(prev => isSelected ? prev.filter(c => c !== color) : [...prev, color])}
                        className={`${styles.filterTag} ${isSelected ? styles.tagSelected : ''}`}
                      >
                        {isSelected && <Check size={14} style={{ marginLeft: '4px' }}/>}
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>المقاسات</label>
                <div className={styles.tagsContainer}>
                  {['S', 'M', 'L', 'XL', 'XXL', '50', '52', '54', '56', '58', '60'].map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button 
                        key={size}
                        onClick={() => setSelectedSizes(prev => isSelected ? prev.filter(s => s !== size) : [...prev, size])}
                        className={`${styles.filterTag} ${isSelected ? styles.tagSelected : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.itemList} style={{ background: 'var(--cream)' }}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className={styles.item} style={{ border: '1px solid rgba(197,168,128,0.05)' }}>
                <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                  <div className={styles.skeleton} style={{ width: '70px', height: '70px', borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <div className={styles.skeleton} style={{ width: '40%', height: '18px', marginBottom: '10px' }} />
                    <div className={styles.skeleton} style={{ width: '80%', height: '14px', marginBottom: '10px' }} />
                    <div className={styles.skeleton} style={{ width: '30%', height: '14px' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={styles.skeleton} style={{ width: '40px', height: '20px', marginBottom: '10px', marginLeft: 'auto' }} />
                  <div className={styles.skeleton} style={{ width: '30px', height: '30px', borderRadius: '50%', marginLeft: 'auto' }} />
                </div>
              </div>
            ))
          ) : itemsToShow.length > 0 ? (
            itemsToShow.map((item) => {
              const isOutOfStock = !!item.isOutOfStock;
              return (
                <div 
                  key={item.id} 
                  className={styles.item} 
                  style={{ 
                    opacity: isOutOfStock ? 0.75 : 1,
                    direction: 'rtl'
                  }}
                >
                  <div className={styles.itemImageContainer} style={{ position: 'relative' }} onClick={() => window.location.href = `/product/${item.id}`}>
                    <img src={getImageUrl(item)} alt={item.name} onError={handleImageError} />
                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: item.id, name: item.name, image_url: getImageUrl(item), priceNum: item.priceNum || item.price, category: item.category }); }}
                      style={{
                        position: 'absolute', top: '8px', left: '8px',
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.25s ease',
                        zIndex: 2,
                      }}
                      aria-label={isWishlisted(item.id) ? 'إزالة من الأمنيات' : 'إضافة للأمنيات'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill={isWishlisted(item.id) ? '#ef4444' : 'none'}
                        stroke={isWishlisted(item.id) ? '#ef4444' : '#fff'}
                        strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    {isOutOfStock && (
                      <div className={styles.outOfStockOverlay}>
                        <span>نفذت الكمية</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName} onClick={() => window.location.href = `/product/${item.id}`} style={{ cursor: 'pointer' }}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.subtitle || item.description}</div>
                    {item.variants && item.variants.length > 0 && (
                      <div className={styles.itemSwatches} onClick={(e) => e.stopPropagation()}>
                        {item.variants.map(v => {
                          const list = v.colors || [];
                          let bg = '';
                          if (list.length === 1) bg = list[0];
                          else if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
                          else if (list.length === 3) bg = `conic-gradient(${list[0]} 0deg 120deg, ${list[1]} 120deg 240deg, ${list[2]} 240deg 360deg)`;
                          else if (list.length === 4) bg = `conic-gradient(${list[0]} 0deg 90deg, ${list[1]} 90deg 180deg, ${list[2]} 180deg 270deg, ${list[3]} 270deg 360deg)`;
                          return (
                            <div 
                              key={v.id} 
                              title={v.color_name} 
                              className={styles.swatchBall} 
                              style={{ background: bg || '#333' }} 
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.itemFooter}>
                    <div className={styles.itemPrice}>{item.displayPrice || item.price}</div>
                    <button 
                      className={styles.addBtnSmall} 
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(item); }}
                    >
                      <Plus size={16} />
                      <span>تفاصيل</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ 
              textAlign: 'center', padding: '60px 20px', color: 'var(--espresso-dim)',
              backgroundColor: 'var(--bg-surface)', borderRadius: '30px', border: '1px dashed var(--border-hover)'
            }}>
              <Shirt size={60} style={{ margin: '0 auto 20px', display: 'block', opacity: 0.3, color: 'var(--gold-dim)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--espresso)' }}>لم نجد نتائج مطابقة</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '5px', color: 'var(--espresso-dim)' }}>يرجى المحاولة بكلمات بحث أخرى أو تصفح الأقسام.</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: '20px', padding: '10px 25px', borderRadius: '50px',
                    backgroundColor: 'var(--gold)', color: '#000', border: 'none',
                    fontWeight: '700', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  مسح البحث
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ item, onAdd, getImageUrl, handleImageError }) {
  const imgUrl = getImageUrl(item);
  const isOutOfStock = !!item.isOutOfStock;
  return (
    <div 
      className={styles.featCard} 
    >
      <div className={styles.featImg} style={{ position: 'relative', height: '240px', cursor: 'pointer' }} onClick={() => window.location.href = `/product/${item.id}`}>
        <img src={imgUrl} alt={item.name} onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        {item.tag && !isOutOfStock && <span className={styles.featBadge}>{item.tag}</span>}
        {isOutOfStock && (
          <span className={styles.featBadge} style={{ 
            background: 'rgba(20, 20, 20, 0.85)', 
            backdropFilter: 'blur(4px)',
            color: 'var(--gold)',
            border: '1px solid rgba(197,168,128,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            textTransform: 'uppercase',
            fontWeight: '900',
            letterSpacing: '1px'
          }}>نفذت الكمية</span>
        )}
      </div>
      <div className={styles.featBody} style={{ textAlign: 'right' }}>
        <h3 className={styles.featName} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/product/${item.id}`}>{item.name}</h3>
        {/* Luxury Star Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '6px 0 10px 0', fontSize: '0.82rem', direction: 'rtl', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingVal = item.avg_rating || 5;
              return (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(ratingVal) ? 'var(--gold)' : 'none'} stroke="var(--gold)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              );
            })}
          </div>
          <span style={{ color: 'var(--espresso)', fontWeight: '700', marginRight: '4px' }}>
            {parseFloat(item.avg_rating || 5).toFixed(1)}
          </span>
          <span style={{ color: 'var(--espresso-dim)', fontSize: '0.75rem' }}>
            ({item.total_reviews || 0} {item.total_reviews === 1 ? 'تقييم' : 'تقييمات'})
          </span>
        </div>
        {item.variants && item.variants.length > 0 && (
          <div className={styles.itemSwatches} style={{ justifyContent: 'flex-start', margin: '5px 0 10px 0' }} onClick={(e) => e.stopPropagation()}>
            {item.variants.map(v => {
              const list = v.colors || [];
              let bg = '';
              if (list.length === 1) bg = list[0];
              else if (list.length === 2) bg = `conic-gradient(${list[0]} 50%, ${list[1]} 50%)`;
              else if (list.length === 3) bg = `conic-gradient(${list[0]} 0deg 120deg, ${list[1]} 120deg 240deg, ${list[2]} 240deg 360deg)`;
              else if (list.length === 4) bg = `conic-gradient(${list[0]} 0deg 90deg, ${list[1]} 90deg 180deg, ${list[2]} 180deg 270deg, ${list[3]} 270deg 360deg)`;
              return (
                <div 
                  key={v.id} 
                  title={v.color_name} 
                  className={styles.swatchBall} 
                  style={{ background: bg || '#333' }} 
                />
              );
            })}
          </div>
        )}
        <div className={styles.featFooter}>
          <span className={styles.featPrice} style={{ color: 'var(--gold)' }}>{item.displayPrice || item.price}</span>
          <button 
            className={styles.featAddBtn} 
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            style={{
              background: 'var(--gold)',
              color: '#000',
              fontWeight: 'bold'
            }}
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}