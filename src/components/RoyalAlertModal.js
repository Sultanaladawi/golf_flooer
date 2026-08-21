import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export default function RoyalAlertModal({
  isOpen,
  title,
  message,
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
  confirmText = 'حسناً',
  onClose
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={32} color="#c5a880" />;
      case 'warning':
      case 'error':
        return <AlertCircle size={32} color="#c5a880" />;
      default:
        return <Sparkles size={32} color="#c5a880" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999999,
      backgroundColor: 'rgba(18, 14, 10, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      direction: 'rtl',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        padding: '32px 28px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1.5px solid rgba(197, 168, 128, 0.45)',
        position: 'relative',
        transform: 'scale(1)',
        animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.04)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#777',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'}
        >
          <X size={18} />
        </button>

        {/* Royal Icon Badge */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#faf7f2',
          border: '1.5px solid rgba(197, 168, 128, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 20px rgba(197, 168, 128, 0.2)'
        }}>
          {getIcon()}
        </div>

        {/* Brand Subtitle */}
        <div style={{
          fontSize: '0.78rem',
          letterSpacing: '1.5px',
          fontWeight: '700',
          color: 'var(--gold-dim, #a67c48)',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          زهرة بيسان • ZAHRAT BEESAN
        </div>

        {/* Title */}
        {title && (
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '1.28rem',
            fontWeight: '800',
            color: 'var(--espresso, #1a1a1a)',
            fontFamily: 'var(--font-primary, serif)'
          }}>
            {title}
          </h3>
        )}

        {/* Message */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '0.96rem',
          lineHeight: '1.65',
          color: '#555555',
          fontWeight: '500'
        }}>
          {message}
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          autoFocus
          style={{
            width: '100%',
            padding: '13px 24px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #c5a880 0%, #b08d5b 100%)',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(197, 168, 128, 0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 22px rgba(197, 168, 128, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(197, 168, 128, 0.35)';
          }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
