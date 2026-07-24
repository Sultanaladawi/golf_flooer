import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAdminLang } from '../AdminLangContext';
import { PenTool, Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function BlogManagement() {
  const { t, isRTL } = useAdminLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', title: '', slug: '', content: '', excerpt: '', image_url: '', status: 'published' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/posts');
      setPosts(res.data);
    } catch (err) {
      alert("Error fetching posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (mode, post = null) => {
    setModalMode(mode);
    if (post) {
      setFormData(post);
    } else {
      setFormData({ id: '', title: '', slug: '', content: '', excerpt: '', image_url: '', status: 'published' });
    }
    setShowModal(true);
  };

  const handleSlugify = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: modalMode === 'add' ? handleSlugify(title) : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await axios.post('/api/admin/posts', formData);
      } else {
        await axios.put(`/api/admin/posts/${formData.id}`, formData);
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      alert("Error saving post: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    try {
      await axios.delete(`/api/admin/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PenTool size={28} style={{ color: 'var(--gold)' }} /> مجلة زهرة بيسان (المدونة)
            </h1>
            <p style={{ color: 'var(--espresso-dim)', margin: '5px 0 0' }}>إدارة المقالات والمحتوى الخاص بالمتجر</p>
          </div>
          <button onClick={() => handleOpenModal('add')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <Plus size={18} /> كتابة مقال جديد
          </button>
        </div>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(197,168,128,0.1)', color: 'var(--espresso)', textAlign: isRTL ? 'right' : 'left' }}>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>العنوان</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الرابط</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الحالة</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>تاريخ النشر</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--espresso)' }}>{post.title}</td>
                    <td style={{ padding: '15px', color: '#888', fontSize: '0.9rem', direction: 'ltr' }}>/blog/{post.slug}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', background: post.status === 'published' ? '#dcfce7' : '#f3f4f6', color: post.status === 'published' ? '#166534' : '#4b5563' }}>
                        {post.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--espresso-dim)' }}>{new Date(post.created_at).toLocaleDateString('ar-JO')}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal('edit', post)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>لم يتم إضافة أي مقالات بعد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--espresso)', fontSize: '1.4rem', display: 'flex', justifyContent: 'space-between' }}>
              {modalMode === 'add' ? 'مقال جديد' : 'تعديل المقال'}
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>العنوان</label>
                  <input type="text" required value={formData.title} onChange={handleTitleChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>رابط المقال (Slug)</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} dir="ltr" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>مقتطف قصير (يظهر في القائمة)</label>
                <textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '60px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>رابط الصورة البارزة</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ImageIcon size={20} style={{ color: 'var(--gold)' }} />
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="/images/blog-1.jpg" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} dir="ltr" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>محتوى المقال (يدعم HTML)</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '250px', fontFamily: 'monospace' }} dir="ltr" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>حالة النشر</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="published">منشور للعامة (Published)</option>
                  <option value="draft">مسودة خفية (Draft)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ المقال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
