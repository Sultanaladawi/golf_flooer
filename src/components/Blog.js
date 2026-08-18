import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Sparkles, BookOpen, Clock, ShoppingBag } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export const DEFAULT_ARTICLES = [
  {
    id: 1,
    slug: 'taj-beesan-bridal-haute-couture',
    title: 'عرائس بيسان 2026: كيف صُمم قفطان تاج بيسان ليكون تحفة الحفل الأولى؟',
    author: 'يافا — خبيرة الأناقة والموضة الملكية',
    created_at: '2026-08-15',
    category: 'إطلالات المناسبات والعرائس',
    readTime: '4 دقائق قراءة',
    image_url: '/15.jpg',
    excerpt: 'يجمع قفطان تاج بيسان بين التطريز اليدوي بخيوط الذهب 22 قيراط وحرير الكريب الإيطالي المنساب، ليمنح العروس حضوراً ملكياً مهيباً لا يُنسى في ليلة العمر.',
    productId: 1,
    productName: 'قفطان تاج بيسان العرائسي',
    productPrice: 150
  },
  {
    id: 2,
    slug: 'modern-pearl-luxury-styling',
    title: 'بريق اللؤلؤ الطبيعي: اللمسة العصرية التي تبحث عنها سيدة الأعمال الراقية',
    author: 'فريق تصميم دار زهرة بيسان',
    created_at: '2026-08-12',
    category: 'إطلالات يومية واستقبال',
    readTime: '3 دقائق قراءة',
    image_url: '/13.png',
    excerpt: 'تألقي بعباية اللؤلؤة المصنوعة من قماش الصالونة الياباني الفاخر والمطعمة بحبات اللؤلؤ النهري المختارة بعناية لتعكس الرقي والهدوء في كل خطوة.',
    productId: 2,
    productName: 'عباية اللؤلؤة العصرية 🦪',
    productPrice: 85
  },
  {
    id: 3,
    slug: 'sultana-imperial-robe-heritage',
    title: 'هيبة التطريز الحريري: قصة ثوب السلطانة الملكي وتراث الشرق الخالد',
    author: 'يافا — خبيرة الأناقة والموضة الملكية',
    created_at: '2026-08-08',
    category: 'تصاميم ملكية مطرزة',
    readTime: '5 دقائق قراءة',
    image_url: '/8.png',
    excerpt: 'مستوحى من أزياء القصور العثمانية والأندلسية العريقة، ينفرد ثوب السلطانة بتفاصيل خياطة يدوية مكثفة تبرز المكانة والوقار العربي الأصيل.',
    productId: 3,
    productName: 'ثوب السلطانة الملكي👑',
    productPrice: 130
  },
  {
    id: 4,
    slug: 'princess-royal-kaftan-elegance',
    title: 'إطلالة الأميرات: سر التناغم بين الحشمة العالية والقصات الفضفاضة الفارهة',
    author: 'دار زهرة بيسان — قسم الهوت كوتور',
    created_at: '2026-08-04',
    category: 'إطلالات المناسبات والعرائس',
    readTime: '4 دقائق قراءة',
    image_url: '/9 (1).png',
    excerpt: 'تم تصميم قفطان الأميرة ليمنحكِ الراحة التامة دون التنازل عن أرقى معايير الفخامة، بفضل حواف الشيفون المطرزة وزوايا القصات الهندسية الدقيقة.',
    productId: 4,
    productName: 'قفطان الأميرة 👑',
    productPrice: 110
  },
  {
    id: 5,
    slug: 'ruby-jewel-kaftan-vibrant-beauty',
    title: 'سحر الياقوت: كيف تختارين درجات الألوان الملكية في استقبالاتكِ الفخمة؟',
    author: 'يافا — خبيرة الأناقة والموضة الملكية',
    created_at: '2026-07-30',
    category: 'إطلالات يومية واستقبال',
    readTime: '3 دقائق قراءة',
    image_url: '/15.jpg',
    excerpt: 'يمنح قفطان الياقوتة إشراقة فورية لبشرتكِ بفضل لونه الغني وانعكاسات الكريستال الناعمة، وهو الخيار الأفضل لحفلات الاستقبال والاجتماعات العائلية الراقية.',
    productId: 5,
    productName: 'قفطان الياقوتة💎',
    productPrice: 95
  },
  {
    id: 6,
    slug: 'yashmak-traditional-oriental-robe',
    title: 'ثوب اليشمك: عودة القصات التاريخية بروح الألفية الثالثة',
    author: 'فريق الحرف اليدوية — دار بيسان',
    created_at: '2026-07-25',
    category: 'تصاميم ملكية مطرزة',
    readTime: '4 دقائق قراءة',
    image_url: '/13.png',
    excerpt: 'تحية للمرأة العربية العاشقة للأصالة، يجمع ثوب اليشمك بين متانة نسيج الكتان والقطن الفاخر وخيوط البريسم اللامعة ليعيش معكِ عقوداً من الزمن.',
    productId: 6,
    productName: 'ثوب اليشمك',
    productPrice: 90
  },
  {
    id: 7,
    slug: 'beesan-signature-dress-daily-comfort',
    title: 'الوقار والانسيابية: أسرار ثوب بيسان الأيقوني للاستخدام اليومي الراقي',
    author: 'تصاميم دار زهرة بيسان',
    created_at: '2026-07-20',
    category: 'إطلالات يومية واستقبال',
    readTime: '3 دقائق قراءة',
    image_url: '/8.png',
    excerpt: 'خفة لا تصدق وتهوية مثالية طوال اليوم، ثوب بيسان هو التجسيد الحقيقي للسهل الممتنع في عالم العبايات الشرقية الراقية.',
    productId: 7,
    productName: 'ثوب بيسان 🌿',
    productPrice: 75
  },
  {
    id: 8,
    slug: 'black-elegance-timeless-abaya',
    title: 'سيد الألوان: أسرار السواد الفاحم والقصة الكلاسيكية الساحرة',
    author: 'يافا — خبيرة الأناقة والموضة الملكية',
    created_at: '2026-07-15',
    category: 'أسرار الأقمشة والعناية',
    readTime: '3 دقائق قراءة',
    image_url: '/9 (1).png',
    excerpt: 'السواد ليس مجرد لون، بل هو لغة الهيبة والأناقة المطلقة. اكتشفي كيف تم نسج ثوب الأناقة السوداء بحرير منتصف الليل المعالج لمقاومة التجعد.',
    productId: 8,
    productName: 'ثوب الأناقة السوداء 💎',
    productPrice: 80
  },
  {
    id: 9,
    slug: 'al-andalus-royal-abaya-masterpiece',
    title: 'عبق الأندلس: تناغم النقوش التاريخية مع خيوط الحرير الإيطالي',
    author: 'يافا — خبيرة الأناقة والموضة الملكية',
    created_at: '2026-07-10',
    category: 'تصاميم ملكية مطرزة',
    readTime: '5 دقائق قراءة',
    image_url: '/15.jpg',
    excerpt: 'قطعة فنية تجسد جمال الزخارف الأندلسية المعقدة المنفذة يدوياً بدقة متناهية على أقمشة الجاكار الحريرية الفاخرة.',
    productId: 16,
    productName: 'عباية الأندلس 🌿',
    productPrice: 105
  }
];

function getBlogImg(url) {
  if (!url || typeof url !== 'string') return '/15.jpg';
  let src = url.trim();
  if (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  return `/images/${src}`;
}

export default function Blog() {
  const [posts, setPosts] = useState(DEFAULT_ARTICLES);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { format: formatPrice } = useCurrency();

  useEffect(() => {
    document.title = 'مجلة زهرة بيسان الملكية | أحدث مقالات الأناقة والعبايات الفاخرة';
    window.scrollTo(0, 0);

    // Dynamic Binding: Fetch actual store products and map their exact images & details to articles!
    axios.get('/api/products')
      .then(res => {
        const storeProducts = Array.isArray(res.data) ? res.data : [];
        if (storeProducts.length > 0) {
          const updatedArticles = DEFAULT_ARTICLES.map((article, idx) => {
            const prod = storeProducts.find(p => String(p.id) === String(article.productId)) || storeProducts[idx % storeProducts.length];
            let prodImg = prod.image || (Array.isArray(prod.images) ? prod.images[0] : null) || article.image_url;
            if (typeof prodImg === 'string' && prodImg.startsWith('[')) {
              try { prodImg = JSON.parse(prodImg)[0]; } catch(e){}
            }
            return {
              ...article,
              productId: prod.id,
              productName: prod.name || article.productName,
              productPrice: prod.price || article.productPrice,
              image_url: getBlogImg(prodImg || article.image_url)
            };
          });
          setPosts(updatedArticles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['الكل', 'إطلالات المناسبات والعرائس', 'تصاميم ملكية مطرزة', 'إطلالات يومية واستقبال', 'أسرار الأقمشة والعناية'];

  const filteredPosts = activeCategory === 'الكل'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const featuredPost = posts[0] || DEFAULT_ARTICLES[0];

  return (
    <div style={{ minHeight: '90vh', padding: '160px 20px 80px', direction: 'rtl', backgroundColor: 'var(--cream, #faf7f2)', fontFamily: "'DM Sans', 'Inter', 'Cairo', sans-serif" }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '30px', background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.3)', color: 'var(--gold-dim, #a6865d)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '14px' }}>
            <BookOpen size={16} />
            <span>عالم الموضة والوقار</span>
          </div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--espresso, #1a1a1a)', margin: '0 0 12px' }}>
            مجلة زهرة بيسان الفاخرة
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--espresso-dim, #665544)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.7 }}>
            اكتشفي أحدث صيحات الموضة الشرقية، أسرار تنسيق الإطلالات الملكية، ودليل العناية بعبايتكِ الفاخرة مع خبيرة الأناقة.
          </p>
        </div>

        {/* 🌟 Lead Featured Article Banner */}
        {featuredPost && (
          <div style={{
            background: 'linear-gradient(135deg, #1f1a14 0%, #3a2e21 50%, #1f1a14 100%)',
            color: '#faf8f5',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            border: '1px solid rgba(197, 168, 128, 0.35)',
            marginBottom: '60px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center'
          }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(197, 168, 128, 0.2)', border: '1px solid rgba(197, 168, 128, 0.4)', color: 'var(--gold, #c5a880)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 14px', borderRadius: '20px' }}>
                  👑 مقال الغلاف المميز
                </span>
                <span style={{ fontSize: '0.82rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="var(--gold)" /> {featuredPost.readTime || '4 دقائق قراءة'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.4, margin: 0 }}>
                {featuredPost.title}
              </h2>

              <p style={{ fontSize: '0.92rem', opacity: 0.85, lineHeight: 1.8, margin: 0 }}>
                {featuredPost.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid rgba(197, 168, 128, 0.2)' }}>
                <span style={{ fontSize: '0.82rem', opacity: 0.9, color: 'var(--gold)' }}>
                  ✍️ {featuredPost.author}
                </span>

                <Link
                  to={`/blog/${featuredPost.slug || featuredPost.id}`}
                  style={{
                    background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                    color: '#ffffff',
                    padding: '10px 22px',
                    borderRadius: '24px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)'
                  }}
                >
                  <span>قراءة المقال كاملاً</span>
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>

            <div style={{ height: '100%', minHeight: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={getBlogImg(featuredPost.image_url)}
                alt={featuredPost.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #1f1a14 0%, transparent 40%)' }} />
            </div>
          </div>
        )}

        {/* Filter Categories Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                border: activeCategory === cat ? 'none' : '1px solid rgba(197, 168, 128, 0.3)',
                background: activeCategory === cat ? 'linear-gradient(135deg, var(--gold, #c5a880), var(--gold-dim, #a6865d))' : 'var(--bg-card, #fff)',
                color: activeCategory === cat ? '#ffffff' : 'var(--espresso, #1a1a1a)',
                boxShadow: activeCategory === cat ? '0 4px 15px rgba(197, 168, 128, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {filteredPosts.map(post => (
            <div key={post.id || post.slug} style={{
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(197, 168, 128, 0.22)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              transition: 'transform 0.35s ease, box-shadow 0.35s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(197, 168, 128, 0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'; }}
            >
              <Link to={`/blog/${post.slug || post.id}`} style={{ display: 'block', height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={getBlogImg(post.image_url)} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <span style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(26,26,26,0.75)', color: 'var(--gold, #c5a880)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 12px', borderRadius: '20px',
                  fontSize: '0.72rem', fontWeight: 800,
                  border: '1px solid rgba(197,163,106,0.4)'
                }}>
                  {post.category || 'أناقة بيسان'}
                </span>
              </Link>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--espresso-dim, #7a7a7a)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="var(--gold)" /> {new Date(post.created_at || Date.now()).toLocaleDateString('ar-JO')}
                    </span>
                    <span>✍️ {post.author}</span>
                  </div>

                  <Link to={`/blog/${post.slug || post.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--espresso, #1a1a1a)', lineHeight: 1.4 }}>
                      {post.title}
                    </h3>
                  </Link>

                  <p style={{ color: 'var(--espresso-dim, #665544)', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 20px' }}>
                    {post.excerpt}
                  </p>
                </div>

                {/* 🛍️ Linked Store Product Widget */}
                {post.productName && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(197, 168, 128, 0.08)',
                    border: '1px solid rgba(197, 168, 128, 0.25)',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gold-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShoppingBag size={11} /> قطعة المقال المعتمدة:
                      </span>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--espresso)', display: 'block', marginTop: '2px' }}>
                        {post.productName}
                      </strong>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${post.productId || 1}`)}
                      style={{
                        background: 'var(--gold, #c5a880)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      تسوقي القطعة
                    </button>
                  </div>
                )}

                <Link
                  to={`/blog/${post.slug || post.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--gold-dim, #a6865d)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                >
                  <span>اقرئي المزيد</span>
                  <ArrowLeft size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
