import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Palette, 
  Image as ImageIcon, 
  Save, 
  CheckCircle2, 
  Upload, 
  Trash2, 
  GripVertical, 
  AlertCircle,
  Film,
  Play,
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const VIDEO_LIBRARY = [
  { id: 'sultana', label: '👑 ثوب السلطانة الملكي (الموصى به)', url: '/images/1786522915955-411348681_1782578082455351.mp4' },
  { id: 'classic_8', label: '💎 عباية ملكية مطرزة (8.mp4)', url: '/8.mp4' },
  { id: 'bisht_13', label: '✨ عباية بشت فاخرة (13.mp4)', url: '/13 (1).mp4' },
  { id: 'princess_12', label: '👑 قفطان الأميرة (12.mp4)', url: '/12 (1).mp4' },
  { id: 'cinematic', label: '🎬 فيديو العرض الملكي السينمائي', url: '/images/video_media_01KJYR0Y7G2RRS94QBZ9F8VQWX.mp4' },
  { id: 'lookbook', label: '🌸 فيديو الكولكشن الشتوي واللوك بوك', url: '/lookbook_video.mp4' },
  { id: 'pearl', label: '🦪 عباية اللؤلؤة العصرية', url: '/images/1786522896633-611452679_1782578169551163.mp4' },
  { id: 'yaqoot', label: '💎 قفطان الياقوتة', url: '/images/1786522946050-654584038_1782479307288404.mp4' },
  { id: 'yashmak', label: '🌿 ثوب اليشمك', url: '/images/1786522960020-777745094_1782322293821021.mp4' },
  { id: 'black_elegance', label: '🖤 ثوب الأناقة السوداء', url: '/images/1786522971697-712486662_1786298365098014.mp4' },
  { id: 'andalus', label: '🌿 عباية الأندلس', url: '/images/1786522982490-224635456_1786300319192251.mp4' },
  { id: 'default_hero', label: '⚡ فيديو الهيدر الافتراضي (/hero_video.mp4)', url: '/hero_video.mp4' },
];

const ThemeSettings = () => {
  const { t } = useAdminLang();
  
  // Settings
  const [themePrimary, setThemePrimary] = useState('#c4a484');
  const [themeBg, setThemeBg] = useState('#0d0b0a');
  const [themeText, setThemeText] = useState('#f8f4e6');
  const [themeHover, setThemeHover] = useState('#a47c4f');
  const [heroBanners, setHeroBanners] = useState([]);
  
  // Hero Video Customizer
  const [heroVideoUrl, setHeroVideoUrl] = useState('/images/1786522915955-411348681_1782578082455351.mp4');
  const [heroMediaType, setHeroMediaType] = useState('video'); // 'video' | 'slider'
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'colors' | 'banners'

  // Video preview player ref
  const previewVideoRef = useRef(null);

  // Drag and drop for banners
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings/theme');
        if (res.data) {
          if (res.data.theme_primary) setThemePrimary(res.data.theme_primary);
          if (res.data.theme_bg) setThemeBg(res.data.theme_bg);
          if (res.data.theme_text) setThemeText(res.data.theme_text);
          if (res.data.theme_hover) setThemeHover(res.data.theme_hover);
          if (res.data.hero_video_url) setHeroVideoUrl(res.data.hero_video_url);
          if (res.data.hero_media_type) setHeroMediaType(res.data.hero_media_type);
          if (res.data.hero_banners) {
            try {
              setHeroBanners(JSON.parse(res.data.hero_banners));
            } catch(e) {
              if (res.data.hero_banners) setHeroBanners([res.data.hero_banners]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load theme settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/api/settings/theme', {
        theme_primary: themePrimary,
        theme_bg: themeBg,
        theme_text: themeText,
        theme_hover: themeHover,
        hero_banners: JSON.stringify(heroBanners),
        hero_video_url: heroVideoUrl,
        hero_media_type: heroMediaType
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save theme settings', err);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoUploadLoading(true);
    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await axios.post('/api/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        setHeroVideoUrl(res.data.url);
        setHeroMediaType('video');
      }
    } catch (err) {
      console.error('Video upload failed', err);
      alert('فشل رفع الفيديو. يرجى التأكد من أن صيغة الملف MP4.');
    } finally {
      setVideoUploadLoading(false);
      e.target.value = '';
    }
  };

  const handleUploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = `/images/${res.data.filename}`;
      setHeroBanners(prev => [...prev, imageUrl]);
    } catch (err) {
      console.error('Upload failed', err);
      alert('فشل رفع الصورة');
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const removeBanner = (index) => {
    setHeroBanners(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null; dragOverItem.current = null; return;
    }
    const items = [...heroBanners];
    const draggedItem = items[dragItem.current];
    items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, draggedItem);
    dragItem.current = null;
    dragOverItem.current = null;
    setHeroBanners(items);
  };

  const ColorPicker = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'var(--admin-text)' }}>{label}</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ width: '100px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'var(--bg-surface)', color: 'var(--admin-text)', fontSize: '0.9rem', outline: 'none' }} />
      </div>
    </div>
  );

  return (
    <div className="dashboard-fade-in" style={{ padding: '30px', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', lineHeight: 1, marginBottom: '6px' }}>
            <span style={{ color: 'var(--admin-accent, #c5a880)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--admin-accent, #c5a880)', margin: '0 0 6px', fontWeight: '800' }}>
            🎬 تخصيص فيديو الهيدر وهوية المتجر
          </h1>
          <p style={{ color: 'var(--text-secondary, #a3a3a3)', margin: 0, fontSize: '0.95rem' }}>
            تحكم بالفيديو السينمائي الرئيسي في واجهة المتجر، البنرات الإعلانية، وألوان الثيم الملكي.
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            backgroundColor: saved ? '#10b981' : 'var(--admin-accent, #c5a880)', 
            color: saved ? '#fff' : '#111827', 
            border: 'none', padding: '14px 32px', borderRadius: '14px', 
            fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', 
            cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontSize: '1rem'
          }}
        >
          {loading ? (
            <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : saved ? (
            <><CheckCircle2 size={20} /> تم الحفظ بنجاح!</>
          ) : (
            <><Save size={20} /> حفظ وتطبيق على المتجر فوراً</>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('video')}
          style={{
            background: activeTab === 'video' ? 'var(--admin-accent, #c5a880)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'video' ? '#111827' : 'var(--admin-text)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Film size={18} /> فيديو الهيدر الرئيسي (Hero Video)
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          style={{
            background: activeTab === 'banners' ? 'var(--admin-accent, #c5a880)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'banners' ? '#111827' : 'var(--admin-text)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <ImageIcon size={18} /> سلايدر البنرات والصور
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          style={{
            background: activeTab === 'colors' ? 'var(--admin-accent, #c5a880)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'colors' ? '#111827' : 'var(--admin-text)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Palette size={18} /> ألوان وهوية المتجر
        </button>
      </div>

      {/* TAB 1: HERO VIDEO CUSTOMIZER */}
      {activeTab === 'video' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
          
          {/* Controls Column */}
          <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="var(--admin-accent, #c5a880)" />
              اختيار وتخصيص فيديو الهيدر
            </h3>

            {/* Display Mode Selection */}
            <div style={{ marginBottom: '24px', background: 'rgba(197, 168, 128, 0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
              <label style={{ display: 'block', fontWeight: '800', marginBottom: '10px', color: 'var(--admin-text)' }}>
                نوع العرض في الهيدر الرئيسي:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setHeroMediaType('video')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: heroMediaType === 'video' ? '2px solid var(--admin-accent, #c5a880)' : '1px solid var(--admin-border)',
                    background: heroMediaType === 'video' ? 'var(--admin-accent, #c5a880)' : 'transparent',
                    color: heroMediaType === 'video' ? '#111827' : 'var(--admin-text)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Film size={18} /> فيديو سينمائي متحرك (موصى به)
                </button>
                <button
                  type="button"
                  onClick={() => setHeroMediaType('slider')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: heroMediaType === 'slider' ? '2px solid var(--admin-accent, #c5a880)' : '1px solid var(--admin-border)',
                    background: heroMediaType === 'slider' ? 'var(--admin-accent, #c5a880)' : 'transparent',
                    color: heroMediaType === 'slider' ? '#111827' : 'var(--admin-text)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Layers size={18} /> سلايدر صور وبنرات
                </button>
              </div>
            </div>

            {/* Video Library Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '800', marginBottom: '8px', color: 'var(--admin-text)' }}>
                🎥 اختر فيديو من مكتبة مقاطع زهرة بيسان:
              </label>
              <select
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--admin-accent, #c5a880)',
                  backgroundColor: 'var(--bg-surface, #1e1e1e)',
                  color: 'var(--admin-text, #fff)',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {VIDEO_LIBRARY.map((v) => (
                  <option key={v.id} value={v.url} style={{ padding: '10px' }}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Custom Video */}
            <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', border: '1.5px dashed var(--admin-border)', background: 'var(--bg-surface)' }}>
              <label style={{ display: 'block', fontWeight: '800', marginBottom: '8px', color: 'var(--admin-text)' }}>
                📤 أو قم برفع فيديو مخصص جديد من جهازك:
              </label>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                الصيغ المدعومة: MP4 (حجم خفيف موصى به حتى 20 ميغابايت لأقصى سرعة تحميل للزوار).
              </p>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, var(--admin-accent, #c5a880) 0%, #a6865d 100%)',
                color: '#111827',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(197,168,128,0.3)',
                transition: '0.2s'
              }}>
                {videoUploadLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Upload size={18} />}
                {videoUploadLoading ? 'جاري رفع الفيديو إلى السيرفر...' : 'رفع فيديو جديد من الجهاز'}
                <input type="file" accept="video/mp4,video/*" onChange={handleUploadVideo} disabled={videoUploadLoading} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Custom URL Input */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', color: 'var(--admin-text)' }}>
                🔗 أو أدخل مسار أو رابط فيديو مباشر:
              </label>
              <input
                type="text"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="e.g. /images/my_video.mp4 or https://cdn.example.com/video.mp4"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--admin-text)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  direction: 'ltr',
                  boxSizing: 'border-box'
                }}
              />
            </div>

          </div>

          {/* Live Preview Column */}
          <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye size={22} color="var(--admin-accent, #c5a880)" />
              معاينة حية لفيديو الهيدر
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              هذا هو الفيديو الذي سيظهر لجميع زوار المتجر في الخلفية:
            </p>

            <div style={{
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              background: '#000',
              aspectRatio: '16/9',
              border: '2px solid rgba(197, 168, 128, 0.4)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              marginBottom: '20px'
            }}>
              <video
                ref={previewVideoRef}
                key={heroVideoUrl}
                src={heroVideoUrl}
                autoPlay
                loop
                muted
                controls
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.75)',
                color: 'var(--admin-accent, #c5a880)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backdropFilter: 'blur(4px)'
              }}>
                👑 معاينة المتجر الحي
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                <CheckCircle2 size={18} /> الفيديو جاهز للعرض
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                المسار المختار حالياً: <code style={{ color: 'var(--admin-accent)', direction: 'ltr', display: 'inline-block' }}>{heroVideoUrl}</code>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: BANNERS SLIDER */}
      {activeTab === 'banners' && (
        <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={24} color="var(--admin-accent)" />
              {t('Home Banners (Slider)')}
            </h3>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(196, 164, 132, 0.1)', color: 'var(--admin-accent)', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
              {uploadLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Upload size={18} />}
              {uploadLoading ? t('Uploading...') : t('Add Banner')}
              <input type="file" accept="image/*" onChange={handleUploadBanner} disabled={uploadLoading} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {heroBanners.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed var(--admin-border)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                <AlertCircle size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>{t('No banners added yet. Upload an image to show it on the homepage slider.')}</p>
              </div>
            ) : (
              heroBanners.map((url, index) => (
                <div 
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-surface)', padding: '15px', borderRadius: '16px', border: '1px solid var(--admin-border)' }}
                >
                  <div style={{ cursor: 'grab', color: 'var(--text-secondary)' }}><GripVertical size={20} /></div>
                  <div style={{ width: '120px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                    <img src={url} alt={`Banner ${index+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'var(--admin-text)', fontWeight: 'bold' }}>{t('Banner')} #{index + 1}</span>
                  </div>
                  <button onClick={() => removeBanner(index)} style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'none', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COLORS */}
      {activeTab === 'colors' && (
        <div style={{ backgroundColor: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={24} color="var(--admin-accent)" />
            {t('Store Colors')}
          </h3>
          
          <ColorPicker label={t('Primary Accent Color')} value={themePrimary} onChange={setThemePrimary} />
          <ColorPicker label={t('Main Background Color')} value={themeBg} onChange={setThemeBg} />
          <ColorPicker label={t('Main Text Color')} value={themeText} onChange={setThemeText} />
          <ColorPicker label={t('Button Hover Color')} value={themeHover} onChange={setThemeHover} />
          
          <div style={{ marginTop: '30px', padding: '20px', borderRadius: '16px', background: themeBg, border: '1px solid var(--admin-border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: themePrimary }}></div>
            <h4 style={{ margin: '0 0 10px 0', color: themePrimary }}>{t('Live Preview')}</h4>
            <p style={{ color: themeText, margin: '0 0 15px 0' }}>{t('This is how your text and background will look.')}</p>
            <button style={{ background: themePrimary, color: themeBg, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              onMouseOver={e => e.target.style.background = themeHover}
              onMouseOut={e => e.target.style.background = themePrimary}>
              {t('Sample Button')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ThemeSettings;
