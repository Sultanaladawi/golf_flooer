import React, { useEffect, useState, useRef } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState('intro');
  const canvasRef = useRef(null);

  useEffect(() => {
    // Particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.8 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;
        const glow = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(166, 134, 93, ${glow * 0.5})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(184, 149, 106, 0.25)';
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const t1 = setTimeout(() => setPhase('reveal'), 400);
    const t2 = setTimeout(() => setPhase('fading'), 2200);
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`${styles.loader} ${phase === 'fading' ? styles.fading : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.particleCanvas} />
      
      <div className={styles.vignetteOverlay} />
      
      <div className={styles.inner}>
        {/* Decorative line top */}
        <div className={`${styles.decoLine} ${phase === 'reveal' ? styles.decoLineVisible : ''}`} />
        
        {/* Logo icon */}
        <div className={`${styles.logoIcon} ${phase === 'reveal' ? styles.logoIconVisible : ''}`}>
          <img src="/logo.png" alt="" style={{ width: '160px', height: '160px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(197,168,128,0.35))' }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Brand Name */}
        <h1 className={`${styles.brandName} ${phase === 'reveal' ? styles.brandNameVisible : ''}`}>
          زهرة بيسان
        </h1>
        
        {/* Tagline */}
        <p className={`${styles.tagline} ${phase === 'reveal' ? styles.taglineVisible : ''}`}>
          متجر إلكتروني فاخر
        </p>

        {/* Decorative line bottom */}
        <div className={`${styles.decoLine} ${phase === 'reveal' ? styles.decoLineVisible : ''}`} />

        {/* Year */}
        <span className={`${styles.yearTag} ${phase === 'reveal' ? styles.yearTagVisible : ''}`}>
          منذ ٢٠٠٤
        </span>

        {/* Progress */}
        <div className={`${styles.progressBar} ${phase === 'reveal' ? styles.progressBarVisible : ''}`}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}