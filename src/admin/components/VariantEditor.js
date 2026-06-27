import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/* ──────────────────────────────────────────────
   ColorSwatch — draws a circle with 1-4 colors
   using CSS conic-gradient
────────────────────────────────────────────── */
export function ColorSwatch({ colors = [], size = 32, selected = false, onClick, title }) {
  const safeColors = Array.isArray(colors) && colors.length > 0 ? colors : ['#888888'];
  const n = safeColors.length;

  let bg;
  if (n === 1) {
    bg = safeColors[0];
  } else {
    const step = 360 / n;
    const stops = safeColors.map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`).join(', ');
    bg = `conic-gradient(${stops})`;
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        border: selected ? '3px solid var(--admin-accent)' : '2px solid rgba(255,255,255,0.3)',
        boxShadow: selected
          ? '0 0 0 2px var(--admin-accent), 0 4px 12px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
        padding: 0
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   VariantEditor — manage variants for one product
────────────────────────────────────────────── */
export default function VariantEditor({ productId, t, theme, inputStyle, labelStyle }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef({});

  const colors_palette = ['#000000','#1a1a2e','#16213e','#0f3460','#533483','#2c003e','#1b1b2f','#2d2d2d','#4a4a4a','#ffffff','#f5f5f5','#faf6f0','#c5a880','#a6865d','#8b6914','#d4af37','#b8860b','#8B0000','#dc143c','#c0392b','#e74c3c','#922b21','#6b2737','#800020','#2ecc71','#27ae60','#1a5276','#117a65','#6b4226','#4a235a','#7b241c','#1f618d','#2980b9','#154360'];

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    axios.get(`/api/products/${productId}/variants`)
      .then(res => {
        const parsed = res.data.map(v => ({
          ...v,
          colors: parseJSON(v.colors, []),
          images: parseJSON(v.images, []),
          sizes: parseJSON(v.sizes, [])
        }));
        setVariants(parsed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  function parseJSON(val, fallback) {
    if (!val) return fallback;
    try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return fallback; }
  }

  function newVariant() {
    return { id: null, color_name: '', colors: ['#000000'], images: [], video_url: '', sizes: [] };
  }

  function addVariant() {
    const updated = [...variants, newVariant()];
    setVariants(updated);
    setOpenIdx(updated.length - 1);
  }

  function removeLocal(idx) {
    setVariants(prev => prev.filter((_, i) => i !== idx));
    if (openIdx === idx) setOpenIdx(null);
  }

  function updateVariant(idx, field, value) {
    setVariants(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function saveVariant(idx) {
    const v = variants[idx];
    if (!v.color_name.trim()) { alert(t ? t('Color name is required') : 'اسم اللون مطلوب'); return; }
    setSaving(true);
    try {
      const payload = {
        color_name: v.color_name,
        colors: v.colors,
        images: v.images,
        video_url: v.video_url || null,
        sizes: v.sizes,
        sort_order: idx
      };
      if (v.id) {
        await axios.put(`/api/products/variants/${v.id}`, payload);
      } else {
        const res = await axios.post(`/api/products/${productId}/variants`, payload);
        updateVariant(idx, 'id', res.data.id);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(idx) {
    const v = variants[idx];
    if (!window.confirm(t ? t('Delete this color variant?') : 'هل تريد حذف هذا اللون؟')) return;
    if (v.id) {
      try { await axios.delete(`/api/products/variants/${v.id}`); } catch {}
    }
    removeLocal(idx);
  }

  // ── Upload images for a variant
  async function handleImageUpload(idx, files) {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      const res = await axios.post('/api/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const urls = res.data.urls || [];
      updateVariant(idx, 'images', [...(variants[idx].images || []), ...urls]);
    } catch {
      alert('فشل رفع الصور');
    }
  }

  // ── Sizes editor
  function addSize(idx) {
    const sizes = [...(variants[idx].sizes || []), { size: '', quantity: 10 }];
    updateVariant(idx, 'sizes', sizes);
  }

  function updateSize(idx, sIdx, field, value) {
    const sizes = [...(variants[idx].sizes || [])];
    sizes[sIdx] = { ...sizes[sIdx], [field]: field === 'quantity' ? parseInt(value) || 0 : value };
    updateVariant(idx, 'sizes', sizes);
  }

  function removeSize(idx, sIdx) {
    const sizes = (variants[idx].sizes || []).filter((_, i) => i !== sIdx);
    updateVariant(idx, 'sizes', sizes);
  }

  // ── Color hex editor
  function addColor(idx) {
    if ((variants[idx].colors || []).length >= 4) return;
    updateVariant(idx, 'colors', [...(variants[idx].colors || []), '#c5a880']);
  }

  function updateColor(idx, cIdx, hex) {
    const colors = [...(variants[idx].colors || [])];
    colors[cIdx] = hex;
    updateVariant(idx, 'colors', colors);
  }

  function removeColor(idx, cIdx) {
    if ((variants[idx].colors || []).length <= 1) return;
    const colors = (variants[idx].colors || []).filter((_, i) => i !== cIdx);
    updateVariant(idx, 'colors', colors);
  }

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(196,164,132,0.2)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px'
  };

  const btn = (bg, color = '#fff') => ({
    background: bg, color, border: 'none', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
    fontWeight: '700', transition: '0.2s'
  });

  if (!productId) return (
    <div style={{ color: '#888', fontSize: '0.85rem', padding: '20px', textAlign: 'center' }}>
      احفظ المنتج أولاً لتتمكن من إضافة الألوان
    </div>
  );

  return (
    <div>
      {/* Header with existing swatches preview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--admin-text)', fontWeight: '700', fontSize: '0.95rem' }}>
            {variants.length > 0 ? `${variants.length} لون متاح` : 'لا توجد ألوان بعد'}
          </span>
          {/* Live swatches preview */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {variants.map((v, i) => (
              <ColorSwatch
                key={i}
                colors={v.colors}
                size={26}
                selected={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                title={v.color_name}
              />
            ))}
          </div>
        </div>
        <button type="button" onClick={addVariant} style={btn('var(--admin-accent)')}>
          + إضافة لون
        </button>
      </div>

      {loading && <div style={{ color: '#888', fontSize: '0.85rem' }}>جاري التحميل...</div>}

      {variants.map((v, idx) => (
        <div key={idx} style={{ ...card, borderColor: openIdx === idx ? 'var(--admin-accent)' : 'rgba(196,164,132,0.2)' }}>
          {/* Variant header */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <ColorSwatch colors={v.colors} size={36} selected={openIdx === idx} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--admin-text)', fontWeight: '700', fontSize: '0.9rem' }}>
                {v.color_name || 'لون جديد (غير محدد)'}
              </div>
              <div style={{ color: '#888', fontSize: '0.72rem', marginTop: '2px' }}>
                {(v.sizes || []).length} مقاس · {(v.images || []).length} صورة
                {v.video_url ? ' · فيديو' : ''}
              </div>
            </div>
            <span style={{ color: '#888', fontSize: '1.1rem' }}>{openIdx === idx ? '▲' : '▼'}</span>
          </div>

          {/* Expanded editor */}
          {openIdx === idx && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Color name */}
              <div>
                <label style={labelStyle}>اسم اللون / التشكيلة</label>
                <input
                  value={v.color_name}
                  onChange={e => updateVariant(idx, 'color_name', e.target.value)}
                  placeholder="مثال: أسود مع تطريز ذهبي وعنابي"
                  style={inputStyle}
                />
              </div>

              {/* Color pickers */}
              <div>
                <label style={labelStyle}>ألوان الكرة (1-4 ألوان) — المعاينة:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <ColorSwatch colors={v.colors} size={48} />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {(v.colors || []).map((hex, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="color"
                          value={hex}
                          onChange={e => updateColor(idx, cIdx, e.target.value)}
                          style={{ width: '36px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '2px' }}
                        />
                        {/* Palette quick-pick */}
                        {(v.colors || []).length > 1 && (
                          <button type="button" onClick={() => removeColor(idx, cIdx)}
                            style={{ background: 'rgba(231,74,59,0.2)', color: '#e74a3b', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {(v.colors || []).length < 4 && (
                      <button type="button" onClick={() => addColor(idx)}
                        style={{ ...btn('rgba(196,164,132,0.1)', 'var(--admin-accent)'), border: '1px dashed var(--admin-accent)', padding: '6px 12px' }}>
                        + لون
                      </button>
                    )}
                  </div>
                </div>
                {/* Quick palette */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                  {colors_palette.map(c => (
                    <button key={c} type="button"
                      onClick={() => {
                        if ((v.colors || []).length < 4) {
                          updateVariant(idx, 'colors', [...(v.colors || []), c]);
                        } else {
                          // replace last
                          const nc = [...(v.colors || [])]; nc[nc.length-1] = c;
                          updateVariant(idx, 'colors', nc);
                        }
                      }}
                      title={c}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 0 }}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes & quantities */}
              <div>
                <label style={labelStyle}>المقاسات والكميات</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(v.sizes || []).map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', gap: '8px' }}>
                      <input value={s.size || ''} onChange={e => updateSize(idx, sIdx, 'size', e.target.value)}
                        placeholder="مثال: S, M, 50" style={{ flex: 1, ...inputStyle, padding: '8px 12px' }} />
                      <input type="number" value={s.quantity ?? 10} onChange={e => updateSize(idx, sIdx, 'quantity', e.target.value)}
                        placeholder="الكمية" style={{ width: '80px', ...inputStyle, padding: '8px 12px' }} />
                      <button type="button" onClick={() => removeSize(idx, sIdx)}
                        style={{ background: 'rgba(231,74,59,0.2)', color: '#e74a3b', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSize(idx)}
                    style={{ ...btn('rgba(196,164,132,0.1)', 'var(--admin-accent)'), border: '1px dashed var(--admin-accent)', alignSelf: 'flex-start' }}>
                    + إضافة مقاس
                  </button>
                </div>
              </div>

              {/* Images */}
              <div>
                <label style={labelStyle}>صور هذا اللون</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {(v.images || []).map((url, iIdx) => (
                    <div key={iIdx} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: '70px', height: '85px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(196,164,132,0.3)' }} />
                      <button type="button"
                        onClick={() => updateVariant(idx, 'images', (v.images || []).filter((_, i) => i !== iIdx))}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e74a3b', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                  <label style={{ width: '70px', height: '85px', border: '2px dashed rgba(196,164,132,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', fontSize: '1.5rem', flexShrink: 0 }}>
                    +
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                      onChange={e => handleImageUpload(idx, e.target.files)} />
                  </label>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label style={labelStyle}>رابط الفيديو (اختياري)</label>
                <input value={v.video_url || ''} onChange={e => updateVariant(idx, 'video_url', e.target.value)}
                  placeholder="https://..." style={inputStyle} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(196,164,132,0.15)' }}>
                <button type="button" onClick={() => saveVariant(idx)} disabled={saving}
                  style={btn('var(--admin-accent)')}>
                  {saving ? 'جاري الحفظ...' : '💾 حفظ هذا اللون'}
                </button>
                <button type="button" onClick={() => deleteVariant(idx)}
                  style={btn('rgba(231,74,59,0.15)', '#e74a3b')}>
                  🗑️ حذف
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {variants.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px', border: '2px dashed rgba(196,164,132,0.2)', borderRadius: '12px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎨</div>
          <div>لا توجد ألوان بعد — اضغط "إضافة لون" لإضافة اللون الأول</div>
        </div>
      )}
    </div>
  );
}
