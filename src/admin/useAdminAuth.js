import { useState, useEffect, useCallback } from 'react';

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('admin_session');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        sessionStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const adminData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role
        };

        setAdmin(adminData);
        sessionStorage.setItem('admin_session', JSON.stringify(adminData));
        setLoading(false);
        return true;
      } else {
        setError(data.message || 'Invalid email or password.');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn("Backend unreachable. Triggering local fallback mode.");
      
      const team = [
        { email: 'sultan@zahratbeesan.com', pass: 'sultan2026', name: 'Sultan', role: 'super_admin' },
        { email: 'zuhair@zahratbeesan.com', pass: 'zuhair2026', name: 'Zuhair', role: 'admin' }
      ];
      
      const user = team.find(u => u.email === email.toLowerCase().trim() && u.pass === password);
      
      if (user) {
        const fallbackData = { 
          id: `local-${user.name}`, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        };
        setAdmin(fallbackData);
        sessionStorage.setItem('admin_session', JSON.stringify(fallbackData));
        setLoading(false);
        return true;
      }

      setError('Connection error or invalid credentials.');
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_session');
    setAdmin(null);
  }, []);

  return { admin, loading, error, login, logout, isAdmin: !!admin };
}
