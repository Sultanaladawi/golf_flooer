import React, { useState } from 'react';
import axios from 'axios';
import { BsClockHistory, BsCheckCircle } from 'react-icons/bs';
import { CheckCircle2, Eye } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const KanbanBoard = ({ orders, fetchOrders, viewOrder, showToast }) => {
  const { t } = useAdminLang();

  const theme = {
    bg: 'var(--admin-bg)',
    card: 'var(--admin-card)',
    primary: 'var(--admin-accent)',
    border: 'var(--admin-border)',
    text: 'var(--admin-text)',
    success: '#10b981',
    info: '#3b82f6',
    warning: '#f59e0b'
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    try {
      await axios.put(`/api/mark-ready/${orderId}`, { status: newStatus });
      showToast(t('STATUS_UPDATED') || 'Order status updated successfully', 'success');
      fetchOrders();
    } catch (err) {
      console.error(err);
      showToast('Failed to update order status', 'error');
    }
  };

  const pendingOrders = orders.filter(o => !o.status || o.status.toLowerCase() === 'pending');
  const preparingOrders = orders.filter(o => o.status && (o.status.toLowerCase() === 'preparing' || o.status.toLowerCase() === 'ready'));
  const completedOrders = orders.filter(o => o.status && o.status.toLowerCase() === 'completed');

  const renderKanbanCard = (order) => (
    <div
      key={order.id}
      draggable
      onDragStart={(e) => handleDragStart(e, order.id)}
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '15px',
        cursor: 'grab',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'transform 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <strong style={{ 
            color: theme.bg, 
            background: 'linear-gradient(135deg, #c7a57a 0%, #a47c4f 100%)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 800
        }}>
            ORD-{String(order.id).padStart(3, '0')}
        </strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div style={{ color: theme.text, fontWeight: 'bold', marginBottom: '5px', fontSize: '1.05rem' }}>{order.customer_name}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
        {order.phone || 'N/A'}
      </div>
      <div style={{ color: theme.primary, fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px' }}>
        {parseFloat(order.total_amount).toFixed(2)} JOD
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => viewOrder(order)}
          style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
            background: 'rgba(196,164,132,0.15)', color: theme.primary, cursor: 'pointer', fontSize: '0.85rem',
            fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(196,164,132,0.3)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(196,164,132,0.15)'}
        >
          <Eye size={16} /> {t('VIEW')}
        </button>
      </div>
    </div>
  );

  const renderColumn = (title, columnOrders, statusValue, color) => (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, statusValue)}
      style={{
        flex: 1,
        minWidth: '320px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px dashed ${theme.border}`,
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
      }}
    >
      <h3 style={{ 
          color: theme.text, 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '1.1rem',
          fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            {title}
        </div>
        <span style={{ background: 'var(--admin-card)', color: theme.text, padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', border: `1px solid ${theme.border}` }}>
          {columnOrders.length}
        </span>
      </h3>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
        {columnOrders.map(renderKanbanCard)}
        {columnOrders.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px', fontSize: '0.9rem', border: `1px dashed ${theme.border}`, padding: '30px', borderRadius: '15px' }}>
            {t('NO_ORDERS') || 'لا توجد طلبات هنا'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '20px', minHeight: '650px', scrollbarWidth: 'thin' }}>
      {renderColumn(t('PENDING') || 'قيد الانتظار', pendingOrders, 'pending', theme.warning)}
      {renderColumn(t('PREPARING') || 'قيد التجهيز / الشحن', preparingOrders, 'ready', theme.info)}
      {renderColumn(t('COMPLETED') || 'مكتمل', completedOrders, 'completed', theme.success)}
    </div>
  );
};

export default KanbanBoard;
