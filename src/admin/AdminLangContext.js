import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './AdminTranslations';

const AdminLangContext = createContext();

export const AdminLangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('admin_lang') || 'ar';
  });

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('admin_lang', newLang);
  };

  const t = (key) => {
    if (!translations[lang]) return key;
    return translations[lang][key] || key;
  };

  return (
    <AdminLangContext.Provider value={{ lang, toggleLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </AdminLangContext.Provider>
  );
};

export const useAdminLang = () => useContext(AdminLangContext);
