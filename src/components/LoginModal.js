import React, { useState } from 'react';
import styles from './LoginModal.module.css';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { FiUser, FiX } from 'react-icons/fi';
import { FaApple, FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useCustomerAuth();
  const [email, setEmail] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      login(email.trim());
    }
  };

  return (
    <div className={styles.overlay} onClick={closeLoginModal}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeLoginModal} aria-label="إغلاق">
          <FiX />
        </button>

        <div className={styles.userIconContainer}>
          <FiUser size={30} />
        </div>

        <div className={styles.title}>تسجيل الدخول</div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={!email.trim()}>
            دخول
          </button>
        </form>

        <div className={styles.divider}>أو سجل دخولك من خلال</div>

        <div className={styles.socialLogins}>
          <button className={styles.socialBtn} aria-label="تسجيل الدخول بواسطة أبل">
            <FaApple />
          </button>
          <button className={styles.socialBtn} aria-label="تسجيل الدخول بواسطة فيسبوك" style={{ color: '#1877F2' }}>
            <FaFacebookF />
          </button>
          <button className={styles.socialBtn} aria-label="تسجيل الدخول بواسطة جوجل">
            <FcGoogle />
          </button>
        </div>
      </div>
    </div>
  );
}
