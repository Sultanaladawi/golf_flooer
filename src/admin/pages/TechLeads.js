import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Code2, Phone, Mail, Building2, Calendar, CheckCircle2, 
  Clock, ExternalLink, Trash2, Filter, DollarSign, 
  MessageSquare, Sparkles, Search, Check, Plus, Edit3,
  Layers, Server, Globe, FileText, ArrowRight, ArrowLeft,
  AlertTriangle, RefreshCw, Printer, Send, ShieldCheck,
  CreditCard, TrendingUp, X, CheckSquare, Eye, Award
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function TechLeads() {
  const { t } = useAdminLang();
  const [activeTab, setActiveTab] = useState('kanban'); // 'overview' | 'kanban' | 'quotes' | 'servers' | 'payments' | 'leads'

  // Data States
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [previewQuote, setPreviewQuote] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingProject, setPayingProject] = useState(null);

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    company: '',
    project_title: '',
    service_type: 'ecommerce',
    stage: 'in_development',
    total_price: 650,
    deposit_paid: 325,
    mid_payment: 0,
    final_payment: 0,
    domain_name: '',
    domain_expires_at: '',
    hosting_plan: 'Azure Business Cloud (35 د.أ)',
    hosting_expires_at: '',
    live_url: '',
    notes: ''
  });

  // Quotation Form State
  const [quoteForm, setQuoteForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    company: '',
    project_title: '',
    service_type: 'ecommerce',
    scope_items: [
      { title: 'تصميم واجهة متجر وتطبيق فاخر', desc: 'واجهات متجاوبة فائقة السرعة مع تجربة مستخدم سلسة', price: 600 },
      { title: 'ربط بوابات الدفع (CliQ, Visa, Tamara)', desc: 'دفع إلكتروني آمن مع فواتير ضريبية QR', price: 250 },
      { title: 'لوحة تحكم ERP والمستودعات', desc: 'إدارة المخزون والطلبات والعملاء متعدد الفروع', price: 350 }
    ],
    discount_amount: 100,
    payment_terms: '50% دفعة أولى عند توقيع العقد، 25% عند اكتمال التصميم، 25% عند التسليم والتشغيل.',
    timeline_days: '7 - 14 يوم عمل',
    warranty_months: 12,
    notes: 'العرض يشمل الاستضافة السحابية للسنة الأولى مجاناً مع شهادات أمان SSL.'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, projRes, quoteRes, statsRes] = await Promise.all([
        axios.get('/api/admin/tech-leads').catch(() => ({ data: [] })),
        axios.get('/api/admin/tech-projects').catch(() => ({ data: [] })),
        axios.get('/api/admin/tech-quotations').catch(() => ({ data: [] })),
        axios.get('/api/admin/tech-stats').catch(() => ({ data: null }))
      ]);

      if (Array.isArray(leadsRes.data)) setLeads(leadsRes.data);
      if (Array.isArray(projRes.data)) setProjects(projRes.data);
      if (Array.isArray(quoteRes.data)) setQuotations(quoteRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch tech admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── STAGE COLUMNS CONFIG ──────────────────────────────────
  const STAGES = [
    { id: 'new_lead', title: 'طلب جديد / فكرة', icon: Sparkles, color: '#f59e0b', bg: '#fef3c7' },
    { id: 'discovery', title: 'قيد التحليل والمكالمة', icon: Phone, color: '#6366f1', bg: '#e0e7ff' },
    { id: 'proposal_sent', title: 'عرض السعر مرسل', icon: FileText, color: '#8b5cf6', bg: '#ede9fe' },
    { id: 'in_development', title: 'قيد البرمجة والتطوير', icon: Code2, color: '#b8943a', bg: '#fdfaf4' },
    { id: 'qa_testing', title: 'مرحلة الاختبار والتسليم', icon: AlertTriangle, color: '#ec4899', bg: '#fce7f3' },
    { id: 'completed', title: 'تم التسليم والتشغيل', icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' }
  ];

  // ─── PROJECT CRUD HANDLERS ─────────────────────────────────
  const handleOpenNewProject = (lead = null) => {
    if (lead) {
      setProjectForm({
        client_name: lead.name || '',
        client_phone: lead.phone || '',
        client_email: lead.email || '',
        company: lead.company || '',
        project_title: `مشروع ${lead.service || 'متجر إلكتروني'} - ${lead.name}`,
        service_type: 'ecommerce',
        stage: 'in_development',
        total_price: 650,
        deposit_paid: 325,
        mid_payment: 0,
        final_payment: 0,
        domain_name: '',
        domain_expires_at: '',
        hosting_plan: 'Azure Business Cloud (35 د.أ)',
        hosting_expires_at: '',
        live_url: '',
        notes: lead.details || ''
      });
    } else {
      setProjectForm({
        client_name: '',
        client_phone: '',
        client_email: '',
        company: '',
        project_title: '',
        service_type: 'ecommerce',
        stage: 'in_development',
        total_price: 650,
        deposit_paid: 325,
        mid_payment: 0,
        final_payment: 0,
        domain_name: '',
        domain_expires_at: '',
        hosting_plan: 'Azure Business Cloud (35 د.أ)',
        hosting_expires_at: '',
        live_url: '',
        notes: ''
      });
    }
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      client_name: proj.client_name,
      client_phone: proj.client_phone,
      client_email: proj.client_email || '',
      company: proj.company || '',
      project_title: proj.project_title,
      service_type: proj.service_type || 'ecommerce',
      stage: proj.stage || 'in_development',
      total_price: proj.total_price || 0,
      deposit_paid: proj.deposit_paid || 0,
      mid_payment: proj.mid_payment || 0,
      final_payment: proj.final_payment || 0,
      domain_name: proj.domain_name || '',
      domain_expires_at: proj.domain_expires_at ? proj.domain_expires_at.split('T')[0] : '',
      hosting_plan: proj.hosting_plan || '',
      hosting_expires_at: proj.hosting_expires_at ? proj.hosting_expires_at.split('T')[0] : '',
      live_url: proj.live_url || '',
      notes: proj.notes || ''
    });
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`/api/admin/tech-projects/${editingProject.id}`, projectForm);
      } else {
        await axios.post('/api/admin/tech-projects', projectForm);
      }
      setProjectModalOpen(false);
      fetchData();
    } catch (err) {
      alert('خطأ في حفظ المشروع: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleChangeStage = async (projectId, nextStage) => {
    try {
      await axios.put(`/api/admin/tech-projects/${projectId}`, { stage: nextStage });
      setProjects(projects.map(p => p.id === projectId ? { ...p, stage: nextStage } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع نهائياً؟')) return;
    try {
      await axios.delete(`/api/admin/tech-projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── QUOTATION BUILDER HANDLERS ────────────────────────────
  const handleOpenNewQuote = (lead = null) => {
    if (lead) {
      setQuoteForm({
        client_name: lead.name || '',
        client_phone: lead.phone || '',
        client_email: lead.email || '',
        company: lead.company || '',
        project_title: `عرض سعر تطوير: ${lead.service || 'متجر إلكتروني متكامل'}`,
        service_type: 'ecommerce',
        scope_items: [
          { title: `برمجة وتصميم ${lead.service || 'النظام'}`, desc: 'واجهات مستخدم فاخرة ومتوافقة مع الهواتف الذكية', price: 650 },
          { title: 'ربط بوابات الدفع والفواتير الضريبية QR', desc: 'تكامل كليك وفيزا وفواتير معتمدة', price: 250 },
          { title: 'لوحة تحكم ERP والمستودعات', desc: 'إدارة شاملة مع تقارير مبيعات سحابية', price: 300 }
        ],
        discount_amount: 100,
        payment_terms: '50% دفعة أولى عند توقيع العقد، 25% عند اكتمال التصميم، 25% عند التسليم والتشغيل.',
        timeline_days: '7 - 14 يوم عمل',
        warranty_months: 12,
        notes: 'يشمل العرض حجز الدومين والاستضافة السحابية للسنة الأولى مجاناً مع دعم فني 24/7.'
      });
    }
    setQuoteModalOpen(true);
  };

  const handleAddScopeItem = () => {
    setQuoteForm({
      ...quoteForm,
      scope_items: [...quoteForm.scope_items, { title: '', desc: '', price: 100 }]
    });
  };

  const handleRemoveScopeItem = (idx) => {
    setQuoteForm({
      ...quoteForm,
      scope_items: quoteForm.scope_items.filter((_, i) => i !== idx)
    });
  };

  const handleScopeChange = (idx, field, value) => {
    const updated = [...quoteForm.scope_items];
    updated[idx][field] = field === 'price' ? Number(value) : value;
    setQuoteForm({ ...quoteForm, scope_items: updated });
  };

  const calculateQuoteSubtotal = () => {
    return quoteForm.scope_items.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  };

  const calculateQuoteFinal = () => {
    const sub = calculateQuoteSubtotal();
    const disc = Number(quoteForm.discount_amount) || 0;
    return Math.max(0, sub - disc);
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    const sub = calculateQuoteSubtotal();
    const fin = calculateQuoteFinal();
    try {
      const res = await axios.post('/api/admin/tech-quotations', {
        ...quoteForm,
        total_amount: sub,
        final_amount: fin
      });
      setQuoteModalOpen(false);
      fetchData();
      if (res.data?.quote_number) {
        alert(`تم إنشاء عرض السعر بنجاح برقم: ${res.data.quote_number}`);
      }
    } catch (err) {
      alert('خطأ في توليد عرض السعر: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف عرض السعر؟')) return;
    try {
      await axios.delete(`/api/admin/tech-quotations/${id}`);
      setQuotations(quotations.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── WHATSAPP SENDERS ──────────────────────────────────────
  const sendWhatsAppQuote = (q) => {
    const itemsText = (q.scope_items || []).map((it, idx) => `  ${idx + 1}. ${it.title} (${it.price} د.أ)`).join('\n');
    const msg = `مرحباً أستاذ ${q.client_name} 🌸✨
يسر فريق *زهرة بيسان للحلول الرقمية وتكنولوجيا المعلومات* أن يقدّم لكم عرض السعر الرسمي لمشروعكم:

📋 *المشروع:* ${q.project_title}
🔢 *رقم العرض:* ${q.quote_number}
💰 *إجمالي الاستثمار:* ${q.final_amount} دينار أردني (شامل الضمان السنوي 12 شهراً)

🛠️ *أبرز بنود العمل:*
${itemsText}

⏱️ *مدة التنفيذ:* ${q.timeline_days}
💳 *شروط الدفع:* ${q.payment_terms}

يسعدنا بدء التجهيز فور اعتمادكم للعرض! 🚀`;

    const cleanPhone = (q.client_phone || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendWhatsAppRenewalAlert = (proj) => {
    const cleanPhone = (proj.client_phone || '').replace(/[^0-9]/g, '');
    const msg = `مرحباً أستاذ ${proj.client_name} 🌸
نود إعلامكم بقرب موعد تجديد اشتراك السيرفر والنطاق التابع لمنظومتكم:

🌐 *النطاق:* ${proj.domain_name || proj.project_title}
☁️ *خطة الاستضافة:* ${proj.hosting_plan}
⏳ *تاريخ الانتهاء:* ${proj.domain_expires_at ? proj.domain_expires_at.split('T')[0] : 'قريباً'}

يرجى تأكيد التجديد لضمان استمرارية عمل المنظومة دون أي انقطاع. دمتم بخير! ✨`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ─── PAYMENT RECORDING ─────────────────────────────────────
  const handleOpenPayment = (proj) => {
    setPayingProject(proj);
    setPaymentModalOpen(true);
  };

  const handleUpdatePayments = async (e) => {
    e.preventDefault();
    try {
      const tot = Number(payingProject.total_price) || 0;
      const dep = Number(payingProject.deposit_paid) || 0;
      const mid = Number(payingProject.mid_payment) || 0;
      const fin = Number(payingProject.final_payment) || 0;
      const collected = dep + mid + fin;
      const status = collected >= tot ? 'paid' : (collected > 0 ? 'partial' : 'unpaid');

      await axios.put(`/api/admin/tech-projects/${payingProject.id}`, {
        deposit_paid: dep,
        mid_payment: mid,
        final_payment: fin,
        payment_status: status
      });
      setPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      alert('خطأ في تحديث الدفعات: ' + err.message);
    }
  };

  // Filtered lists
  const filteredProjects = projects.filter(p => {
    const matchSearch = (p.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.client_phone || '').includes(searchTerm) ||
                        (p.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.project_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = stageFilter === 'all' || p.stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="dashboard-fade-in" style={{ padding: '24px', minHeight: '100vh', maxWidth: '1440px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#b8943a', lineHeight: 1 }}>Zahrat Beesan</span>
            <span style={{ fontSize: '1.8rem', color: 'var(--admin-text, #111)', fontStyle: 'italic', fontWeight: 800 }}>Tech Agency ERP</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', color: 'var(--admin-text, #111)', margin: 0, fontWeight: 900 }}>
            💻 منظومة إدارة المشاريع البرمجية، عروض الأسعار، وتجديد السيرفرات
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenNewProject()}
            style={{
              background: 'linear-gradient(135deg, #b8943a 0%, #9a7a2e 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(184,148,58,0.3)'
            }}
          >
            <Plus size={18} /> + مشروع جديد
          </button>

          <button
            onClick={() => handleOpenNewQuote()}
            style={{
              background: '#111111',
              color: '#ffffff',
              border: '1px solid #b8943a',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileText size={18} color="#b8943a" /> + إنشاء عرض سعر
          </button>

          <a 
            href="/tech" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: 'var(--admin-card, #ffffff)',
              color: 'var(--admin-text, #111)',
              border: '1px solid var(--admin-border, #e8e2d5)',
              padding: '10px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ExternalLink size={16} color="#b8943a" /> معاينة /tech
          </a>
        </div>
      </div>

      {/* ── TOP KPI SUMMARY CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>المشاريع النشطة</span>
            <Code2 size={18} color="#b8943a" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--admin-text, #111)', marginTop: '6px' }}>
            {projects.filter(p => p.stage !== 'completed').length} <small style={{ fontSize: '0.85rem', color: '#10b981' }}>مشروع قيد العمل</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>قيمة خط المشاريع (Pipeline)</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
            {projects.reduce((acc, p) => acc + Number(p.total_price || 0), 0).toLocaleString()} <small style={{ fontSize: '0.85rem', color: '#777' }}>د.أ</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>عروض الأسعار المصدرة</span>
            <FileText size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6366f1', marginTop: '6px' }}>
            {quotations.length} <small style={{ fontSize: '0.85rem', color: '#777' }}>عرض رسمي</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>تجديدات السيرفرات القادمة</span>
            <Server size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', marginTop: '6px' }}>
            {projects.filter(p => p.domain_days_left !== null && p.domain_days_left <= 45).length} <small style={{ fontSize: '0.85rem', color: '#777' }}>خلال 45 يوماً</small>
          </div>
        </div>
      </div>

      {/* ── MAIN MODULES TABS ── */}
      <div style={{
        background: 'var(--admin-card, #ffffff)',
        border: '1px solid var(--admin-border, #e8e2d5)',
        borderRadius: '20px',
        padding: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'kanban', label: '📋 مراحل المشاريع (Kanban Board)', count: projects.length },
          { id: 'quotes', label: '📄 عروض الأسعار والعقود (Quotations)', count: quotations.length },
          { id: 'servers', label: '🌐 السيرفرات والدومينات (Hosting & Domains)', count: projects.filter(p => p.domain_name).length },
          { id: 'payments', label: '💰 الدفعات والتحصيل المالي (Payments)', count: projects.length },
          { id: 'leads', label: '📥 طلبات واستشارات العملاء (Tech Leads)', count: leads.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              background: activeTab === t.id ? '#111111' : 'transparent',
              color: activeTab === t.id ? '#ffffff' : 'var(--admin-text, #444)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>{t.label}</span>
            <span style={{
              background: activeTab === t.id ? '#b8943a' : 'rgba(0,0,0,0.06)',
              color: activeTab === t.id ? '#fff' : '#666',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.74rem'
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: KANBAN PIPELINE BOARD
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'kanban' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', alignItems: 'start' }}>
            {STAGES.map(stage => {
              const stageProjects = projects.filter(p => p.stage === stage.id);
              const StageIcon = stage.icon;

              return (
                <div key={stage.id} style={{
                  background: 'var(--admin-card, #ffffff)',
                  border: '1px solid var(--admin-border, #e8e2d5)',
                  borderRadius: '20px',
                  padding: '16px',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Column Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    marginBottom: '14px',
                    borderBottom: '1px solid var(--admin-border, #f0ece3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: stage.bg, color: stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StageIcon size={16} />
                      </div>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--admin-text, #111)' }}>{stage.title}</strong>
                    </div>
                    <span style={{ background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem' }}>
                      {stageProjects.length}
                    </span>
                  </div>

                  {/* Project Cards in Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {stageProjects.map(proj => {
                      const total = Number(proj.total_price) || 0;
                      const paid = (Number(proj.deposit_paid) || 0) + (Number(proj.mid_payment) || 0) + (Number(proj.final_payment) || 0);
                      const rem = Math.max(0, total - paid);

                      return (
                        <div key={proj.id} style={{
                          background: 'var(--admin-bg, #fafaf7)',
                          border: '1px solid var(--admin-border, #e8e2d5)',
                          borderRadius: '16px',
                          padding: '14px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--admin-text, #111)' }}>{proj.project_title}</strong>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleEditProject(proj)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b8943a' }}>
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                            👤 {proj.client_name} {proj.company && `• ${proj.company}`}
                          </div>

                          {/* Price & Balance */}
                          <div style={{ background: '#fff', border: '1px solid #e8e2d5', borderRadius: '10px', padding: '8px 10px', marginBottom: '10px', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span>الإجمالي: <strong>{total} د.أ</strong></span>
                              <span style={{ color: '#10b981', fontWeight: 800 }}>المحصل: {paid} د.أ</span>
                            </div>
                            {rem > 0 && (
                              <div style={{ color: '#ef4444', fontWeight: 700, textAlign: 'left', direction: 'ltr' }}>
                                Remaining: {rem} JOD
                              </div>
                            )}
                          </div>

                          {/* Stage Mover Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                            <a
                              href={`https://wa.me/${(proj.client_phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${proj.client_name} 🌸 بخصوص مشروع ${proj.project_title}...`)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ background: '#25D366', color: '#fff', padding: '5px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <MessageSquare size={13} /> واتساب
                            </a>

                            <select
                              value={proj.stage}
                              onChange={(e) => handleChangeStage(proj.id, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #e8e2d5', fontSize: '0.75rem', fontWeight: 700, background: '#fff' }}
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {stageProjects.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 10px', color: '#aaa', fontSize: '0.82rem', border: '1px dashed #e8e2d5', borderRadius: '14px' }}>
                        لا توجد مشاريع في هذه المرحلة
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: QUOTATIONS & PROPOSALS GENERATOR
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'quotes' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              📄 عروض الأسعار والعقود الرسمية المصدرة للعملاء
            </h3>
            <button onClick={() => handleOpenNewQuote()} style={{ background: '#b8943a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
              + إنشاء عرض سعر جديد
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8e2d5', color: '#666', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 14px' }}>رقم العرض</th>
                  <th style={{ padding: '12px 14px' }}>العميل / الشركة</th>
                  <th style={{ padding: '12px 14px' }}>المشروع</th>
                  <th style={{ padding: '12px 14px' }}>المبلغ الصافي</th>
                  <th style={{ padding: '12px 14px' }}>الحالة</th>
                  <th style={{ padding: '12px 14px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f0ece3', fontSize: '0.88rem' }}>
                    <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#b8943a' }}>{q.quote_number}</td>
                    <td style={{ padding: '14px' }}>
                      <strong>{q.client_name}</strong>
                      {q.company && <div style={{ fontSize: '0.75rem', color: '#777' }}>🏢 {q.company}</div>}
                    </td>
                    <td style={{ padding: '14px' }}>{q.project_title}</td>
                    <td style={{ padding: '14px', fontWeight: 800, color: '#10b981' }}>{q.final_amount} د.أ</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        background: q.status === 'accepted' ? '#d1fae5' : (q.status === 'sent' ? '#e0e7ff' : '#f3f4f6'),
                        color: q.status === 'accepted' ? '#059669' : (q.status === 'sent' ? '#4f46e5' : '#4b5563'),
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}>
                        {q.status === 'accepted' ? 'معتمد وموافق عليه' : (q.status === 'sent' ? 'مرسل للعميل' : 'مسودة')}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setPreviewQuote(q)}
                          style={{ background: '#fafaf7', border: '1px solid #e8e2d5', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="معاينة وطباعة رسمية"
                        >
                          <Printer size={14} /> طباعة
                        </button>
                        <button
                          onClick={() => sendWhatsAppQuote(q)}
                          style={{ background: '#25D366', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="إرسال عبر الواتساب"
                        >
                          <Send size={13} /> إرسال واتساب
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 3: SERVERS, HOSTING & DOMAIN RENEWALS
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'servers' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px' }}>
            🌐 متابعة تجديد النطاقات والسيرفرات السحابية للعملاء
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8e2d5', color: '#666', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 14px' }}>المشروع / العميل</th>
                  <th style={{ padding: '12px 14px' }}>اسم النطاق (Domain)</th>
                  <th style={{ padding: '12px 14px' }}>خطة الاستضافة السحابية</th>
                  <th style={{ padding: '12px 14px' }}>تاريخ الانتهاء</th>
                  <th style={{ padding: '12px 14px' }}>المدة المتبقية</th>
                  <th style={{ padding: '12px 14px' }}>تذكير التجديد</th>
                </tr>
              </thead>
              <tbody>
                {projects.filter(p => p.domain_name || p.hosting_plan).map(p => {
                  const days = p.domain_days_left !== null && p.domain_days_left !== undefined ? p.domain_days_left : 999;
                  const isExpiring = days <= 30;
                  const isExpired = days < 0;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0ece3', fontSize: '0.88rem' }}>
                      <td style={{ padding: '14px' }}>
                        <strong>{p.project_title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#777' }}>👤 {p.client_name} ({p.client_phone})</div>
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, direction: 'ltr', textAlign: 'right', color: '#3b82f6' }}>
                        {p.domain_name ? <a href={`https://${p.domain_name}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{p.domain_name} ↗</a> : '—'}
                      </td>
                      <td style={{ padding: '14px' }}>{p.hosting_plan || 'سيرفر سحابي مخصص'}</td>
                      <td style={{ padding: '14px' }}>{p.domain_expires_at ? p.domain_expires_at.split('T')[0] : '—'}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          background: isExpired ? '#fee2e2' : (isExpiring ? '#fef3c7' : '#d1fae5'),
                          color: isExpired ? '#dc2626' : (isExpiring ? '#d97706' : '#059669'),
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}>
                          {isExpired ? '🔴 منتهي الصلاحية' : (isExpiring ? `⏳ باقي ${days} يوماً (عاجل)` : `🟢 باقي ${days} يوماً`)}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => sendWhatsAppRenewalAlert(p)}
                          style={{ background: '#25D366', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MessageSquare size={13} /> إرسال تذكير تجديد
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 4: FINANCIAL PAYMENTS & MILESTONES
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px' }}>
            💰 سجل تحصيل الدفعات المالية والأقساط
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8e2d5', color: '#666', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 14px' }}>المشروع والعميل</th>
                  <th style={{ padding: '12px 14px' }}>المبلغ الإجمالي</th>
                  <th style={{ padding: '12px 14px' }}>الدفعة 1 (العربون)</th>
                  <th style={{ padding: '12px 14px' }}>الدفعة 2 (التصميم)</th>
                  <th style={{ padding: '12px 14px' }}>الدفعة 3 (التسليم)</th>
                  <th style={{ padding: '12px 14px' }}>المتبقي</th>
                  <th style={{ padding: '12px 14px' }}>الحالة</th>
                  <th style={{ padding: '12px 14px' }}>تسجيل دفعة</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const tot = Number(p.total_price) || 0;
                  const dep = Number(p.deposit_paid) || 0;
                  const mid = Number(p.mid_payment) || 0;
                  const fin = Number(p.final_payment) || 0;
                  const paid = dep + mid + fin;
                  const rem = Math.max(0, tot - paid);

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0ece3', fontSize: '0.88rem' }}>
                      <td style={{ padding: '14px' }}>
                        <strong>{p.project_title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#777' }}>👤 {p.client_name}</div>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800 }}>{tot} د.أ</td>
                      <td style={{ padding: '14px', color: dep > 0 ? '#10b981' : '#aaa' }}>{dep} د.أ</td>
                      <td style={{ padding: '14px', color: mid > 0 ? '#10b981' : '#aaa' }}>{mid} د.أ</td>
                      <td style={{ padding: '14px', color: fin > 0 ? '#10b981' : '#aaa' }}>{fin} د.أ</td>
                      <td style={{ padding: '14px', fontWeight: 800, color: rem > 0 ? '#ef4444' : '#10b981' }}>{rem} د.أ</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          background: rem === 0 ? '#d1fae5' : (paid > 0 ? '#fef3c7' : '#fee2e2'),
                          color: rem === 0 ? '#059669' : (paid > 0 ? '#d97706' : '#dc2626'),
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.75rem'
                        }}>
                          {rem === 0 ? 'مسدد بالكامل ✓' : (paid > 0 ? 'مسدد جزئياً' : 'غير مسدد')}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => handleOpenPayment(p)}
                          style={{ background: '#111', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          + تعديل الدفعات
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 5: TECH LEADS & INQUIRIES
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'leads' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              📥 طلبات عروض الأسعار والاستشارات من الموقع والـ AI
            </h3>
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #e8e2d5', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leads.map(lead => (
              <div key={lead.id} style={{ background: '#fafaf7', border: '1px solid #e8e2d5', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#111' }}>{lead.name}</strong>
                    {lead.company && <span style={{ fontSize: '0.75rem', background: '#f0ece3', padding: '2px 8px', borderRadius: '6px' }}>🏢 {lead.company}</span>}
                    <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{lead.service || 'طلب استشارة'}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#555', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>📞 <a href={`tel:${lead.phone}`} style={{ color: 'inherit', fontWeight: 700, direction: 'ltr' }}>{lead.phone}</a></span>
                    {lead.budget && <span>💰 الميزانية: <strong>{lead.budget}</strong></span>}
                    <span>⏱️ {new Date(lead.created_at || Date.now()).toLocaleDateString('ar-JO')}</span>
                  </div>
                  {lead.details && <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#444' }}>📝 {lead.details}</p>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenNewProject(lead)}
                    style={{ background: '#b8943a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    🚀 تحويل إلى مشروع بالكانبان
                  </button>
                  <button
                    onClick={() => handleOpenNewQuote(lead)}
                    style={{ background: '#111', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    📄 إنشاء عرض سعر
                  </button>
                  <a
                    href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${lead.name} 🌸 معك فريق زهرة بيسان للحلول الرقمية...`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: '#25D366', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> واتساب
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: ADD / EDIT PROJECT
          ═════════════════════════════════════════════════════════ */}
      {projectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid #e8e2d5', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                {editingProject ? '✏️ تعديل بيانات المشروع البرمجي' : '🚀 إضافة مشروع برمجي جديد'}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.client_name}
                    onChange={e => setProjectForm({ ...projectForm, client_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.client_phone}
                    onChange={e => setProjectForm({ ...projectForm, client_phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', direction: 'ltr' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>اسم الشركة / المتجر</label>
                  <input
                    type="text"
                    value={projectForm.company}
                    onChange={e => setProjectForm({ ...projectForm, company: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>عنوان المشروع *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.project_title}
                    onChange={e => setProjectForm({ ...projectForm, project_title: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>مرحلة المشروع (Stage)</label>
                  <select
                    value={projectForm.stage}
                    onChange={e => setProjectForm({ ...projectForm, stage: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>المبلغ الكلي (JOD) *</label>
                  <input
                    type="number"
                    value={projectForm.total_price}
                    onChange={e => setProjectForm({ ...projectForm, total_price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>الدفعة 1 (العربون)</label>
                  <input
                    type="number"
                    value={projectForm.deposit_paid}
                    onChange={e => setProjectForm({ ...projectForm, deposit_paid: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>الدفعة 2 (التصميم)</label>
                  <input
                    type="number"
                    value={projectForm.mid_payment}
                    onChange={e => setProjectForm({ ...projectForm, mid_payment: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>الدفعة 3 (التسليم)</label>
                  <input
                    type="number"
                    value={projectForm.final_payment}
                    onChange={e => setProjectForm({ ...projectForm, final_payment: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>اسم النطاق (Domain Name)</label>
                  <input
                    type="text"
                    placeholder="mybrand.com"
                    value={projectForm.domain_name}
                    onChange={e => setProjectForm({ ...projectForm, domain_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', direction: 'ltr' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>تاريخ انتهاء الدومين / الاستضافة</label>
                  <input
                    type="date"
                    value={projectForm.domain_expires_at}
                    onChange={e => setProjectForm({ ...projectForm, domain_expires_at: e.target.value, hosting_expires_at: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #b8943a, #9a7a2e)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                💾 حفظ وتحديث المشروع
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: CREATE QUOTATION
          ═════════════════════════════════════════════════════════ */}
      {quoteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', padding: '28px', border: '1px solid #e8e2d5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                📄 منشئ عروض الأسعار والعقود الرسمية
              </h3>
              <button onClick={() => setQuoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.client_name}
                    onChange={e => setQuoteForm({ ...quoteForm, client_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.client_phone}
                    onChange={e => setQuoteForm({ ...quoteForm, client_phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', direction: 'ltr' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>موضوع / عنوان العرض *</label>
                <input
                  type="text"
                  required
                  value={quoteForm.project_title}
                  onChange={e => setQuoteForm({ ...quoteForm, project_title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                />
              </div>

              {/* Scope Items */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#b8943a' }}>✦ بنود ونطاق العمل (Scope of Work):</label>
                  <button type="button" onClick={handleAddScopeItem} style={{ background: '#fdfaf4', border: '1px solid #b8943a', color: '#b8943a', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    + إضافة بند
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {quoteForm.scope_items.map((it, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', alignItems: 'center', background: '#fafaf7', padding: '8px 10px', borderRadius: '10px', border: '1px solid #f0ece3' }}>
                      <input
                        type="text"
                        placeholder="عنوان البند والمخرجات..."
                        value={it.title}
                        onChange={e => handleScopeChange(idx, 'title', e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                      />
                      <input
                        type="number"
                        placeholder="السعر د.أ"
                        value={it.price}
                        onChange={e => handleScopeChange(idx, 'price', e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                      />
                      <button type="button" onClick={() => handleRemoveScopeItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Discount Calculation */}
              <div style={{ background: '#fdfaf4', border: '1px solid #f2e3c6', borderRadius: '14px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#777' }}>المجموع الفرعي: <strong>{calculateQuoteSubtotal()} د.أ</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#555' }}>الخصم الممنوح:</span>
                    <input
                      type="number"
                      value={quoteForm.discount_amount}
                      onChange={e => setQuoteForm({ ...quoteForm, discount_amount: Number(e.target.value) })}
                      style={{ width: '80px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e8e2d5' }}
                    />
                    <span style={{ fontSize: '0.82rem' }}>د.أ</span>
                  </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', color: '#777' }}>الإجمالي النهائي:</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{calculateQuoteFinal()} د.أ</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>شروط الدفع والجدول الزمني</label>
                <textarea
                  rows={2}
                  value={quoteForm.payment_terms}
                  onChange={e => setQuoteForm({ ...quoteForm, payment_terms: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #111111, #333333)',
                  color: '#ffffff',
                  border: '1px solid #b8943a',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                📄 توليد وحفظ عرض السعر الرسمي ←
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: OFFICIAL PRINTABLE QUOTATION VIEW
          ═════════════════════════════════════════════════════════ */}
      {previewQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', width: '90%', maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto', padding: '36px', border: '1px solid #e8e2d5', color: '#111' }}>
            
            {/* Quotation Official Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #b8943a', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 900, color: '#111' }}>زهرة بيسان للحلول الرقمية وتكنولوجيا المعلومات</h2>
                <div style={{ fontSize: '0.8rem', color: '#b8943a', fontWeight: 700, letterSpacing: '1px' }}>ZAHRAT BEESAN TECH SOLUTIONS — AMMAN, JORDAN</div>
                <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '4px' }}>📞 0796697413 | 🌐 zahratbeesan.com/tech</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ background: '#fdfaf4', border: '1px solid #b8943a', padding: '6px 14px', borderRadius: '8px', fontWeight: 900, fontSize: '0.92rem', color: '#b8943a', fontFamily: 'monospace' }}>
                  {previewQuote.quote_number}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#777', marginTop: '4px' }}>
                  التاريخ: {new Date(previewQuote.created_at || Date.now()).toLocaleDateString('ar-JO')}
                </div>
              </div>
            </div>

            {/* Client Card in Quotation */}
            <div style={{ background: '#fafaf7', border: '1px solid #e8e2d5', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#777' }}>السيد / السادة المحترمون:</span>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: '2px' }}>{previewQuote.client_name}</div>
                {previewQuote.company && <div style={{ fontSize: '0.82rem', color: '#555' }}>🏢 {previewQuote.company}</div>}
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#777' }}>موضوع العرض:</span>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px', color: '#b8943a' }}>{previewQuote.project_title}</div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#111', color: '#fff', fontSize: '0.85rem' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>بيان المخرجات ونطاق العمل</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>القيمة (د.أ)</th>
                </tr>
              </thead>
              <tbody>
                {(previewQuote.scope_items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee', fontSize: '0.88rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#b8943a' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong>{it.title}</strong>
                      {it.desc && <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>{it.desc}</div>}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'left' }}>{it.price} د.أ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div style={{ background: '#fdfaf4', border: '1px solid #f2e3c6', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: '#777' }}>مدة التنفيذ: <strong>{previewQuote.timeline_days}</strong></div>
                <div style={{ fontSize: '0.82rem', color: '#777', marginTop: '4px' }}>فترة الضمان والصيانة: <strong>{previewQuote.warranty_months} شهراً شاملاً</strong></div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.82rem', color: '#777' }}>الصافي النهائي للاستثمار:</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{previewQuote.final_amount} د.أ</div>
              </div>
            </div>

            {/* Stamp & Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => window.print()}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={16} /> طباعة رسمية / PDF
              </button>

              <button
                onClick={() => setPreviewQuote(null)}
                style={{ background: '#fafaf7', border: '1px solid #e8e2d5', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                إغلاق المعاينة
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: PAYMENT RECORDER
          ═════════════════════════════════════════════════════════ */}
      {paymentModalOpen && payingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '480px', padding: '24px', border: '1px solid #e8e2d5' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.2rem', fontWeight: 900 }}>
              💰 تسجيل وتعديل دفعات: {payingProject.project_title}
            </h3>

            <form onSubmit={handleUpdatePayments} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>المبلغ الإجمالي للمشروع</label>
                <input
                  type="number"
                  value={payingProject.total_price}
                  onChange={e => setPayingProject({ ...payingProject, total_price: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>الدفعة 1 (العربون 50%)</label>
                <input
                  type="number"
                  value={payingProject.deposit_paid}
                  onChange={e => setPayingProject({ ...payingProject, deposit_paid: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>الدفعة 2 (التصميم 25%)</label>
                <input
                  type="number"
                  value={payingProject.mid_payment}
                  onChange={e => setPayingProject({ ...payingProject, mid_payment: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>الدفعة 3 (التسليم النهائي 25%)</label>
                <input
                  type="number"
                  value={payingProject.final_payment}
                  onChange={e => setPayingProject({ ...payingProject, final_payment: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e2d5' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#b8943a', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                  حفظ الدفعات
                </button>
                <button type="button" onClick={() => setPaymentModalOpen(false)} style={{ background: '#f5f5f5', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
