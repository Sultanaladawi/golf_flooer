import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Wallet, Save, CheckCircle2, Key, AlertCircle } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useAdminLang } from '../AdminLangContext';

const Settings = () => {
  const { t } = useAdminLang();
  const [iban, setIban] = useState('');
  const [wallet, setWallet] = useState('');
  const [cliqAlias, setCliqAlias] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [fbAccessToken, setFbAccessToken] = useState('');
  const [igUserId, setIgUserId] = useState('');
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fetch existing settings
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) {
          setIban(res.data.iban || '');
          setWallet(res.data.wallet || '');
          setCliqAlias(res.data.cliqAlias || '');
          setFbPageId(res.data.fb_page_id || '');
          setFbAccessToken(res.data.fb_access_token || '');
          setIgUserId(res.data.ig_user_id || '');
          setWaPhoneNumberId(res.data.wa_phone_number_id || '');
          setWaAccessToken(res.data.wa_access_token || '');
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/api/settings', { iban, wallet, cliqAlias, fb_page_id: fbPageId, fb_access_token: fbAccessToken, ig_user_id: igUserId, wa_phone_number_id: waPhoneNumberId, wa_access_token: waAccessToken });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-fade-in" style={{ padding: '40px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', lineHeight: 1, marginBottom: '8px' }}>
          <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: 'var(--admin-accent)', margin: '0 0 8px', lineHeight: 1 }}>
          {t('Store Settings')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>
          {t('Manage your payment details and payout accounts.')}
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: '24px',
        padding: '30px',
        maxWidth: '800px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CreditCard size={24} color="var(--admin-accent)" />
          {t('Payment Gateway Payout Details')}
        </h3>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
            {t('Bank Account IBAN (International Bank Account Number)')}
          </label>
          <div style={{ position: 'relative' }}>
            <CreditCard size={18} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder={t("e.g. JO12 ABAB 1234 5678 9012 3456 7890")}
              style={{
                width: '100%', padding: '15px 15px 15px 45px',
                borderRadius: '12px', border: '1px solid var(--admin-border)',
                background: 'var(--bg-surface)', color: 'var(--admin-text)',
                fontSize: '1rem', outline: 'none', transition: '0.2s'
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {t('Funds from global Visa/MasterCard transactions will be routed here.')}
          </p>
        </div>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
            {t('Wallet Number (e.g., Zain Cash, Orange Money)')}
          </label>
          <div style={{ position: 'relative' }}>
            <Wallet size={18} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder={t("e.g. 0791234567")}
              style={{
                width: '100%', padding: '15px 15px 15px 45px',
                borderRadius: '12px', border: '1px solid var(--admin-border)',
                background: 'var(--bg-surface)', color: 'var(--admin-text)',
                fontSize: '1rem', outline: 'none', transition: '0.2s'
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {t('Alternative payout method for local/regional transfers.')}
          </p>
        </div>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
            {t('CliQ Name (Alias)')}
          </label>
          <div style={{ position: 'relative' }}>
            <Wallet size={18} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={cliqAlias}
              onChange={(e) => setCliqAlias(e.target.value)}
              placeholder={t("e.g. ZAHRATBEESAN")}
              style={{
                width: '100%', padding: '15px 15px 15px 45px',
                borderRadius: '12px', border: '1px solid var(--admin-border)',
                background: 'var(--bg-surface)', color: 'var(--admin-text)',
                fontSize: '1rem', outline: 'none', transition: '0.2s'
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {t('CliQ Alias for receiving payments directly via name instead of phone number.')}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: 'var(--admin-accent)',
            color: '#fff',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: '0.2s',
            boxShadow: '0 4px 15px rgba(166,134,93,0.3)'
          }}
        >
          {loading ? t('Saving...') : saved ? <><CheckCircle2 size={20} /> {t('Saved Successfully!')}</> : <><Save size={20} /> {t('Save Payment Settings')}</>}
        </button>
      </div>

      {/* Social Media API Config */}
      <div style={{
        backgroundColor: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: '24px',
        padding: '30px',
        maxWidth: '800px',
        marginTop: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Key size={24} color="var(--admin-accent)" />
          إعدادات API للنشر على وسائل التواصل
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <AlertCircle size={16} color="#f87171" />
          <span style={{ fontSize: '0.8rem', color: '#f87171' }}>
            هذه المفاتيح سرية — لا تشاركها مع أحد. يتم تشفير التخزين على الخادم.
          </span>
        </div>

        {/* Facebook + Instagram */}
        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(24,119,242,0.06)', border: '1px solid rgba(24,119,242,0.15)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <FaFacebook size={20} color="#1877f2" />
            <span style={{ fontWeight: '700', color: 'var(--admin-text)' }}>Facebook + Instagram (Meta Graph API)</span>
          </div>
          {[
            { label: 'Facebook Page ID', val: fbPageId, set: setFbPageId, ph: 'مثال: 123456789012345' },
            { label: 'Facebook Access Token (Long-lived)', val: fbAccessToken, set: setFbAccessToken, ph: 'EAABs...', type: 'password' },
            { label: 'Instagram Business User ID', val: igUserId, set: setIgUserId, ph: 'مثال: 17841400000000000' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{field.label}</label>
              <input
                type={field.type || 'text'}
                value={field.val}
                onChange={e => field.set(e.target.value)}
                placeholder={field.ph}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--bg-surface)', color: 'var(--admin-text)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            احصل على التوكن من: <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" style={{ color: '#1877f2' }}>Meta Graph API Explorer</a>
          </p>
        </div>

        {/* WhatsApp */}
        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.15)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <FaWhatsapp size={20} color="#25D366" />
            <span style={{ fontWeight: '700', color: 'var(--admin-text)' }}>WhatsApp Business Cloud API</span>
          </div>
          {[
            { label: 'Phone Number ID', val: waPhoneNumberId, set: setWaPhoneNumberId, ph: 'مثال: 123456789012345' },
            { label: 'WhatsApp Access Token', val: waAccessToken, set: setWaAccessToken, ph: 'EAABs...', type: 'password' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{field.label}</label>
              <input
                type={field.type || 'text'}
                value={field.val}
                onChange={e => field.set(e.target.value)}
                placeholder={field.ph}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--bg-surface)', color: 'var(--admin-text)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            من <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" style={{ color: '#25D366' }}>Meta for Developers</a> — أنشئ تطبيق WhatsApp Business
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #1877f2, #bc1888)',
            color: '#fff', border: 'none', padding: '14px 28px',
            borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
          }}
        >
          {saved ? <><CheckCircle2 size={18} /> حُفظ!</> : <><Save size={18} /> حفظ إعدادات API</>}
        </button>
      </div>
    </div>
  );
};

export default Settings;


