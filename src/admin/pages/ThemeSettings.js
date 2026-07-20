import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Palette, Image as ImageIcon, Save, CheckCircle2, Upload, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const ThemeSettings = () => {
  const { t } = useAdminLang();
  
  // Settings
  const [themePrimary, setThemePrimary] = useState('#c4a484');
  const [themeBg, setThemeBg] = useState('#0d0b0a');
  const [themeText, setThemeText] = useState('#f8f4e6');
  const [themeHover, setThemeHover] = useState('#a47c4f');
  const [heroBanners, setHeroBanners] = useState([]); // Array of strings (image URLs)
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Drag and drop for banners
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings/theme');
        if (res.data) {
          if (res.data.theme_primary) setThemePrimary(res.data.theme_primary);
          if (res.data.theme_bg) setThemeBg(res.data.theme_bg);
          if (res.data.theme_text) setThemeText(res.data.theme_text);
          if (res.data.theme_hover) setThemeHover(res.data.theme_hover);
          if (res.data.hero_banners) {
            try {
              setHeroBanners(JSON.parse(res.data.hero_banners));
            } catch(e) {
              if(res.data.hero_banners) setHeroBanners([res.data.hero_banners]); // legacy fallback
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
        hero_banners: JSON.stringify(heroBanners)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save theme settings', err);
    } finally {
      setLoading(false);
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
      alert(t('Failed to upload image'));
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
    <div className="dashboard-fade-in" style={{ padding: '40px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', lineHeight: 1, marginBottom: '8px' }}>
            <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: 'var(--admin-accent)', margin: '0 0 8px', lineHeight: 1 }}>
            {t('Theme & Banners')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>
            {t('Customize the storefront colors and upload slider banners.')}
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            backgroundColor: saved ? 'var(--admin-success)' : 'var(--admin-accent)', 
            color: saved ? '#fff' : 'var(--admin-bg)', 
            border: 'none', padding: '14px 28px', borderRadius: '14px', 
            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', 
            cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : saved ? <><CheckCircle2 size={20} /> {t('Saved!')}</> : <><Save size={20} /> {t('Save Theme Settings')}</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Colors Panel */}
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

        {/* Banners Panel */}
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

      </div>
    </div>
  );
};

export default ThemeSettings;
