import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize2, X, Play, RotateCcw } from 'lucide-react';

export default function ImageZoomViewer({ 
  images = [], 
  activeImg = 0, 
  setActiveImg, 
  videoUrl, 
  productName = '',
  isPlayingVideo = false,
  setIsPlayingVideo = () => {} 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50, px: 0, py: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const containerRef = useRef(null);

  const safeImages = images.length > 0 ? images : ['/12.png'];
  const currentImage = safeImages[activeImg] || safeImages[0];

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = Math.max(0, Math.min(100, (px / rect.width) * 100));
    const y = Math.max(0, Math.min(100, (py / rect.height) * 100));

    setLensPos({ x, y, px, py });
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const px = touch.clientX - rect.left;
    const py = touch.clientY - rect.top;

    const x = Math.max(0, Math.min(100, (px / rect.width) * 100));
    const y = Math.max(0, Math.min(100, (py / rect.height) * 100));

    setLensPos({ x, y, px, py });
  };

  // Lightbox dragging
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
  };

  const handleMouseMoveLightbox = (e) => {
    if (!isDragging) return;
    setPanPos({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPos({ x: 0, y: 0 });
      return next;
    });
  };

  const resetLightboxZoom = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', userSelect: 'none' }}>
      {/* Main Image Box with Magnifier */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovered(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3/4',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#FAF8F5',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)',
          cursor: isPlayingVideo ? 'default' : 'crosshair'
        }}
      >
        {isPlayingVideo ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
            <video 
              src={videoUrl || '/images/WhatsApp Video 2026-07-28 at 8.45.43 PM.mp4'} 
              autoPlay 
              loop 
              muted 
              playsInline 
              controls 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <button 
              onClick={() => setIsPlayingVideo(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              ✕ إلغاء الفيديو والعودة للصور
            </button>
          </div>
        ) : (
          <>
            {/* Standard Image */}
            <img 
              src={currentImage} 
              alt={productName}
              onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.2s ease'
              }}
            />

            {/* Hover Magnifier Inset Overlay Lens */}
            {isHovered && (
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                  backgroundSize: '280%',
                  backgroundRepeat: 'no-repeat',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                  borderRadius: '20px',
                  zIndex: 5
                }}
              >
                {/* Micro Lens Cursor Target Indicator */}
                <div 
                  style={{
                    position: 'absolute',
                    top: `${lensPos.py}px`,
                    left: `${lensPos.px}px`,
                    width: '120px',
                    height: '120px',
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid rgba(197, 168, 128, 0.9)',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0,0,0,0.4)',
                    pointerEvents: 'none',
                    backdropFilter: 'contrast(1.05)'
                  }}
                />
                
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  🔍 عدسة التكبير (2.8x)
                </div>
              </div>
            )}

            {/* Top Right Controls & Video Reels Trigger */}
            <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px', zIndex: 10 }}>
              {videoUrl && (
                <button 
                  type="button" 
                  onClick={() => setIsPlayingVideo(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #c5a36a, #8f6e40)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                    border: 'none'
                  }}
                >
                  <Play size={14} fill="#fff" />
                  🎬 فيديو HD (استعراض)
                </button>
              )}

              {/* Fullscreen Lightbox Button */}
              <button 
                type="button"
                onClick={() => { setIsLightboxOpen(true); resetLightboxZoom(); }}
                title="تثبيت المكبر وفتح الشاشة الكاملة"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(197, 168, 128, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: '#2b2015'
                }}
              >
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Slider Navigation Arrows */}
            {safeImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg === safeImages.length - 1) ? 0 : activeImg + 1); }}
                  style={{
                    position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(197,168,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, color: '#333'
                  }}
                >
                  <ChevronRight size={22} />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg === 0) ? safeImages.length - 1 : activeImg - 1); }}
                  style={{
                    position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(197,168,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, color: '#333'
                  }}
                >
                  <ChevronLeft size={22} />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' }}>
        {videoUrl && (
          <button 
            type="button"
            onClick={() => setIsPlayingVideo(true)}
            style={{
              width: '75px',
              height: '95px',
              flexShrink: 0,
              borderRadius: '12px',
              border: `2px solid ${isPlayingVideo ? '#c5a36a' : 'rgba(197, 168, 128, 0.3)'}`,
              background: 'linear-gradient(135deg, #1f1810, #3d2b1a)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={20} fill="#c5a36a" color="#c5a36a" />
            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>فيديو HD</span>
          </button>
        )}

        {safeImages.map((img, i) => (
          <button 
            key={i}
            type="button"
            onClick={() => { setIsPlayingVideo(false); setActiveImg(i); }}
            style={{
              width: '75px',
              height: '95px',
              flexShrink: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              padding: 0,
              border: `2px solid ${(!isPlayingVideo && i === activeImg) ? '#c5a36a' : 'rgba(197, 168, 128, 0.2)'}`,
              opacity: (!isPlayingVideo && i === activeImg) ? 1 : 0.6,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#FAF8F5'
            }}
          >
            <img 
              src={img} 
              alt={`thumb-${i}`}
              onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL WITH DEEP ZOOM */}
      {isLightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 8, 6, 0.96)',
            backdropFilter: 'blur(15px)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl'
          }}
          onMouseMove={handleMouseMoveLightbox}
          onMouseUp={handleMouseUp}
        >
          {/* Lightbox Header Bar */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(197, 168, 128, 0.2)',
              background: 'rgba(20, 16, 12, 0.8)'
            }}
          >
            <div style={{ color: '#f5ede0', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#c5a36a' }}>{productName}</span>
              <span style={{ fontSize: '0.8rem', color: '#998', opacity: 0.8 }}>({activeImg + 1} / {safeImages.length})</span>
            </div>

            {/* Zoom Control Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={handleZoomOut} 
                  disabled={zoomLevel <= 1}
                  style={{ background: 'none', border: 'none', color: zoomLevel <= 1 ? '#666' : '#fff', cursor: zoomLevel <= 1 ? 'default' : 'pointer', padding: '4px' }}
                >
                  <ZoomOut size={20} />
                </button>
                <span style={{ color: '#c5a36a', fontWeight: 800, fontSize: '0.88rem', minWidth: '45px', textAlign: 'center' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button 
                  onClick={handleZoomIn} 
                  disabled={zoomLevel >= 4}
                  style={{ background: 'none', border: 'none', color: zoomLevel >= 4 ? '#666' : '#fff', cursor: zoomLevel >= 4 ? 'default' : 'pointer', padding: '4px' }}
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={resetLightboxZoom} 
                  title="إعادة تعيين"
                  style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px', marginRight: '4px' }}
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <button 
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Lightbox Main Zoom Stage */}
          <div 
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            <img 
              src={currentImage} 
              alt={productName}
              onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
              style={{
                maxWidth: '90%',
                maxHeight: '85vh',
                objectFit: 'contain',
                transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 0.25s ease',
                userSelect: 'none',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                borderRadius: '8px'
              }}
            />

            {/* Lightbox Prev / Next Controls */}
            {safeImages.length > 1 && (
              <>
                <button 
                  onClick={() => { setActiveImg((activeImg === safeImages.length - 1) ? 0 : activeImg + 1); resetLightboxZoom(); }}
                  style={{
                    position: 'absolute', top: '50%', right: '24px', transform: 'translateY(-50%)',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={28} />
                </button>
                <button 
                  onClick={() => { setActiveImg((activeImg === 0) ? safeImages.length - 1 : activeImg - 1); resetLightboxZoom(); }}
                  style={{
                    position: 'absolute', top: '50%', left: '24px', transform: 'translateY(-50%)',
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
