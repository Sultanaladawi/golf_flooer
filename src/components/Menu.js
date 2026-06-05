import { useState, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Search, 
  XCircle, 
  Plus, 
  Shirt
} from 'lucide-react';
import { featuredItems } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Menu.module.css';
import ProductModal from './ProductModal';

const renderCategoryIcon = (iconName) => {
  const name = String(iconName || '').toLowerCase();
  const style = { fontSize: '1.2rem', display: 'inline-block', lineHeight: 1 };
  if (name.includes('classic') || name.includes('star') || name.includes('كلاسيك')) return <span className="emojiIcon" style={style}>👑</span>;
  if (name.includes('gem') || name.includes('occassion') || name.includes('مناسبات')) return <span className="emojiIcon" style={style}>💎</span>;
  if (name.includes('snowflake') || name.includes('winter') || name.includes('شتوية')) return <span className="emojiIcon" style={style}>❄️</span>;
  if (name.includes('bullhorn') || name.includes('new') || name.includes('حديث')) return <span className="emojiIcon" style={style}>✨</span>;
  if (name.includes('sun') || name.includes('daily') || name.includes('يومية')) return <span className="emojiIcon" style={style}>🌸</span>;
  return <span className="emojiIcon" style={style}>👗</span>;
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
  const { format } = useCurrency();

  const [dbItems, setDbItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ar-SA'); 
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Filter items based on active category AND search term
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
      
      if (searchTerm) return matchesSearch;
      return String(item.category_id) === String(activeTab);
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
    let imagesArray = [];
    try {
      imagesArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
    } catch (e) {
      imagesArray = [];
    }
    if (imagesArray.length > 0) return imagesArray[0];
    if (item.image_url) return item.image_url;
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
        {featuredItems.map((feat) => {
          // Sync with DB item to get latest stock/details
          const dbItem = dbItems.find(i => i.id === feat.id);
          const rawItem = dbItem ? { ...dbItem, tag: feat.tag } : feat;
          const item = {
            ...rawItem,
            displayPrice: format(parsePrice(rawItem.price_num || rawItem.price))
          };
          return (
            <FeaturedCard 
              key={item.id} 
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
                  onClick={() => setSelectedProduct(item)} 
                  style={{ 
                    cursor: 'pointer',
                    opacity: isOutOfStock ? 0.75 : 1,
                    direction: 'rtl'
                  }}
                >
                  <div className={styles.itemImageContainer}>
                    <img src={getImageUrl(item)} alt={item.name} onError={handleImageError} />
                    {isOutOfStock && (
                      <div className={styles.outOfStockOverlay}>
                        <span>نفذت الكمية</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDesc}>{item.subtitle || item.description}</div>
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
  const imgUrl = item.image ? item.image : getImageUrl(item);
  const isOutOfStock = !!item.isOutOfStock;
  return (
    <div 
      className={styles.featCard} 
      onClick={onAdd} 
      style={{ 
        cursor: 'pointer',
        background: '#121212',
        border: '1px solid rgba(197, 168, 128, 0.2)'
      }}
    >
      <div className={styles.featImg} style={{ position: 'relative', height: '240px' }}>
        <img src={imgUrl} alt={item.name} onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        <h3 className={styles.featName} style={{ color: '#fff' }}>{item.name}</h3>
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