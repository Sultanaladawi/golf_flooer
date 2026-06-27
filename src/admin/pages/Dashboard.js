import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminContext } from '../AdminContext';
import { useAdminLang } from '../AdminLangContext';
import { 
  ShoppingBag, LayoutGrid, DollarSign, AlertTriangle, 
  TrendingUp, Clock, Zap, Activity, Users, 
  ChevronRight, Calendar, Bell, ShieldCheck, Coffee, Search, Terminal, Cpu
} from 'lucide-react';

const Dashboard = () => {
  const { admin } = useAdminContext();
  const { t, lang } = useAdminLang();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    todaySales: 0,
    todayOrders: 0,
    storeStatus: 'unknown',
    storeMode: 'auto',
    lowStock: 0,
    lowStockItems: [],
    dailySales: [],
    topProducts: [],
    totalProfit: 0,
    todayProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const theme = {
    bg: 'var(--admin-bg)',
    card: 'var(--admin-card)',
    accent: 'var(--admin-accent)',
    border: 'var(--admin-border)',
    text: 'var(--admin-text)',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    danger: '#ef4444'
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard-stats');
      const incomingData = response.data.data || response.data;
      
      const last7Days = [];
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        
        const realData = (incomingData.dailySales || []).find(item => {
           const itemDateStr = formatDate(item.date);
           return itemDateStr === dateStr;
        });

        last7Days.push({
          day: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short' }).toUpperCase(),
          total: realData ? parseFloat(realData.total) : 0,
          isToday: i === 0,
          fullDate: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short' })
        });
      }

      setStats({
        totalProducts: incomingData.totalProducts || 0,
        totalOrders: incomingData.totalOrders || 0,
        totalSales: parseFloat(incomingData.totalSales || 0),
        todaySales: incomingData.todaySales || 0,
        todayOrders: incomingData.todayOrders || 0,
        storeStatus: incomingData.storeStatus || 'unknown',
        storeMode: incomingData.storeMode || 'auto',
        lowStock: incomingData.lowStock || 0,
        lowStockItems: incomingData.lowStockItems || [],
        dailySales: last7Days,
        topProducts: incomingData.topProducts || [],
        totalProfit: parseFloat(incomingData.totalProfit || 0),
        todayProfit: parseFloat(incomingData.todayProfit || 0)
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard API Error:", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const poll = setInterval(fetchDashboardData, 30000);
    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, []);

  const cards = [
    { title: t('Gross Revenue'), value: `JOD ${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: theme.accent, desc: t('Real-time valuation'), path: '/admin/orders' },
    { title: t('Active Orders'), value: stats.totalOrders, icon: ShoppingBag, color: theme.info, desc: t('System processing'), path: '/admin/orders' },
    { title: t('Catalog Density'), value: stats.totalProducts, icon: LayoutGrid, color: theme.success, desc: t('Menu items verified'), path: '/admin/products' },
    { title: t('Logistics Risk'), value: stats.lowStock, icon: AlertTriangle, color: theme.danger, desc: stats.lowStock > 0 ? t('CRITICAL ALERT') : t('SUPPLY STABLE'), path: '/admin/inventory' },
    { title: t('Best Seller'), value: stats.topProducts[0]?.item_name || t('None'), icon: Zap, color: '#ff9a9e', desc: `${stats.topProducts[0]?.total_sold || 0} ${t('Sold')} (JOD ${parseFloat(stats.topProducts[0]?.revenue || 0).toFixed(2)})`, path: '/admin/analytics' },
    { title: t('Net Profit'), value: `JOD ${stats.totalProfit.toFixed(2)}`, icon: TrendingUp, color: '#4ade80', desc: `${t('Today')}: JOD ${stats.todayProfit.toFixed(2)}`, path: '/admin/products' },
  ];

  const maxSales = Math.max(...stats.dailySales.map(d => d.total), 1);

  return (
    <div className="dashboard-container" style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif", color: theme.text, position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;700;900&display=swap');
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.15; animation: float 25s infinite alternate ease-in-out; }
        .orb-1 { width: 600px; height: 600px; background: ${theme.accent}; top: -200px; right: -100px; }
        .orb-2 { width: 500px; height: 500px; background: #e8e2d4; bottom: -100px; left: -100px; }
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }
        
        .stat-card { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 18px; padding: 20px; transition: 0.4s; position: relative; z-index: 1; backdrop-filter: blur(10px); cursor: pointer; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .stat-card:hover { transform: translateY(-5px); border-color: ${theme.accent}; background: rgba(166, 134, 93, 0.02); box-shadow: 0 15px 35px rgba(166, 134, 93, 0.1); }
        
        .chart-container { background: ${theme.card}; border: 1px solid ${theme.border}; border-radius: 35px; padding: 40px; position: relative; z-index: 1; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 10px; position: relative; cursor: pointer; }
        .bar-tooltip { position: absolute; top: -30px; background: ${theme.accent}; color: #fff; padding: 5px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 900; opacity: 0; transition: 0.3s; pointer-events: none; white-space: nowrap; z-index: 10; }
        .bar-wrapper:hover .bar-tooltip { opacity: 1; transform: translateY(-10px); }
        .bar-fill { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .bar-wrapper:hover .bar-fill {
          transform: translateY(-8px) scaleX(1.05);
          background: linear-gradient(180deg, #c4a484, #8c6a56) !important;
          box-shadow: 0 10px 28px rgba(196, 164, 132, 0.5) !important;
          border: 1px solid rgba(196, 164, 132, 0.7) !important;
        }
        .terminal-box { background: var(--bg-surface); border: 1px solid ${theme.border}; border-radius: 25px; padding: 25px; font-family: 'Inter', monospace; font-size: 0.8rem; color: var(--text-secondary); }
        
        .page-badge { background: var(--bg-surface); border: 1px solid ${theme.border}; padding: 12px 25px; border-radius: 18px; display: inline-flex; align-items: center; gap: 12px; margin: 20px 0; }
        .page-badge span { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 900; color: ${theme.text}; letter-spacing: -0.5px; }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 15px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 10px;
        }
        .status-open { background: rgba(196, 164, 132, 0.1); color: #c4a484; border: 1px solid rgba(196, 164, 132, 0.2); }
        .status-closed { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }
        .status-auto { background: rgba(56, 239, 125, 0.1); color: #38ef7d; border: 1px solid rgba(56, 239, 125, 0.2); }
        .pulse { width: 8px; height: 8px; border-radius: 50%; }
        .pulse-open { background: #c4a484; box-shadow: 0 0 10px #c4a484; animation: pulse-beige 2s infinite; }
        .pulse-closed { background: #ff4d4d; box-shadow: 0 0 10px #ff4d4d; animation: pulse-red 2s infinite; }
        .pulse-auto { background: #38ef7d; box-shadow: 0 0 10px #38ef7d; animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(56, 239, 125, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(56, 239, 125, 0); } 100% { box-shadow: 0 0 0 0 rgba(56, 239, 125, 0); } }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .dashboard-container { padding: 20px !important; }
          .header-title { font-size: 2rem !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .page-badge span { font-size: 1.4rem !important; }
          .stat-card { padding: 20px !important; }
          .chart-container { padding: 25px !important; }
          .bar-wrapper { gap: 5px !important; }
          .bar-wrapper span { font-size: 0.6rem !important; }
          .minimal-clock { position: static !important; text-align: left !important; margin-top: 15px; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '50px' }}>
        <div className="header-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: theme.accent, lineHeight: 1 }}>
          <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>
        </div>

        <div className="page-badge">
          <Activity size={28} color={theme.accent} />
          <span>{t('Operational Dashboard')}</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '5px' }}>
          {t('Real-time analytics and system performance monitoring.')}
        </p>

        {/* Real-time Summary Cards */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '10px 20px', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.6rem', color: theme.success, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Today's Revenue")}</div>
            <div style={{ fontSize: '1.2rem', color: theme.text, fontWeight: '900' }}>JOD {parseFloat(stats.todaySales || 0).toFixed(2)}</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: '10px 20px', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.6rem', color: theme.info, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{t("Today's Orders")}</div>
            <div style={{ fontSize: '1.2rem', color: theme.text, fontWeight: '900' }}>{stats.todayOrders || 0}</div>
          </div>
        </div>

        <div className={`status-badge ${stats.storeMode === 'auto' ? 'status-auto' : (stats.storeMode === 'manual_open' ? 'status-open' : 'status-closed')}`}>
          <div className={`pulse ${stats.storeMode === 'auto' ? 'pulse-auto' : (stats.storeMode === 'manual_open' ? 'pulse-open' : 'pulse-closed')}`} />
          {stats.storeMode === 'auto' 
            ? `${t('AUTO MODE:')} ${stats.storeStatus.toUpperCase()}` 
            : `${t('MANUAL:')} ${stats.storeStatus.toUpperCase()}`}
        </div>

        {/* Minimal Clock */}
        <div className="minimal-clock" style={{ position: 'absolute', top: 0, insetInlineEnd: 0, textAlign: 'end' }}>
            <div style={{ color: theme.accent, fontSize: '1rem', fontWeight: 900, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> 
              <span dir="ltr">
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()}
              </span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '15px', 
        marginBottom: '40px', 
        position: 'relative', 
        zIndex: 1 
      }}>
        {cards.map((c, i) => (
          <div key={i} className="stat-card" onClick={() => navigate(c.path)}>
            <div style={{ background: `${c.color}22`, color: c.color, padding: '12px', borderRadius: '15px', width: 'fit-content', marginBottom: '20px', border: `1px solid ${c.color}33` }}>
              <c.icon size={22} />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '2px', textTransform: 'uppercase' }}>{c.title}</div>
            <div style={{ color: theme.text, fontSize: '1.5rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</div>
            <div style={{ color: c.color, fontSize: '0.65rem', marginTop: '15px', fontWeight: 700, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px' }}>
              {c.desc} <ChevronRight size={12} />
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', position: 'relative', zIndex: 1 }}>
        <div className="chart-container">
          <div style={{ marginBottom: '35px' }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: theme.text, margin: 0 }}>{t('Verified Performance')}</h3>
            <p style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2.5px', marginTop: '5px' }}>{t('DATA SOURCE: LIVE METRICS SYNC')}</p>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
            {stats.dailySales.map((d, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar-tooltip">JOD {d.total.toFixed(2)}</div>
                  <div style={{ color: theme.text, fontSize: '0.8rem', fontWeight: 900, opacity: d.total > 0 ? 0.9 : 0, marginBottom: '5px' }}>JOD {d.total.toFixed(0)}</div>
                  <div className="bar-fill" style={{ 
                    width: '100%', height: `${(d.total / maxSales) * 100}%`, minHeight: d.total > 0 ? '8px' : '4px',
                    background: d.isToday ? `linear-gradient(180deg, ${theme.accent}, #e5cda8)` : `var(--bg-elevated)`,
                    borderRadius: '12px', transition: '1s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: d.isToday && d.total > 0 ? `0 0 25px ${theme.accent}44` : 'none', border: d.isToday ? `1px solid ${theme.accent}66` : 'none'
                  }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: d.isToday ? theme.accent : 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
                    {d.day}
                    <div style={{ fontSize: '0.55rem', opacity: 0.5 }}>{d.fullDate}</div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Terminal size={18} color={theme.accent} />
            <h3 style={{ fontSize: '0.8rem', color: theme.text, fontWeight: 900, letterSpacing: '2.5px' }}>{t('CORE MONITOR')}</h3>
          </div>
          <div className="terminal-box">
            <div style={{ color: theme.success }}>{t('[SYSTEM] REPOSITORY_CONNECTED')}</div>
            <div style={{ color: theme.accent }}>{t('[STATUS] CORE_RESOURCES_OPTIMAL...')}</div>
            <div style={{ color: theme.text, marginTop: '10px', fontWeight: 800 }}>{t('RECENT METRICS:')}</div>
            {stats.dailySales.filter(d => d.total > 0).slice(-2).map((d, i) => (
              <div key={i} style={{ color: 'var(--text-secondary)' }}>- {d.fullDate} ({d.day}): JOD {d.total.toFixed(2)}</div>
            ))}
            <div style={{ marginTop: '15px', color: 'var(--text-muted)', fontStyle: 'italic' }}>$ {t('Monitoring system health...')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;