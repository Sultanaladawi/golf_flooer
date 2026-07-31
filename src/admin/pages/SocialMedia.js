import React, { useState, useEffect, useRef } from 'react';
import { useAdminLang } from '../AdminLangContext';
import {
  ExternalLink, Share2, Eye, Heart, TrendingUp, Users,
  Send, Globe, Rss, BarChart2,
  Link2, Image, X, CheckCircle2, Clock,
  AlertCircle, Trash2, RefreshCw, Plus, Copy, Save, Target, Sparkles, ShoppingBag
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
  const storeUrl = encodeURIComponent(window.location.origin);
  switch (platform) {
    case 'facebook':  return `https://www.facebook.com/sharer/sharer.php?u=${storeUrl}&quote=${encoded}`;
    case 'twitter':   return `https://twitter.com/intent/tweet?text=${encoded}&url=${storeUrl}`;
    case 'whatsapp':  return `https://wa.me/?text=${encoded}%20${storeUrl}`;
    default: return null;
  }
};

const socialPlatformLinks = [
  { id: 'instagram', name: 'Instagram', handle: '@zahratbeesanshop', url: 'https://www.instagram.com/zahratbeesanshop', color: '#E1306C', gradient: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', icon: <FaInstagram size={26} />, stats: { followers: '12.4K', posts: '340', engagement: '4.8%' }, desc: 'المنصة الرئيسية للعبايات والأزياء الفاخرة' },
  { id: 'facebook',  name: 'Facebook',  handle: 'زهرة بيسان', url: 'https://web.facebook.com/profile.php?id=61592655440235', color: '#1877f2', gradient: 'linear-gradient(135deg, #1877f2, #0d5dbf)', icon: <FaFacebook size={26} />, stats: { followers: '8.1K', posts: '210', engagement: '3.2%' }, desc: 'صفحتنا للتواصل مع العائلات والعملاء' },
  { id: 'tiktok',    name: 'TikTok',    handle: '@zahratbeesan', url: 'https://www.tiktok.com/@zahratbeesan', color: '#ff0050', gradient: 'linear-gradient(135deg, #010101, #1a1a2e)', icon: <FaTiktok size={26} />, stats: { followers: '5.7K', posts: '89', engagement: '6.1%' }, desc: 'فيديوهات قصيرة وعروض الأزياء الرائجة' },
  { id: 'whatsapp',  name: 'WhatsApp Business', handle: '+962 79 669 7413', url: 'https://wa.me/962796697413', color: '#25D366', gradient: 'linear-gradient(135deg, #25D366, #128C7E)', icon: <FaWhatsapp size={26} />, stats: { followers: '—', posts: '—', engagement: '—' }, desc: 'تواصل مباشر مع العملاء والطلبات' },
  { id: 'youtube',   name: 'YouTube',   handle: 'زهرة بيسان', url: 'https://www.youtube.com/@zahratbeesan', color: '#ff0000', gradient: 'linear-gradient(135deg, #ff0000, #cc0000)', icon: <FaYoutube size={26} />, stats: { followers: '1.2K', posts: '28', engagement: '5.4%' }, desc: 'فيديوهات العناية بالعبايات والمجموعات' },
  { id: 'twitter',   name: 'X (Twitter)', handle: '@zahratbeesan', url: 'https://twitter.com/zahratbeesan', color: '#1DA1F2', gradient: 'linear-gradient(135deg, #14171A, #2c3e50)', icon: <FaTwitter size={26} />, stats: { followers: '3.4K', posts: '520', engagement: '2.1%' }, desc: 'تحديثات سريعة وعروض حصرية' },
  { id: 'snapchat',  name: 'Snapchat',  handle: 'zahratbeesan', url: 'https://www.snapchat.com/add/zahratbeesan', color: '#FFFC00', gradient: 'linear-gradient(135deg, #FFFC00, #ffcc00)', icon: <FaSnapchatGhost size={26} />, stats: { followers: '2.1K', posts: '—', engagement: '—' }, desc: 'سناب ستوريز حصرية لأحدث العبايات' },
  { id: 'website',   name: 'الموقع', handle: 'zahratbeesan.com', url: window.location.origin, color: '#c5a880', gradient: 'linear-gradient(135deg, #c5a880, #8b6914)', icon: <Globe size={26} />, stats: { followers: '—', posts: '—', engagement: '—' }, desc: 'متجرنا الإلكتروني الرسمي' },
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

  // Active Main Tab: 'social' or 'ads'
  const [activeMainTab, setActiveMainTab] = useState('social');

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

  // Ads & Pixels state
  const [pixelData, setPixelData] = useState({
    meta_pixel_id: '',
    snap_pixel_id: '',
    tiktok_pixel_id: '',
    meta_token: '',
    snap_token: '',
    tiktok_token: ''
  });
  const [loadingPixels, setLoadingPixels] = useState(false);
  const [savingPixels, setSavingPixels] = useState(false);
  const [pixelSaveMessage, setPixelSaveMessage] = useState('');
  const [copiedCatalog, setCopiedCatalog] = useState(false);

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

  const fetchPixels = async () => {
    setLoadingPixels(true);
    try {
      const res = await fetch('/api/admin/social-pixels');
      const data = await res.json();
      if (data) {
        setPixelData({
          meta_pixel_id: data.meta_pixel_id || '',
          snap_pixel_id: data.snap_pixel_id || '',
          tiktok_pixel_id: data.tiktok_pixel_id || '',
          meta_token: data.meta_token || '',
          snap_token: data.snap_token || '',
          tiktok_token: data.tiktok_token || ''
        });
      }
    } catch (e) {
      console.error('Error loading pixels:', e);
    } finally {
      setLoadingPixels(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPixels();
  }, []);

  const handleSavePixels = async (e) => {
    e.preventDefault();
    setSavingPixels(true);
    setPixelSaveMessage('');
    try {
      const res = await fetch('/api/admin/social-pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pixelData)
      });
      const data = await res.json();
      if (data.success) {
        setPixelSaveMessage('✅ تم حفظ إعدادات البكسل والتتبع بنجاح!');
        setTimeout(() => setPixelSaveMessage(''), 4000);
      } else {
        setPixelSaveMessage('❌ ' + (data.error || 'حدث خطأ أثناء الحفظ'));
      }
    } catch (e) {
      setPixelSaveMessage('❌ خطأ في الاتصال بالخادم');
    } finally {
      setSavingPixels(false);
    }
  };

  const catalogUrl = `${window.location.origin}/api/catalog.json`;

  const copyCatalogUrl = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 3000);
  };

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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header & Tabs */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--admin-text, #1e293b)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 style={{ color: 'var(--admin-accent, #c5a880)' }} size={32} />
            إدارة السوشيال ميديا والإعلانات المدفوعة
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
            ادارة منشورات السوشيال ميديا، وتتبع الحملات الإعلانية ومزامنة الكتالوج المباشر مع فيس بوك وانستغرام وسناب شات وتيك توك.
          </p>
        </div>

        {/* Top Main Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveMainTab('social')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeMainTab === 'social' ? 'var(--admin-accent, #c5a880)' : 'transparent',
              color: activeMainTab === 'social' ? '#fff' : '#64748b',
              boxShadow: activeMainTab === 'social' ? '0 4px 12px rgba(197, 168, 128, 0.3)' : 'none'
            }}
          >
            <Globe size={18} />
            منصات التواصل والنشر
          </button>

          <button
            onClick={() => setActiveMainTab('ads')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeMainTab === 'ads' ? 'var(--admin-accent, #c5a880)' : 'transparent',
              color: activeMainTab === 'ads' ? '#fff' : '#64748b',
              boxShadow: activeMainTab === 'ads' ? '0 4px 12px rgba(197, 168, 128, 0.3)' : 'none'
            }}
          >
            <Target size={18} />
            🎯 الإعلانات والبكسل (Ads & Pixels)
          </button>
        </div>
      </div>

      {/* TAB 1: SOCIAL MEDIA & POST PUBLISHER */}
      {activeMainTab === 'social' && (
        <>
          {/* Quick Platform Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {socialPlatformLinks.map(platform => (
              <div
                key={platform.id}
                onMouseEnter={() => setHoveredCard(platform.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'var(--admin-card-bg, #ffffff)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: hoveredCard === platform.id ? '0 12px 24px -8px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: platform.gradient,
                      color: platform.id === 'snapchat' ? '#000' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--admin-text, #1e293b)' }}>{platform.name}</h3>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', dir: 'ltr', display: 'block' }}>{platform.handle}</span>
                    </div>
                  </div>

                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.04)',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    title="زيارة الحساب"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                  {platform.desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>المتابعون</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--admin-text, #1e293b)' }}>{platform.stats.followers}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>التفاعل</span>
                      <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>{platform.stats.engagement}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(platform.url, platform.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: copied === platform.id ? '#10b981' : 'rgba(0,0,0,0.05)',
                      color: copied === platform.id ? '#fff' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copied === platform.id ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
                    {copied === platform.id ? 'تم النسخ' : 'نسخ الرابط'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Publisher & Ideas Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>

            {/* Post Publisher Card */}
            <div style={{
              background: 'var(--admin-card-bg, #ffffff)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} style={{ color: 'var(--admin-accent, #c5a880)' }} />
                إنشاء ونشر منشور جديد
              </h2>

              {/* Platform Selector */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#475569' }}>اختر المنصات للتحضير أو النشر:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--admin-accent, #c5a880)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>الكل</button>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <button onClick={selectNone} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}>إلغاء</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PLATFORMS.map(p => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${p.color}` : '1px solid #e2e8f0',
                          background: isSelected ? `${p.color}15` : '#fff',
                          color: isSelected ? p.color : '#64748b',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {p.icon}
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Input */}
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="اكتبي نص المنشور هنا..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Image Attachment */}
              <div style={{ marginBottom: '20px' }}>
                {imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={imageUrl} alt="preview" style={{ height: '120px', objectFit: 'cover', display: 'block' }} />
                    <button
                      onClick={() => setImageUrl('')}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input type="file" ref={fileRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px dashed #cbd5e1',
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        justifyContent: 'center'
                      }}
                    >
                      <Image size={18} />
                      {uploading ? 'جاري رفع الصورة...' : 'إضافة صورة للمنشور'}
                    </button>
                  </div>
                )}
              </div>

              {/* Publish Action Button */}
              <button
                onClick={handlePublish}
                disabled={publishing}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--admin-accent, #c5a880)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(197, 168, 128, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {publishing ? <RefreshCw className="spin" size={18} /> : <Send size={18} />}
                {publishing ? 'جاري التحضير بالنشر...' : 'نشر الآن / مشاركة المنشور'}
              </button>

              {publishResult && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: publishResult.success ? '#ecfdf5' : '#fef2f2',
                  color: publishResult.success ? '#065f46' : '#991b1b',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {publishResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{publishResult.message || publishResult.error}</span>
                </div>
              )}
            </div>

            {/* Content Ideas & Tips */}
            <div style={{
              background: 'var(--admin-card-bg, #ffffff)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#f59e0b' }} />
                أفكار منشورات مقترحة
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {postIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    onClick={() => setContent(idea)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      fontSize: '0.9rem',
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{idea}</span>
                    <Plus size={16} style={{ color: '#94a3b8' }} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* TAB 2: ADS & PIXELS CONFIGURATION */}
      {activeMainTab === 'ads' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

          {/* Social Pixels Setup Card */}
          <div style={{
            background: 'var(--admin-card-bg, #ffffff)',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target style={{ color: 'var(--admin-accent, #c5a880)' }} size={24} />
              ربط أكواد البكسل (Pixel IDs) للتتبع
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
              أدخلي معرفات الـ Pixels الخاصة بحساباتك الإعلانية. سيتم تتبع الزوار والمبيعات والإضافات للسلة تلقائياً عبر <strong>Meta (Facebook & Instagram)</strong> و <strong>Snapchat</strong> و <strong>TikTok</strong>.
            </p>

            <form onSubmit={handleSavePixels}>
              
              {/* Meta Pixel (Facebook & Instagram) */}
              <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', color: '#1877f2', marginBottom: '8px' }}>
                  <FaFacebook size={18} /> <FaInstagram size={18} style={{ color: '#E1306C' }} />
                  Meta Pixel ID (Facebook & Instagram)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 123456789012345"
                  value={pixelData.meta_pixel_id}
                  onChange={e => setPixelData({ ...pixelData, meta_pixel_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  يُستخدم لتتبع الحملات على فيسبوك وانستغرام معاً
                </span>
              </div>

              {/* Snapchat Pixel */}
              <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', color: '#d97706', marginBottom: '8px' }}>
                  <FaSnapchatGhost size={18} />
                  Snapchat Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="مثال: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={pixelData.snap_pixel_id}
                  onChange={e => setPixelData({ ...pixelData, snap_pixel_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* TikTok Pixel */}
              <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', color: '#000000', marginBottom: '8px' }}>
                  <FaTiktok size={18} />
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="مثال: CXXXXXXXXXXXXXXX"
                  value={pixelData.tiktok_pixel_id}
                  onChange={e => setPixelData({ ...pixelData, tiktok_pixel_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingPixels}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--admin-accent, #c5a880)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(197, 168, 128, 0.4)'
                }}
              >
                {savingPixels ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                {savingPixels ? 'جاري حفظ الإعدادات...' : 'حفظ إعدادات البكسل'}
              </button>

              {pixelSaveMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: pixelSaveMessage.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                  color: pixelSaveMessage.startsWith('✅') ? '#065f46' : '#991b1b',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {pixelSaveMessage}
                </div>
              )}

            </form>
          </div>

          {/* Social Product Catalog Feed Card */}
          <div style={{
            background: 'var(--admin-card-bg, #ffffff)',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag style={{ color: '#10b981' }} size={24} />
              رابط مزامنة الكتالوج التلقائي (Catalog Feed)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              انسخي هذا الرابط وأضيفيه في حساباتك الإعلانية <strong>(Meta Commerce Manager / Snapchat Catalog / TikTok Seller)</strong> ليتم تحديث عباياتك وأسعارك وصورها تلقائياً بالكامل في الإعلانات الديناميكية!
            </p>

            {/* Catalog Link Box */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>رابط الكتالوج المباشر (Dynamic Catalog Feed):</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={catalogUrl}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                    background: '#fff',
                    color: '#334155'
                  }}
                />
                <button
                  onClick={copyCatalogUrl}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: copiedCatalog ? '#10b981' : 'var(--admin-accent, #c5a880)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedCatalog ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copiedCatalog ? 'تم النسخ' : 'نسخ الرابط'}
                </button>
              </div>
            </div>

            {/* Platform Quick Links & Instructions */}
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>روابط مباشرة لإعداد الكتالوج في المنصات:</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <a
                href="https://business.facebook.com/commerce"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFacebook size={18} /> Meta Commerce Manager (FB & Insta Catalog)
                </div>
                <ExternalLink size={16} />
              </a>

              <a
                href="https://business.snapchat.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  color: '#a16207',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaSnapchatGhost size={18} /> Snapchat Business Catalog Manager
                </div>
                <ExternalLink size={16} />
              </a>

              <a
                href="https://business.tiktok.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTiktok size={18} /> TikTok Business Catalog Manager
                </div>
                <ExternalLink size={16} />
              </a>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
