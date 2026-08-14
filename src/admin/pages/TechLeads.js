import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Code2, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Filter, 
  DollarSign, 
  MessageSquare,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function TechLeads() {
  const { t } = useAdminLang();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/tech-leads');
      if (Array.isArray(res.data)) {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch tech leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/admin/tech-leads/${id}`, { status: newStatus });
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await axios.delete(`/api/admin/tech-leads/${id}`);
      setLeads(leads.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete lead', err);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchSearch = (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (l.phone || '').includes(searchTerm) ||
                        (l.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (l.service || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="dashboard-fade-in" style={{ padding: '30px', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', lineHeight: 1, marginBottom: '6px' }}>
            <span style={{ color: 'var(--admin-accent, #c5a880)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text, #1a1a1a)', fontStyle: 'italic' }}>Tech</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--admin-accent, #c5a880)', margin: '0 0 6px', fontWeight: '800' }}>
            💻 طلبات تطوير المواقع والحلول البرمجية (Tech Leads)
          </h1>
          <p style={{ color: 'var(--admin-text-secondary, #666)', margin: 0, fontSize: '0.95rem' }}>
            متابعة استفسارات العملاء، عروض الأسعار المحسوبة، والتواصل المباشر عبر الواتساب.
          </p>
        </div>

        <a 
          href="/tech" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg, #c5a880 0%, #a6865d 100%)',
            color: '#111827',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '800',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(197,168,128,0.25)'
          }}
        >
          <ExternalLink size={18} /> معاينة بوابة التكنولوجيا الحية
        </a>
      </div>

      {/* Filters & Search Bar */}
      <div style={{
        background: 'var(--admin-card, #ffffff)',
        border: '1px solid var(--admin-border, rgba(197,168,128,0.25))',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={18} color="var(--admin-accent, #c5a880)" style={{ position: 'absolute', right: '14px' }} />
          <input 
            type="text"
            placeholder="بحث بالاسم، الهاتف، الشركة، أو نوع الخدمة..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 42px 12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--admin-border, rgba(197,168,128,0.25))',
              background: 'var(--admin-bg, #faf8f5)',
              color: 'var(--admin-text, #1a1a1a)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'new', label: '🌟 طلب جديد' },
            { id: 'in_progress', label: '⏳ قيد المتابعة' },
            { id: 'quoted', label: '📄 تم تقديم العرض' },
            { id: 'completed', label: '✅ تم الاتفاق والبدء' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: statusFilter === st.id ? '1.5px solid var(--admin-accent, #c5a880)' : '1px solid var(--admin-border, rgba(197,168,128,0.25))',
                background: statusFilter === st.id ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                color: statusFilter === st.id ? 'var(--admin-accent, #c5a880)' : 'var(--admin-text, #1a1a1a)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table / Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-accent, #c5a880)' }}>
          <div className="spinner" style={{ margin: '0 auto 15px' }} />
          <span>جاري تحميل طلبات التطوير...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{
          background: 'var(--admin-card, #ffffff)',
          border: '2px dashed var(--admin-border, rgba(197,168,128,0.25))',
          borderRadius: '24px',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--admin-text-secondary, #666)'
        }}>
          <Code2 size={48} color="var(--admin-accent, #c5a880)" style={{ opacity: 0.6, marginBottom: '14px' }} />
          <h3 style={{ margin: '0 0 8px', color: 'var(--admin-text, #1a1a1a)' }}>لا توجد طلبات برمجية حالياً</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>ستظهر هنا طلبات عروض الأسعار والاتصال القادمة من صفحة /tech.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredLeads.map(lead => (
            <div 
              key={lead.id}
              style={{
                background: 'var(--admin-card, #ffffff)',
                border: '1px solid var(--admin-border, rgba(197,168,128,0.25))',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              
              {/* Lead Info */}
              <div style={{ flex: 1, minWidth: '320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--admin-text, #1a1a1a)', fontWeight: '800' }}>
                    {lead.name}
                  </h3>
                  {lead.company && (
                    <span style={{
                      background: 'rgba(197, 168, 128, 0.12)',
                      color: 'var(--admin-accent, #c5a880)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      🏢 {lead.company}
                    </span>
                  )}
                  <span style={{
                    background: lead.status === 'completed' ? '#10b981' : (lead.status === 'in_progress' ? '#3b82f6' : '#f59e0b'),
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: '800'
                  }}>
                    {lead.status === 'completed' ? 'منجز' : (lead.status === 'in_progress' ? 'قيد المتابعة' : 'طلب جديد')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--admin-text, #1a1a1a)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} color="#10b981" />
                    <a href={`tel:${lead.phone}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold', direction: 'ltr' }}>
                      {lead.phone}
                    </a>
                  </span>
                  {lead.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} color="var(--admin-accent, #c5a880)" />
                      <a href={`mailto:${lead.email}`} style={{ color: 'inherit', textDecoration: 'none', direction: 'ltr' }}>
                        {lead.email}
                      </a>
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--admin-text-secondary, #666)' }}>
                    <Calendar size={15} />
                    {new Date(lead.created_at || Date.now()).toLocaleDateString('ar-JO')}
                  </span>
                </div>

                <div style={{ background: 'var(--admin-bg, #faf8f5)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--admin-border, rgba(197,168,128,0.2))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: 'var(--admin-accent, #c5a880)', fontSize: '0.9rem' }}>
                      🎯 الخدمة: {lead.service || 'غير محدد'}
                    </strong>
                    <span style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem' }}>
                      💰 الميزانية: {lead.budget || lead.estimated_quote || 'غير محدد'}
                    </span>
                  </div>
                  {lead.details && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text, #1a1a1a)', lineHeight: '1.5' }}>
                      📝 {lead.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${lead.name} 🌸 معك فريق زهرة بيسان للحلول الرقمية بخصوص طلبك لخدمة ${lead.service}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
                    }}
                  >
                    <MessageSquare size={16} /> فتح محادثة واتساب
                  </a>

                  <button
                    onClick={() => handleDelete(lead.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#ef4444',
                      padding: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                    title="حذف الطلب"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary, #666)' }}>تغيير الحالة:</span>
                  <select
                    value={lead.status || 'new'}
                    onChange={e => handleUpdateStatus(lead.id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-border, rgba(197,168,128,0.25))',
                      background: 'var(--admin-bg, #faf8f5)',
                      color: 'var(--admin-text, #1a1a1a)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  >
                    <option value="new">🌟 طلب جديد</option>
                    <option value="in_progress">⏳ قيد المتابعة</option>
                    <option value="quoted">📄 تم تقديم العرض</option>
                    <option value="completed">✅ تم الاتفاق والبدء</option>
                  </select>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
