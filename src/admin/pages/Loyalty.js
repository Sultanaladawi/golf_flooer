import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, Award, Star, Plus, Minus, Search, Calendar, 
  Settings, Users, TrendingUp, History, X, Edit, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const Loyalty = () => {
  const { t } = useAdminLang();
  
  // Loyalty member states
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Settings states
  const [earnRatio, setEarnRatio] = useState('1'); // points per JOD
  const [redeemRatio, setRedeemRatio] = useState('0.01'); // JOD discount per point
  const [minPoints, setMinPoints] = useState('100'); // min points to redeem
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustPointsValue, setAdjustPointsValue] = useState('');
  const [adjustReason, setAdjustReason] = useState('admin_adjustment');
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  const colors = {
    bg: 'var(--admin-bg)',
    card: 'var(--admin-card)',
    primary: 'var(--admin-accent)',
    border: 'var(--admin-border)',
    text: 'var(--admin-text)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    success: '#38ef7d',
    warning: '#ffb300',
    danger: '#ff4d4d'
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, settingsRes] = await Promise.all([
        axios.get('/api/loyalty/members'),
        axios.get('/api/settings')
      ]);

      const membersList = Array.isArray(membersRes.data) ? membersRes.data : [];
      setMembers(membersList);
      setFilteredMembers(membersList);

      if (settingsRes.data) {
        setEarnRatio(String(settingsRes.data.loyalty_earn_ratio ?? '1'));
        setRedeemRatio(String(settingsRes.data.loyalty_redeem_ratio ?? '0.01'));
        setMinPoints(String(settingsRes.data.loyalty_min_points ?? '100'));
      }
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
      showToast(t('Failed to load loyalty data'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(m => 
        (m.customer_name || '').toLowerCase().includes(q) ||
        (m.phone_number || '').includes(q)
      );
      setFilteredMembers(filtered);
    }
  }, [search, members]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axios.post('/api/settings', {
        loyalty_earn_ratio: parseFloat(earnRatio) || 1,
        loyalty_redeem_ratio: parseFloat(redeemRatio) || 0.01,
        loyalty_min_points: parseInt(minPoints, 10) || 100
      });
      showToast(t('Settings saved successfully'));
    } catch (err) {
      console.error(err);
      showToast(t('Failed to save settings'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenHistory = async (member) => {
    try {
      const res = await axios.get(`/api/loyalty/member/${member.phone_number}`);
      setSelectedMember(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
      showToast(t('Failed to load history'), 'error');
    }
  };

  const handleOpenAdjust = (member) => {
    setSelectedMember(member);
    setAdjustPointsValue('');
    setAdjustReason('admin_adjustment');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustPointsValue || isNaN(adjustPointsValue)) {
      showToast(t('Please enter a valid points number'), 'error');
      return;
    }
    setSubmittingAdjustment(true);
    try {
      await axios.post('/api/loyalty/adjust', {
        phone_number: selectedMember.phone_number,
        customer_name: selectedMember.customer_name,
        points_change: parseInt(adjustPointsValue, 10),
        action_type: adjustReason
      });
      showToast(t('Points adjusted successfully'));
      setShowAdjustModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(t('Failed to adjust points'), 'error');
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Summary Metrics
  const totalPoints = members.reduce((sum, m) => sum + (m.points || 0), 0);
  const highestMember = members.length > 0 ? members[0] : null;

  return (
    <div className="dashboard-fade-in" style={{ padding: '40px', minHeight: '100vh', color: colors.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Toast Alert */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
          backgroundColor: notification.type === 'error' ? colors.danger : colors.success,
          color: '#1a0e05', padding: '12px 24px', borderRadius: '12px',
          fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: colors.primary, margin: '0 0 8px', lineHeight: 1 }}>
            {t('Loyalty Program')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            {t('Manage loyalty members, points balances, and settings.')}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: `${colors.primary}18`, color: colors.primary, padding: '14px', borderRadius: '16px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Loyalty Members')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{members.length}</div>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56,239,125,0.08)', color: colors.success, padding: '14px', borderRadius: '16px' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Total Outstanding Points')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{totalPoints}</div>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,179,0,0.08)', color: colors.warning, padding: '14px', borderRadius: '16px' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Top Ambassador')}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {highestMember ? `${highestMember.customer_name} (${highestMember.points} pts)` : t('None')}
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout: Settings (Left) & Members list (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.6fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Settings Box */}
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Settings size={18} color={colors.primary} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>{t('Rules & Conversions')}</h3>
          </div>
          <form onSubmit={handleSaveSettings}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>
                {t('Earn Ratio (Points per JOD)')}
              </label>
              <input 
                type="number" step="any" value={earnRatio} onChange={e => setEarnRatio(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>
                {t('Redeem Ratio (JOD discount per point)')}
              </label>
              <input 
                type="number" step="any" value={redeemRatio} onChange={e => setRedeemRatio(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>
                {t('Min Points to Redeem')}
              </label>
              <input 
                type="number" value={minPoints} onChange={e => setMinPoints(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={savingSettings} style={{
              width: '100%', padding: '14px', borderRadius: '14px',
              background: colors.primary, color: '#1a0e05', border: 'none',
              fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(197,168,128,0.25)', transition: '0.2s'
            }}>
              <CheckCircle2 size={16} />
              {savingSettings ? t('Saving...') : t('Save Rules')}
            </button>
          </form>
        </div>

        {/* Members Table Box */}
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '28px' }}>
          
          {/* Search Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color={colors.primary} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>{t('Loyalty Members')}</h3>
            </div>
            
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('Search by phone or name')}
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Members Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Customer Name')}</th>
                  <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Phone Number')}</th>
                  <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Points Balance')}</th>
                  <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Joined Date')}</th>
                  <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('Loading...')}</td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('No loyalty accounts found.')}</td>
                  </tr>
                ) : (
                  filteredMembers.map((m, idx) => (
                    <tr key={m.phone_number} style={{ borderBottom: idx < filteredMembers.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <td style={{ padding: '16px 10px', fontWeight: '700', fontSize: '0.88rem' }}>{m.customer_name}</td>
                      <td style={{ padding: '16px 10px', fontSize: '0.82rem', fontFamily: 'monospace' }} dir="ltr">{m.phone_number}</td>
                      <td style={{ padding: '16px 10px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${colors.primary}12`, border: `1px solid ${colors.primary}33`, color: colors.primary, padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                          <Award size={13} />
                          {m.points} {t('Pts')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenAdjust(m)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: '0.2s' }}
                          >
                            <Edit size={12} color={colors.primary} />
                            {t('Adjust')}
                          </button>
                          <button 
                            onClick={() => handleOpenHistory(m)}
                            style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: '0.2s' }}
                          >
                            <History size={12} />
                            {t('History')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {showAdjustModal && selectedMember && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', width: '90%', maxWidth: '420px', padding: '28px', animation: 'scaleUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '900', color: colors.primary, margin: 0 }}>{t('Points Adjustment')}</h3>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, borderRadius: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('Customer')}:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>{selectedMember.customer_name}</div>
              <div style={{ fontSize: '0.72rem', color: colors.primary, fontWeight: '800', marginTop: '6px' }}>{t('Current Balance')}: {selectedMember.points} {t('Pts')}</div>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>
                  {t('Change')} ({t('Use negative values to deduct')})
                </label>
                <input 
                  type="number" placeholder="e.g. 50 or -20" required value={adjustPointsValue} onChange={e => setAdjustPointsValue(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>
                  {t('Reason')}
                </label>
                <select 
                  value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.card, color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="admin_adjustment">{t('Manual Admin Adjustment')}</option>
                  <option value="compensation">{t('Customer Compensation')}</option>
                  <option value="promotion">{t('Marketing Promotion')}</option>
                  <option value="refund">{t('Order Cancelled / Refund')}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowAdjustModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>{t('Cancel')}</button>
                <button type="submit" disabled={submittingAdjustment} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: colors.primary, color: '#1a0e05', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {submittingAdjustment ? t('Saving...') : t('Adjust')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedMember && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', width: '90%', maxWidth: '580px', padding: '28px', animation: 'scaleUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '900', color: colors.primary, margin: 0 }}>{t('Transaction History')}</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}><X size={18} /></button>
            </div>

            <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('Customer')}:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>{selectedMember.customer_name || t('Guest')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('Points Balance')}:</span>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: colors.primary }}>{selectedMember.points} {t('Pts')}</div>
              </div>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', border: `1px solid ${colors.border}`, borderRadius: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '10px 12px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>{t('Date')}</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>{t('Change')}</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>{t('Reason')}</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'center' }}>{t('Order')}</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedMember.history || selectedMember.history.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t('No history records yet.')}</td>
                    </tr>
                  ) : (
                    selectedMember.history.map((h, i) => {
                      const isPositive = h.points_change >= 0;
                      return (
                        <tr key={h.id || i} style={{ borderBottom: i < selectedMember.history.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                          <td style={{ padding: '10px 12px', fontSize: '0.78rem' }}>
                            {h.created_at ? new Date(h.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '0.82rem', fontWeight: '800', color: isPositive ? colors.success : colors.danger }}>
                            {isPositive ? `+${h.points_change}` : h.points_change}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '0.78rem' }}>{t(h.action_type)}</td>
                          <td style={{ padding: '10px 12px', fontSize: '0.78rem', textAlign: 'center', color: colors.primary, fontWeight: '700' }}>
                            {h.order_id ? `#${h.order_id}` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <button onClick={() => setShowHistoryModal(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: 'transparent', color: '#fff', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
              {t('Close')}
            </button>
          </div>
        </div>
      )}

      {/* Style Animations */}
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

    </div>
  );
};

export default Loyalty;


