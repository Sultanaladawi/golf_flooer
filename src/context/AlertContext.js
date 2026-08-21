import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import RoyalAlertModal from '../components/RoyalAlertModal';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info' | 'success' | 'warning' | 'error'
    confirmText: 'حسناً',
    onConfirm: null
  });

  const [toasts, setToasts] = useState([]);

  // Trigger luxury modal alert
  const showAlert = useCallback((options) => {
    if (typeof options === 'string') {
      setAlertState({
        isOpen: true,
        title: 'تنبيه',
        message: options,
        type: 'info',
        confirmText: 'حسناً',
        onConfirm: null
      });
    } else {
      setAlertState({
        isOpen: true,
        title: options.title || (options.type === 'error' ? 'تنبيه' : options.type === 'success' ? 'نجاح' : 'تنبيه'),
        message: options.message || '',
        type: options.type || 'info',
        confirmText: options.confirmText || 'حسناً',
        onConfirm: options.onConfirm || null
      });
    }
  }, []);

  // Trigger floating luxury toast
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const closeAlert = useCallback(() => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    setAlertState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  }, [alertState]);

  // Patch window.alert to automatically use our luxury modal across the entire app
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      showAlert(String(msg || ''));
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, showToast, closeAlert }}>
      {children}
      
      {/* Global Royal Alert Modal */}
      <RoyalAlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        onClose={closeAlert}
      />

      {/* Floating Royal Toasts Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
        pointerEvents: 'none',
        direction: 'rtl'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'rgba(26, 20, 16, 0.95)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '30px',
              border: '1.5px solid rgba(197, 168, 128, 0.5)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.95rem',
              fontWeight: '600',
              backdropFilter: 'blur(8px)',
              animation: 'fadeInUp 0.3s ease-out forwards'
            }}
          >
            <span style={{ color: 'var(--gold, #c5a880)', fontSize: '1.1rem' }}>
              {toast.type === 'success' ? '✦' : toast.type === 'error' ? '⚠️' : '🌸'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    return {
      showAlert: (msg) => window.alert(msg),
      showToast: (msg) => console.log(msg),
      closeAlert: () => {}
    };
  }
  return context;
}
