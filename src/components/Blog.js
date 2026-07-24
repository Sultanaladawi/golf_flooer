import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'مجلة زهرة بيسان | أحدث المقالات عن الأناقة والعباءات';
    
    axios.get('/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '80vh', padding: '120px 20px 60px', direction: 'rtl', backgroundColor: 'var(--cream, #faf7f2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--espresso, #5c3d1e)', margin: '0 0 15px', fontFamily: "'DM Serif Display', serif" }}>
            مجلة زهرة بيسان
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            اكتشفي أحدث صيحات الموضة، نصائح العناية بالعباءات، وأسرار الأناقة في عالم زهرة بيسان.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gold)' }}>جاري تحميل المقالات...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#888', background: '#fff', borderRadius: '16px' }}>
            لم يتم نشر أي مقالات بعد، ترقبوا كل جديد قريباً!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {posts.map(post => (
              <div key={post.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <Link to={`/blog/${post.slug}`} style={{ display: 'block', height: '220px', overflow: 'hidden' }}>
                  <img 
                    src={post.image_url || '/12.png'} 
                    alt={post.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </Link>
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '0.85rem', color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('ar-JO')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {post.author}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: '0 0 15px', color: 'var(--espresso)', lineHeight: 1.4 }}>{post.title}</h2>
                  </Link>
                  <p style={{ color: '#666', lineHeight: 1.6, margin: '0 0 20px', flexGrow: 1 }}>{post.excerpt}</p>
                  
                  <Link to={`/blog/${post.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontWeight: 'bold', textDecoration: 'none', alignSelf: 'flex-start' }}>
                    اقرأ المزيد <ArrowLeft size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
