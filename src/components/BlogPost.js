import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight, Link as LinkIcon, ShoppingBag, Sparkles } from 'lucide-react';
import { DEFAULT_ARTICLES } from './Blog';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    axios.get(`/api/posts/${slug}`)
      .then(res => {
        if (res.data) {
          setPost(res.data);
          document.title = `${res.data.title} | مجلة زهرة بيسان`;
        } else {
          findFallbackPost();
        }
      })
      .catch(() => {
        findFallbackPost();
      })
      .finally(() => setLoading(false));

    function findFallbackPost() {
      const found = DEFAULT_ARTICLES.find(
        p => p.slug === slug || String(p.id) === String(slug)
      );
      if (found) {
        setPost(found);
        document.title = `${found.title} | مجلة زهرة بيسان`;
      } else {
        setPost(DEFAULT_ARTICLES[0]);
      }
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المقال الملكي بنجاح ✦');
    }
  };

  if (loading) {
    return <div style={{ minHeight: '80vh', padding: '150px 20px', textAlign: 'center', color: 'var(--gold)' }}>جاري تحميل المقال الملكي...</div>;
  }

  if (!post) {
    return (
      <div style={{ minHeight: '80vh', padding: '150px 20px', textAlign: 'center', direction: 'rtl' }}>
        <h2 style={{ color: 'var(--espresso)', marginBottom: '20px' }}>عذراً، المقال غير موجود</h2>
        <Link to="/blog" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold' }}>العودة للمجلة</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', direction: 'rtl', paddingBottom: '80px', fontFamily: "'DM Sans', 'Inter', 'Cairo', sans-serif" }}>
      {/* Hero Image Section */}
      <div style={{ width: '100%', height: '52vh', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={post.image_url || '/15.jpg'} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.4) 60%, transparent 100%)' }} />
        
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px 20px', maxWidth: '980px', margin: '0 auto', color: '#fff' }}>
          <Link to="/blog" style={{ color: 'var(--gold, #c5a880)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: 800 }}>
            <ArrowRight size={16} /> العودة لمجلة بيسان
          </Link>

          <span style={{ display: 'block', background: 'rgba(197, 168, 128, 0.25)', border: '1px solid rgba(197, 168, 128, 0.4)', color: 'var(--gold, #c5a880)', fontSize: '0.78rem', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', width: 'fit-content', marginBottom: '12px' }}>
            {post.category || 'نصائح وأناقة'}
          </span>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.3, color: '#ffffff' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.88rem', opacity: 0.9, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="var(--gold)" /> {new Date(post.created_at || Date.now()).toLocaleDateString('ar-JO')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={15} color="var(--gold)" /> {post.author}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '50px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* Social Share Sidebar (Desktop) */}
        <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '15px', color: '#888' }} className="blog-share-sidebar">
          <button onClick={handleShare} style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}>
            <LinkIcon size={20} />
          </button>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = '#1877F2'} onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}>
            <i className="fab fa-facebook-f" style={{ fontSize: '18px' }}></i>
          </a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', transition: '0.3s' }} onMouseEnter={e => e.currentTarget.style.background = '#1DA1F2'} onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}>
            <i className="fab fa-twitter" style={{ fontSize: '18px' }}></i>
          </a>
        </div>

        {/* Post Content Body */}
        <div style={{ flexGrow: 1 }}>
          <div 
            className="blog-content"
            style={{ lineHeight: 2, fontSize: '1.1rem', color: '#333' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 🛍️ Linked Store Product Widget */}
          {post.productName && (
            <div style={{
              marginTop: '50px',
              padding: '25px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.12) 0%, rgba(197, 168, 128, 0.03) 100%)',
              border: '1.5px solid rgba(197, 168, 128, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gold-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> القطعة الموصى بها في هذا المقال
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--espresso, #1a1a1a)', margin: '6px 0 0' }}>
                  {post.productName}
                </h3>
              </div>
              <button
                onClick={() => navigate(`/product/${post.productId || 1}`)}
                style={{
                  background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '24px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)'
                }}
              >
                تسوقي القطعة الآن ✦
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .blog-content h2 { color: var(--espresso, #1a1a1a); margin: 35px 0 18px; font-size: 1.7rem; font-weight: 900; }
        .blog-content h3 { color: var(--espresso, #1a1a1a); margin: 28px 0 14px; font-size: 1.35rem; font-weight: 800; }
        .blog-content p { margin-bottom: 20px; line-height: 1.95; color: var(--espresso-dim, #4a4a4a); }
        .blog-content img { max-width: 100%; border-radius: 16px; margin: 30px 0; border: 1px solid rgba(197, 168, 128, 0.25); }
        .blog-content blockquote { border-right: 4px solid var(--gold, #c5a880); margin: 30px 0; padding: 20px 24px; background: rgba(197, 168, 128, 0.08); font-style: italic; color: var(--espresso, #1a1a1a); font-size: 1.15rem; border-radius: 12px; }
        
        @media (max-width: 768px) {
          .blog-share-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
