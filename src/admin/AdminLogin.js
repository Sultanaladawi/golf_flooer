import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminContext } from './AdminContext';
import { useAdminLang } from './AdminLangContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const { login, loading, error } = useAdminContext();
  const { t } = useAdminLang();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const colors = {
    bg: '#faf8f5',
    card: '#ffffff',
    accent: '#a6865d',
    text: '#1a1a1a',
    textMuted: '#777777',
    border: 'rgba(166, 134, 93, 0.25)',
    danger: '#ef4444',
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await login(form.email, form.password);
    if (success) {
      try {
        await axios.post('/api/log-action', {
          action: 'Login',
          details: `Admin terminal access established for ${form.email}`
        }, {
          headers: { 'x-admin-email': form.email, 'x-admin-name': form.email.split('@')[0] }
        });
      } catch (logErr) {}
      navigate(from, { replace: true });
    }
  }

  return (
    <div style={{ 
      backgroundColor: colors.bg, 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden', 
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Light aesthetic gradient background */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% -20%, rgba(166,134,93,0.15) 0%, transparent 70%)`, zIndex: 0 }} />
      
      {/* Floating Light Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;700;900&display=swap');
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.4;
          animation: float 20s infinite alternate ease-in-out;
        }
        .orb-1 { width: 400px; height: 400px; background: rgba(166, 134, 93, 0.2); top: -100px; left: -100px; animation-duration: 25s; }
        .orb-2 { width: 350px; height: 350px; background: rgba(220, 205, 185, 0.3); bottom: -50px; right: -50px; animation-duration: 18s; animation-delay: -5s; }
        .orb-3 { width: 300px; height: 300px; background: rgba(250, 248, 245, 0.8); top: 40%; left: 60%; animation-duration: 22s; animation-delay: -10s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, 50px) scale(1.05); }
          66% { transform: translate(-40px, 30px) scale(0.95); }
          100% { transform: translate(20px, -20px) scale(1); }
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 30px;
          padding: 45px 40px;
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.8) inset;
          transition: all 0.4s ease;
        }

        .lux-input {
          width: 100%;
          background: #fbfaf8 !important;
          border: 1px solid ${colors.border} !important;
          border-radius: 16px !important;
          padding: 16px 20px !important;
          color: ${colors.text} !important;
          outline: none !important;
          transition: all 0.3s ease !important;
          font-size: 0.95rem !important;
          font-weight: 500;
        }
        .lux-input::placeholder {
          color: #a0a0a0 !important;
        }
        .lux-input:focus {
          border-color: ${colors.accent} !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(166, 134, 93, 0.1) !important;
        }

        .login-btn {
          background: ${colors.accent};
          color: #ffffff;
          border: none;
          border-radius: 16px;
          padding: 18px;
          font-weight: 700;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(166, 134, 93, 0.25);
          margin-top: 10px;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          background: #90734e;
          box-shadow: 0 12px 25px rgba(166, 134, 93, 0.35);
        }

        .label-text {
          color: ${colors.textMuted};
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          transition: 0.3s;
        }
        .input-group:focus-within .label-text { color: ${colors.accent}; }
      `}</style>

      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: colors.accent, margin: '0 0 5px 0', lineHeight: 1 }}>
            Zahrat Beesan
          </h1>
          <p style={{ color: colors.textMuted, fontSize: '0.85rem', fontWeight: 500 }}>
            {t('System Administration')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="label-text"><Mail size={14} /> {t('Email Address')}</label>
            <input type="email" className="lux-input" placeholder="admin@zahratbeesan.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required autoFocus />
          </div>

          <div className="input-group">
            <label className="label-text"><Lock size={14} /> {t('Password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="lux-input" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: '5px' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '12px 16px', color: colors.danger, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, animation: 'shake 0.4s' }}>
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <Loader2 className="animate-spin" size={22} /> : t('Login')}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '0.7rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <ShieldCheck size={12} /> {t('Secure Connection')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      `}</style>
    </div>
  );
}