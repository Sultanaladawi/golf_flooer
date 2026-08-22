import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRedirectCallback, setLoginRedirectCallback] = useState(null);

  useEffect(() => {
    const savedCustomer = localStorage.getItem('zahrat_customer');
    if (savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch (e) {
        console.error('Error parsing customer from local storage', e);
      }
    }
  }, []);

  const login = (userData) => {
    const user = typeof userData === 'string' ? { email: userData } : (userData || {});
    setCustomer(user);
    localStorage.setItem('zahrat_customer', JSON.stringify(user));
    setIsLoginModalOpen(false);
    
    // Execute callback if any
    if (loginRedirectCallback) {
      loginRedirectCallback();
      setLoginRedirectCallback(null);
    }
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('zahrat_customer');
  };

  const openLoginModal = (callback = null) => {
    setLoginRedirectCallback(() => callback);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginRedirectCallback(null);
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer, login, logout,
      isLoginModalOpen, openLoginModal, closeLoginModal
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
