import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminContext } from '../AdminContext';
import { useAdminLang } from '../AdminLangContext';
import { 
  ShoppingBag, LayoutGrid, DollarSign, AlertTriangle, 
  TrendingUp, Clock, Zap, Activity, 
  ChevronRight, Bell, Terminal,
  Package, ArrowUpRight, ArrowDownRight, Star,
  Truck, CheckCircle2, Timer, RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { admin } = useAdminContext();
  const { t, lang } = useAdminLang();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalSales: 0,
    todaySales: 0, todayOrders: 0, yesterdaySales: 0, yesterdayOrders: 0,
    storeStatus: 'unknown', storeMode: 'auto',
    lowStock: 0, lowStockItems: [],
    dailySales: [], topProducts: [],
    totalProfit: 0, todayProfit: 0,
    recentOrders: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const theme = {
    bg: 'var(--admin-bg)', card: 'var(--admin-card)',
    accent: 'var(--admin-accent)', border: 'var(--admin-border)',
    text: 'var(--admin-text)', success: '#10b981',
    warning: '#f59e0b', info: '#3b82f6', danger: '#ef4444'
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/dashboard-stats'),
        axios.get('/api/orders')
      ]);

      const incomingData = statsRes.data.data || statsRes.data;
      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      
      // Build last 7 days chart data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);
        const realData = (incomingData.dailySales || []).find(item => formatDate(item.date) === dateStr);
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
        yesterdaySales: parseFloat(incomingData.yesterdaySales || 0),
        yesterdayOrders: incomingData.yesterdayOrders || 0,
        storeStatus: incomingData.storeStatus || 'unknown',
        storeMode: incomingData.storeMode || 'auto',
        lowStock: incomingData.lowStock || 0,
        lowStockItems: incomingData.lowStockItems || [],
        dailySales: last7Days,
        topProducts: incomingData.topProducts || [],
        totalProfit: parseFloat(incomingData.totalProfit || 0),
        todayProfit: parseFloat(incomingData.todayProfit || 0)
      });

      // Recent 5 orders
      setRecentOrders(allOrders.slice(0, 5));
      setLastRefresh(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Dashboard API Error:', err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const poll = setInterval(fetchDashboardData, 30000);
    return () => { clearInterval(timer); clearInterval(poll); };
  }, []);

  const maxSales = Math.max(...stats.dailySales.map(d => d.total), 1);
  const maxTopSold = Math.max(...stats.topProducts.map(p => Number(p.total_sold) || 0), 1);

  // Revenue change vs yesterday
  const revenueDiff = parseFloat(stats.todaySales) - stats.yesterdaySales;
  const revenueUp = revenueDiff >= 0;

  const statCards = [
    {
      title: t('Gross Revenue'), 
      value: `JOD ${stats.totalSales.toFixed(2)}`, 
      icon: DollarSign, color: theme.accent,
      sub: `${t('Today')}: JOD ${parseFloat(stats.todaySales || 0).toFixed(2)}`,
      trend: revenueUp, trendVal: `${revenueUp ? '+' : ''}${revenueDiff.toFixed(2)} vs ${t('Yesterday')}`,
      path: '/admin/orders'
    },
    {
      title: t('Active Orders'), value: stats.totalOrders,
      icon: ShoppingBag, color: theme.info,
      sub: `${t('Today')}: ${stats.todayOrders}`,
      path: '/admin/orders'
    },
    {
      title: t('Catalog Density'), value: stats.totalProducts,
      icon: LayoutGrid, color: theme.success,
      sub: t('Menu items verified'), path: '/admin/products'
    },
    {
      title: t('Net Profit'), value: `JOD ${stats.totalProfit.toFixed(2)}`,
      icon: TrendingUp, color: '#4ade80',
      sub: `${t('Today')}: JOD ${stats.todayProfit.toFixed(2)}`,
      path: '/admin/analytics'
    },
    {
      title: t('Logistics Risk'), value: stats.lowStock,
      icon: AlertTriangle, color: theme.danger,
      sub: stats.lowStock > 0 ? t('CRITICAL ALERT') : t('SUPPLY STABLE'),
      path: '/admin/inventory'
    },
    {
      title: t('Best Seller'), value: stats.topProducts[0]?.item_name || t('None'),
      icon: Zap, color: '#ff9a9e',
      sub: `${stats.topProducts[0]?.total_sold || 0} ${t('Sold')}`,
      path: '/admin/analytics'
    },
  ];

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return theme.success;
    if (s === 'ready') return '#38ef7d';
    if (s === 'preparing') return theme.warning;
    return theme.info;
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return <CheckCircle2 size={13} />;
    if (s === 'ready') return <Package size={13} />;
    if (s === 'preparing') return <Timer size={13} />;
    return <Truck size={13} />;
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif", color: theme.text, position: 'relative', overflow: 'hidden' }}>
      
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: theme.accent, top: '-200px', right: '-100px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, zIndex: 0, animation: 'float 25s infinite alternate ease-in-out' }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: '#e8e2d4', bottom: '-100px', left: '-100px', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.08, zIndex: 0 }} />
      
      <style>{`
        @keyframes float { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(50px,50px) scale(1.1); } }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(56,239,125,0.7); } 70% { box-shadow: 0 0 0 10px rgba(56,239,125,0); } 100% { box-shadow: 0 0 0 0 rgba(56,239,125,0); } }
        @keyframes pulse-gold { 0% { box-shadow: 0 0 0 0 rgba(196,164,132,0.7); } 70% { box-shadow: 0 0 0 10px rgba(196,164,132,0); } 100% { box-shadow: 0 0 0 0 rgba(196,164,132,0); } }
        .dash-card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 20px; padding: 22px; transition: 0.35s; position: relative; z-index: 1; cursor: pointer; }
        .dash-card:hover { transform: translateY(-4px); border-color: var(--admin-accent); box-shadow: 0 16px 40px rgba(166,134,93,0.13); }
        .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 8px; cursor: pointer; }
        .bar-tooltip { position: absolute; top: -32px; background: var(--admin-accent); color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 900; opacity: 0; transition: 0.3s; pointer-events: none; white-space: nowrap; z-index: 10; }
        .bar-wrapper:hover .bar-tooltip { opacity: 1; transform: translateY(-8px); }
        .bar-fill { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); border-radius: 10px; }
        .bar-wrapper:hover .bar-fill { transform: translateY(-6px) scaleX(1.04); background: linear-gradient(180deg, #c4a484, #8c6a56) !important; box-shadow: 0 8px 24px rgba(196,164,132,0.4) !important; }
        .order-row:hover { background: rgba(196,164,132,0.05) !important; }
        @media (max-width: 900px) { .dash-grid-6 { grid-template-columns: repeat(2,1fr) !important; } .dash-grid-2 { grid-template-columns: 1fr !important; } .dash-container { padding: 20px !important; } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.6rem', color: theme.accent, lineHeight: 1, marginBottom: '8px' }}>
            Zahrat Beesan <span style={{ color: theme.text, fontStyle: 'italic' }}>Embroidery</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--bg-surface)', border: `1px solid ${theme.border}`, padding: '10px 20px', borderRadius: '14px', marginBottom: '10px' }}>
            <Activity size={22} color={theme.accent} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: theme.text }}>{t('Operational Dashboard')}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', padding: '8px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.success, fontWeight: 'bold', letterSpacing: '1px' }}>{t("Today's Revenue")}</div>
              <div style={{ fontSize: '1.1rem', color: theme.text, fontWeight: 900 }}>JOD {parseFloat(stats.todaySales || 0).toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', padding: '8px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.6rem', color: theme.info, fontWeight: 'bold', letterSpacing: '1px' }}>{t("Today's Orders")}</div>
              <div style={{ fontSize: '1.1rem', color: theme.text, fontWeight: 900 }}>{stats.todayOrders || 0}</div>
            </div>
            {/* Store Mode Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '12px',
              background: stats.storeMode === 'auto' ? 'rgba(56,239,125,0.08)' : stats.storeMode === 'manual_open' ? 'rgba(196,164,132,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${stats.storeMode === 'auto' ? 'rgba(56,239,125,0.2)' : stats.storeMode === 'manual_open' ? 'rgba(196,164,132,0.2)' : 'rgba(239,68,68,0.2)'}`,
              color: stats.storeMode === 'auto' ? '#38ef7d' : stats.storeMode === 'manual_open' ? theme.accent : '#ef4444',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: stats.storeMode === 'auto' ? '#38ef7d' : stats.storeMode === 'manual_open' ? theme.accent : '#ef4444',
                animation: 'pulse-green 2s infinite'
              }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>
                {stats.storeMode === 'auto' ? `${t('AUTO MODE:')} ${stats.storeStatus.toUpperCase()}` : `${t('MANUAL:')} ${stats.storeStatus.toUpperCase()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Clock + Refresh */}
        <div style={{ textAlign: 'end' }}>
          <div style={{ color: theme.accent, fontSize: '1rem', fontWeight: 900, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <Clock size={16} />
            <span dir="ltr">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(196,164,132,0.08)', border: `1px solid ${theme.border}`, borderRadius: '10px', padding: '7px 14px', color: theme.accent, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <RefreshCw size={13} /> {t('Refresh')}
          </button>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '5px' }}>
            {t('Last update')}: {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
        {statCards.map((c, i) => (
          <div key={i} className="dash-card" onClick={() => navigate(c.path)}>
            <div style={{ background: `${c.color}22`, color: c.color, padding: '10px', borderRadius: '12px', width: 'fit-content', marginBottom: '14px', border: `1px solid ${c.color}33` }}>
              <c.icon size={20} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '3px' }}>{c.title}</div>
            <div style={{ color: theme.text, fontSize: '1.35rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</div>
            {c.trend !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.65rem', fontWeight: 700, color: c.trend ? theme.success : theme.danger }}>
                {c.trend ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {c.trendVal}
              </div>
            )}
            <div style={{ color: c.color, fontSize: '0.62rem', marginTop: '10px', fontWeight: 700, opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {c.sub} <ChevronRight size={11} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts + Tables Row ── */}
      <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        
        {/* Bar Chart */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '36px' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: theme.text, margin: '0 0 4px' }}>{t('Verified Performance')}</h3>
              <p style={{ color: theme.accent, fontSize: '0.68rem', fontWeight: 900, letterSpacing: '2px', margin: 0 }}>{t('DATA SOURCE: LIVE METRICS SYNC')}</p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {t('Weekly')} JOD {stats.dailySales.reduce((a, b) => a + b.total, 0).toFixed(2)}
            </div>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            {stats.dailySales.map((d, i) => (
              <div key={i} className="bar-wrapper" style={{ position: 'relative' }}>
                <div className="bar-tooltip">JOD {d.total.toFixed(2)}</div>
                {d.total > 0 && <div style={{ color: theme.text, fontSize: '0.72rem', fontWeight: 900, opacity: 0.8, marginBottom: '4px' }}>
                  {d.total.toFixed(0)}
                </div>}
                <div className="bar-fill" style={{
                  width: '100%', height: `${(d.total / maxSales) * 100}%`, minHeight: d.total > 0 ? '8px' : '3px',
                  background: d.isToday ? `linear-gradient(180deg, ${theme.accent}, #e5cda8)` : `var(--bg-elevated)`,
                  boxShadow: d.isToday && d.total > 0 ? `0 0 20px ${theme.accent}44` : 'none',
                  border: d.isToday ? `1px solid ${theme.accent}66` : 'none'
                }} />
                <div style={{ fontSize: '0.68rem', fontWeight: 900, color: d.isToday ? theme.accent : 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  {d.day}
                  <div style={{ fontSize: '0.5rem', opacity: 0.6 }}>{d.fullDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Star size={18} color={theme.accent} fill={theme.accent} />
            <h3 style={{ fontSize: '0.85rem', color: theme.text, fontWeight: 900, letterSpacing: '2px', margin: 0 }}>{t('Top Products')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {(stats.topProducts.length > 0 ? stats.topProducts : [
              { item_name: t('No data yet'), total_sold: 0, revenue: 0 }
            ]).slice(0, 5).map((p, i) => {
              const pct = maxTopSold > 0 ? (Number(p.total_sold) / maxTopSold) * 100 : 0;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: theme.text, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                      {i === 0 && <span style={{ color: theme.accent, marginInlineEnd: '6px' }}>🥇</span>}
                      {i === 1 && <span style={{ marginInlineEnd: '6px' }}>🥈</span>}
                      {i === 2 && <span style={{ marginInlineEnd: '6px' }}>🥉</span>}
                      {p.item_name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600 }}>{p.total_sold} {t('Sold')}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: '6px',
                      background: i === 0 ? `linear-gradient(90deg, ${theme.accent}, #e5cda8)` : `rgba(196,164,132,${0.6 - i * 0.1})`,
                      transition: '1s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: theme.accent, fontWeight: 700 }}>JOD {parseFloat(p.revenue || 0).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Low Stock Row ── */}
      <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', position: 'relative', zIndex: 1 }}>
        
        {/* Recent Orders */}
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingBag size={18} color={theme.accent} />
              <h3 style={{ fontSize: '0.85rem', color: theme.text, fontWeight: 900, letterSpacing: '2px', margin: 0 }}>{t('Recent Orders')}</h3>
            </div>
            <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('View All')} <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                {loading ? t('Loading...') : t('No orders yet.')}
              </div>
            ) : recentOrders.map((order, i) => (
              <div key={i} className="order-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', borderRadius: '10px', transition: '0.2s', cursor: 'pointer', borderBottom: i < recentOrders.length - 1 ? `1px solid ${theme.border}` : 'none' }}
                onClick={() => navigate('/admin/orders')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `rgba(196,164,132,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, color: theme.accent }}>
                    #{order.id}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.text }}>{order.customer_name || 'Guest'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.accent }}>JOD {parseFloat(order.total_amount || 0).toFixed(2)}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', padding: '3px 8px', borderRadius: '6px', background: `${getStatusColor(order.status)}18`, color: getStatusColor(order.status), fontSize: '0.65rem', fontWeight: 800 }}>
                    {getStatusIcon(order.status)}
                    {(order.status || 'pending').toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock + Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Low Stock Alerts */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Bell size={18} color={stats.lowStock > 0 ? theme.danger : theme.success} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '2px', margin: 0, color: stats.lowStock > 0 ? theme.danger : theme.success }}>
                {stats.lowStock > 0 ? t('CRITICAL ALERT') : t('SUPPLY STABLE')}
              </h3>
            </div>
            {stats.lowStockItems.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.success, fontSize: '0.82rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> {t('All inventory levels are healthy.')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.lowStockItems.slice(0, 4).map((item, i) => (
                  <div key={i} onClick={() => navigate('/admin/inventory')} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                    <span style={{ color: theme.text, fontSize: '0.8rem', fontWeight: 600 }}>{item.item_name}</span>
                    <span style={{ color: theme.danger, fontSize: '0.75rem', fontWeight: 800 }}>{item.quantity} / {item.min_threshold}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Terminal */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Terminal size={16} color={theme.accent} />
              <h3 style={{ fontSize: '0.78rem', fontWeight: 900, letterSpacing: '2px', margin: 0, color: theme.text }}>{t('CORE MONITOR')}</h3>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: `1px solid ${theme.border}`, borderRadius: '14px', padding: '16px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ color: theme.success }}>{t('[SYSTEM] REPOSITORY_CONNECTED')}</div>
              <div style={{ color: theme.accent }}>{t('[STATUS] CORE_RESOURCES_OPTIMAL...')}</div>
              <div style={{ color: theme.text, marginTop: '8px', fontWeight: 800 }}>{t('RECENT METRICS:')}</div>
              {stats.dailySales.filter(d => d.total > 0).slice(-2).map((d, i) => (
                <div key={i} style={{ color: 'var(--text-secondary)' }}>- {d.fullDate} ({d.day}): JOD {d.total.toFixed(2)}</div>
              ))}
              <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>$ {t('Monitoring system health...')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;