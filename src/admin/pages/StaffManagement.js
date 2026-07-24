import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAdminAuth } from '../useAdminAuth';
import { Shield, Plus, Edit2, Trash2, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function StaffManagement() {
  const { admin } = useAdminAuth();
  const { t, isRTL } = useAdminLang();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'admin' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (user) {
      setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
    } else {
      setFormData({ id: '', name: '', email: '', password: '', role: 'admin' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = modalMode === 'add' ? '/api/admin/users' : `/api/admin/users/${formData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save user');
      
      await fetchUsers();
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف "${name}"؟`)) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Restrict to super_admin only
  if (admin?.role !== 'super_admin') {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--espresso)' }}>
          <Shield size={64} style={{ color: 'red', marginBottom: '20px', opacity: 0.5 }} />
          <h2>عذراً، غير مصرح لك بالدخول</h2>
          <p style={{ opacity: 0.7 }}>هذه الصفحة مخصصة لمدراء النظام (Super Admins) فقط.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '20px', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--espresso)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={28} style={{ color: 'var(--gold)' }} /> إدارة الموظفين والصلاحيات
            </h1>
            <p style={{ color: 'var(--espresso-dim)', margin: '5px 0 0' }}>إضافة، تعديل، وحذف حسابات موظفي الإدارة</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Plus size={18} /> إضافة موظف
          </button>
        </div>

        {error ? (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} /> {error}
          </div>
        ) : loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(197,168,128,0.1)', color: 'var(--espresso)', textAlign: isRTL ? 'right' : 'left' }}>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الاسم</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الصلاحية</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>تاريخ الإضافة</th>
                  <th style={{ padding: '15px', borderBottom: '1px solid rgba(197,168,128,0.2)' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.name[0].toUpperCase()}
                      </div>
                      {user.name}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--espresso-dim)' }}>{user.email}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold',
                        background: user.role === 'super_admin' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                        color: user.role === 'super_admin' ? '#166534' : '#1d4ed8'
                      }}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--espresso-dim)', fontSize: '0.9rem' }}>
                      {new Date(user.created_at).toLocaleDateString('ar-JO')}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal('edit', user)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }} title="تعديل">
                          <Edit2 size={18} />
                        </button>
                        {user.email !== admin.email && (
                          <button onClick={() => handleDelete(user.id, user.name)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }} title="حذف">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--espresso)', fontSize: '1.4rem' }}>
              {modalMode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>الاسم الكامل</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--gold)' }} />
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>البريد الإلكتروني</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--gold)' }} />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>
                  كلمة المرور {modalMode === 'edit' && <span style={{fontSize: '0.8rem', color: '#888'}}>(اتركها فارغة إذا لم ترد التغيير)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--gold)' }} />
                  <input type="password" required={modalMode === 'add'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--espresso)' }}>الصلاحية (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}>
                  <option value="admin">موظف (Admin)</option>
                  <option value="super_admin">مدير نظام (Super Admin)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: 'var(--espresso)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
