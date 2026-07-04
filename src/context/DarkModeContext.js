import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('zahrat_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Apply theme attribute to the html element (works with [data-theme="dark"] in CSS)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try {
      localStorage.setItem('zahrat_theme', isDark ? 'dark' : 'light');
    } catch {}
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside DarkModeProvider');
  return ctx;
}
