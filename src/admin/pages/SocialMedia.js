import React, { useState, useEffect, useRef } from 'react';
import { useAdminLang } from '../AdminLangContext';
import {
  ExternalLink, Share2, Eye, Heart, TrendingUp, Users,
  Send, Globe, Rss, BarChart2,
  Link2, Image, X, CheckCircle2, Clock,
  AlertCircle, Trash2, RefreshCw, Plus
} from 'lucide-react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaTwitter, FaTiktok, FaYoutube, FaSnapchatGhost } from 'react-icons/fa';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: <FaInstagram size={16} />, color: '#E1306C', gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', needsImage: true },
  { id: 'facebook',  name: 'Facebook',  icon: <FaFacebook size={16} />, color: '#1877f2', gradient: 'linear-gradient(135deg, #1877f2, #0d5dbf)', needsImage: false },
  { id: 'whatsapp',  name: 'WhatsApp',  icon: <FaWhatsapp size={16} />, color: '#25D366', gradient: 'linear-gradient(135deg, #25D366, #128C7E)', needsImage: false },
  { id: 'twitter',   name: 'Twitter/X', icon: <FaTwitter size={16} />, color: '#1DA1F2', gradient: 'linear-gradient(135deg, #14171A, #2c3e50)', needsImage: false },
  { id: 'tiktok',    name: 'TikTok',    icon: <FaTiktok size={16} />, color: '#ff0050', gradient: 'linear-gradient(135deg, #010101, #ff0050)', needsImage: true },
  { id: 'youtube',   name: 'YouTube',   icon: <FaYoutube size={16} />, color: '#ff0000', gradient: 'linear-gradient(135deg, #ff0000, #cc0000)', needsImage: true },
  { id: 'snapchat',  name: 'Snapchat',  icon: <FaSnapchatGhost size={16} />, color: '#FFFC00', gradient: 'linear-gradient(135deg, #FFFC00, #ffcc00)', needsImage: false },
];

const platformShareUrl = (platform, content) => {
  const encoded = encodeURIComponent(content);
  const storeUrl = encodeURIComponent('http://localhost:3000');
  switch (platform) {
    case 'facebook':  return `https://www.facebook.com/sharer/sharer.php?u=${storeUrl}&quote=${encoded}`;
    case 'twitter':   return `https://twitter.com/intent/tweet?text=${encoded}&url=${storeUrl}`;
    case 'whatsapp':  return `https://wa.me/?text=${encoded}%20${storeUrl}`;
    default: return null;
  }
};

const socialPlatformLinks = [
  { id: 'instagram', name: 'Instagram', handle: '@zahratbeesan', url: 'https://www.instagram.com/zahratbeesan', color: '#E1306C', gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', icon: <FaInstagram size={26} />, stats: { followers: '12.4K', posts: '340', engagement: '4.8%' }, desc: 'المنصة الرئيسية للعبايات والأزياء الفاخرة' },
  { id: 'facebook',  name: 'Facebook',  handle: 'زهرة بيسان', url: 'https://www.facebook.com/zahratbeesan', color: '#1877f2', gradient: 'linear-gradient(135deg, #1877f2, #0d5dbf)', icon: <FaFacebook size={26} />, stats: { followers: '8.1K', posts: '210', engagement: '3.2%' }, desc: 'صفحتنا للتواصل مع العائلات والعملاء' },
  { id: 'tiktok',    name: 'TikTok',    handle: '@zahratbeesan', url: 'https://www.tiktok.com/@zahratbeesan', color: '#ff0050', gradient: 'linear-gradient(135deg, #010101, #1a1a2e)', icon: <FaTiktok size={26} />, stats: { followers: '5.7K', posts: '89', engagement: '6.1%' }, desc: 'فيديوهات قصيرة وعروض الأزياء الرائجة' },
  { id: 'whatsapp',  name: 'WhatsApp Business', handle: '+962 79 669 7413', url: 'https://wa.me/962796697413', color: '#25D366', gradient: 'linear-gradient(135deg, #25D366, #128C7E)', icon: <FaWhatsapp size={26} />, stats: { followers: '—', posts: '—', engagement: '—' }, desc: 'تواصل مباشر مع العملاء والطلبات' },
  { id: 'youtube',   name: 'YouTube',   handle: 'زهرة بيسان', url: 'https://www.youtube.com/@zahratbeesan', color: '#ff0000', gradient: 'linear-gradient(135deg, #ff0000, #cc0000)', icon: <FaYoutube size={26} />, stats: { followers: '1.2K', posts: '28', engagement: '5.4%' }, desc: 'فيديوهات العناية بالعبايات والمجموعات' },
  { id: 'twitter',   name: 'X (Twitter)', handle: '@zahratbeesan', url: 'https://twitter.com/zahratbeesan', color: '#1DA1F2', gradient: 'linear-gradient(135deg, #14171A, #2c3e50)', icon: <FaTwitter size={26} />, stats: { followers: '3.4K', posts: '520', engagement: '2.1%' }, desc: 'تحديثات سريعة وعروض حصرية' },
  { id: 'snapchat',  name: 'Snapchat',  handle: 'zahratbeesan', url: 'https://www.snapchat.com/add/zahratbeesan', color: '#FFFC00', gradient: 'linear-gradient(135deg, #FFFC00, #ffcc00)', icon: <FaSnapchatGhost size={26} />, stats: { followers: '2.1K', posts: '—', engagement: '—' }, desc: 'سناب ستوريز حصرية لأحدث العبايات' },
  { id: 'website',   name: 'الموقع', handle: 'zahratbeesan.com', url: 'http://localhost:3000', color: '#c5a880', gradient: 'linear-gradient(135deg, #c5a880, #8b6914)', icon: <Globe size={26} />, stats: { followers: '—', posts: '—', engagement: '—' }, desc: 'متجرنا الإلكتروني الرسمي' },
];

const postIdeas = [
  '👗 عرض عباية جديدة مع التفاصيل والأسعار',
  '🎉 إعلان عروض نهاية الأسبوع',
  '📦 وصل حديثاً — تشكيلة جديدة',
  '⭐ نشر تقييم عميلة راضية',
  '🎬 فيديو كيفية العناية بالعباية',
  '🌟 إعلان موسم عبايات المناسبات',
  '💫 بث مباشر لعرض المجموعة الجديدة',
  '🤝 تعاون مع مؤثرة للموضة',
];

export default function SocialMedia() {
  const { t } = useAdminLang();

  // Composer state
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'facebook']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Posts history
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Platform cards hover
  const [hoveredCard, setHoveredCard] = useState(null);
  const [copied, setCopied] = useState(null);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/social/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedPlatforms(PLATFORMS.map(p => p.id));
  const selectNone = () => setSelectedPlatforms([]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        const fullUrl = `${window.location.origin}${data.url}`;
        setImageUrl(fullUrl);
      }
    } catch (e) {
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return alert('يرجى كتابة محتوى المنشور');
    if (!selectedPlatforms.length) return alert('يرجى اختيار منصة واحدة على الأقل');

    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch('/api/social/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Name': JSON.parse(sessionStorage.getItem('admin_session') || '{}')?.name || 'Admin'
        },
        body: JSON.stringify({
          content,
          image_url: imageUrl || null,
          platforms: selectedPlatforms,
          scheduled_at: scheduleDate || null
        })
      });
      const data = await res.json();
      setPublishResult(data);
      if (data.success) {
        fetchPosts();
        setContent('');
        setImageUrl('');
        setScheduleDate('');

        // Open manual platforms in new tabs
        selectedPlatforms.forEach(pid => {
          const result = data.results?.[pid];
          if (result?.manual) {
            const url = platformShareUrl(pid, content);
            if (url) window.open(url, '_blank');
          }
        });
      }
    } catch (e) {
      setPublishResult({ success: false, error: e.message });
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا المنشور من السجل؟')) return;
    try {
      await fetch(`/api/social/posts/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (e) {}
  };

  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const charLimit = 280;
  const charColor = content.length > charLimit * 0.9 ? '#f87171' : content.length > charLimit * 0.7 ? '#fbbf24' : 'var(--text-secondary)';

  return (
    <div className="dashboard-fade-in" style={{ padding: '40px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(220,39,67,0.3)' }}>
          <Share2 size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: 'var(--admin-accent)', margin: 0, lineHeight: 1 }}>القسم الإعلامي</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '1rem', margin: 0 }}>نشر المحتوى وإدارة وسائل التواصل الاجتماعي</p>
        </div>
      </div>

      {/* ── POST COMPOSER ── */}
      <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--admin-text)', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={22} color="var(--admin-accent)" /> إنشاء منشور جديد
        </h2>

        {/* Platform Selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label style={{ fontWeight: '600', color: 'var(--admin-text)', fontSize: '0.9rem' }}>اختر المنصات</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={selectAll} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(197,168,128,0.1)', color: 'var(--admin-accent)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                تحديد الكل
              </button>
              <button onClick={selectNone} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>
                مسح الكل
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {PLATFORMS.map(p => {
              const sel = selectedPlatforms.includes(p.id);
              return (
                <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 16px', borderRadius: '50px',
                  border: sel ? `2px solid ${p.color}` : '1px solid var(--admin-border)',
                  background: sel ? `${p.color}18` : 'transparent',
                  color: sel ? p.color : 'var(--text-secondary)',
                  fontWeight: sel ? '700' : '500', fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: sel ? `0 4px 12px ${p.color}30` : 'none'
                }}>
                  {p.icon} {p.name}
                  {sel && <CheckCircle2 size={13} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '600', color: 'var(--admin-text)', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>صورة المنشور (اختياري)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px',
              background: 'rgba(197,168,128,0.1)', border: '1px dashed var(--admin-accent)',
              color: 'var(--admin-accent)', fontWeight: '700', fontSize: '0.85rem',
              cursor: 'pointer', transition: '0.2s', flexShrink: 0
            }}>
              <Image size={16} /> {uploading ? 'جاري الرفع...' : 'رفع صورة'}
            </button>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="أو الصق رابط الصورة هنا (https://...)"
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--bg-surface)', color: 'var(--admin-text)', fontSize: '0.87rem', outline: 'none' }}
            />
            {imageUrl && <button onClick={() => setImageUrl('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><X size={18} /></button>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>
          {imageUrl && (
            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', maxWidth: '200px', border: '1px solid var(--admin-border)' }}>
              <img src={imageUrl} alt="preview" style={{ width: '100%', height: '130px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>

        {/* Content Textarea */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '600', color: 'var(--admin-text)', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>محتوى المنشور</label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتبي نص المنشور هنا... يمكنك استخدام الإيموجي والهاشتاق #زهرة_بيسان"
              rows={5}
              style={{
                width: '100%', padding: '16px', borderRadius: '14px',
                border: '1px solid var(--admin-border)',
                background: 'var(--bg-surface)', color: 'var(--admin-text)',
                fontSize: '1rem', lineHeight: '1.6', resize: 'vertical',
                outline: 'none', direction: 'rtl', boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif"
              }}
            />
            <div style={{ position: 'absolute', bottom: '10px', insetInlineStart: '12px', fontSize: '0.75rem', color: charColor }}>
              {content.length} / {charLimit}
            </div>
          </div>
          {/* Quick ideas */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            {postIdeas.slice(0, 4).map((idea, i) => (
              <button key={i} onClick={() => setContent(prev => prev ? prev + '\n' + idea : idea)} style={{
                padding: '5px 10px', borderRadius: '8px', fontSize: '0.72rem',
                border: '1px solid var(--admin-border)', background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: '0.2s'
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--admin-accent)'; e.target.style.color = 'var(--admin-accent)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--admin-border)'; e.target.style.color = 'var(--text-secondary)'; }}
              >{idea.split(' ').slice(0, 4).join(' ')}...</button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: '600', color: 'var(--admin-text)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} /> جدولة النشر (اختياري — اتركه فارغاً للنشر الفوري)
          </label>
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={e => setScheduleDate(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--bg-surface)', color: 'var(--admin-text)', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        {/* Publish Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePublish}
            disabled={publishing || !content.trim() || !selectedPlatforms.length}
            style={{
              padding: '14px 32px', borderRadius: '14px',
              background: publishing ? '#555' : 'linear-gradient(135deg, var(--admin-accent), #c5a880)',
              color: '#000', fontWeight: '800', fontSize: '1rem',
              border: 'none', cursor: publishing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 20px rgba(197,168,128,0.3)', transition: '0.2s'
            }}
          >
            {publishing ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> جاري النشر...</> : scheduleDate ? <><Clock size={18} /> جدولة المنشور</> : <><Send size={18} /> نشر الآن</>}
          </button>

          {selectedPlatforms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>على:</span>
              {selectedPlatforms.map(pid => {
                const pl = PLATFORMS.find(p => p.id === pid);
                return pl ? (
                  <span key={pid} style={{ padding: '3px 10px', borderRadius: '20px', background: `${pl.color}20`, color: pl.color, fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {pl.icon} {pl.name}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Result */}
        {publishResult && (
          <div style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '14px', background: publishResult.success ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${publishResult.success ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              {publishResult.success ? <CheckCircle2 size={18} color="#4ade80" /> : <AlertCircle size={18} color="#f87171" />}
              <strong style={{ color: publishResult.success ? '#4ade80' : '#f87171', fontSize: '0.95rem' }}>
                {publishResult.success ? 'تم حفظ المنشور وإرساله للمنصات' : `خطأ: ${publishResult.error}`}
              </strong>
            </div>
            {publishResult.results && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(publishResult.results).map(([pid, r]) => {
                  const pl = PLATFORMS.find(p => p.id === pid);
                  return (
                    <div key={pid} style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                      <span style={{ color: pl?.color }}>{pl?.icon}</span>
                      <span style={{ color: r.success ? '#4ade80' : r.manual ? '#fbbf24' : '#f87171' }}>
                        {r.success ? '✓ نُشر' : r.manual ? '↗ يدوي' : `✗ ${r.error?.substring(0, 30)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {publishResult.success && Object.values(publishResult.results || {}).some(r => r.manual) && (
              <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '8px', marginBottom: 0 }}>
                ⚡ المنصات المُعلَّمة بـ "يدوي" فُتحت في نوافذ جديدة — أكملي النشر هناك. للنشر التلقائي أضيفي توكنات API في الإعدادات.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── VISUAL BRANDING KIT ── */}
      <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--admin-text)', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image size={22} color="var(--admin-accent)" /> حقيبة الهوية البصرية الرسمية (Social Media Kit)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '-15px', marginBottom: '24px' }}>
          استخدمي هذه القوالب والشعارات الرسمية الموحدة للمحافظة على هوية بصرية فاخرة ومتناسقة عبر جميع حسابات التواصل الاجتماعي لـ (زهرة بيسان).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Profile Photo */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--admin-accent)', background: '#fff', marginBottom: '15px', boxShadow: '0 8px 24px rgba(166,134,93,0.15)' }}>
              <img src="/logo.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: '700', color: 'var(--admin-text)', fontSize: '0.95rem', marginBottom: '4px' }}>صورة الملف الشخصي (Profile)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>شعار زهرة بيسان الفاخر الدائري المعتمد (1:1)</span>
            <a href="/logo.png" download="Zahrat_Beesan_Profile.png" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--admin-accent)', color: '#000', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              تحميل الشعار الرسمي
            </a>
          </div>

          {/* Cover Banner */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', marginBottom: '15px' }}>
              <img src="/cover_banner_exact.jpg" alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: '700', color: 'var(--admin-text)', fontSize: '0.95rem', marginBottom: '4px' }}>غلاف الحسابات (Cover Banner)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>غلاف عريض رسمي متناسق لجميع الصفحات (16:9)</span>
            <a href="/cover_banner_exact.jpg" download="Zahrat_Beesan_Cover.jpg" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-accent)', color: 'var(--admin-accent)', background: 'transparent', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              تحميل غلاف الحسابات
            </a>
          </div>

          {/* Post Template */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', marginBottom: '15px' }}>
              <img src="/instagram_post_exact.jpg" alt="Post Template" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontWeight: '700', color: 'var(--admin-text)', fontSize: '0.95rem', marginBottom: '4px' }}>قالب منشورات المنتجات (Grid Post)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>قالب عرض العبايات والمنتجات الرسمي (1:1)</span>
            <a href="/instagram_post_exact.jpg" download="Zahrat_Beesan_Post_Template.jpg" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-accent)', color: 'var(--admin-accent)', background: 'transparent', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              تحميل قالب المنشور
            </a>
          </div>
        </div>
      </div>

      {/* ── POSTS HISTORY ── */}
      <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '32px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={22} color="var(--admin-accent)" /> سجل المنشورات
          </h2>
          <button onClick={fetchPosts} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> تحديث
          </button>
        </div>

        {loadingPosts ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>جاري التحميل...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)', borderRadius: '16px', border: '1px dashed var(--admin-border)' }}>
            <Send size={40} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p>لا توجد منشورات بعد. أنشئ أول منشور!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {posts.map(post => {
              let platforms = [];
              let results = {};
              try { platforms = typeof post.platforms === 'string' ? JSON.parse(post.platforms) : (post.platforms || []); } catch (e) {}
              try { results = typeof post.results === 'string' ? JSON.parse(post.results) : (post.results || {}); } catch (e) {}
              return (
                <div key={post.id} style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--admin-border)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {post.image_url && (
                    <img src={post.image_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--admin-text)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {platforms.map(pid => {
                        const pl = PLATFORMS.find(p => p.id === pid);
                        const r = results[pid];
                        return pl ? (
                          <span key={pid} style={{ padding: '3px 10px', borderRadius: '20px', background: `${pl.color}15`, color: pl.color, fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {pl.icon} {pl.name}
                            {r?.success ? ' ✓' : r?.manual ? ' ↗' : ''}
                          </span>
                        ) : null;
                      })}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginInlineEnd: 'auto' }}>
                        {post.admin_name} · {new Date(post.published_at || post.created_at).toLocaleString('ar-JO')}
                      </span>
                      <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: post.status === 'published' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', color: post.status === 'published' ? '#4ade80' : '#fbbf24' }}>
                        {post.status === 'published' ? 'منشور' : 'مجدول'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px', flexShrink: 0, opacity: 0.6 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                  ><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PLATFORMS OVERVIEW ── */}
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: 'var(--admin-text)', marginBottom: '20px' }}>
        المنصات الاجتماعية
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' }}>
        {socialPlatformLinks.map(platform => (
          <div key={platform.id}
            style={{
              borderRadius: '20px', padding: '22px',
              background: hoveredCard === platform.id ? platform.gradient : 'var(--admin-card)',
              border: '1px solid var(--admin-border)', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
              transform: hoveredCard === platform.id ? 'translateY(-5px)' : 'none',
              boxShadow: hoveredCard === platform.id ? '0 18px 40px rgba(0,0,0,0.25)' : 'none',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={() => setHoveredCard(platform.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {hoveredCard === platform.id && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', borderRadius: '20px', zIndex: 0 }} />}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: hoveredCard === platform.id ? 'rgba(255,255,255,0.15)' : `${platform.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: hoveredCard === platform.id ? '#fff' : platform.color, transition: '0.3s' }}>
                  {platform.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: hoveredCard === platform.id ? '#fff' : 'var(--admin-text)' }}>{platform.name}</div>
                  <div style={{ fontSize: '0.78rem', color: hoveredCard === platform.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>{platform.handle}</div>
                </div>
              </div>
              {platform.stats.followers !== '—' && (
                <div style={{ display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: hoveredCard === platform.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: hoveredCard === platform.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--admin-border)', marginBottom: '14px' }}>
                  {[['متابع', platform.stats.followers], ['منشور', platform.stats.posts], ['تفاعل', platform.stats.engagement]].map(([l, v]) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: hoveredCard === platform.id ? '#fff' : 'var(--admin-text)' }}>{v}</div>
                      <div style={{ fontSize: '0.65rem', color: hoveredCard === platform.id ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', marginTop: '2px' }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={platform.url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px 12px', borderRadius: '9px', background: hoveredCard === platform.id ? 'rgba(255,255,255,0.2)' : 'var(--admin-accent)', color: hoveredCard === platform.id ? '#fff' : '#000', fontWeight: '700', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', backdropFilter: 'blur(4px)' }}>
                  <ExternalLink size={13} /> فتح المنصة
                </a>
                <button onClick={() => copyLink(platform.url, platform.id)} style={{ padding: '8px 10px', borderRadius: '9px', background: hoveredCard === platform.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color: hoveredCard === platform.id ? '#fff' : 'var(--admin-text)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <Link2 size={13} /> {copied === platform.id ? '✓' : 'نسخ'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


