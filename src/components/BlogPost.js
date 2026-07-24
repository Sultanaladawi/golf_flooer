import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowRight, Share2, Link as LinkIcon } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    axios.get(`/api/posts/${slug}`)
      .then(res => {
        setPost(res.data);
        document.title = `${res.data.title} | مجلة زهرة بيسان`;
      })
      .catch(err => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المقال');
    }
  };

  if (loading) {
    return <div style={{ minHeight: '80vh', padding: '150px 20px', textAlign: 'center', color: 'var(--gold)' }}>جاري تحميل المقال...</div>;
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '80vh', padding: '150px 20px', textAlign: 'center', direction: 'rtl' }}>
        <h2 style={{ color: 'var(--espresso)', marginBottom: '20px' }}>عذراً، المقال غير موجود</h2>
        <Link to="/blog" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold' }}>العودة للمجلة</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#fff', direction: 'rtl', paddingBottom: '80px' }}>
      {/* Hero Image Section */}
      <div style={{ width: '100%', height: '50vh', minHeight: '400px', position: 'relative', overflow: 'hidden' }}>
        <img 
          src={post.image_url || '/12.png'} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '40px 20px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
          <Link to="/blog" style={{ color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            <ArrowRight size={16} /> العودة للمجلة
          </Link>
          <h1 style={{ fontSize: '3rem', margin: '0 0 20px', fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {new Date(post.created_at).toLocaleDateString('ar-JO')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> بقلم {post.author}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '50px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
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

        {/* Post Content */}
        <div 
          className="blog-content"
          style={{ flexGrow: 1, lineHeight: 2, fontSize: '1.15rem', color: '#333' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <style>{`
        .blog-content h2 { color: var(--espresso); margin: 40px 0 20px; font-size: 1.8rem; }
        .blog-content h3 { color: var(--espresso); margin: 30px 0 15px; font-size: 1.4rem; }
        .blog-content p { margin-bottom: 20px; }
        .blog-content img { max-width: 100%; border-radius: 12px; margin: 30px 0; }
        .blog-content blockquote { border-right: 4px solid var(--gold); margin: 30px 0; padding: 20px 30px; background: var(--cream); font-style: italic; color: var(--espresso); font-size: 1.3rem; border-radius: 8px; }
        
        @media (max-width: 768px) {
          .blog-share-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
